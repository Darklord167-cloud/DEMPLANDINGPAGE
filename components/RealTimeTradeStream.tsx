"use client";

import { useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Flame, 
  Zap, 
  Pause, 
  Play, 
  RotateCcw, 
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTradeStream, type TradeEvent } from "@/hooks/useTradeStream";
import { Button } from "@/components/ui/button";

interface RealTimeTradeStreamProps {
  poolAddress?: string;
  className?: string;
  height?: number;
}

export function RealTimeTradeStream({
  poolAddress,
  className = "",
  height = 500,
}: RealTimeTradeStreamProps) {
  const {
    trades,
    stats,
    isConnected,
    isPaused,
    poolAddress: currentPool,
    togglePause,
    clearStream,
  } = useTradeStream({ poolAddress });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyWallet = (wallet: string, id: string) => {
    navigator.clipboard.writeText(wallet);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatUsd = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(val);

  const formatTokens = (val: number) =>
    new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(val);

  const shortenAddress = (addr: string) =>
    addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : "Unknown";

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className={`w-full rounded-2xl border border-purple-500/20 bg-zinc-950/40 backdrop-blur-md overflow-hidden shadow-xl shadow-purple-950/10 flex flex-col ${className}`}
      style={{ height: `${height}px` }}
    >
      {/* Header Bar */}
      <div className="bg-zinc-950/90 px-5 py-3.5 border-b border-purple-500/20 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-400 shrink-0">
            <Flame className="w-4 h-4 text-purple-400 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-display font-bold text-white tracking-wider uppercase">
                Live Trade Stream
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    !isPaused && isConnected ? "bg-emerald-400 animate-ping" : "bg-zinc-500"
                  }`}
                />
                {!isPaused && isConnected ? "STREAM ACTIVE" : "STREAM PAUSED"}
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400 truncate">
              Pool: {shortenAddress(currentPool)} • $DEMP AMM
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="icon"
            onClick={togglePause}
            className="h-8 w-8 border-purple-500/20 bg-zinc-900/80 hover:bg-purple-950/40 text-zinc-300 hover:text-white"
            title={isPaused ? "Resume Stream" : "Pause Stream"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={clearStream}
            className="h-8 w-8 border-purple-500/20 bg-zinc-900/80 hover:bg-rose-950/40 text-zinc-300 hover:text-white"
            title="Clear Stream History"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400 hover:text-rose-400" />
          </Button>
        </div>
      </div>

      {/* Mini Stats Bar */}
      <div className="bg-zinc-900/60 px-4 py-2 border-b border-purple-500/10 flex items-center justify-between text-[11px] font-mono text-zinc-400 shrink-0 gap-2 flex-wrap">
        <span className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          Volume: <strong className="text-white">{formatUsd(stats.totalVolumeUsd)}</strong>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-bold">{stats.buyCount} Buys</span>
          <span className="text-rose-400 font-bold">{stats.sellCount} Sells</span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-purple-300 font-bold text-[10px]">
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            {stats.whaleAlertCount} Whales
          </span>
        </div>
      </div>

      {/* Main Trade Feed Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
        {trades.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 font-mono text-xs">
            <Zap className="w-8 h-8 text-purple-500/40 mb-2 animate-bounce" />
            <span>Listening for live DEX orders on Solana...</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {trades.map((trade) => {
              const isBuy = trade.type === "BUY";
              const isWhale = trade.isWhale;

              return (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: -16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`relative rounded-xl p-3 backdrop-blur-md transition-all duration-300 border ${
                    isWhale
                      ? isBuy
                        ? "bg-emerald-950/30 border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/40"
                        : "bg-rose-950/30 border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.25)] ring-1 ring-rose-500/40"
                      : "bg-zinc-950/60 border-purple-500/10 hover:border-purple-500/30 hover:bg-zinc-900/80"
                  }`}
                >
                  {/* Top Row: Type Badge + Whale Alert Badge + Timestamp */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* BUY / SELL Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-xs font-black tracking-wider uppercase border ${
                          isBuy
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                        }`}
                      >
                        {isBuy ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-rose-400 stroke-[3]" />
                        )}
                        {trade.type}
                      </span>

                      {/* Pulsing WHALE ALERT Badge if > $1,000 USD */}
                      {isWhale && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-extrabold uppercase text-white shadow-md animate-pulse ${
                            isBuy
                              ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 border border-emerald-300/60 shadow-emerald-500/30"
                              : "bg-gradient-to-r from-rose-600 via-red-500 to-rose-400 border border-rose-300/60 shadow-rose-500/30"
                          }`}
                        >
                          <ShieldAlert className="w-3 h-3 text-white animate-spin" style={{ animationDuration: "3s" }} />
                          WHALE ALERT
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                      {formatTime(trade.timestamp)}
                    </span>
                  </div>

                  {/* Middle Row: USD Value & Token Amount */}
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs font-mono text-zinc-400 block text-[10px] uppercase">
                        Token Amount
                      </span>
                      <span className="text-sm font-mono font-bold text-zinc-200">
                        {formatTokens(trade.tokenAmount)}{" "}
                        <span className="text-purple-400 text-xs font-normal">$DEMP</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono text-zinc-400 block text-[10px] uppercase">
                        USD Value
                      </span>
                      <span
                        className={`text-base font-mono font-extrabold tracking-tight ${
                          isWhale
                            ? isBuy
                              ? "text-emerald-400 text-glow"
                              : "text-rose-400"
                            : isBuy
                            ? "text-emerald-300"
                            : "text-rose-300"
                        }`}
                      >
                        {formatUsd(trade.amountUsd)}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Wallet Address + Solscan Tx Link */}
                  <div className="pt-1.5 border-t border-purple-500/10 flex items-center justify-between text-[11px] font-mono text-zinc-400 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyWallet(trade.wallet, trade.id)}
                      className="inline-flex items-center gap-1 hover:text-purple-300 transition-colors group"
                      title="Copy Trader Wallet"
                    >
                      <Wallet className="w-3 h-3 text-zinc-500 group-hover:text-purple-400" />
                      <span>{shortenAddress(trade.wallet)}</span>
                      {copiedId === trade.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>

                    <a
                      href={`https://solscan.io/tx/${trade.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-zinc-400 hover:text-purple-300 transition-colors"
                      title="View Transaction on Solscan"
                    >
                      <span>Solscan</span>
                      <ExternalLink className="w-3 h-3 text-purple-400" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-zinc-950/90 px-4 py-2 border-t border-purple-500/20 text-[10px] font-mono text-zinc-400 flex items-center justify-between shrink-0">
        <span>Whale Threshold: &gt; $1,000 USD</span>
        <span className="text-purple-400 font-bold">Dual-Relay Ready</span>
      </div>
    </div>
  );
}
