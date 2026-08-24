import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { DEMP_TOKEN_MINT, SOLANA_RPC_ENDPOINTS } from '@/lib/config/public';
import { getTierForBalance, getNextTierInfo } from '@/lib/vip-tiers';
import { storage } from '@/server/storage';
import { z } from 'zod';

const verifyRequestSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  signature: z.string().optional(),
  message: z.string().optional(),
  nonce: z.string().optional(),
  timestamp: z.union([z.string(), z.number()]).optional(),
});

const RPC_ENDPOINTS = [
  process.env.HELIUS_RPC_URL,
  process.env.ALCHEMY_RPC_URL,
  process.env.QUICKNODE_RPC_URL,
  process.env.SOLANA_RPC_URL,
  ...SOLANA_RPC_ENDPOINTS,
].filter(Boolean) as string[];

async function getSolanaTokenBalance(walletAddress: string): Promise<{ balance: number; rpcUsed: string }> {
  const pubkey = new PublicKey(walletAddress);
  const mintKey = new PublicKey(DEMP_TOKEN_MINT);

  let lastError: any = null;
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const connection = new Connection(endpoint, {
        commitment: 'confirmed',
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(6000), // 6s timeout per RPC attempt
          });
        },
      });

      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(pubkey, {
        mint: mintKey,
      });

      let totalBalance = 0;
      for (const account of tokenAccounts.value) {
        const parsedInfo = account.account.data.parsed?.info;
        if (parsedInfo && parsedInfo.tokenAmount) {
          const uiAmount = parsedInfo.tokenAmount.uiAmount ?? 0;
          totalBalance += uiAmount;
        }
      }
      return { balance: totalBalance, rpcUsed: endpoint.split("?")[0] };
    } catch (err: any) {
      lastError = err;
      console.warn(`[VIP Solana RPC] Failover note for ${endpoint.split("?")[0]}:`, err?.message || err);
    }
  }

  throw new Error(lastError?.message || 'Solana RPC cluster failover exhausted');
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = verifyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Valid Solana wallet address is required' }, { status: 400 });
    }

    const { walletAddress, signature, message, nonce: directNonce, timestamp } = parsed.data;

    // 1. Validate Base58 PublicKey format
    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(walletAddress);
    } catch {
      return NextResponse.json({ error: 'Invalid Solana PublicKey format' }, { status: 400 });
    }

    // 2. Cryptographic signature verification if challenge provided
    let isSigned = false;
    if (signature && message) {
      try {
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = bs58.decode(signature);
        const publicKeyBytes = pubkey.toBytes();

        isSigned = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
        if (!isSigned) {
          return NextResponse.json({ error: 'Cryptographic wallet signature verification failed' }, { status: 401 });
        }

        // Validate challenge nonce if present
        let nonceToVerify = directNonce;
        if (!nonceToVerify && message.includes("Nonce: ")) {
          const match = message.match(/Nonce:\s*([a-f0-9]{64})/i);
          if (match) nonceToVerify = match[1];
        }

        if (nonceToVerify) {
          const challengeCheck = await storage.consumeAuthChallenge({
            nonce: nonceToVerify,
            walletAddress: pubkey.toBase58(),
            action: 'vip_verify',
          });

          if (!challengeCheck.valid) {
            console.warn(`[VIP Verify] Nonce validation failed for ${walletAddress}:`, challengeCheck.error);
            return NextResponse.json(
              { error: challengeCheck.error || 'Authentication challenge expired or invalid' },
              { status: 401 }
            );
          }
        } else if (timestamp) {
          // Legacy timestamp validation fallback (5 min window)
          const now = Date.now();
          const timeDiff = Math.abs(now - Number(timestamp));
          if (timeDiff > 5 * 60 * 1000) {
            return NextResponse.json({ error: 'Verification challenge timestamp expired' }, { status: 401 });
          }
        }
      } catch (err: any) {
        console.warn(`[VIP Verify] Signature decode error for ${walletAddress}:`, err?.message);
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
      }
    }

    // 3. Query Server-side Solana RPC for official $DEMP token balance
    let dempBalance = 0;
    let rpcError: string | null = null;
    let rpcEndpointUsed = 'cluster';

    try {
      const rpcResult = await getSolanaTokenBalance(walletAddress);
      dempBalance = rpcResult.balance;
      rpcEndpointUsed = rpcResult.rpcUsed;
    } catch (err: any) {
      rpcError = err.message || 'Solana RPC unavailable';
      console.warn(`[VIP RPC Warning for ${walletAddress}]:`, rpcError);
    }

    // 4. Calculate VIP Tier from verified balance
    const tierDef = getTierForBalance(dempBalance);
    const nextTierInfo = getNextTierInfo(dempBalance);

    // 5. Save verification log & update database record if authenticated
    if (isSigned && !rpcError) {
      try {
        await storage.createVipVerification({
          walletAddress: pubkey.toBase58(),
          dempBalance: dempBalance.toString(),
          tier: tierDef.id,
          signatureVerified: true,
        });

        await storage.updateUserVipByWallet(
          pubkey.toBase58(),
          tierDef.id,
          dempBalance.toString()
        );
      } catch (dbErr) {
        console.warn('[VIP DB Storage Notice]:', dbErr);
      }
    }

    // 6. Return structured VIP status response
    return NextResponse.json({
      success: true,
      walletAddress: pubkey.toBase58(),
      dempBalance,
      tier: tierDef,
      nextTierInfo,
      signatureVerified: isSigned,
      verifiedAt: new Date().toISOString(),
      rpcStatus: rpcError ? 'degraded' : 'healthy',
      rpcSource: rpcEndpointUsed,
      rpcNotice: rpcError ? 'Solana RPC cluster currently syncing. Data may be delayed.' : undefined,
    });
  } catch (error: any) {
    console.error('[VIP Verification Route Error]:', error);
    return NextResponse.json(
      { error: 'Failed to complete VIP tier verification' },
      { status: 500 }
    );
  }
}
