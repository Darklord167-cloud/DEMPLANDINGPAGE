import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '../app/api/stripe/webhook/route';
import { storage } from '@/server/storage';

describe('Stripe Webhook Hardening & Idempotency Suite', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should reject webhook requests with missing signature header', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret_123';
    process.env.STRIPE_SECRET_KEY = 'sk_test_secret_123';

    const req = new Request('http://localhost/api/stripe/webhook', {
      method: 'POST',
      body: JSON.stringify({ id: 'evt_test_123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain('Missing Stripe-Signature');
  });

  it('should process and fulfill credits idempotently using database storage', async () => {
    const testEventId = `evt_test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const testSessionId = `cs_test_${Date.now()}`;
    const testWallet = 'Gy37g7iDGQiom6wwVcyHKVuZPZzmVTgwa3wJZQTRqqTH';
    const creditsAwarded = 25;

    // 1st fulfillment: should award credits and record to persistent table
    const firstResult = await storage.fulfillStripeCredits({
      eventId: testEventId,
      eventType: 'checkout.session.completed',
      sessionId: testSessionId,
      walletAddress: testWallet,
      creditsAmount: creditsAwarded,
      amountTotal: 2500,
      currency: 'usd',
    });

    expect(firstResult.success).toBe(true);
    expect(firstResult.duplicate).toBe(false);
    expect(firstResult.newBalance).toBeGreaterThanOrEqual(creditsAwarded);

    // 2nd fulfillment with identical event ID: must be recognized as duplicate without adding credits
    const secondResult = await storage.fulfillStripeCredits({
      eventId: testEventId,
      eventType: 'checkout.session.completed',
      sessionId: testSessionId,
      walletAddress: testWallet,
      creditsAmount: creditsAwarded,
      amountTotal: 2500,
      currency: 'usd',
    });

    expect(secondResult.success).toBe(true);
    expect(secondResult.duplicate).toBe(true);

    // Verify event is present in stripe_events table
    const storedEvent = await storage.getStripeEvent(testEventId);
    expect(storedEvent).toBeDefined();
    expect(storedEvent?.id).toBe(testEventId);
    expect(storedEvent?.creditsAwarded).toBe(creditsAwarded);
  });
});
