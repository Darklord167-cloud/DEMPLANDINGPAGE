"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  Cpu, 
  ShieldCheck, 
  Wallet, 
  Globe, 
  Rocket,
  Sparkles,
  TrendingUp,
  Coins,
  BarChart3,
  DollarSign,
  Activity
} from "lucide-react";
import { motion } from "motion/react";
import { JupiterSwapWidget } from "@/components/JupiterSwapWidget";
import { MarketTelemetry } from "@/components/MarketTelemetry";
import { RealTimeTradeStream } from "@/components/RealTimeTradeStream";
import { PortfolioAnalytics } from "@/components/PortfolioAnalytics";
import { YieldSimulator } from "@/components/YieldSimulator";
import { WatchlistManager } from "@/components/WatchlistManager";
import { 
  fetchTokenTelemetry, 
  formatUsdValue, 
  calculateHoldingValueUsd, 
  DEFAULT_TELEMETRY,
  type TokenTelemetry 
} from "@/lib/solana";
import { useVipTier } from "@/lib/vip-context";

const HOLDINGS_DATA = [
  {
    title: "Empire Capital",
    desc: "Strategic investment arm focused on high-yield DeFi protocols and real-world asset tokenization.",
    icon: Building2,
    glow: "hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.05)]",
  },
  {
    title: "Dark Labs",
    desc: "R&D division building proprietary trading algorithms and blockchain infrastructure.",
    icon: Cpu,
    glow: "hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.05)]",
  },
  {
    title: "Shadow Security",
    desc: "Smart contract auditing and operational security consulting for partner projects.",
    icon: ShieldCheck,
    glow: "hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)]",
  },
  {
    title: "Empire Vaults",
    desc: "Non-custodial yield aggregators with auto-compounding strategies.",
    icon: Wallet,
    glow: "hover:border-[#b026ff]/40 hover:shadow-[0_0_30px_rgba(176,38,255,0.08)]",
  },
  {
    title: "DE: Network",
    desc: "Decentralized private communication layer for DAO governance.",
    icon: Globe,
    glow: "hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)]",
  },
  {
    title: "Launchpad X",
    desc: "Incubator and IDO platform for vetted ecosystem projects.",
    icon: Rocket,
    glow: "hover:border-rose-500/30 hover:shadow-[0_0_30px_rgba(244,63,94,0.05)]",
  },
];

export default function HoldingsPage() {
  const { dempBalance } = useVipTier();
  const [telemetry, setTelemetry] = useState<TokenTelemetry>(DEFAULT_TELEMETRY);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const stats = await fetchTokenTelemetry();
        setTelemetry(stats);
      } catch (err) {
        console.error("Telemetry load error:", err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const userHoldingUsd = calculateHoldingValueUsd(dempBalance, telemetry.priceUsd);

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f5f5f5] pt-24 pb-20 px-4 font-sans selection:bg-purple-900/40 relative">
      {/* Subtle Gold/Purple Ambient Highlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-16 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-xs uppercase tracking-wider backdrop-blur-md shadow-lg shadow-purple-950/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            DARK EMPIRE ECOSYSTEM CAPABILITY
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-wider text-glow">
            Empire Holdings
          </h1>
          <p className="text-zinc-400 font-mono text-sm max-w-2xl mx-auto leading-relaxed">
            Strategic divisions powering the Dark Empire infrastructure, capital deployment, algorithmic trading, and smart security contracts.
          </p>
          <div className="h-0.5 w-16 bg-purple-500 mx-auto opacity-60 shadow-[0_0_10px_#a855f7]" />
        </div>

        {/* WEB3 PORTFOLIO ANALYTICS DASHBOARD CARD */}
        <PortfolioAnalytics />


        {/* LIVE $DEMP TELEMETRY METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Price USD */}
          <div className="p-5 rounded-2xl border border-purple-500/20 bg-zinc-950/40 backdrop-blur-md space-y-2 shadow-xl shadow-purple-950/10">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 uppercase font-semibold">
                <Coins className="w-4 h-4 text-purple-400" />
                $DEMP Live Price
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${telemetry.priceChange24h >= 0 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}`}>
                {telemetry.priceChange24h >= 0 ? "+" : ""}{telemetry.priceChange24h.toFixed(2)}%
              </span>
            </div>
            <div className="text-2xl font-mono font-extrabold text-white tracking-tight text-glow">
              ${telemetry.priceUsd.toFixed(4)}
            </div>
            <div className="text-[11px] font-mono text-purple-300">
              {telemetry.priceSol.toFixed(6)} SOL
            </div>
          </div>

          {/* Real-time Market Cap */}
          <div className="p-5 rounded-2xl border border-purple-500/20 bg-zinc-950/40 backdrop-blur-md space-y-2 shadow-xl shadow-purple-950/10">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 uppercase font-semibold">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Market Cap (Live)
              </span>
              <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
            <div className="text-2xl font-mono font-extrabold text-amber-400 tracking-tight">
              {formatUsdValue(telemetry.marketCapUsd)}
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              24h Vol: {formatUsdValue(telemetry.volume24h)}
            </div>
          </div>

          {/* User Holdings Value Calculation */}
          <div className="p-5 rounded-2xl border border-purple-500/20 bg-zinc-950/40 backdrop-blur-md space-y-2 shadow-xl shadow-purple-950/10">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 uppercase font-semibold">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Your Holdings USD
              </span>
              <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800 font-bold">
                RPC Verified
              </span>
            </div>
            <div className="text-2xl font-mono font-extrabold text-emerald-400 tracking-tight">
              ${userHoldingUsd.toFixed(2)}
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              {dempBalance.toLocaleString()} $DEMP Balance
            </div>
          </div>

          {/* Liquidity Pool Stats */}
          <div className="p-5 rounded-2xl border border-purple-500/20 bg-zinc-950/40 backdrop-blur-md space-y-2 shadow-xl shadow-purple-950/10">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 uppercase font-semibold">
                <BarChart3 className="w-4 h-4 text-blue-400" />
                DEX Liquidity
              </span>
              <span className="text-[10px] font-mono text-blue-300">Solana AMM</span>
            </div>
            <div className="text-2xl font-mono font-extrabold text-blue-300 tracking-tight">
              {formatUsdValue(telemetry.liquidityUsd)}
            </div>
            <div className="text-[11px] font-mono text-zinc-400">
              {telemetry.holdersCount.toLocaleString()} Verified Holders
            </div>
          </div>
        </div>

        {/* GECKO TERMINAL LIVE CHART & REAL-TIME TRADE STREAM WIDGET */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <MarketTelemetry height={520} />
          </div>
          <div className="lg:col-span-1">
            <RealTimeTradeStream height={520} />
          </div>
        </div>

        {/* COMPONENT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {HOLDINGS_DATA.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`backdrop-blur-md bg-zinc-950/40 border border-purple-500/20 rounded-2xl p-6 md:p-8 flex items-start gap-5 transition-all duration-300 shadow-xl shadow-purple-950/10 hover:border-purple-500/40 hover:bg-zinc-950/60 ${item.glow}`}
              >
                <div className="w-12 h-12 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center shrink-0 shadow-inner">
                  <IconComponent className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2 tracking-wider text-glow">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-sm font-mono leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* STAKING YIELD SIMULATOR & SURVEILLANCE WATCHLIST */}
        <YieldSimulator />
        <WatchlistManager />

        {/* JUPITER SWAP PERFORMANCE CONTAINER */}
        <div id="swap-portal" className="border-t border-purple-500/20 pt-16 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-purple-400 font-mono text-xs uppercase tracking-wider text-glow">
              {"///"} On-Chain Liquidity Engine
            </p>
            <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-wider text-glow">
              Acquire Ecosystem Fuel ($DEMP)
            </h2>
            <p className="text-zinc-400 font-mono text-xs max-w-lg mx-auto">
              Direct DEX router for $DEMP holdings. Instant liquidity through Jupiter&apos;s Solana aggregator.
            </p>
          </div>

          <div className="max-w-4xl mx-auto w-full">
            <JupiterSwapWidget />
          </div>
        </div>

      </div>
    </div>
  );
}
