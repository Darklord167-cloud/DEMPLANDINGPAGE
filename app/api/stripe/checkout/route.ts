import { NextResponse } from "next/server";
import Stripe from "stripe";
import { storage } from "@/server/storage";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function POST(req: Request) {
  try {
    const { amount, walletAddress, successUrl, cancelUrl } = await req.json();

    if (!amount || !walletAddress) {
      return NextResponse.json(
        { message: "Amount and wallet address are required" },
        { status: 400 }
      );
    }

    // Validate and check credit mapping
    const CREDIT_MAP: Record<number, number> = {
      10: 100,
      40: 500,
      75: 1000,
    };

    if (!CREDIT_MAP[amount]) {
      return NextResponse.json(
        { message: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const creditsToAward = CREDIT_MAP[amount];

    // Find if user already has a Stripe Customer ID
    let user = await storage.getUserByWalletAddress(walletAddress);
    let customerId = user?.stripeCustomerId;

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${creditsToAward} Dark Empire Credits`,
              description: `Credits for wallet: ${walletAddress}`,
            },
            unit_amount: amount * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        walletAddress,
        credits: creditsToAward.toString(),
      },
      success_url: successUrl || `${req.headers.get("origin")}/credits?success=true`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/credits?canceled=true`,
    };

    if (customerId) {
      sessionConfig.customer = customerId;
    } else {
      sessionConfig.customer_creation = "always";
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

