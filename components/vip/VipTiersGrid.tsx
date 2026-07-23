"use client";

import React from 'react';
import { VIP_TIERS, VipTierDef } from '@/lib/vip-tiers';
import { useVipTier } from '@/lib/vip-context';
import { VipBadge } from '@/components/vip/VipBadge';
import { Check, Shield, Award, Zap, Crown, Flame, ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function VipTiersGrid() {
  const { tier: currentTier, dempBalance } = useVipTier();

  const tiersList = Object.values(VIP_TIERS);

  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'dark_lord':
        return <Flame className="w-6 h-6 text-purple-400" />;
      case 'gold':
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 'silver':
        return <Zap className="w-6 h-6 text-slate-200" />;
      case 'bronze':
        return <Award className="w-6 h-6 text-amber-500" />;
      default:
        return <Shield className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h2 className="text-3xl md:text-4xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-primary">
          DARK EMPIRE VIP TIER SYSTEM
        </h2>
        <p className="text-zinc-400 text-sm md:text-base font-mono">
          Hold $DEMP tokens in your Solana wallet to unlock exclusive privileges, discounted service fees, high-speed RPC routing, and AI Oracle power.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {tiersList.map((t: VipTierDef) => {
          const isActive = currentTier.id === t.id;
          const isUnlocked = dempBalance >= t.minBalance;

          return (
            <div
              key={t.id}
              className={cn(
                'relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 backdrop-blur-xl',
                isActive
                  ? 'border-2 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black shadow-2xl scale-[1.03] z-20'
                  : 'border-zinc-800/80 bg-zinc-950/70 hover:border-zinc-700 hover:bg-zinc-900/50'
              )}
              style={{
                borderColor: isActive ? t.color : undefined,
                boxShadow: isActive ? `0 0 25px ${t.glowColor}` : undefined,
              }}
            >
              {/* Active Badge Marker */}
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-black font-mono font-bold text-[10px] uppercase tracking-wider shadow-md">
                  YOUR CURRENT TIER
                </div>
              )}

              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                  <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                    {getTierIcon(t.id)}
                  </div>
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    {t.discountPercentage}% DISCOUNT
                  </span>
                </div>

                {/* Title & Min balance */}
                <div className="space-y-1">
                  <h4 className={cn('text-lg font-display font-extrabold', t.textColor)}>
                    {t.name}
                  </h4>
                  <p className="text-[11px] font-mono text-zinc-400">
                    {t.minBalance === 0 ? 'Free Access' : `Hold ${t.minBalance.toLocaleString()}+ $DEMP`}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 font-sans leading-relaxed min-h-[36px]">
                  {t.description}
                </p>

                {/* Perks Checklist */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                  <span className="text-[11px] font-mono text-zinc-300 font-semibold uppercase tracking-wider block">
                    Tier Perks:
                  </span>
                  <ul className="space-y-1.5">
                    {t.perks.map((perk: string, idx: number) => (
                      <li key={idx} className="flex items-start text-xs text-zinc-300 leading-tight">
                        <Check className="w-3.5 h-3.5 mr-1.5 text-primary shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Footer Action */}
              <div className="pt-6 mt-4 border-t border-zinc-800/60">
                {isActive ? (
                  <Button
                    disabled
                    size="sm"
                    className="w-full bg-zinc-800 text-zinc-400 font-mono text-xs cursor-default"
                  >
                    ACTIVE TIER
                  </Button>
                ) : isUnlocked ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-primary/50 text-primary font-mono text-xs hover:bg-primary/10"
                  >
                    UNLOCKED
                  </Button>
                ) : (
                  <Link href="/token" className="w-full block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-zinc-800 hover:border-amber-500/50 text-zinc-400 hover:text-amber-400 font-mono text-xs flex items-center justify-center gap-1"
                    >
                      GET $DEMP <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
