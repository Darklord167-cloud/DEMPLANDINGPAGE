"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[HQ Error Boundary Caught Exception]:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center bg-black text-white px-4 py-16 relative overflow-hidden">
      {/* Glow ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="max-w-md w-full bg-zinc-950/90 border border-purple-900/60 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.15)] relative z-10 space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-950/90 border border-purple-500/50 flex items-center justify-center text-purple-400 mx-auto shadow-[0_0_20px_rgba(168,85,247,0.3)]">
          <AlertTriangle className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono text-[10px] font-bold uppercase tracking-widest">
            SYSTEM ANOMALY DETECTED
          </span>
          <h2 className="text-2xl font-display font-black text-white tracking-tight uppercase">
            HQ PROTOCOL DISRUPTION
          </h2>
          <p className="text-xs text-zinc-400 font-mono leading-relaxed">
            An unexpected error occurred while executing on-chain telemetry or page rendering.
          </p>
          {error?.message && (
            <div className="mt-3 p-3 rounded-xl bg-black/60 border border-purple-900/40 text-zinc-400 text-[11px] font-mono text-left truncate">
              <span className="text-amber-400 font-bold">Error:</span> {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            RETRY EXECUTION
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full border-zinc-800 hover:border-purple-500 text-zinc-300 hover:text-white font-mono text-xs font-bold rounded-xl"
          >
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              RETURN TO HQ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
