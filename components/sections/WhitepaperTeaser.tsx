"use client";

import { motion } from "motion/react";
import { FileText, ArrowRight, ShieldCheck, Cpu, Coins, Lock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function WhitepaperTeaser() {
  const contractAddress = "8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx";

  const keyPoints = [
    {
      title: "Solana Anchor Architecture",
      desc: "Smart contracts written in Rust using Anchor framework, providing memory safety and sub-second execution.",
      icon: Cpu,
    },
    {
      title: "Dual-Token Economics",
      desc: "DarkCoin as store-of-value reserve combined with high-velocity $DEMP operational token.",
      icon: Coins,
    },
    {
      title: "Liquidity Locking & Audits",
      desc: "Fully locked liquidity pools and continuous security monitoring via GeckoTerminal and Solscan.",
      icon: Lock,
    },
  ];

  return (
    <section className="py-24 bg-[#050508] relative overflow-hidden border-t border-purple-900/30">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container px-6 mx-auto relative z-10">
        <div className="max-w-5xl mx-auto rounded-3xl border border-purple-900/50 bg-gradient-to-b from-[#0e0e1a]/95 to-[#06060c]/98 p-8 md:p-12 backdrop-blur-2xl shadow-[0_0_50px_rgba(168,85,247,0.1)]">
          
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/60 text-purple-300 font-mono text-xs">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>OFFICIAL DOCUMENTATION // V1.0.0</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-wide uppercase leading-tight">
                THE $DEMP WHITEPAPER
              </h2>

              <p className="text-zinc-300 text-base md:text-lg leading-relaxed">
                Discover the technical framework, tokenomics distribution, and strategic roadmap driving the Dark Empire sovereign Web3 ecosystem on Solana.
              </p>

              <div className="space-y-4 pt-2">
                {keyPoints.map((point) => {
                  const Icon = point.icon;
                  return (
                    <div key={point.title} className="flex items-start gap-3.5 p-3 rounded-xl border border-zinc-800/80 bg-zinc-950/60">
                      <div className="w-9 h-9 rounded-lg bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white font-heading">{point.title}</h4>
                        <p className="text-xs text-zinc-400 mt-0.5">{point.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button size="lg" asChild className="h-13 px-8 text-base font-heading font-bold tracking-wider bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                  <Link href="/whitepaper" className="flex items-center gap-2">
                    <span>READ FULL WHITEPAPER</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                <Button size="lg" variant="outline" asChild className="h-13 px-6 text-base font-heading font-bold border-purple-500/30 text-white hover:bg-purple-950/60">
                  <a href={`https://solscan.io/token/${contractAddress}`} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                    <span>VERIFY ON SOLSCAN</span>
                    <ExternalLink className="w-4 h-4 text-purple-400" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Right Column: Tokenomics Breakdown Visual Card */}
            <div className="lg:col-span-5 bg-black/60 border border-purple-900/40 p-6 md:p-8 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                <h3 className="text-lg font-heading font-bold text-white uppercase tracking-wider">
                  Tokenomics Summary
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                  1B MAX SUPPLY
                </span>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-zinc-300">DEX & Liquidity Pools</span>
                    <span className="text-purple-400 font-bold">40%</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "40%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-zinc-300">Ecosystem & Staking Rewards</span>
                    <span className="text-cyan-400 font-bold">30%</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: "30%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-zinc-300">Protocol Development Fund</span>
                    <span className="text-amber-400 font-bold">15%</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: "15%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-zinc-300">Core Team & Treasury (Vested)</span>
                    <span className="text-emerald-400 font-bold">15%</span>
                  </div>
                  <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: "15%" }} />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-950/30 flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400">Buy / Sell Tax:</span>
                <span className="text-emerald-400 font-bold text-sm">0% (ZERO TAX)</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
