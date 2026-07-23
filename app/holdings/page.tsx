"use client";

import { 
  Building2, 
  Cpu, 
  ShieldCheck, 
  Wallet, 
  Globe, 
  Rocket,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import { JupiterSwapWidget } from "@/components/JupiterSwapWidget";

const HOLDINGS_DATA = [
  {
    title: "Empire Capital",
    desc: "Strategic investment arm focused on high-yield DeFi protocols and real-world asset tokenization.",
    icon: Building2,
    glow: "hover:border-amber-500/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.05)]",
  },
  {
    title: "Dark Labs",
    desc: "R&D division building proprietary trading algorithms and blockchain infrastructure.",
    icon: Cpu,
    glow: "hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.05)]",
  },
  {
    title: "Shadow Security",
    desc: "Smart contract auditing and operational security consulting for partner projects.",
    icon: ShieldCheck,
    glow: "hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)]",
  },
  {
    title: "Empire Vaults",
    desc: "Non-custodial yield aggregators with auto-compounding strategies.",
    icon: Wallet,
    glow: "hover:border-[#b026ff]/40 hover:shadow-[0_0_30px_rgba(176,38,255,0.08)]",
  },
  {
    title: "DE: Network",
    desc: "Decentralized private communication layer for DAO governance.",
    icon: Globe,
    glow: "hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)]",
  },
  {
    title: "Launchpad X",
    desc: "Incubator and IDO platform for vetted ecosystem projects.",
    icon: Rocket,
    glow: "hover:border-rose-500/30 hover:shadow-[0_0_30px_rgba(244,63,94,0.05)]",
  },
];

export default function HoldingsPage() {
  return (
    <div className="min-h-screen bg-[#05010a] text-[#f5f5f5] pt-24 pb-20 px-4 font-sans selection:bg-[#b026ff]/30">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* HEADER SECTION */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-xs uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            DARK EMPIRE ECOSYSTEM CAPABILITY
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-wider text-glow">
            Empire Holdings
          </h1>
          <p className="text-zinc-400 font-mono text-sm max-w-2xl mx-auto leading-relaxed">
            Strategic divisions powering the Dark Empire infrastructure, capital deployment, algorithmic trading, and smart security contracts.
          </p>
          <div className="h-0.5 w-16 bg-[#b026ff] mx-auto opacity-50" />
        </div>

        {/* COMPONENT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {HOLDINGS_DATA.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-[#0a0a0d] border border-zinc-800/80 rounded-2xl p-6 md:p-8 flex items-start gap-5 transition-all duration-300 ${item.glow}`}
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 shadow-inner">
                  <IconComponent className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2 tracking-wide text-glow">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* JUPITER SWAP PERFORMANCE CONTAINER */}
        <div id="swap-portal" className="border-t border-zinc-800/80 pt-16 space-y-8">
          <div className="text-center space-y-2">
            <p className="text-[#b026ff] font-mono text-xs uppercase tracking-[0.3em] text-glow">
              {"///"} On-Chain Liquidity Engine
            </p>
            <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-wide text-glow">
              Acquire Ecosystem Fuel ($DEMP)
            </h2>
            <p className="text-zinc-400 font-mono text-xs max-w-lg mx-auto">
              Direct DEX router for $DEMP holdings. Instant liquidity through Jupiter&apos;s Solana aggregator.
            </p>
          </div>

          <div className="max-w-4xl mx-auto w-full">
            <JupiterSwapWidget />
          </div>
        </div>

      </div>
    </div>
  );
}
