import { NextResponse } from "next/server";
import { z } from "zod";

const swapRequestSchema = z.object({
  quoteResponse: z.any(),
  userPublicKey: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana public key"),
  wrapAndUnwrapSol: z.boolean().optional().default(true),
  dynamicComputeUnitLimit: z.boolean().optional().default(true),
  prioritizationFeeLamports: z.union([z.number(), z.literal("auto")]).optional().default("auto"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parseResult = swapRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid swap request parameters", issues: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { quoteResponse, userPublicKey, wrapAndUnwrapSol, dynamicComputeUnitLimit, prioritizationFeeLamports } =
      parseResult.data;

    // Call Jupiter v6 Swap Transaction builder
    const jupSwapRes = await fetch("https://quote-api.jup.ag/v6/swap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol,
        dynamicComputeUnitLimit,
        prioritizationFeeLamports,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!jupSwapRes.ok) {
      const errText = await jupSwapRes.text().catch(() => "");
      return NextResponse.json(
        { error: "Failed to construct Jupiter swap transaction", details: errText },
        { status: jupSwapRes.status }
      );
    }

    const swapData = await jupSwapRes.json();

    return NextResponse.json({
      success: true,
      swapTransaction: swapData.swapTransaction,
      lastValidBlockHeight: swapData.lastValidBlockHeight,
      prioritizationFeeLamports: swapData.prioritizationFeeLamports,
    });
  } catch (error: any) {
    console.error("[DEX Swap API Error]:", error);
    return NextResponse.json(
      { error: "Failed to assemble swap transaction", message: error.message },
      { status: 500 }
    );
  }
}
