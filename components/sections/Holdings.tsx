"use client";

import { motion } from "motion/react";
import { Building2, Cpu, ShieldCheck, Wallet, Globe, Rocket } from "lucide-react";

const holdings = [
  {
    icon: Building2,
    title: "Empire Capital",
    description: "Strategic investment arm focused on high-yield DeFi protocols and real-world asset tokenization.",
    color: "from-amber-500/20 to-orange-600/5",
    border: "border-amber-500/20"
  },
  {
    icon: Cpu,
    title: "Dark Labs",
    description: "R&D division building proprietary trading algorithms and blockchain infrastructure.",
    color: "from-cyan-500/20 to-blue-600/5",
    border: "border-cyan-500/20"
  },
  {
    icon: ShieldCheck,
    title: "Shadow Security",
    description: "Smart contract auditing and operational security consulting for partner projects.",
    color: "from-emerald-500/20 to-green-600/5",
    border: "border-emerald-500/20"
  },
  {
    icon: Wallet,
    title: "Empire Vaults",
    description: "Non-custodial yield aggregators with auto-compounding strategies.",
    color: "from-purple-500/20 to-violet-600/5",
    border: "border-purple-500/20"
  },
  {
    icon: Globe,
    title: "DE: Network",
    description: "Decentralized private communication layer for DAO governance.",
    color: "from-pink-500/20 to-rose-600/5",
    border: "border-pink-500/20"
  },
  {
    icon: Rocket,
    title: "Launchpad X",
    description: "Incubator and IDO platform for vetted ecosystem projects.",
    color: "from-red-500/20 to-orange-600/5",
    border: "border-red-500/20"
  }
];

export function Holdings() {
  return (
    <section id="holdings" className="py-24 bg-background relative overflow-hidden">
      <div className="container px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-primary font-mono tracking-widest text-sm mb-4">{"///"} ECOSYSTEM</h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold text-white">
            EMPIRE HOLDINGS
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {holdings.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`group relative p-8 rounded-xl border ${item.border} bg-gradient-to-br ${item.color} backdrop-blur-sm overflow-hidden`}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
              
              <div className="relative z-10">
                <div className="h-12 w-12 rounded-lg bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                
                <h4 className="text-xl font-heading font-bold text-white mb-3 tracking-wide">
                  {item.title}
                </h4>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 blur-2xl group-hover:bg-white/10 transition-colors rounded-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
