import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password"),
  walletAddress: text("wallet_address").unique(),
  credits: integer("credits").default(0).notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  vipTier: text("vip_tier").default("none").notNull(),
  dempBalance: text("demp_balance").default("0").notNull(),
  lastVipVerifiedAt: timestamp("last_vip_verified_at"),
  vipVerified: boolean("vip_verified").default(false).notNull(),
}, (table) => [
  index("users_wallet_address_idx").on(table.walletAddress),
]);

export const vipVerifications = pgTable("vip_verifications", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  dempBalance: text("demp_balance").notNull(),
  tier: text("tier").notNull(),
  signatureVerified: boolean("signature_verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at").defaultNow().notNull(),
}, (table) => [
  index("vip_verifications_wallet_address_idx").on(table.walletAddress),
  index("vip_verifications_verified_at_idx").on(table.verifiedAt),
]);

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscribedAt: timestamp("subscribed_at").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const watchlists = pgTable("watchlists", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  tokenMint: text("token_mint").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  tokenName: text("token_name").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
}, (table) => [
  index("watchlists_wallet_address_idx").on(table.walletAddress),
]);

export const priceAlerts = pgTable("price_alerts", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  tokenSymbol: text("token_symbol").notNull(),
  targetPriceUsd: text("target_price_usd").notNull(),
  condition: text("condition").notNull(), // 'ABOVE' | 'BELOW'
  triggered: boolean("triggered").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("price_alerts_wallet_address_idx").on(table.walletAddress),
]);

export const stripeEvents = pgTable("stripe_events", {
  id: varchar("id").primaryKey(), // Stripe Event ID (evt_...)
  type: text("type").notNull(),
  processedAt: timestamp("processed_at").defaultNow().notNull(),
  sessionId: text("session_id"),
  walletAddress: text("wallet_address"),
  creditsAwarded: integer("credits_awarded").default(0).notNull(),
  amountTotal: integer("amount_total"),
  currency: text("currency"),
  status: text("status").default("completed").notNull(),
});

export const creditLedger = pgTable("credit_ledger", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  walletAddress: text("wallet_address").notNull(),
  action: text("action").notNull(), // 'PURCHASE' | 'DEDUCTION' | 'REFUND' | 'ADMIN_GRANT'
  amount: integer("amount").notNull(), // Positive for credits awarded, negative for deducted
  balanceAfter: integer("balance_after").notNull(),
  stripeSessionId: text("stripe_session_id"),
  stripeEventId: text("stripe_event_id"),
  nonce: text("nonce"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("credit_ledger_wallet_idx").on(table.walletAddress),
  index("credit_ledger_created_at_idx").on(table.createdAt),
]);

export const authChallenges = pgTable("auth_challenges", {
  nonce: varchar("nonce", { length: 64 }).primaryKey(),
  walletAddress: text("wallet_address").notNull(),
  action: text("action").notNull(), // 'deduct_credits' | 'vip_verify' | 'login'
  domain: text("domain").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  consumed: boolean("consumed").default(false).notNull(),
  consumedAt: timestamp("consumed_at"),
}, (table) => [
  index("auth_challenges_wallet_idx").on(table.walletAddress),
  index("auth_challenges_expires_idx").on(table.expiresAt),
]);

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  walletAddress: text("wallet_address"),
  action: text("action").notNull(),
  details: text("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("audit_logs_wallet_idx").on(table.walletAddress),
  index("audit_logs_created_at_idx").on(table.createdAt),
]);

export const webhookEvents = pgTable("webhook_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  source: text("source").notNull(), // 'telegram' | 'stripe' | 'helius' | 'hq'
  eventType: text("event_type").notNull(),
  idempotencyKey: text("idempotency_key").unique().notNull(),
  status: text("status").default("processed").notNull(),
  payloadSummary: text("payload_summary"),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
}, (table) => [
  index("webhook_events_idempotency_idx").on(table.idempotencyKey),
  index("webhook_events_received_at_idx").on(table.receivedAt),
]);

export const tradingCredentialsMetadata = pgTable("trading_credentials_metadata", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  provider: text("provider").notNull(), // 'solana' | 'okx' | 'btcc' | 'telegram'
  configured: boolean("configured").default(false).notNull(),
  maskedIdentifier: text("masked_identifier"),
  lastRotatedAt: timestamp("last_rotated_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("trading_credentials_user_idx").on(table.userId),
]);

export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().nullable().optional(),
  walletAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address").nullable().optional(),
  credits: z.number().int().optional(),
  vipTier: z.string().optional(),
  dempBalance: z.string().optional(),
});

export const insertVipVerificationSchema = z.object({
  walletAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address"),
  dempBalance: z.string(),
  tier: z.string(),
  signatureVerified: z.boolean().optional(),
});

export const insertSubscriberSchema = z.object({
  email: z.string().email("Please enter a valid email address").max(100),
});

export const insertContactMessageSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Please enter a valid email address").max(100),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(1, "Message is required").max(5000),
});

export const insertWatchlistSchema = z.object({
  walletAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address"),
  tokenMint: z.string().min(32).max(44),
  tokenSymbol: z.string().min(1).max(20),
  tokenName: z.string().min(1).max(100),
});

export const insertPriceAlertSchema = z.object({
  walletAddress: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address"),
  tokenSymbol: z.string().min(1).max(20),
  targetPriceUsd: z.string(),
  condition: z.enum(["ABOVE", "BELOW"]),
});

export const insertAuditLogSchema = z.object({
  userId: z.string().optional(),
  walletAddress: z.string().optional(),
  action: z.string().min(1),
  details: z.string().optional(),
  ipAddress: z.string().optional(),
});

export const insertWebhookEventSchema = z.object({
  source: z.string().min(1),
  eventType: z.string().min(1),
  idempotencyKey: z.string().min(1),
  status: z.string().default("processed"),
  payloadSummary: z.string().optional(),
});

export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type VipVerification = typeof vipVerifications.$inferSelect;
export type InsertVipVerification = typeof vipVerifications.$inferInsert;
export type InsertSubscriber = typeof subscribers.$inferInsert;
export type Subscriber = typeof subscribers.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type Watchlist = typeof watchlists.$inferSelect;
export type InsertWatchlist = typeof watchlists.$inferInsert;
export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = typeof priceAlerts.$inferInsert;
export type StripeEvent = typeof stripeEvents.$inferSelect;
export type InsertStripeEvent = typeof stripeEvents.$inferInsert;
export type CreditLedgerEntry = typeof creditLedger.$inferSelect;
export type InsertCreditLedgerEntry = typeof creditLedger.$inferInsert;
export type AuthChallenge = typeof authChallenges.$inferSelect;
export type InsertAuthChallenge = typeof authChallenges.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;
export type TradingCredentialsMetadata = typeof tradingCredentialsMetadata.$inferSelect;
export type InsertTradingCredentialsMetadata = typeof tradingCredentialsMetadata.$inferInsert;


