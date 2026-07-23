"use client";

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { toast } from 'sonner';

// Imperial Ranks Mapping
export interface ImperialRank {
  id: 'initiate' | 'vanguard' | 'overlord';
  name: 'Initiate' | 'Vanguard' | 'Overlord';
  minDemp: number;
  badgeText: string;
  badgeClass: string;
  glowColor: string;
  description: string;
  perks: string[];
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
    description: 'Standard Dark Empire explorer tier. Connect wallet to begin rank progression.',
    perks: ['Standard HQ DEX Swap Routing', 'Public Token Analytics', 'Basic Oracle Query Access'],
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
    description: 'Elite HQ Operative tier. Hold 1,000+ $DEMP for service discounts & priority nodes.',
    perks: ['5%-15% HQ Fee Discounts', 'High-Speed Priority Solana RPC Node', 'Access to VIP Discord Lounge'],
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
    description: 'Supreme Commander tier. Hold 50,000+ $DEMP for maximum privileges & unlimited AI Oracle power.',
    perks: ['30%-50% HQ Fee Discounts', 'Unlimited AI Oracle & Alpha Market Signals', '2x DAO Governance Voting Power'],
    icon: Crown,
  },
];

export function VipTierCard() {
  const { publicKey, connected } = useWallet();
  const {
    tier,
    dempBalance,
    isSignedVerified,
    lastVerifiedAt,
    verifyVip,
    isVerifying,
  } = useVipTier();

  const [copied, setCopied] = useState(false);
  const [selectedRankTab, setSelectedRankTab] = useState<'initiate' | 'vanguard' | 'overlord'>('vanguard');

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

  // Determine current Imperial Rank based on $DEMP balance
  const currentImperialRank =
    dempBalance >= 50000
      ? IMPERIAL_RANKS[2]
      : dempBalance >= 1000
      ? IMPERIAL_RANKS[1]
      : IMPERIAL_RANKS[0];

  const nextImperialRank =
    dempBalance < 1000
      ? IMPERIAL_RANKS[1]
      : dempBalance < 50000
      ? IMPERIAL_RANKS[2]
      : null;

  // Multi-tier visually scaled progress bar (0% -> Initiate (0), 50% -> Vanguard (1K), 100% -> Overlord (50K))
  let visualProgress = 0;
  if (dempBalance >= 50000) {
    visualProgress = 100;
  } else if (dempBalance >= 1000) {
    const seg = (dempBalance - 1000) / (50000 - 1000);
    visualProgress = 50 + Math.min(1, Math.max(0, seg)) * 50;
  } else {
    const seg = dempBalance / 1000;
    visualProgress = Math.min(1, Math.max(0, seg)) * 50;
  }

  // Progress percentage toward the next immediate rank
  let nextRankProgress = 100;
  let remainingDemp = 0;
  if (nextImperialRank) {
    if (nextImperialRank.id === 'vanguard') {
      remainingDemp = Math.max(0, 1000 - dempBalance);
      nextRankProgress = Math.min(100, Math.max(0, (dempBalance / 1000) * 100));
    } else {
      remainingDemp = Math.max(0, 50000 - dempBalance);
      nextRankProgress = Math.min(100, Math.max(0, ((dempBalance - 1000) / 49000) * 100));
    }
  }

  // Computed Gamified Level / Power Rating
  const userLevel = dempBalance > 0 ? Math.floor(Math.sqrt(dempBalance / 10)) + 1 : 1;
  const CurrentRankIcon = currentImperialRank.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-[#09090d]/90 p-6 md:p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_35px_rgba(168,85,247,0.15)] transition-all duration-500">
      {/* Background Ambient Glows & Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Outer Glow Outline reflecting active VIP Tier */}
      <div
        className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-500"
        style={{
          boxShadow: tier.id !== 'none' ? `inset 0 0 30px ${tier.glowColor}` : undefined,
          border: tier.id !== 'none' ? `1px solid ${tier.color}33` : undefined,
        }}
      />

      <div className="relative z-10 space-y-8">
        {/* Header Row: Title, Power Rating & Badges */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-zinc-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="text-xs font-mono tracking-widest text-purple-400 uppercase font-bold text-glow">
                IMPERIAL VIP PROTOCOL • LEVEL {userLevel} OPERATIVE
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-black text-white flex items-center gap-3 tracking-tight text-glow">
              {tier.name}
            </h2>
            <p className="text-sm text-zinc-400 font-mono flex items-center gap-2">
              <span>{tier.subtitle}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400/90 font-semibold">{currentImperialRank.badgeText}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Amber Gold Imperial Rank Badge */}
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-extrabold border transition-all duration-300 cursor-default ${currentImperialRank.badgeClass}`}
            >
              <CurrentRankIcon className="w-4 h-4" />
              {currentImperialRank.badgeText}
            </motion.span>

            {/* Standard VIP Tier Badge */}
            <VipBadge tier={tier} size="lg" showIcon showVerifiedIcon={isSignedVerified} />
          </div>
        </div>

        {/* Balance, Wallet & Perks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Verified $DEMP Holdings Box */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-purple-900/30 backdrop-blur-md space-y-2 hover:border-purple-500/50 transition-all duration-300 shadow-inner group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 uppercase font-semibold">
                <Coins className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                VERIFIED $DEMP HOLDINGS
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40">
                Solana RPC
              </span>
            </div>
            <div className="text-3xl font-mono font-extrabold text-white tracking-tight text-glow flex items-baseline gap-2">
              {dempBalance.toLocaleString()}
              <span className="text-xs text-purple-400 font-bold">$DEMP</span>
            </div>
            <p className="text-xs text-zinc-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {dempBalance >= 1000 ? 'VIP Status Active' : 'Hold 1,000 $DEMP for Vanguard'}
            </p>
          </div>

          {/* Connected Account Box */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-blue-900/30 backdrop-blur-md space-y-2 hover:border-blue-500/50 transition-all duration-300 shadow-inner group">
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
                  Active On-Chain Session
                </span>
              ) : (
                <span className="text-amber-400 font-medium">Please Connect Wallet</span>
              )}
            </div>
          </div>

          {/* Service Discount Box */}
          <div className="p-5 rounded-2xl bg-zinc-950/80 border border-amber-900/30 backdrop-blur-md space-y-2 hover:border-amber-500/50 transition-all duration-300 shadow-inner group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5 uppercase font-semibold">
                <Lock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                HQ SERVICE PRIVILEGE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40">
                Active Tier
              </span>
            </div>
            <div className="text-3xl font-mono font-extrabold text-amber-400 tracking-tight flex items-baseline gap-2">
              {tier.discountPercentage}% OFF
              <span className="text-xs text-zinc-400 font-normal">All Fees</span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Applies to AI Oracle & DEX Transactions
            </p>
          </div>
        </div>

        {/* Gamified Imperial Rank Progression Section */}
        <div className="p-6 rounded-2xl bg-zinc-950/90 border border-purple-900/50 space-y-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.9)]">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
              <h3 className="text-base font-mono font-bold text-white uppercase tracking-wider text-glow">
                Imperial Rank Progression
              </h3>
            </div>

            {nextImperialRank ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-zinc-400">Next Milestone:</span>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-800/60">
                  {nextRankProgress.toFixed(1)}% to {nextImperialRank.name}
                </span>
              </div>
            ) : (
              <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-500/50 text-glow">
                ★ MAX RANK OVERLORD SUPREME UNLOCKED ★
              </span>
            )}
          </div>

          {/* Gamified Animated Track & Milestones */}
          <div className="relative pt-6 pb-4">
            {/* Background Track */}
            <div className="relative h-4 w-full bg-zinc-900/90 rounded-full border border-zinc-800/90 overflow-hidden p-0.5">
              {/* Animated Glowing Progress Bar Fill */}
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-slate-600 via-amber-500 to-purple-500 relative"
                initial={{ width: '0%' }}
                animate={{ width: `${visualProgress}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              >
                {/* Shimmering Beam Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />

                {/* Pulsing Knob at the end of progress */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full bg-amber-300 border-2 border-white shadow-[0_0_12px_#fbbf24] animate-ping" />
              </motion.div>
            </div>

            {/* Imperial Rank Milestone Nodes along the Track */}
            <div className="grid grid-cols-3 gap-2 mt-6">
              {IMPERIAL_RANKS.map((rank) => {
                const isAchieved = dempBalance >= rank.minDemp;
                const isCurrent = currentImperialRank.id === rank.id;
                const RankNodeIcon = rank.icon;

                return (
                  <motion.div
                    key={rank.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedRankTab(rank.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between space-y-2 ${
                      isCurrent
                        ? 'border-purple-500/80 bg-purple-950/40 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                        : isAchieved
                        ? 'border-amber-500/40 bg-zinc-900/80'
                        : 'border-zinc-800/60 bg-zinc-950/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isAchieved
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        <RankNodeIcon className="w-4 h-4" />
                      </div>
                      {isAchieved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-zinc-500" />
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-mono font-bold text-white flex items-center gap-1">
                        {rank.name}
                        {isCurrent && (
                          <span className="text-[10px] text-purple-400 font-normal">(Current)</span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        {rank.minDemp.toLocaleString()} $DEMP
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Remaining Requirement or Max Rank Celebration Banner */}
          {nextImperialRank ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-amber-950/20 to-zinc-950/60 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-zinc-300">
                <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Hold <strong className="text-amber-400 font-bold">{remainingDemp.toLocaleString()}</strong> more $DEMP to unlock <strong className="text-white">{nextImperialRank.name}</strong> rank!
                </span>
              </div>
              <span className="text-purple-300 font-semibold shrink-0">
                Current: {dempBalance.toLocaleString()} / {nextImperialRank.minDemp.toLocaleString()} $DEMP
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/80 via-purple-900/40 to-amber-950/80 border border-purple-500/60 text-center text-xs font-mono text-purple-200 font-bold tracking-wide text-glow">
              ★ CONGRATULATIONS! OVERLORD SUPREME COMMAND ACTIVE ACROSS ALL DARK EMPIRE HQ SYSTEM PROTOCOLS ★
            </div>
          )}
        </div>

        {/* Rank Perks Preview Tab Showcase */}
        <div className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Imperial Rank Privileges
            </span>
            <div className="flex items-center gap-1.5">
              {IMPERIAL_RANKS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRankTab(r.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                    selectedRankTab === r.id
                      ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60'
                  }`}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Perks list for selected rank */}
          {(() => {
            const activeRank = IMPERIAL_RANKS.find((r) => r.id === selectedRankTab) || IMPERIAL_RANKS[1];
            return (
              <div className="space-y-3">
                <p className="text-xs font-mono text-zinc-400">{activeRank.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {activeRank.perks.map((perk, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-start gap-2 text-xs font-mono text-zinc-300"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Verification Action Bar & Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-zinc-800/80">
          <div className="text-xs font-mono text-zinc-400 flex items-center gap-2">
            {lastVerifiedAt ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Last Solana RPC sync: <strong className="text-zinc-200">{new Date(lastVerifiedAt).toLocaleString()}</strong>
                </span>
              </>
            ) : (
              <span>Not synced in this session. Click RE-SYNC to verify on-chain holdings.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="default"
              onClick={() => verifyVip(false)}
              disabled={isVerifying || !connected}
              className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-mono text-xs w-1/2 sm:w-auto transition-all"
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
