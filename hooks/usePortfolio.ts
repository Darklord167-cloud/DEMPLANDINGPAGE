"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { fetchTokenTelemetry } from "@/lib/solana/telemetry";

/** Target $DEMP Solana Mint / Token Address */
export const DEMP_TOKEN_ADDRESS = "6Higx2gdaqYaukrkNomp1pVJX8uQNHAhavLE7qFnHjYD";

export interface TokenHolding {
  symbol: string;
  name: string;
  mint: string;
  balance: number;
  priceUsd: number;
  valueUsd: number;
  change24h: number;
  allocationPercent: number;
  iconUrl?: string;
}

export interface SparklinePoint {
  time: string;
  value: number;
}

export interface PortfolioState {
  walletAddress: string;
  shortAddress: string;
  isConnected: boolean;
  isDemo: boolean;
  totalValueUsd: number;
  dempBalance: number;
  dempValueUsd: number;
  dempPriceUsd: number;
  pnl24hUsd: number;
  pnl24hPercent: number;
  isPositivePnl: boolean;
  tokens: TokenHolding[];
  sparklineData: SparklinePoint[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string;
  refresh: () => Promise<void>;
  toggleDemoMode: () => void;
  togglePnlTrend: () => void;
}

// Default positive demo trend data points (24h)
const DEMO_SPARKLINE_POSITIVE: SparklinePoint[] = [
  { time: "00:00", value: 10750 },
  { time: "02:00", value: 10810 },
  { time: "04:00", value: 10790 },
  { time: "06:00", value: 10920 },
  { time: "08:00", value: 11050 },
  { time: "10:00", value: 11010 },
  { time: "12:00", value: 11240 },
  { time: "14:00", value: 11180 },
  { time: "16:00", value: 11350 },
  { time: "18:00", value: 11420 },
  { time: "20:00", value: 11600 },
  { time: "22:00", value: 11742.50 },
];

// Default negative demo trend data points (24h)
const DEMO_SPARKLINE_NEGATIVE: SparklinePoint[] = [
  { time: "00:00", value: 12450 },
  { time: "02:00", value: 12310 },
  { time: "04:00", value: 12290 },
  { time: "06:00", value: 12100 },
  { time: "08:00", value: 12050 },
  { time: "10:00", value: 11980 },
  { time: "12:00", value: 11840 },
  { time: "14:00", value: 11900 },
  { time: "16:00", value: 11750 },
  { time: "18:00", value: 11620 },
  { time: "20:00", value: 11690 },
  { time: "22:00", value: 11742.50 },
];

/**
 * Fetches current price from Birdeye API endpoint with fallback.
 */
async function fetchBirdeyePrice(mint: string = DEMP_TOKEN_ADDRESS): Promise<number | null> {
  try {
    const res = await fetch(`https://public-api.birdeye.so/defi/price?address=${mint}`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.value && typeof data.data.value === "number") {
        return data.data.value;
      }
    }
  } catch (err) {
    console.warn("Birdeye price endpoint unavailable, falling back to telemetry:", err);
  }
  return null;
}

export function usePortfolio(overrideAddress?: string): PortfolioState {
  const { publicKey, connected } = useWallet();
  const [forceDemo, setForceDemo] = useState<boolean>(false);
  const [demoPnlPositive, setDemoPnlPositive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toISOString());

  // Live telemetry price state
  const [livePriceUsd, setLivePriceUsd] = useState<number>(0.0485);
  const [livePriceChange24h, setLivePriceChange24h] = useState<number>(12.45);

  // Live connected wallet balances
  const [liveDempBalance, setLiveDempBalance] = useState<number>(0);
  const [liveSolBalance, setLiveSolBalance] = useState<number>(0);
  const [liveUsdcBalance, setLiveUsdcBalance] = useState<number>(0);

  const activeWalletAddress = overrideAddress || (publicKey ? publicKey.toBase58() : null);
  const isWalletConnected = Boolean(connected && activeWalletAddress) && !forceDemo;
  const isDemoState = !isWalletConnected;

  // Toggle demo mode
  const toggleDemoMode = useCallback(() => {
    setForceDemo((prev) => !prev);
  }, []);

  // Toggle demo PnL trend (for visual verification of positive vs negative glows)
  const togglePnlTrend = useCallback(() => {
    setDemoPnlPositive((prev) => !prev);
  }, []);

  // Refresh price and wallet telemetry
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Birdeye API Lookup for $DEMP token price
      const birdeyePrice = await fetchBirdeyePrice(DEMP_TOKEN_ADDRESS);
      let currentPrice = birdeyePrice;
      let priceChange24h = 12.45;

      // 2. Telemetry fallback if Birdeye price is rate-limited or null
      if (!currentPrice) {
        const telemetry = await fetchTokenTelemetry(DEMP_TOKEN_ADDRESS);
        currentPrice = telemetry.priceUsd;
        priceChange24h = telemetry.priceChange24h;
      }

      setLivePriceUsd(currentPrice || 0.0485);
      setLivePriceChange24h(priceChange24h);

      // 3. If real wallet connected, attempt live RPC balance query
      if (activeWalletAddress && !forceDemo) {
        try {
          const res = await fetch(`/api/vip/status?wallet=${activeWalletAddress}`);
          if (res.ok) {
            const vipData = await res.json();
            if (vipData.verified) {
              setLiveDempBalance(vipData.dempBalance || 0);
            }
          }
        } catch (walletErr) {
          console.warn("Wallet RPC status fetch error:", walletErr);
        }
      }
      setLastUpdated(new Date().toISOString());
    } catch (err: any) {
      console.error("Portfolio refresh failed:", err);
      setError(err.message || "Failed to sync Web3 portfolio");
    } finally {
      setIsLoading(false);
    }
  }, [activeWalletAddress, forceDemo]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 45000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Construct Demo Wallet Data
  if (isDemoState) {
    const dempPrice = livePriceUsd || 0.0485;
    const dempBalance = 142500;
    const dempValueUsd = dempBalance * dempPrice;
    const solBalance = 18.5;
    const solPrice = 185.00;
    const solValueUsd = solBalance * solPrice;
    const usdcBalance = 1500.00;
    const usdcValueUsd = usdcBalance;

    const totalValueUsd = dempValueUsd + solValueUsd + usdcValueUsd;

    const pnl24hPercent = demoPnlPositive ? 9.15 : -4.27;
    const pnl24hUsd = demoPnlPositive 
      ? totalValueUsd * (pnl24hPercent / 100) 
      : totalValueUsd * (pnl24hPercent / 100);

    const tokens: TokenHolding[] = [
      {
        symbol: "DEMP",
        name: "Dark Empire Token",
        mint: DEMP_TOKEN_ADDRESS,
        balance: dempBalance,
        priceUsd: dempPrice,
        valueUsd: dempValueUsd,
        change24h: livePriceChange24h || 12.45,
        allocationPercent: Math.round((dempValueUsd / totalValueUsd) * 100),
      },
      {
        symbol: "SOL",
        name: "Solana Native",
        mint: "So11111111111111111111111111111111111111112",
        balance: solBalance,
        priceUsd: solPrice,
        valueUsd: solValueUsd,
        change24h: 4.20,
        allocationPercent: Math.round((solValueUsd / totalValueUsd) * 100),
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        balance: usdcBalance,
        priceUsd: 1.00,
        valueUsd: usdcValueUsd,
        change24h: 0.01,
        allocationPercent: Math.round((usdcValueUsd / totalValueUsd) * 100),
      },
    ];

    return {
      walletAddress: "DEMP8uQN9xK7z2m4W8v1P5L90A3cR6jY4F2s",
      shortAddress: "DEMP...8uQN",
      isConnected: false,
      isDemo: true,
      totalValueUsd,
      dempBalance,
      dempValueUsd,
      dempPriceUsd: dempPrice,
      pnl24hUsd,
      pnl24hPercent,
      isPositivePnl: demoPnlPositive,
      tokens,
      sparklineData: demoPnlPositive ? DEMO_SPARKLINE_POSITIVE : DEMO_SPARKLINE_NEGATIVE,
      isLoading,
      error,
      lastUpdated,
      refresh,
      toggleDemoMode,
      togglePnlTrend,
    };
  }

  // Construct Connected Wallet Data
  const dempPrice = livePriceUsd || 0.0485;
  const dempValueUsd = liveDempBalance * dempPrice;
  const solPrice = 185.00;
  const solValueUsd = liveSolBalance * solPrice;
  const usdcValueUsd = liveUsdcBalance;
  const totalValueUsd = dempValueUsd + solValueUsd + usdcValueUsd;

  const isPositivePnl = livePriceChange24h >= 0;
  const pnl24hPercent = livePriceChange24h;
  const pnl24hUsd = totalValueUsd * (pnl24hPercent / 100);

  const tokens: TokenHolding[] = [
    {
      symbol: "DEMP",
      name: "Dark Empire Token",
      mint: DEMP_TOKEN_ADDRESS,
      balance: liveDempBalance,
      priceUsd: dempPrice,
      valueUsd: dempValueUsd,
      change24h: livePriceChange24h,
      allocationPercent: totalValueUsd > 0 ? Math.round((dempValueUsd / totalValueUsd) * 100) : 100,
    },
  ];

  if (liveSolBalance > 0) {
    tokens.push({
      symbol: "SOL",
      name: "Solana Native",
      mint: "So11111111111111111111111111111111111111112",
      balance: liveSolBalance,
      priceUsd: solPrice,
      valueUsd: solValueUsd,
      change24h: 4.20,
      allocationPercent: Math.round((solValueUsd / totalValueUsd) * 100),
    });
  }

  if (liveUsdcBalance > 0) {
    tokens.push({
      symbol: "USDC",
      name: "USD Coin",
      mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      balance: liveUsdcBalance,
      priceUsd: 1.00,
      valueUsd: usdcValueUsd,
      change24h: 0.01,
      allocationPercent: Math.round((usdcValueUsd / totalValueUsd) * 100),
    });
  }

  const addrStr = activeWalletAddress || "";
  const shortAddress = addrStr ? `${addrStr.slice(0, 4)}...${addrStr.slice(-4)}` : "Not Connected";

  return {
    walletAddress: addrStr,
    shortAddress,
    isConnected: true,
    isDemo: false,
    totalValueUsd,
    dempBalance: liveDempBalance,
    dempValueUsd,
    dempPriceUsd: dempPrice,
    pnl24hUsd,
    pnl24hPercent,
    isPositivePnl,
    tokens,
    sparklineData: isPositivePnl ? DEMO_SPARKLINE_POSITIVE : DEMO_SPARKLINE_NEGATIVE,
    isLoading,
    error,
    lastUpdated,
    refresh,
    toggleDemoMode,
    togglePnlTrend,
  };
}
