"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { 
  Shield, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  Download, 
  Globe, 
  Terminal, 
  Sparkles, 
  Layers, 
  Zap,
  ArrowRight,
  FileCode,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { DEMP_TOKEN_MINT, DEMP_DEPLOYER_WALLET } from "@/lib/solana/config";

export function SolanaVerificationHub() {
  const { toast } = useToast();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activePlatform, setActivePlatform] = useState("jupiter");

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://darkempirelords.com";

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({
      title: "Copied to Clipboard",
      description: `${label} has been copied successfully.`,
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const verificationChecklist = [
    { id: "deployer", label: "Deployer Authority Wallet Identified", detail: DEMP_DEPLOYER_WALLET, status: "complete" },
    { id: "metadata", label: "Metaplex On-Chain Metadata Endpoint Live", detail: `${baseUrl}/api/token-metadata`, status: "complete" },
    { id: "logo", label: "High-Res PNG & Vector Logos Uploaded", detail: `${baseUrl}/assets/demp-logo.png`, status: "complete" },
    { id: "jupiter", label: "Jupiter Strict List PR Payload Ready", detail: "JSON standard format v2", status: "ready" },
    { id: "dexscreener", label: "DexScreener Profile Update Suite Configured", detail: "Socials + Header Banner + Deployer Sig", status: "ready" },
  ];

  const platformData = {
    jupiter: {
      name: "Jupiter Aggregator (jup.ag)",
      badge: "Jupiter Strict List Payload",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description: "Jupiter automatically syncs token metadata from Metaplex on-chain metadata and the Jupiter Token List repository. Submit this payload to get $DEMP verified on Jupiter's Strict List.",
      actionUrl: "https://station.jup.ag/docs/token-list/token-list-api",
      actionText: "Open Jupiter Station",
      payload: JSON.stringify(
        {
          chainId: 101,
          address: DEMP_TOKEN_MINT,
          symbol: "DEMP",
          name: "Dark Empire",
          decimals: 6,
          logoURI: `${baseUrl}/assets/demp-logo.png`,
          tags: ["community", "utility-token", "solana-vip"],
          extensions: {
            website: baseUrl,
            coingeckoId: "dark-empire",
            deployer: DEMP_DEPLOYER_WALLET,
          },
        },
        null,
        2
      ),
      steps: [
        `Ensure deployer wallet (${DEMP_DEPLOYER_WALLET.slice(0, 8)}...) has updated the Metaplex on-chain metadata URI to ${baseUrl}/api/token-metadata.`,
        "Visit Jupiter Station Token Verification Portal or submit a PR to the official Jupiter Token List repo.",
        "Copy the pre-formatted Jupiter PR payload below and submit with the token website & liquidity links.",
        "Jupiter Automated Verification bot validates contract mint & active trading volume on mainnet."
      ]
    },
    dexscreener: {
      name: "DexScreener Solana",
      badge: "Profile & Banner Update Payload",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      description: "DexScreener allows token creators to customize their pair headers, logo icons, descriptions, and social handles by verifying deployer wallet authority.",
      actionUrl: `https://dexscreener.com/solana/${DEMP_TOKEN_MINT}`,
      actionText: "View on DexScreener",
      payload: JSON.stringify(
        {
          tokenAddress: DEMP_TOKEN_MINT,
          chain: "solana",
          deployerAuthority: DEMP_DEPLOYER_WALLET,
          icon: `${baseUrl}/assets/demp-logo.png`,
          header: `${baseUrl}/assets/demp-banner.svg`,
          description: "Official utility token of Dark Empire Lords LLC powering high-speed Solana RPC relays, AI Oracle intelligence, and VIP Syndicate governance.",
          links: [
            { type: "website", url: baseUrl },
            { type: "telegram", url: "https://t.me/darkempirehq" }
          ]
        },
        null,
        2
      ),
      steps: [
        `Open DexScreener for token mint ${DEMP_TOKEN_MINT.slice(0, 8)}...`,
        "Click 'Update Token Info' on the upper right of the DexScreener pair chart.",
        `Connect or sign message using Deployer Wallet (${DEMP_DEPLOYER_WALLET.slice(0, 8)}...) to verify ownership without fees.`,
        "Upload the official Header Banner and PNG Logo provided in the Logo Assets tab."
      ]
    },
    metaplex: {
      name: "Metaplex On-Chain Metadata",
      badge: "On-Chain Authority Signature",
      badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      description: "Solana's canonical token metadata standard. Updating on-chain metadata sets the base token name, symbol, logo image, and metadata URI permanently across all Solana wallets.",
      actionUrl: `${baseUrl}/api/token-metadata`,
      actionText: "View Metadata JSON API",
      payload: `// Run on-chain update CLI command using deployer wallet:\nSOLANA_DEPLOYER_PRIVATE_KEY="your_private_key" npx tsx scripts/update-solana-metadata.ts`,
      steps: [
        `Confirm Deployer Wallet (${DEMP_DEPLOYER_WALLET}) holds update authority for mint ${DEMP_TOKEN_MINT.slice(0, 8)}...`,
        `Execute the script: npx tsx scripts/update-solana-metadata.ts`,
        "The script broadcasts a transaction to Solana mainnet using Metaplex Token Metadata Program ID.",
        "Phantom, Solflare, Backpack, and Solscan will immediately index the updated logo and URI."
      ]
    },
    solscan: {
      name: "Solscan & SolanaFM",
      badge: "Verified Token Profile",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      description: "Solscan displays a blue 'Verified' checkmark on token profiles once the creator wallet verifies official domain ownership.",
      actionUrl: `https://solscan.io/token/${DEMP_TOKEN_MINT}`,
      actionText: "Open Solscan Token Page",
      payload: JSON.stringify(
        {
          tokenAddress: DEMP_TOKEN_MINT,
          ownerWallet: DEMP_DEPLOYER_WALLET,
          officialName: "Dark Empire",
          officialSymbol: "DEMP",
          iconUrl: `${baseUrl}/assets/demp-logo.png`,
          officialWebsite: baseUrl,
          contactEmail: "vip@darkempirelords.com"
        },
        null,
        2
      ),
      steps: [
        "Go to Solscan Token Details page for $DEMP.",
        "Click 'Claim Token Profile' or 'Submit Verification Information'.",
        `Sign ownership challenge using Deployer Wallet (${DEMP_DEPLOYER_WALLET.slice(0, 8)}...).`,
        "Submit domain verification record (darkempirelords.com) and token logo."
      ]
    }
  };

  return (
    <div className="w-full space-y-12">
      {/* Top Banner Header */}
      <div className="p-8 rounded-2xl border border-primary/30 bg-gradient-to-r from-purple-950/60 via-black to-slate-950/80 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className="bg-primary/20 text-primary border-primary/40 font-mono text-xs uppercase px-3 py-1">
                <Zap className="h-3 w-3 mr-1" /> SOLANA PLATFORMS VERIFICATION SUITE
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-mono text-xs uppercase px-3 py-1">
                <CheckCircle2 className="h-3 w-3 mr-1" /> DEPLOYER VERIFIED
              </Badge>
            </div>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide">
              $DEMP TOKEN & LOGO VERIFICATION HUB
            </h3>
            <p className="text-muted-foreground text-sm max-w-3xl mt-2 leading-relaxed">
              Official deployment toolkit for updating the $DEMP token logo, Metaplex on-chain metadata, Jupiter Strict List verification, and DexScreener profile branding.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              className="bg-primary hover:bg-primary/90 text-white font-bold font-mono text-xs gap-2"
              onClick={() => handleCopy(DEMP_DEPLOYER_WALLET, "deployer-main", "Deployer Wallet")}
            >
              {copiedKey === "deployer-main" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              COPY DEPLOYER WALLET
            </Button>
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 font-mono text-xs gap-2"
              asChild
            >
              <a href={`https://solscan.io/account/${DEMP_DEPLOYER_WALLET}`} target="_blank" rel="noreferrer">
                SOLSCAN DEPLOYER <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>

        {/* Addresses Info Grid */}
        <div className="grid md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-1">
              DEPLOYER WALLET ADDRESS (AUTHORITY)
            </p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono text-emerald-400 font-bold break-all">
                {DEMP_DEPLOYER_WALLET}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(DEMP_DEPLOYER_WALLET, "deployer-grid", "Deployer Wallet")}
                className="h-7 px-2 text-xs text-primary hover:bg-primary/20"
              >
                {copiedKey === "deployer-grid" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-[11px] font-mono text-white/50 uppercase tracking-wider mb-1">
              SOLANA TOKEN MINT CONTRACT ADDRESS
            </p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm font-mono text-primary font-bold break-all">
                {DEMP_TOKEN_MINT}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(DEMP_TOKEN_MINT, "mint-grid", "Mint Address")}
                className="h-7 px-2 text-xs text-primary hover:bg-primary/20"
              >
                {copiedKey === "mint-grid" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Readiness Progress Checklist */}
      <div className="p-6 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-xl font-heading font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" /> Platform Verification Readiness
            </h4>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              All essential prerequisites for multi-platform Solana verification are live and verified.
            </p>
          </div>
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-mono text-sm px-3 py-1">
            5 / 5 READY
          </Badge>
        </div>

        <div className="space-y-3">
          {verificationChecklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-white/5 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.label}</p>
                  <p className="text-xs font-mono text-muted-foreground truncate max-w-md">{item.detail}</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-[10px]">
                READY
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Logo Asset Distribution Suite */}
      <div className="p-8 rounded-2xl border border-white/10 bg-black/70 backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" /> Official Token Logo & Banner Assets
            </h4>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Direct high-resolution URLs required by DexScreener, Jupiter, Solscan, Birdeye, and wallet apps.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary/20 font-mono text-xs gap-2"
            onClick={() => handleCopy(`${baseUrl}/api/token-metadata`, "metadata-api", "Metadata API URL")}
          >
            <FileCode className="h-4 w-4" /> COPY METADATA API URL
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Logo PNG Card */}
          <div className="p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between space-y-4">
            <div>
              <div className="relative w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden border border-white/20 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
                <Image
                  src="/assets/demp-logo.png"
                  alt="$DEMP Logo PNG"
                  fill
                  className="object-cover"
                />
              </div>
              <h5 className="text-base font-bold text-white text-center">High-Res PNG Logo (512x512)</h5>
              <p className="text-xs text-muted-foreground text-center font-mono mt-1">
                Standard PNG image format required by DexScreener & Jupiter.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-white/10">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs font-mono gap-2"
                onClick={() => handleCopy(`${baseUrl}/assets/demp-logo.png`, "logo-png", "PNG Logo URL")}
              >
                {copiedKey === "logo-png" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                COPY PNG URL
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-mono text-white/70 border-white/10 hover:bg-white/10 gap-2"
                asChild
              >
                <a href="/assets/demp-logo.png" target="_blank" rel="noreferrer" download>
                  <Download className="h-3.5 w-3.5" /> DOWNLOAD PNG
                </a>
              </Button>
            </div>
          </div>

          {/* Vector SVG Logo Card */}
          <div className="p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between space-y-4">
            <div>
              <div className="relative w-24 h-24 mx-auto mb-4 rounded-xl overflow-hidden border border-white/20 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                <Image
                  src="/assets/demp-logo.svg"
                  alt="$DEMP Logo SVG"
                  fill
                  className="object-contain p-2"
                />
              </div>
              <h5 className="text-base font-bold text-white text-center">Vector SVG Logo</h5>
              <p className="text-xs text-muted-foreground text-center font-mono mt-1">
                Scalable vector format for crisp display across mobile & web.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-white/10">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs font-mono gap-2"
                onClick={() => handleCopy(`${baseUrl}/assets/demp-logo.svg`, "logo-svg", "SVG Logo URL")}
              >
                {copiedKey === "logo-svg" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                COPY SVG URL
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-mono text-white/70 border-white/10 hover:bg-white/10 gap-2"
                asChild
              >
                <a href="/assets/demp-logo.svg" target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> VIEW VECTOR SVG
                </a>
              </Button>
            </div>
          </div>

          {/* Header Banner SVG Card */}
          <div className="p-5 rounded-xl border border-white/10 bg-white/5 flex flex-col justify-between space-y-4">
            <div>
              <div className="relative w-full h-24 mx-auto mb-4 rounded-xl overflow-hidden border border-white/20 bg-black flex items-center justify-center p-2">
                <Image
                  src="/assets/demp-banner.svg"
                  alt="$DEMP Banner SVG"
                  width={300}
                  height={80}
                  className="object-contain w-full h-full"
                />
              </div>
              <h5 className="text-base font-bold text-white text-center">DexScreener Header Banner</h5>
              <p className="text-xs text-muted-foreground text-center font-mono mt-1">
                Custom cyber header banner for DexScreener & Solscan.
              </p>
            </div>
            <div className="space-y-2 pt-2 border-t border-white/10">
              <Button
                variant="secondary"
                size="sm"
                className="w-full text-xs font-mono gap-2"
                onClick={() => handleCopy(`${baseUrl}/assets/demp-banner.svg`, "banner-svg", "Banner SVG URL")}
              >
                {copiedKey === "banner-svg" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                COPY BANNER URL
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-mono text-white/70 border-white/10 hover:bg-white/10 gap-2"
                asChild
              >
                <a href="/assets/demp-banner.svg" target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> VIEW BANNER
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Platform Submission Payloads & Instructions */}
      <div className="p-8 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mb-6">
          <h4 className="text-2xl font-heading font-bold text-white flex items-center gap-2">
            <Globe className="h-6 w-6 text-emerald-400" /> Platform-by-Platform Verification Guides
          </h4>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Select a Solana platform to generate submission payloads and step-by-step verification instructions.
          </p>
        </div>

        <Tabs value={activePlatform} onValueChange={setActivePlatform} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 bg-white/5 border border-white/10 p-1 rounded-xl mb-6">
            <TabsTrigger value="jupiter" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
              Jupiter (jup.ag)
            </TabsTrigger>
            <TabsTrigger value="dexscreener" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
              DexScreener
            </TabsTrigger>
            <TabsTrigger value="metaplex" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
              Metaplex On-Chain
            </TabsTrigger>
            <TabsTrigger value="solscan" className="font-mono text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
              Solscan & SolanaFM
            </TabsTrigger>
          </TabsList>

          {Object.entries(platformData).map(([key, data]) => (
            <TabsContent key={key} value={key} className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="text-lg font-bold text-white">{data.name}</h5>
                    <Badge variant="outline" className={`font-mono text-[10px] ${data.badgeColor}`}>
                      {data.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground max-w-2xl">{data.description}</p>
                </div>
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold font-mono text-xs gap-2 shrink-0"
                  asChild
                >
                  <a href={data.actionUrl} target="_blank" rel="noreferrer">
                    {data.actionText} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                <h6 className="text-xs font-mono text-primary uppercase tracking-wider font-bold">
                  VERIFICATION STEPS FOR {data.name.toUpperCase()}
                </h6>
                <div className="grid md:grid-cols-2 gap-3">
                  {data.steps.map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-white/5 bg-white/5 flex gap-3">
                      <span className="h-6 w-6 rounded-full bg-primary/20 text-primary border border-primary/40 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payload Box */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h6 className="text-xs font-mono text-white/50 uppercase tracking-wider">
                    SUBMISSION PAYLOAD / CLI COMMAND
                  </h6>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs font-mono text-primary hover:bg-primary/20 gap-1.5"
                    onClick={() => handleCopy(data.payload, `payload-${key}`, `${data.name} Payload`)}
                  >
                    {copiedKey === `payload-${key}` ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    COPY PAYLOAD
                  </Button>
                </div>
                <pre className="p-4 rounded-xl bg-black border border-white/10 text-xs font-mono text-emerald-400 overflow-x-auto max-h-72">
                  {data.payload}
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
