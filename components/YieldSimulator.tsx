"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { Calculator, Sparkles, TrendingUp, ShieldCheck, Coins, Award, ArrowUpRight } from "lucide-react";
import { useVipTier } from "@/lib/vip-context";
import { VIP_TIERS } from "@/lib/vip-tiers";
import { calculateYield, type YieldCalculationResult } from "@/lib/yield-calculator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function YieldSimulator({ className = "" }: { className?: string }) {
  const { tier } = useVipTier();
  const [stakedAmountInput, setStakedAmountInput] = useState<string>("10000");
  const [selectedDuration, setSelectedDuration] = useState<number>(90);
  const [selectedTierId, setSelectedTierId] = useState<string>(tier.id);
  const tokenPriceUsd = 0.0485;

  const amount = Math.max(0, parseFloat(stakedAmountInput) || 0);

  const calc = useMemo(() => {
    return calculateYield({
      stakedAmount: amount,
      durationDays: selectedDuration,
      vipTierId: selectedTierId,
      tokenPriceUsd,
    });
  }, [amount, selectedDuration, selectedTierId, tokenPriceUsd]);

  const formatUsd = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-zinc-950/70 backdrop-blur-xl border border-[#ff6600]/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff6600]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#00d2ff]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#ff6600]/20">
        <div>
          <div className="flex items-center gap-2 text-[#ff6600] font-mono text-xs uppercase tracking-wider">
            <Calculator className="w-4 h-4 text-[#ff6600] animate-pulse" />
            <span>Yield Analytics {"///"} Staking Protocol</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-wider mt-1">
            Dark Staking & Yield Simulator
          </h2>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-[#041635] border border-[#00d2ff]/40 text-[#00d2ff] font-mono text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#00d2ff]" />
          <span>Base APY: 15% + VIP Multiplier</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Staked Amount Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span>Staked $DEMP Amount</span>
              <span className="text-[#00d2ff]">≈ {formatUsd(amount * tokenPriceUsd)}</span>
            </label>
            <div className="relative">
              <Input
                type="number"
                value={stakedAmountInput}
                onChange={(e) => setStakedAmountInput(e.target.value)}
                placeholder="Enter $DEMP amount..."
                className="bg-[#030d21] border-[#ff6600]/40 text-white font-mono h-12 text-lg px-4 pr-20 rounded-xl"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#ff6600]">
                $DEMP
              </div>
            </div>

            {/* Preset Amount Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[5000, 10000, 50000, 100000, 500000].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setStakedAmountInput(preset.toString())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                    amount === preset
                      ? "bg-[#ff6600]/20 border-[#ff6600] text-amber-300 font-bold"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {preset.toLocaleString()} DEMP
                </button>
              ))}
            </div>
          </div>

          {/* Staking Duration Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-300 uppercase tracking-wider">
              Staking Duration (Compound Lockup)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "30 Days", days: 30 },
                { label: "90 Days", days: 90 },
                { label: "180 Days", days: 180 },
                { label: "365 Days", days: 365 },
              ].map((dur) => (
                <button
                  key={dur.days}
                  onClick={() => setSelectedDuration(dur.days)}
                  className={`py-3 rounded-xl font-mono text-xs font-bold transition-all border text-center ${
                    selectedDuration === dur.days
                      ? "bg-gradient-to-r from-[#ff5500] to-[#ffaa00] border-amber-400 text-white shadow-lg shadow-[#ff6600]/30"
                      : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>

          {/* VIP Tier Boost Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span>VIP Tier Booster</span>
              <span className="text-emerald-400 font-bold">+{calc.vipBonusApyPercent}% APY Boost</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.values(VIP_TIERS).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTierId(t.id)}
                  className={`p-2.5 rounded-xl border text-left font-mono transition-all ${
                    selectedTierId === t.id
                      ? "bg-[#041635] border-[#00d2ff] text-white shadow-[0_0_15px_rgba(0,210,255,0.3)]"
                      : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="text-[11px] font-bold uppercase truncate">{t.name}</div>
                  <div className="text-[10px] text-[#00d2ff] font-semibold mt-0.5">
                    {t.id === "none" ? "15% APY" : `${15 + (t.id === "bronze" ? 3 : t.id === "silver" ? 7 : t.id === "gold" ? 12 : 20)}% APY`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#041635]/90 to-[#020b18]/90 border border-[#00d2ff]/40 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#00d2ff]/20 pb-3">
              <span className="text-xs font-mono text-[#00d2ff] uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#ff6600]" />
                Projected Staking Yield
              </span>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                {calc.effectiveApyPercent}% EFFECTIVE APY
              </span>
            </div>

            {/* Big Projected Earnings */}
            <div>
              <span className="text-xs font-mono text-zinc-400 uppercase block">Estimated Reward</span>
              <div className="text-3xl sm:text-4xl font-mono font-extrabold text-white tracking-tight mt-1 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                +{calc.projectedTokensEarned.toLocaleString()} <span className="text-lg text-[#ff6600]">DEMP</span>
              </div>
              <div className="text-sm font-mono text-emerald-300 font-bold mt-1">
                ≈ +{formatUsd(calc.projectedUsdValue)}
              </div>
            </div>

            {/* Total Balance at Maturity */}
            <div className="pt-4 border-t border-[#00d2ff]/20 space-y-2">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-400">Initial Stake:</span>
                <span className="text-white font-bold">{calc.stakedAmount.toLocaleString()} DEMP</span>
              </div>
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-400">Maturity Balance:</span>
                <span className="text-[#00d2ff] font-bold">{calc.totalTokensAtMaturity.toLocaleString()} DEMP</span>
              </div>
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-zinc-400">Lockup Window:</span>
                <span className="text-amber-300 font-bold">{calc.durationDays} Days</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => window.open("https://jup.ag", "_blank")}
            className="w-full bg-gradient-to-r from-[#ff5500] to-[#ffaa00] text-white font-mono font-bold uppercase tracking-wider py-3 rounded-xl shadow-lg shadow-[#ff6600]/40 flex items-center justify-center gap-2"
          >
            <span>Stake $DEMP Now</span>
            <ArrowUpRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
