import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getDb } from "@/server/db";
import { users } from "@/shared/schema";
import { eq, sql } from "drizzle-orm";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

// Initialize Gemini API
const ai = new GoogleGenAI({ 
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY 
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

export async function POST(req: Request) {
  try {
    const { walletAddress, signature, message, history, prompt } = await req.json();

    if (!walletAddress || !signature || !message || !prompt) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
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

    // 3. Construct Gemini Messages
    let aiContents: any[] = [];
    
    // Add history
    if (history && Array.isArray(history)) {
      aiContents = history.map((msg: any) => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: msg.parts || [{ text: msg.content || "" }]
      }));
    }

    // Add current prompt
    aiContents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    // 4. Call Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", 
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
      remainingCredits: user.credits - QUERY_COST
    });

  } catch (error: any) {
    console.error("Oracle API Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to process Oracle request" 
    }, { status: 500 });
  }
}
