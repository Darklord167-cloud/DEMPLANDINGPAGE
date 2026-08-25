"use client";

import { useState } from "react";
import { SwapCard } from "./SwapCard";
import { GeckoTerminalChart } from "../GeckoTerminalChart";
import { RealTimeTradeStream } from "../RealTimeTradeStream";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeftRight, TrendingUp, ShieldCheck, Zap, Activity, Bot, Layers } from "lucide-react";
import { useVipTier } from "@/lib/vip-context";
import { DEMP_TOKEN_MINT, SOL_TOKEN_MINT } from "@/lib/solana/config";

export function DexTerminal() {
  const { tier } = useVipTier();
  const isVip = tier.id !== "none";
  const [activeTab, setActiveTab] = useState<"swap" | "dca" | "signals">("swap");

  return (
    <div className="space-y-6">
      {/* Terminal Top Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-950 via-purple-950/30 to-zinc-950 border border-purple-500/30 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <ArrowLeftRight className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-orbitron text-white">DEX Trading Terminal</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold">
                JUPITER v6 LIVE
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Multi-Chain Intelligent Liquidity Routing &bull; Instant Non-Custodial Execution
            </p>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-zinc-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Slippage Protection: AUTO</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 text-amber-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>VIP Status: {tier.name.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left side Chart + Stream, Right side Swap / DCA Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 7 Cols: Real-Time Candlestick Chart */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-purple-500/20 bg-zinc-950/60 backdrop-blur-md overflow-hidden">
            <CardHeader className="py-4 px-6 border-b border-white/10 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <CardTitle className="text-base font-orbitron font-bold">Live $DEMP / SOL Market Feed</CardTitle>
              </div>
              <span className="text-xs font-mono text-zinc-500">Raydium Pool DEX Chart</span>
            </CardHeader>
            <CardContent className="p-0">
              <GeckoTerminalChart height={460} poolAddress="solana" />
            </CardContent>
          </Card>

          {/* Real Time Trade Stream Terminal */}
          <RealTimeTradeStream height={320} />
        </div>

        {/* Right 5 Cols: Swap Terminal & VIP Automation Tabs */}
        <div className="lg:col-span-5 space-y-6">
          <Tabs defaultValue="swap" className="w-full">
            <TabsList className="grid grid-cols-3 bg-zinc-950 border border-white/10 p-1 rounded-xl mb-4">
              <TabsTrigger value="swap" className="font-mono text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" /> Instant Swap
              </TabsTrigger>
              <TabsTrigger value="dca" className="font-mono text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                <Bot className="w-3.5 h-3.5 mr-1.5" /> Auto DCA
              </TabsTrigger>
              <TabsTrigger value="signals" className="font-mono text-xs font-bold data-[state=active]:bg-primary data-[state=active]:text-white">
                <Activity className="w-3.5 h-3.5 mr-1.5" /> Signals
              </TabsTrigger>
            </TabsList>

            {/* Instant Swap Tab */}
            <TabsContent value="swap">
              <SwapCard
                initialInputMint={SOL_TOKEN_MINT}
                initialOutputMint={DEMP_TOKEN_MINT}
                initialAmount="1.0"
                className="w-full shadow-xl"
              />
            </TabsContent>

            {/* Auto DCA Tab (VIP Feature) */}
            <TabsContent value="dca">
              <Card className="border-primary/30 bg-black/80 backdrop-blur-xl p-6 font-mono text-xs space-y-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <Bot className="w-5 h-5" />
                  <h3 className="text-base font-bold font-orbitron text-white">VIP Autonomous DCA Engine</h3>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Automate dollar-cost averaging into $DEMP using Zero-Knowledge Vault execution.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 flex justify-between items-center">
                    <span className="text-zinc-400">Allocation Amount</span>
                    <span className="font-bold text-white">0.25 SOL / Day</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 flex justify-between items-center">
                    <span className="text-zinc-400">Frequency</span>
                    <span className="font-bold text-white">Every 6 Hours</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 flex justify-between items-center">
                    <span className="text-zinc-400">Vault Authority</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Zero-Knowledge
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  {isVip ? (
                    <button
                      type="button"
                      className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-wider font-orbitron transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    >
                      Start Auto-DCA Bot
                    </button>
                  ) : (
                    <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-300 text-center space-y-2">
                      <p className="font-bold uppercase">VIP Access Required</p>
                      <p className="text-[11px] text-zinc-400">Upgrade to Lord or Overlord tier to unlock Automated Server-Side DCA.</p>
                      <a href="/vip" className="inline-block text-xs text-primary font-bold hover:underline">
                        View VIP Tiers &rarr;
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* AI Trade Signals Tab */}
            <TabsContent value="signals">
              <Card className="border-primary/30 bg-black/80 backdrop-blur-xl p-6 font-mono text-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Activity className="w-5 h-5" />
                    <h3 className="text-base font-bold font-orbitron text-white">Oracle Trade Directives</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    SIGNAL: BULLISH
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/10">
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span className="font-bold text-white">PAIR: $DEMP / SOL</span>
                      <span className="text-emerald-400 font-bold">+14.2% (24H)</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Whale accumulation detected on Raydium pool. Momentum indicators confirm break above resistance.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/10">
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span className="font-bold text-white">PAIR: SOL / USDC</span>
                      <span className="text-amber-400 font-bold">CONSOLIDATING</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      High volume support holding at key Fibonacci levels.
                    </p>
                  </div>
                </div>

                <a
                  href="/oracle"
                  className="block w-full py-2.5 text-center rounded-xl bg-primary hover:bg-primary/80 text-white font-bold uppercase tracking-wider font-orbitron transition-all"
                >
                  Ask Oracle for Live Strategy &rarr;
                </a>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}
