"use client";

import { useState } from "react";
import { ExternalLink, LineChart, RefreshCw, Zap, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMP_TOKEN_MINT, GECKOTERMINAL_POOL_ADDRESS } from "@/lib/solana/config";

interface GeckoTerminalChartProps {
  poolAddress?: string;
  tokenMint?: string;
  title?: string;
  height?: number;
  className?: string;
}

export function GeckoTerminalChart({
  poolAddress,
  tokenMint = DEMP_TOKEN_MINT,
  title = "$DEMP Live Telemetry & Trading Chart",
  height = 500,
  className = "",
}: GeckoTerminalChartProps) {
  // 1. Validate Pool Address to ensure it isn't undefined or empty string
  const FALLBACK_POOL = GECKOTERMINAL_POOL_ADDRESS || "8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx";
  const validPoolAddress = (poolAddress && typeof poolAddress === "string" && poolAddress.trim() !== "")
    ? poolAddress.trim()
    : FALLBACK_POOL;

  const [key, setKey] = useState(0);
  const [useFallback, setUseFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 2. Exact embed formats required by specification
  const geckoEmbedSrc = `https://www.geckoterminal.com/solana/pools/${validPoolAddress}?embed=1&info=0&swaps=0`;
  const dexScreenerEmbedSrc = `https://dexscreener.com/solana/${validPoolAddress}?embed=1&theme=dark`;

  const currentIframeSrc = useFallback ? dexScreenerEmbedSrc : geckoEmbedSrc;

  const geckoExternalUrl = `https://www.geckoterminal.com/solana/pools/${validPoolAddress}`;
  const dexScreenerExternalUrl = `https://dexscreener.com/solana/${tokenMint || validPoolAddress}`;

  const handleRefresh = () => {
    setIsLoading(true);
    setKey(prev => prev + 1);
  };

  const handleToggleEngine = (fallback: boolean) => {
    if (useFallback !== fallback) {
      setUseFallback(fallback);
      setIsLoading(true);
      setKey(prev => prev + 1);
    }
  };

  const handleIframeError = () => {
    if (!useFallback) {
      setHasError(true);
      setUseFallback(true);
      setIsLoading(true);
    }
  };

  return (
    <div className={`w-full rounded-2xl border border-purple-500/20 bg-zinc-950/40 backdrop-blur-md overflow-hidden shadow-xl shadow-purple-950/10 ${className}`}>
      {/* Top Header Bar */}
      <div className="bg-zinc-950/80 px-6 py-4 border-b border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400">
            <LineChart className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white tracking-wider flex items-center gap-2">
              {title}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE DEX FEED
              </span>
              {useFallback && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                  <AlertTriangle className="w-3 h-3" />
                  DEXSCREENER FALLBACK
                </span>
              )}
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              {useFallback
                ? "DexScreener Fallback Solana DEX Charting & Market Telemetry"
                : "GeckoTerminal Real-Time Solana DEX Pair Charting & Order Flow"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Engine Switcher */}
          <div className="inline-flex rounded-lg bg-zinc-900/80 p-0.5 border border-purple-500/20">
            <button
              type="button"
              onClick={() => handleToggleEngine(false)}
              className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                !useFallback
                  ? "bg-purple-950/80 text-purple-300 font-bold border border-purple-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              GeckoTerminal
            </button>
            <button
              type="button"
              onClick={() => handleToggleEngine(true)}
              className={`px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                useFallback
                  ? "bg-amber-950/80 text-amber-300 font-bold border border-amber-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              DexScreener
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-purple-500/20 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 font-mono text-xs gap-1.5"
            title="Refresh Chart"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <a
            href={geckoExternalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/20 bg-zinc-900/60 hover:bg-purple-950/40 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
          >
            <span>GeckoTerminal</span>
            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
          </a>

          <a
            href={dexScreenerExternalUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/20 bg-zinc-900/60 hover:bg-purple-950/40 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
          >
            <span>DexScreener</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </a>
        </div>
      </div>

      {/* Chart Iframe Wrapper with bg-zinc-900 placeholder */}
      <div className="relative w-full bg-zinc-900 overflow-hidden" style={{ height: `${height}px` }}>
        {/* Skeleton & Loading Placeholder */}
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-900 z-10 flex flex-col items-center justify-center p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              <span className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
                Booting {useFallback ? "DexScreener" : "GeckoTerminal"} Live Telemetry Engine...
              </span>
            </div>
            <div className="w-full max-w-md space-y-3 pointer-events-none">
              <Skeleton className="h-6 w-full bg-zinc-800/80 border border-purple-500/20" />
              <Skeleton className="h-44 w-full bg-zinc-800/60 border border-purple-500/10" />
              <div className="flex justify-between gap-4">
                <Skeleton className="h-4 w-1/3 bg-zinc-800/60 border border-purple-500/10" />
                <Skeleton className="h-4 w-1/4 bg-zinc-800/60 border border-purple-500/10" />
              </div>
            </div>
          </div>
        )}

        <iframe
          key={`${key}-${useFallback ? "dex" : "gecko"}`}
          src={currentIframeSrc}
          title={useFallback ? "$DEMP DexScreener Live Chart" : "$DEMP GeckoTerminal Live Chart"}
          className="w-full h-full border-0 relative z-0"
          allow="clipboard-write"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={handleIframeError}
        />
      </div>

      {/* Bottom Footer Info */}
      <div className="bg-zinc-950/80 px-6 py-3 border-t border-purple-500/20 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 gap-2">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Real-time Solana AMM price feed connected</span>
        </span>
        <span className="text-zinc-500">
          Pair: DEMP/USDC • Engine: {useFallback ? "DexScreener Embed" : "GeckoTerminal Engine"}
        </span>
      </div>
    </div>
  );
}

