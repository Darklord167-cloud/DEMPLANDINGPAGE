"use client";

import { useState } from "react";
import { 
  Building2, 
  Cpu, 
  ShieldCheck, 
  Wallet, 
  Globe, 
  Rocket, 
  ArrowLeftRight, 
  Loader2 
} from "lucide-react";
import { motion } from "motion/react";

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
  const [terminalLoaded, setTerminalLoaded] = useState(false);
  const [activating, setActivating] = useState(false);

  // Initialize the terminal dynamically only when clicked
  const activateTerminal = () => {
    setActivating(true);
    setTimeout(() => {
      setTerminalLoaded(true);
      setActivating(false);
    }, 1200); // Simulated secure cryptographic tunnel initialization
  };

  return (
    <div className="min-h-screen bg-[#05010a] text-[#f5f5f5] pt-24 pb-20 px-4 font-sans selection:bg-[#b026ff]/30">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-16">
          <p className="text-[#b026ff] font-mono text-xs uppercase tracking-[0.3em] mb-3">
            {"///"} Ecosystem
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-wider mb-6">
            Empire Holdings
          </h1>
          <div className="h-0.5 w-16 bg-[#b026ff] mx-auto opacity-50" />
        </div>

        {/* COMPONENT CARDS GRID */}
        <div className="grid grid-cols-1 gap-6 mb-24">
          {HOLDINGS_DATA.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-[#0a0a0a] border border-zinc-900 rounded-2xl p-6 md:p-8 flex items-start gap-6 transition-all duration-300 ${item.glow}`}
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <IconComponent className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-2 tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* JUPITER SWAP PERFORMANCE FACADE TERMINAL */}
        <div id="swap-portal" className="border-t border-zinc-900 pt-16">
          <div className="text-center mb-10">
            <p className="text-[#b026ff] font-mono text-xs uppercase tracking-[0.3em] mb-2">
              {"///"} Liquidity Portal
            </p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white uppercase tracking-wide">
              Acquire Ecosystem Fuel
            </h2>
          </div>

          <div className="max-w-md mx-auto w-full min-h-[450px] bg-[#0a0a0a] border border-[#b026ff]/30 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(176,38,255,0.05)] relative flex flex-col">
            
            {/* Terminal Header */}
            <div className="bg-zinc-950 px-6 py-3 border-b border-zinc-900 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#b026ff]" />
                <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest">
                  Jupiter Secure Bridge // SOL - $DEMP
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Facade State (Lightweight, High-Score Optimized) */}
            {!terminalLoaded ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center my-auto">
                <div className="w-16 h-16 rounded-full bg-[#b026ff]/5 border border-[#b026ff]/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(176,38,255,0.1)]">
                  <ArrowLeftRight className="w-6 h-6 text-[#b026ff]" />
                </div>
                <h4 className="text-lg font-display font-bold text-white mb-2 uppercase">
                  Initialize Liquidity Engine
                </h4>
                <p className="text-zinc-500 text-xs font-mono max-w-xs mb-8 leading-relaxed">
                  Establishes a sandboxed communication tunnel with the Jupiter Aggregator without blocking browser assets.
                </p>
                
                <button
                  onClick={activateTerminal}
                  disabled={activating}
                  className="w-full py-4 bg-gradient-to-r from-[#8a1cce] to-[#b026ff] hover:from-[#b026ff] hover:to-[#d466ff] text-white font-display font-bold uppercase text-sm tracking-widest rounded-xl shadow-[0_0_25px_rgba(176,38,255,0.3)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {activating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Securing Link...
                    </>
                  ) : (
                    "Connect Swap Terminal"
                  )}
                </button>
              </div>
            ) : (
              /* Mounted Live State (Only loads iframe code post-click) */
              <div className="flex-1 w-full h-full min-h-[450px]">
                <iframe
                  src="https://jup.ag/swap/SOL-8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx"
                  title="Jupiter Swap Terminal"
                  className="w-full h-full min-h-[450px] border-none bg-black"
                  allow="clipboard-read; clipboard-write"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
