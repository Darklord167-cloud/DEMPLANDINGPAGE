import { NextResponse } from "next/server";
import Stripe from "stripe";
import { storage } from "@/server/storage";
import { headers } from "next/headers";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is required");
  }
  return new Stripe(secretKey);
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not configured on server.");
    return NextResponse.json({ message: "Server Webhook Configuration Error" }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ message: "Missing Stripe-Signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown verification error";
    console.error(`[Stripe Webhook Signature Error]: ${errorMessage}`);
    return NextResponse.json({ message: "Webhook Signature Verification Failed" }, { status: 400 });
  }

  // Handle successful checkout session fulfillment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Verify payment status before fulfilling credits
    if (session.payment_status !== "paid") {
      console.warn(`[Stripe Webhook] Session ${session.id} not paid yet (status: ${session.payment_status})`);
      return NextResponse.json({ received: true, status: "unpaid_ignored" });
    }

    const walletAddress = session.metadata?.walletAddress;
    const creditsAmount = parseInt(session.metadata?.credits || "0", 10);
    const amountTotal = session.amount_total ?? 0;
    const currency = session.currency ?? "usd";
    const customerId = typeof session.customer === "string" ? session.customer : null;

    if (walletAddress && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress) && creditsAmount > 0) {
      try {
        const result = await storage.fulfillStripeCredits({
          eventId: event.id,
          eventType: event.type,
          sessionId: session.id,
          walletAddress,
          creditsAmount,
          amountTotal,
          currency,
          customerId,
        });

        if (result.duplicate) {
          console.log(`[Stripe Webhook] Idempotent duplicate event ${event.id} safely ignored.`);
          return NextResponse.json({ received: true, duplicate: true });
        }

        console.log(`[Stripe Webhook] Verified payment and added ${creditsAmount} credits to wallet ${walletAddress}. New balance: ${result.newBalance}`);
      } catch (err: unknown) {
        console.error("[Stripe Webhook Error] Transaction State Sync Failed:", err);
        return NextResponse.json({ message: "Transaction State Sync Failed" }, { status: 500 });
      }
    } else {
      console.warn(`[Stripe Webhook] Session ${session.id} missing valid Solana walletAddress or credits metadata.`);
    }
  }

  return NextResponse.json({ received: true });
}
