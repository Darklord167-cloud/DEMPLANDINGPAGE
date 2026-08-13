"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState, useMemo } from "react";
import { ChevronDown, ExternalLink, HelpCircle, Search, ShieldCheck, Sparkles, Coins, Layers, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { DEMP_SUPPLY_ENDPOINT } from "@/lib/solana/config";

const CONTRACT = "8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx";
const SOLSCAN_URL = `https://solscan.io/token/${CONTRACT}`;
const SUPPLY_ENDPOINT = DEMP_SUPPLY_ENDPOINT;

interface FaqItem {
  category: "contract" | "security" | "swap" | "governance" | "entity";
  question: string;
  answer: React.ReactNode;
}

const faqs: FaqItem[] = [
  {
    category: "contract",
    question: "Where can I verify the official $DEMP Token contract address and Deployer Wallet?",
    answer: (
      <>
        The official $DEMP token contract deployed on Solana mainnet-beta is{" "}
        <code className="text-purple-300 font-mono text-xs bg-purple-950/80 px-2.5 py-1 rounded border border-purple-500/40 font-bold select-all break-all inline-block my-1">
          {CONTRACT}
        </code>
        {" "}and the verified Deployer Authority wallet is{" "}
        <code className="text-emerald-300 font-mono text-xs bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/40 font-bold select-all break-all inline-block my-1">
          Gy37g7iDGQiom6wwVcyHKVuZPZzmVTgwa3wJZQTRqqTH
        </code>
        . You can independently verify token mint authority, 100% locked liquidity, and transaction history on{" "}
        <a href={SOLSCAN_URL} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 underline font-semibold inline-flex items-center gap-1">
          Solscan Explorer <ExternalLink className="h-3.5 w-3.5" />
        </a>{" "}
        or directly in our Asset Verification portal.
      </>
    ),
  },
  {
    category: "contract",
    question: "How do you ensure circulating supply transparency for aggregators?",
    answer: (
      <>
        The circulating supply of $DEMP is fixed at 1,000,000,000 tokens. We maintain a public 24/7 JSON API endpoint at{" "}
        <a href={SUPPLY_ENDPOINT} target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 underline font-semibold inline-flex items-center gap-1 break-all">
          {SUPPLY_ENDPOINT} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>{" "}
        that feeds live supply data directly to CoinMarketCap, CoinGecko, Birdeye, and DexScreener indexers.
      </>
    ),
  },
  {
    category: "swap",
    question: "How does Jupiter DEX Swap integration work on Dark Empire?",
    answer: (
      <>
        We embed Jupiter Protocol&apos;s smart routing engine directly into HQ. When swapping SOL or USDC for $DEMP, Jupiter queries liquidity pools across Raydium, Orca, and Meteora to give you guaranteed minimum slippage and optimal price execution without centralized intermediaries.
      </>
    ),
  },
  {
    category: "security",
    question: "What security measures and audits protect $DEMP token holders?",
    answer: (
      <>
        $DEMP features zero buy/sell taxes (0% Tax), permanently burnt mint keys (mint authority revoked), and 100% locked LP token liquidity. Our smart contracts were written using the Anchor Rust framework and underwent continuous automated security checks.
      </>
    ),
  },
  {
    category: "entity",
    question: "What is the background and registered entity of Dark Empire Lords LLC?",
    answer: (
      <>
        Dark Empire Lords LLC is a sovereign Web3 enterprise specializing in high-frequency trading infrastructure, decentralized edge gateways, and custom crypto payment processing plugins for global merchants. Our hybrid Web2.5 architecture bridges enterprise cloud reliability (Google Cloud/Azure) with Solana&apos;s lightning speed.
      </>
    ),
  },
  {
    category: "entity",
    question: "What is the difference between DarkCoin and $DEMP?",
    answer: (
      <>
        DarkCoin serves as the Empire&apos;s treasury reserve asset and primary store of value with algorithmic deflationary mechanics. $DEMP is the high-velocity operational utility token used for fee payments, ecosystem access, Jupiter swaps, and DAO governance.
      </>
    ),
  },
  {
    category: "governance",
    question: "How can token holders participate in DAO Governance & Staking?",
    answer: (
      <>
        Holding $DEMP grants proportional voting power in the Dark Empire DAO. Citizens can view active proposals in the HQ dashboard, cast on-chain votes using their connected Solana wallet, and lock tokens in Staking Vaults to earn passive yield from protocol service fee distributions.
      </>
    ),
  },
  {
    category: "security",
    question: "Are there any hidden transaction taxes or transfer fees?",
    answer: (
      <>
        No. $DEMP operates on a strict 0% Buy / 0% Sell tax model. When buying, selling, or transferring $DEMP, you only pay standard Solana network gas fees (typically &lt; $0.001 per transaction).
      </>
    ),
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "all", label: "All Questions", icon: HelpCircle },
    { id: "contract", label: "Token & Contract", icon: Coins },
    { id: "swap", label: "Jupiter DEX", icon: Sparkles },
    { id: "security", label: "Security & Tax", icon: ShieldCheck },
    { id: "governance", label: "DAO & Staking", icon: Layers },
    { id: "entity", label: "Corporate Entity", icon: ExternalLink },
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
      const matchesSearch = 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof faq.answer === "string" && faq.answer.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section id="faq" className="py-24 bg-[#050508] relative border-t border-purple-900/30">
      <div className="container px-4 sm:px-6 max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-950/40 text-purple-300 font-mono text-xs mb-4 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
            <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>{"///"} KNOWLEDGE BASE & FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white uppercase tracking-wide">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          <p className="mt-4 text-zinc-400 font-sans text-base max-w-xl mx-auto">
            Everything you need to know about the $DEMP token, smart contracts, ecosystem utility, and Dark Empire Lords LLC.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="mb-10 space-y-4">
          {/* Search Input */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search knowledge base (e.g. Contract, Tax, Jupiter, DAO)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 bg-black/70 border-purple-900/50 focus:border-purple-500 text-white rounded-xl font-mono text-sm placeholder:text-zinc-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setOpenIndex(0);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-mono font-bold tracking-wider transition-all cursor-pointer min-h-[40px] ${
                    isActive
                      ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400"
                      : "bg-zinc-950/80 text-zinc-400 hover:text-white hover:bg-zinc-900 border border-zinc-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 p-8 rounded-2xl border border-zinc-800 bg-zinc-950/50 text-zinc-400 font-mono text-sm">
            No matching questions found for &quot;{searchQuery}&quot;. Try selecting &quot;All Questions&quot;.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "border-purple-500/50 bg-purple-950/30 shadow-[0_0_30px_rgba(168,85,247,0.12)]"
                      : "border-zinc-800/80 bg-zinc-950/70 hover:bg-zinc-900/70 hover:border-purple-900/40"
                  }`}
                >
                  <button
                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer min-h-[56px]"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    data-testid={`button-faq-${index}`}
                  >
                    <span className="font-heading font-bold text-base md:text-lg text-white pr-4">
                      {faq.question}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? "bg-purple-600 text-white rotate-180" : "bg-zinc-900 text-zinc-400"}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 pt-3 text-zinc-300 text-sm md:text-base leading-relaxed border-t border-purple-900/20 font-sans">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* Back to HQ navigation helper for inner page context */}
        <div className="mt-12 text-center">
          <Button variant="ghost" asChild className="text-zinc-400 hover:text-white hover:bg-white/5 font-mono text-xs">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4 text-purple-400" /> Return to Central Command HQ
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
}

