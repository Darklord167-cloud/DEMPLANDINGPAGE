"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Layout Error Boundary]:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-950 border border-purple-900/80 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-purple-950 border border-purple-500/50 flex items-center justify-center text-amber-400 mx-auto shadow-lg">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black uppercase text-white tracking-wider">
              CRITICAL HQ FAILURE
            </h1>
            <p className="text-xs text-zinc-400 font-mono">
              A unhandled critical layout exception occurred. Please reset the session.
            </p>
          </div>

          <Button
            onClick={() => reset()}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            RELOAD SYSTEM
          </Button>
        </div>
      </body>
    </html>
  );
}
