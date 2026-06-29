"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section id="overview" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - using a placeholder CSS gradient structure with blur for the cyberpunk effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-black/40 z-10" />
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="w-full h-full object-cover bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/demp-banner.svg')" }}
        />
      </div>

      {/* Content */}
      <div className="container relative z-20 px-6 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-primary-foreground tracking-widest uppercase">
              System Online // V.3.0.1
            </span>
          </div>

          <motion.h1 
            animate={{ 
              filter: [
                "drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))", 
                "drop-shadow(0 0 30px rgba(168, 85, 247, 0.7))", 
                "drop-shadow(0 0 10px rgba(168, 85, 247, 0.3))"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="font-display text-5xl md:text-7xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-6 tracking-tight"
          >
            DARK EMPIRE
          </motion.h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-light mb-10 leading-relaxed">
            The central command for the next generation of digital sovereignty. 
            Verification, Holdings, and Future-Tech all under one banner.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" asChild className="h-14 px-8 text-lg font-heading font-bold tracking-wider bg-primary text-white shadow-[0_0_40px_-10px_var(--color-primary)] border border-primary/50 relative overflow-hidden group hover:shadow-[0_0_60px_-5px_var(--color-primary)] hover:border-primary transition-all duration-300">
              <a href="https://darkempirelords.com" target="_blank" rel="noreferrer">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-out" />
                <span className="relative z-10 group-hover:scale-105 transition-transform duration-300 inline-block">ENTER HQ</span>
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg font-heading font-bold tracking-wider border-primary/30 text-white shadow-[0_0_20px_-10px_var(--color-primary)] group hover:bg-primary/10 hover:border-primary hover:shadow-[0_0_30px_-5px_var(--color-primary)] transition-all duration-300">
              <a href="#token" className="flex items-center">
                <span className="group-hover:scale-105 transition-transform duration-300 inline-block">VERIFY ASSETS</span>
                <ArrowRight className="ml-2 h-5 w-5 text-primary group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/30"
      >
        <ChevronDown className="h-8 w-8 animate-bounce" />
      </motion.div>
    </section>
  );
}
