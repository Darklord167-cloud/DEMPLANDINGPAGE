"use client";

import React, { useState, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useVipTier } from '@/lib/vip-context';
import { VipBadge } from '@/components/vip/VipBadge';
import { VipVerificationModal } from '@/components/vip/VipVerificationModal';
import {
  Shield,
  Sparkles,
  CheckCircle2,
  Lock,
  Coins,
  RefreshCw,
  Trophy,
  Crown,
  Swords,
  Copy,
  Check,
  Zap,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  Info,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

// Imperial Ranks Mapping
export interface ImperialRank {
  id: 'initiate' | 'vanguard' | 'overlord';
  name: 'Initiate' | 'Vanguard' | 'Overlord';
  minDemp: number;
  badgeText: string;
  badgeClass: string;
  glowColor: string;
  accentColor: string;
  borderColor: string;
  bgGradient: string;
  description: string;
  perks: { title: string; desc: string; highlight?: string }[];
  icon: React.ComponentType<{ className?: string }>;
}

export const IMPERIAL_RANKS: ImperialRank[] = [
  {
    id: 'initiate',
    name: 'Initiate',
    minDemp: 0,
    badgeText: 'INITIATE RANK',
    badgeClass:
      'border-slate-700 bg-slate-900/90 text-slate-300 shadow-[0_0_12px_rgba(148,163,184,0.2)]',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    accentColor: '#94a3b8',
    borderColor: 'border-slate-700/80',
    bgGradient: 'from-slate-950/90 via-zinc-950/80 to-slate-950/90',
    description: 'Standard Dark Empire explorer. Connect wallet & hold $DEMP to advance on-chain rank.',
    perks: [
      { title: 'Standard Routing', desc: 'Access to public DEX routing engine' },
      { title: 'Public Analytics', desc: 'Real-time chart & orderbook telemetry' },
      { title: 'Basic Oracle Access', desc: 'Standard AI market query capabilities' },
    ],
    icon: Shield,
  },
  {
    id: 'vanguard',
    name: 'Vanguard',
    minDemp: 1000,
    badgeText: 'VANGUARD RANK',
    badgeClass:
      'border-amber-500/70 bg-gradient-to-r from-amber-950/90 via-yellow-950/70 to-amber-950/90 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    accentColor: '#f59e0b',
    borderColor: 'border-amber-500/60',
    bgGradient: 'from-amber-950/80 via-yellow-950/40 to-amber-950/80',
    description: 'Elite HQ Operative. Requires 1,000+ $DEMP for service fee discounts & priority Solana RPC nodes.',
    perks: [
      { title: '5%-15% Fee Discounts', desc: 'Applies automatically across all HQ services', highlight: '5-15% OFF' },
      { title: 'Priority Solana RPC', desc: 'High-speed dedicated transaction relay endpoints', highlight: 'PRIORITY' },
      { title: 'VIP Discord Lounge', desc: 'Access to verified holder discussion channels', highlight: 'PRIVATE' },
    ],
    icon: Swords,
  },
  {
    id: 'overlord',
    name: 'Overlord',
    minDemp: 50000,
    badgeText: 'OVERLORD SUPREME',
    badgeClass:
      'border-purple-400/80 bg-gradient-to-r from-purple-950/90 via-amber-950/50 to-purple-950/90 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.5)]',
    glowColor: 'rgba(168, 85, 247, 0.7)',
    accentColor: '#c084fc',
    borderColor: 'border-purple-500/80',
    bgGradient: 'from-purple-950/90 via-violet-950/60 to-purple-950/90',
    description: 'Supreme Commander tier. Hold 50,000+ $DEMP for maximum fee waivers & unlimited AI Oracle power.',
    perks: [
      { title: '30%-50% HQ Fee Waiver', desc: 'Maximum service discount tier in HQ ecosystem', highlight: '30-50% OFF' },
      { title: 'Unlimited AI Oracle', desc: 'Zero rate-limit access with priority GPU allocation', highlight: 'UNLIMITED' },
      { title: '2x DAO Governance Power', desc: 'Double voting weight on all ecosystem proposals', highlight: '2X POWER' },
    ],
    icon: Crown,
  },
];

export function VipTierCard() {
  const { publicKey, connected } = useWallet();
  const {
    tier,
    dempBalance: actualDempBalance,
    isSignedVerified,
    lastVerifiedAt,
    verifyVip,
    isVerifying,
  } = useVipTier();

  const [copied, setCopied] = useState(false);
  const [selectedRankTab, setSelectedRankTab] = useState<'initiate' | 'vanguard' | 'overlord'>('vanguard');
  const [isSimulatorActive, setIsSimulatorActive] = useState(false);
  const [simulatedBalance, setSimulatedBalance] = useState<number>(10000);
  const [showComparisonMode, setShowComparisonMode] = useState(false);

  // Active balance (real or simulated)
  const dempBalance = isSimulatorActive ? simulatedBalance : actualDempBalance;

  const walletDisplay = publicKey
    ? `${publicKey.toBase58().slice(0, 6)}...${publicKey.toBase58().slice(-6)}`
    : 'Wallet Disconnected';

  const copyWallet = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
      setCopied(true);
      toast.success('Wallet address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine current Imperial Rank based on active balance
  const currentImperialRank = useMemo(() => {
    if (dempBalance >= 50000) return IMPERIAL_RANKS[2];
    if (dempBalance >= 1000) return IMPERIAL_RANKS[1];
    return IMPERIAL_RANKS[0];
  }, [dempBalance]);

  const nextImperialRank = useMemo(() => {
    if (dempBalance < 1000) return IMPERIAL_RANKS[1];
    if (dempBalance < 50000) return IMPERIAL_RANKS[2];
    return null;
  }, [dempBalance]);

  // Multi-tier visual track scaling
  const visualProgress = useMemo(() => {
    if (dempBalance >= 50000) return 100;
    if (dempBalance >= 1000) {
      const seg = (dempBalance - 1000) / (50000 - 1000);
      return 50 + Math.min(1, Math.max(0, seg)) * 50;
    }
    const seg = dempBalance / 1000;
    return Math.min(1, Math.max(0, seg)) * 50;
  }, [dempBalance]);

  // Progress percentage toward next immediate rank
  const { nextRankProgress, remainingDemp } = useMemo(() => {
    if (!nextImperialRank) return { nextRankProgress: 100, remainingDemp: 0 };
    if (nextImperialRank.id === 'vanguard') {
      const rem = Math.max(0, 1000 - dempBalance);
      const prog = Math.min(100, Math.max(0, (dempBalance / 1000) * 100));
      return { nextRankProgress: prog, remainingDemp: rem };
    } else {
      const rem = Math.max(0, 50000 - dempBalance);
      const prog = Math.min(100, Math.max(0, ((dempBalance - 1000) / 49000) * 100));
      return { nextRankProgress: prog, remainingDemp: rem };
    }
  }, [dempBalance, nextImperialRank]);

  // Computed Gamified Level / Power Rating
  const userLevel = dempBalance > 0 ? Math.floor(Math.sqrt(dempBalance / 10)) + 1 : 1;
  const CurrentRankIcon = currentImperialRank.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-[#09090d]/95 p-6 md:p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(168,85,247,0.15)] transition-all duration-500">
      {/* Background Ambient Glows & Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Outer Glow Outline reflecting active VIP Tier */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-500"
        style={{
          boxShadow: tier.id !== 'none' ? `inset 0 0 35px ${tier.glowColor}` : undefined,
          border: tier.id !== 'none' ? `1px solid ${tier.color}44` : undefined,
        }}
      />

      <div className="relative z-10 space-y-8">
        {/* Top Header Row: Title, Level Badge & Status Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                IMPERIAL PROTOCOL • LEVEL {userLevel} OPERATIVE
              </span>

              {isSimulatorActive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-wider animate-pulse">
                  <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                  SIMULATOR ACTIVE
                </span>
              )}
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-black text-white flex items-center gap-3 tracking-tight text-glow">
              {tier.name}
            </h2>
            <p className="text-sm text-zinc-400 font-mono flex items-center gap-2 flex-wrap">
              <span>{tier.subtitle}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400 font-semibold">{currentImperialRank.badgeText}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Amber Gold / Amethyst Imperial Rank Badge */}
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-extrabold border transition-all duration-300 cursor-default ${currentImperialRank.badgeClass}`}
            >
              <CurrentRankIcon className="w-4 h-4" />
              <span>{currentImperialRank.badgeText}</span>
            </motion.span>

            {/* Standard VIP Tier Badge */}
            <VipBadge tier={tier} size="lg" showIcon showVerifiedIcon={isSignedVerified && !isSimulatorActive} />
          </div>
        </div>

        {/* Dynamic Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Verified $DEMP Holdings Box */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-purple-900/40 backdrop-blur-md space-y-2 hover:border-purple-500/60 transition-all duration-300 shadow-inner group relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 uppercase font-semibold">
                <Coins className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                VERIFIED $DEMP HOLDINGS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/90 text-purple-300 border border-purple-800/50 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Solana RPC
              </span>
            </div>
            <div className="text-3xl font-mono font-extrabold text-white tracking-tight text-glow flex items-baseline gap-2">
              {dempBalance.toLocaleString()}
              <span className="text-xs text-purple-400 font-bold">$DEMP</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {dempBalance >= 1000 ? 'VIP Status Active' : 'Hold 1,000 $DEMP for Vanguard'}
              </span>
            </div>
          </div>

          {/* Connected Account Box */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-blue-900/40 backdrop-blur-md space-y-2 hover:border-blue-500/60 transition-all duration-300 shadow-inner group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 uppercase font-semibold">
                <Shield className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                CONNECTED ACCOUNT
              </span>
              {connected && (
                <button
                  onClick={copyWallet}
                  title="Copy wallet address"
                  className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800 transition-colors"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
            <div className="text-lg font-mono font-bold text-zinc-200 truncate">
              {walletDisplay}
            </div>
            <div className="flex items-center text-xs font-mono">
              {connected ? (
                <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Active Solana Mainnet Session
                </span>
              ) : (
                <span className="text-amber-400 font-medium">Please Connect Wallet</span>
              )}
            </div>
          </div>

          {/* Service Privilege Discount Box */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-amber-900/40 backdrop-blur-md space-y-2 hover:border-amber-500/60 transition-all duration-300 shadow-inner group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 uppercase font-semibold">
                <Lock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                HQ SERVICE PRIVILEGE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-800/50 font-bold">
                {currentImperialRank.name} Tier
              </span>
            </div>
            <div className="text-3xl font-mono font-extrabold text-amber-400 tracking-tight flex items-baseline gap-2">
              {currentImperialRank.id === 'overlord' ? '30%-50%' : currentImperialRank.id === 'vanguard' ? '5%-15%' : '0%'} OFF
              <span className="text-xs text-zinc-400 font-normal">Service Fees</span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Applies to AI Oracle & DEX Transactions
            </p>
          </div>
        </div>

        {/* Imperial Rank Progression Map Section */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-zinc-950/95 via-[#0c0a15] to-zinc-950/95 border border-purple-900/70 space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)]">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Trophy className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-display font-black text-white uppercase tracking-wider text-glow flex items-center gap-2">
                  IMPERIAL RANK PROGRESSION
                </h3>
                <p className="text-xs font-mono text-zinc-400">
                  On-Chain Imperial Rank Hierarchy & Privilege Acceleration
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Simulator Toggle Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSimulatorActive(!isSimulatorActive)}
                className={`font-mono text-xs gap-1.5 transition-all ${
                  isSimulatorActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-purple-500/40'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isSimulatorActive ? 'Exit Simulator' : 'Test Rank Simulator'}</span>
              </Button>

              {nextImperialRank ? (
                <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-500/50 px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <span className="text-xs font-mono text-zinc-300">Next Target:</span>
                  <span className="text-xs font-mono font-extrabold text-amber-400">
                    {nextRankProgress.toFixed(1)}% to {nextImperialRank.name}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-mono font-extrabold text-purple-300 bg-purple-950/90 px-4 py-1.5 rounded-full border border-purple-500/60 text-glow shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                  ★ OVERLORD SUPREME UNLOCKED ★
                </span>
              )}
            </div>
          </div>

          {/* Interactive Rank Simulator Drawer (when active) */}
          <AnimatePresence>
            {isSimulatorActive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300 font-bold flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                    Interactive Imperial Rank Balance Simulator
                  </span>
                  <span className="text-amber-400 font-bold">
                    Simulated Balance: {simulatedBalance.toLocaleString()} $DEMP
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="1000"
                  value={simulatedBalance}
                  onChange={(e) => setSimulatedBalance(Number(e.target.value))}
                  className="w-full h-2.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-400 border border-zinc-700"
                />
                <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                  <span className="text-zinc-400">Presets:</span>
                  {[0, 1000, 10000, 50000, 100000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSimulatedBalance(val)}
                      className={`px-2.5 py-0.5 rounded border transition-colors ${
                        simulatedBalance === val
                          ? 'bg-amber-500 text-black font-bold border-amber-400'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {val === 0 ? '0 $DEMP' : `${(val / 1000).toFixed(0)}k $DEMP`}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gamified Animated Progression Track */}
          <div className="relative pt-6 pb-2">
            {/* Visual Milestones Connector Line with Segment Labels */}
            <div className="relative h-6 w-full bg-zinc-900/90 rounded-full border border-zinc-800 overflow-hidden p-0.5 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-slate-500 via-amber-500 via-50% to-purple-500 relative"
                initial={{ width: '0%' }}
                animate={{ width: `${visualProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                {/* Shimmering Beam Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                {/* Pulsing Front Pin */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-amber-300 border-2 border-white shadow-[0_0_20px_#fbbf24] animate-ping" />
              </motion.div>
            </div>

            {/* Threshold Labels along Track */}
            <div className="flex justify-between text-[11px] font-mono text-zinc-500 px-1 mt-1.5">
              <span>0 $DEMP (Initiate)</span>
              <span>1,000 $DEMP (Vanguard)</span>
              <span>50,000 $DEMP (Overlord)</span>
            </div>

            {/* Imperial Rank Milestone Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              {IMPERIAL_RANKS.map((rank) => {
                const isAchieved = dempBalance >= rank.minDemp;
                const isCurrent = currentImperialRank.id === rank.id;
                const isSelected = selectedRankTab === rank.id;
                const RankNodeIcon = rank.icon;

                // Status indicators
                let statusBadgeText = 'LOCKED';
                let statusBadgeClass = 'bg-zinc-900 text-zinc-500 border-zinc-800';
                let indicatorDot = 'bg-zinc-600';

                if (isCurrent) {
                  statusBadgeText = 'ACTIVE RANK';
                  statusBadgeClass = 'bg-purple-600 text-white border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.5)]';
                  indicatorDot = 'bg-white animate-ping';
                } else if (isAchieved) {
                  statusBadgeText = 'UNLOCKED';
                  statusBadgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
                  indicatorDot = 'bg-emerald-400';
                } else if (nextImperialRank?.id === rank.id) {
                  statusBadgeText = 'NEXT TARGET';
                  statusBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
                  indicatorDot = 'bg-amber-400 animate-ping';
                }

                return (
                  <motion.div
                    key={rank.id}
                    whileHover={{ scale: 1.03, y: -3 }}
                    onClick={() => setSelectedRankTab(rank.id)}
                    className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden group ${
                      isCurrent
                        ? 'border-2 border-purple-500 bg-purple-950/60 shadow-[0_0_30px_rgba(168,85,247,0.35)]'
                        : isSelected
                        ? 'border-2 border-amber-500/80 bg-zinc-900/90 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                        : isAchieved
                        ? 'border-amber-500/40 bg-zinc-950/90 hover:border-amber-400/80'
                        : 'border-zinc-800/80 bg-zinc-950/80 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* Top Row: Icon + Status Pill */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`p-2.5 rounded-xl border transition-transform group-hover:scale-110 ${
                          isAchieved
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        }`}
                      >
                        <RankNodeIcon className="w-5 h-5" />
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold uppercase px-2.5 py-1 rounded-full border ${statusBadgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${indicatorDot}`} />
                        <span>{statusBadgeText}</span>
                      </span>
                    </div>

                    {/* Rank Name & Threshold */}
                    <div>
                      <div className="text-base font-display font-black text-white flex items-center gap-2">
                        <span>{rank.name}</span>
                        {isCurrent && <Crown className="w-4 h-4 text-amber-400 inline" />}
                      </div>
                      <div className="text-xs font-mono text-amber-400/90 mt-1 font-semibold">
                        {rank.minDemp === 0 ? '0 $DEMP (Entry Level)' : `${rank.minDemp.toLocaleString()}+ $DEMP`}
                      </div>
                    </div>

                    {/* Quick Perk Highlights */}
                    <div className="text-[11px] font-mono text-zinc-400 border-t border-zinc-800/70 pt-2 space-y-1">
                      {rank.perks.slice(0, 2).map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 truncate">
                          <ChevronRight className="w-3 h-3 text-purple-400 shrink-0" />
                          <span className="truncate">{p.title}</span>
                        </div>
                      ))}
                    </div>

                    {/* Selection Indicator bar */}
                    {isSelected && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-purple-500" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Shortfall Banner or Max Rank Celebration */}
          {nextImperialRank ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/60 via-amber-950/30 to-zinc-950/80 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono shadow-md">
              <div className="flex items-center gap-2.5 text-zinc-200">
                <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Hold <strong className="text-amber-400 font-bold">{remainingDemp.toLocaleString()}</strong> more $DEMP to achieve <strong className="text-white font-bold">{nextImperialRank.name}</strong> rank privileges!
                </span>
              </div>
              <span className="text-purple-300 font-bold shrink-0 bg-purple-950/80 px-3 py-1 rounded-lg border border-purple-800/50">
                Progress: {dempBalance.toLocaleString()} / {nextImperialRank.minDemp.toLocaleString()} $DEMP
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/90 via-purple-900/50 to-amber-950/90 border border-purple-500/70 text-center text-xs font-mono text-purple-200 font-black tracking-wide text-glow shadow-[0_0_25px_rgba(168,85,247,0.3)]">
              ★ CONGRATULATIONS! OVERLORD SUPREME COMMAND ACTIVE ACROSS ALL DARK EMPIRE HQ SYSTEM PROTOCOLS ★
            </div>
          )}
        </div>

        {/* Imperial Rank Privileges Tab Showcase */}
        <div className="p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800/90 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-base font-display font-bold text-white uppercase tracking-wider">
                  Imperial Rank Privileges Inspection
                </h4>
                <p className="text-xs font-mono text-zinc-400">
                  Detailed privilege breakdown for each status level
                </p>
              </div>
            </div>

            {/* Rank Selection Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {IMPERIAL_RANKS.map((r) => {
                const isSelected = selectedRankTab === r.id;
                const isAchieved = dempBalance >= r.minDemp;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRankTab(r.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all font-bold cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-purple-900/80 text-purple-200 border border-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                        : 'text-zinc-400 hover:text-white bg-zinc-900/80 border border-zinc-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isAchieved ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                    <span>{r.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Perks Showcase Card for Selected Rank */}
          {(() => {
            const activeRank = IMPERIAL_RANKS.find((r) => r.id === selectedRankTab) || IMPERIAL_RANKS[1];
            const isAchieved = dempBalance >= activeRank.minDemp;
            const RankIcon = activeRank.icon;

            return (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300">
                      <RankIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h5 className="text-lg font-display font-bold text-white flex items-center gap-2">
                        {activeRank.name} Privilege Tier
                      </h5>
                      <p className="text-xs font-mono text-zinc-400">{activeRank.description}</p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                    isAchieved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}>
                    {isAchieved ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-zinc-500" />}
                    <span>{isAchieved ? 'UNLOCKED BY YOU' : 'REQUIRES ' + activeRank.minDemp.toLocaleString() + ' $DEMP'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeRank.perks.map((perk, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                          {perk.title}
                        </span>
                        {perk.highlight && (
                          <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                            {perk.highlight}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                        {perk.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Verification Action Bar & Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800/80">
          <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
            {lastVerifiedAt && !isSimulatorActive ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Solana RPC Verification Sync: <strong className="text-zinc-200">{new Date(lastVerifiedAt).toLocaleString()}</strong>
                </span>
              </>
            ) : isSimulatorActive ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-400" />
                Simulator mode active. Click &quot;Exit Simulator&quot; to restore live on-chain wallet sync.
              </span>
            ) : (
              <span>Not synced in this session. Click RE-SYNC RPC to re-verify on-chain holdings.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="default"
              onClick={() => verifyVip(false)}
              disabled={isVerifying || !connected || isSimulatorActive}
              className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-mono text-xs w-1/2 sm:w-auto transition-all font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isVerifying ? 'animate-spin' : ''}`} />
              RE-SYNC RPC
            </Button>

            <VipVerificationModal />
          </div>
        </div>
      </div>
    </div>
  );
}
