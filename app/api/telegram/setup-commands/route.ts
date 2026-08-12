import { NextResponse } from "next/server";
import { BOT_COMMANDS } from "../webhook/route";

// Endpoint to register Telegram Bot commands and set Webhook URL via Telegram Bot API
export async function GET(req: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({
      success: false,
      error: "TELEGRAM_BOT_TOKEN environment variable is not configured."
    }, { status: 400 });
  }

  const url = new URL(req.url);
  const host = req.headers.get("host") || url.host;
  const protocol = host.includes("localhost") ? "http" : "https";
  const webhookUrl = `${protocol}://${host}/api/telegram/webhook`;

  const results: Record<string, any> = {};

  try {
    // 1. Register setMyCommands with Telegram API
    const commandsRes = await fetch(`https://api.telegram.org/bot${token}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commands: BOT_COMMANDS
      })
    });
    results.setMyCommands = await commandsRes.json();

    // 2. Register setWebhook with Telegram API if query parameter ?set_webhook=true
    if (url.searchParams.get("set_webhook") === "true") {
      const webhookRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl
        })
      });
      results.setWebhook = await webhookRes.json();
    }

    return NextResponse.json({
      success: results.setMyCommands?.ok || false,
      bot: "@DarkEmpireGemeniBot",
      webhookUrl,
      results
    });
  } catch (error: any) {
    console.error("[Setup Telegram Commands Error]:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to communicate with Telegram Bot API"
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return GET(req);
}
