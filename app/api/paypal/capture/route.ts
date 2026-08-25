import { NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@/server/storage";

const captureSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  walletAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana wallet address"),
  creditsAmount: z.number().int().positive("Credits amount must be positive"),
  amountTotal: z.number().positive("Amount total must be positive"),
  orderDetails: z.any().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parseResult = captureSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: parseResult.error.issues[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { orderId, walletAddress, creditsAmount, amountTotal } = parseResult.data;

    // Idempotent credit fulfillment in database ledger
    const result = await storage.fulfillStripeCredits({
      eventId: `paypal_${orderId}`,
      eventType: "paypal.order.captured",
      sessionId: orderId,
      walletAddress,
      creditsAmount,
      amountTotal: Math.round(amountTotal * 100),
      currency: "usd",
    });

    if (result.duplicate) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: "Payment was already processed.",
        newBalance: result.newBalance,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully credited ${creditsAmount} credits.`,
      newBalance: result.newBalance,
    });
  } catch (error: any) {
    console.error("[PayPal Capture Route Error]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process PayPal capture." },
      { status: 500 }
    );
  }
}
