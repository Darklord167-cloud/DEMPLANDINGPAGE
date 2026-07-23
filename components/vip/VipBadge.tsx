"use client";

import React from 'react';
import { VipTierDef, VIP_TIERS } from '@/lib/vip-tiers';
import { Shield, Award, Zap, Crown, Flame, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VipBadgeProps {
  tier?: VipTierDef | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showVerifiedIcon?: boolean;
  className?: string;
}

export function VipBadge({
  tier = VIP_TIERS.none,
  size = 'md',
  showIcon = true,
  showVerifiedIcon = false,
  className = '',
}: VipBadgeProps) {
  const currentTier: VipTierDef = typeof tier === 'string' ? VIP_TIERS[tier] || VIP_TIERS.none : tier;

  const renderIcon = () => {
    if (!showIcon) return null;
    const iconProps = {
      className: cn(
        size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4',
        'mr-1.5 inline-block shrink-0'
      ),
    };

    switch (currentTier.id) {
      case 'dark_lord':
        return <Flame {...iconProps} className={cn(iconProps.className, 'text-purple-400 animate-pulse')} />;
      case 'gold':
        return <Crown {...iconProps} className={cn(iconProps.className, 'text-yellow-400')} />;
      case 'silver':
        return <Zap {...iconProps} className={cn(iconProps.className, 'text-slate-200')} />;
      case 'bronze':
        return <Award {...iconProps} className={cn(iconProps.className, 'text-amber-500')} />;
      default:
        return <Shield {...iconProps} className={cn(iconProps.className, 'text-slate-400')} />;
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-mono font-medium',
    md: 'px-3 py-1 text-xs md:text-sm font-mono font-semibold',
    lg: 'px-4 py-1.5 text-sm md:text-base font-mono font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-all duration-300 backdrop-blur-md shadow-sm',
        currentTier.badgeBg,
        sizeClasses[size],
        className
      )}
      style={{
        boxShadow: currentTier.id !== 'none' ? `0 0 12px ${currentTier.glowColor}` : undefined,
      }}
    >
      {renderIcon()}
      <span>{currentTier.name}</span>
      {showVerifiedIcon && (
        <span title="Server-side Solana RPC Verified">
          <CheckCircle2 className="w-3.5 h-3.5 ml-1.5 text-emerald-400 inline-block" />
        </span>
      )}
    </span>
  );
}
