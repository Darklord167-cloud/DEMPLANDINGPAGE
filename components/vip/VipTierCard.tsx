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
  BarChart3,
  Award,
  Layers,
  Sparkle,
  ArrowUpRight,
  HelpCircle,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import Link from 'next/link';

// Imperial Ranks Mapping with explicit status level indicators & rich visuals
export interface ImperialRank {
  id: 'initiate' | 'vanguard' | 'overlord';
  levelCode: string;
  name: 'Initiate' | 'Vanguard' | 'Overlord';
  title: string;
  minDemp: number;
  badgeText: string;
  badgeClass: string;
  glowColor: string;
  accentColor: string;
  borderColor: string;
  bgGradient: string;
  cardGlow: string;
  description: string;
  statusIndicator: {
    label: string;
    bgClass: string;
    dotClass: string;
  };
  perks: { title: string; desc: string; highlight?: string; icon: React.ComponentType<{ className?: string }> }[];
  icon: React.ComponentType<{ className?: string }>;
}

export const IMPERIAL_RANKS: ImperialRank[] = [
  {
    id: 'initiate',
    levelCode: 'LVL 0 - 9',
    name: 'Initiate',
    title: 'HQ Initiate Explorer',
    minDemp: 0,
    badgeText: 'INITIATE • ENTRY RANK',
    badgeClass:
      'border-slate-700 bg-slate-900/90 text-slate-300 shadow-[0_0_12px_rgba(148,163,184,0.2)]',
    glowColor: 'rgba(148, 163, 184, 0.4)',
    accentColor: '#94a3b8',
    borderColor: 'border-slate-700/80',
    bgGradient: 'from-slate-950/90 via-zinc-950/80 to-slate-950/90',
    cardGlow: '0 0 20px rgba(148, 163, 184, 0.15)',
    description: 'Standard Dark Empire explorer. Connect wallet & hold $DEMP to advance on-chain rank hierarchy.',
    statusIndicator: {
      label: 'ENTRY LEVEL',
      bgClass: 'bg-slate-900/90 text-slate-400 border-slate-700',
      dotClass: 'bg-slate-500',
    },
    perks: [
      { title: 'Standard Routing', desc: 'Public Solana DEX swap routing engine', icon: Compass },
      { title: 'Public Telemetry', desc: 'Real-time chart & market telemetry', icon: BarChart3 },
      { title: 'Basic Oracle Access', desc: 'Standard AI market query capabilities', icon: Shield },
    ],
    icon: Shield,
  },
  {
    id: 'vanguard',
    levelCode: 'LVL 10 - 49',
    name: 'Vanguard',
    title: 'Vanguard Tactical Operative',
    minDemp: 1000,
    badgeText: 'VANGUARD • TIER 1 OPERATIVE',
    badgeClass:
      'border-amber-500/70 bg-gradient-to-r from-amber-950/90 via-yellow-950/70 to-amber-950/90 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    accentColor: '#f59e0b',
    borderColor: 'border-amber-500/60',
    bgGradient: 'from-amber-950/80 via-yellow-950/40 to-amber-950/80',
    cardGlow: '0 0 30px rgba(245, 158, 11, 0.3)',
    description: 'Elite HQ Operative. Requires 1,000+ $DEMP for service fee discounts & priority Solana RPC nodes.',
    statusIndicator: {
      label: 'TACTICAL OPERATIVE',
      bgClass: 'bg-amber-950/90 text-amber-300 border-amber-500/50',
      dotClass: 'bg-amber-400 animate-ping',
    },
    perks: [
      { title: '5%-15% Service Fee Waiver', desc: 'Applies automatically across all HQ services & AI queries', highlight: '5-15% OFF', icon: Coins },
      { title: 'Priority Solana RPC Nodes', desc: 'High-speed dedicated transaction relay endpoints', highlight: 'PRIORITY', icon: Zap },
      { title: 'VIP Discord Lounge', desc: 'Access to verified holder discussion channels & alpha', highlight: 'PRIVATE', icon: Swords },
    ],
    icon: Swords,
  },
  {
    id: 'overlord',
    levelCode: 'LVL 50+ SUPREME',
    name: 'Overlord',
    title: 'Overlord Supreme Commander',
    minDemp: 50000,
    badgeText: 'OVERLORD • SUPREME COMMANDER',
    badgeClass:
      'border-purple-400/80 bg-gradient-to-r from-purple-950/90 via-amber-950/50 to-purple-950/90 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.5)]',
    glowColor: 'rgba(168, 85, 247, 0.7)',
    accentColor: '#c084fc',
    borderColor: 'border-purple-500/80',
    bgGradient: 'from-purple-950/90 via-violet-950/60 to-purple-950/90',
    cardGlow: '0 0 40px rgba(168, 85, 247, 0.45)',
    description: 'Supreme Commander tier. Hold 50,000+ $DEMP for maximum fee waivers & unlimited AI Oracle power.',
    statusIndicator: {
      label: 'SUPREME COMMAND',
      bgClass: 'bg-purple-950/90 text-purple-200 border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.4)]',
      dotClass: 'bg-purple-400 animate-pulse',
    },
    perks: [
      { title: '30%-50% HQ Fee Waiver', desc: 'Maximum service discount tier in HQ ecosystem', highlight: '30-50% OFF', icon: Award },
      { title: 'Unlimited AI Oracle GPU', desc: 'Zero rate-limit access with priority GPU allocation', highlight: 'UNLIMITED', icon: Flame },
      { title: '2x DAO Governance Power', desc: 'Double voting weight on all ecosystem proposals', highlight: '2X VOTE POWER', icon: Crown },
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

        {/* ==================================================================== */}
        {/* IMPERIAL RANK PROGRESSION SECTION (ENHANCED VISUAL HIERARCHY & DYNAMICS) */}
        {/* ==================================================================== */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-b from-zinc-950/95 via-[#0d0918] to-zinc-950/95 border border-purple-900/70 space-y-6 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)]">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Trophy className="w-6 h-6 animate-bounce text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-wider text-glow">
                    IMPERIAL RANK PROGRESSION
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    ON-CHAIN PROTOCOL
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-400 mt-0.5">
                  On-Chain Rank Hierarchy, Status Indicators & Privilege Acceleration
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
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>{isSimulatorActive ? 'Exit Simulator' : 'Test Rank Simulator'}</span>
              </Button>

              {nextImperialRank ? (
                <div className="flex items-center gap-2 bg-amber-950/80 border border-amber-500/50 px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  <span className="text-xs font-mono text-zinc-300">Target Rank:</span>
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
                className="p-5 rounded-2xl bg-purple-950/40 border border-purple-500/50 space-y-4 shadow-xl"
              >
                <div className="flex items-center justify-between text-xs font-mono flex-wrap gap-2">
                  <span className="text-purple-300 font-bold flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                    Interactive Imperial Rank Balance Simulator
                  </span>
                  <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-xl border border-purple-500/30">
                    <span className="text-zinc-400">Simulated Balance:</span>
                    <span className="text-amber-400 font-extrabold text-sm">
                      {simulatedBalance.toLocaleString()} $DEMP
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="500"
                  value={simulatedBalance}
                  onChange={(e) => setSimulatedBalance(Number(e.target.value))}
                  className="w-full h-3 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-400 border border-purple-900/60"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                  <span className="text-zinc-400">Quick Test Milestones:</span>
                  <div className="flex flex-wrap gap-2">
                    {[0, 1000, 5000, 10000, 50000, 100000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setSimulatedBalance(val)}
                        className={`px-3 py-1 rounded-xl border transition-all cursor-pointer font-bold ${
                          simulatedBalance === val
                            ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                            : 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        {val === 0 ? 'Free (0)' : `${(val / 1000).toFixed(0)}k $DEMP`}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gamified Animated Progression Track */}
          <div className="relative pt-6 pb-2">
            {/* Visual Milestones Connector Line with Segment Labels */}
            <div className="relative h-7 w-full bg-zinc-900/90 rounded-full border border-zinc-800 overflow-hidden p-0.5 shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-slate-500 via-amber-500 via-50% to-purple-500 relative"
                initial={{ width: '0%' }}
                animate={{ width: `${visualProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                {/* Shimmering Beam Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                {/* Pulsing Front Pin */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-amber-300 border-2 border-white shadow-[0_0_20px_#fbbf24] animate-ping" />
              </motion.div>
            </div>

            {/* Threshold Labels along Track */}
            <div className="flex justify-between text-[11px] font-mono text-zinc-400 px-1 mt-2 font-semibold">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-500" /> 0 $DEMP (Initiate)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> 1,000 $DEMP (Vanguard)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-400" /> 50,000 $DEMP (Overlord)
              </span>
            </div>

            {/* Imperial Rank Milestone Status Cards (Enhanced Visual Hierarchy) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
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
                  statusBadgeClass = 'bg-purple-600 text-white border-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.6)] font-black';
                  indicatorDot = 'bg-white animate-ping';
                } else if (isAchieved) {
                  statusBadgeText = 'UNLOCKED';
                  statusBadgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold';
                  indicatorDot = 'bg-emerald-400';
                } else if (nextImperialRank?.id === rank.id) {
                  statusBadgeText = 'NEXT TARGET';
                  statusBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse font-bold';
                  indicatorDot = 'bg-amber-400 animate-ping';
                }

                return (
                  <motion.div
                    key={rank.id}
                    whileHover={{ scale: 1.03, y: -4 }}
                    onClick={() => setSelectedRankTab(rank.id)}
                    className={`cursor-pointer p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden group shadow-lg ${
                      isCurrent
                        ? 'border-2 border-purple-500 bg-gradient-to-b from-purple-950/80 via-[#130b24] to-zinc-950 shadow-[0_0_35px_rgba(168,85,247,0.4)] scale-[1.02]'
                        : isSelected
                        ? 'border-2 border-amber-500/80 bg-zinc-900/90 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                        : isAchieved
                        ? 'border-amber-500/40 bg-zinc-950/90 hover:border-amber-400/80'
                        : 'border-zinc-800/80 bg-zinc-950/80 opacity-75 hover:opacity-100'
                    }`}
                    style={{
                      boxShadow: isCurrent ? rank.cardGlow : undefined,
                    }}
                  >
                    {/* Level Code Tag Header */}
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-black/80 border border-zinc-700 text-zinc-300">
                        {rank.levelCode}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase px-3 py-1 rounded-full border ${statusBadgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${indicatorDot}`} />
                        <span>{statusBadgeText}</span>
                      </span>
                    </div>

                    {/* Rank Icon + Title */}
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3.5 rounded-2xl border transition-transform group-hover:scale-110 shrink-0 ${
                          isAchieved
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        }`}
                      >
                        <RankNodeIcon className="w-7 h-7" />
                      </div>

                      <div>
                        <div className="text-xl font-display font-black text-white flex items-center gap-2">
                          <span>{rank.name}</span>
                          {isCurrent && <Crown className="w-4 h-4 text-amber-400 inline" />}
                        </div>
                        <div className="text-xs font-mono text-amber-400/90 font-bold mt-0.5">
                          {rank.minDemp === 0 ? '0 $DEMP (Entry)' : `${rank.minDemp.toLocaleString()}+ $DEMP`}
                        </div>
                      </div>
                    </div>

                    {/* Rank Description */}
                    <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                      {rank.description}
                    </p>

                    {/* Quick Perk Highlights */}
                    <div className="text-[11px] font-mono text-zinc-300 border-t border-zinc-800/80 pt-3 space-y-1.5">
                      {rank.perks.map((p, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 truncate">
                            <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span className="truncate">{p.title}</span>
                          </span>
                          {p.highlight && (
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 shrink-0">
                              {p.highlight}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Active/Selected indicator bar */}
                    {isSelected && (
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-purple-500 to-amber-400 animate-pulse" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Shortfall Banner or Max Rank Celebration */}
          {nextImperialRank ? (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-amber-950/40 to-zinc-950/90 border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono shadow-xl">
              <div className="flex items-center gap-3 text-zinc-200">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">
                    Rank Advancement Opportunity
                  </span>
                  <span className="text-zinc-300">
                    Hold <strong className="text-amber-400 font-extrabold">{remainingDemp.toLocaleString()}</strong> more $DEMP to advance to <strong className="text-white font-black">{nextImperialRank.name}</strong> rank privileges!
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-purple-300 font-mono font-bold text-xs bg-purple-950/90 px-3.5 py-1.5 rounded-xl border border-purple-800/60">
                  {dempBalance.toLocaleString()} / {nextImperialRank.minDemp.toLocaleString()} $DEMP
                </span>

                <Button asChild size="sm" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono text-xs font-black rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <Link href="#token">
                    <span>SWAP $DEMP NOW</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/90 via-purple-900/60 to-amber-950/90 border border-purple-500/80 text-center text-xs font-mono text-purple-200 font-black tracking-wider text-glow shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              ★ CONGRATULATIONS! OVERLORD SUPREME COMMAND ACTIVE ACROSS ALL DARK EMPIRE HQ SYSTEM PROTOCOLS ★
            </div>
          )}
        </div>

        {/* Imperial Rank Privileges Deep Inspection Tab Showcase */}
        <div className="p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800/90 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-500/50 text-purple-300">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-lg font-display font-black text-white uppercase tracking-wider">
                  Imperial Rank Privileges Inspection
                </h4>
                <p className="text-xs font-mono text-zinc-400">
                  Select a status level tab to inspect detailed privileges & requirements
                </p>
              </div>
            </div>

            {/* Rank Selection Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {IMPERIAL_RANKS.map((r) => {
                const isSelected = selectedRankTab === r.id;
                const isAchieved = dempBalance >= r.minDemp;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRankTab(r.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono transition-all font-bold cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-purple-900/90 text-purple-200 border-2 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                        : 'text-zinc-400 hover:text-white bg-zinc-900/80 border border-zinc-800'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isAchieved ? 'bg-emerald-400 animate-ping' : 'bg-zinc-600'}`} />
                    <span>{r.name} ({r.levelCode.split(' ')[0]})</span>
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-purple-950/90 border border-purple-500/50 text-purple-300 shadow-lg">
                      <RankIcon className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-xl font-display font-black text-white">
                          {activeRank.name} Privilege Matrix
                        </h5>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 uppercase">
                          {activeRank.levelCode}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-zinc-300 mt-1">{activeRank.description}</p>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono font-black uppercase ${
                    isAchieved
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                  }`}>
                    {isAchieved ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-zinc-500" />}
                    <span>{isAchieved ? 'UNLOCKED BY YOUR WALLET' : 'REQUIRES ' + activeRank.minDemp.toLocaleString() + ' $DEMP'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activeRank.perks.map((perk, i) => {
                    const PerkIcon = perk.icon || Shield;
                    return (
                      <div
                        key={i}
                        className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between space-y-3 group shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-xl bg-zinc-800/80 border border-zinc-700 text-purple-400 group-hover:scale-110 transition-transform">
                            <PerkIcon className="w-4 h-4" />
                          </div>
                          {perk.highlight && (
                            <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                              {perk.highlight}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-mono font-bold text-white flex items-center gap-1.5 pt-1">
                          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                          {perk.title}
                        </span>
                        <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                          {perk.desc}
                        </p>
                      </div>
                    );
                  })}
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
