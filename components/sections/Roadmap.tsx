"use client";

import { motion } from "motion/react";
import { CheckCircle2, Clock, Sparkles, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Roadmap() {
  const steps = [
    {
      quarter: "Q1 2026",
      phase: "PHASE I",
      title: "Empire Foundation",
      status: "COMPLETED",
      progress: 100,
      badgeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      items: [
        { name: "Token Generation Event & Solana Contract Deployment", done: true },
        { name: "HQ Mainframe Portal & Verification System Launch", done: true },
        { name: "Initial DEX Liquidity Locking (Raydium & Orca)", done: true },
        { name: "Solscan & GeckoTerminal Contract Verification", done: true },
      ],
    },
    {
      quarter: "Q2 2026",
      phase: "PHASE II",
      title: "Ecosystem Expansion",
      status: "IN PROGRESS",
      progress: 85,
      badgeColor: "border-purple-500/30 bg-purple-500/10 text-purple-300 animate-pulse",
      items: [
        { name: "Jupiter DEX Liquidity Bridge & Instant Swap Integration", done: true },
        { name: "Public JSON Supply Endpoint API for CoinGecko & CMC", done: true },
        { name: "Dark Staking Vaults Beta Testing", done: true },
        { name: "Web3 Merchant Payment Plugin (Squarespace & Shopify)", done: false },
      ],
    },
    {
      quarter: "Q3 2026",
      phase: "PHASE III",
      title: "Treasury & DAO Dominion",
      status: "UPCOMING",
      progress: 25,
      badgeColor: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
      items: [
        { name: "DAO On-Chain Governance Voting Activation", done: false },
        { name: "Class-A Empire Holdings Strategic Asset Acquisitions", done: false },
        { name: "High-Frequency Edge Gateway RPC Nodes Deployment", done: false },
        { name: "Tier-1 Centralized Exchange (CEX) Application & Listings", done: false },
      ],
    },
    {
      quarter: "Q4 2026",
      phase: "PHASE IV",
      title: "Global Domination",
      status: "UPCOMING",
      progress: 0,
      badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-300",
      items: [
        { name: "Cross-Chain EVM & Move Bridge Protocol", done: false },
        { name: "Dark Empire Proprietary Mobile Stealth Wallet", done: false },
        { name: "Dark Empire Enterprise SDK for Developers", done: false },
        { name: "Classified Sovereign Infrastructure Project X", done: false },
      ],
    },
  ];

  return (
    <section id="roadmap" className="py-24 bg-[#09090f] relative overflow-hidden border-t border-purple-900/30">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container px-6 mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 font-mono text-xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{"///"} STRATEGIC MILESTONES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-wide uppercase mb-4">
            PROTOCOL ROADMAP
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            Our multi-stage blueprint for scaling sovereign digital infrastructure, ecosystem utility, and market liquidity.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.quarter}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-1 rounded-2xl bg-gradient-to-b from-purple-900/30 via-zinc-900/40 to-zinc-950/80 hover:from-purple-500/40 transition-all duration-300"
            >
              <div className="h-full bg-[#0b0b12]/95 backdrop-blur-xl p-6 md:p-8 rounded-xl border border-purple-900/30 flex flex-col justify-between">
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-purple-400">
                      <span>{step.phase}</span>
                      <span>•</span>
                      <span className="text-white font-bold">{step.quarter}</span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${step.badgeColor}`}>
                      {step.status}
                    </span>
                  </div>

                  <h3 className="text-2xl font-heading font-bold text-white mb-4">
                    {step.title}
                  </h3>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-6">
                    <div className="flex justify-between text-[11px] font-mono text-zinc-400">
                      <span>Completion Status</span>
                      <span className="text-purple-300 font-bold">{step.progress}%</span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-1000"
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestone Items */}
                  <ul className="space-y-3 font-sans text-sm">
                    {step.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        {item.done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Clock className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                        )}
                        <span className={item.done ? "text-zinc-200" : "text-zinc-500"}>
                          {item.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-500">
                  <span>Target Execution: {step.quarter}</span>
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button size="lg" variant="outline" asChild className="h-12 px-8 border-purple-500/40 text-purple-300 hover:bg-purple-950/60 font-heading font-bold">
            <Link href="/roadmap" className="flex items-center gap-2">
              <span>EXPLORE FULL INTERACTIVE ROADMAP</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}
