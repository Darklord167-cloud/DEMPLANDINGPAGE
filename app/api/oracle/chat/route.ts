import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// 1. Initialize the client securely on the server using the private environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    const clientIp = req.headers.get("x-forwarded-for") || "client-local";
    const rateLimit = checkChatRateLimit(clientIp);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${rateLimit.retryAfterSec} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSec) } }
      );
    }

    // 2. Parse the incoming message, chat history, model preference, portfolio context, and optional image
    const { message, history, modelPreference, portfolioContext, imageBase64 } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const selectedModel = modelPreference === "pro" ? "gemini-2.5-pro" : "gemini-2.5-flash";

    let contextPrompt = "";
    if (portfolioContext) {
      contextPrompt = `\n\n[USER CONNECTED PORTFOLIO CONTEXT: Wallet Address: ${portfolioContext.walletAddress || "N/A"}, DEMP Balance: ${portfolioContext.dempBalance || 0}, VIP Tier: ${portfolioContext.vipTier || "none"}]`;
    }

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
    const responseText = result.text;

    // 5. Return the secure response to the client
    return NextResponse.json({ 
      response: responseText,
      modelUsed: selectedModel 
    });
    
  } catch (error: any) {
    console.error("Oracle Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to communicate with Oracle." },
      { status: 500 }
    );
  }
}
