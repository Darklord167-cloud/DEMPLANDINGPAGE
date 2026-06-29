import { NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@/server/storage";
import { insertContactMessageSchema } from "@/shared/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = insertContactMessageSchema.parse(body);
    
    const message = await storage.createContactMessage(data);
    
    return NextResponse.json(
      { message: "Message sent successfully!", contact: message },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Contact error:", error);
    return NextResponse.json(
      { message: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
