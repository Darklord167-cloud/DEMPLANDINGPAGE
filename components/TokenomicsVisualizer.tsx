"use client";

import { useState, useId } from "react";
import { motion } from "motion/react";
import { 
  PieChart, 
  Coins, 
  Lock, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Calculator, 
  ArrowRight,
  Layers,
  Award
} from "lucide-react";
import { useAudioHUD } from "@/hooks/useAudioHUD";
import { toast } from "sonner";

export interface AllocationItem {
  id: string;
  name: string;
  percentage: number;
  tokens: number;
  color: string;
  glowColor: string;
  textColor: string;
  description: string;
}

const TOTAL_SUPPLY = 100_000_000; // 100M $DEMP
const CURRENT_PRICE_USD = 0.0485;

const ALLOCATIONS: AllocationItem[] = [
  {
    id: "lp",
    name: "Liquidity Pool",
    percentage: 40,
    tokens: 40_000_000,
    color: "bg-purple-500",
    glowColor: "shadow-purple-500/50",
    textColor: "text-purple-400",
    description: "Permanently locked DEX liquidity pool on Raydium/Orca AMM for deep trading execution.",
  },
  {
    id: "rewards",
    name: "Ecosystem Rewards",
    percentage: 30,
    tokens: 30_000_000,
    color: "bg-emerald-500",
    glowColor: "shadow-emerald-500/50",
    textColor: "text-emerald-400",
    description: "High-yield staking rewards, liquidity mining, and VIP community incentives.",
  },
  {
    id: "treasury",
    name: "Treasury & Vaults",
    percentage: 15,
    tokens: 15_000_000,
    color: "bg-amber-500",
    glowColor: "shadow-amber-500/50",
    textColor: "text-amber-400",
    description: "DAO governed treasury reserve for strategic protocol expansions and buyout funds.",
  },
  {
    id: "team",
    name: "Team & R&D",
    percentage: 15,
    tokens: 15_000_000,
    color: "bg-cyan-500",
    glowColor: "shadow-cyan-500/50",
    textColor: "text-cyan-400",
    description: "Core engineering & algorithm development with 24-month linear vesting schedule.",
  },
];

interface LockupOption {
  days: number;
  label: string;
  apy: number;
  multiplier: string;
}

const LOCKUP_OPTIONS: LockupOption[] = [
  { days: 30, label: "30 Days", apy: 12.5, multiplier: "1.0x" },
  { days: 90, label: "90 Days", apy: 24.0, multiplier: "1.5x" },
  { days: 180, label: "180 Days", apy: 38.5, multiplier: "2.2x" },
  { days: 365, label: "365 Days", apy: 55.0, multiplier: "3.5x" },
];

export function TokenomicsVisualizer({ className = "" }: { className?: string }) {
  const { playTradeClick, playConnectSound } = useAudioHUD();
  const sliderId = useId();

  // State
  const [selectedAlloc, setSelectedAlloc] = useState<AllocationItem>(ALLOCATIONS[0]);
  const [stakedAmount, setStakedAmount] = useState<number>(50_000);
  const [selectedLockup, setSelectedLockup] = useState<LockupOption>(LOCKUP_OPTIONS[3]); // Default 365 days

  // Staking yield calculations
  const annualRewardTokens = stakedAmount * (selectedLockup.apy / 100);
  const lockupPeriodRewardTokens = annualRewardTokens * (selectedLockup.days / 365);
  const projectedRewardUsd = lockupPeriodRewardTokens * CURRENT_PRICE_USD;
  const totalReturnTokens = stakedAmount + lockupPeriodRewardTokens;
  const totalReturnUsd = totalReturnTokens * CURRENT_PRICE_USD;
  const monthlyYieldUsd = (annualRewardTokens / 12) * CURRENT_PRICE_USD;

  const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);
  const formatUsd = (num: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(num);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setStakedAmount(val);
    playTradeClick();
  };

  const handleLockupSelect = (option: LockupOption) => {
    setSelectedLockup(option);
    playTradeClick();
  };

  const handlePresetSelect = (amount: number) => {
    setStakedAmount(amount);
    playConnectSound();
  };

  const handleSimulateStake = () => {
    playConnectSound();
    toast.success("Staking Strategy Simulated", {
      description: `Projected yield: +${formatNumber(Math.round(lockupPeriodRewardTokens))} $DEMP (${formatUsd(projectedRewardUsd)}) over ${selectedLockup.label}!`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative bg-zinc-950/60 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/20 overflow-hidden ${className}`}
    >
      {/* Sci-Fi Ambient Backdrops */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-80" />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-purple-500/20">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Telemetry // Tokenomics & Staking Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-wider text-glow">
            $DEMP Tokenomics & Yield Calculator
          </h2>
          <p className="mt-1 text-zinc-400 font-mono text-xs">
            Total Supply: <strong className="text-white">100,000,000 $DEMP</strong> • Dynamic Staking Multipliers
          </p>
        </div>

        <div className="bg-zinc-900/80 border border-purple-500/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 backdrop-blur-md">
          <Award className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span className="font-mono text-xs text-zinc-300">
            Max APY: <strong className="text-emerald-400 font-bold">55.0%</strong>
          </span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT GRID */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* COLUMN 1: INTERACTIVE ALLOCATION BREAKDOWN */}
        <div className="space-y-6 bg-zinc-900/50 border border-purple-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
              Token Supply Distribution
            </h3>
            <span className="text-xs font-mono text-purple-300">Fixed Supply</span>
          </div>

          {/* Stacked Interactive Allocation Bar */}
          <div className="h-4 w-full bg-zinc-950 rounded-full overflow-hidden flex p-0.5 gap-1 border border-purple-500/30">
            {ALLOCATIONS.map((alloc) => (
              <button
                key={alloc.id}
                onClick={() => {
                  setSelectedAlloc(alloc);
                  playTradeClick();
                }}
                style={{ width: `${alloc.percentage}%` }}
                title={`${alloc.name}: ${alloc.percentage}%`}
                className={`h-full rounded-full ${alloc.color} transition-all duration-300 hover:brightness-125 ${
                  selectedAlloc.id === alloc.id ? "ring-2 ring-white scale-[1.02]" : "opacity-80"
                }`}
              />
            ))}
          </div>

          {/* Allocation Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            {ALLOCATIONS.map((alloc) => {
              const isSelected = selectedAlloc.id === alloc.id;
              return (
                <button
                  key={alloc.id}
                  onClick={() => {
                    setSelectedAlloc(alloc);
                    playTradeClick();
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? `bg-zinc-950/90 ${alloc.glowColor} border-purple-500/60 shadow-lg`
                      : "bg-zinc-950/40 border-purple-500/10 hover:border-purple-500/30 hover:bg-zinc-950/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono text-xs font-bold ${alloc.textColor}`}>
                      {alloc.name}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-white">
                      {alloc.percentage}%
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-zinc-400">
                    {formatNumber(alloc.tokens)} DEMP
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Allocation Detailed Box */}
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-purple-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`font-mono text-sm font-bold ${selectedAlloc.textColor}`}>
                {selectedAlloc.name} Detail
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                ≈ {formatUsd(selectedAlloc.tokens * CURRENT_PRICE_USD)}
              </span>
            </div>
            <p className="text-xs font-mono text-zinc-300 leading-relaxed">
              {selectedAlloc.description}
            </p>
            <div className="pt-2 border-t border-purple-500/10 flex justify-between font-mono text-[11px] text-zinc-400">
              <span>Tokens Allocated:</span>
              <span className="text-white font-bold">{formatNumber(selectedAlloc.tokens)} $DEMP</span>
            </div>
          </div>
        </div>

        {/* COLUMN 2: STAKING APY CALCULATOR & SIMULATOR */}
        <div className="space-y-6 bg-zinc-900/50 border border-purple-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-display font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-400" />
              Staking APY Calculator
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold">Live Calculator</span>
          </div>

          {/* Stake Amount Selector */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
              <label htmlFor={sliderId} className="flex items-center gap-1.5 uppercase font-semibold">
                <Coins className="w-3.5 h-3.5 text-purple-400" />
                Stake Amount ($DEMP)
              </label>
              <span className="text-sm font-mono font-bold text-white">
                {formatNumber(stakedAmount)} <span className="text-purple-400 text-xs">DEMP</span>
              </span>
            </div>

            {/* Slider */}
            <input
              id={sliderId}
              type="range"
              min={1000}
              max={1000000}
              step={1000}
              value={stakedAmount}
              onChange={handleSliderChange}
              className="w-full h-2 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-purple-500 border border-purple-500/30"
            />

            {/* Quick Presets */}
            <div className="flex items-center gap-2">
              {[10000, 50000, 250000, 1000000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetSelect(preset)}
                  className={`flex-1 py-1 rounded-lg font-mono text-[10px] border transition-all ${
                    stakedAmount === preset
                      ? "bg-purple-950 text-purple-300 border-purple-500 font-bold shadow"
                      : "bg-zinc-950/60 text-zinc-400 border-purple-500/10 hover:text-white"
                  }`}
                >
                  {preset >= 1000000 ? "1M" : `${preset / 1000}k`}
                </button>
              ))}
            </div>
          </div>

          {/* Lock-up Duration Selector */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5 uppercase font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Lock-up Period & APY
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {selectedLockup.multiplier} Multiplier
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {LOCKUP_OPTIONS.map((opt) => {
                const isSelected = selectedLockup.days === opt.days;
                return (
                  <button
                    key={opt.days}
                    onClick={() => handleLockupSelect(opt)}
                    className={`py-2.5 px-2 rounded-xl border text-center font-mono transition-all ${
                      isSelected
                        ? "bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-950/40 ring-1 ring-purple-500/50"
                        : "bg-zinc-950/50 border-purple-500/10 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <div className="text-[11px] font-bold">{opt.label}</div>
                    <div className="text-xs text-emerald-400 font-extrabold mt-0.5">{opt.apy}%</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PROJECTED YIELD DISPLAY WITH NEON EMERALD GLOW */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-purple-500/30 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-purple-500/10 pb-3">
              <span className="uppercase font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Projected Staking Yield
              </span>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-bold">
                {selectedLockup.apy}% APY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                  Reward ({selectedLockup.label})
                </span>
                <span className="text-xl font-mono font-extrabold text-white">
                  +{formatNumber(Math.round(lockupPeriodRewardTokens))} <span className="text-purple-400 text-xs">DEMP</span>
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">
                  USD Yield Value
                </span>
                {/* NEON EMERALD TEXT GLOW */}
                <span className="text-xl font-mono font-extrabold text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.7)]">
                  +{formatUsd(projectedRewardUsd)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-purple-500/10 flex items-center justify-between font-mono text-xs text-zinc-400">
              <span>Est. Monthly Passive Income:</span>
              <span className="text-emerald-300 font-bold">+{formatUsd(monthlyYieldUsd)} / mo</span>
            </div>

            <button
              onClick={handleSimulateStake}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-950/60"
            >
              <span>Simulate Staking Position</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
