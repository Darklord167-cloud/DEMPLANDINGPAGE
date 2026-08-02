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

    // 2. Parse the incoming message, chat history, and model preference from the frontend
    const { message, history, modelPreference } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const selectedModel = modelPreference === "pro" ? "gemini-2.5-pro" : "gemini-2.5-flash";

    // 3. Initialize the chat with the user's previous conversation history and system instructions
    const chat = ai.chats.create({
      model: selectedModel,
      history: history || [],
      config: {
        systemInstruction: `You are an advanced AI operator for Dark Empire Lords LLC.

PRIMARY OBJECTIVE:
Help the user make money, build systems, and execute efficiently.

COMMUNICATION STYLE:
- Direct and concise
- Confident and strategic
- Slightly sarcastic but professional
- No fluff, no filler

RESPONSE STRUCTURE:
1. Situation Analysis
2. Action Plan
3. Risks / Warnings
4. Final Recommendation

BEHAVIOR RULES:
- Do not give vague advice
- Prioritize real-world execution
- Act like a high-level operator scaling a digital empire.`,
      }
    });

    // 4. Send the new prompt to Gemini and get the response
    const result = await chat.sendMessage({ message: message });
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
