"use client";

import React, { useState, useMemo } from 'react';
import { VIP_TIERS, VipTierDef, getTierForBalance, getNextTierInfo } from '@/lib/vip-tiers';
import { useVipTier } from '@/lib/vip-context';
import { VipBadge } from '@/components/vip/VipBadge';
import { 
  Check, 
  Shield, 
  Award, 
  Zap, 
  Crown, 
  Flame, 
  ArrowRight, 
  Lock, 
  Sparkles, 
  Sliders, 
  Calculator,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  DollarSign,
  Cpu,
  Bot,
  Vote,
  Sparkle,
  Layers,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function VipTiersGrid() {
  const { tier: currentTier, dempBalance } = useVipTier();
  
  // Interactive state
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [simulatedBalance, setSimulatedBalance] = useState<number>(15000);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Savings calculator inputs
  const [estimatedMonthlyVolume, setEstimatedMonthlyVolume] = useState<number>(5000);
  const [estimatedMonthlyQueries, setEstimatedMonthlyQueries] = useState<number>(30);

  const tiersList = Object.values(VIP_TIERS);

  // Distinct visual styling configuration for each Tier
  const tierVisualStyles: Record<string, {
    borderClass: string;
    bgClass: string;
    badgeBg: string;
    glowShadow: string;
    accentHex: string;
    statusTag: string;
  }> = {
    none: {
      borderClass: 'border-slate-800/80 hover:border-slate-600',
      bgClass: 'bg-gradient-to-b from-slate-950/80 via-zinc-950/90 to-black',
      badgeBg: 'bg-slate-900 text-slate-400 border-slate-700',
      glowShadow: '0 0 15px rgba(148, 163, 184, 0.1)',
      accentHex: '#94a3b8',
      statusTag: 'ENTRY TIER',
    },
    bronze: {
      borderClass: 'border-amber-800/60 hover:border-amber-500/80',
      bgClass: 'bg-gradient-to-b from-amber-950/40 via-zinc-950 to-black',
      badgeBg: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
      glowShadow: '0 0 25px rgba(205, 127, 50, 0.25)',
      accentHex: '#cd7f32',
      statusTag: 'BRONZE OPERATIVE',
    },
    silver: {
      borderClass: 'border-slate-400/50 hover:border-slate-300',
      bgClass: 'bg-gradient-to-b from-slate-900/50 via-zinc-950 to-black',
      badgeBg: 'bg-slate-800/90 text-slate-200 border-slate-500/70',
      glowShadow: '0 0 25px rgba(226, 232, 240, 0.3)',
      accentHex: '#e2e8f0',
      statusTag: 'SILVER SENTINEL',
    },
    gold: {
      borderClass: 'border-amber-500/70 hover:border-yellow-400 shadow-[0_0_30px_rgba(251,191,36,0.25)]',
      bgClass: 'bg-gradient-to-b from-yellow-950/50 via-amber-950/20 to-black',
      badgeBg: 'bg-yellow-950 text-yellow-300 border-yellow-500/80',
      glowShadow: '0 0 35px rgba(251, 191, 36, 0.4)',
      accentHex: '#fbbf24',
      statusTag: 'GOLD COMMANDER',
    },
    dark_lord: {
      borderClass: 'border-purple-500/80 hover:border-purple-400 shadow-[0_0_40px_rgba(192,132,252,0.35)]',
      bgClass: 'bg-gradient-to-b from-purple-950/60 via-violet-950/30 to-black',
      badgeBg: 'bg-purple-950/90 text-purple-200 border-purple-400/90',
      glowShadow: '0 0 45px rgba(192, 132, 252, 0.5)',
      accentHex: '#c084fc',
      statusTag: 'OVERLORD SUPREME',
    },
  };

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'dark_lord':
        return <Flame className="w-6 h-6 text-purple-400 animate-pulse" />;
      case 'gold':
        return <Crown className="w-6 h-6 text-amber-400" />;
      case 'silver':
        return <Zap className="w-6 h-6 text-slate-200" />;
      case 'bronze':
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Shield className="w-6 h-6 text-slate-400" />;
    }
  };

  const getStatusBadge = (tierDef: VipTierDef, isUserActive: boolean) => {
    if (isUserActive) {
      return {
        text: "ACTIVE TIER",
        bgClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 font-bold",
        indicatorColor: "bg-emerald-400 animate-ping",
      };
    }
    if (dempBalance >= tierDef.minBalance) {
      return {
        text: "UNLOCKED",
        bgClass: "bg-purple-950/80 text-purple-300 border-purple-500/40 font-bold",
        indicatorColor: "bg-purple-400",
      };
    }
    return {
      text: "LOCKED",
      bgClass: "bg-zinc-900 text-zinc-500 border-zinc-800",
      indicatorColor: "bg-zinc-600",
    };
  };

  // Filtered tiers based on user selection
  const filteredTiers = tiersList.filter((t) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'discount') return t.discountPercentage > 0;
    if (selectedFilter === 'oracle') return t.oracleMultiplier > 1.0;
    return t.id === selectedFilter;
  });

  // Calculate simulated tier info
  const simulatedTier = getTierForBalance(simulatedBalance);
  const simulatedNextInfo = getNextTierInfo(simulatedBalance);

  // Projected monthly savings calculation based on estimated volume & oracle queries
  const standardFeeRate = 0.005; // 0.5% base fee
  const standardOracleCostPerQuery = 0.50; // $0.50 per query

  const calculatedSavings = useMemo(() => {
    const baseFeeUSD = estimatedMonthlyVolume * standardFeeRate;
    const baseOracleUSD = estimatedMonthlyQueries * standardOracleCostPerQuery;

    const discountRatio = simulatedTier.discountPercentage / 100;
    const feeSavedUSD = baseFeeUSD * discountRatio;
    const oracleSavedUSD = baseOracleUSD * discountRatio;
    const totalSavedUSD = feeSavedUSD + oracleSavedUSD;

    return {
      feeSavedUSD,
      oracleSavedUSD,
      totalSavedUSD,
    };
  }, [estimatedMonthlyVolume, estimatedMonthlyQueries, simulatedTier]);

  return (
    <div className="space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/40 bg-purple-950/50 text-purple-300 font-mono text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>ON-CHAIN VIP PRIVILEGE MATRIX</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-tight uppercase drop-shadow-[0_0_25px_rgba(168,85,247,0.3)]">
          DARK EMPIRE VIP TIER SYSTEM
        </h2>
        <p className="text-zinc-400 text-sm md:text-base font-mono leading-relaxed max-w-2xl mx-auto">
          Hold $DEMP tokens in your Solana wallet to unlock exclusive privileges, service fee waivers up to 50%, priority RPC routing, and unlimited AI Oracle power.
        </p>
      </div>

      {/* Interactive Requirement & Benefit Calculator Simulator */}
      <div className="p-6 md:p-8 rounded-3xl border border-purple-900/60 bg-gradient-to-b from-zinc-950 via-[#0a0814] to-zinc-950 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/90 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-white uppercase tracking-wider text-glow flex items-center gap-2">
                INTERACTIVE TIER CALCULATOR & SAVINGS SIMULATOR
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Adjust $DEMP holding & monthly usage to calculate real-time savings & perk unlocks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-purple-950/80 border border-purple-500/40 px-4 py-2 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <span className="text-xs font-mono text-zinc-400">Simulated Balance:</span>
            <span className="text-base font-mono font-black text-amber-400">
              {simulatedBalance.toLocaleString()} $DEMP
            </span>
          </div>
        </div>

        {/* Range Slider & Quick Preset Buttons */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>0 $DEMP</span>
              <span>1,000 $DEMP (Bronze)</span>
              <span>10,000 $DEMP (Silver)</span>
              <span>50,000 $DEMP (Gold)</span>
              <span>100,000+ $DEMP (Dark Lord)</span>
            </div>
            <input
              type="range"
              min="0"
              max="150000"
              step="1000"
              value={simulatedBalance}
              onChange={(e) => setSimulatedBalance(Number(e.target.value))}
              className="w-full h-3 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500 border border-purple-900/40 shadow-inner"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <span className="text-zinc-400 font-semibold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-purple-400" />
              Holding Milestones:
            </span>
            <div className="flex flex-wrap gap-2">
              {[0, 1000, 10000, 50000, 100000, 150000].map((val) => (
                <button
                  key={val}
                  onClick={() => setSimulatedBalance(val)}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                    simulatedBalance === val
                      ? 'bg-purple-600 text-white border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                      : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {val === 0 ? 'Free' : `${(val / 1000).toFixed(0)}k $DEMP`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Simulation Result Box with Monthly Savings Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
          {/* Active Tier Card Preview */}
          <div 
            className="lg:col-span-2 p-5 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{
              borderColor: simulatedTier.color,
              background: `linear-gradient(135deg, ${simulatedTier.color}15, rgba(9, 9, 13, 0.98))`,
              boxShadow: `0 0 35px ${simulatedTier.glowColor}`,
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900/90 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-lg">
                {getTierIcon(simulatedTier.id)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className={cn('text-2xl font-display font-black', simulatedTier.textColor)}>
                    {simulatedTier.name}
                  </h4>
                  <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full bg-black/80 border border-white/20 text-white">
                    {simulatedTier.subtitle}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 font-mono mt-1 leading-relaxed">
                  {simulatedTier.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-zinc-800 pt-4 sm:pt-0">
              <div className="text-center sm:text-right">
                <p className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">FEE WAIVER</p>
                <p className="text-2xl font-mono font-black text-emerald-400">{simulatedTier.discountPercentage}% OFF</p>
              </div>

              <div className="text-center sm:text-right">
                <p className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">ORACLE POWER</p>
                <p className="text-2xl font-mono font-black text-purple-300">{simulatedTier.oracleMultiplier}x</p>
              </div>

              <Button asChild size="default" className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl shadow-[0_0_18px_rgba(168,85,247,0.4)]">
                <Link href="#token">
                  <span>GET $DEMP</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Interactive Projected Monthly Savings Box */}
          <div className="p-5 rounded-2xl bg-zinc-950/90 border border-emerald-900/40 space-y-3 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Projected Monthly Savings
              </span>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                {simulatedTier.discountPercentage}% Savings Tier
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-3xl font-mono font-black text-emerald-400 tracking-tight text-glow">
                ${calculatedSavings.totalSavedUSD.toFixed(2)}{' '}
                <span className="text-xs text-zinc-400 font-normal">/ month</span>
              </div>

              <div className="space-y-1 text-[11px] font-mono text-zinc-400">
                <div className="flex justify-between">
                  <span>Estimated Volume ($5,000):</span>
                  <span className="text-zinc-200 font-semibold">${calculatedSavings.feeSavedUSD.toFixed(2)} saved</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated AI Oracle Queries (30):</span>
                  <span className="text-zinc-200 font-semibold">${calculatedSavings.oracleSavedUSD.toFixed(2)} saved</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-zinc-500 font-mono leading-tight pt-2 border-t border-zinc-900">
              *Savings calculated relative to standard zero-holding HQ protocol fees.
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: View Switcher (Grid vs Table Matrix) & Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold mr-1">
            Filter Tiers:
          </span>
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold tracking-wider border transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                : 'bg-zinc-950/90 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            SHOW ALL TIERS
          </button>
          <button
            onClick={() => setSelectedFilter('discount')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'discount'
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-zinc-950/90 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>FEE DISCOUNTS</span>
          </button>
          <button
            onClick={() => setSelectedFilter('oracle')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedFilter === 'oracle'
                ? 'bg-purple-950 text-purple-200 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-zinc-950/90 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-purple-400" />
            <span>AI ORACLE BOOST</span>
          </button>
        </div>

        {/* Layout Mode Switcher */}
        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 self-start md:self-auto">
          <span className="text-[11px] font-mono text-zinc-400 font-bold px-2">View Mode:</span>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
              viewMode === 'grid'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer font-bold ${
              viewMode === 'table'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Comparison Matrix</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: GRID CARDS VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {filteredTiers.map((t: VipTierDef) => {
            const isActive = currentTier.id === t.id;
            const isUnlocked = dempBalance >= t.minBalance;
            const status = getStatusBadge(t, isActive);
            const style = tierVisualStyles[t.id] || tierVisualStyles.none;

            // Calculate exact progress percentage for this specific card
            let cardProgress = 0;
            if (t.minBalance === 0) {
              cardProgress = 100;
            } else {
              cardProgress = Math.min(100, Math.max(0, (dempBalance / t.minBalance) * 100));
            }

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'relative flex flex-col justify-between rounded-3xl border p-6 transition-all duration-300 backdrop-blur-xl group shadow-[0_15px_35px_rgba(0,0,0,0.7)]',
                  style.bgClass,
                  style.borderClass,
                  isActive && 'border-2 scale-[1.03] z-20 shadow-2xl'
                )}
                style={{
                  borderColor: isActive ? t.color : undefined,
                  boxShadow: isActive ? style.glowShadow : undefined,
                }}
              >
                {/* Active Tier Top Badge */}
                {isActive && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-purple-600 text-white font-mono font-black text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.6)] border border-purple-300">
                    ★ YOUR ACTIVE TIER ★
                  </div>
                )}

                <div className="space-y-5">
                  {/* Header Row: Tier Icon + Status Badge */}
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                    <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 group-hover:scale-110 transition-transform shadow-inner">
                      {getTierIcon(t.id)}
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono font-extrabold uppercase tracking-wider ${status.bgClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.indicatorColor}`} />
                      <span>{status.text}</span>
                    </span>
                  </div>

                  {/* Tier Title & Min Balance */}
                  <div className="space-y-1">
                    <h4 className={cn('text-2xl font-display font-black tracking-tight', t.textColor)}>
                      {t.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs font-mono pt-1">
                      <span className="text-zinc-400 font-semibold">
                        {t.minBalance === 0 ? 'Free Access' : `${t.minBalance.toLocaleString()}+ $DEMP`}
                      </span>
                      <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        {t.discountPercentage}% OFF
                      </span>
                    </div>
                  </div>

                  {/* Tier Goal Progress Bar inside Card */}
                  {t.minBalance > 0 && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span>Holding Goal:</span>
                        <span className="font-bold text-purple-300">{cardProgress.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-500"
                          style={{ width: `${cardProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-zinc-400 font-mono leading-relaxed min-h-[42px]">
                    {t.description}
                  </p>

                  {/* Verified Perks Checklist */}
                  <div className="space-y-2 pt-4 border-t border-zinc-800/80">
                    <span className="text-[10px] font-mono text-purple-400 font-extrabold uppercase tracking-widest block">
                      Unlocked Privileges:
                    </span>
                    <ul className="space-y-2">
                      {t.perks.map((perk: string, idx: number) => (
                        <li key={idx} className="flex items-start text-xs text-zinc-300 leading-tight font-mono">
                          <Check className="w-3.5 h-3.5 mr-1.5 text-purple-400 shrink-0 mt-0.5" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Footer Action */}
                <div className="pt-6 mt-6 border-t border-zinc-800/80">
                  {isActive ? (
                    <Button
                      disabled
                      size="sm"
                      className="w-full bg-purple-950/90 border border-purple-500/50 text-purple-200 font-mono text-xs cursor-default font-extrabold"
                    >
                      CURRENT ACTIVE TIER
                    </Button>
                  ) : isUnlocked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-500/60 text-purple-300 font-mono text-xs hover:bg-purple-950/70 font-extrabold"
                    >
                      UNLOCKED TIER
                    </Button>
                  ) : (
                    <Link href="/token" className="w-full block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-zinc-800 hover:border-purple-500/60 text-zinc-300 hover:text-white font-mono text-xs flex items-center justify-center gap-1.5 font-bold"
                      >
                        GET $DEMP <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: SIDE-BY-SIDE COMPARISON MATRIX TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-950/90 overflow-hidden shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/80 text-zinc-400 uppercase">
                  <th className="p-4 font-bold">Feature / Tier</th>
                  {tiersList.map((t) => {
                    const isActive = currentTier.id === t.id;
                    return (
                      <th
                        key={t.id}
                        className={cn(
                          'p-4 text-center min-w-[140px]',
                          isActive && 'bg-purple-950/50 text-white font-bold border-x border-purple-500/40'
                        )}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn('text-base font-display font-black', t.textColor)}>{t.name}</span>
                          {isActive && (
                            <span className="text-[9px] bg-purple-600 text-white px-2 py-0.5 rounded-full font-black uppercase">
                              Active
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                {/* Min Balance Row */}
                <tr className="hover:bg-zinc-900/40">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    Required $DEMP Balance
                  </td>
                  {tiersList.map((t) => (
                    <td key={t.id} className="p-4 text-center font-bold">
                      {t.minBalance === 0 ? '0 $DEMP' : `${t.minBalance.toLocaleString()} $DEMP`}
                    </td>
                  ))}
                </tr>

                {/* Fee Discount Row */}
                <tr className="hover:bg-zinc-900/40 bg-zinc-950/50">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    HQ Service Fee Waiver
                  </td>
                  {tiersList.map((t) => (
                    <td key={t.id} className="p-4 text-center text-emerald-400 font-extrabold text-sm">
                      {t.discountPercentage}% OFF
                    </td>
                  ))}
                </tr>

                {/* Solana RPC Node Row */}
                <tr className="hover:bg-zinc-900/40">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-400" />
                    Solana RPC Endpoint Class
                  </td>
                  {tiersList.map((t) => (
                    <td key={t.id} className="p-4 text-center">
                      {t.level >= 2 ? (
                        <span className="text-blue-300 font-bold">Dedicated Priority</span>
                      ) : t.level === 1 ? (
                        <span className="text-zinc-300">High-Speed Relay</span>
                      ) : (
                        <span className="text-zinc-500">Public Shared</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* AI Oracle Multiplier Row */}
                <tr className="hover:bg-zinc-900/40 bg-zinc-950/50">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-400" />
                    AI Oracle Power Multiplier
                  </td>
                  {tiersList.map((t) => (
                    <td key={t.id} className="p-4 text-center text-purple-300 font-bold">
                      {t.oracleMultiplier}x Power
                    </td>
                  ))}
                </tr>

                {/* Discord Lounge Tier Row */}
                <tr className="hover:bg-zinc-900/40">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <Sparkle className="w-4 h-4 text-amber-400" />
                    Discord VIP Lounge Channel
                  </td>
                  {tiersList.map((t) => (
                    <td key={t.id} className="p-4 text-center">
                      {t.level >= 3 ? (
                        <span className="text-amber-400 font-bold">Syndicate Council</span>
                      ) : t.level >= 1 ? (
                        <span className="text-zinc-300">VIP Holder Lounge</span>
                      ) : (
                        <span className="text-zinc-500">Public Chat</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* DAO Voting Weight Row */}
                <tr className="hover:bg-zinc-900/40 bg-zinc-950/50">
                  <td className="p-4 font-bold text-white flex items-center gap-2">
                    <Vote className="w-4 h-4 text-purple-400" />
                    DAO Governance Vote Weight
                  </td>
                  {tiersList.map((t) => (
                    <td key={t.id} className="p-4 text-center font-bold">
                      {t.id === 'dark_lord' ? (
                        <span className="text-purple-300 font-extrabold">2.0x Weight</span>
                      ) : t.id === 'gold' ? (
                        <span className="text-amber-400">1.5x Weight</span>
                      ) : (
                        <span className="text-zinc-400">1.0x Weight</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Bottom Action Row */}
                <tr>
                  <td className="p-4 font-bold text-white">Action</td>
                  {tiersList.map((t) => {
                    const isActive = currentTier.id === t.id;
                    const isUnlocked = dempBalance >= t.minBalance;
                    return (
                      <td key={t.id} className="p-4 text-center">
                        {isActive ? (
                          <span className="text-xs text-purple-400 font-bold">ACTIVE</span>
                        ) : isUnlocked ? (
                          <span className="text-xs text-emerald-400 font-bold">UNLOCKED</span>
                        ) : (
                          <Link href="/token">
                            <Button size="sm" variant="outline" className="text-[10px] font-mono border-zinc-800 hover:border-purple-500">
                              BUY $DEMP
                            </Button>
                          </Link>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
