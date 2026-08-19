"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Copy, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  ExternalLink, 
  FileText, 
  ChevronDown,
  Sparkles,
  Lock,
  Globe,
  Layers
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { DEMP_TOKEN_MINT } from "@/lib/solana/config";

export const Hero = React.memo(function Hero() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const contractAddress = DEMP_TOKEN_MINT;

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    toast({
      title: "Contract Address Copied!",
      description: "Solana SPL contract address copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="overview" className="relative min-h-[90vh] lg:min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 bg-[#030306]">
      {/* Dynamic Background Glows & Particle Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/40 via-[#030306]/95 to-[#030306] z-10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-15 z-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[750px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] z-10" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] z-10" />
        
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          className="w-full h-full object-cover bg-cover bg-center opacity-25 mix-blend-screen"
          style={{ backgroundImage: "url('/assets/demp-banner.svg')" }}
        />
      </div>

      {/* Content Container */}
      <div className="container mx-auto relative z-20 px-4 sm:px-6 text-center max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {/* Live System Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-purple-500/40 bg-purple-950/60 backdrop-blur-md mb-8 shadow-[0_0_25px_rgba(168,85,247,0.25)]">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <span className="text-xs font-mono text-purple-200 tracking-widest uppercase font-bold">
              SYSTEM ONLINE // V.3.0.1 • SOLANA MAINNET-BETA
            </span>
          </div>

          {/* Main Imperial Title */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight break-words mb-6 drop-shadow-[0_0_40px_rgba(168,85,247,0.45)]">
            DARK EMPIRE
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-zinc-300 font-sans mb-8 leading-relaxed">
            The Central Command for Next-Generation Digital Sovereignty. Sovereign Web3 Infrastructure, <strong className="text-purple-300 font-bold">$DEMP Token Utility</strong>, Edge Gateways, and Protocol Holdings.
          </p>

          {/* Contract Address Card Above The Fold */}
          <div className="max-w-2xl mx-auto mb-8 p-3 rounded-2xl border border-purple-900/60 bg-black/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.9)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 px-2 text-left w-full sm:w-auto overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="overflow-hidden text-left min-w-0">
                <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                  OFFICIAL SOLANA CONTRACT ($DEMP)
                </p>
                <code className="text-xs sm:text-sm font-mono text-purple-300 font-bold truncate block select-all">
                  {contractAddress}
                </code>
              </div>
            </div>

            <Button
              onClick={handleCopyContract}
              size="sm"
              className="w-full sm:w-auto h-11 px-5 bg-purple-950/90 hover:bg-purple-900 text-purple-200 border border-purple-500/50 text-xs font-mono font-bold shrink-0 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2 text-purple-400" />
                  <span>COPY CONTRACT</span>
                </>
              )}
            </Button>
          </div>

          {/* External Verification Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10 text-xs font-mono text-zinc-400">
            <a 
              href={`https://solscan.io/token/${contractAddress}`}
              target="_blank" 
              rel="noreferrer"
              className="hover:text-purple-300 transition-colors flex items-center gap-1 bg-zinc-950/70 border border-zinc-800/80 px-3 py-1.5 rounded-lg"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>Solscan Explorer</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
            <a 
              href={`https://dexscreener.com/solana/${contractAddress}`}
              target="_blank" 
              rel="noreferrer"
              className="hover:text-purple-300 transition-colors flex items-center gap-1 bg-zinc-950/70 border border-zinc-800/80 px-3 py-1.5 rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>DexScreener Live Chart</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
            <a 
              href={`https://birdeye.so/token/${contractAddress}?chain=solana`}
              target="_blank" 
              rel="noreferrer"
              className="hover:text-purple-300 transition-colors flex items-center gap-1 bg-zinc-950/70 border border-zinc-800/80 px-3 py-1.5 rounded-lg"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Birdeye Indexer</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>

          {/* Primary CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto min-h-[52px] h-14 px-8 text-base md:text-lg font-heading font-bold tracking-wider bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_45px_rgba(168,85,247,0.55)] border border-purple-400/50 transition-all duration-300 rounded-2xl cursor-pointer"
            >
              <a href="#token" className="flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-amber-300" />
                <span>BUY $DEMP (JUPITER)</span>
              </a>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto min-h-[52px] h-14 px-8 text-base md:text-lg font-heading font-bold tracking-wider border-purple-500/50 text-white hover:bg-purple-950/70 transition-all duration-300 rounded-2xl cursor-pointer"
            >
              <Link href="/command-center" className="flex items-center justify-center gap-2">
                <span>ENTER COMMAND CENTER</span>
                <ArrowRight className="w-5 h-5 text-purple-400" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              asChild
              className="w-full sm:w-auto min-h-[52px] h-14 px-6 text-base font-heading font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-2xl cursor-pointer"
            >
              <Link href="/whitepaper" className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span>WHITEPAPER</span>
              </Link>
            </Button>
          </div>

          {/* Verified Token Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto pt-6 border-t border-purple-900/30">
            <div className="p-4 rounded-xl border border-purple-900/40 bg-purple-950/20 text-center backdrop-blur-sm">
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">CIRCULATING SUPPLY</p>
              <p className="text-sm md:text-base font-bold text-white font-mono mt-1">1,000,000,000</p>
            </div>
            <div className="p-4 rounded-xl border border-purple-900/40 bg-purple-950/20 text-center backdrop-blur-sm">
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">BUY / SELL TAX</p>
              <p className="text-sm md:text-base font-bold text-emerald-400 font-mono mt-1">0% (ZERO TAX)</p>
            </div>
            <div className="p-4 rounded-xl border border-purple-900/40 bg-purple-950/20 text-center backdrop-blur-sm">
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">LIQUIDITY STATUS</p>
              <p className="text-sm md:text-base font-bold text-cyan-400 font-mono mt-1 flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5" /> 100% LOCKED
              </p>
            </div>
            <div className="p-4 rounded-xl border border-purple-900/40 bg-purple-950/20 text-center backdrop-blur-sm">
              <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">SECURITY AUDIT</p>
              <p className="text-sm md:text-base font-bold text-purple-300 font-mono mt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> VERIFIED (SOL)
              </p>
            </div>
          </div>

        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-purple-400/60"
      >
        <ChevronDown className="h-7 w-7 animate-bounce" />
      </motion.div>
    </section>
  );
});

