"use client";

import React, { useState } from 'react';
import { useVipTier } from '@/lib/vip-context';
import { VIP_TIERS } from '@/lib/vip-tiers';
import { Bot, Cpu, Zap, Vote, ShieldCheck, ArrowRight, ExternalLink, Sparkles, CheckCircle2, Lock, Flame, Shield, Award, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function VipPerksShowcase() {
  const { tier, discountPercentage } = useVipTier();
  const [activeTab, setActiveTab] = useState<string>('all');

  const perksList = [
    {
      id: "oracle",
      icon: <Bot className="w-6 h-6 text-purple-400" />,
      title: "AI Oracle Query Discount & GPU Priority",
      description: `Enjoy up to 50% off on all AI Oracle credits & smart prompt queries. Higher tiers receive free monthly queries automatically with zero rate limits.`,
      actionUrl: "/oracle",
      actionText: "Open AI Oracle",
      badge: `${discountPercentage}% OFF`,
      minTier: "Bronze (1k $DEMP)",
      requiredLevel: 1,
    },
    {
      id: "rpc",
      icon: <Cpu className="w-6 h-6 text-blue-400" />,
      title: "High-Throughput Dedicated Solana RPC Node",
      description: "Bypass mainnet public congestion using Dark Empire HQ's private dedicated Solana RPC relay endpoints for faster swap execution & lower drop rates.",
      actionUrl: "/token",
      actionText: "View RPC Specs",
      badge: tier.level >= 2 ? "DEDICATED ACTIVE" : "HIGH-SPEED RELAY",
      minTier: "Silver (10k $DEMP)",
      requiredLevel: 2,
    },
    {
      id: "whales",
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Whale & Alpha Market Alert Signals",
      description: "Receive real-time automated buy/sell alert signals and liquidity pool tracking directly inside HQ Command Center.",
      actionUrl: "/token",
      actionText: "Open Market Feeds",
      badge: tier.level >= 2 ? "UNLOCKED" : "TIER 2+ REQUIRED",
      minTier: "Silver (10k $DEMP)",
      requiredLevel: 2,
    },
    {
      id: "gov",
      icon: <Vote className="w-6 h-6 text-purple-400" />,
      title: "DAO Governance Vote Multiplier",
      description: "Dark Lord & Gold members earn up to 2x voting power on ecosystem proposals, strategic investments, and treasury allocations.",
      actionUrl: "/token",
      actionText: "Read Governance Specs",
      badge: tier.level >= 3 ? `${tier.oracleMultiplier}x POWER` : "GOLD/DARK LORD",
      minTier: "Gold (50k $DEMP)",
      requiredLevel: 3,
    },
  ];

  const filteredPerks = perksList.filter((perk) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unlocked') return tier.level >= perk.requiredLevel;
    if (activeTab === 'locked') return tier.level < perk.requiredLevel;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-2xl font-display font-black text-white flex items-center gap-2 uppercase tracking-wide">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
            UNLOCKED VIP HQ PRIVILEGES & UTILITIES
          </h3>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Active privileges dynamically updated based on your verified <strong className="text-purple-300">{tier.name}</strong> status level.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 self-start md:self-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-purple-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All Privileges
          </button>
          <button
            onClick={() => setActiveTab('unlocked')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'unlocked' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Unlocked ({perksList.filter(p => tier.level >= p.requiredLevel).length})
          </button>
          <button
            onClick={() => setActiveTab('locked')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'locked' ? 'bg-amber-600 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Locked ({perksList.filter(p => tier.level < p.requiredLevel).length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredPerks.map((perk) => {
          const isUnlocked = tier.level >= perk.requiredLevel;
          return (
            <div
              key={perk.id}
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-4 backdrop-blur-md relative overflow-hidden group shadow-lg ${
                isUnlocked
                  ? 'border-purple-900/60 bg-gradient-to-b from-zinc-950 via-[#0d0918] to-zinc-950 hover:border-purple-500/60'
                  : 'border-zinc-800/80 bg-zinc-950/80 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 group-hover:scale-110 transition-transform shadow-inner">
                    {perk.icon}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-mono font-black border ${
                    isUnlocked
                      ? 'bg-purple-950/90 text-purple-200 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                  }`}>
                    {perk.badge}
                  </span>
                </div>
                <h4 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  {perk.title}
                </h4>
                <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                  {perk.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                  {isUnlocked ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active Tier Perk
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-400" /> Min: {perk.minTier}
                    </span>
                  )}
                </span>

                <Link href={perk.actionUrl}>
                  <Button variant="ghost" size="sm" className="text-xs font-mono text-purple-300 hover:text-white hover:bg-purple-950/50 font-bold">
                    {perk.actionText} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
