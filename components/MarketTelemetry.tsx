"use client";

import { useState } from "react";
import {
  ExternalLink,
  LineChart,
  RefreshCw,
  Zap,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  Globe,
  ArrowUpRight,
  Radio,
  Layers,
  Cpu,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMP_TOKEN_MINT, GECKOTERMINAL_POOL_ADDRESS } from "@/lib/solana/config";
import { useAudioHUD } from "@/hooks/useAudioHUD";

export interface MarketTelemetryProps {
  poolAddress?: string;
  tokenMint?: string;
  title?: string;
  height?: number;
  className?: string;
  initialViewMode?: "embed" | "fallback";
}

export function MarketTelemetry({
  poolAddress,
  tokenMint = DEMP_TOKEN_MINT,
  title = "$DEMP Live Market Telemetry & DEX Feed",
  height = 520,
  className = "",
  initialViewMode = "embed",
}: MarketTelemetryProps) {
  const { playTradeClick } = useAudioHUD();

  // 1. Telemetry Metadata
  const POOL_ADDRESS = (poolAddress && typeof poolAddress === "string" && poolAddress.trim() !== "")
    ? poolAddress.trim()
    : (GECKOTERMINAL_POOL_ADDRESS || "6Higx2gdaqYaukrkNomp1pVJX8uQNHAhavLE7qFnHjYD");
  
  const PAIR_NAME = "DEMP/USDC";
  const NETWORK_NAME = "Solana";

  // State Management
  const [key, setKey] = useState(0);
  const [activeEngine, setActiveEngine] = useState<"gecko" | "dexscreener">("gecko");
  const [viewMode, setViewMode] = useState<"embed" | "fallback">(initialViewMode);
  const [isLoading, setIsLoading] = useState(true);
  const [isIframeBlocked, setIsIframeBlocked] = useState(false);
  const [copied, setCopied] = useState(false);

  // Embed URLs
  const geckoEmbedSrc = `https://www.geckoterminal.com/solana/pools/${POOL_ADDRESS}?embed=1&info=1&swaps=1&grayscale=0&light_chart=0&chart_type=price&resolution=15m`;
  const dexScreenerEmbedSrc = `https://dexscreener.com/solana/${POOL_ADDRESS}?embed=1&theme=dark`;
  const currentIframeSrc = activeEngine === "gecko" ? geckoEmbedSrc : dexScreenerEmbedSrc;

  // External Action Links (Direct Hub - bypassing iframe restrictions)
  const geckoExternalUrl = `https://www.geckoterminal.com/solana/pools/${POOL_ADDRESS}`;
  const dexScreenerExternalUrl = `https://dexscreener.com/solana/${POOL_ADDRESS}`;
  const jupiterSwapUrl = `https://jup.ag/swap/SOL-${tokenMint}`;
  const solscanUrl = `https://solscan.io/account/${POOL_ADDRESS}`;

  // Interactive Handlers with Audio Triggers
  const handleRefresh = () => {
    playTradeClick();
    setIsLoading(true);
    setKey(prev => prev + 1);
  };

  const handleEngineSwitch = (engine: "gecko" | "dexscreener") => {
    playTradeClick();
    setActiveEngine(engine);
    setIsLoading(true);
    setKey(prev => prev + 1);
  };

  const handleToggleViewMode = (mode: "embed" | "fallback") => {
    playTradeClick();
    setViewMode(mode);
    if (mode === "embed") {
      setIsLoading(true);
      setKey(prev => prev + 1);
    }
  };

  const handleExternalClick = (url: string) => {
    playTradeClick();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyPool = () => {
    playTradeClick();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(POOL_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleIframeError = () => {
    setIsIframeBlocked(true);
    setViewMode("fallback");
  };

  return (
    <div className={`w-full rounded-2xl border border-purple-500/20 bg-zinc-950/50 backdrop-blur-xl overflow-hidden shadow-2xl shadow-purple-950/20 ${className}`}>
      
      {/* HEADER NAVIGATION BAR */}
      <div className="bg-zinc-950/90 px-5 py-4 border-b border-purple-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Title & Live Status */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-950/70 border border-purple-500/30 text-purple-400 shadow-inner">
            <LineChart className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-display font-bold text-white tracking-wider">
                {title}
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE DEX TELEMETRY
              </span>
              {isIframeBlocked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  IFRAME BLOCKED
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-zinc-400 mt-0.5">
              Network: <span className="text-purple-300 font-semibold">{NETWORK_NAME}</span> • Pair: <span className="text-emerald-400 font-semibold">{PAIR_NAME}</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          
          {/* Mode Switcher: Embed vs Native Fallback */}
          <div className="inline-flex rounded-xl bg-zinc-900/90 p-1 border border-purple-500/20 shadow-inner">
            <button
              type="button"
              onClick={() => handleToggleViewMode("embed")}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                viewMode === "embed"
                  ? "bg-purple-950/80 text-purple-200 font-bold border border-purple-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Live Embed
            </button>
            <button
              type="button"
              onClick={() => handleToggleViewMode("fallback")}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                viewMode === "fallback"
                  ? "bg-amber-950/80 text-amber-200 font-bold border border-amber-500/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Native Fallback
            </button>
          </div>

          {/* If in Embed mode, offer Engine switch */}
          {viewMode === "embed" && (
            <div className="inline-flex rounded-xl bg-zinc-900/90 p-1 border border-purple-500/20 shadow-inner">
              <button
                type="button"
                onClick={() => handleEngineSwitch("gecko")}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors ${
                  activeEngine === "gecko"
                    ? "bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                GeckoTerminal
              </button>
              <button
                type="button"
                onClick={() => handleEngineSwitch("dexscreener")}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors ${
                  activeEngine === "dexscreener"
                    ? "bg-amber-950/80 text-amber-300 font-bold border border-amber-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                DexScreener
              </button>
            </div>
          )}

          {/* Refresh Button */}
          {viewMode === "embed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="border-purple-500/20 bg-zinc-900/60 hover:bg-purple-950/40 text-zinc-300 hover:text-white font-mono text-xs gap-1.5"
              title="Refresh Telemetry Feed"
            >
              <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          )}

        </div>
      </div>

      {/* WARNING BANNER FOR BLOCKED IFRAMES */}
      {isIframeBlocked && viewMode === "fallback" && (
        <div className="bg-amber-950/40 border-b border-amber-500/30 px-6 py-2.5 flex items-center justify-between gap-3 text-xs font-mono text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>GeckoTerminal/DexScreener embed policy restricted in this browser frame. Active Dark Empire Direct Hub deployed.</span>
          </div>
          <button
            onClick={() => handleToggleViewMode("embed")}
            className="underline hover:text-amber-100 font-bold shrink-0"
          >
            Retry Embed
          </button>
        </div>
      )}

      {/* CONTENT AREA: LIVE EMBED OR SLEEK DARK EMPIRE NATIVE FALLBACK CARD */}
      {viewMode === "embed" ? (
        <div className="relative w-full bg-zinc-950 overflow-hidden" style={{ height: `${height}px` }}>
          {isLoading && (
            <div className="absolute inset-0 bg-zinc-950 z-10 flex flex-col items-center justify-center p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                <span className="text-xs font-mono text-zinc-300 font-bold uppercase tracking-wider">
                  Booting {activeEngine === "gecko" ? "GeckoTerminal" : "DexScreener"} Live Telemetry Feed...
                </span>
              </div>
              <div className="w-full max-w-md space-y-3 pointer-events-none">
                <Skeleton className="h-6 w-full bg-zinc-900 border border-purple-500/20" />
                <Skeleton className="h-48 w-full bg-zinc-900 border border-purple-500/10" />
                <div className="flex justify-between gap-4">
                  <Skeleton className="h-4 w-1/3 bg-zinc-900 border border-purple-500/10" />
                  <Skeleton className="h-4 w-1/4 bg-zinc-900 border border-purple-500/10" />
                </div>
              </div>
            </div>
          )}

          <iframe
            key={`${key}-${activeEngine}`}
            id={activeEngine === "gecko" ? "geckoterminal-embed" : "dexscreener-embed"}
            src={currentIframeSrc}
            title={activeEngine === "gecko" ? "Embed DEMP / USDC" : "$DEMP DexScreener Live Chart"}
            className="w-full h-full border-0 relative z-0"
            allow="clipboard-write"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={handleIframeError}
          />
        </div>
      ) : (
        /* SLEEK NATIVE DARK EMPIRE FALLBACK CARD UI */
        <div className="p-6 md:p-8 space-y-8 bg-gradient-to-b from-zinc-950 via-[#0a0512] to-zinc-950 relative overflow-hidden">
          
          {/* Ambient Sci-Fi Glow Effects */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Top Telemetry Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-500/20 pb-6 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-widest">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Dark Empire Native Telemetry Matrix</span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-white uppercase tracking-wider text-glow">
                $DEMP Market Hub & Telemetry
              </h2>
              <p className="text-xs font-mono text-zinc-400 max-w-xl">
                Direct external routing Hub bypassing browser iframe security restrictions. Real-time Solana blockchain pair metadata and action access points.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-xs font-semibold flex items-center gap-2 shadow-inner">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified Direct Hub</span>
              </div>
            </div>
          </div>

          {/* TELEMETRY STATS METADATA GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            
            {/* Pool Address Card */}
            <div className="p-4 rounded-xl border border-purple-500/30 bg-zinc-950/70 backdrop-blur-md space-y-2 hover:border-purple-500/50 transition-colors shadow-lg shadow-purple-950/20 group">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="uppercase text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Pool Contract Address
                </span>
                <button
                  type="button"
                  onClick={handleCopyPool}
                  className="p-1 rounded bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-500/30 transition-colors"
                  title="Copy Pool Address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-300" />}
                </button>
              </div>
              <div className="font-mono text-xs font-bold text-white tracking-wide break-all bg-zinc-900/80 p-2 rounded-lg border border-purple-500/20 flex items-center justify-between">
                <span>{POOL_ADDRESS}</span>
                {copied && <span className="text-[10px] text-emerald-400 ml-2 font-mono">COPIED</span>}
              </div>
              <div className="text-[11px] font-mono text-zinc-400">
                AMM liquidity pool deployed on Solana
              </div>
            </div>

            {/* Trading Pair Card */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-zinc-950/70 backdrop-blur-md space-y-2 hover:border-emerald-500/50 transition-colors shadow-lg shadow-emerald-950/10">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="uppercase text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Market Trading Pair
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  ACTIVE
                </span>
              </div>
              <div className="text-xl font-mono font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>{PAIR_NAME}</span>
                <span className="text-xs font-normal text-zinc-400">Raydium / Orca</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-300/80">
                Direct SOL / USDC Liquidity Routing
              </div>
            </div>

            {/* Network Metadata Card */}
            <div className="p-4 rounded-xl border border-cyan-500/30 bg-zinc-950/70 backdrop-blur-md space-y-2 hover:border-cyan-500/50 transition-colors shadow-lg shadow-cyan-950/10 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                <span className="uppercase text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Blockchain Network
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                  MAINNET-BETA
                </span>
              </div>
              <div className="text-xl font-mono font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>{NETWORK_NAME}</span>
                <span className="text-xs font-normal text-cyan-400">High-Speed L1</span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400">
                Fast finality & low-latency execution
              </div>
            </div>

          </div>

          {/* DIRECT ACTION HUB - PROMINENT GLOWING BUTTONS */}
          <div className="space-y-4 relative z-10 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono text-purple-300 uppercase tracking-widest font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Direct Action Routing Hub (Bypasses Frame Policy)
              </h3>
              <span className="text-[10px] font-mono text-zinc-400">Opens securely in new window</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* GeckoTerminal Action Button */}
              <button
                type="button"
                onClick={() => handleExternalClick(geckoExternalUrl)}
                className="group relative p-4 rounded-xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/60 to-zinc-950 hover:from-emerald-900/80 hover:to-zinc-900 text-left transition-all duration-300 shadow-xl shadow-emerald-950/30 hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                    GECKOTERMINAL
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div>
                  <div className="text-sm font-display font-bold text-white tracking-wider flex items-center gap-1.5">
                    Launch GeckoTerminal
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-1">
                    Real-time DEX analytics & candlestick charts
                  </div>
                </div>
              </button>

              {/* DexScreener Action Button */}
              <button
                type="button"
                onClick={() => handleExternalClick(dexScreenerExternalUrl)}
                className="group relative p-4 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-950/60 to-zinc-950 hover:from-amber-900/80 hover:to-zinc-900 text-left transition-all duration-300 shadow-xl shadow-amber-950/30 hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-95 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                    DEXSCREENER
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div>
                  <div className="text-sm font-display font-bold text-white tracking-wider flex items-center gap-1.5">
                    Launch DexScreener
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-1">
                    Solana pair telemetry & volume monitoring
                  </div>
                </div>
              </button>

              {/* Jupiter Swap Action Button */}
              <button
                type="button"
                onClick={() => handleExternalClick(jupiterSwapUrl)}
                className="group relative p-4 rounded-xl border border-cyan-500/40 bg-gradient-to-br from-cyan-950/60 to-zinc-950 hover:from-cyan-900/80 hover:to-zinc-900 text-left transition-all duration-300 shadow-xl shadow-cyan-950/30 hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                    JUPITER DEX
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div>
                  <div className="text-sm font-display font-bold text-white tracking-wider flex items-center gap-1.5">
                    Trade $DEMP on Jupiter
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-1">
                    Instant liquidity router & swap execution
                  </div>
                </div>
              </button>

              {/* Solscan Explorer Button */}
              <button
                type="button"
                onClick={() => handleExternalClick(solscanUrl)}
                className="group relative p-4 rounded-xl border border-purple-500/40 bg-gradient-to-br from-purple-950/60 to-zinc-950 hover:from-purple-900/80 hover:to-zinc-900 text-left transition-all duration-300 shadow-xl shadow-purple-950/30 hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-95 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
                    SOLSCAN
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <div>
                  <div className="text-sm font-display font-bold text-white tracking-wider flex items-center gap-1.5">
                    Inspect on Solscan
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400 mt-1">
                    On-chain contract verification & transactions
                  </div>
                </div>
              </button>

            </div>
          </div>

        </div>
      )}

      {/* FOOTER BAR */}
      <div className="bg-zinc-950/90 px-5 py-3 border-t border-purple-500/20 flex flex-wrap items-center justify-between text-xs font-mono text-zinc-400 gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Pool Address: <span className="text-purple-300 font-bold">{POOL_ADDRESS}</span></span>
        </div>
        <div className="flex items-center gap-4 text-zinc-500">
          <span>Pair: {PAIR_NAME}</span>
          <span>•</span>
          <span>Network: {NETWORK_NAME}</span>
          <span>•</span>
          <span className="text-emerald-400">Audio Feedback Active</span>
        </div>
      </div>

    </div>
  );
}
