import { NextResponse } from "next/server";
import Stripe from "stripe";
import { storage } from "@/server/storage";

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is missing");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia" as any,
  });
}

export async function POST(req: Request) {
  try {
    const { walletAddress, returnUrl } = await req.json();

    if (!walletAddress) {
      return NextResponse.json(
        { message: "Wallet address is required" },
        { status: 400 }
      );
    }

    const user = await storage.getUserByWalletAddress(walletAddress);
    
    if (!user || !user.stripeCustomerId) {
      return NextResponse.json(
        { message: "No payment history found for this account. Make a purchase first." },
        { status: 404 }
      );
    }

    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl || `${req.headers.get("origin")}/credits`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Portal Error:", err);
    return NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
