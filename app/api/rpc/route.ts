import { NextResponse } from 'next/server';
import { SOLANA_RPC_ENDPOINTS } from '@/lib/config/public';

const DEFAULT_FALLBACK_NODES = SOLANA_RPC_ENDPOINTS;

function getRpcEndpoints(): string[] {
  const custom = [
    process.env.HELIUS_RPC_URL,
    process.env.ALCHEMY_RPC_URL,
    process.env.QUICKNODE_RPC_URL,
    process.env.SOLANA_RPC_URL,
  ].filter(Boolean) as string[];

  return custom.length > 0 ? Array.from(new Set([...custom, ...DEFAULT_FALLBACK_NODES])) : [...DEFAULT_FALLBACK_NODES];
}

// Sliding window rate limiter for RPC proxy
const rpcRateLimits = new Map<string, { count: number; resetAt: number }>();
const RPC_MAX_REQUESTS_PER_MINUTE = 120;
const RPC_WINDOW_MS = 60 * 1000;

function checkRpcRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rpcRateLimits.get(ip);
  if (!record || now > record.resetAt) {
    rpcRateLimits.set(ip, { count: 1, resetAt: now + RPC_WINDOW_MS });
    return true;
  }
  if (record.count >= RPC_MAX_REQUESTS_PER_MINUTE) return false;
  record.count += 1;
  return true;
}

let currentEndpointIndex = 0;

export async function POST(req: Request) {
  try {
    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    if (!checkRpcRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'RPC Rate limit exceeded. Please throttle request frequency.' },
        { status: 429 }
      );
    }

    // Limit payload size to 256KB
    const bodyText = await req.text();
    if (bodyText.length > 256 * 1024) {
      return NextResponse.json({ error: 'RPC request payload exceeds 256KB limit' }, { status: 413 });
    }

    let body: any;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON-RPC payload' }, { status: 400 });
    }

    const rpcEndpoints = getRpcEndpoints();
    let lastError: any = null;
    let attempts = 0;
    
    while (attempts < rpcEndpoints.length) {
      const endpoint = rpcEndpoints[currentEndpointIndex];
      currentEndpointIndex = (currentEndpointIndex + 1) % rpcEndpoints.length;
      attempts++;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(5000), // 5s timeout per RPC node
        });

        if (response.ok) {
          const data = await response.json();
          if (data.error && data.error.code === 429) {
            throw new Error("429 Too Many Requests in RPC payload");
          }
          return NextResponse.json(data);
        } else if (response.status === 429) {
          throw new Error("HTTP 429 - Rate Limited");
        } else if (response.status >= 500) {
          throw new Error(`HTTP ${response.status} - Server Error`);
        } else {
          const data = await response.json();
          return NextResponse.json(data, { status: response.status });
        }
      } catch (error: any) {
        lastError = error;
        console.warn(`[Solana RPC Proxy] Node attempt ${endpoint.split("?")[0]} failed:`, error?.message || error);
      }
    }

    console.error("[Solana RPC Proxy] All failover providers exhausted. Last error:", lastError?.message || lastError);
    return NextResponse.json(
      { error: 'All Solana RPC providers are currently busy or rate-limited. Please retry shortly.' }, 
      { status: 503 }
    );
  } catch (error: any) {
    console.error("[RPC Proxy Internal Error]:", error);
    return NextResponse.json({ error: 'Internal RPC proxy server error' }, { status: 500 });
  }
}
