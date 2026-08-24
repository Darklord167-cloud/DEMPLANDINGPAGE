import { DEMP_TOKEN_MINT, DEMP_TOTAL_SUPPLY } from "@/lib/config/public";

export interface TokenTelemetry {
  mint: string;
  symbol: string;
  name: string;
  priceUsd: number | null;
  priceSol: number | null;
  priceChange24h: number | null;
  volume24h: number | null;
  marketCapUsd: number | null;
  fdvUsd: number | null;
  liquidityUsd: number | null;
  totalSupply: number;
  holdersCount: number | null;
  updatedAt: string;
  source: "dexscreener" | "birdeye" | "on-chain" | "unavailable";
  status: "live" | "delayed" | "syncing" | "unavailable";
}

/** Initial unpopulated telemetry state indicating live data query status */
export const INITIAL_TELEMETRY: TokenTelemetry = {
  mint: DEMP_TOKEN_MINT,
  symbol: "DEMP",
  name: "Dark Empire Token",
  priceUsd: null,
  priceSol: null,
  priceChange24h: null,
  volume24h: null,
  marketCapUsd: null,
  fdvUsd: null,
  liquidityUsd: null,
  totalSupply: DEMP_TOTAL_SUPPLY,
  holdersCount: null,
  updatedAt: new Date().toISOString(),
  source: "unavailable",
  status: "syncing",
};

/** Alias for backwards compatibility */
export const DEFAULT_TELEMETRY = INITIAL_TELEMETRY;

/**
 * Fetches verified real-time token telemetry from DEX Screener API.
 * Never invents mock prices, volume, or holder statistics.
 */
export async function fetchTokenTelemetry(
  mintAddress: string = DEMP_TOKEN_MINT
): Promise<TokenTelemetry> {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.warn(`[DexScreener] API returned status ${res.status}`);
      return {
        ...INITIAL_TELEMETRY,
        mint: mintAddress,
        status: "unavailable",
      };
    }

    const data = await res.json();
    const pairs = data.pairs;

    if (pairs && Array.isArray(pairs) && pairs.length > 0) {
      const topPair = pairs[0];
      const priceUsd = topPair.priceUsd ? parseFloat(topPair.priceUsd) : null;
      const priceSol = topPair.priceNative ? parseFloat(topPair.priceNative) : null;
      const priceChange24h = topPair.priceChange?.h24 !== undefined ? parseFloat(topPair.priceChange.h24) : null;
      const volume24h = topPair.volume?.h24 !== undefined ? parseFloat(topPair.volume.h24) : null;
      const liquidityUsd = topPair.liquidity?.usd !== undefined ? parseFloat(topPair.liquidity.usd) : null;
      const fdvUsd = topPair.fdv !== undefined ? parseFloat(topPair.fdv) : null;
      const marketCapUsd = topPair.marketCap !== undefined ? parseFloat(topPair.marketCap) : fdvUsd;

      return {
        mint: mintAddress,
        symbol: topPair.baseToken?.symbol || "DEMP",
        name: topPair.baseToken?.name || "Dark Empire Token",
        priceUsd,
        priceSol,
        priceChange24h,
        volume24h,
        marketCapUsd,
        fdvUsd,
        liquidityUsd,
        totalSupply: DEMP_TOTAL_SUPPLY,
        holdersCount: null, // Only displayed if verified on-chain via RPC
        updatedAt: new Date().toISOString(),
        source: "dexscreener",
        status: priceUsd !== null ? "live" : "syncing",
      };
    }
  } catch (error: any) {
    console.warn("[Telemetry] Live DEX telemetry fetch notice:", error?.message || error);
  }

  return {
    ...INITIAL_TELEMETRY,
    mint: mintAddress,
    status: "unavailable",
  };
}

/**
 * Calculates USD holding value based on token balance & live price.
 */
export function calculateHoldingValueUsd(dempBalance: number, priceUsd: number | null): number | null {
  if (priceUsd === null || isNaN(priceUsd) || priceUsd <= 0) return null;
  return dempBalance * priceUsd;
}

/**
 * Formats large USD values for display ($4.85M, $920.0K, etc.)
 */
export function formatUsdValue(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "Awaiting live data";
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  if (value < 0.01 && value > 0) {
    return `$${value.toFixed(6)}`;
  }
  return `$${value.toFixed(2)}`;
}
