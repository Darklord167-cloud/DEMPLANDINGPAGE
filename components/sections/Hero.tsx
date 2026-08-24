"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Copy, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  ExternalLink, 
  FileText, 
  ChevronDown, 
  Sparkles, 
  Lock, 
  Globe, 
  Layers,
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { DEMP_TOKEN_MINT, DEMP_TOTAL_SUPPLY } from "@/lib/config/tokens";
import { 
  SOLSCAN_TOKEN_URL, 
  DEXSCREENER_TOKEN_URL, 
  BIRDEYE_TOKEN_URL, 
  JUPITER_SWAP_SOL_DEMP_URL 
} from "@/lib/config/urls";
import { DataStatusBadge, DataStatusType } from "@/components/ui/data-status-badge";

interface TokenTelemetryState {
  priceUsd: number | null;
  priceChange24h: number | null;
  volume24hUsd: number | null;
  liquidityUsd: number | null;
  marketCapUsd: number | null;
  source: string;
  status: DataStatusType;
}

export const Hero = React.memo(function Hero() {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const contractAddress = DEMP_TOKEN_MINT;

  const [telemetry, setTelemetry] = useState<TokenTelemetryState>({
    priceUsd: null,
    priceChange24h: null,
    volume24hUsd: null,
    liquidityUsd: null,
    marketCapUsd: null,
    source: "DexScreener Live",
    status: "syncing",
  });

  const fetchLiveTelemetry = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. Direct DexScreener On-Chain Query
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${DEMP_TOKEN_MINT}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const pair = json?.pairs?.[0];

        if (pair) {
          const price = parseFloat(pair.priceUsd) || 0;
          const change = pair.priceChange?.h24 ?? 0;
          const volume = pair.volume?.h24 ?? 0;
          const liquidity = pair.liquidity?.usd ?? 0;
          const mc = pair.marketCap || pair.fdv || (price * DEMP_TOTAL_SUPPLY);

          setTelemetry({
            priceUsd: price,
            priceChange24h: change,
            volume24hUsd: volume,
            liquidityUsd: liquidity,
            marketCapUsd: mc,
            source: "DexScreener",
            status: "live",
          });
          setIsRefreshing(false);
          return;
        }
      }

      // 2. Server API Birdeye Fallback
      const fallbackRes = await fetch(`/api/birdeye?address=${DEMP_TOKEN_MINT}`);
      if (fallbackRes.ok) {
        const fallbackJson = await fallbackRes.json();
        if (fallbackJson.data && typeof fallbackJson.data.price === "number") {
          const d = fallbackJson.data;
          setTelemetry({
            priceUsd: d.price,
            priceChange24h: d.priceChange24h ?? null,
            volume24hUsd: d.v24hUSD ?? null,
            liquidityUsd: d.liquidity ?? null,
            marketCapUsd: d.mc ?? null,
            source: "Birdeye",
            status: "live",
          });
          setIsRefreshing(false);
          return;
        }
      }

      // 3. Mark as awaiting pair indexing
      setTelemetry((prev) => ({
        ...prev,
        status: "unavailable",
        source: "Awaiting DEX Feed",
      }));
    } catch (err: any) {
      console.warn("[Hero Telemetry] Live query note:", err?.message || err);
      setTelemetry((prev) => ({
        ...prev,
        status: "delayed",
        source: "Solana RPC",
      }));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 45000);
    return () => clearInterval(interval);
  }, [fetchLiveTelemetry]);

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    toast({
      title: "Contract Address Copied!",
      description: "Solana SPL contract address copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatUsd = (val: number | null) => {
    if (val === null || val === undefined || isNaN(val)) return "---";
    if (val < 0.0001 && val > 0) return `$${val.toFixed(8)}`;
    if (val < 1) return `$${val.toFixed(6)}`;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(val);
  };

  const formatCompactUsd = (val: number | null) => {
    if (val === null || val === undefined || isNaN(val)) return "---";
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(2)}K`;
    return `$${val.toFixed(2)}`;
  };

  return (
    <section id="overview" aria-label="Dark Empire Overview" className="relative min-h-[90vh] lg:min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16 bg-[#030306]">
      {/* Dynamic Ambient Glows & Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/30 via-[#030306]/95 to-[#030306] z-10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10 z-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-purple-600/10 rounded-full blur-[140px] z-10" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] z-10" />
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto relative z-20 px-4 sm:px-6 text-center max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Live Network Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/40 bg-purple-950/60 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
            <span className="text-xs font-mono text-purple-200 tracking-widest uppercase font-bold">
              SOLANA MAINNET-BETA // PROTOCOL ONLINE
            </span>
          </div>

          {/* Primary Imperial Headline */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight break-words mb-4 drop-shadow-[0_0_35px_rgba(168,85,247,0.35)]">
            DARK EMPIRE
          </h1>

          {/* What It Is - Clear Value Proposition */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-zinc-300 font-sans mb-3 leading-relaxed">
            Autonomous Web3 Infrastructure, <strong className="text-purple-300 font-bold">$DEMP Utility Token</strong>, and Decentralized Trading Operations.
          </p>

          {/* What Users Can Do */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-8 text-xs font-mono text-zinc-400">
            <span className="px-3 py-1 rounded-lg bg-zinc-950/80 border border-purple-900/40 text-purple-300">⚡ 0% Tax Swap on Jupiter</span>
            <span className="px-3 py-1 rounded-lg bg-zinc-950/80 border border-purple-900/40 text-emerald-300">🔒 100% Locked DEX Liquidity</span>
            <span className="px-3 py-1 rounded-lg bg-zinc-950/80 border border-purple-900/40 text-amber-300">🧠 AI Oracle Market Mind</span>
            <span className="px-3 py-1 rounded-lg bg-zinc-950/80 border border-purple-900/40 text-cyan-300">🔐 Zero-Knowledge Key Vault</span>
          </div>

          {/* Verified Contract Address Card */}
          <div className="max-w-2xl mx-auto mb-8 p-3 rounded-2xl border border-purple-900/60 bg-black/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 px-2 text-left w-full sm:w-auto overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="overflow-hidden text-left min-w-0">
                <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                  VERIFIED SOLANA CONTRACT ($DEMP)
                </p>
                <code className="text-xs sm:text-sm font-mono text-purple-300 font-bold truncate block select-all break-all">
                  {contractAddress}
                </code>
              </div>
            </div>

            <Button
              onClick={handleCopyContract}
              size="sm"
              aria-label="Copy Solana SPL contract address"
              className="w-full sm:w-auto min-h-[44px] h-11 px-5 bg-purple-950/90 hover:bg-purple-900 text-purple-200 border border-purple-500/50 text-xs font-mono font-bold shrink-0 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400 mr-2" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2 text-purple-400" />
                  <span>COPY CONTRACT</span>
                </>
              )}
            </Button>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto min-h-[48px] h-12 px-8 text-sm md:text-base font-heading font-bold tracking-wider bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_35px_rgba(168,85,247,0.45)] border border-purple-400/50 transition-all rounded-xl cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <a href={JUPITER_SWAP_SOL_DEMP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 text-amber-300" />
                <span>BUY $DEMP (JUPITER)</span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-300" />
              </a>
            </Button>

            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto min-h-[48px] h-12 px-8 text-sm md:text-base font-heading font-bold tracking-wider border-purple-500/50 text-white hover:bg-purple-950/70 transition-all rounded-xl cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <Link href="/command-center" className="flex items-center justify-center gap-2">
                <span>EXPLORE ECOSYSTEM</span>
                <ArrowRight className="w-4 h-4 text-purple-400" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              asChild
              className="w-full sm:w-auto min-h-[48px] h-12 px-6 text-sm font-heading font-bold text-zinc-300 hover:text-white hover:bg-white/5 transition-all rounded-xl cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <Link href="/whitepaper" className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>WHITEPAPER</span>
              </Link>
            </Button>
          </div>

          {/* External Verification Links */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10 text-xs font-mono text-zinc-400">
            <a 
              href={SOLSCAN_TOKEN_URL}
              target="_blank" 
              rel="noreferrer"
              className="hover:text-purple-300 transition-colors flex items-center gap-1.5 bg-zinc-950/70 border border-zinc-800/80 px-3 py-1.5 rounded-lg min-h-[36px]"
            >
              <Globe className="w-3.5 h-3.5 text-purple-400" />
              <span>Solscan Explorer</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
            <a 
              href={DEXSCREENER_TOKEN_URL}
              target="_blank" 
              rel="noreferrer"
              className="hover:text-purple-300 transition-colors flex items-center gap-1.5 bg-zinc-950/70 border border-zinc-800/80 px-3 py-1.5 rounded-lg min-h-[36px]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>DexScreener Live Chart</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
            <a 
              href={BIRDEYE_TOKEN_URL}
              target="_blank" 
              rel="noreferrer"
              className="hover:text-purple-300 transition-colors flex items-center gap-1.5 bg-zinc-950/70 border border-zinc-800/80 px-3 py-1.5 rounded-lg min-h-[36px]"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Birdeye Indexer</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>

          {/* ============================================== */}
          {/* LIVE TOKEN INTELLIGENCE AREA                  */}
          {/* ============================================== */}
          <div className="pt-6 border-t border-purple-900/40 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm sm:text-base font-heading font-bold text-white uppercase tracking-wider">
                  $DEMP LIVE TOKEN INTELLIGENCE
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <DataStatusBadge status={telemetry.status} source={telemetry.source} />
                <button
                  onClick={fetchLiveTelemetry}
                  disabled={isRefreshing}
                  aria-label="Refresh token telemetry"
                  className="p-1.5 rounded-lg bg-zinc-950/80 border border-purple-900/50 hover:bg-purple-950/60 text-zinc-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-purple-500"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-purple-400" : ""}`} />
                </button>
              </div>
            </div>

            {/* 8-Card Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* 1. Price */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-purple-900/40">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  <span>PRICE (USD)</span>
                  <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <p className="text-base sm:text-lg font-bold font-mono text-white">
                  {formatUsd(telemetry.priceUsd)}
                </p>
                <p className="text-[9px] font-mono text-purple-300 mt-1">PAIR: DEMP/USDC</p>
              </div>

              {/* 2. Market Cap */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-purple-900/40">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  <span>MARKET CAP</span>
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-base sm:text-lg font-bold font-mono text-amber-300">
                  {formatCompactUsd(telemetry.marketCapUsd)}
                </p>
                <p className="text-[9px] font-mono text-zinc-400 mt-1">FDV VALUATION</p>
              </div>

              {/* 3. 24h Volume */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-purple-900/40">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  <span>24H VOLUME</span>
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-base sm:text-lg font-bold font-mono text-cyan-300">
                  {formatCompactUsd(telemetry.volume24hUsd)}
                </p>
                <p className="text-[9px] font-mono text-zinc-400 mt-1">DEX ROUTER</p>
              </div>

              {/* 4. Liquidity */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-purple-900/40">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  <span>LIQUIDITY</span>
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-base sm:text-lg font-bold font-mono text-emerald-300">
                  {formatCompactUsd(telemetry.liquidityUsd)}
                </p>
                <p className="text-[9px] font-mono text-emerald-400 mt-1">100% LOCKED</p>
              </div>

              {/* 5. 24h Change */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-purple-900/40">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  <span>24H CHANGE</span>
                  {telemetry.priceChange24h !== null && telemetry.priceChange24h >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-400" />
                  )}
                </div>
                <p className={`text-base sm:text-lg font-bold font-mono ${
                  telemetry.priceChange24h !== null && telemetry.priceChange24h >= 0 ? "text-emerald-400" : telemetry.priceChange24h !== null ? "text-red-400" : "text-white"
                }`}>
                  {telemetry.priceChange24h !== null ? `${telemetry.priceChange24h >= 0 ? "+" : ""}${telemetry.priceChange24h.toFixed(2)}%` : "---"}
                </p>
                <p className="text-[9px] font-mono text-zinc-400 mt-1">ROLLING 24H</p>
              </div>

              {/* 6. Total Supply */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-purple-900/40">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  <span>TOTAL SUPPLY</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <p className="text-base sm:text-lg font-bold font-mono text-white">
                  1,000,000,000
                </p>
                <p className="text-[9px] font-mono text-emerald-400 mt-1">0% TAX / FIXED</p>
              </div>

              {/* 7. Primary Network */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-purple-900/40">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  <span>NETWORK</span>
                  <Globe className="w-3.5 h-3.5 text-[#14F195]" />
                </div>
                <p className="text-base sm:text-lg font-bold font-mono text-[#14F195]">
                  SOLANA
                </p>
                <p className="text-[9px] font-mono text-zinc-400 mt-1">MAINNET-BETA</p>
              </div>

              {/* 8. Contract Mint */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-purple-900/40">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase tracking-wider mb-1">
                  <span>CONTRACT</span>
                  <button
                    onClick={handleCopyContract}
                    aria-label="Copy Solana SPL contract address"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <code className="text-xs sm:text-sm font-mono text-purple-300 font-bold truncate block select-all">
                  {contractAddress.slice(0, 4)}...{contractAddress.slice(-4)}
                </code>
                <p className="text-[9px] font-mono text-zinc-400 mt-1">SPL STANDARD</p>
              </div>
            </div>
          </div>

        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 text-purple-400/50"
      >
        <ChevronDown className="h-6 w-6 animate-bounce" />
      </motion.div>
    </section>
  );
});

