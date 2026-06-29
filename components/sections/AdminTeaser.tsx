"use client";

import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function AdminTeaser() {
  return (
    <section className="py-24 bg-black relative border-y border-white/5">
      <div className="container px-6 text-center">
         <div className="max-w-4xl mx-auto relative p-12 rounded-2xl border border-white/10 bg-grid-pattern overflow-hidden">
            
            {/* Blur Overlay */}
            <div className="absolute inset-0 backdrop-blur-[8px] bg-black/60 flex flex-col items-center justify-center z-20">
                <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Lock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-3xl font-display font-bold text-white mb-2">RESTRICTED ACCESS</h3>
                <p className="text-muted-foreground font-mono mb-8">ADMINISTRATIVE DASHBOARD & ANALYTICS</p>
                <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/20">
                    REQUEST ACCESS
                </Button>
            </div>

            {/* Mock Dashboard Background (Blurred) */}
            <div className="opacity-30 blur-sm pointer-events-none select-none">
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="h-32 bg-white/10 rounded-lg"></div>
                    <div className="h-32 bg-white/10 rounded-lg"></div>
                    <div className="h-32 bg-white/10 rounded-lg"></div>
                </div>
                <div className="h-64 bg-white/10 rounded-lg w-full"></div>
            </div>
         </div>
      </div>
    </section>
  );
}
