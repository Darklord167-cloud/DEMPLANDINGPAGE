"use client";

import { Shield, Menu, X, Globe, Send, ChevronDown, Sparkles, ExternalLink, Terminal, Cpu, FileText, Map, HelpCircle, Mail, Award, Settings as SettingsIcon, Layers, Copy, CheckCircle, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { CustomWalletButton } from "@/components/ui/custom-wallet-button";
import { useVipTier } from "@/lib/vip-context";
import { useAudioHUD } from "@/hooks/useAudioHUD";
import { VipBadge } from "@/components/vip/VipBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { DEMP_TOKEN_MINT } from "@/lib/solana/config";

function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.005 4.15H5.059z"/>
    </svg>
  );
}

function DiscordIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="currentColor">
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.58,67.58,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z"/>
    </svg>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedMobile, setCopiedMobile] = useState(false);
  const pathname = usePathname();
  const { tier } = useVipTier();
  const { isMuted, toggleMute } = useAudioHUD();
  const { toast } = useToast();
  const contractAddress = DEMP_TOKEN_MINT;

  // Primary links visible on desktop header
  const primaryLinks = [
    { name: "$DEMP TOKEN", href: "/token", icon: Sparkles },
    { name: "WHITEPAPER", href: "/whitepaper", icon: FileText },
    { name: "ROADMAP", href: "/roadmap", icon: Map },
    { name: "COMMAND CENTER", href: "/command-center", icon: Terminal },
    { name: "ORACLE AI", href: "/oracle", icon: Cpu },
  ];

  // Secondary links collapsed into "MORE" dropdown
  const secondaryCategories = [
    {
      title: "Decentralized Apps & Tools",
      items: [
        { name: "TokenTrace dApp (Sepolia)", href: "https://token-trace-lemon.vercel.app", icon: Shield, external: true },
        { name: "Trading Terminal", href: "https://darkempiretradingterminal-dark-empire-lords.vercel.app", icon: Terminal, external: true },
        { name: "VIP HQ Portal", href: "/vip", icon: Award },
        { name: "Empire Holdings", href: "/holdings", icon: Layers },
      ],
    },
    {
      title: "Protocol & Community",
      items: [
        { name: "Features Overview", href: "/features", icon: Sparkles },
        { name: "FAQ Knowledge Base", href: "/faq", icon: HelpCircle },
        { name: "System Settings", href: "/settings", icon: SettingsIcon },
        { name: "Contact HQ", href: "/contact", icon: Mail },
      ],
    },
  ];

  const socialLinks = [
    { name: "Website", href: "https://darkempirelords.com", icon: Globe, color: "text-purple-400" },
    { name: "Twitter / X", href: "https://x.com/darkhacker167", icon: XIcon, color: "text-white" },
    { name: "Telegram", href: "https://t.me/DarkEmpireRelayBot", icon: Send, color: "text-[#0088cc]" },
    { name: "Discord", href: "https://discord.gg/cyWVcvyZ", icon: DiscordIcon, color: "text-[#5865F2]" },
  ];

  const handleCopyMobile = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopiedMobile(true);
    toast({ title: "Contract Copied", description: "Solana SPL address copied." });
    setTimeout(() => setCopiedMobile(false), 2000);
  };

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-purple-900/30 bg-[#07070b]/90 backdrop-blur-2xl shadow-[0_4px_30px_rgba(168,85,247,0.12)]">
      <div className="container mx-auto px-4 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <Image 
            src="/assets/demp-logo.svg" 
            alt="Dark Empire Logo" 
            width={48}
            height={48}
            className="h-10 w-10 md:h-11 md:w-11 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]"
          />
          <span className="font-display text-xl md:text-2xl font-black tracking-widest text-white group-hover:text-purple-300 transition-colors text-glow">
            DARK EMPIRE
          </span>
        </Link>

        {/* Desktop Primary Nav */}
        <div className="hidden xl:flex items-center gap-5">
          {primaryLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider transition-all duration-200 uppercase px-3 py-2 rounded-xl ${
                  isActive 
                    ? "text-purple-200 bg-purple-950/80 border border-purple-500/50 text-glow shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                    : "text-zinc-300 hover:text-white hover:bg-zinc-900/80"
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-purple-400" />
                {link.name}
              </Link>
            );
          })}

          {/* Collapsed Secondary Links Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-xs font-mono font-bold tracking-wider text-zinc-300 hover:text-white uppercase px-3 py-2 rounded-xl hover:bg-zinc-900/80 transition-colors outline-none cursor-pointer">
                <span>MORE</span>
                <ChevronDown className="w-3.5 h-3.5 text-purple-400" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-64 bg-[#0a0a12]/98 border border-purple-900/40 backdrop-blur-2xl p-2 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(168,85,247,0.2)] text-white">
              {secondaryCategories.map((cat, idx) => (
                <div key={cat.title}>
                  {idx > 0 && <DropdownMenuSeparator className="bg-zinc-800/80 my-1" />}
                  <DropdownMenuLabel className="text-[10px] font-mono text-purple-400 uppercase tracking-widest px-2 py-1.5">
                    {cat.title}
                  </DropdownMenuLabel>
                  {cat.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = pathname === item.href;
                    const isExternal = "external" in item && item.external;

                    if (isExternal) {
                      return (
                        <DropdownMenuItem key={item.name} asChild>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-2.5 px-2.5 py-2 text-xs font-mono rounded-xl transition-colors cursor-pointer text-zinc-300 hover:text-white hover:bg-purple-950/40"
                          >
                            <div className="flex items-center gap-2">
                              <ItemIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span>{item.name}</span>
                            </div>
                            <ExternalLink className="w-3 h-3 text-zinc-500 shrink-0" />
                          </a>
                        </DropdownMenuItem>
                      );
                    }

                    return (
                      <DropdownMenuItem key={item.name} asChild>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2.5 px-2.5 py-2 text-xs font-mono rounded-xl transition-colors cursor-pointer ${
                            isActive ? "bg-purple-950/80 text-purple-200 font-bold" : "text-zinc-300 hover:text-white hover:bg-purple-950/40"
                          }`}
                        >
                          <ItemIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span>{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* VIP Badge Link */}
          <Link href="/vip" className="hover:opacity-90 transition-opacity">
            <VipBadge tier={tier} size="sm" showIcon />
          </Link>
        </div>

        {/* Action Buttons: Social Hub, Wallet & Trading Engine */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 mr-1" data-testid="social-hub-nav-icons">
            <a
              href="https://t.me/DarkEmpireRelayBot"
              target="_blank"
              rel="noopener noreferrer"
              title="Telegram Gemini Bot"
              aria-label="Telegram Gemini Bot"
              className="group relative p-2.5 rounded-xl bg-cyan-950/30 border border-[#0088cc]/40 text-[#0088cc] hover:bg-[#0088cc]/20 hover:border-[#0088cc] hover:shadow-[0_0_15px_rgba(0,136,204,0.6)] transition-all duration-300 drop-shadow-[0_0_8px_rgba(0,136,204,0.4)] flex items-center justify-center"
            >
              <Send className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </a>
            <a
              href="https://discord.gg/cyWVcvyZ"
              target="_blank"
              rel="noopener noreferrer"
              title="Discord Server"
              aria-label="Discord Server"
              className="group relative p-2.5 rounded-xl bg-indigo-950/30 border border-[#5865F2]/40 text-[#5865F2] hover:bg-[#5865F2]/20 hover:border-[#5865F2] hover:shadow-[0_0_15px_rgba(88,101,242,0.6)] transition-all duration-300 drop-shadow-[0_0_8px_rgba(88,101,242,0.4)] flex items-center justify-center"
            >
              <DiscordIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </a>
          </div>

          {/* Audio HUD Global Synthesizer Mute Button */}
          <button
            onClick={toggleMute}
            title={isMuted ? "Audio HUD Muted (Click to Enable Sci-Fi Sounds)" : "Audio HUD Active (Click to Mute)"}
            className={`h-10 px-3 rounded-xl border font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              isMuted
                ? "bg-zinc-950/80 border-purple-500/20 text-zinc-500 hover:text-zinc-300"
                : "bg-purple-950/80 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)] animate-pulse"
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-zinc-500" />
                <span className="hidden sm:inline">AUDIO OFF</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline text-purple-300">AUDIO HUD</span>
              </>
            )}
          </button>

          <CustomWalletButton />

          <Button
            variant="obsidian"
            asChild
            className="h-10 px-4 flex items-center justify-center gap-2 max-w-xs rounded-xl"
          >
            <a
              href="https://dark-empire-operations-terminal.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-mono text-xs font-bold"
            >
              <span>TRADING ENGINE</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </a>
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="xl:hidden text-zinc-300 hover:text-white p-2.5 rounded-xl border border-purple-900/40 bg-zinc-950/90 min-h-[44px] min-w-[44px] flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6 text-purple-400" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="xl:hidden bg-[#07070b]/98 border-b border-purple-900/40 backdrop-blur-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col p-6 gap-6 max-h-[85vh] overflow-y-auto">
              
              {/* Contract Copy Quick Bar Mobile */}
              <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-950/40 flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <p className="text-[9px] font-mono text-purple-400 uppercase tracking-widest">
                    SOLANA CONTRACT ($DEMP)
                  </p>
                  <code className="text-xs font-mono text-white truncate block">
                    {contractAddress}
                  </code>
                </div>
                <Button
                  onClick={handleCopyMobile}
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs font-mono text-purple-300 hover:bg-purple-900/50 shrink-0"
                >
                  {copiedMobile ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>

              {/* Wallet & Trading Engine CTA */}
              <div className="space-y-3 pb-4 border-b border-zinc-800/80">
                <CustomWalletButton />
                <Button
                  variant="obsidian"
                  asChild
                  className="w-full h-11 flex items-center justify-center gap-2 font-mono text-xs font-bold rounded-xl"
                >
                  <a
                    href="https://dark-empire-operations-terminal.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>TRADING ENGINE</span>
                    <ExternalLink className="w-4 h-4 text-amber-400" />
                  </a>
                </Button>
              </div>

              {/* Primary Navigation Links */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">
                  Primary Command Modules
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {primaryLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-mono font-bold tracking-wider uppercase transition-all min-h-[44px] ${
                          isActive
                            ? "bg-purple-950/80 border-purple-500/50 text-purple-200 text-glow"
                            : "bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Navigation Categories */}
              <div className="space-y-4">
                {secondaryCategories.map((cat) => (
                  <div key={cat.title} className="space-y-2">
                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                      {cat.title}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {cat.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = pathname === item.href;
                        const isExternal = "external" in item && item.external;

                        if (isExternal) {
                          return (
                            <a
                              key={item.name}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsOpen(false)}
                              className="flex items-center justify-between py-2.5 px-3 text-xs font-mono rounded-xl border transition-colors min-h-[44px] text-zinc-300 border-zinc-900 bg-zinc-950/60 hover:text-white"
                            >
                              <div className="flex items-center gap-2.5">
                                <ItemIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                <span>{item.name}</span>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-2.5 py-2.5 px-3 text-xs font-mono rounded-xl border transition-colors min-h-[44px] ${
                              isActive ? "text-purple-300 font-bold bg-purple-950/60 border-purple-500/40" : "text-zinc-300 border-zinc-900 bg-zinc-950/60 hover:text-white"
                            }`}
                          >
                            <ItemIcon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Links */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-2">
                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                  HQ Channels
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs font-mono text-zinc-300 hover:text-white transition-colors min-h-[44px]"
                    >
                      <link.icon className={`h-4 w-4 shrink-0 ${link.color}`} />
                      <span className="truncate">{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
