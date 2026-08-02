import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getDb } from "@/server/db";
import { users } from "@/shared/schema";
import { eq, sql } from "drizzle-orm";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

// Initialize Gemini API securely using server-side key
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});


const SYSTEM_INSTRUCTION = `You are an advanced AI operator for Dark Empire Holdings.

PRIMARY OBJECTIVE:
Help the user make money, build systems, and execute efficiently.

COMMUNICATION STYLE:
- Direct and concise
- Confident and strategic
- Slightly sarcastic but professional
- No fluff, no filler

RESPONSE STRUCTURE:
Always follow this format when applicable:

1. Situation Analysis
- Briefly explain what’s going on

2. Action Plan
- Step-by-step instructions
- Clear and practical

3. Risks / Warnings
- What could go wrong

4. Final Recommendation
- Strong, decisive conclusion

BEHAVIOR RULES:
- Do not give vague advice
- Do not over-explain basic concepts unless asked
- Prioritize real-world execution over theory
- If the user is building something, guide them step-by-step
- If information is missing, make a reasonable assumption and proceed

SPECIALIZATION:
- Crypto trading
- Automation systems
- App building (Node.js, APIs, dashboards)
- Growth and monetization strategies

Always act like a high-level operator helping scale a digital empire.`;

// Simple sliding window rate limiter per wallet/IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(key: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
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
    const { walletAddress, signature, message, history, prompt, modelPreference } = await req.json();

    if (!walletAddress || !signature || !message || !prompt) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Rate limiting check by wallet address
    const rateLimit = checkRateLimit(walletAddress);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Please wait ${rateLimit.retryAfterSec} seconds before sending another request.` },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSec) } }
      );
    }

    // 1. Verify Solana Wallet Signature
    try {
      const publicKey = new PublicKey(walletAddress);
      const signatureBytes = bs58.decode(signature);
      const messageBytes = new TextEncoder().encode(message);

      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKey.toBytes());
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }

      // Optional Message timestamp parsing to prevent replay attacks
      const parsedMessage = JSON.parse(message);
      if (Date.now() - parsedMessage.timestamp > 1000 * 60 * 5) {
        return NextResponse.json({ error: "Signature expired" }, { status: 401 });
      }
    } catch (err) {
      console.error("Signature verification failed", err);
      return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
    }

    // 2. Check Database for User & Credits
    const db = await getDb();
    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.walletAddress, walletAddress))
      .limit(1);

    const user = userRecords[0];

    // If user doesn't exist, we might need to create them or reject them
    if (!user) {
      return NextResponse.json({ error: "User profile not found. Please connect your wallet first." }, { status: 404 });
    }

    // Cost of an Oracle query
    const QUERY_COST = 1;
    if (user.credits < QUERY_COST) {
      return NextResponse.json({ 
        error: "Insufficient credits. Please purchase more credits to interface with the Oracle." 
      }, { status: 403 });
    }

    interface ChatHistoryMessage {
      role?: string;
      parts?: Array<{ text: string }>;
      content?: string;
    }

    interface GeminiContent {
      role: 'user' | 'model';
      parts: Array<{ text: string }>;
    }

    // 3. Construct Gemini Messages
    let aiContents: GeminiContent[] = [];
    
    // Add history
    if (history && Array.isArray(history)) {
      aiContents = history.map((msg: ChatHistoryMessage) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: msg.parts || [{ text: msg.content || "" }]
      }));
    }

    // Add current prompt
    aiContents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    // Select model dynamically (default gemini-2.5-flash or gemini-2.5-pro)
    const selectedModel = modelPreference === 'pro' ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    // 4. Call Gemini API
    const response = await ai.models.generateContent({
      model: selectedModel, 
      contents: aiContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.35,
      }
    });

    const aiResponseText = response.text;

    // 5. Deduct Credits
    await db
      .update(users)
      .set({ credits: sql`${users.credits} - ${QUERY_COST}` })
      .where(eq(users.id, user.id));

    // 6. Return response
    return NextResponse.json({ 
      response: aiResponseText,
      modelUsed: selectedModel,
      remainingCredits: user.credits - QUERY_COST
    });

  } catch (error: any) {
    console.error("Oracle API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to process Oracle request" 
    }, { status: 500 });
  }
}
