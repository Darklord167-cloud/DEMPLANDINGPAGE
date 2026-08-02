import { Metadata } from 'next';
import { TokenInfo } from "@/components/sections/TokenInfo";

export const metadata: Metadata = {
  title: '$DEMP Tokenomics & Utility | Dark Empire HQ',
  description: 'Explore $DEMP Solana tokenomics, contract address, total supply distribution, liquidity pools, and VIP tier utility.',
};

export default function TokenPage() {
  return (
    <TokenInfo />
  );
}

