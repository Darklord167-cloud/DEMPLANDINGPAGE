"use client";

import React from 'react';
import { useVipTier } from '@/lib/vip-context';
import { Bot, Cpu, Zap, Vote, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function VipPerksShowcase() {
  const { tier, discountPercentage } = useVipTier();

  const perksList = [
    {
      icon: <Bot className="w-6 h-6 text-primary" />,
      title: "AI Oracle Query Discount",
      description: `Enjoy ${discountPercentage}% off on all AI Oracle credits & smart prompt queries. Higher tiers receive free monthly queries automatically.`,
      actionUrl: "/oracle",
      actionText: "Use AI Oracle",
      badge: `${discountPercentage}% OFF`,
    },
    {
      icon: <Cpu className="w-6 h-6 text-blue-400" />,
      title: "High-Throughput Solana RPC Node",
      description: "Bypass mainnet public congestion using Dark Empire HQ's private dedicated Solana RPC relay endpoints for faster swap execution.",
      actionUrl: "/holdings",
      actionText: "View RPC Specs",
      badge: tier.id !== 'none' ? "PRIORITY ACTIVE" : "STANDARD",
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Whale & Alpha Market Signals",
      description: "Receive real-time automated buy/sell alert signals and liquidity pool tracking directly inside HQ Command Center.",
      actionUrl: "/command-center",
      actionText: "Open Command Center",
      badge: tier.level >= 2 ? "UNLOCKED" : "TIER 2+ REQUIRED",
    },
    {
      icon: <Vote className="w-6 h-6 text-purple-400" />,
      title: "DAO Governance Vote Multiplier",
      description: "Dark Lord & Gold members earn up to 2x voting power on ecosystem proposals, strategic investments, and treasury allocations.",
      actionUrl: "/whitepaper",
      actionText: "Read Governance Specs",
      badge: tier.level >= 3 ? `${tier.oracleMultiplier}x POWER` : "GOLD/DARK LORD",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            UNLOCKED VIP HQ PRIVILEGES
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            Active privileges dynamically updated based on your verified {tier.name} status.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {perksList.map((perk, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/80 hover:border-zinc-700/80 transition-all duration-300 flex flex-col justify-between space-y-4 backdrop-blur-md"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                  {perk.icon}
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono font-bold text-primary">
                  {perk.badge}
                </span>
              </div>
              <h4 className="text-base font-display font-bold text-white">
                {perk.title}
              </h4>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                {perk.description}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-900 flex justify-end">
              <Link href={perk.actionUrl}>
                <Button variant="ghost" size="sm" className="text-xs font-mono text-primary hover:text-white hover:bg-primary/10">
                  {perk.actionText} <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
