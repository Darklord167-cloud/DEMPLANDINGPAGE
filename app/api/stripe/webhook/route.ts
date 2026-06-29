import { NextResponse } from "next/server";
import Stripe from "stripe";
import { storage } from "@/server/storage";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const walletAddress = session.metadata?.walletAddress;
    const creditsAmount = parseInt(session.metadata?.credits || "0");

    if (walletAddress && creditsAmount > 0) {
      try {
        let user = await storage.getUserByWalletAddress(walletAddress);
        
        if (!user) {
          // If user doesn't exist, create a placeholder one
          user = await storage.createUser({
            username: `wallet_${walletAddress.slice(0, 8)}`,
            walletAddress,
            password: null as any, // Nullable password
          });
        }

        await storage.updateUser(user.id, {
          credits: (user.credits || 0) + creditsAmount,
          stripeCustomerId: session.customer as string || user.stripeCustomerId,
        });

        console.log(`Successfully added ${creditsAmount} credits to ${walletAddress}`);
      } catch (err) {
        console.error("Failed to update user credits in webhook:", err);
        return NextResponse.json({ message: "Failed to update credits" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
