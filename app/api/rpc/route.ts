import { NextResponse } from 'next/server';

const DEFAULT_FALLBACK_NODES = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-mainnet.rpc.extrnode.com",
  "https://rpc.ankr.com/solana"
];

function getRpcEndpoints(): string[] {
  const custom = [
    process.env.HELIUS_RPC_URL,
    process.env.ALCHEMY_RPC_URL,
    process.env.QUICKNODE_RPC_URL,
    process.env.SOLANA_RPC_URL,
  ].filter(Boolean) as string[];

  return custom.length > 0 ? Array.from(new Set([...custom, ...DEFAULT_FALLBACK_NODES])) : DEFAULT_FALLBACK_NODES;
}

// A rudimentary in-memory counter for round-robin. 
// Note: In serverless, this state might reset across cold starts, but it will still distribute load across concurrent instances.
let currentEndpointIndex = 0;

export async function POST(req: Request) {
  try {
    const rpcEndpoints = getRpcEndpoints();

    // Read the incoming RPC payload
    const body = await req.json();

    // Try endpoints with fallback logic
    let lastError: any = null;
    let attempts = 0;
    
    while (attempts < rpcEndpoints.length) {
      const endpoint = rpcEndpoints[currentEndpointIndex];
      
      // Advance the round-robin index
      currentEndpointIndex = (currentEndpointIndex + 1) % rpcEndpoints.length;
      attempts++;

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (response.ok) {
          const data = await response.json();
          // Rate-limit headers or 429 status from provider means we should technically try another one, 
          // but if the response is valid JSON-RPC error mapping to 429, it might just be inside `data.error`
          if (data.error && data.error.code === 429) {
             throw new Error("429 Too Many Requests in RPC response");
          }
          return NextResponse.json(data);
        } else if (response.status === 429) {
          throw new Error("HTTP 429 - Rate Limited");
        } else if (response.status >= 500) {
          throw new Error(`HTTP ${response.status} - Server Error`);
        } else {
          // If it's a 400 or other client error, it's likely a bad request, not a provider availability issue
          const data = await response.json();
          return NextResponse.json(data, { status: response.status });
        }
      } catch (error) {
        lastError = error;
        console.warn(`RPC endpoint ${endpoint} failed:`, error);
        // Continue to the next endpoint in the loop
      }
    }

    // If all endpoints failed
    return NextResponse.json(
      { error: 'All RPC providers failed or rate-limited', details: String(lastError) }, 
      { status: 503 }
    );

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
