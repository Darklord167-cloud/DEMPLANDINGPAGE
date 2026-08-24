"use client";

import { motion } from "motion/react";
import { Copy, CheckCircle, ExternalLink, Database, Shield, Flame, Vote, Sparkles, Layers, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { JupiterSwapWidget } from "@/components/JupiterSwapWidget";
import { SolanaVerificationHub } from "@/components/SolanaVerificationHub";
import { DEMP_TOKEN_MINT, DEMP_DEPLOYER_WALLET, DEMP_SUPPLY_ENDPOINT } from "@/lib/solana/config";
import { EVM_DARKCOIN_CONFIG } from "@/lib/evm/config";

const SUPPLY_ENDPOINT = DEMP_SUPPLY_ENDPOINT;

export function TokenInfo() {
  const [activeTab, setActiveTab] = useState<"evm" | "solana">("solana");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const { toast } = useToast();
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({
      title: "Copied to clipboard",
      description: `${label} copied.`
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <section id="token" className="py-24 relative bg-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      <div className="container px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-primary font-mono tracking-widest text-sm mb-3">{"///"} MULTI-CHAIN PROTOCOL SUITE</h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            TOKENOMICS & VERIFIED CONTRACTS
          </h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            The Dark Empire ecosystem operates across decentralized chains, combining Ethereum DeFi governance &amp; staking with Solana high-speed liquidity and trading utilities.
          </p>

          {/* Chain Switcher Tabs */}
          <div className="inline-flex p-1.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md mt-6 gap-2">
            <button
              onClick={() => setActiveTab("evm")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-heading font-bold text-sm transition-all ${
                activeTab === "evm"
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] border border-primary/50"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              ETHEREUM SEPOLIA (DARKCOIN)
            </button>
            <button
              onClick={() => setActiveTab("solana")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-heading font-bold text-sm transition-all ${
                activeTab === "solana"
                  ? "bg-[#14F195] text-black shadow-[0_0_20px_rgba(20,241,149,0.5)] font-black"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[#14F195]" />
              SOLANA ($DEMP ECOSYSTEM)
            </button>
          </div>
        </div>

        {/* TAB 1: EVM ETHEREUM / SEPOLIA (DARKCOIN & TOKENTRACE) */}
        {activeTab === "evm" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-16"
          >
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    NETWORK: ETHEREUM SEPOLIA
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE ON-CHAIN
                  </span>
                </div>

                <h4 className="text-3xl md:text-4xl font-display font-bold text-white">
                  DARKCOIN ($DARK) &amp; DAO COUNCIL
                </h4>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Institutional-grade EVM governance stack featuring fixed 666,666,666 supply, checkpointed voting tokens (DVOTE), 24-hour timelock execution security, and fee-exempt staking vaults.
                </p>

                {/* Deployed Contract Cards Grid */}
                <div className="space-y-3">
                  {/* DarkCoin Contract */}
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono text-white/50 uppercase tracking-wider">DarkCoin ($DARK) Token (666.66M Total Supply)</span>
                      <a href={`${EVM_DARKCOIN_CONFIG.explorerBaseUrl}/address/${EVM_DARKCOIN_CONFIG.contracts.darkToken}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        Etherscan <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <code className="text-primary font-mono text-sm break-all font-semibold">
                        {EVM_DARKCOIN_CONFIG.contracts.darkToken}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(EVM_DARKCOIN_CONFIG.contracts.darkToken, "DarkCoin Address", "darkToken")}
                        className="hover:bg-primary/20 text-primary shrink-0 h-8 w-8"
                      >
                        {copiedKey === "darkToken" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* DarkCouncil Governance Contract */}
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono text-white/50 uppercase tracking-wider">DarkCouncil (Governor Contract)</span>
                      <a href={`${EVM_DARKCOIN_CONFIG.explorerBaseUrl}/address/${EVM_DARKCOIN_CONFIG.contracts.darkCouncil}`} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-300 hover:underline flex items-center gap-1">
                        Etherscan <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <code className="text-purple-300 font-mono text-sm break-all font-semibold">
                        {EVM_DARKCOIN_CONFIG.contracts.darkCouncil}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(EVM_DARKCOIN_CONFIG.contracts.darkCouncil, "DarkCouncil Address", "darkCouncil")}
                        className="hover:bg-purple-500/20 text-purple-300 shrink-0 h-8 w-8"
                      >
                        {copiedKey === "darkCouncil" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Timelock Controller */}
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono text-white/50 uppercase tracking-wider">Timelock Controller (24h Delay)</span>
                      <a href={`${EVM_DARKCOIN_CONFIG.explorerBaseUrl}/address/${EVM_DARKCOIN_CONFIG.contracts.timelock}`} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:underline flex items-center gap-1">
                        Etherscan <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <code className="text-amber-400 font-mono text-sm break-all font-semibold">
                        {EVM_DARKCOIN_CONFIG.contracts.timelock}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(EVM_DARKCOIN_CONFIG.contracts.timelock, "Timelock Address", "timelock")}
                        className="hover:bg-amber-400/20 text-amber-400 shrink-0 h-8 w-8"
                      >
                        {copiedKey === "timelock" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* DarkVotes (DVOTE) */}
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-mono text-white/50 uppercase tracking-wider">DarkVotes (DVOTE) Checkpointed Token</span>
                      <a href={`${EVM_DARKCOIN_CONFIG.explorerBaseUrl}/address/${EVM_DARKCOIN_CONFIG.contracts.darkVotes}`} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                        Etherscan <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <code className="text-cyan-400 font-mono text-sm break-all font-semibold">
                        {EVM_DARKCOIN_CONFIG.contracts.darkVotes}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(EVM_DARKCOIN_CONFIG.contracts.darkVotes, "DarkVotes Address", "darkVotes")}
                        className="hover:bg-cyan-400/20 text-cyan-400 shrink-0 h-8 w-8"
                      >
                        {copiedKey === "darkVotes" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-4">
                  <Button asChild className="bg-primary hover:bg-primary/90 text-white font-bold font-heading px-8 py-6 text-base shadow-[0_0_25px_rgba(168,85,247,0.5)]">
                    <a href={EVM_DARKCOIN_CONFIG.tokentraceDappUrl} target="_blank" rel="noopener noreferrer">
                      LAUNCH TOKENTRACE DAPP <ArrowUpRight className="ml-2 h-5 w-5" />
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="border-primary/50 text-white hover:bg-primary/20 font-bold px-6 py-6 text-base">
                    <a href={`${EVM_DARKCOIN_CONFIG.explorerBaseUrl}/address/${EVM_DARKCOIN_CONFIG.contracts.darkToken}`} target="_blank" rel="noopener noreferrer">
                      VIEW ON ETHERSCAN <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Right Side Visual Banner & Metrics */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-8 rounded-2xl border border-primary/30 bg-gradient-to-b from-purple-950/40 via-black to-black backdrop-blur-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h5 className="text-xl font-heading font-bold text-white">SITH GOVERNANCE</h5>
                      <p className="text-xs text-primary font-mono">100% TIMELOCK SECURED</p>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono text-sm">
                    <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                      <span className="text-white/60">Fixed Max Supply</span>
                      <span className="text-white font-bold">666,666,666 DARK</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                      <span className="text-white/60">Governance Quorum</span>
                      <span className="text-emerald-400 font-bold">4% (26.66M DVOTE)</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                      <span className="text-white/60">Voting Period</span>
                      <span className="text-cyan-400 font-bold">75 Blocks (Testnet)</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 flex justify-between items-center">
                      <span className="text-white/60">Timelock Min Delay</span>
                      <span className="text-amber-400 font-bold">24 Hours (86,400s)</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-xl border border-primary/20 bg-primary/10 text-xs text-muted-foreground leading-relaxed">
                    💡 <strong className="text-white">Live Status:</strong> Sepolia governance contracts are compiled, verified, and active. Community proposals can be voted upon via the TokenTrace interface.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: SOLANA ($DEMP ECOSYSTEM) */}
        {activeTab === "solana" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-16"
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    NETWORK: SOLANA MAINNET
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    V2 TGE IN PREPARATION
                  </span>
                </div>

                <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                  THE $DEMP TOKEN
                </h3>
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  The native high-throughput utility token for the Dark Empire Solana ecosystem, powering VIP bot execution, Birdeye real-time telemetry, and decentralized fee burns.
                </p>

                {/* Honest & Transparent Note */}
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm mb-6 leading-relaxed">
                  <strong>📢 Official Deployment Notice:</strong> The Dark Empire team is preparing the clean <strong>$DEMP V2 Token Generation Event</strong> minted directly from the official deployer wallet. Full token allocation will be held by the deployer authority upon launch.
                </div>

                <div className="space-y-4">
                  <div className="p-6 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm space-y-4">
                    <div>
                      <p className="text-xs text-white/50 mb-1 font-mono uppercase tracking-wider">CURRENT MINT ADDRESS (SOL SPL)</p>
                      <div className="flex items-center justify-between gap-4">
                        <code className="text-primary font-mono text-sm md:text-base break-all" data-testid="text-contract-address">
                          {DEMP_TOKEN_MINT}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(DEMP_TOKEN_MINT, "Contract Address", "solContract")}
                          className="hover:bg-primary/20 text-primary shrink-0"
                          data-testid="button-copy-contract"
                        >
                          {copiedKey === "solContract" ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs text-white/50 mb-1 font-mono uppercase tracking-wider">OFFICIAL DEPLOYER WALLET (AUTHORITY)</p>
                      <div className="flex items-center justify-between gap-4">
                        <code className="text-emerald-400 font-mono text-sm md:text-base break-all" data-testid="text-deployer-address">
                          {DEMP_DEPLOYER_WALLET}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(DEMP_DEPLOYER_WALLET, "Deployer Address", "solDeployer")}
                          className="hover:bg-emerald-500/20 text-emerald-400 shrink-0"
                          data-testid="button-copy-deployer"
                        >
                          {copiedKey === "solDeployer" ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 font-mono text-xs">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      SOLANA READY
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 font-mono text-xs">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      METAPLEX SYNCED
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="relative w-64 h-64 md:w-96 md:h-96">
                  <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-[spin_10s_linear_infinite]" />
                  <div className="absolute inset-4 rounded-full border border-secondary/30 animate-[spin_15s_linear_infinite_reverse]" />
                  <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-2 border-primary/50 shadow-[0_0_50px_rgba(168,85,247,0.5)]"
                      initial={{ rotate: -10 }}
                      animate={{ rotate: 10 }}
                      transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    >
                      <Image 
                        src="/assets/demp-logo.svg" 
                        alt="$DEMP Token Icon"
                        width={256}
                        height={256}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Jupiter Swap Widget Section */}
            <div className="mt-12 max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h4 className="text-2xl font-heading font-bold text-white uppercase tracking-wider mb-2">Liquidity Bridge &amp; Instant Swap</h4>
                <p className="text-muted-foreground font-mono text-sm max-w-2xl mx-auto">
                  Route and swap Solana assets directly using Jupiter&apos;s decentralized liquidity aggregator.
                </p>
              </div>
              <JupiterSwapWidget />
            </div>

            {/* Supply Transparency Section */}
            <div id="supply" className="mt-16 max-w-4xl mx-auto">
              <div className="p-1 rounded-2xl bg-gradient-to-r from-primary/30 via-transparent to-primary/30">
                <div className="bg-black/90 backdrop-blur-xl rounded-xl p-8 md:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-heading font-bold text-white">SUPPLY TRANSPARENCY</h4>
                      <p className="text-xs text-primary font-mono tracking-widest">{"///"} PUBLIC VERIFICATION</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="p-5 rounded-lg border border-white/10 bg-white/5">
                      <p className="text-sm text-white/50 font-mono mb-1">TOTAL / MAX SUPPLY</p>
                      <p className="text-3xl font-display font-bold text-white" data-testid="text-circulating-supply">
                        1,000,000,000
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">$DEMP Tokens</p>
                    </div>
                    <div className="p-5 rounded-lg border border-white/10 bg-white/5">
                      <p className="text-sm text-white/50 font-mono mb-1">VERIFICATION ENDPOINT</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        <span className="text-green-400 font-heading font-bold text-lg">LIVE &amp; PUBLIC</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">JSON API accessible 24/7</p>
                    </div>
                  </div>

                  <div className="p-5 rounded-lg border border-primary/20 bg-primary/5">
                    <p className="text-sm text-primary/80 mb-2 font-mono">PUBLIC JSON ENDPOINT</p>
                    <div className="flex items-center gap-3">
                      <code className="flex-1 text-primary font-mono text-sm break-all" data-testid="text-supply-endpoint">
                        {SUPPLY_ENDPOINT}
                      </code>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(SUPPLY_ENDPOINT, "Supply Endpoint", "endpoint")}
                          className="hover:bg-primary/20 text-primary"
                          data-testid="button-copy-endpoint"
                        >
                          {copiedKey === "endpoint" ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="hover:bg-primary/20 text-primary"
                          data-testid="button-open-endpoint"
                        >
                          <a href={SUPPLY_ENDPOINT} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Solana Verification Hub */}
            <div id="verification-suite" className="mt-16 max-w-5xl mx-auto">
              <SolanaVerificationHub />
            </div>
          </motion.div>
        )}

      </div>
    </section>
  );
}
