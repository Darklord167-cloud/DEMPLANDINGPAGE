import { NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@/server/storage";
import { insertSubscriberSchema } from "@/shared/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = insertSubscriberSchema.parse(body) as any;

    const existing = await storage.getSubscriberByEmail(data.email);
    if (existing) {
      return NextResponse.json(
        { message: "This email is already subscribed." },
        { status: 409 }
      );
    }

    const subscriber = await storage.createSubscriber(data);
    return NextResponse.json(
      { message: "Successfully subscribed!", subscriber },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { message: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}
