import { NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { storage } from "@/server/storage";
import { PublicKey } from "@solana/web3.js";

const challengeRequestSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  action: z.enum(["deduct_credits", "vip_verify", "login"]),
});

// Sliding window rate limiter for challenge endpoint
const challengeRateLimits = new Map<string, { count: number; resetAt: number }>();
const CHALLENGE_RATE_LIMIT = 20; // 20 challenge requests per minute per IP
const CHALLENGE_WINDOW_MS = 60 * 1000;

function checkChallengeRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = challengeRateLimits.get(ip);
  if (!record || now > record.resetAt) {
    challengeRateLimits.set(ip, { count: 1, resetAt: now + CHALLENGE_WINDOW_MS });
    return true;
  }
  if (record.count >= CHALLENGE_RATE_LIMIT) return false;
  record.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!checkChallengeRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "Too many authentication requests. Please retry in 1 minute." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = challengeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid challenge request parameters", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { walletAddress, action } = parsed.data;

    // Validate Solana PublicKey format
    try {
      new PublicKey(walletAddress);
    } catch {
      return NextResponse.json({ error: "Invalid Solana wallet address format" }, { status: 400 });
    }

    const host = req.headers.get("host") || "darkempirelords.com";
    const domain = host.split(":")[0];
    const nonce = crypto.randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes TTL

    // Canonical human-readable challenge format
    const messageToSign = [
      `Dark Empire Lords Authentication Challenge`,
      `Domain: ${domain}`,
      `Wallet: ${walletAddress}`,
      `Action: ${action}`,
      `Nonce: ${nonce}`,
      `Issued At: ${now.toISOString()}`,
      `Expires At: ${expiresAt.toISOString()}`,
    ].join("\n");

    await storage.createAuthChallenge({
      nonce,
      walletAddress,
      action,
      domain,
      issuedAt: now,
      expiresAt,
      consumed: false,
    });

    return NextResponse.json({
      success: true,
      nonce,
      walletAddress,
      action,
      domain,
      issuedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      messageToSign,
    });
  } catch (error: any) {
    console.error("[Auth Challenge Error]:", error);
    return NextResponse.json(
      { error: "Failed to generate authentication challenge" },
      { status: 500 }
    );
  }
}
