import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

// In-Memory Rate Limiter Map (Resets on cold start, but effective for immediate volumetric bursts per instance)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }
  if (now - record.timestamp < RATE_LIMIT_WINDOW_MS) {
    record.count++;
    if (record.count > MAX_REQUESTS_PER_WINDOW) {
      return false; // Rate limited
    }
  } else {
    // Reset window
    rateLimitMap.set(ip, { count: 1, timestamp: now });
  }
  return true;
}

export async function POST(req: Request) {
  try {
    // Volumetric DDoS Protection (Strict Rate Limiting)
    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    if (!checkRateLimit(ip)) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({ error: 'Too Many Requests - Rate Limit Exceeded' }, { status: 429 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.slice(7).trim();

    if (!adminAuth) {
      console.error('[HQ Webhook] Firebase Admin Auth uninitialized.');
      return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.error('[HQ Webhook] Token verification failed:', error);
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    const uid = decodedToken.uid;
    const { action, botId } = await req.json();

    if (!adminDb) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    if (action === 'start') {
      const newBotRef = adminDb.collection('bot_states').doc();

      const newBot = {
        userId: uid,
        pair: ['SOL-USDC', 'BTC-USDC', 'ETH-USDC', 'JUP-USDC'][Math.floor(Math.random() * 4)],
        status: 'active',
        pnl: 0,
        createdAt: new Date().toISOString(),
      };

      await newBotRef.set(newBot);

      return NextResponse.json({ success: true, bot: { id: newBotRef.id, ...newBot } });
    } else if (action === 'stop' && botId) {
      if (typeof botId !== 'string') {
        return NextResponse.json({ error: 'Invalid botId' }, { status: 400 });
      }

      const botRef = adminDb.collection('bot_states').doc(botId);
      const botSnap = await botRef.get();

      if (!botSnap.exists) {
        return NextResponse.json({ error: 'Bot instance not found' }, { status: 404 });
      }

      if (botSnap.data()?.userId !== uid) {
        return NextResponse.json({ error: 'Forbidden: You do not own this bot instance' }, { status: 403 });
      }

      await botRef.update({
        status: 'stopped',
        stoppedAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
