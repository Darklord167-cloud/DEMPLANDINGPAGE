import { NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { storage } from '@/server/storage';
import { getTierForBalance, getNextTierInfo, VIP_TIERS } from '@/lib/vip-tiers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address query parameter is required' }, { status: 400 });
    }

    try {
      new PublicKey(wallet);
    } catch {
      return NextResponse.json({ error: 'Invalid Solana PublicKey format' }, { status: 400 });
    }

    const latestVerification = await storage.getLatestVipVerification(wallet);

    if (!latestVerification) {
      return NextResponse.json({
        walletAddress: wallet,
        verified: false,
        tier: VIP_TIERS.none,
        dempBalance: 0,
        nextTierInfo: getNextTierInfo(0),
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
      signatureVerified: latestVerification.signatureVerified,
      verifiedAt: latestVerification.verifiedAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error fetching VIP status' }, { status: 500 });
  }
}
