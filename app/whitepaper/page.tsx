"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Target, 
  ShieldCheck, 
  Coins, 
  Zap, 
  Download, 
  FileText, 
  Copy, 
  CheckCircle, 
  Layers, 
  ExternalLink,
  BookOpen,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import { DEMP_TOKEN_MINT } from "@/lib/config/public";

export default function WhitepaperPage() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const contractAddress = DEMP_TOKEN_MINT;

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    toast({
      title: "Contract Address Copied",
      description: "Solana SPL contract copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    { id: "exec-summary", title: "Executive Summary" },
    { id: "vision-security", title: "Vision & Core Security" },
    { id: "introduction", title: "1. Introduction" },
    { id: "token-utility", title: "2. The $DEMP Token & Utility" },
    { id: "tokenomics", title: "3. Tokenomics Architecture" },
    { id: "tech-stack", title: "4. Solana Architecture & Anchor" },
    { id: "roadmap-phase", title: "5. Multi-Phase Directive" },
    { id: "conclusion", title: "6. Sovereign Conclusion" },
  ];

  const handleDownloadSpec = () => {
    toast({
      title: "Whitepaper Exported",
      description: "Dark Empire Whitepaper v1.0.0 is saved for offline viewing.",
    });
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#040407] text-zinc-100 pt-24 pb-20 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
        
        {/* Top Header Navigation */}
        <div className="mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-purple-900/30 pb-6">
          <div>
            <Button variant="ghost" asChild className="mb-4 hover:bg-white/5 text-zinc-400 hover:text-white font-mono text-xs p-0">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4 text-purple-400" /> Back to HQ Mainframe
              </Link>
            </Button>

            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-widest mb-1">
              <BookOpen className="w-4 h-4" />
              <span>CLASSIFIED WHITE PAPER // REV 1.0.0</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-black tracking-wider text-white uppercase drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              $DEMP Technical Whitepaper
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleCopyContract}
              variant="outline"
              size="sm"
              className="h-10 px-4 border-purple-500/40 text-purple-300 hover:bg-purple-950/60 font-mono text-xs"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              <span>Copy Contract</span>
            </Button>

            <Button
              onClick={handleDownloadSpec}
              size="sm"
              className="h-10 px-4 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              <Download className="w-4 h-4 mr-2" />
              <span>Export PDF / Print</span>
            </Button>
          </div>
        </div>

        {/* Content Layout: Left Table of Contents Sidebar + Right Main Document */}
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Table of Contents Sticky Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 p-5 rounded-2xl border border-purple-900/40 bg-zinc-950/80 backdrop-blur-xl shadow-xl space-y-4">
              <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-bold border-b border-purple-900/30 pb-2">
                Table of Contents
              </p>
              <nav className="space-y-1 font-mono text-xs">
                {sections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="flex items-center justify-between p-2 rounded-lg text-zinc-400 hover:text-purple-300 hover:bg-purple-950/50 transition-colors"
                  >
                    <span className="truncate">{sec.title}</span>
                    <ChevronRight className="w-3 h-3 shrink-0 text-purple-500" />
                  </a>
                ))}
              </nav>

              <div className="pt-4 border-t border-purple-900/30">
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                  Contract Standard
                </p>
                <p className="text-xs font-mono font-bold text-white">Solana SPL Token</p>
                <code className="text-[10px] font-mono text-purple-400 block truncate mt-1 select-all">
                  {contractAddress}
                </code>
              </div>
            </div>
          </aside>

          {/* Main Whitepaper Document Body */}
          <main className="lg:col-span-9 space-y-12">
            
            {/* Executive Summary Card */}
            <div id="exec-summary" className="p-8 rounded-2xl border border-purple-500/40 bg-purple-950/20 backdrop-blur-xl shadow-[0_0_35px_rgba(168,85,247,0.12)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-display font-bold text-white uppercase tracking-wider">
                  Executive Summary
                </h2>
              </div>
              <p className="text-zinc-300 text-base md:text-lg leading-relaxed font-sans">
                Dark Empire ($DEMP) is a sovereign utility and governance token native to the Solana blockchain, designed to serve as the economic and computational backbone for the overarching Dark Empire decentralized ecosystem.
                The ecosystem bridges next-generation digital sovereignty, high-performance decentralized finance, and cutting-edge cybersecurity features, providing its community—the &quot;Dark Empire Lords&quot;—with exclusive access, governance rights, and real protocol yield.
              </p>
            </div>

            {/* Vision & Core Security Cards Grid */}
            <div id="vision-security" className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-xl">
                <Target className="h-8 w-8 text-purple-400 mb-4" />
                <h3 className="text-xl font-heading font-bold text-white mb-2">Our Vision</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-sans">
                  To establish a sovereign digital realm where users hold total control over their assets, data, and identity, powered by the incredible parallel execution and sub-cent fees of the Solana network.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-xl">
                <ShieldCheck className="h-8 w-8 text-emerald-400 mb-4" />
                <h3 className="text-xl font-heading font-bold text-white mb-2">Core Security & Audits</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-sans">
                  $DEMP features zero buy/sell taxes (0% Tax), revoked mint authority (permanently fixed supply), and 100% locked LP liquidity tokens with real-time monitoring via Solscan and Birdeye.
                </p>
              </div>
            </div>

            {/* Section 1: Introduction */}
            <section id="introduction" className="space-y-4 pt-4 border-t border-purple-900/30">
              <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="text-purple-400 font-mono">1.0</span> Introduction
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed font-sans">
                The transition from Web2 centralized data silos to Web3 decentralized protocols has highlighted major vulnerabilities in how digital sovereignty is preserved. Dark Empire addresses these friction points by delivering a vertically integrated ecosystem on Solana. Leveraging Proof of History (PoH), $DEMP achieves sub-second finality and near-zero gas costs.
              </p>
            </section>

            {/* Section 2: $DEMP Token */}
            <section id="token-utility" className="space-y-4 pt-4 border-t border-purple-900/30">
              <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="text-purple-400 font-mono">2.0</span> The $DEMP Token & Utility Architecture
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed font-sans">
                $DEMP is an SPL utility token on Solana that fuels all operations across the Dark Empire command center, AI Oracle queries, and Edge Gateway routing node telemetry.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 my-6">
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30">
                  <h4 className="font-bold text-white mb-1">HQ Access</h4>
                  <p className="text-xs text-zinc-400">Unlock high-frequency trading signals, Oracle queries, and classified analytics.</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30">
                  <h4 className="font-bold text-white mb-1">DAO Governance</h4>
                  <p className="text-xs text-zinc-400">Vote on-chain for protocol parameters, treasury allocations, and DEX expansions.</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30">
                  <h4 className="font-bold text-white mb-1">Staking Yield</h4>
                  <p className="text-xs text-zinc-400">Vault $DEMP to accumulate passive yield derived from merchant gateway service fees.</p>
                </div>
              </div>
            </section>

            {/* Section 3: Tokenomics */}
            <section id="tokenomics" className="space-y-4 pt-4 border-t border-purple-900/30">
              <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="text-purple-400 font-mono">3.0</span> Tokenomics Architecture
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed font-sans">
                The fixed maximum supply of 1,000,000,000 $DEMP guarantees deep liquidity while enforcing long-term economic stability:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
                <div className="p-5 rounded-xl border border-purple-500/30 bg-purple-950/40 text-center">
                  <p className="text-3xl font-bold font-mono text-purple-300">40%</p>
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mt-1">DEX & Liquidity</p>
                </div>
                <div className="p-5 rounded-xl border border-purple-500/30 bg-purple-950/40 text-center">
                  <p className="text-3xl font-bold font-mono text-emerald-400">30%</p>
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mt-1">Ecosystem Vaults</p>
                </div>
                <div className="p-5 rounded-xl border border-purple-500/30 bg-purple-950/40 text-center">
                  <p className="text-3xl font-bold font-mono text-cyan-400">15%</p>
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mt-1">Dev & Research</p>
                </div>
                <div className="p-5 rounded-xl border border-purple-500/30 bg-purple-950/40 text-center">
                  <p className="text-3xl font-bold font-mono text-amber-400">15%</p>
                  <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mt-1">Core Team (Vested)</p>
                </div>
              </div>
            </section>

            {/* Section 4: Technology */}
            <section id="tech-stack" className="space-y-4 pt-4 border-t border-purple-900/30">
              <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="text-purple-400 font-mono">4.0</span> Solana Infrastructure & Anchor Framework
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed font-sans">
                Our smart contracts are written in Rust using Anchor, ensuring memory safety and immunity to re-entrancy attacks. All smart contracts interact seamlessly with Jupiter DEX for instant, slippage-controlled swaps.
              </p>
            </section>

            {/* Section 5: Roadmap */}
            <section id="roadmap-phase" className="space-y-4 pt-4 border-t border-purple-900/30">
              <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="text-purple-400 font-mono">5.0</span> Multi-Phase Protocol Roadmap
              </h2>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-zinc-950 border border-emerald-500/40 flex justify-between items-center">
                  <span className="text-emerald-400 font-bold">Phase I: Genesis & Minting</span>
                  <span className="text-emerald-400">[COMPLETED]</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950 border border-purple-500/40 flex justify-between items-center">
                  <span className="text-purple-300 font-bold">Phase II: Jupiter DEX Bridge & Supply API</span>
                  <span className="text-purple-300 animate-pulse">[IN PROGRESS]</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-400 font-bold">Phase III: Staking Vaults & DAO On-Chain Governance</span>
                  <span className="text-zinc-500">[Q3 2026]</span>
                </div>
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex justify-between items-center">
                  <span className="text-zinc-400 font-bold">Phase IV: Stealth Mobile Wallet & SDK Release</span>
                  <span className="text-zinc-500">[Q4 2026]</span>
                </div>
              </div>
            </section>

            {/* Section 6: Conclusion */}
            <section id="conclusion" className="space-y-4 pt-4 border-t border-purple-900/30">
              <h2 className="text-2xl font-heading font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="text-purple-400 font-mono">6.0</span> Sovereign Conclusion
              </h2>
              <p className="text-zinc-300 text-base leading-relaxed font-sans">
                Dark Empire is more than a utility token—it is a foundation for decentralized digital control. By uniting an active community with Solana&apos;s computational throughput, $DEMP powers the future of Web3 infrastructure.
              </p>
              <p className="text-center italic mt-8 text-purple-400 font-mono select-none text-lg">
                &quot;Control the core, rule the empire.&quot;
              </p>
            </section>

          </main>
        </div>

      </div>
    </div>
  );
}

