import { NextResponse } from "next/server";
import { DEMP_TOKEN_MINT } from "@/lib/config/public";

/**
 * GET /api/birdeye?address=...
 * Queries Birdeye DeFi API for real-time token overview telemetry.
 * Returns truthful null data with honest status if unconfigured or offline.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address") || DEMP_TOKEN_MINT;

  const apiKey = process.env.BIRDEYE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        status: "unavailable",
        message: "BIRDEYE_API_KEY is not configured on server.",
      },
      { status: 200 }
    );
  }

  try {
    const response = await fetch(
      `https://public-api.birdeye.so/defi/token_overview?address=${address}`,
      {
        headers: {
          "X-API-KEY": apiKey,
          "x-chain": "solana",
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      console.warn(`[Birdeye API] Returned status ${response.status} for address ${address}`);
      return NextResponse.json(
        {
          success: false,
          data: null,
          status: "unavailable",
          message: `Birdeye responded with HTTP ${response.status}`,
        },
        { status: 200 }
      );
    }

    const json = await response.json();
    return NextResponse.json({
      success: true,
      data: json.data || null,
      status: json.data ? "live" : "unavailable",
    });
  } catch (error: any) {
    console.error("[Birdeye API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        status: "error",
        error: error.message || "Failed to query Birdeye API",
      },
      { status: 200 }
    );
  }
}
