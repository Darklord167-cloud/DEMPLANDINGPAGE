import { ArrowLeft, Target, Shield, Coins, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WhitepaperPage() {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl min-h-screen">
      <div className="mb-10">
        <Button variant="ghost" asChild className="mb-6 hover:bg-white/5 text-muted-foreground hover:text-white">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to HQ
          </Link>
        </Button>
        <h1 className="text-4xl md:text-6xl font-display font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-white uppercase mb-4 text-shadow-glow">
          $DEMP Whitepaper
        </h1>
        <p className="text-xl text-muted-foreground font-mono">
          VERSION 1.0.0 | DARK EMPIRE HOLDINGS
        </p>
      </div>

      <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-a:text-primary max-w-none prose-headings:font-heading prose-h2:tracking-wider prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-12 shadow-[0_0_30px_-5px_rgba(168,85,247,0.15)]">
          <h2 className="!mt-0 !border-0 text-primary">Executive Summary</h2>
          <p className="text-lg leading-relaxed">
            Dark Empire ($DEMP) is a utility and governance token native to the Solana blockchain, designed to serve as the backbone for the overarching Dark Empire decentralized ecosystem.
            The ecosystem aims to bridge next-generation digital sovereignty, high-performance decentralized finance, and cutting-edge cybersecurity features, providing its community&mdash;the &quot;Dark Empire Lords&quot;&mdash;with exclusive access, governance rights, and economic incentives.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-black/50 border border-white/10 p-6 rounded-lg">
            <Target className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Our Vision</h3>
            <p className="text-sm text-gray-400">
              To establish a decentralized empire where users have ultimate control over their digital assets, identity, and data, powered by the incredible speed and low costs of the Solana network.
            </p>
          </div>
          <div className="bg-black/50 border border-white/10 p-6 rounded-lg">
            <Shield className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Core Security</h3>
            <p className="text-sm text-gray-400">
              Dark Empire relies on state-of-the-art cryptography, continuous smart contract auditing, and real-time monitoring via partners like GeckoTerminal to ensure asset safety.
            </p>
          </div>
        </div>

        <h2>1. Introduction</h2>
        <p>
          The transition from Web2 to Web3 has exposed critical flaws in how user data is managed and how value is distributed. Dark Empire is built to address these inefficiencies by creating a vertically integrated ecosystem on Solana. By leveraging Solana&apos;s parallel processing capabilities, $DEMP offers near-instant transaction finality and fractional transaction costs.
        </p>

        <h2>2. The $DEMP Token</h2>
        <p>
          $DEMP is an SPL token on the Solana network. It functions as the primary medium of exchange, utility, and governance across all Dark Empire applications.
        </p>
        <ul>
          <li><strong>Contract Address:</strong> <code>8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx</code></li>
          <li><strong>Network:</strong> Solana</li>
          <li><strong>Total Supply:</strong> 1,000,000,000 $DEMP</li>
        </ul>

        <h3>2.1 Token Utility</h3>
        <p>
          Holders of the $DEMP token unlock several key functionalities within the Dark Empire ecosystem:
        </p>
        <ul>
          <li><strong>Access to HQ Features:</strong> Premium tools, AI Oracle queries, and advanced analytics are restricted to $DEMP holders.</li>
          <li><strong>Governance:</strong> Propose and vote on network upgrades, treasury allocations, and future partnerships.</li>
          <li><strong>Staking Rewards:</strong> Users can lock their $DEMP in specialized vault contracts to earn yield and exclusive NFTs.</li>
        </ul>

        <h2>3. Tokenomics & Distribution</h2>
        <p>
          The total supply of 1,000,000,000 $DEMP guarantees sufficient liquidity to onboard millions of users while maintaining scarcity. The distribution is meticulously designed to align incentives among early adopters, the core development team, and long-term ecosystem growth.
        </p>

        <div className="not-prose my-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">40%</div>
              <div className="text-xs text-gray-400 uppercase tracking-widest">Liquidity & Exchanges</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">30%</div>
              <div className="text-xs text-gray-400 uppercase tracking-widest">Ecosystem & Rewards</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">15%</div>
              <div className="text-xs text-gray-400 uppercase tracking-widest">Development Fund</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">15%</div>
              <div className="text-xs text-gray-400 uppercase tracking-widest">Core Team (Vested)</div>
            </div>
          </div>
        </div>

        <h2>4. Architecture & Technology</h2>
        <p>
          Choosing Solana was a strategic decision. Unlike other blockchains that suffer from network congestion, Solana&apos;s Proof of History (PoH) consensus mechanism allows Dark Empire to scale without sacrificing decentralization or security.
        </p>
        <p>
          Our smart contracts are written in Rust using the Anchor framework, providing robust memory safety and preventing common vulnerabilities. All contracts undergo rigorous peer review and third-party audits before deployment.
        </p>

        <h2>5. Roadmap</h2>
        <p>
          Dark Empire&apos;s development is broken down into strategic phases designed to build momentum and deliver continuous value to our community.
        </p>
        <ul>
          <li><strong>Phase 1: Genesis.</strong> Token Generation Event, Initial DEX Offering (IDO), Core HQ deployment, Community Building.</li>
          <li><strong>Phase 2: Expansion.</strong> Staking vaults release, AI Oracle integration, Tier-1 Centralized Exchange listings.</li>
          <li><strong>Phase 3: Sovereignty.</strong> Decentralized Autonomous Organization (DAO) activation, Dark Empire mobile application features, cross-chain bridges.</li>
          <li><strong>Phase 4: Dominion.</strong> Meta-universe integration, privacy-focused sovereign identity rollout, enterprise partnerships.</li>
        </ul>

        <h2>6. Conclusion</h2>
        <p>
          Dark Empire is not just another token; it is a movement towards complete user sovereignty in the digital age. By combining a highly engaged community with the unparalleled performance of Solana, $DEMP is positioned to become a foundational asset in the decentralized economy. 
        </p>
        <p className="text-center italic mt-12 text-primary font-mono select-none">
          &quot;Control the core, rule the empire.&quot;
        </p>
      </div>
    </div>
  );
}
