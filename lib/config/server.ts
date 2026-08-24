import "server-only";
import { DEMP_TOKEN_MINT, DEMP_DEPLOYER_WALLET, SOLANA_RPC_ENDPOINTS } from "./public";

/**
 * SERVER-SAFE CONFIGURATION & SECRETS MANAGEMENT
 * NEVER import this file in Client Components ("use client").
 */

export const SERVER_CONFIG = {
  // Database
  DATABASE_URL: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || "",

  // Stripe Billing
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || "",

  // AI Engines
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",

  // Market & DeFi APIs
  BIRDEYE_API_KEY: process.env.BIRDEYE_API_KEY || "",

  // Webhook & Relay Security
  RELAY_SECRET_KEY: process.env.RELAY_SECRET_KEY || "",
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || "",
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || "",
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || "",

  // Email Relay (Brevo / Resend)
  BREVO_API_KEY: process.env.BREVO_API_KEY || "",
  BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_FROM || "darklord@darkempirelords.com",
  BREVO_RECIPIENT_EMAIL: process.env.BREVO_RECIPIENT_EMAIL || process.env.EMAIL_TO || "angelcarmona167@gmail.com",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",

  // Solana RPC Cluster for Server-Side Verification
  RPC_ENDPOINTS: [
    process.env.HELIUS_RPC_URL,
    process.env.ALCHEMY_RPC_URL,
    process.env.QUICKNODE_RPC_URL,
    process.env.SOLANA_RPC_URL,
    ...SOLANA_RPC_ENDPOINTS,
  ].filter(Boolean) as string[],
} as const;

export function validateRequiredServerSecret(
  key: keyof typeof SERVER_CONFIG,
  serviceName: string
): string {
  const val = SERVER_CONFIG[key];
  if (!val || (typeof val === "string" && val.trim() === "")) {
    throw new Error(`[Server Config] Missing required environment variable for ${serviceName}: ${String(key)}`);
  }
  return val as string;
}
