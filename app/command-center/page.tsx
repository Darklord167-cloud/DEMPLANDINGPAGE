import { CommandCenter } from "@/components/sections/CommandCenter";
import { TerminalSquare } from "lucide-react";

export default function CommandCenterPage() {
  return (
    <div className="min-h-screen bg-[#05010a] text-[#f5f5f5] pt-32 pb-12 px-4 sm:px-6 lg:px-8 selection:bg-[#b026ff]/30">
      <div className="max-w-7xl mx-auto">
        
        {/* Unified Imperial Terminal Header */}
        <div className="mb-12 border-b border-[#b026ff]/20 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#b026ff] font-mono text-xs uppercase tracking-[0.3em] mb-2">
              <TerminalSquare className="w-4 h-4 text-[#b026ff]" />
              Secure Shell // Node_Active
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white uppercase tracking-wider drop-shadow-[0_0_15px_rgba(176,38,255,0.4)]">
              Empire Command Center
            </h1>
            <p className="mt-3 text-zinc-400 font-mono text-sm max-w-2xl flex items-center gap-2">
              <span className="text-[#b026ff] animate-pulse">_&gt;</span> 
              Remote deployment and telemetry control for the Dark Empire Trading Engine.
            </p>
          </div>

          {/* Network Clear Badge */}
          <div className="bg-[#0a0a0a] border border-[#b026ff]/30 px-4 py-2 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(176,38,255,0.05)]">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              Encrypted Link Stable
            </span>
          </div>
        </div>
        
        {/* Core Control Interactivity Matrix */}
        <div className="bg-[#0a0a0a]/50 backdrop-blur-md rounded-2xl border border-zinc-900 p-2 shadow-xl">
          <CommandCenter />
        </div>
        
      </div>
    </div>
  );
}
