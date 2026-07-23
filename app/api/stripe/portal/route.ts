import { NextResponse } from "next/server";
import Stripe from "stripe";
import { storage } from "@/server/storage";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing");
  }
  return new Stripe(secretKey);
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

    const origin = req.headers.get("origin") || "";
    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl || `${origin}/credits`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Stripe Portal Error:", err);
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
