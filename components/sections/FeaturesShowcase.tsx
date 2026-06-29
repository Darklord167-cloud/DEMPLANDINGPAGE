"use client";

import { motion } from "motion/react";
import { Coins, Database, Zap, Lock, RefreshCw, BarChart3 } from "lucide-react";

export function FeaturesShowcase() {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      <div className="container px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-primary font-mono tracking-widest text-sm mb-4">{"///"} DUAL-TOKEN ARCHITECTURE</h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold text-white">
            EMPIRE ECONOMICS
          </h3>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            The Dark Empire ecosystem runs on a meticulously designed dual-token model, 
            balancing stable store-of-value with high-velocity utility.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* DarkCoin Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative p-1 rounded-2xl bg-gradient-to-br from-white/10 to-transparent group"
          >
            <div className="absolute inset-0 bg-white/5 blur-xl rounded-2xl group-hover:bg-white/10 transition-colors" />
            <div className="relative h-full bg-black/80 backdrop-blur-xl p-8 rounded-xl border border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Database className="text-white w-6 h-6" />
                </div>
                <h4 className="text-3xl font-display font-bold text-white">DarkCoin</h4>
              </div>
              <p className="text-white/70 mb-8 leading-relaxed text-lg">
                The foundational reserve asset of the Empire. Designed as a deflationary store of value with high security constraints.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-white/50" />
                  <span className="text-white/90">Institutional-grade Treasury Reserve</span>
                </li>
                <li className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-white/50" />
                  <span className="text-white/90">Algorithmic Deflationary Mechanics</span>
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheckIcon className="w-5 h-5 text-white/50" />
                  <span className="text-white/90">Governance Weight Multiplier</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* $DEMP Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative p-1 rounded-2xl bg-gradient-to-br from-primary/50 to-transparent group"
          >
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl group-hover:bg-primary/30 transition-colors" />
            <div className="relative h-full bg-black/80 backdrop-blur-xl p-8 rounded-xl border border-primary/20 shadow-[inset_0_0_30px_rgba(168,85,247,0.05)]">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  <Zap className="text-primary w-6 h-6" />
                </div>
                <h4 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-white">$DEMP Token</h4>
              </div>
              <p className="text-white/70 mb-8 leading-relaxed text-lg">
                The high-velocity utility and operational token. Powers transactions, platform fees, and daily interactions within the HQ.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Coins className="w-5 h-5 text-primary" />
                  <span className="text-white/90">Ecosystem Transaction Currency</span>
                </li>
                <li className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-primary" />
                  <span className="text-white/90">Frictionless Cross-Platform Liquidity</span>
                </li>
                <li className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-white/90">Access to Premium API & Integrations</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Simple local component for icon
function ShieldCheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
