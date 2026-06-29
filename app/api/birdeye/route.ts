import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  const fallbackData = {
    data: {
      price: 0.0042,
      mc: 4200000,
      v24hUSD: 125000,
      priceChange24h: 3.5
    }
  };

  if (!address) {
    console.warn("No address provided to Birdeye API, returning fallback data");
    return NextResponse.json(fallbackData);
  }

  const apiKey = process.env.BIRDEYE_API_KEY;
  
  if (!apiKey) {
    console.warn("BIRDEYE_API_KEY is not configured, returning fallback data");
    return NextResponse.json(fallbackData);
  }

  try {
    const response = await fetch(`https://public-api.birdeye.so/defi/token_overview?address=${address}`, {
      headers: {
        "X-API-KEY": apiKey,
        "x-chain": "solana"
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      console.warn(`Birdeye API responded with status: ${response.status}. Returning fallback.`);
      return NextResponse.json(fallbackData);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Birdeye API Error:", error);
    return NextResponse.json(fallbackData);
  }
}
