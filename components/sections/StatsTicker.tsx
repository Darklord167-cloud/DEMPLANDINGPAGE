"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface BirdeyeData {
  data?: {
    price?: number;
    mc?: number;
    supply?: number;
  }
}

export function StatsTicker() {
  const [dempData, setDempData] = useState<{ price: string; mc: string }>({ price: "TBA", mc: "TBA" });

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const address = "8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx";
        const res = await fetch(`/api/birdeye?address=${address}`);
        if (!res.ok) {
           console.error("StatsTicker: API responded with status", res.status);
           return;
        }
        
        const text = await res.text();
        if (!text || text.includes("<!doctype html>") || text.includes("<html")) {
          // This is a standby or error page, not JSON. Silently return.
          return;
        }

        let json: BirdeyeData;
        try {
          if (!text.trim().startsWith("{")) {
             throw new Error("Response is not JSON: " + text.substring(0, 50));
          }
          json = JSON.parse(text);
        } catch (e: any) {
          console.warn("StatsTicker: Failed to parse Birdeye JSON", e.message);
          return;
        }
        
        if (json.data && typeof json.data.price === 'number') {
           setDempData({
             price: `$${json.data.price.toFixed(6)}`,
             mc: json.data.mc ? `$${(json.data.mc / 1000000).toFixed(2)}M` : "TBA",
           });
        }
      } catch (err: any) {
        console.error("Failed to fetch $DEMP data:", err?.message || err);
      }
    };

    fetchTokenData();
    // Refresh every 60 seconds
    const interval = setInterval(fetchTokenData, 60000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "CIRCULATING SUPPLY", value: "1,000,000,000 $DEMP" },
    { label: "NETWORK", value: "SOLANA" },
    { label: "$DEMP PRICE", value: dempData.price },
    { label: "MARKET CAP", value: dempData.mc },
    { label: "LIQUIDITY STATUS", value: "LOCKED" },
    { label: "CONTRACT STATUS", value: "SOL VERIFIED" },
  ];

  return (
    <div className="w-full bg-primary/10 border-y border-primary/20 overflow-hidden py-3 backdrop-blur-sm relative z-30">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 25,
        }}
      >
        {[...stats, ...stats, ...stats, ...stats].map((stat, i) => (
          <div key={i} className="flex items-center mx-8 gap-3">
            <span className="text-primary font-mono text-xs font-bold tracking-widest opacity-70">
              {stat.label}
            </span>
            <span className="text-white font-heading font-bold text-lg">
              {stat.value}
            </span>
            <span className="text-white/20">{"///"}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
