import { CommandCenter } from "@/components/sections/CommandCenter";
import { MarketTelemetry } from "@/components/MarketTelemetry";
import { RealTimeTradeStream } from "@/components/RealTimeTradeStream";
import { PortfolioAnalytics } from "@/components/PortfolioAnalytics";
import { TokenomicsVisualizer } from "@/components/TokenomicsVisualizer";
import { TerminalSquare } from "lucide-react";

export default function CommandCenterPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#f5f5f5] pt-32 pb-12 px-4 sm:px-6 lg:px-8 selection:bg-purple-900/40 relative">
      {/* Background Ambient Highlights */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* Unified Imperial Terminal Header */}
        <div className="border-b border-purple-500/20 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider mb-2">
              <TerminalSquare className="w-4 h-4 text-purple-400" />
              Secure Shell // Node_Active
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-wider text-glow">
              Empire Command Center
            </h1>
            <p className="mt-3 text-zinc-400 font-mono text-sm max-w-2xl flex items-center gap-2">
              <span className="text-purple-400 animate-pulse">_&gt;</span> 
              Remote deployment and telemetry control for the Dark Empire Trading Engine.
            </p>
          </div>

          {/* Network Clear Badge */}
          <div className="bg-zinc-950/80 border border-purple-500/30 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-md shadow-lg shadow-purple-950/20">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-zinc-300">
              Encrypted Link Stable
            </span>
          </div>
        </div>

        {/* Feature #4: Personal Web3 PnL & Portfolio Analytics */}
        <PortfolioAnalytics />
        
        {/* Core Control Interactivity Matrix */}
        <div className="bg-zinc-950/40 backdrop-blur-md rounded-2xl border border-purple-500/20 p-2 shadow-xl">
          <CommandCenter />
        </div>

        {/* Interactive Tokenomics & Staking Visualizer */}
        <TokenomicsVisualizer />

        {/* Live DEX Chart & Real-Time Trade Stream Terminal Section */}
        <div className="pt-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <MarketTelemetry height={520} title="$DEMP Command Center Market Telemetry" />
          </div>
          <div className="lg:col-span-1">
            <RealTimeTradeStream height={520} />
          </div>
        </div>
        
      </div>
    </div>
  );
}

