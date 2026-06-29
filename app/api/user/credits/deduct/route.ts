import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";

export async function POST(req: Request) {
  try {
    const { walletAddress, amount = 1, signature, message } = await req.json();
    const numAmount = parseInt(amount.toString());

    if (!walletAddress || !signature || !message) {
      return NextResponse.json({ message: "Wallet address, signature, and message are required" }, { status: 400 });
    }

    // Verify signature
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = new PublicKey(walletAddress).toBytes();
      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
      
      if (!isValid) {
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
      }

      // Prevent replay attack (basic timestamp check in message)
      const parsedMsg = JSON.parse(message);
      if (Date.now() - parsedMsg.timestamp > 1000 * 60 * 5) { // 5 minutes expiry
        return NextResponse.json({ message: "Signature expired" }, { status: 401 });
      }
    } catch (e) {
      return NextResponse.json({ message: "Signature verification failed" }, { status: 401 });
    }

    if (isNaN(numAmount) || numAmount < 1 || numAmount > 100) {
      return NextResponse.json({ message: "Invalid deduction amount (1-100)" }, { status: 400 });
    }

    const user = await storage.getUserByWalletAddress(walletAddress);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.credits < numAmount) {
      return NextResponse.json({ message: "Insufficient credits" }, { status: 403 });
    }

    const updatedUser = await storage.deductCredits(user.id, numAmount);

    return NextResponse.json({ success: true, credits: updatedUser?.credits });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
