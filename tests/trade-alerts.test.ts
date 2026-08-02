import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '../app/api/webhooks/trade-alerts/route';

describe('Trade Alerts Webhook API Route', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should reject unauthorized requests when RELAY_SECRET_KEY is configured', async () => {
    process.env.RELAY_SECRET_KEY = 'secret-key-123';

    const req = new Request('http://localhost/api/webhooks/trade-alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer wrong-secret',
      },
      body: JSON.stringify({ amountUsd: 5000 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain('Unauthorized');
  });

  it('should accept valid authorized requests with RELAY_SECRET_KEY header', async () => {
    process.env.RELAY_SECRET_KEY = 'secret-key-123';

    const req = new Request('http://localhost/api/webhooks/trade-alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer secret-key-123',
      },
      body: JSON.stringify({ amountUsd: 500 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.alerted).toBe(false);
    expect(json.reason).toContain('Whale alert threshold not met');
  });

  it('should skip whale alert broadcasting when trade amount <= $1,000 USD', async () => {
    const req = new Request('http://localhost/api/webhooks/trade-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountUsd: 1000,
        tokenSymbol: '$DEMP',
        trader: '8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.alerted).toBe(false);
  });

  it('should trigger Dual-Relay WHALE ALERT when trade amount > $1,000 USD', async () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/123/abc';
    process.env.TELEGRAM_BOT_TOKEN = 'mock-bot-token';

    const mockFetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('discord.com')) {
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      if (url.includes('telegram.org')) {
        return Promise.resolve(new Response(JSON.stringify({ ok: true, result: {} }), { status: 200 }));
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = new Request('http://localhost/api/webhooks/trade-alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountUsd: 15420,
        type: 'BUY',
        tokenSymbol: '$DEMP',
        tokenAmount: 500000,
        trader: '8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx',
        signature: '5K123456789abcdef',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.alerted).toBe(true);
    expect(json.whaleAlert.amountUsd).toBe(15420);
    expect(json.relays.discord.success).toBe(true);
    expect(json.relays.telegram.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should process trade alerts using alternative field aliases (tradeSizeUsd, operationType, traderWallet, txSignature, x-relay-secret-key)', async () => {
    process.env.RELAY_SECRET_KEY = 'Dondeestalabibloteca$1';

    const req = new Request('http://localhost/api/webhooks/trade-alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-relay-secret-key': 'Dondeestalabibloteca$1',
      },
      body: JSON.stringify({
        tradeSizeUsd: 5000.00,
        operationType: 'BUY',
        tokenSymbol: '$DEMP',
        tokenAmount: 103092,
        traderWallet: '8yGrj6d9p4WfPRkunVo1NwkRSX3VTo43ZS39xu7jupx',
        timestamp: '2026-08-02T19:15:00Z',
        txSignature: '5vabY3...',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.alerted).toBe(true);
    expect(json.whaleAlert.amountUsd).toBe(5000);
    expect(json.whaleAlert.type).toBe('BUY');
    expect(json.whaleAlert.trader).toBe('8yGrj6d9p4WfPRkunVo1NwkRSX3VTo43ZS39xu7jupx');
    expect(json.whaleAlert.signature).toBe('5vabY3...');
  });
});
