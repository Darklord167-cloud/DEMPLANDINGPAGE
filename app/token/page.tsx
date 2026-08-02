import { Metadata } from 'next';
import { TokenInfo } from "@/components/sections/TokenInfo";
import { TokenomicsVisualizer } from "@/components/TokenomicsVisualizer";

export const metadata: Metadata = {
  title: '$DEMP Tokenomics & Utility | Dark Empire HQ',
  description: 'Explore $DEMP Solana tokenomics, contract address, total supply distribution, liquidity pools, and VIP tier utility.',
};

export default function TokenPage() {
  return (
    <div className="space-y-12">
      <TokenInfo />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <TokenomicsVisualizer />
      </div>
    </div>
  );
}

