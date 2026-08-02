import { describe, it, expect } from "vitest";
import { calculateYield } from "../lib/yield-calculator";

describe("Staking & Yield Simulator", () => {
  it("should calculate base yield for 10,000 DEMP over 365 days at 15% APY", () => {
    const result = calculateYield({
      stakedAmount: 10000,
      durationDays: 365,
      baseApyPercent: 15,
      vipTierId: "none",
      tokenPriceUsd: 0.05,
    });

    expect(result.stakedAmount).toBe(10000);
    expect(result.durationDays).toBe(365);
    expect(result.effectiveApyPercent).toBe(15);
    expect(result.projectedTokensEarned).toBeGreaterThan(1500); // compounding exceeds 15% flat
    expect(result.totalTokensAtMaturity).toBe(10000 + result.projectedTokensEarned);
    expect(result.projectedUsdValue).toBeCloseTo(result.projectedTokensEarned * 0.05, 1);
  });

  it("should apply VIP Diamond +20% APY booster correctly", () => {
    const baseResult = calculateYield({
      stakedAmount: 10000,
      durationDays: 365,
      baseApyPercent: 15,
      vipTierId: "none",
    });

    const diamondResult = calculateYield({
      stakedAmount: 10000,
      durationDays: 365,
      baseApyPercent: 15,
      vipTierId: "diamond",
    });

    expect(diamondResult.vipBonusApyPercent).toBe(20);
    expect(diamondResult.effectiveApyPercent).toBe(35);
    expect(diamondResult.projectedTokensEarned).toBeGreaterThan(baseResult.projectedTokensEarned);
  });

  it("should handle 0 staked amount gracefully", () => {
    const result = calculateYield({
      stakedAmount: 0,
      durationDays: 90,
      vipTierId: "gold",
    });

    expect(result.projectedTokensEarned).toBe(0);
    expect(result.projectedUsdValue).toBe(0);
    expect(result.totalTokensAtMaturity).toBe(0);
  });
});
