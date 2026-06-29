"use client";

import { Shield, Menu, X, Globe, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { CustomWalletButton } from "@/components/ui/custom-wallet-button";

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
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Features", href: "/features" },
    { name: "$DEMP", href: "/token" },
    { name: "Holdings", href: "/holdings" },
    { name: "Whitepaper", href: "/whitepaper" },
    { name: "Roadmap", href: "/roadmap" },
    { name: "Oracle", href: "/oracle" },
    { name: "Credits", href: "/credits" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
    { name: "Settings", href: "/settings" },
    { name: "Command Center", href: "/command-center" },
  ];

  const socialLinks = [
    { name: "Official Website", href: "https://darkempirelords.com", icon: Globe, color: "text-primary" },
    { name: "Follow on X", href: "https://x.com/darkhacker167", icon: XIcon, color: "text-white" },
    { name: "Join Telegram", href: "https://t.me/DarkEmpireHQ", icon: Send, color: "text-[#0088cc]" },
    { name: "Join Discord", href: "https://discord.gg/VzhBv7YmM", icon: DiscordIcon, color: "text-[#5865F2]" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/80 backdrop-blur-md shadow-[0_4px_30px_rgba(168,85,247,0.05)]">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image 
            src="/assets/demp-logo.svg" 
            alt="Dark Empire Logo" 
            width={48}
            height={48}
            className="h-10 w-10 md:h-12 md:w-12 transition-transform duration-300 group-hover:scale-110"
          />
          <span className="font-display text-2xl font-bold tracking-widest text-white">
            DARK EMPIRE
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-heading font-semibold tracking-wider transition-colors uppercase ${
                  isActive ? "text-primary text-glow" : "text-muted-foreground hover:text-primary hover:text-glow"
                }`}
              >
                {link.name}
              </Link>
            )
          })}
          {/* Custom Solana Wallet Adapter UI */}
          <CustomWalletButton />

          <Button variant="outline" asChild className="border-primary/50 text-primary hover:bg-primary/20 hover:text-white font-heading font-bold shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <a href="https://ais-dev-aao5behypscgwvze3hwwqj-40280094919.us-west1.run.app" target="_blank" rel="noreferrer">
              TRADING ENGINE
            </a>
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-lg font-heading font-semibold py-3 border-b border-white/5 ${
                      isActive ? "text-primary" : "text-white/80 hover:text-primary"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                )
              })}

              <div className="pt-4 pb-2 border-b border-white/10">
                <CustomWalletButton />
              </div>

              <div className="pt-4 mt-2 space-y-3">
                <p className="text-xs font-mono text-white/30 tracking-widest uppercase">Community</p>
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-3 py-2 ${link.color} hover:opacity-80 transition-opacity`}
                    onClick={() => setIsOpen(false)}
                  >
                    <link.icon className="h-5 w-5 shrink-0" />
                    <span className="font-heading font-semibold">{link.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
