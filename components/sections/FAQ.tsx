"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";

const CONTRACT = "8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx";
const SOLSCAN_URL = `https://solscan.io/token/${CONTRACT}`;
const SUPPLY_ENDPOINT = "https://empire-token-supply.replit.app/api/supply.json";

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

const faqs: FaqItem[] = [
  {
    question: "Where can I verify the $DEMP Token contract?",
    answer: (
      <>
        The official $DEMP token contract on Solana is <code className="text-primary font-mono text-sm bg-primary/10 px-1 rounded">{CONTRACT}</code>. You can verify this directly on{" "}
        <a href={SOLSCAN_URL} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
          Solscan <ExternalLink className="h-3 w-3" />
        </a>{" "}
        or through our transparent on-chain verification links in the token section above.
      </>
    ),
  },
  {
    question: "How do you ensure circulating supply transparency?",
    answer: (
      <>
        The total circulating supply of $DEMP is 1,000,000,000 tokens. We maintain a public JSON endpoint at{" "}
        <a href={SUPPLY_ENDPOINT} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1 break-all">
          {SUPPLY_ENDPOINT} <ExternalLink className="h-3 w-3 shrink-0" />
        </a>{" "}
        that returns the live circulating supply in real time. This endpoint is designed for integration with CoinMarketCap, CoinGecko, and any third-party aggregator. You can copy and visit this endpoint directly from our Supply Transparency panel above.
      </>
    ),
  },
  {
    question: "What are the plans for the Dark Empire Wallet?",
    answer: "The Dark Empire Proprietary Wallet is currently in closed beta. It focuses on multi-signature security, direct $DEMP integration, and will feature native stealth addresses for enhanced privacy during ecosystem transactions.",
  },
  {
    question: "How does Dark Empire integrate with Google Cloud, Azure, and Squarespace?",
    answer: "We employ a hybrid Web2.5 infrastructure. Google Cloud and Azure power our high-frequency trading nodes and decentralized API endpoints for maximum uptime. Meanwhile, our Squarespace integration allows traditional e-commerce merchants to accept $DEMP seamlessly via our custom payment gateway plugins.",
  },
  {
    question: "What is the difference between DarkCoin and $DEMP?",
    answer: "DarkCoin serves as the Empire's treasury reserve and primary store of value with deflationary tokenomics. $DEMP is our utility token used for operational transactions, governance, fee payments, and accessing premium tools within the ecosystem.",
  },
  {
    question: "Where can I find verification links and public supply data?",
    answer: (
      <>
        All verification assets are consolidated on this HQ dashboard. The Token section displays the verified Solana contract address with a one-click copy button and a direct link to{" "}
        <a href={SOLSCAN_URL} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
          Solscan <ExternalLink className="h-3 w-3" />
        </a>. Directly below, the Supply Transparency panel shows the circulating supply of 1,000,000,000 $DEMP and provides the official public JSON endpoint with copy and external-link buttons.
      </>
    ),
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-background relative border-t border-white/5">
      <div className="container px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-primary font-mono tracking-widest text-sm mb-4">{"///"} KNOWLEDGE BASE</h2>
          <h3 className="text-4xl font-display font-bold text-white">
            FREQUENTLY ASKED QUESTIONS
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-xl overflow-hidden transition-colors duration-300 ${openIndex === index ? "border-primary/50 bg-primary/5" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
            >
              <button
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                data-testid={`button-faq-${index}`}
              >
                <span className="font-heading font-bold text-lg text-white/90">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-primary transition-transform duration-300 shrink-0 ml-4 ${openIndex === index ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
