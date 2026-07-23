"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { VIP_TIERS, VipTierDef, getTierForBalance, getNextTierInfo } from '@/lib/vip-tiers';
import bs58 from 'bs58';
import { toast } from 'sonner';

interface VipContextType {
  dempBalance: number;
  tier: VipTierDef;
  nextTierInfo: { nextTier: VipTierDef | null; needed: number; progress: number };
  isVerifying: boolean;
  isSignedVerified: boolean;
  lastVerifiedAt: string | null;
  verifyVip: (requireSignature?: boolean) => Promise<{ success: boolean; error?: string }>;
  refreshStatus: () => Promise<void>;
  discountPercentage: number;
}

const VipContext = createContext<VipContextType | undefined>(undefined);

export function VipProvider({ children }: { children: React.ReactNode }) {
  const { publicKey, connected, signMessage } = useWallet();

  const [dempBalance, setDempBalance] = useState<number>(0);
  const [tier, setTier] = useState<VipTierDef>(VIP_TIERS.none);
  const [nextTierInfo, setNextTierInfo] = useState<{ nextTier: VipTierDef | null; needed: number; progress: number }>({
    nextTier: VIP_TIERS.bronze,
    needed: 1000,
    progress: 0,
  });
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSignedVerified, setIsSignedVerified] = useState<boolean>(false);
  const [lastVerifiedAt, setLastVerifiedAt] = useState<string | null>(null);

  // Fetch saved status when wallet connects
  const refreshStatus = useCallback(async () => {
    if (!publicKey) {
      setDempBalance(0);
      setTier(VIP_TIERS.none);
      setNextTierInfo(getNextTierInfo(0));
      setIsSignedVerified(false);
      setLastVerifiedAt(null);
      return;
    }

    try {
      const res = await fetch(`/api/vip/status?wallet=${publicKey.toBase58()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.verified) {
          setDempBalance(data.dempBalance);
          setTier(data.tier);
          setNextTierInfo(data.nextTierInfo);
          setIsSignedVerified(data.signatureVerified || false);
          setLastVerifiedAt(data.verifiedAt || null);
        }
      }
    } catch (err) {
      console.warn('Failed to load VIP status:', err);
    }
  }, [publicKey]);

  useEffect(() => {
    if (!publicKey) return;

    let isMounted = true;
    fetch(`/api/vip/status?wallet=${publicKey.toBase58()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.verified && isMounted) {
          setDempBalance(data.dempBalance);
          setTier(data.tier);
          setNextTierInfo(data.nextTierInfo);
          setIsSignedVerified(data.signatureVerified || false);
          setLastVerifiedAt(data.verifiedAt || null);
        }
      })
      .catch((err) => console.warn('Failed to load VIP status:', err));

    return () => {
      isMounted = false;
    };
  }, [publicKey]);

  const verifyVip = async (requireSignature: boolean = false): Promise<{ success: boolean; error?: string }> => {
    if (!publicKey) {
      toast.error('Wallet not connected', { description: 'Please connect your Solana wallet first.' });
      return { success: false, error: 'Wallet not connected' };
    }

    setIsVerifying(true);
    try {
      const walletAddress = publicKey.toBase58();
      let signatureString: string | undefined;
      let messageString: string | undefined;
      let timestamp: number | undefined;

      if (requireSignature) {
        if (!signMessage) {
          toast.error('Signature Unsupported', { description: 'Connected wallet does not support message signing.' });
          setIsVerifying(false);
          return { success: false, error: 'Wallet does not support message signing' };
        }

        timestamp = Date.now();
        messageString = `Dark Empire HQ VIP Verification challenge for wallet ${walletAddress} at timestamp ${timestamp}`;
        const messageBytes = new TextEncoder().encode(messageString);

        toast.info('Signature Request', { description: 'Please approve the verification message signature in your wallet.' });
        const signatureBytes = await signMessage(messageBytes);
        signatureString = bs58.encode(signatureBytes);
      }

      const response = await fetch('/api/vip/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          signature: signatureString,
          message: messageString,
          timestamp,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server-side Solana RPC verification failed');
      }

      setDempBalance(data.dempBalance);
      setTier(data.tier);
      setNextTierInfo(data.nextTierInfo);
      setIsSignedVerified(data.signatureVerified);
      setLastVerifiedAt(data.verifiedAt);

      if (data.tier.id === 'none') {
        toast.info('Verification Complete', {
          description: `Verified balance: ${data.dempBalance.toLocaleString()} $DEMP. Hold 1,000+ $DEMP for VIP status.`,
        });
      } else {
        toast.success(`VIP Tier Verified: ${data.tier.name}!`, {
          description: `Verified ${data.dempBalance.toLocaleString()} $DEMP via Solana RPC. Unlocked ${data.tier.discountPercentage}% fee discount!`,
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error('VIP verification error:', error);
      toast.error('VIP Verification Failed', { description: error.message || 'An error occurred during RPC verification.' });
      return { success: false, error: error.message };
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <VipContext.Provider
      value={{
        dempBalance,
        tier,
        nextTierInfo,
        isVerifying,
        isSignedVerified,
        lastVerifiedAt,
        verifyVip,
        refreshStatus,
        discountPercentage: tier.discountPercentage,
      }}
    >
      {children}
    </VipContext.Provider>
  );
}

export function useVipTier() {
  const context = useContext(VipContext);
  if (!context) {
    throw new Error('useVipTier must be used within a VipProvider');
  }
  return context;
}
