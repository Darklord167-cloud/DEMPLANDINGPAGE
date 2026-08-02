"use client";

import React, { useEffect } from "react";
import { Bot, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OracleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AI Oracle Route Error]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center bg-black text-white px-4 py-12">
      <div className="max-w-md w-full bg-zinc-950/90 border border-purple-900/60 rounded-3xl p-8 backdrop-blur-2xl text-center space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-purple-950/90 border border-purple-500/50 flex items-center justify-center text-purple-300 mx-auto">
          <Bot className="w-7 h-7 text-purple-400 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800">
            ORACLE NEURAL LINK OFFLINE
          </span>
          <h2 className="text-2xl font-display font-black text-white uppercase">
            AI ORACLE EXCEPTION
          </h2>
          <p className="text-xs text-zinc-400 font-mono">
            Failed to establish stream telemetry with Dark Lord AI Oracle backend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => reset()}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            RECONNECT ORACLE
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-zinc-800 text-zinc-300 font-mono text-xs font-bold rounded-xl"
          >
            <Link href="/">
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              BACK TO HQ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
