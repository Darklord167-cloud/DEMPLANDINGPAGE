"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { DEMP_TOKEN_MINT, GECKOTERMINAL_POOL_ADDRESS } from "@/lib/solana/config";

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
  const [trades, setTrades] = useState<TradeEvent[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLiveWs, setIsLiveWs] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(!autoStart);
  const [stats, setStats] = useState({
    totalVolumeUsd: 0,
    whaleAlertCount: 0,
    buyCount: 0,
    sellCount: 0,
  });

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const seenTxHashes = useRef<Set<string>>(new Set());

  const addTrade = useCallback(
    (newTrade: TradeEvent) => {
      if (seenTxHashes.current.has(newTrade.txHash)) {
        return;
      }
      seenTxHashes.current.add(newTrade.txHash);

      setTrades((prev) => [newTrade, ...prev.slice(0, maxTrades - 1)]);
      setStats((prev) => ({
        totalVolumeUsd: prev.totalVolumeUsd + newTrade.amountUsd,
        whaleAlertCount: newTrade.isWhale ? prev.whaleAlertCount + 1 : prev.whaleAlertCount,
        buyCount: newTrade.type === "BUY" ? prev.buyCount + 1 : prev.buyCount,
        sellCount: newTrade.type === "SELL" ? prev.sellCount + 1 : prev.sellCount,
      }));
    },
    [maxTrades]
  );

  // 100% Real Live On-Chain Data Pipeline
  useEffect(() => {
    if (isPaused) {
      setIsConnected(false);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      return;
    }

    const birdeyeKey = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY;

    // Option A: Live Birdeye WebSocket if key is provided
    if (birdeyeKey) {
      try {
        const wsUrl = `wss://public-api.birdeye.so/socket/solana?x-api-key=${birdeyeKey}`;
        const ws = new WebSocket(wsUrl, "echo-protocol");
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setIsLiveWs(true);

          ws.send(
            JSON.stringify({
              type: "SUBSCRIBE_TXS",
              data: {
                queryType: "simple",
                address: poolAddress || DEMP_TOKEN_MINT,
                txsType: "swap",
              },
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "TXS_DATA" && message.data) {
              const rawData = message.data;
              const tradeData = rawData.tx || rawData;

              const sideRaw = String(tradeData.side || tradeData.type || "BUY").toUpperCase();
              const side: "BUY" | "SELL" = sideRaw === "SELL" ? "SELL" : "BUY";
              const amountUsd = Number(tradeData.volumeUSD || tradeData.usdValue || tradeData.amountUsd || 0);
              const tokenAmount = Number(tradeData.amount || tradeData.tokenAmount || 0);
              const wallet = tradeData.owner || tradeData.trader || tradeData.signer || "Unknown";
              const txHash = tradeData.txHash || tradeData.hash || tradeData.signature || `tx-${Date.now()}`;

              if (amountUsd > 0) {
                addTrade({
                  id: txHash,
                  type: side,
                  tokenAmount,
                  amountUsd,
                  timestamp: new Date(tradeData.blockTime ? tradeData.blockTime * 1000 : Date.now()),
                  wallet,
                  txHash,
                  isWhale: amountUsd > 1000,
                });
              }
            }
          } catch (err) {
            console.error("[TradeStream WS Parse Error]:", err);
          }
        };

        ws.onerror = () => {
          setIsConnected(false);
          setIsLiveWs(false);
        };

        ws.onclose = () => {
          setIsConnected(false);
          setIsLiveWs(false);
        };
      } catch (e) {
        console.warn("[TradeStream WS Init Notice]:", e);
      }
    }

    // Option B: Real Live DexScreener Telemetry Poll (Strict on-chain stats)
    const fetchRealDexStats = async () => {
      try {
        const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${DEMP_TOKEN_MINT}`, {
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0];
            const volume24h = pair.volume?.h24 ? parseFloat(pair.volume.h24) : 0;
            const buys = pair.txns?.h24?.buys || 0;
            const sells = pair.txns?.h24?.sells || 0;

            setIsConnected(true);
            setStats((prev) => ({
              ...prev,
              totalVolumeUsd: volume24h > 0 ? volume24h : prev.totalVolumeUsd,
              buyCount: buys > 0 ? buys : prev.buyCount,
              sellCount: sells > 0 ? sells : prev.sellCount,
            }));
          }
        }
      } catch (err) {
        console.warn("[TradeStream DexScreener Fetch Notice]:", err);
      }
    };

    fetchRealDexStats();
    pollIntervalRef.current = setInterval(fetchRealDexStats, 15000);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isPaused, poolAddress, addTrade]);

  const togglePause = () => setIsPaused((prev) => !prev);

  const clearStream = () => {
    setTrades([]);
    seenTxHashes.current.clear();
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
    isLiveWs,
    isPaused,
    poolAddress,
    togglePause,
    clearStream,
    setIsConnected,
  };
}
