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

// Set of processed Stripe event IDs to ensure idempotency
const processedEvents = new Set<string>();

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ message: "Server Webhook Configuration Error" }, { status: 500 });
  }

  const body = await req.text();
  const reqHeaders = await headers();
  const signature = reqHeaders.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ message: "Missing Stripe-Signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripeClient();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown verification error";
    console.error(`Stripe Webhook Signature Verification Error: ${errorMessage}`);
    return NextResponse.json({ message: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Idempotency check
  if (processedEvents.has(event.id)) {
    console.log(`[Stripe Webhook] Duplicate event ${event.id} ignored`);
    return NextResponse.json({ received: true, duplicate: true });
  }
  processedEvents.add(event.id);

  // Keep set size bounded
  if (processedEvents.size > 1000) {
    const firstItem = processedEvents.values().next().value;
    if (firstItem) processedEvents.delete(firstItem);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Verify payment status before fulfilling credits
    if (session.payment_status !== "paid") {
      console.warn(`[Stripe Webhook] Session ${session.id} not paid yet (status: ${session.payment_status})`);
      return NextResponse.json({ received: true, status: "unpaid_ignored" });
    }

    const walletAddress = session.metadata?.walletAddress;
    const creditsAmount = parseInt(session.metadata?.credits || "0", 10);

    if (walletAddress && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress) && creditsAmount > 0) {
      try {
        let user = await storage.getUserByWalletAddress(walletAddress);

        if (!user) {
          user = await storage.createUser({
            username: `wallet_${walletAddress.slice(0, 8)}`,
            walletAddress,
            password: null,
          });
        }

        const customerId = typeof session.customer === "string" ? session.customer : user.stripeCustomerId;

        await storage.updateUser(user.id, {
          credits: (user.credits || 0) + creditsAmount,
          stripeCustomerId: customerId,
        });

        console.log(`[Stripe Webhook] Verified payment and added ${creditsAmount} credits to wallet ${walletAddress}`);
      } catch (err: unknown) {
        console.error("[Stripe Webhook] DB error updating user credits:", err);
        return NextResponse.json({ message: "Transaction State Sync Failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
