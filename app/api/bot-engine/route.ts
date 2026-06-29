import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

// 1. Hardened Rate Limiter (With self-cleaning garbage collection)
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can be: "client_ip, proxy1_ip, proxy2_ip"
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // OOM Protection: Sweep expired IPs if the map gets bloated
  if (rateLimitMap.size > 2000) {
    rateLimitMap.forEach((val, key) => {
      if (now - val.timestamp >= RATE_LIMIT_WINDOW_MS) rateLimitMap.delete(key);
    });
  }

  const record = rateLimitMap.get(ip);
  if (!record || now - record.timestamp >= RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return true;
  }

  record.count++;
  return record.count <= MAX_REQUESTS_PER_WINDOW;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too Many Requests - Rate Limit Exceeded' },
        { status: 429 }
      );
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    // Safer extraction than .split() which breaks if token contains accidental spaces
    const token = authHeader.slice(7).trim();

    // 2. ZERO-TRUST AUTHENTICATION (Killed the forged-token backdoor)
    if (!adminAuth) {
      console.error("CRITICAL: Firebase Admin Auth uninitialized.");
      return NextResponse.json({ error: 'Authentication service unavailable' }, { status: 503 });
    }

    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json({ error: 'Invalid or expired session token' }, { status: 401 });
    }

    const uid = decodedToken.uid;

    // 3. Safe Payload Parsing
    let body: Record<string, any>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const { action, botId } = body;

    if (!adminDb) {
      return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 });
    }

    // --- ROUTE: START BOT ---
    if (action === 'start') {
      const docRef = adminDb.collection('bot_states').doc();

      const newBot = {
        userId: uid,
        pair: ["SOL-USDC", "BTC-USDC", "ETH-USDC", "JUP-USDC"][Math.floor(Math.random() * 4)],
        status: 'active' as const,
        pnl: 0,
        createdAt: new Date().toISOString(),
      };

      await docRef.set(newBot);

      return NextResponse.json({
        success: true,
        bot: { id: docRef.id, ...newBot },
      });
    }

    // --- ROUTE: STOP BOT ---
    if (action === 'stop') {
      if (!botId || typeof botId !== 'string') {
        return NextResponse.json({ error: 'Valid botId required' }, { status: 400 });
      }

      const botRef = adminDb.collection('bot_states').doc(botId);
      const botSnap = await botRef.get();

      // 4. IDOR Protection (Ownership Verification)
      if (!botSnap.exists) {
        return NextResponse.json({ error: 'Target instance not found' }, { status: 404 });
      }

      if (botSnap.data()?.userId !== uid) {
        return NextResponse.json({ error: 'Forbidden: Command denied for this instance' }, { status: 403 });
      }

      await botRef.update({
        status: 'stopped',
        stoppedAt: new Date().toISOString(),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action dispatched' }, { status: 400 });

  } catch (error: any) {
    console.error('API /bot-engine error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
