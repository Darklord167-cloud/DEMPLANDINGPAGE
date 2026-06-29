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
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-primary/30 blur-md opacity-50 group-hover:opacity-100 transition rounded-lg"></div>
        <Button 
          onClick={() => setVisible(true)}
          className="relative bg-black border border-primary/50 text-white hover:bg-primary/20 hover:text-white font-heading font-bold rounded-lg transition-all"
        >
          <Wallet className="w-4 h-4 mr-2 text-primary" />
          CONNECT WALLET
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
          variant="outline" 
          className="relative bg-black border-primary/50 text-primary hover:bg-primary/20 hover:text-white font-heading font-medium tracking-wide"
        >
          <Image src={wallet.adapter.icon} alt={name} width={16} height={16} className="w-4 h-4 mr-2 rounded-full" unoptimized />
          {base58.slice(0, 4)}..{base58.slice(-4)}
          <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
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
