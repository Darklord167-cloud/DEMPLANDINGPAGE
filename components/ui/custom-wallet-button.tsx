"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "./button";
import { Wallet, LogOut, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export function CustomWalletButton() {
  const { publicKey, wallet, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Avoid synchronous state updates immediately on mount for strict mode constraints
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="relative group">
        <Button 
          disabled
          className="relative bg-black border border-primary/50 text-white font-heading font-bold rounded-lg"
        >
          <Wallet className="w-4 h-4 mr-2 text-primary" />
          LOADING...
        </Button>
      </div>
    );
  }

  if (!wallet || !publicKey) {
    return (
      <div className="relative group max-w-xs">
        <Button 
          variant="obsidian"
          onClick={() => setVisible(true)}
          className="w-full h-10 px-4 flex items-center justify-center gap-2"
        >
          <Wallet className="w-4 h-4 text-purple-400" />
          <span>CONNECT WALLET</span>
        </Button>
      </div>
    );
  }

  const base58 = publicKey.toBase58();
  const name = wallet.adapter.name;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="obsidian" 
          className="h-10 px-4 flex items-center justify-center gap-2"
        >
          <Image src={wallet.adapter.icon} alt={name} width={16} height={16} className="w-4 h-4 rounded-full" unoptimized />
          <span>{base58.slice(0, 4)}..{base58.slice(-4)}</span>
          <ChevronDown className="w-4 h-4 opacity-70 text-purple-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/90 border-primary/20 backdrop-blur-md">
        <DropdownMenuItem 
          onClick={() => disconnect()}
          className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer font-heading"
        >
          <LogOut className="w-4 h-4 mr-2" />
          DISCONNECT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
