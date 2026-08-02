import { describe, it, expect } from 'vitest';
import { getTierForBalance, getNextTierInfo, VIP_TIERS } from '../lib/vip-tiers';

describe('VIP Tiers Logic', () => {
  it('should return tier "none" for 0 balance', () => {
    const tier = getTierForBalance(0);
    expect(tier.id).toBe('none');
    expect(tier.discountPercentage).toBe(0);
  });

  it('should return Bronze tier for 1,000 $DEMP balance', () => {
    const tier = getTierForBalance(1000);
    expect(tier.id).toBe('bronze');
    expect(tier.discountPercentage).toBe(5);
  });

  it('should return Silver tier for 10,000 $DEMP balance', () => {
    const tier = getTierForBalance(10000);
    expect(tier.id).toBe('silver');
    expect(tier.discountPercentage).toBe(15);
  });

  it('should return Gold tier for 50,000 $DEMP balance', () => {
    const tier = getTierForBalance(50000);
    expect(tier.id).toBe('gold');
    expect(tier.discountPercentage).toBe(30);
  });

  it('should return Dark Lord (highest) tier for 100,000+ $DEMP balance', () => {
    const tier = getTierForBalance(200000);
    expect(tier.id).toBe('dark_lord');
    expect(tier.discountPercentage).toBe(50);
  });

  it('should calculate next tier progress correctly', () => {
    const info = getNextTierInfo(500);
    expect(info.nextTier?.id).toBe('bronze');
    expect(info.needed).toBe(500);
    expect(info.progress).toBe(50);
  });
});
