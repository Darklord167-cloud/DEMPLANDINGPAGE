"use client";

import { motion } from "motion/react";
import { Copy, CheckCircle, ExternalLink, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { JupiterSwapWidget } from "@/components/JupiterSwapWidget";

const SUPPLY_ENDPOINT = "https://empire-token-supply.replit.app/api/supply.json";

export function TokenInfo() {
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState(false);
  const [copiedIcon, setCopiedIcon] = useState(false);
  const [copiedBanner, setCopiedBanner] = useState(false);
  const contractAddress = "8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx";
  const { toast } = useToast();
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const copy = (text: string, type: "contract" | "endpoint" | "icon" | "banner") => {
    navigator.clipboard.writeText(text);
    
    let setter;
    switch (type) {
      case "contract": setter = setCopiedContract; break;
      case "endpoint": setter = setCopiedEndpoint; break;
      case "icon": setter = setCopiedIcon; break;
      case "banner": setter = setCopiedBanner; break;
    }
    
    setter(true);
    toast({
      title: "Copied to clipboard",
      description: `${type === "contract" ? "Contract address" : type === "endpoint" ? "Supply endpoint" : type === "icon" ? "Icon URL" : "Banner URL"} copied.`
    });
    setTimeout(() => setter(false), 2000);
  };

  return (
    <section id="token" className="py-24 relative bg-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      
      <div className="container px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-primary font-mono tracking-widest text-sm mb-4">{"///"} ASSET VERIFICATION</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              THE $DEMP TOKEN
            </h3>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              The native utility token of the Dark Empire ecosystem.
              Hold $DEMP to access premium features, voting rights in the DAO,
              and exclusive drops from our holdings.
            </p>

            <div className="space-y-4">
              <div className="p-6 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
                <p className="text-sm text-white/50 mb-2 font-mono">CONTRACT ADDRESS (SOL)</p>
                <div className="flex items-center justify-between gap-4">
                  <code className="text-primary font-mono text-sm md:text-base break-all" data-testid="text-contract-address">
                    {contractAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copy(contractAddress, "contract")}
                    className="hover:bg-primary/20 text-primary shrink-0"
                    data-testid="button-copy-contract"
                  >
                    {copiedContract ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                 <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 font-mono text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    SOLANA VERIFIED
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 font-mono text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    LIQUIDITY LOCKED
                 </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative flex items-center justify-center"
          >
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
          </motion.div>
        </div>

        {/* Jupiter Swap Widget Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="text-center mb-10">
            <h4 className="text-2xl font-heading font-bold text-white uppercase tracking-wider mb-2">Liquidity Bridge & Instant Swap</h4>
            <p className="text-muted-foreground font-mono text-sm max-w-2xl mx-auto">
              Swap any Solana assets directly for $DEMP using Jupiter&apos;s optimized routing engine.
            </p>
          </div>
          
          <JupiterSwapWidget />
        </motion.div>

        {/* Tokenomics Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="text-center mb-10">
            <h4 className="text-2xl font-heading font-bold text-white uppercase tracking-wider mb-2">Tokenomics Architecture</h4>
            <p className="text-muted-foreground font-mono text-sm max-w-2xl mx-auto">
              Engineered for sustained ecosystem growth and value accrual.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-white/10 bg-black/50 backdrop-blur hover:border-primary/50 transition-colors">
              <h5 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" /> Staking Rewards
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vault your $DEMP to earn passive yield. Staking periods multiply your APR and grant proportional shares of ecosystem transaction fees.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-white/10 bg-black/50 backdrop-blur hover:border-red-500/50 transition-colors">
              <h5 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Deflationary Burns
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                2% of all platform service fees are systematically burned, permanently removing $DEMP from circulation and increasing scarcity over time.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-white/10 bg-black/50 backdrop-blur hover:border-[#0088cc]/50 transition-colors">
              <h5 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#0088cc]" /> Protocol Governance
              </h5>
              <p className="text-sm text-muted-foreground leading-relaxed">
                $DEMP holdings represent verified voting power. Shape the roadmap, allocate the community treasury, and dictate the Empire&apos;s future.
              </p>
            </div>
          </div>
        </motion.div>

        {/* DAO Governance Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="p-1 rounded-2xl bg-gradient-to-br from-primary/30 via-transparent to-primary/10">
            <div className="bg-black/90 backdrop-blur-xl rounded-xl p-8 md:p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-display font-bold text-white mb-4 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    DAO GOVERNANCE
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    The Dark Empire is ruled by its citizens. $DEMP token holders wield direct influence over the protocol through on-chain proposals and secure voting mechanisms.
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-full border border-primary/50 bg-primary/10 flex items-center justify-center text-primary font-mono font-bold">
                        1
                      </div>
                      <div>
                        <h5 className="text-white font-bold mb-1">Proposal Submission</h5>
                        <p className="text-sm text-muted-foreground">Any citizen holding a minimum threshold of $DEMP can submit a Dark Proposal detailing protocol upgrades or treasury allocations.</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-full border border-primary/50 bg-primary/10 flex items-center justify-center text-primary font-mono font-bold">
                        2
                      </div>
                      <div>
                        <h5 className="text-white font-bold mb-1">On-Chain Voting</h5>
                        <p className="text-sm text-muted-foreground">Votes correspond to held $DEMP across connected wallets. Engage your tokens securely over Solana to cast your ballot.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="h-10 w-10 shrink-0 rounded-full border border-primary/50 bg-primary/10 flex items-center justify-center text-primary font-mono font-bold">
                        3
                      </div>
                      <div>
                        <h5 className="text-white font-bold mb-1">Automated Execution</h5>
                        <p className="text-sm text-muted-foreground">Passed proposals are routed to executable smart contracts, automatically enforcing community consensus and decentralized control.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
                  <div className="relative border border-white/10 bg-black/60 backdrop-blur-md rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-sm font-mono text-white/50 tracking-widest">ACTIVE PROPOSAL #042</h4>
                      <span className="px-2 py-1 text-xs font-mono rounded bg-green-500/20 text-green-400 border border-green-500/30">VOTING OPEN</span>
                    </div>
                    
                    <h5 className="text-xl font-bold text-white mb-2">Liquidity Pool Expansion Phase 2</h5>
                    <p className="text-sm text-muted-foreground mb-6">Allocate 5% of treasury funds to pair $DEMP alongside USDC on major Solana DEXs to stabilize price volatility.</p>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-white">FOR</span>
                          <span className="text-primary">82%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: '82%' }} />
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-xs font-mono mb-1">
                          <span className="text-white">AGAINST</span>
                          <span className="text-red-500">18%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500" style={{ width: '18%' }} />
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold font-heading">
                      CONNECT WALLET TO VOTE
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Supply Transparency Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          id="supply"
          className="mt-20 max-w-4xl mx-auto"
        >
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
                  <p className="text-sm text-white/50 font-mono mb-1">CIRCULATING SUPPLY</p>
                  <p className="text-3xl font-display font-bold text-white" data-testid="text-circulating-supply">
                    1,000,000,000
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">$DEMP Tokens</p>
                </div>
                <div className="p-5 rounded-lg border border-white/10 bg-white/5">
                  <p className="text-sm text-white/50 font-mono mb-1">VERIFICATION STATUS</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    <span className="text-green-400 font-heading font-bold text-lg">LIVE & PUBLIC</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">JSON endpoint accessible 24/7</p>
                </div>
              </div>

              <div className="p-5 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-sm text-primary/80 mb-4 font-mono">ASSET METADATA (FOR BIRDEYE/DEX)</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-tighter mb-1">Token Icon URL</p>
                    <div className="flex gap-2">
                       <code className="text-[10px] text-primary truncate flex-1 font-mono">{baseUrl}/assets/demp-logo.svg</code>
                       <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => copy(`${baseUrl}/assets/demp-logo.svg`, "icon")}>
                          {copiedIcon ? <CheckCircle className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />} COPY
                       </Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/50 uppercase tracking-tighter mb-1">OG Banner URL</p>
                    <div className="flex gap-2">
                       <code className="text-[10px] text-primary truncate flex-1 font-mono">{baseUrl}/assets/demp-banner.svg</code>
                       <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => copy(`${baseUrl}/assets/demp-banner.svg`, "banner")}>
                          {copiedBanner ? <CheckCircle className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />} COPY
                       </Button>
                    </div>
                  </div>
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
                      onClick={() => copy(SUPPLY_ENDPOINT, "endpoint")}
                      className="hover:bg-primary/20 text-primary"
                      data-testid="button-copy-endpoint"
                    >
                      {copiedEndpoint ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
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

              <p className="text-xs text-muted-foreground mt-4 font-mono text-center">
                This endpoint is designed for CoinMarketCap, CoinGecko, and third-party aggregator integrations.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
