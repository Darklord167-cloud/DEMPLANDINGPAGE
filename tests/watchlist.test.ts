import { describe, it, expect } from "vitest";
import { insertWatchlistSchema, insertPriceAlertSchema } from "../shared/schema";

describe("Watchlist & Price Alert Schemas", () => {
  it("should validate a correct Watchlist entry", () => {
    const validData = {
      walletAddress: "6Higx2gdaqYaukrkNomp1pVJX8uQNHAhavLE7qFnHjYD",
      tokenMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      tokenSymbol: "BONK",
      tokenName: "Bonk",
    };

    const parsed = insertWatchlistSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("should reject invalid Solana wallet address in Watchlist", () => {
    const invalidData = {
      walletAddress: "not-a-valid-address",
      tokenMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      tokenSymbol: "BONK",
      tokenName: "Bonk",
    };

    const parsed = insertWatchlistSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it("should validate a correct Price Alert entry", () => {
    const validAlert = {
      walletAddress: "6Higx2gdaqYaukrkNomp1pVJX8uQNHAhavLE7qFnHjYD",
      tokenSymbol: "DEMP",
      targetPriceUsd: "0.05",
      condition: "ABOVE",
    };

    const parsed = insertPriceAlertSchema.safeParse(validAlert);
    expect(parsed.success).toBe(true);
  });

  it("should reject invalid condition in Price Alert", () => {
    const invalidAlert = {
      walletAddress: "6Higx2gdaqYaukrkNomp1pVJX8uQNHAhavLE7qFnHjYD",
      tokenSymbol: "DEMP",
      targetPriceUsd: "0.05",
      condition: "INVALID_CONDITION",
    };

    const parsed = insertPriceAlertSchema.safeParse(invalidAlert);
    expect(parsed.success).toBe(false);
  });
});
