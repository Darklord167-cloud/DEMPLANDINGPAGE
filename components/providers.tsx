"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { useMemo } from "react";
import '@solana/wallet-adapter-react-ui/styles.css';

import { AuthProvider } from "@/lib/auth-context";
import { VipProvider } from "@/lib/vip-context";

export function Providers({ children }: { children: React.ReactNode }) {
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://darkempirelords.com";
  if (!siteUrl.startsWith("http://") && !siteUrl.startsWith("https://")) {
    siteUrl = `https://${siteUrl}`;
  }
  
  const endpoint = typeof window !== "undefined"
    ? `${window.location.origin}/api/rpc`
    : `${siteUrl}/api/rpc`;
  // The Wallet Adapter standard automatically discovers wallets that implement the standard (like Phantom, Solflare, etc)
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <AuthProvider>
                <VipProvider>
                  {children}
                  <Toaster />
                  <SonnerToaster position="top-right" theme="dark" richColors />
                </VipProvider>
              </AuthProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
