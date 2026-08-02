"use client";

import { useState } from "react";
import { ExternalLink, LineChart, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEMP_TOKEN_MINT, GECKOTERMINAL_POOL_ADDRESS } from "@/lib/solana/config";

interface GeckoTerminalChartProps {
  poolAddress?: string;
  tokenMint?: string;
  title?: string;
  height?: number;
  className?: string;
}

export function GeckoTerminalChart({
  poolAddress = GECKOTERMINAL_POOL_ADDRESS,
  tokenMint = DEMP_TOKEN_MINT,
  title = "$DEMP Live Telemetry & Trading Chart",
  height = 500,
  className = "",
}: GeckoTerminalChartProps) {
  const [key, setKey] = useState(0);

  const iframeSrc = `https://www.geckoterminal.com/solana/pools/${poolAddress}?embed=1&info=0&swaps=1&grayscale=0&light_chart=0`;
  const geckoUrl = `https://www.geckoterminal.com/solana/pools/${poolAddress}`;
  const dexScreenerUrl = `https://dexscreener.com/solana/${tokenMint}`;

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
            </h3>
            <p className="text-xs font-mono text-zinc-400">
              GeckoTerminal Real-Time Solana DEX Pair Charting & Order Flow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setKey(prev => prev + 1)}
            className="border-purple-500/20 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 font-mono text-xs gap-1.5"
            title="Refresh Chart"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <a
            href={geckoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/20 bg-zinc-900/60 hover:bg-purple-950/40 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
          >
            <span>GeckoTerminal</span>
            <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
          </a>

          <a
            href={dexScreenerUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-500/20 bg-zinc-900/60 hover:bg-purple-950/40 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
          >
            <span>DexScreener</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </a>
        </div>
      </div>

      {/* Chart Iframe Wrapper */}
      <div className="relative w-full bg-black/60 overflow-hidden" style={{ height: `${height}px` }}>
        <iframe
          key={key}
          src={iframeSrc}
          title="$DEMP GeckoTerminal Live Chart"
          className="w-full h-full border-0"
          allow="clipboard-write"
          allowFullScreen
        />
      </div>

      {/* Bottom Footer Info */}
      <div className="bg-zinc-950/80 px-6 py-3 border-t border-purple-500/20 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 gap-2">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Real-time Solana AMM price feed connected</span>
        </span>
        <span className="text-zinc-500">Pair: DEMP/USDC • GeckoTerminal Engine</span>
      </div>
    </div>
  );
}
