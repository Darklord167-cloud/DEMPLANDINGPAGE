export interface VipTierDef {
  id: 'none' | 'bronze' | 'silver' | 'gold' | 'dark_lord';
  level: number;
  levelTag: string;
  name: string;
  subtitle: string;
  minBalance: number;
  maxBalance: number | null;
  color: string;
  textColor: string;
  borderColor: string;
  bgGradient: string;
  badgeBg: string;
  glowColor: string;
  discountPercentage: number;
  feeMultiplier: number;
  oracleMultiplier: number;
  rpcClass: string;
  govPower: string;
  perks: string[];
  description: string;
  iconName: string;
}

export const DEMP_MINT_ADDRESS = "8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx";

export const VIP_TIERS: Record<string, VipTierDef> = {
  none: {
    id: 'none',
    level: 0,
    levelTag: 'LVL 0 INITIATE',
    name: 'Initiate',
    subtitle: 'Standard HQ Explorer',
    minBalance: 0,
    maxBalance: 999,
    color: '#94a3b8',
    textColor: 'text-slate-400',
    borderColor: 'border-slate-800',
    bgGradient: 'from-slate-900/60 via-zinc-900/40 to-slate-950/80',
    badgeBg: 'bg-slate-800/80 text-slate-300 border-slate-700',
    glowColor: 'rgba(148, 163, 184, 0.15)',
    discountPercentage: 0,
    feeMultiplier: 1.0,
    oracleMultiplier: 1.0,
    rpcClass: 'Public Shared (1x)',
    govPower: '1.0x Weight',
    perks: [
      'Standard Dark Empire HQ access',
      'Public token analytics & chart views',
      'Standard Jupiter swap routing',
    ],
    description: 'Connect wallet and hold at least 1,000 $DEMP to unlock VIP status.',
    iconName: 'Shield',
  },
  bronze: {
    id: 'bronze',
    level: 1,
    levelTag: 'LVL 1 OPERATIVE',
    name: 'Bronze Empire',
    subtitle: 'Tier 1 Operative',
    minBalance: 1000,
    maxBalance: 9999,
    color: '#cd7f32',
    textColor: 'text-amber-500',
    borderColor: 'border-amber-700/50',
    bgGradient: 'from-amber-950/40 via-amber-900/20 to-zinc-950/80',
    badgeBg: 'bg-amber-950/80 text-amber-400 border-amber-800/60 shadow-amber-900/20',
    glowColor: 'rgba(205, 127, 50, 0.25)',
    discountPercentage: 5,
    feeMultiplier: 0.95,
    oracleMultiplier: 1.1,
    rpcClass: 'High-Speed Relay (2x)',
    govPower: '1.0x Weight',
    perks: [
      '5% Discount on HQ Services & AI Oracle',
      'Bronze VIP verification badge on HQ profile',
      'Access to Tier 1 Discord VIP Lounge',
      'Priority RPC transaction relaying',
    ],
    description: 'Requires 1,000 $DEMP. Unlocks entry-level HQ privileges and service discounts.',
    iconName: 'Award',
  },
  silver: {
    id: 'silver',
    level: 2,
    levelTag: 'LVL 2 COMMANDER',
    name: 'Silver Sentinel',
    subtitle: 'Tier 2 Commander',
    minBalance: 10000,
    maxBalance: 49999,
    color: '#e2e8f0',
    textColor: 'text-slate-200',
    borderColor: 'border-slate-400/50',
    bgGradient: 'from-slate-800/50 via-slate-900/40 to-zinc-950/80',
    badgeBg: 'bg-slate-800/90 text-slate-100 border-slate-500/60 shadow-slate-400/20',
    glowColor: 'rgba(226, 232, 240, 0.3)',
    discountPercentage: 15,
    feeMultiplier: 0.85,
    oracleMultiplier: 1.25,
    rpcClass: 'Dedicated Priority (5x)',
    govPower: '1.25x Weight',
    perks: [
      '15% Discount on all Dark Empire HQ services',
      'Silver VIP Badge & Custom Avatar Frame',
      'Dedicated high-throughput Solana RPC node access',
      'Exclusive Whales & VIP Market Analytics feed',
      'Priority AI Oracle query queueing',
    ],
    description: 'Requires 10,000 $DEMP. Unlocks high-speed RPC routing and advanced market feeds.',
    iconName: 'Zap',
  },
  gold: {
    id: 'gold',
    level: 3,
    levelTag: 'LVL 3 ELITE',
    name: 'Gold Commander',
    subtitle: 'Tier 3 Elite',
    minBalance: 50000,
    maxBalance: 99999,
    color: '#fbbf24',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/60',
    bgGradient: 'from-yellow-950/50 via-amber-950/30 to-zinc-950/90',
    badgeBg: 'bg-yellow-950 text-yellow-300 border-yellow-500/70 shadow-yellow-500/20 shadow-lg',
    glowColor: 'rgba(251, 191, 36, 0.35)',
    discountPercentage: 30,
    feeMultiplier: 0.70,
    oracleMultiplier: 1.5,
    rpcClass: 'Ultra Low-Latency (10x)',
    govPower: '1.5x Weight',
    perks: [
      '30% Discount on HQ services & AI Oracle',
      '100 Free Monthly AI Oracle Credits',
      'Access to Automated Trading Bot Signals',
      'Direct Telegram VIP Syndicate Lounge',
      'Gold Animated Halo Badge',
    ],
    description: 'Requires 50,000 $DEMP. Elite tier with monthly free credits and automated trading signals.',
    iconName: 'Crown',
  },
  dark_lord: {
    id: 'dark_lord',
    level: 4,
    levelTag: 'LVL 4 OVERLORD SUPREME',
    name: 'Dark Lord Overlord',
    subtitle: 'Tier 4 Supreme',
    minBalance: 100000,
    maxBalance: null,
    color: '#c084fc',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/80',
    bgGradient: 'from-purple-950/60 via-violet-950/40 to-black',
    badgeBg: 'bg-purple-950/90 text-purple-300 border-purple-500/90 shadow-purple-500/30 shadow-xl',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    discountPercentage: 50,
    feeMultiplier: 0.50,
    oracleMultiplier: 2.0,
    rpcClass: 'Unlimited Dedicated Node (20x)',
    govPower: '2.0x Weight',
    perks: [
      '50% Fee Discount across all HQ services & swaps',
      '2x DAO Governance Voting Power',
      'Unlimited AI Oracle Access with zero rate limits',
      'Dark Lord Holographic VIP Badge & Profile Title',
      'Private Council Access & Early Alpha Testing',
    ],
    description: 'Requires 100,000+ $DEMP. Maximum VIP privileges, governance vote multiplier, and unlimited AI access.',
    iconName: 'Flame',
  },
};

export function getTierForBalance(balance: number): VipTierDef {
  if (balance >= 100000) return VIP_TIERS.dark_lord;
  if (balance >= 50000) return VIP_TIERS.gold;
  if (balance >= 10000) return VIP_TIERS.silver;
  if (balance >= 1000) return VIP_TIERS.bronze;
  return VIP_TIERS.none;
}

export function getNextTierInfo(balance: number): { nextTier: VipTierDef | null; needed: number; progress: number } {
  const currentTier = getTierForBalance(balance);
  if (currentTier.id === 'dark_lord') {
    return { nextTier: null, needed: 0, progress: 100 };
  }

  let nextTier: VipTierDef;
  if (currentTier.id === 'none') nextTier = VIP_TIERS.bronze;
  else if (currentTier.id === 'bronze') nextTier = VIP_TIERS.silver;
  else if (currentTier.id === 'silver') nextTier = VIP_TIERS.gold;
  else nextTier = VIP_TIERS.dark_lord;

  const currentMin = currentTier.minBalance;
  const targetMin = nextTier.minBalance;
  const needed = Math.max(0, targetMin - balance);
  const range = targetMin - currentMin;
  const currentInTier = balance - currentMin;
  const progress = Math.min(100, Math.max(0, (currentInTier / range) * 100));

  return { nextTier, needed, progress };
}
