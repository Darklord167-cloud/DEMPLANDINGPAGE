import { NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@/server/storage";
import { insertContactMessageSchema } from "@/shared/schema";

const contactRateLimits = new Map<string, { count: number; resetAt: number }>();
const CONTACT_MAX = 5;
const CONTACT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = contactRateLimits.get(ip);
  if (!record || now > record.resetAt) {
    contactRateLimits.set(ip, { count: 1, resetAt: now + CONTACT_WINDOW_MS });
    return true;
  }
  if (record.count >= CONTACT_MAX) return false;
  record.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!checkContactRateLimit(clientIp)) {
      return NextResponse.json(
        { success: false, message: "Too many contact submissions. Please retry shortly." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch (jsonErr) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request payload provided" },
        { status: 400 }
      );
    }

    // Validate payload against schema
    const parseResult = insertContactMessageSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.issues[0]?.message || "Invalid contact form data";
      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    let savedMessage = null;

    // 1. Database persistence (if DB URL configured)
    const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
    if (dbUrl) {
      try {
        savedMessage = await storage.createContactMessage(data);
      } catch (dbError) {
        console.warn(
          "[Contact API] Database save skipped or failed:",
          dbError instanceof Error ? dbError.message : dbError
        );
      }
    }

    // 2. Discord Webhook relay if configured
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      try {
        await fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                title: `📩 New Contact Form Submission: ${data.subject}`,
                fields: [
                  { name: "Name", value: data.name, inline: true },
                  { name: "Email", value: data.email, inline: true },
                  { name: "Subject", value: data.subject, inline: false },
                  { name: "Message", value: data.message, inline: false },
                ],
                timestamp: new Date().toISOString(),
                color: 0x9333ea,
              },
            ],
          }),
          signal: AbortSignal.timeout(5000),
        });
      } catch (discordErr) {
        console.error("[Contact API] Discord webhook relay failed:", discordErr);
      }
    }

    // 3. Telegram relay if configured
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    if (telegramBotToken && telegramChatId) {
      try {
        const text = `📩 *New Contact Form Submission*\n\n*Name:* ${data.name}\n*Email:* ${data.email}\n*Subject:* ${data.subject}\n*Message:*\n${data.message}`;
        await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text,
            parse_mode: "Markdown",
          }),
          signal: AbortSignal.timeout(5000),
        });
      } catch (telegramErr) {
        console.error("[Contact API] Telegram relay failed:", telegramErr);
      }
    }

    // 4. Brevo Transactional Email relay if configured
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      try {
        const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM || "darklord@darkempirelords.com";
        const senderName = process.env.BREVO_SENDER_NAME || "Dark Empire Lords HQ";
        const recipientEmail = process.env.BREVO_RECIPIENT_EMAIL || process.env.EMAIL_TO || "support@darkempirelords.com";

        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "api-key": brevoApiKey,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: recipientEmail, name: "Dark Empire Admin" }],
            replyTo: { email: data.email, name: data.name },
            subject: `[Contact Form] ${data.subject}`,
            htmlContent: `
              <div style="font-family: Arial, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 24px; border-radius: 12px; border: 1px solid #3f3f46;">
                <h2 style="color: #a855f7; margin-bottom: 16px;">📩 New Dark Empire Contact Submission</h2>
                <p><strong>From:</strong> ${data.name} (&lt;<a href="mailto:${data.email}" style="color: #c084fc;">${data.email}</a>&gt;)</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
                <hr style="border: 0; border-top: 1px solid #27272a; margin: 16px 0;" />
                <div style="background-color: #18181b; padding: 16px; border-radius: 8px; border: 1px solid #27272a;">
                  <p style="white-space: pre-wrap; margin: 0;">${data.message}</p>
                </div>
                <p style="font-size: 12px; color: #71717a; margin-top: 20px;">Sent from darkempirelords.com contact portal.</p>
              </div>
            `,
            textContent: `From: ${data.name} (${data.email})\nSubject: ${data.subject}\n\nMessage:\n${data.message}`,
          }),
          signal: AbortSignal.timeout(5000),
        });
      } catch (brevoErr) {
        console.error("[Contact API] Brevo email relay failed:", brevoErr);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully!",
        contact: savedMessage ?? {
          ...data,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          read: false,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Contact API Internal Error]:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
