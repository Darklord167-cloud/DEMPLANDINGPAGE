"use client";

import { motion } from "motion/react";

export default function RoadmapPage() {
  const steps = [
    {
      quarter: "Q1 2026",
      title: "Empire Foundation",
      items: ["Token Launch", "HQ Mainframe Deployment", "Initial LP Lock"],
    },
    {
      quarter: "Q2 2026",
      title: "Expansion",
      items: ["Dark Swap Beta", "Staking Contracts", "Partnership Announcements"],
    },
    {
      quarter: "Q3 2026",
      title: "The Treasury",
      items: ["DAO Governance Live", "First Holding Acquisition", "Tier 1 CEX Listing"],
    },
    {
      quarter: "Q4 2026",
      title: "Global Domination",
      items: ["Cross-Chain Integration", "Dark Empire SDK", "Classified Project X"],
    },
  ];

  return (
    <div className="min-h-screen py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      <div className="container px-6 max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-primary font-mono tracking-widest text-sm mb-4">{"///"} STRATEGIC DIRECTIVES</h2>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-white uppercase">
            Empire Roadmap
          </h1>
        </div>

        <div className="space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative pl-8 md:pl-0"
            >
              <div className="md:grid md:grid-cols-5 items-center gap-8">
                <div className="md:col-span-1 md:text-right mb-4 md:mb-0">
                  <span className="text-primary font-mono font-bold text-xl">{step.quarter}</span>
                </div>
                
                {/* Timeline connector */}
                <div className="absolute left-0 md:left-1/5 top-2 bottom-[-48px] w-px bg-white/10 hidden md:block" />
                <div className="absolute left-0 md:left-[20%] top-3 w-4 h-4 -translate-x-1.5 rounded-full bg-background border-2 border-primary hidden md:block" />
                
                <div className="md:col-span-4 p-8 rounded-xl bg-white/5 border border-white/10 relative">
                  <h3 className="text-2xl font-heading font-bold text-white mb-4">{step.title}</h3>
                  <ul className="space-y-3">
                    {step.items.map((item, i) => (
                      <li key={i} className="flex items-start text-muted-foreground">
                        <span className="text-primary mr-2">›</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
