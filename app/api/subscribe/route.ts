import { NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@/server/storage";
import { insertSubscriberSchema } from "@/shared/schema";

const subscribeRateLimits = new Map<string, { count: number; resetAt: number }>();
const SUBSCRIBE_MAX = 5;
const SUBSCRIBE_WINDOW_MS = 10 * 60 * 1000;

function checkSubscribeRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = subscribeRateLimits.get(ip);
  if (!record || now > record.resetAt) {
    subscribeRateLimits.set(ip, { count: 1, resetAt: now + SUBSCRIBE_WINDOW_MS });
    return true;
  }
  if (record.count >= SUBSCRIBE_MAX) return false;
  record.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    if (!checkSubscribeRateLimit(clientIp)) {
      return NextResponse.json(
        { message: "Too many subscription attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const rawEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const parseResult = insertSubscriberSchema.safeParse({ email: rawEmail });

    if (!parseResult.success) {
      return NextResponse.json(
        { message: parseResult.error.issues[0]?.message || "Invalid email address" },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    const existing = await storage.getSubscriberByEmail(data.email).catch(() => null);
    if (existing) {
      return NextResponse.json(
        { message: "This email is already subscribed to the Dark Empire newsletter." },
        { status: 409 }
      );
    }

    const subscriber = await storage.createSubscriber(data);
    return NextResponse.json(
      { message: "Successfully subscribed to Imperial communications.", subscriber },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Subscribe API Internal Error]:", error);
    return NextResponse.json(
      { message: "Failed to process subscription. Please try again." },
      { status: 500 }
    );
  }
}
