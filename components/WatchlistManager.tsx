"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, Bell, Plus, Trash2, TrendingUp, TrendingDown, Check, ShieldAlert, Sparkles, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useWallet } from "@solana/wallet-adapter-react";
import { DEMP_TOKEN_MINT } from "@/lib/solana/config";

export interface Watchitem {
  id: string;
  symbol: string;
  name: string;
  mint: string;
  priceUsd: number;
  change24h: number;
}

export interface PriceAlertItem {
  id: string;
  symbol: string;
  targetPriceUsd: number;
  condition: "ABOVE" | "BELOW";
  triggered: boolean;
}

const DEFAULT_WATCHLIST: Watchitem[] = [
  {
    id: "demp-1",
    symbol: "DEMP",
    name: "Dark Empire Token",
    mint: DEMP_TOKEN_MINT,
    priceUsd: 0.0485,
    change24h: 12.45,
  },
  {
    id: "sol-1",
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    priceUsd: 185.20,
    change24h: 4.15,
  },
  {
    id: "bonk-1",
    symbol: "BONK",
    name: "Bonk",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    priceUsd: 0.000024,
    change24h: -2.10,
  },
];

export function WatchlistManager({ className = "" }: { className?: string }) {
  const { publicKey } = useWallet();
  const [items, setItems] = useState<Watchitem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dark_watchlist");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return DEFAULT_WATCHLIST;
  });

  const [alerts, setAlerts] = useState<PriceAlertItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dark_alerts");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [
      { id: "a1", symbol: "DEMP", targetPriceUsd: 0.05, condition: "ABOVE", triggered: false },
      { id: "a2", symbol: "SOL", targetPriceUsd: 180.00, condition: "BELOW", triggered: false },
    ];
  });

  const [symbolInput, setSymbolInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [mintInput, setMintInput] = useState("");

  const [alertSymbol, setAlertSymbol] = useState("DEMP");
  const [alertTargetPrice, setAlertTargetPrice] = useState("0.05");
  const [alertCondition, setAlertCondition] = useState<"ABOVE" | "BELOW">("ABOVE");

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dark_watchlist", JSON.stringify(items));
    }
  }, [items]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dark_alerts", JSON.stringify(alerts));
    }
  }, [alerts]);

  const handleAddToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbolInput.trim() || !mintInput.trim()) {
      toast.error("Symbol and Mint address are required");
      return;
    }

    const newItem: Watchitem = {
      id: `w-${Date.now()}`,
      symbol: symbolInput.trim().toUpperCase(),
      name: nameInput.trim() || symbolInput.trim().toUpperCase(),
      mint: mintInput.trim(),
      priceUsd: 0.05,
      change24h: 0.0,
    };

    setItems((prev) => [newItem, ...prev]);
    setSymbolInput("");
    setNameInput("");
    setMintInput("");
    toast.success(`Added ${newItem.symbol} to Watchlist`);
  };

  const handleRemoveToken = (id: string, symbol: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast.info(`Removed ${symbol} from Watchlist`);
  };

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(alertTargetPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Enter a valid target price");
      return;
    }

    const newAlert: PriceAlertItem = {
      id: `alt-${Date.now()}`,
      symbol: alertSymbol.toUpperCase(),
      targetPriceUsd: priceNum,
      condition: alertCondition,
      triggered: false,
    };

    setAlerts((prev) => [newAlert, ...prev]);
    toast.success(`Price alert set for ${newAlert.symbol} (${newAlert.condition} $${priceNum})`);
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const formatPrice = (val: number) => {
    if (val < 0.001) return `$${val.toFixed(6)}`;
    if (val < 1) return `$${val.toFixed(4)}`;
    return `$${val.toFixed(2)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-zinc-950/70 backdrop-blur-xl border border-[#00d2ff]/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#00d2ff]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#00d2ff]/20">
        <div>
          <div className="flex items-center gap-2 text-[#00d2ff] font-mono text-xs uppercase tracking-wider">
            <Eye className="w-4 h-4 text-[#00d2ff] animate-pulse" />
            <span>Market Surveillance // Custom Watchlist & Alerts</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white uppercase tracking-wider mt-1">
            Token Watchlist & Price Alerts
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#041635] border border-[#ff6600]/40 text-[#ff6600] font-mono text-xs font-bold">
            {items.length} TOKENS WATCHED
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Watchlist Section (Left) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-mono text-white uppercase font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00d2ff]" />
            Active SPL Watchlist
          </h3>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="bg-[#030d21]/90 border border-[#00d2ff]/20 hover:border-[#00d2ff]/50 rounded-xl p-3.5 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d2ff]/20 to-[#ff6600]/20 border border-[#00d2ff]/40 flex items-center justify-center font-mono font-black text-xs text-white">
                      {item.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{item.symbol}</span>
                        <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <a
                        href={`https://solscan.io/token/${item.mint}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-zinc-500 hover:text-[#00d2ff] flex items-center gap-1"
                      >
                        Solscan <ArrowUpRight className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-white">{formatPrice(item.priceUsd)}</div>
                      <div className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${item.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {item.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {item.change24h >= 0 ? "+" : ""}{item.change24h.toFixed(2)}%
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveToken(item.id, item.symbol)}
                      className="text-zinc-600 hover:text-rose-400 transition-colors p-1"
                      title="Remove Token"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add Token Form */}
          <form onSubmit={handleAddToken} className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              placeholder="Symbol (e.g. PYTH)"
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              className="bg-[#030d21] border-[#00d2ff]/30 text-white font-mono text-xs h-10 rounded-xl"
            />
            <Input
              placeholder="Solana Mint Address"
              value={mintInput}
              onChange={(e) => setMintInput(e.target.value)}
              className="bg-[#030d21] border-[#00d2ff]/30 text-white font-mono text-xs h-10 rounded-xl"
            />
            <Button
              type="submit"
              className="bg-[#00d2ff]/20 border border-[#00d2ff]/50 hover:bg-[#00d2ff]/40 text-[#00d2ff] hover:text-white font-mono text-xs font-bold h-10 rounded-xl flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Token
            </Button>
          </form>
        </div>

        {/* Price Alerts Section (Right) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-mono text-white uppercase font-bold flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#ff6600]" />
            Target Price Alerts
          </h3>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {alerts.length === 0 ? (
              <div className="text-xs font-mono text-zinc-500 text-center py-6 border border-dashed border-zinc-800 rounded-xl">
                No active price alerts set.
              </div>
            ) : (
              alerts.map((alt) => (
                <div
                  key={alt.id}
                  className="bg-[#041635]/80 border border-[#ff6600]/30 rounded-xl p-3 flex items-center justify-between font-mono"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{alt.symbol}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${alt.condition === "ABOVE" ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40" : "bg-rose-950 text-rose-300 border border-rose-500/40"}`}>
                        {alt.condition}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[#ff8800] mt-0.5">
                      Target: {formatPrice(alt.targetPriceUsd)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveAlert(alt.id)}
                    className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Price Alert Form */}
          <form onSubmit={handleAddAlert} className="space-y-2 pt-2 border-t border-[#00d2ff]/20">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={alertSymbol}
                onChange={(e) => setAlertSymbol(e.target.value)}
                className="bg-[#030d21] border border-[#ff6600]/40 text-white font-mono text-xs h-10 rounded-xl px-3 outline-none"
              >
                {items.map((i) => (
                  <option key={i.id} value={i.symbol}>
                    {i.symbol}
                  </option>
                ))}
              </select>
              <select
                value={alertCondition}
                onChange={(e) => setAlertCondition(e.target.value as "ABOVE" | "BELOW")}
                className="bg-[#030d21] border border-[#ff6600]/40 text-white font-mono text-xs h-10 rounded-xl px-3 outline-none"
              >
                <option value="ABOVE">Rises Above (&gt;)</option>
                <option value="BELOW">Drops Below (&lt;)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Input
                type="number"
                step="any"
                placeholder="Target Price USD"
                value={alertTargetPrice}
                onChange={(e) => setAlertTargetPrice(e.target.value)}
                className="bg-[#030d21] border-[#ff6600]/40 text-white font-mono text-xs h-10 rounded-xl"
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#ff5500] to-[#ffaa00] text-white font-mono text-xs font-bold h-10 px-4 rounded-xl shrink-0"
              >
                Set Alert
              </Button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
