"use client";

import { motion } from "motion/react";
import { Shield, Server, Cpu, Globe, ArrowRight, Zap, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AboutSection() {
  const highlights = [
    {
      icon: Shield,
      title: "Sovereign Web3 Identity",
      description: "Dark Empire Lords LLC operates decentralized infrastructure built for maximum privacy, self-custody, and digital sovereignty on the Solana network.",
      tag: "CORE INFRASTRUCTURE"
    },
    {
      icon: Server,
      title: "Edge Gateway Operations",
      description: "Hybrid Web2.5 infrastructure leveraging Google Cloud & Azure nodes to deliver sub-second latency, 99.99% uptime, and reliable on-chain RPC routing.",
      tag: "HIGH FREQUENCY NODES"
    },
    {
      icon: Cpu,
      title: "Ecosystem Utility Suite",
      description: "From Jupiter DEX liquidity routing and staking vaults to DAO governance and payment gateway integrations for global merchants.",
      tag: "SUITE & UTILITY"
    }
  ];

  const specs = [
    { label: "REGISTERED ENTITY", value: "Dark Empire Lords LLC", icon: ShieldCheck, accent: "text-purple-400" },
    { label: "PRIMARY NETWORK", value: "Solana (SPL Token)", icon: Globe, accent: "text-emerald-400" },
    { label: "CONSENSUS MECHANISM", value: "Proof of History (PoH)", icon: Cpu, accent: "text-cyan-400" },
    { label: "SMART CONTRACT STATUS", value: "Verified & Audited", icon: CheckCircle2, accent: "text-amber-400" },
  ];

  return (
    <section id="about" className="py-24 bg-[#07070b] relative overflow-hidden border-b border-purple-900/20">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="container px-6 mx-auto relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 font-mono text-xs mb-4 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <Zap className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>{"///"} MISSION & ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white tracking-wide uppercase mb-6 drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            ABOUT DARK EMPIRE LORDS
          </h2>
          <p className="text-zinc-300 text-base md:text-lg leading-relaxed font-sans">
            Founded to pioneer sovereign digital infrastructure, Dark Empire Lords LLC merges cutting-edge cryptographic protocols with enterprise-grade cloud systems. We empower users with true financial autonomy, secure Web3 tools, and $DEMP ecosystem utility.
          </p>
        </motion.div>

        {/* Feature Cards Grid with Motion Hover */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8, scale: 1.02 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.12 }}
                className="group relative p-1 rounded-2xl bg-gradient-to-b from-purple-900/30 via-zinc-900/40 to-zinc-950/80 hover:from-purple-500/50 hover:to-purple-950/80 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_35px_rgba(168,85,247,0.25)]"
              >
                <div className="h-full bg-[#0a0a10]/95 backdrop-blur-xl p-8 rounded-xl border border-purple-900/30 flex flex-col justify-between group-hover:border-purple-500/50 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <motion.div 
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                      >
                        <Icon className="w-6 h-6" />
                      </motion.div>
                      <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest px-2.5 py-1 rounded bg-purple-950/60 border border-purple-800/40">
                        {item.tag}
                      </span>
                    </div>

                    <h3 className="text-xl font-heading font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-zinc-800/60 flex items-center text-xs font-mono text-purple-400 group-hover:text-purple-300">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400 shrink-0" />
                    <span>Operational & Active</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Platform Specifications Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-6 md:p-8 rounded-2xl border border-purple-900/50 bg-zinc-950/90 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.8)]"
        >
          <div className="flex items-center gap-2 mb-6 border-b border-purple-900/30 pb-4">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <h4 className="text-xs font-mono font-bold text-purple-300 uppercase tracking-widest">
              PLATFORM SPECIFICATIONS & VERIFICATION MATRIX
            </h4>
          </div>

          {/* Clean Grid Layout with Defined Borders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {specs.map((spec, idx) => {
              const SpecIcon = spec.icon;
              return (
                <motion.div
                  key={spec.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.08 }}
                  className="p-5 rounded-xl border border-purple-900/40 bg-purple-950/20 hover:bg-purple-950/40 hover:border-purple-500/50 transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.4)] flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">
                        {spec.label}
                      </p>
                      <SpecIcon className={`w-4 h-4 ${spec.accent} opacity-80 group-hover:opacity-100 transition-opacity`} />
                    </div>
                    <p className="text-sm md:text-base font-bold text-white font-mono tracking-wide">
                      {spec.value}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-purple-900/20 flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 group-hover:text-purple-300 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>VERIFIED PARAMETER</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer bar inside container */}
          <div className="pt-4 border-t border-purple-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-purple-400 shrink-0" />
              <p className="text-xs text-zinc-400 font-mono text-center md:text-left">
                Official Headquarter: <strong className="text-white select-all">darkempirelords.com</strong>
              </p>
            </div>

            <Button size="sm" variant="outline" asChild className="border-purple-500/40 text-purple-300 hover:bg-purple-950/60 font-mono text-xs cursor-pointer">
              <Link href="/whitepaper" className="flex items-center gap-2">
                <span>Read Architecture Whitepaper</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

