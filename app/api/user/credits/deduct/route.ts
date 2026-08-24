import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { z } from "zod";

const deductCreditsSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  amount: z.number().int().min(1).max(100).default(1),
  signature: z.string().min(1),
  message: z.string().min(1),
  nonce: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = deductCreditsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credit deduction request payload" },
        { status: 400 }
      );
    }

    const { walletAddress, amount, signature, message, nonce: directNonce } = parsed.data;

    // 1. Validate Base58 PublicKey format
    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(walletAddress);
    } catch {
      return NextResponse.json({ error: "Invalid Solana wallet address format" }, { status: 400 });
    }

    // 2. Cryptographic signature verification (Ed25519)
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = pubkey.toBytes();
      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

      if (!isValid) {
        return NextResponse.json({ error: "Cryptographic signature verification failed" }, { status: 401 });
      }
    } catch (sigErr) {
      console.warn("[Credit Deduct] Signature decode/verification error:", sigErr);
      return NextResponse.json({ error: "Malformed cryptographic signature" }, { status: 401 });
    }

    // 3. Challenge Nonce & Replay Prevention Verification
    let nonceToVerify = directNonce;
    if (!nonceToVerify && message.includes("Nonce: ")) {
      const nonceMatch = message.match(/Nonce:\s*([a-f0-9]{64})/i);
      if (nonceMatch) {
        nonceToVerify = nonceMatch[1];
      }
    }

    if (nonceToVerify) {
      const challengeCheck = await storage.consumeAuthChallenge({
        nonce: nonceToVerify,
        walletAddress,
        action: "deduct_credits",
      });

      if (!challengeCheck.valid) {
        console.warn(`[Credit Deduct] Nonce verification rejected for ${walletAddress}:`, challengeCheck.error);
        return NextResponse.json(
          { error: challengeCheck.error || "Authentication challenge expired or invalid" },
          { status: 401 }
        );
      }
    } else {
      // Legacy JSON timestamp fallback check
      try {
        const parsedMsg = JSON.parse(message);
        const now = Date.now();
        if (
          !parsedMsg.timestamp ||
          typeof parsedMsg.timestamp !== "number" ||
          Math.abs(now - parsedMsg.timestamp) > 5 * 60 * 1000
        ) {
          return NextResponse.json({ error: "Authentication challenge expired" }, { status: 401 });
        }
      } catch {
        return NextResponse.json({ error: "Missing or invalid challenge nonce" }, { status: 401 });
      }
    }

    // 4. Atomic credit deduction with database concurrency lock
    const deductionResult = await storage.deductCreditsAtomic({
      walletAddress,
      amount,
      nonce: nonceToVerify,
      description: "Oracle Mind Query Deduction",
    });

    if (!deductionResult.success) {
      console.warn(`[Credit Deduct] Deduction failed for ${walletAddress}:`, deductionResult.error);
      const isInsufficient = deductionResult.error?.includes("Insufficient");
      return NextResponse.json(
        { error: deductionResult.error || "Failed to complete credit deduction" },
        { status: isInsufficient ? 403 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      credits: deductionResult.credits,
    });
  } catch (err: any) {
    console.error("[Credit Deduct API Internal Error]:", err);
    return NextResponse.json(
      { error: "Internal server error during credit authorization" },
      { status: 500 }
    );
  }
}
