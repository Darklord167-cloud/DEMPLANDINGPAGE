"use client";

import { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowUpDown, ExternalLink, ShieldCheck, Zap, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { DEMP_TOKEN_MINT, SOL_TOKEN_MINT, USDC_TOKEN_MINT } from "@/lib/solana/config";
import { toast } from "sonner";

interface TokenOption {
  symbol: string;
  name: string;
  mint: string;
  decimals: number;
  icon?: string;
}

const SUPPORTED_TOKENS: TokenOption[] = [
  { symbol: "SOL", name: "Solana", mint: SOL_TOKEN_MINT, decimals: 9 },
  { symbol: "USDC", name: "USD Coin", mint: USDC_TOKEN_MINT, decimals: 6 },
  { symbol: "DEMP", name: "Dark Empire", mint: DEMP_TOKEN_MINT, decimals: 9 },
  { symbol: "BONK", name: "Bonk", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5 },
  { symbol: "JUP", name: "Jupiter", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", decimals: 6 },
];

interface SwapCardProps {
  initialInputMint?: string;
  initialOutputMint?: string;
  initialAmount?: string;
  compact?: boolean;
  onSwapSuccess?: (txid: string) => void;
  className?: string;
}

export function SwapCard({
  initialInputMint = SOL_TOKEN_MINT,
  initialOutputMint = DEMP_TOKEN_MINT,
  initialAmount = "0.5",
  compact = false,
  onSwapSuccess,
  className = "",
}: SwapCardProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const [inputToken, setInputToken] = useState<TokenOption>(
    SUPPORTED_TOKENS.find((t) => t.mint === initialInputMint) || SUPPORTED_TOKENS[0]
  );
  const [outputToken, setOutputToken] = useState<TokenOption>(
    SUPPORTED_TOKENS.find((t) => t.mint === initialOutputMint) || SUPPORTED_TOKENS[2]
  );

  const [inputAmount, setInputAmount] = useState(initialAmount);
  const [outputAmount, setOutputAmount] = useState<string>("");
  const [slippageBps, setSlippageBps] = useState<number>(50); // 0.5%
  const [quoteData, setQuoteData] = useState<any>(null);

  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Convert human-readable amount to raw integer string with token decimals
  const getRawAmount = useCallback((amountStr: string, decimals: number) => {
    const parsed = parseFloat(amountStr);
    if (isNaN(parsed) || parsed <= 0) return "0";
    return Math.floor(parsed * Math.pow(10, decimals)).toString();
  }, []);

  // Fetch real-time Jupiter Quote
  const fetchQuote = useCallback(async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setOutputAmount("");
      setQuoteData(null);
      return;
    }

    setIsLoadingQuote(true);
    setErrorMessage(null);

    try {
      const rawAmount = getRawAmount(inputAmount, inputToken.decimals);
      if (rawAmount === "0") return;

      const params = new URLSearchParams({
        inputMint: inputToken.mint,
        outputMint: outputToken.mint,
        amount: rawAmount,
        slippageBps: slippageBps.toString(),
      });

      const res = await fetch(`/api/dex/quote?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to find swap route");
      }

      setQuoteData(data);
      const outRaw = parseFloat(data.outAmount);
      const outFormatted = (outRaw / Math.pow(10, outputToken.decimals)).toFixed(4);
      setOutputAmount(outFormatted);
    } catch (err: any) {
      console.warn("[SwapCard Quote Notice]:", err.message);
      setErrorMessage(err.message || "Route unavailable");
      setOutputAmount("");
    } finally {
      setIsLoadingQuote(false);
    }
  }, [inputAmount, inputToken, outputToken, slippageBps, getRawAmount]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote();
    }, 400);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  // Flip Tokens
  const handleFlipTokens = () => {
    const prevInput = inputToken;
    const prevOutput = outputToken;
    setInputToken(prevOutput);
    setOutputToken(prevInput);
    setInputAmount(outputAmount || "1");
  };

  // Execute Swap via Jupiter
  const handleExecuteSwap = async () => {
    if (!connected || !publicKey) {
      toast.error("Please connect your Solana wallet first");
      return;
    }

    if (!quoteData || !quoteData.rawQuote) {
      toast.error("No valid quote found. Please refresh.");
      return;
    }

    setIsSwapping(true);
    setErrorMessage(null);

    try {
      // 1. Build serialized transaction from backend
      const swapRes = await fetch("/api/dex/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteResponse: quoteData.rawQuote,
          userPublicKey: publicKey.toBase58(),
          wrapAndUnwrapSol: true,
          dynamicComputeUnitLimit: true,
          prioritizationFeeLamports: "auto",
        }),
      });

      const swapData = await swapRes.json();
      if (!swapRes.ok || !swapData.success || !swapData.swapTransaction) {
        throw new Error(swapData.error || "Failed to generate swap transaction");
      }

      // 2. Deserialize versioned transaction
      const swapTransactionBuf = Buffer.from(swapData.swapTransaction, "base64");
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      // 3. Prompt user wallet for 1-click signature
      const txid = await sendTransaction(transaction, connection, {
        maxRetries: 3,
        skipPreflight: false,
      });

      setLastTxId(txid);
      toast.success("Transaction submitted to Solana network!");

      // 4. Confirm transaction on-chain
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        {
          signature: txid,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      );

      toast.success(`Swap confirmed! Swapped ${inputAmount} ${inputToken.symbol} for ${outputAmount} ${outputToken.symbol}`);
      if (onSwapSuccess) onSwapSuccess(txid);

      // Refresh quote
      fetchQuote();
    } catch (err: any) {
      console.error("[Swap Execution Error]:", err);
      const msg = err.message || "Swap failed to execute.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div
      className={`rounded-2xl border border-primary/30 bg-black/80 backdrop-blur-xl shadow-2xl overflow-hidden font-mono ${
        compact ? "p-4 max-w-md w-full" : "p-6 max-w-lg w-full"
      } ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-bold text-xs uppercase tracking-wider text-white">
            {compact ? "AI Suggested Swap" : "DEX Aggregator // Jupiter v6"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchQuote}
            className="text-zinc-400 hover:text-white transition-colors"
            title="Refresh quote"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQuote ? "animate-spin text-primary" : ""}`} />
          </button>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 font-bold">
            0.5% Slippage
          </span>
        </div>
      </div>

      {/* Input Box */}
      <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/10 mb-2">
        <div className="flex justify-between items-center text-[11px] text-zinc-400 mb-1.5 font-sans">
          <span>You Pay</span>
          <span className="text-zinc-500 font-mono">Decimals: {inputToken.decimals}</span>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="0.0"
            step="any"
            min="0"
            className="bg-transparent border-none text-xl font-bold font-mono text-white p-0 h-auto focus-visible:ring-0 focus-visible:outline-none"
            disabled={isSwapping}
          />
          <select
            value={inputToken.symbol}
            onChange={(e) => {
              const selected = SUPPORTED_TOKENS.find((t) => t.symbol === e.target.value);
              if (selected) setInputToken(selected);
            }}
            className="bg-zinc-900 border border-white/20 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-primary/50 transition-colors"
          >
            {SUPPORTED_TOKENS.map((token) => (
              <option key={token.symbol} value={token.symbol} className="bg-zinc-950 text-white">
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Flip Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          type="button"
          onClick={handleFlipTokens}
          className="w-8 h-8 rounded-full bg-zinc-900 border border-primary/40 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
          title="Switch pay/receive tokens"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Output Box */}
      <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-white/10 mt-2 mb-4">
        <div className="flex justify-between items-center text-[11px] text-zinc-400 mb-1.5 font-sans">
          <span>You Receive (Estimated)</span>
          {isLoadingQuote ? (
            <span className="text-[10px] text-amber-400 flex items-center gap-1">
              <Loader2 className="w-2.5 h-2.5 animate-spin" /> Routing...
            </span>
          ) : quoteData?.priceImpactPct ? (
            <span className="text-[10px] text-emerald-400 font-mono">
              Impact: {parseFloat(quoteData.priceImpactPct).toFixed(2)}%
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 text-xl font-bold font-mono text-emerald-400 overflow-hidden text-ellipsis">
            {outputAmount || "0.00"}
          </div>
          <select
            value={outputToken.symbol}
            onChange={(e) => {
              const selected = SUPPORTED_TOKENS.find((t) => t.symbol === e.target.value);
              if (selected) setOutputToken(selected);
            }}
            className="bg-zinc-900 border border-white/20 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer hover:border-primary/50 transition-colors"
          >
            {SUPPORTED_TOKENS.map((token) => (
              <option key={token.symbol} value={token.symbol} className="bg-zinc-950 text-white">
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="p-2.5 mb-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="truncate">{errorMessage}</span>
        </div>
      )}

      {/* Success Notice */}
      {lastTxId && (
        <div className="p-2.5 mb-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Confirmed on-chain
          </span>
          <a
            href={`https://solscan.io/tx/${lastTxId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
          >
            Solscan <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Swap Button */}
      <Button
        onClick={handleExecuteSwap}
        disabled={isSwapping || isLoadingQuote || !outputAmount || parseFloat(outputAmount) <= 0}
        className="w-full h-11 font-bold tracking-wider text-xs uppercase bg-primary hover:bg-primary/80 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-primary/50"
      >
        {isSwapping ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing Transaction...
          </>
        ) : !connected ? (
          "Connect Wallet to Swap"
        ) : (
          <>
            <Zap className="w-4 h-4 mr-2 text-amber-400" />
            Execute Swap ({inputToken.symbol} &rarr; {outputToken.symbol})
          </>
        )}
      </Button>

      {/* Security Tag */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Non-custodial &bull; Audited Jupiter v6 Smart Contract Routing</span>
      </div>
    </div>
  );
}
