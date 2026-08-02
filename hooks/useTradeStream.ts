"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GECKOTERMINAL_POOL_ADDRESS } from "@/lib/solana/config";

export interface TradeEvent {
  id: string;
  type: "BUY" | "SELL";
  tokenAmount: number;
  amountUsd: number;
  timestamp: Date;
  wallet: string;
  txHash: string;
  isWhale: boolean;
}

const MOCK_WALLETS = [
  "8yGrj6d9p4WfPRkunVo1NwkRSX3VTo43ZS39xu7jupx",
  "3nK9PzL2mX8Vq1Wj4Yk7T6R5E2W1Q0M9N8B7V6C5",
  "9aB8c7D6e5F4G3H2J1K0L9M8N7P6Q5R4S3T2U1V",
  "5xY4z3A2b1C0d9E8f7G6h5J4k3L2m1N0p9Q8R7S",
  "7tU6v5W4x3Y2z1A0B9c8D7e6F5g4H3j2K1L0M9N",
  "2kL3m4N5p6Q7r8S9t0U1v2W3x4Y5z6A7B8c9D0E",
  "6mN7p8Q9r0S1t2U3v4W5x6Y7z8A9B0c1D2e3F4G",
];

function generateRandomWallet(): string {
  const index = Math.floor(Math.random() * MOCK_WALLETS.length);
  return MOCK_WALLETS[index];
}

function generateRandomTxHash(): string {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a single simulated trade event.
 * Probability distribution:
 * ~20% chance of a WHALE ALERT trade (USD value > $1,000 up to $25,000)
 * ~80% chance of a standard trade ($25 - $950)
 */
function createMockTrade(): TradeEvent {
  const isWhale = Math.random() < 0.22;
  const isBuy = Math.random() < 0.65; // Slightly bullish bias

  let amountUsd: number;
  if (isWhale) {
    // Whale trade: $1,050 to $28,500
    amountUsd = parseFloat((1050 + Math.random() * 27450).toFixed(2));
  } else {
    // Standard trade: $20 to $980
    amountUsd = parseFloat((20 + Math.random() * 960).toFixed(2));
  }

  // Token price estimated ~$0.0485 USD per $DEMP
  const dempPriceUsd = 0.0485;
  const tokenAmount = Math.round(amountUsd / dempPriceUsd);

  return {
    id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type: isBuy ? "BUY" : "SELL",
    tokenAmount,
    amountUsd,
    timestamp: new Date(),
    wallet: generateRandomWallet(),
    txHash: generateRandomTxHash(),
    isWhale: amountUsd > 1000,
  };
}

/**
 * Initial historical seed data for realistic initial render
 */
function getInitialTrades(): TradeEvent[] {
  const now = Date.now();
  return [
    {
      id: "trade-init-1",
      type: "BUY",
      tokenAmount: 257732,
      amountUsd: 12500.00,
      timestamp: new Date(now - 12000),
      wallet: "8yGrj6d9p4WfPRkunVo1NwkRSX3VTo43ZS39xu7jupx",
      txHash: "5vabY3k9mL12pXqW8zR4tN6vJ7kL2m1N0p9Q8R7S6tU",
      isWhale: true,
    },
    {
      id: "trade-init-2",
      type: "BUY",
      tokenAmount: 8865,
      amountUsd: 430.00,
      timestamp: new Date(now - 28000),
      wallet: "3nK9PzL2mX8Vq1Wj4Yk7T6R5E2W1Q0M9N8B7V6C5",
      txHash: "3mK8pL12qW7zR4tN6vJ7kL2m1N0p9Q8R7S6tU5vW4x3",
      isWhale: false,
    },
    {
      id: "trade-init-3",
      type: "SELL",
      tokenAmount: 185567,
      amountUsd: 9000.00,
      timestamp: new Date(now - 45000),
      wallet: "9aB8c7D6e5F4G3H2J1K0L9M8N7P6Q5R4S3T2U1V",
      txHash: "7tU6v5W4x3Y2z1A0B9c8D7e6F5g4H3j2K1L0M9N8P7Q",
      isWhale: true,
    },
    {
      id: "trade-init-4",
      type: "BUY",
      tokenAmount: 14845,
      amountUsd: 720.00,
      timestamp: new Date(now - 62000),
      wallet: "5xY4z3A2b1C0d9E8f7G6h5J4k3L2m1N0p9Q8R7S",
      txHash: "2kL3m4N5p6Q7r8S9t0U1v2W3x4Y5z6A7B8c9D0E1F2G",
      isWhale: false,
    },
    {
      id: "trade-init-5",
      type: "BUY",
      tokenAmount: 43298,
      amountUsd: 2100.00,
      timestamp: new Date(now - 85000),
      wallet: "7tU6v5W4x3Y2z1A0B9c8D7e6F5g4H3j2K1L0M9N",
      txHash: "4xY5z6A7B8c9D0E1F2G3h4J5k6L7m8N9p0Q1R2S3T4U",
      isWhale: true,
    },
  ];
}

interface UseTradeStreamOptions {
  poolAddress?: string;
  maxTrades?: number;
  autoStart?: boolean;
}

export function useTradeStream({
  poolAddress = GECKOTERMINAL_POOL_ADDRESS,
  maxTrades = 50,
  autoStart = true,
}: UseTradeStreamOptions = {}) {
  const [trades, setTrades] = useState<TradeEvent[]>(getInitialTrades);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(!autoStart);
  const [stats, setStats] = useState({
    totalVolumeUsd: 24750.00,
    whaleAlertCount: 3,
    buyCount: 4,
    sellCount: 1,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const addTrade = useCallback((newTrade: TradeEvent) => {
    setTrades((prev) => [newTrade, ...prev.slice(0, maxTrades - 1)]);
    setStats((prev) => ({
      totalVolumeUsd: prev.totalVolumeUsd + newTrade.amountUsd,
      whaleAlertCount: newTrade.isWhale ? prev.whaleAlertCount + 1 : prev.whaleAlertCount,
      buyCount: newTrade.type === "BUY" ? prev.buyCount + 1 : prev.buyCount,
      sellCount: newTrade.type === "SELL" ? prev.sellCount + 1 : prev.sellCount,
    }));
  }, [maxTrades]);

  // Simulated WebSocket Stream Loop
  useEffect(() => {
    if (isPaused || !isConnected) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const scheduleNextTrade = () => {
      // Random delay between 2 to 4.5 seconds
      const delay = Math.floor(2000 + Math.random() * 2500);
      timerRef.current = setTimeout(() => {
        addTrade(createMockTrade());
        scheduleNextTrade();
      }, delay);
    };

    scheduleNextTrade();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPaused, isConnected, addTrade]);

  const togglePause = () => setIsPaused((prev) => !prev);

  const clearStream = () => {
    setTrades([]);
    setStats({
      totalVolumeUsd: 0,
      whaleAlertCount: 0,
      buyCount: 0,
      sellCount: 0,
    });
  };

  return {
    trades,
    stats,
    isConnected,
    isPaused,
    poolAddress,
    togglePause,
    clearStream,
    setIsConnected,
  };
}
