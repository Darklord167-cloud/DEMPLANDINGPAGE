import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { storage } from '@/server/storage';
import crypto from 'crypto';

describe('Cryptographic Challenge Nonce & Replay Protection Suite', () => {
  const testWallet = 'Gy37g7iDGQiom6wwVcyHKVuZPZzmVTgwa3wJZQTRqqTH';
  const testAction = 'deduct_credits';
  const testDomain = 'darkempirelords.com';

  it('should create and store a valid cryptographic challenge nonce', async () => {
    const nonce = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    const challenge = await storage.createAuthChallenge({
      nonce,
      walletAddress: testWallet,
      action: testAction,
      domain: testDomain,
      issuedAt: now,
      expiresAt,
      consumed: false,
    });

    expect(challenge).toBeDefined();
    expect(challenge.nonce).toBe(nonce);
    expect(challenge.consumed).toBe(false);
  });

  it('should consume a valid challenge nonce exactly once', async () => {
    const nonce = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    await storage.createAuthChallenge({
      nonce,
      walletAddress: testWallet,
      action: testAction,
      domain: testDomain,
      issuedAt: now,
      expiresAt,
      consumed: false,
    });

    // 1st consumption: should succeed
    const firstAttempt = await storage.consumeAuthChallenge({
      nonce,
      walletAddress: testWallet,
      action: testAction,
      domain: testDomain,
    });

    expect(firstAttempt.valid).toBe(true);

    // 2nd consumption (replay attack): must fail
    const replayAttempt = await storage.consumeAuthChallenge({
      nonce,
      walletAddress: testWallet,
      action: testAction,
      domain: testDomain,
    });

    expect(replayAttempt.valid).toBe(false);
    expect(replayAttempt.error).toContain('already been consumed');
  });

  it('should reject expired challenge nonces', async () => {
    const nonce = crypto.randomBytes(32).toString('hex');
    const past = new Date(Date.now() - 10 * 60 * 1000); // 10 mins in the past
    const expiredAt = new Date(Date.now() - 5 * 60 * 1000); // 5 mins in the past

    await storage.createAuthChallenge({
      nonce,
      walletAddress: testWallet,
      action: testAction,
      domain: testDomain,
      issuedAt: past,
      expiresAt: expiredAt,
      consumed: false,
    });

    const attempt = await storage.consumeAuthChallenge({
      nonce,
      walletAddress: testWallet,
      action: testAction,
    });

    expect(attempt.valid).toBe(false);
    expect(attempt.error).toContain('expired');
  });

  it('should reject nonces with mismatched wallet address or action', async () => {
    const nonce = crypto.randomBytes(32).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

    await storage.createAuthChallenge({
      nonce,
      walletAddress: testWallet,
      action: 'vip_verify',
      domain: testDomain,
      issuedAt: now,
      expiresAt,
      consumed: false,
    });

    // Action mismatch test
    const actionMismatch = await storage.consumeAuthChallenge({
      nonce,
      walletAddress: testWallet,
      action: 'deduct_credits', // Expecting 'vip_verify'
    });

    expect(actionMismatch.valid).toBe(false);
    expect(actionMismatch.error).toContain('action mismatch');

    // Wallet mismatch test
    const walletMismatch = await storage.consumeAuthChallenge({
      nonce,
      walletAddress: '8yGrrj6d9p4WNPRkunVo1NwkRSX3VTo43ZS39xu7jupx',
      action: 'vip_verify',
    });

    expect(walletMismatch.valid).toBe(false);
    expect(walletMismatch.error).toContain('wallet mismatch');
  });
});
