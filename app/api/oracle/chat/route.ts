import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// 1. Initialize the client securely on the server using the private environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    // 2. Parse the incoming message and chat history from the frontend
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 3. Initialize the chat with the user's previous conversation history and system instructions
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
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
    return NextResponse.json({ response: responseText });
    
  } catch (error: any) {
    console.error("Oracle Chat Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to communicate with Oracle." },
      { status: 500 }
    );
  }
}
