import { NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { DEMP_MINT_ADDRESS, getTierForBalance, getNextTierInfo, VIP_TIERS } from '@/lib/vip-tiers';
import { storage } from '@/server/storage';

const RPC_ENDPOINTS = [
  process.env.HELIUS_RPC_URL,
  process.env.ALCHEMY_RPC_URL,
  process.env.QUICKNODE_RPC_URL,
  'https://api.mainnet-beta.solana.com',
].filter(Boolean) as string[];

async function getSolanaTokenBalance(walletAddress: string): Promise<number> {
  const pubkey = new PublicKey(walletAddress);
  const mintKey = new PublicKey(DEMP_MINT_ADDRESS);

  let lastError: any = null;
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const connection = new Connection(endpoint, 'confirmed');
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
      return totalBalance;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Solana RPC] ${endpoint} verification failed:`, err?.message || err);
    }
  }

  throw new Error(lastError?.message || 'Unable to connect to Solana RPC endpoints');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, signature, message, timestamp } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'Valid Solana wallet address is required' }, { status: 400 });
    }

    // 1. Validate Base58 PublicKey format
    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(walletAddress);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid Solana PublicKey format' }, { status: 400 });
    }

    // 2. Cryptographic signature verification if provided
    let isSigned = false;
    if (signature && message && timestamp) {
      const now = Date.now();
      const timeDiff = Math.abs(now - Number(timestamp));
      // Replay prevention: timestamp must be within 5 minutes
      if (timeDiff > 5 * 60 * 1000) {
        return NextResponse.json({ error: 'Verification challenge timestamp expired' }, { status: 401 });
      }

      try {
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = bs58.decode(signature);
        const publicKeyBytes = pubkey.toBytes();

        isSigned = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
        if (!isSigned) {
          return NextResponse.json({ error: 'Cryptographic wallet signature verification failed' }, { status: 401 });
        }
      } catch (err: any) {
        return NextResponse.json({ error: `Signature verification error: ${err.message}` }, { status: 400 });
      }
    }

    // 3. Query Server-side Solana RPC for official $DEMP token balance
    let dempBalance = 0;
    let rpcError = null;

    try {
      dempBalance = await getSolanaTokenBalance(walletAddress);
    } catch (err: any) {
      rpcError = err.message || 'Solana RPC unavailable';
      // In case public mainnet RPC rate limits public requests during dev testing,
      // fallback to safe balance evaluation if mock/demo address or error handling
      console.error('[VIP RPC Error]:', rpcError);
    }

    // 4. Calculate VIP Tier
    const tierDef = getTierForBalance(dempBalance);
    const nextTierInfo = getNextTierInfo(dempBalance);

    // 5. Save verification log & update user record in database
    try {
      await storage.createVipVerification({
        walletAddress: pubkey.toBase58(),
        dempBalance: dempBalance.toString(),
        tier: tierDef.id,
        signatureVerified: isSigned,
      });

      await storage.updateUserVipByWallet(
        pubkey.toBase58(),
        tierDef.id,
        dempBalance.toString()
      );
    } catch (dbErr) {
      console.warn('[VIP DB Storage Notice]:', dbErr);
    }

    // 6. Return verified VIP status response
    return NextResponse.json({
      success: true,
      walletAddress: pubkey.toBase58(),
      dempBalance,
      tier: tierDef,
      nextTierInfo,
      signatureVerified: isSigned,
      verifiedAt: new Date().toISOString(),
      rpcStatus: rpcError ? 'degraded' : 'healthy',
      rpcNotice: rpcError ? `Solana RPC Note: ${rpcError}` : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error during VIP verification' }, { status: 500 });
  }
}
