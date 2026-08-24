import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST as challengePOST } from '../app/api/auth/challenge/route';
import { POST as deductPOST } from '../app/api/user/credits/deduct/route';
import { POST as rpcPOST } from '../app/api/rpc/route';
import { GET as setupCommandsGET } from '../app/api/telegram/setup-commands/route';
import { POST as tradeAlertsPOST } from '../app/api/webhooks/trade-alerts/route';

describe('API Security Boundaries, Rate Limiting & Regression Test Suite', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('Challenge Nonce API Security Boundary', () => {
    it('should reject malformed requests with invalid Solana wallet address', async () => {
      const req = new Request('http://localhost/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: 'invalid_solana_address_too_short',
          action: 'deduct_credits',
        }),
      });

      const res = await challengePOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBeDefined();
    });

    it('should reject requests with invalid action types', async () => {
      const req = new Request('http://localhost/api/auth/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: 'Gy37g7iDGQiom6wwVcyHKVuZPZzmVTgwa3wJZQTRqqTH',
          action: 'unauthorized_action_type',
        }),
      });

      const res = await challengePOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Invalid challenge request');
    });
  });

  describe('Credit Deduction API Security Boundary', () => {
    it('should reject requests with invalid cryptographic signatures', async () => {
      const req = new Request('http://localhost/api/user/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: 'Gy37g7iDGQiom6wwVcyHKVuZPZzmVTgwa3wJZQTRqqTH',
          amount: 1,
          signature: 'invalid_base58_signature_123456789',
          message: 'Dark Empire Lords Authentication Challenge\nNonce: 12345',
        }),
      });

      const res = await deductPOST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBeDefined();
    });

    it('should reject requests with amounts outside the allowed 1-100 range', async () => {
      const req = new Request('http://localhost/api/user/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: 'Gy37g7iDGQiom6wwVcyHKVuZPZzmVTgwa3wJZQTRqqTH',
          amount: 5000, // Exceeds max 100 limit
          signature: 'valid_looking_signature',
          message: 'test',
        }),
      });

      const res = await deductPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Invalid credit deduction request');
    });
  });

  describe('RPC Proxy Security Boundary', () => {
    it('should reject malformed non-JSON payloads', async () => {
      const req = new Request('http://localhost/api/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ malformed json unclosed string',
      });

      const res = await rpcPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Invalid JSON-RPC payload');
    });

    it('should reject oversized payloads exceeding 256KB limit', async () => {
      const oversizedPayload = 'a'.repeat(300 * 1024); // 300KB
      const req = new Request('http://localhost/api/rpc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: oversizedPayload,
      });

      const res = await rpcPOST(req);
      expect(res.status).toBe(413);
      const json = await res.json();
      expect(json.error).toContain('256KB');
    });
  });

  describe('Admin Authorization Fail-Closed Boundary', () => {
    it('should reject setup-commands when no admin secret key header is supplied', async () => {
      process.env.RELAY_SECRET_KEY = 'super_secret_admin_key';

      const req = new Request('http://localhost/api/telegram/setup-commands');
      const res = await setupCommandsGET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('Unauthorized');
    });

    it('should reject setup-commands when an incorrect admin token is supplied', async () => {
      process.env.RELAY_SECRET_KEY = 'super_secret_admin_key';

      const req = new Request('http://localhost/api/telegram/setup-commands', {
        headers: {
          Authorization: 'Bearer wrong_token_attempt',
        },
      });
      const res = await setupCommandsGET(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
    });
  });

  describe('Trade Alerts Webhook Authentication Boundary', () => {
    it('should reject trade alerts when unauthorized', async () => {
      process.env.RELAY_SECRET_KEY = 'trade_alerts_secret';

      const req = new Request('http://localhost/api/webhooks/trade-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer fake_secret',
        },
        body: JSON.stringify({ amountUsd: 5000 }),
      });

      const res = await tradeAlertsPOST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toContain('Unauthorized');
    });
  });
});
