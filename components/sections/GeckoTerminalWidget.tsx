"use client";

import { useState } from "react";
import { Loader2, TrendingUp, Maximize2 } from "lucide-react";

export function GeckoTerminalWidget() {
  const [loading, setLoading] = useState(true);
  
  const embedUrl = "https://www.geckoterminal.com/solana/pools/6Higx2gdaqYaukrkNomp1pVJX8uQNHAhavLE7qFnHjYD?embed=1&info=1&swaps=1&grayscale=0&light_chart=0&chart_type=price&resolution=15m";

  return (
    <div className="w-full bg-[#0a0a0a] border border-[#b026ff]/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(176,38,255,0.05)]">
      
      {/* Widget Utility Top Bar */}
      <div className="bg-zinc-950 px-6 py-3 border-b border-zinc-900 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#b026ff] animate-pulse" />
          <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
            Live Feed // Real-Time Analytics
          </span>
        </div>
        <a 
          href="https://www.geckoterminal.com/solana/pools/6Higx2gdaqYaukrkNomp1pVJX8uQNHAhavLE7qFnHjYD"
          target="_blank"
          rel="noreferrer"
          className="text-zinc-500 hover:text-[#b026ff] transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Frame Container */}
      <div className="relative w-full h-[500px] md:h-[600px] bg-black">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] gap-3 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-[#b026ff]" />
            <span className="font-mono text-xs text-[#b026ff] uppercase tracking-widest animate-pulse">
              Syncing Ledger Data...
            </span>
          </div>
        )}
        
        <iframe
          id="geckoterminal-embed"
          src={embedUrl}
          title="Embed DEMP / USDC"
          className="w-full h-full border-0 select-none"
          loading="lazy"
          allow="clipboard-write"
          allowFullScreen
          onLoad={() => setLoading(false)}
        />
      </div>
    </div>
  );
}
