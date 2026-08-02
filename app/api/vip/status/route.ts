import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { storage } from '@/server/storage';
import { getTierForBalance, getNextTierInfo, VIP_TIERS } from '@/lib/vip-tiers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address query parameter is required' }, { status: 400 });
    }

    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: 'Invalid Solana PublicKey format' }, { status: 400 });
    }

    // Optional cryptographic header signature verification
    const sigHeader = req.headers.get('x-solana-signature');
    const msgHeader = req.headers.get('x-solana-message');
    let signatureVerified = false;

    if (sigHeader && msgHeader) {
      try {
        const messageBytes = new TextEncoder().encode(msgHeader);
        const signatureBytes = bs58.decode(sigHeader);
        signatureVerified = nacl.sign.detached.verify(messageBytes, signatureBytes, pubkey.toBytes());
      } catch (e) {
        console.warn('VIP Status signature header verification failed:', e);
      }
    }

    const latestVerification = await storage.getLatestVipVerification(wallet);

    if (!latestVerification) {
      return NextResponse.json({
        walletAddress: wallet,
        verified: false,
        tier: VIP_TIERS.none,
        dempBalance: 0,
        nextTierInfo: getNextTierInfo(0),
        signatureVerified,
      });
    }

    const balance = parseFloat(latestVerification.dempBalance || '0');
    const tierDef = getTierForBalance(balance);
    const nextTierInfo = getNextTierInfo(balance);

    return NextResponse.json({
      walletAddress: wallet,
      verified: true,
      tier: tierDef,
      dempBalance: balance,
      nextTierInfo,
      signatureVerified: signatureVerified || latestVerification.signatureVerified,
      verifiedAt: latestVerification.verifiedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching VIP status' }, { status: 500 });
  }
}
