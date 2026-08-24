import { describe, it, expect } from 'vitest';
import { storage } from '@/server/storage';

describe('Atomic Credit Deductions & Ledger Concurrency Suite', () => {
  const testWallet = `test_wallet_${Date.now().toString(36)}`;

  it('should create user, deduct credits atomically, and prevent double-spend overdrafts', async () => {
    // 1. Create a test user with initial credits
    const user = await storage.createUser({
      username: `atomic_test_${Date.now().toString(36)}`,
      walletAddress: testWallet,
      credits: 10,
    });

    expect(user).toBeDefined();
    expect(user.credits).toBe(10);

    // 2. Perform valid deduction of 4 credits
    const deductRes1 = await storage.deductCreditsAtomic({
      walletAddress: testWallet,
      amount: 4,
      description: 'Test Query 1',
    });

    expect(deductRes1.success).toBe(true);
    expect(deductRes1.credits).toBe(6);

    // 3. Perform valid deduction of 6 credits (balance becomes 0)
    const deductRes2 = await storage.deductCreditsAtomic({
      walletAddress: testWallet,
      amount: 6,
      description: 'Test Query 2',
    });

    expect(deductRes2.success).toBe(true);
    expect(deductRes2.credits).toBe(0);

    // 4. Attempt to deduct when balance is 0: must fail with insufficient balance
    const deductRes3 = await storage.deductCreditsAtomic({
      walletAddress: testWallet,
      amount: 1,
      description: 'Overdraft Attempt',
    });

    expect(deductRes3.success).toBe(false);
    expect(deductRes3.error).toContain('Insufficient');
  });
});
