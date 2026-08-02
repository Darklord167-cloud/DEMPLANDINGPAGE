export interface YieldCalculationResult {
  stakedAmount: number;
  durationDays: number;
  baseApyPercent: number;
  vipBonusApyPercent: number;
  effectiveApyPercent: number;
  projectedTokensEarned: number;
  projectedUsdValue: number;
  totalTokensAtMaturity: number;
}

export function calculateYield({
  stakedAmount,
  durationDays,
  baseApyPercent = 15,
  vipTierId = "none",
  tokenPriceUsd = 0.0485,
}: {
  stakedAmount: number;
  durationDays: number;
  baseApyPercent?: number;
  vipTierId?: string;
  tokenPriceUsd?: number;
}): YieldCalculationResult {
  let vipBonusApyPercent = 0;
  if (vipTierId === "bronze") vipBonusApyPercent = 3;
  if (vipTierId === "silver") vipBonusApyPercent = 7;
  if (vipTierId === "gold") vipBonusApyPercent = 12;
  if (vipTierId === "diamond") vipBonusApyPercent = 20;

  const effectiveApyPercent = baseApyPercent + vipBonusApyPercent;
  const yearlyRate = effectiveApyPercent / 100;
  
  // Daily compounding yield formula: A = P * (1 + r/365)^(365 * (days/365))
  const compoundMultiplier = Math.pow(1 + yearlyRate / 365, durationDays);
  const totalTokensAtMaturity = stakedAmount * compoundMultiplier;
  const projectedTokensEarned = totalTokensAtMaturity - stakedAmount;
  const projectedUsdValue = Math.round(projectedTokensEarned * tokenPriceUsd * 100) / 100;

  return {
    stakedAmount,
    durationDays,
    baseApyPercent,
    vipBonusApyPercent,
    effectiveApyPercent,
    projectedTokensEarned: Math.round(projectedTokensEarned),
    projectedUsdValue,
    totalTokensAtMaturity: Math.round(totalTokensAtMaturity),
  };
}
