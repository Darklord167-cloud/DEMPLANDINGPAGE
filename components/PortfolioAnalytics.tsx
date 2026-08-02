"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Copy, 
  Check, 
  Sparkles, 
  Coins, 
  PieChart, 
  Layers, 
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Volume2,
  VolumeX
} from "lucide-react";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useAudioHUD } from "@/hooks/useAudioHUD";
import { toast } from "sonner";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { CustomWalletButton } from "./ui/custom-wallet-button";

interface PortfolioAnalyticsProps {
  customWalletAddress?: string;
  className?: string;
}

export function PortfolioAnalytics({ customWalletAddress, className = "" }: PortfolioAnalyticsProps) {
  const portfolio = usePortfolio(customWalletAddress);
  const { isMuted, toggleMute, playConnectSound, playTradeClick } = useAudioHUD();
  const { setVisible } = useWalletModal();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (portfolio.walletAddress) {
      navigator.clipboard.writeText(portfolio.walletAddress);
      setCopied(true);
      toast.success("Wallet Address Copied", {
        description: `${portfolio.shortAddress} copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Helper to format currency
  const formatUsd = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // SVG Sparkline calculation
  const sparklinePoints = portfolio.sparklineData;
  const values = sparklinePoints.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal - minVal || 1;

  const svgWidth = 320;
  const svgHeight = 64;

  const pointsString = sparklinePoints
    .map((p, index) => {
      const x = (index / (sparklinePoints.length - 1)) * svgWidth;
      const y = svgHeight - ((p.value - minVal) / valRange) * (svgHeight - 12) - 6;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const areaPointsString = `0,${svgHeight} ${pointsString} ${svgWidth},${svgHeight}`;

  const strokeColor = portfolio.isPositivePnl ? "#34d399" : "#f43f5e";
  const glowClass = portfolio.isPositivePnl
    ? "text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]"
    : "text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]";

  const badgeBgClass = portfolio.isPositivePnl
    ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-300"
    : "bg-rose-950/60 border-rose-500/30 text-rose-300";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative bg-zinc-950/60 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/20 overflow-hidden ${className}`}
    >
      {/* Sci-Fi Decorative Grid Background & Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className={`absolute bottom-0 left-0 w-80 h-80 ${portfolio.isPositivePnl ? "bg-emerald-500/10" : "bg-rose-500/10"} rounded-full blur-[100px] pointer-events-none`} />
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-80" />

      {/* HEADER SECTION: Telemetry Tag, Wallet Badge & Mode Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-purple-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Web3 Telemetry // Portfolio Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-wider flex items-center gap-2">
            Personal Command Portfolio
          </h2>
        </div>

        {/* Status Badge & Control Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {portfolio.isDemo ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/50 border border-amber-500/40 text-amber-300 font-mono text-xs shadow-inner">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-bold">DEMO MODE (Simulated)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-mono text-xs shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">LIVE MAINNET</span>
            </div>
          )}

          {/* AUDIO HUD GLOBAL TOGGLE BUTTON */}
          <button
            onClick={toggleMute}
            title={isMuted ? "Audio HUD Disabled (Click to Enable Synthesizer)" : "Audio HUD Active (Click to Mute)"}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono text-xs transition-all border ${
              isMuted
                ? "bg-zinc-900/80 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                : "bg-purple-950/80 border-purple-500/50 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)] animate-pulse"
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                <span>AUDIO: OFF</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                <span className="font-bold text-purple-300">AUDIO HUD: ON</span>
              </>
            )}
          </button>

          {/* Wallet Address Chip */}
          <button
            onClick={handleCopyAddress}
            title="Click to copy wallet address"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900/80 border border-purple-500/30 text-zinc-300 hover:text-white hover:border-purple-500/60 transition-all font-mono text-xs"
          >
            <Wallet className="w-3.5 h-3.5 text-purple-400" />
            <span>{portfolio.shortAddress}</span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => {
              portfolio.refresh();
              playTradeClick();
            }}
            disabled={portfolio.isLoading}
            title="Refresh Portfolio Telemetry"
            className="p-1.5 rounded-xl bg-zinc-900/80 border border-purple-500/30 text-zinc-300 hover:text-white hover:border-purple-500/60 transition-all font-mono text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${portfolio.isLoading ? "animate-spin text-purple-400" : ""}`} />
          </button>

          {/* Demo Switcher Toggle */}
          <button
            onClick={() => {
              portfolio.toggleDemoMode();
              playConnectSound();
            }}
            className="px-2.5 py-1 rounded-xl bg-purple-950/50 border border-purple-500/30 text-purple-300 hover:bg-purple-900/40 hover:text-white font-mono text-[11px] uppercase tracking-wider transition-all"
          >
            {portfolio.isDemo ? "Connect Wallet" : "Demo Mode"}
          </button>

          {/* If Demo, allow testing PnL trend flip (Green / Red) with Audio Connect Chime */}
          {portfolio.isDemo && (
            <button
              onClick={() => {
                portfolio.togglePnlTrend();
                playConnectSound();
              }}
              title="Flip Demo PnL Trend to test Green / Red neon glows & sound chime"
              className="px-2 py-1 rounded-xl bg-zinc-900/90 border border-zinc-700 text-zinc-400 hover:text-white font-mono text-[10px] uppercase"
            >
              {portfolio.isPositivePnl ? "Test -PnL" : "Test +PnL"}
            </button>
          )}
        </div>
      </div>

      {/* CORE METRICS GRID */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        
        {/* Metric 1: VISUALLY STRIKING PRIMARY METRIC - TOTAL PORTFOLIO VALUE */}
        <div className="md:col-span-1 p-6 rounded-2xl bg-zinc-900/50 border border-purple-500/20 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider">
              <span>Total Portfolio Value</span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            
            {/* Primary Value Display with Neon Ambient Text Glow */}
            <div className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight text-glow">
              {formatUsd(portfolio.totalValueUsd)}
            </div>

            <div className="mt-2 flex items-center gap-2 font-mono text-xs text-purple-300">
              <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Real-Time Valuation</span>
            </div>
          </div>

          {!portfolio.isConnected && (
            <div className="pt-2 border-t border-purple-500/10">
              <button
                onClick={() => setVisible(true)}
                className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-950/50"
              >
                <Wallet className="w-3.5 h-3.5" />
                Connect Solana Wallet
              </button>
            </div>
          )}
        </div>

        {/* Metric 2: $DEMP BALANCE & CURRENT USD VALUE */}
        <div className="md:col-span-1 p-6 rounded-2xl bg-zinc-900/50 border border-purple-500/20 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-purple-400" />
                $DEMP Token Balance
              </span>
              <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800 font-bold">
                Ecosystem
              </span>
            </div>

            <div className="mt-3 text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
              {portfolio.dempBalance.toLocaleString()} <span className="text-purple-400 text-lg">DEMP</span>
            </div>

            <div className="mt-1 text-sm font-mono text-emerald-400 font-bold">
              ≈ {formatUsd(portfolio.dempValueUsd)}
            </div>
          </div>

          <div className="pt-3 border-t border-purple-500/10 flex items-center justify-between font-mono text-xs text-zinc-400">
            <span>Price: ${portfolio.dempPriceUsd.toFixed(4)}</span>
            <a
              href={`https://solscan.io/token/${portfolio.tokens[0]?.mint || "6Higx2gdaqYaukrkNomp1pVJX8uQNHAhavLE7qFnHjYD"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 flex items-center gap-1 hover:underline"
            >
              Solscan <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Metric 3: 24H PROFIT/LOSS WITH CONDITIONAL NEON TEXT GLOW */}
        <div className="md:col-span-1 p-6 rounded-2xl bg-zinc-900/50 border border-purple-500/20 flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider">
              <span>24h Profit / Loss</span>
              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-bold flex items-center gap-1 ${badgeBgClass}`}>
                {portfolio.isPositivePnl ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-rose-400" />
                )}
                {portfolio.isPositivePnl ? "+" : ""}{portfolio.pnl24hPercent.toFixed(2)}%
              </span>
            </div>

            {/* CONDITIONAL NEON TEXT GLOW */}
            <div className={`mt-3 text-2xl sm:text-3xl font-mono font-extrabold tracking-tight transition-all ${glowClass}`}>
              {portfolio.isPositivePnl ? "+" : ""}{formatUsd(portfolio.pnl24hUsd)}
            </div>

            <p className="mt-1 font-mono text-xs text-zinc-400">
              Net 24-hour return across ecosystem assets
            </p>
          </div>

          {/* Micro Trend Status */}
          <div className="pt-3 border-t border-purple-500/10 flex items-center justify-between font-mono text-xs">
            <span className="text-zinc-400">Momentum:</span>
            <span className={portfolio.isPositivePnl ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
              {portfolio.isPositivePnl ? "BULLISH ACCELERATION" : "BEARISH RETRACEMENT"}
            </span>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: MICRO-SPARKLINE CHART & ASSET ALLOCATION BAR */}
      <div className="mt-6 pt-6 border-t border-purple-500/20 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        
        {/* Micro-Sparkline Chart */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 uppercase font-semibold">
              <Activity className="w-4 h-4 text-purple-400" />
              24h Valuation Micro-Sparkline
            </span>
            <span className="text-[11px] font-mono text-purple-300">24H Trend Matrix</span>
          </div>

          <div className="h-16 w-full bg-zinc-900/60 rounded-xl border border-purple-500/20 p-2 relative overflow-hidden flex items-center">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`sparklineGrad-${portfolio.isPositivePnl ? "pos" : "neg"}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Fill */}
              <polygon
                points={areaPointsString}
                fill={`url(#sparklineGrad-${portfolio.isPositivePnl ? "pos" : "neg"})`}
              />

              {/* Line Stroke */}
              <polyline
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />
            </svg>
          </div>
        </div>

        {/* Visual Progress Bar Asset Allocation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5 uppercase font-semibold">
              <PieChart className="w-4 h-4 text-purple-400" />
              Portfolio Asset Allocation
            </span>
            <span className="text-[11px] font-mono text-purple-300">{portfolio.tokens.length} Assets</span>
          </div>

          {/* Stacked Progress Bar */}
          <div className="h-3 w-full bg-zinc-900/80 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-purple-500/20">
            {portfolio.tokens.map((token, idx) => {
              const bgColors = ["bg-purple-500", "bg-amber-500", "bg-blue-500"];
              return (
                <div
                  key={token.symbol}
                  style={{ width: `${token.allocationPercent}%` }}
                  title={`${token.symbol}: ${token.allocationPercent}% (${formatUsd(token.valueUsd)})`}
                  className={`h-full rounded-full ${bgColors[idx % bgColors.length]} transition-all duration-500`}
                />
              );
            })}
          </div>

          {/* Allocation Legends */}
          <div className="flex flex-wrap items-center justify-between pt-1 font-mono text-xs">
            {portfolio.tokens.map((token, idx) => {
              const textColors = ["text-purple-400", "text-amber-400", "text-blue-400"];
              return (
                <div key={token.symbol} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${textColors[idx % textColors.length].replace("text-", "bg-")}`} />
                  <span className="text-zinc-300 font-bold">{token.symbol}:</span>
                  <span className="text-zinc-400">{token.allocationPercent}%</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
