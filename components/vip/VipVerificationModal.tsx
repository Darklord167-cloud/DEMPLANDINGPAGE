"use client";

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useVipTier } from '@/lib/vip-context';
import { ShieldCheck, RefreshCw, Lock, Sparkles, AlertCircle, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEMP_MINT_ADDRESS } from '@/lib/vip-tiers';

export function VipVerificationModal() {
  const { publicKey, connected } = useWallet();
  const { verifyVip, isVerifying, tier, dempBalance } = useVipTier();
  const [open, setOpen] = useState(false);
  const [verifyMode, setVerifyMode] = useState<'rpc' | 'signed'>('signed');

  const handleVerify = async () => {
    const result = await verifyVip(verifyMode === 'signed');
    if (result.success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-gradient-to-r from-primary via-purple-600 to-amber-500 hover:from-primary/90 hover:to-amber-600 text-black font-bold font-mono tracking-wider shadow-lg shadow-primary/20 transition-all transform hover:scale-[1.02]"
        >
          <ShieldCheck className="w-5 h-5 mr-2" />
          VERIFY VIP TIER (SOLANA RPC)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-zinc-950/95 border border-zinc-800 text-white backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-amber-400 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary animate-pulse" />
            Server-side Solana RPC Verification
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-sm">
            Verify your connected wallet&apos;s $DEMP balance directly against Solana RPC nodes to securely claim your VIP tier privileges.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Wallet Address Summary */}
          <div className="p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">Connected Wallet:</span>
            <span className="text-primary font-bold">
              {publicKey ? `${publicKey.toBase58().slice(0, 8)}...${publicKey.toBase58().slice(-8)}` : 'Not Connected'}
            </span>
          </div>

          {/* Token Contract Notice */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-1">
            <div className="flex items-center text-primary font-semibold font-mono">
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Verified SPL Token Contract ($DEMP)
            </div>
            <p className="text-zinc-400 font-mono text-[11px] break-all">
              {DEMP_MINT_ADDRESS}
            </p>
          </div>

          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-300 uppercase tracking-wider">
              Select Verification Protocol
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVerifyMode('signed')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  verifyMode === 'signed'
                    ? 'border-primary bg-primary/10 text-white shadow-md shadow-primary/10'
                    : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs font-bold text-primary mb-1">
                  <span>Cryptographic Sign</span>
                  {verifyMode === 'signed' && <Check className="w-4 h-4 text-primary" />}
                </div>
                <p className="text-[11px] text-zinc-400">
                  Signs a fresh timestamp challenge in your wallet to cryptographically prove wallet ownership.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVerifyMode('rpc')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  verifyMode === 'rpc'
                    ? 'border-primary bg-primary/10 text-white shadow-md shadow-primary/10'
                    : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-xs font-bold text-amber-400 mb-1">
                  <span>Quick RPC Query</span>
                  {verifyMode === 'rpc' && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-zinc-400">
                  Queries Solana RPC endpoints directly without wallet prompt. (Instant balance check).
                </p>
              </button>
            </div>
          </div>

          {/* Current VIP Info */}
          {dempBalance > 0 && (
            <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs flex justify-between items-center">
              <span className="text-zinc-400">Current Saved Tier:</span>
              <Badge className={tier.badgeBg}>{tier.name} ({dempBalance.toLocaleString()} $DEMP)</Badge>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800/80">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-mono text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={isVerifying || !connected}
            className="bg-primary hover:bg-primary/90 text-black font-bold font-mono text-xs min-w-[140px]"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                VERIFYING...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-2" />
                EXECUTE VERIFICATION
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
