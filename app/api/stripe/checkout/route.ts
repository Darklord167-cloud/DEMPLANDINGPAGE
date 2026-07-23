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

function sanitizeRedirectUrl(url: unknown, origin: string, fallback: string): string {
  if (typeof url !== "string" || !url) return `${origin}${fallback}`;
  if (url.startsWith("/")) return `${origin}${url}`;
  try {
    const parsed = new URL(url);
    if (origin) {
      const originUrl = new URL(origin);
      if (parsed.origin === originUrl.origin) return url;
    }
  } catch {
    // Fallback on parse failure
  }
  return `${origin}${fallback}`;
}

export async function POST(req: Request) {
  try {
    const { amount, walletAddress, successUrl, cancelUrl } = await req.json();

    if (!amount || !walletAddress) {
      return NextResponse.json(
        { message: "Amount and wallet address are required" },
        { status: 400 }
      );
    }

    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      return NextResponse.json(
        { message: "Invalid Solana wallet address format" },
        { status: 400 }
      );
    }

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

    const user = await storage.getUserByWalletAddress(walletAddress);
    const customerId = user?.stripeCustomerId;

    const origin = req.headers.get("origin") || "";
    const safeSuccessUrl = sanitizeRedirectUrl(successUrl, origin, "/credits?success=true");
    const safeCancelUrl = sanitizeRedirectUrl(cancelUrl, origin, "/credits?canceled=true");

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
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        walletAddress,
        credits: creditsToAward.toString(),
      },
      success_url: safeSuccessUrl,
      cancel_url: safeCancelUrl,
    };

    if (customerId) {
      sessionConfig.customer = customerId;
    } else {
      sessionConfig.customer_creation = "always";
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
