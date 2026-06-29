import { NextResponse } from "next/server";
import { storage } from "@/server/storage";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";

export async function POST(req: Request) {
  try {
    const { walletAddress, signature, message } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({ message: "Wallet address required" }, { status: 400 });
    }

    let user = await storage.getUserByWalletAddress(walletAddress);

    // If logging in or creating, require signature
    if (signature && message) {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = new PublicKey(walletAddress).toBytes();
      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
      
      if (!isValid) {
        return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
      }

      if (!user) {
        user = await storage.createUser({
          username: `wallet_${walletAddress.slice(0, 8)}`,
          walletAddress,
          password: null as any,
        });
      }
    } else if (!user) {
      return NextResponse.json({ message: "User not registered, please provide signature to create account" }, { status: 404 });
    }

    // Sanitize response
    const { id, password, stripeCustomerId, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
