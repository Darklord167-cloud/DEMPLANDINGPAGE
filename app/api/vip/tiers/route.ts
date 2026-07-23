import { NextResponse } from 'next/server';
import { VIP_TIERS, DEMP_MINT_ADDRESS } from '@/lib/vip-tiers';

export async function GET() {
  return NextResponse.json({
    tokenMint: DEMP_MINT_ADDRESS,
    tiers: Object.values(VIP_TIERS),
  });
}
