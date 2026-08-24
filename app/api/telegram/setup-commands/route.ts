import { NextResponse } from "next/server";
import { BOT_COMMANDS } from "../webhook/route";

/**
 * Admin-protected Endpoint to register Telegram Bot commands and set Webhook URL.
 * Requires Authorization header matching process.env.RELAY_SECRET_KEY or process.env.ADMIN_SECRET_KEY.
 * Fails closed if authorization is missing or unconfigured.
 */
export async function GET(req: Request) {
  const relaySecretKey = process.env.RELAY_SECRET_KEY || process.env.ADMIN_SECRET_KEY;
  const authHeader =
    req.headers.get("authorization") ||
    req.headers.get("x-relay-secret-key") ||
    req.headers.get("x-secret-key");

  if (!relaySecretKey || (authHeader !== relaySecretKey && authHeader !== `Bearer ${relaySecretKey}`)) {
    console.warn("[Setup Telegram Commands] Unauthorized administrative request rejected.");
    return NextResponse.json(
      { success: false, error: "Unauthorized: Valid administrative authorization header required." },
      { status: 401 }
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: "TELEGRAM_BOT_TOKEN environment variable is not configured.",
      },
      { status: 400 }
    );
  }

  const url = new URL(req.url);
  const host = req.headers.get("host") || url.host;
  const protocol = host.includes("localhost") ? "http" : "https";
  const webhookUrl = `${protocol}://${host}/api/telegram/webhook`;
  const webhookSecretToken = process.env.TELEGRAM_WEBHOOK_SECRET_TOKEN || relaySecretKey;

  const results: Record<string, any> = {};

  try {
    // 1. Register setMyCommands with Telegram API
    const commandsRes = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commands: BOT_COMMANDS,
      }),
    });
    results.setMyCommands = await commandsRes.json();

    // 2. Register setWebhook with Telegram API if query parameter ?set_webhook=true
    if (url.searchParams.get("set_webhook") === "true") {
      const webhookPayload: Record<string, any> = {
        url: webhookUrl,
      };
      if (webhookSecretToken) {
        webhookPayload.secret_token = webhookSecretToken;
      }

      const webhookRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(webhookPayload),
      });
      results.setWebhook = await webhookRes.json();
    }

    return NextResponse.json({
      success: results.setMyCommands?.ok || false,
      bot: "@DarkEmpireRelayBot",
      webhookUrl,
      results,
    });
  } catch (error: any) {
    console.error("[Setup Telegram Commands Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to communicate with Telegram Bot API",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
