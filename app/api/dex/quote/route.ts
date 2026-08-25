import { NextResponse } from "next/server";
import { DEMP_TOKEN_MINT, SOL_TOKEN_MINT, USDC_TOKEN_MINT } from "@/lib/solana/config";

// Cache quotes briefly to protect against Jupiter rate limits
const quoteCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 2000; // 2 seconds

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const inputMint = searchParams.get("inputMint") || SOL_TOKEN_MINT;
    const outputMint = searchParams.get("outputMint") || DEMP_TOKEN_MINT;
    const amount = searchParams.get("amount") || "100000000"; // 0.1 SOL in lamports default
    const slippageBps = searchParams.get("slippageBps") || "50"; // 0.5% default

    const cacheKey = `${inputMint}:${outputMint}:${amount}:${slippageBps}`;
    const cached = quoteCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return NextResponse.json(cached.data);
    }

    // Call Jupiter v6 quote API with low-latency abort signal
    const jupUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${encodeURIComponent(
      inputMint
    )}&outputMint=${encodeURIComponent(outputMint)}&amount=${encodeURIComponent(
      amount
    )}&slippageBps=${encodeURIComponent(slippageBps)}&restrictIntermediateTokens=true`;

    const res = await fetch(jupUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "Failed to fetch Jupiter quote", details: errText },
        { status: res.status }
      );
    }

    const quoteData = await res.json();
    
    // Normalize response
    const payload = {
      success: true,
      chain: "solana",
      inputMint: quoteData.inputMint,
      inAmount: quoteData.inAmount,
      outputMint: quoteData.outputMint,
      outAmount: quoteData.outAmount,
      priceImpactPct: quoteData.priceImpactPct || "0",
      slippageBps: quoteData.slippageBps,
      routePlan: quoteData.routePlan || [],
      rawQuote: quoteData,
    };

    quoteCache.set(cacheKey, { data: payload, expiry: Date.now() + CACHE_TTL_MS });

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error("[DEX Quote API Error]:", error);
    return NextResponse.json(
      { error: "Quote service temporarily unavailable", message: error.message },
      { status: 500 }
    );
  }
}
