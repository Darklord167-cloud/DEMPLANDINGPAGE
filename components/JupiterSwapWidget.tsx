"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowLeftRight, ExternalLink, Copy, CheckCircle, ShieldCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function JupiterSwapWidget() {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const contractAddress = "8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx";

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Prevent duplicate script insertion
    const scriptId = "jupiter-terminal-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const initJupiter = () => {
      if ((window as any).Jupiter) {
        try {
          (window as any).Jupiter.init({
            displayMode: "integrated",
            integratedTargetId: "jupiter-terminal",
            endpoint: "https://api.mainnet-beta.solana.com",
            strictTokenList: false,
            formProps: {
              initialInputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
              initialOutputMint: "8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx", // $DEMP
            },
            theme: "dark",
          });
          // Small delay for iframe rendering
          setTimeout(() => setLoading(false), 1200);
        } catch (err) {
          console.error("Error initializing Jupiter Terminal:", err);
          setLoading(false);
        }
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://terminal.jup.ag/main-v2.js";
      script.async = true;
      script.onload = initJupiter;
      document.head.appendChild(script);
    } else {
      // Script already exists
      if ((window as any).Jupiter) {
        initJupiter();
      } else {
        script.onload = initJupiter;
      }
    }

    return () => {
      // Clean up the terminal content to prevent duplicate iframe renders on hot reloads
      const container = document.getElementById("jupiter-terminal");
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="w-full bg-[#0a0a0a] border border-[#b026ff]/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(176,38,255,0.05)]">
      
      {/* Widget Utility Top Bar */}
      <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-900 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-[#b026ff] animate-pulse" />
          <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
            Liquidity Bridge // Secure Swap Terminal
          </span>
        </div>
        <a 
          href={`https://jup.ag/swap/USDC-${contractAddress}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#b026ff] transition-colors font-mono"
        >
          <span>Open on Jupiter</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Grid Container */}
      <div className="grid md:grid-cols-12 gap-0 min-h-[550px] bg-[#030303]">
        
        {/* Left column: Token swap details & utilities */}
        <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-900 bg-black/40">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#b026ff]/10 border border-[#b026ff]/30 flex items-center justify-center text-[#b026ff]">
                <ArrowLeftRight className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-white uppercase tracking-wider">
                  $DEMP Swap Portal
                </h3>
                <p className="text-xs text-zinc-500 font-mono tracking-widest">
                  {"///"} INSTANT ON-CHAIN SWAP
                </p>
              </div>
            </div>

            <p className="text-zinc-400 text-sm leading-relaxed mb-6">
              Swap any Solana assets directly into <strong className="text-white font-semibold">$DEMP</strong> using Jupiter&apos;s intelligent routing protocol. Get the best possible rates across Raydium, Meteora, and Orca pools with instant execution.
            </p>

            <div className="space-y-4">
              {/* Contract address display card */}
              <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-sm">
                <p className="text-[10px] text-zinc-500 font-mono mb-1.5 uppercase tracking-wider">
                  OFFICIAL TOKEN CONTRACT (SOL)
                </p>
                <div className="flex items-center justify-between gap-3">
                  <code className="text-xs text-[#b026ff] font-mono break-all leading-tight select-all">
                    {contractAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="h-8 w-8 hover:bg-[#b026ff]/20 text-[#b026ff] shrink-0 rounded-lg"
                    title="Copy contract address"
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Safety metrics */}
              <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 font-heading">DIRECT JUPITER ROUTING</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Safe, audited smart contracts. Funds never leave your custody during routing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl border border-blue-500/10 bg-blue-500/5">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-blue-400 font-heading">SLIPPAGE RECOMMENDATION</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    For faster execution, Jupiter auto-slippage is enabled. Adjust in the widget settings if needed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Useful Quick Links */}
          <div className="mt-8 pt-6 border-t border-zinc-900/60 flex flex-wrap gap-x-4 gap-y-2 text-xs font-mono">
            <span className="text-zinc-600 uppercase tracking-wider">Resources:</span>
            <a 
              href={`https://dexscreener.com/solana/${contractAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-[#b026ff] transition-colors"
            >
              DexScreener
            </a>
            <span className="text-zinc-700">•</span>
            <a 
              href={`https://birdeye.so/token/${contractAddress}?chain=solana`}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-[#b026ff] transition-colors"
            >
              Birdeye
            </a>
            <span className="text-zinc-700">•</span>
            <a 
              href={`https://solanafm.com/address/${contractAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400 hover:text-[#b026ff] transition-colors"
            >
              SolanaFM
            </a>
          </div>
        </div>

        {/* Right column: Interactive Jupiter Swap terminal */}
        <div className="md:col-span-7 relative flex items-center justify-center p-4 bg-black/60 min-h-[500px]">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]/95 gap-3 z-10 rounded-r-2xl">
              <Loader2 className="w-8 h-8 animate-spin text-[#b026ff]" />
              <span className="font-mono text-xs text-[#b026ff] uppercase tracking-widest animate-pulse">
                Initializing Swap Terminal...
              </span>
            </div>
          )}
          
          <div className="w-full max-w-[420px] mx-auto min-h-[480px]">
            <div id="jupiter-terminal" className="w-full h-full" />
          </div>
        </div>

      </div>
    </div>
  );
}
