import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Sliding window rate limiter
const chatRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 12;

function checkChatRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const record = chatRateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    chatRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  record.count += 1;
  return { allowed: true };
}

export async function POST(req: Request) {
  try {
    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateLimit = checkChatRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${rateLimit.retryAfterSec} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSec) } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.warn("[Oracle Chat API] GEMINI_API_KEY / GOOGLE_API_KEY is not configured.");
      return NextResponse.json(
        { error: "Oracle Mind Matrix is currently in standby. API key configuration required on server." },
        { status: 503 }
      );
    }

    // 2. Parse the incoming message, chat history, model preference, portfolio context, and optional image
    const body = await req.json().catch(() => null);
    if (!body || !body.message) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const { message, history, modelPreference, portfolioContext, imageBase64 } = body;
    const selectedModel = modelPreference === "pro" ? "gemini-2.5-pro" : "gemini-2.5-flash";

    let contextPrompt = "";
    if (portfolioContext) {
      contextPrompt = `\n\n[USER CONNECTED PORTFOLIO CONTEXT: Wallet Address: ${portfolioContext.walletAddress || "N/A"}, DEMP Balance: ${portfolioContext.dempBalance || 0}, VIP Tier: ${portfolioContext.vipTier || "none"}]`;
    }

    const ai = new GoogleGenAI({ apiKey });

    // 3. Initialize the chat with user's conversation history and system instructions
    const chat = ai.chats.create({
      model: selectedModel,
      history: history || [],
      config: {
        systemInstruction: `You are an advanced AI operator and Market Oracle for Dark Empire Lords LLC.

PRIMARY OBJECTIVE:
Help the user analyze markets, make strategic decisions, optimize portfolio yield, and execute efficiently.

COMMUNICATION STYLE:
- Direct, concise, strategic
- High-level Web3 operator perspective
- No fluff, no filler

RESPONSE STRUCTURE:
1. Situation / Sentiment Analysis
2. Actionable Execution Plan
3. Risk & Volatility Warnings
4. Final Imperial Directive${contextPrompt}`,
      }
    });

    // 4. Send the prompt to Gemini (with optional image inline data)
    let sendPayload: any = message;
    if (imageBase64) {
      sendPayload = [
        { inlineData: { mimeType: "image/png", data: imageBase64 } },
        { text: message }
      ];
    }

    const result = await chat.sendMessage({ message: sendPayload });
    const responseText = result.text || "Oracle neural matrix returned empty output.";

    // 5. Return the secure response to the client
    return NextResponse.json({ 
      response: responseText,
      modelUsed: selectedModel 
    });
    
  } catch (error: any) {
    console.error("[Oracle Chat API Internal Error]:", error);
    return NextResponse.json(
      { error: "Failed to communicate with Oracle neural matrix. Please try again shortly." },
      { status: 500 }
    );
  }
}
