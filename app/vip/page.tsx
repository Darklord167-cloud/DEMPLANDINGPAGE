import { Metadata } from 'next';
import { VipTierCard } from '@/components/vip/VipTierCard';
import { VipTiersGrid } from '@/components/vip/VipTiersGrid';
import { VipPerksShowcase } from '@/components/vip/VipPerksShowcase';
import { JupiterSwapWidget } from '@/components/JupiterSwapWidget';
import { ShieldCheck, Sparkles, ArrowDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'VIP System | Dark Empire HQ',
  description: 'Connect your Solana wallet and verify $DEMP token balance via Server-side Solana RPC to claim Bronze, Silver, Gold, or Dark Lord VIP status and exclusive HQ privileges.',
};

export default function VipPage() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Glow Effects background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Page Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            OFFICIAL DARK EMPIRE HQ PROTOCOL
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight text-white">
            TIERED VIP <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-purple-400">HUB</span>
          </h1>
          <p className="text-zinc-400 font-mono text-sm sm:text-base leading-relaxed">
            Verify your $DEMP token balance with server-side Solana RPC nodes to securely claim your VIP tier, unlock fee discounts, priority RPC routing, and AI Oracle power.
          </p>
        </div>

        {/* User VIP Profile Dashboard Card */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-primary" />
            YOUR VERIFIED VIP STATUS
          </div>
          <VipTierCard />
        </section>

        {/* All Tiers Grid */}
        <section className="pt-6">
          <VipTiersGrid />
        </section>

        {/* VIP Perks & Utilities Showcase */}
        <section className="pt-6">
          <VipPerksShowcase />
        </section>

        {/* Quick Swap & Top-Up Section */}
        <section className="pt-8 border-t border-zinc-800/80 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl font-display font-bold text-white flex items-center justify-center gap-2">
              UPGRADE YOUR VIP TIER
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Swap any Solana token directly into $DEMP using Jupiter&apos;s optimized DEX aggregator to instantly reach the next VIP tier.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <JupiterSwapWidget />
          </div>
        </section>
      </div>
    </div>
  );
}
