import {
  type User, type InsertUser,
  type Subscriber, type InsertSubscriber,
  type ContactMessage, type InsertContactMessage,
  type VipVerification, type InsertVipVerification,
  type StripeEvent, type InsertStripeEvent,
  type CreditLedgerEntry, type InsertCreditLedgerEntry,
  type AuthChallenge, type InsertAuthChallenge,
  users, subscribers, contactMessages, vipVerifications,
  stripeEvents, creditLedger, authChallenges
} from "@shared/schema";
import { withDbRetry } from "./db";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deductCredits(id: string, amount: number): Promise<User | undefined>;
  deductCreditsAtomic(params: {
    walletAddress: string;
    amount: number;
    nonce?: string;
    description?: string;
  }): Promise<{ success: boolean; credits?: number; error?: string }>;

  createVipVerification(data: InsertVipVerification): Promise<VipVerification>;
  getLatestVipVerification(walletAddress: string): Promise<VipVerification | undefined>;
  updateUserVipByWallet(walletAddress: string, vipTier: string, dempBalance: string): Promise<User | undefined>;

  createSubscriber(data: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getAllSubscribers(): Promise<Subscriber[]>;

  createContactMessage(data: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  markMessageRead(id: number): Promise<ContactMessage | undefined>;

  // Stripe Persistent Idempotency & Ledger
  getStripeEvent(id: string): Promise<StripeEvent | undefined>;
  fulfillStripeCredits(params: {
    eventId: string;
    eventType: string;
    sessionId: string;
    walletAddress: string;
    creditsAmount: number;
    amountTotal?: number;
    currency?: string;
    customerId?: string | null;
  }): Promise<{ success: boolean; duplicate?: boolean; newBalance?: number }>;

  // Auth Challenge & Nonce Protection
  createAuthChallenge(data: InsertAuthChallenge): Promise<AuthChallenge>;
  consumeAuthChallenge(params: {
    nonce: string;
    walletAddress: string;
    action: string;
    domain?: string;
  }): Promise<{ valid: boolean; error?: string }>;
}

export class DatabaseStorage implements IStorage {
  // In-memory fallback stores for offline testing / development
  private memUsers = new Map<string, User>();
  private memSubscribers = new Map<string, Subscriber>();
  private memContacts: ContactMessage[] = [];
  private memVipVerifications: VipVerification[] = [];
  private memStripeEvents = new Map<string, StripeEvent>();
  private memCreditLedger: CreditLedgerEntry[] = [];
  private memAuthChallenges = new Map<string, AuthChallenge>();

  private isDbConfigured(): boolean {
    return Boolean(process.env.NEON_DATABASE_URL || process.env.DATABASE_URL);
  }

  async getUser(id: string): Promise<User | undefined> {
    if (!this.isDbConfigured()) {
      return this.memUsers.get(id);
    }
    return withDbRetry(async (db) => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!this.isDbConfigured()) {
      return Array.from(this.memUsers.values()).find((u) => u.username === username);
    }
    return withDbRetry(async (db) => {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    });
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    if (!this.isDbConfigured()) {
      return Array.from(this.memUsers.values()).find((u) => u.walletAddress === walletAddress);
    }
    return withDbRetry(async (db) => {
      const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
      return user;
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!this.isDbConfigured()) {
      const user: User = {
        id: crypto.randomUUID(),
        username: insertUser.username,
        password: insertUser.password || null,
        walletAddress: insertUser.walletAddress || null,
        credits: insertUser.credits ?? 0,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        vipTier: insertUser.vipTier || "none",
        dempBalance: insertUser.dempBalance || "0",
        lastVipVerifiedAt: null,
        vipVerified: false,
      };
      this.memUsers.set(user.id, user);
      return user;
    }
    return withDbRetry(async (db) => {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    if (!this.isDbConfigured()) {
      const existing = this.memUsers.get(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...data };
      this.memUsers.set(id, updated);
      return updated;
    }
    return withDbRetry(async (db) => {
      const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
      return user;
    });
  }

  async deductCredits(id: string, amount: number): Promise<User | undefined> {
    if (!this.isDbConfigured()) {
      const user = this.memUsers.get(id);
      if (!user || user.credits < amount) return undefined;
      user.credits -= amount;
      this.memUsers.set(id, user);
      return user;
    }
    return withDbRetry(async (db) => {
      const [user] = await db
        .update(users)
        .set({
          credits: sql`${users.credits} - ${amount}`
        })
        .where(and(eq(users.id, id), gte(users.credits, amount)))
        .returning();
      return user;
    });
  }

  async deductCreditsAtomic(params: {
    walletAddress: string;
    amount: number;
    nonce?: string;
    description?: string;
  }): Promise<{ success: boolean; credits?: number; error?: string }> {
    if (!this.isDbConfigured()) {
      const user = await this.getUserByWalletAddress(params.walletAddress);
      if (!user) {
        return { success: false, error: "User wallet not registered" };
      }
      if (user.credits < params.amount) {
        return { success: false, error: "Insufficient credit balance" };
      }
      user.credits -= params.amount;
      this.memUsers.set(user.id, user);

      this.memCreditLedger.push({
        id: crypto.randomUUID(),
        userId: user.id,
        walletAddress: params.walletAddress,
        action: "DEDUCTION",
        amount: -params.amount,
        balanceAfter: user.credits,
        stripeSessionId: null,
        stripeEventId: null,
        nonce: params.nonce || null,
        description: params.description || "Oracle Inference Deduction",
        createdAt: new Date(),
      });

      return { success: true, credits: user.credits };
    }

    return withDbRetry(async (db) => {
      const user = await this.getUserByWalletAddress(params.walletAddress);
      if (!user) {
        return { success: false, error: "User wallet not registered" };
      }

      if (user.credits < params.amount) {
        return { success: false, error: "Insufficient credit balance" };
      }

      const [updated] = await db
        .update(users)
        .set({
          credits: sql`${users.credits} - ${params.amount}`
        })
        .where(and(eq(users.id, user.id), gte(users.credits, params.amount)))
        .returning();

      if (!updated) {
        return { success: false, error: "Concurrent transaction conflict or insufficient balance" };
      }

      try {
        await db.insert(creditLedger).values({
          userId: user.id,
          walletAddress: params.walletAddress,
          action: "DEDUCTION",
          amount: -params.amount,
          balanceAfter: updated.credits,
          nonce: params.nonce,
          description: params.description || "Oracle Inference Deduction",
        });
      } catch (ledgerErr) {
        console.warn("[Storage] Credit ledger record notice:", ledgerErr);
      }

      return { success: true, credits: updated.credits };
    });
  }

  async createVipVerification(data: InsertVipVerification): Promise<VipVerification> {
    if (!this.isDbConfigured()) {
      const record: VipVerification = {
        id: this.memVipVerifications.length + 1,
        walletAddress: data.walletAddress,
        dempBalance: data.dempBalance,
        tier: data.tier,
        signatureVerified: data.signatureVerified ?? false,
        verifiedAt: new Date(),
      };
      this.memVipVerifications.push(record);
      return record;
    }
    return withDbRetry(async (db) => {
      const [record] = await db.insert(vipVerifications).values({
        walletAddress: data.walletAddress,
        dempBalance: data.dempBalance,
        tier: data.tier,
        signatureVerified: data.signatureVerified ?? false,
        verifiedAt: new Date(),
      }).returning();
      return record;
    });
  }

  async getLatestVipVerification(walletAddress: string): Promise<VipVerification | undefined> {
    if (!this.isDbConfigured()) {
      return [...this.memVipVerifications]
        .reverse()
        .find((v) => v.walletAddress === walletAddress);
    }
    return withDbRetry(async (db) => {
      const [record] = await db
        .select()
        .from(vipVerifications)
        .where(eq(vipVerifications.walletAddress, walletAddress))
        .orderBy(desc(vipVerifications.verifiedAt))
        .limit(1);
      return record;
    });
  }

  async updateUserVipByWallet(walletAddress: string, vipTier: string, dempBalance: string): Promise<User | undefined> {
    if (!this.isDbConfigured()) {
      const existing = await this.getUserByWalletAddress(walletAddress);
      if (existing) {
        existing.vipTier = vipTier;
        existing.dempBalance = dempBalance;
        existing.vipVerified = true;
        existing.lastVipVerifiedAt = new Date();
        this.memUsers.set(existing.id, existing);
        return existing;
      }
      return undefined;
    }
    return withDbRetry(async (db) => {
      const existing = await this.getUserByWalletAddress(walletAddress);
      if (existing) {
        const [updated] = await db
          .update(users)
          .set({
            vipTier,
            dempBalance,
            vipVerified: true,
            lastVipVerifiedAt: new Date(),
          })
          .where(eq(users.walletAddress, walletAddress))
          .returning();
        return updated;
      }
      return undefined;
    });
  }

  async createSubscriber(data: InsertSubscriber): Promise<Subscriber> {
    if (!this.isDbConfigured()) {
      const sub: Subscriber = {
        id: this.memSubscribers.size + 1,
        email: data.email,
        subscribedAt: new Date(),
        active: true,
      };
      this.memSubscribers.set(data.email, sub);
      return sub;
    }
    return withDbRetry(async (db) => {
      const [subscriber] = await db.insert(subscribers).values(data).returning();
      return subscriber;
    });
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    if (!this.isDbConfigured()) {
      return this.memSubscribers.get(email);
    }
    return withDbRetry(async (db) => {
      const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.email, email));
      return subscriber;
    });
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    if (!this.isDbConfigured()) {
      return Array.from(this.memSubscribers.values());
    }
    return withDbRetry(async (db) => {
      return await db.select().from(subscribers);
    });
  }

  async createContactMessage(data: InsertContactMessage): Promise<ContactMessage> {
    if (!this.isDbConfigured()) {
      const msg: ContactMessage = {
        id: this.memContacts.length + 1,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        read: false,
        createdAt: new Date(),
      };
      this.memContacts.push(msg);
      return msg;
    }
    return withDbRetry(async (db) => {
      const [message] = await db.insert(contactMessages).values(data).returning();
      return message;
    });
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    if (!this.isDbConfigured()) {
      return [...this.memContacts];
    }
    return withDbRetry(async (db) => {
      return await db.select().from(contactMessages);
    });
  }

  async markMessageRead(id: number): Promise<ContactMessage | undefined> {
    if (!this.isDbConfigured()) {
      const msg = this.memContacts.find((c) => c.id === id);
      if (msg) {
        msg.read = true;
        return msg;
      }
      return undefined;
    }
    return withDbRetry(async (db) => {
      const [message] = await db
        .update(contactMessages)
        .set({ read: true })
        .where(eq(contactMessages.id, id))
        .returning();
      return message;
    });
  }

  // Stripe Persistent Idempotency & Credit Fulfillment
  async getStripeEvent(id: string): Promise<StripeEvent | undefined> {
    if (!this.isDbConfigured()) {
      return this.memStripeEvents.get(id);
    }
    return withDbRetry(async (db) => {
      const [event] = await db.select().from(stripeEvents).where(eq(stripeEvents.id, id));
      return event;
    });
  }

  async fulfillStripeCredits(params: {
    eventId: string;
    eventType: string;
    sessionId: string;
    walletAddress: string;
    creditsAmount: number;
    amountTotal?: number;
    currency?: string;
    customerId?: string | null;
  }): Promise<{ success: boolean; duplicate?: boolean; newBalance?: number }> {
    if (!this.isDbConfigured()) {
      if (this.memStripeEvents.has(params.eventId)) {
        return { success: true, duplicate: true };
      }

      let user = await this.getUserByWalletAddress(params.walletAddress);
      if (!user) {
        user = await this.createUser({
          username: `wallet_${params.walletAddress.slice(0, 8)}`,
          walletAddress: params.walletAddress,
          password: null,
        });
      }

      user.credits += params.creditsAmount;
      if (params.customerId) {
        user.stripeCustomerId = params.customerId;
      }
      this.memUsers.set(user.id, user);

      const event: StripeEvent = {
        id: params.eventId,
        type: params.eventType,
        processedAt: new Date(),
        sessionId: params.sessionId,
        walletAddress: params.walletAddress,
        creditsAwarded: params.creditsAmount,
        amountTotal: params.amountTotal || null,
        currency: params.currency || "usd",
        status: "completed",
      };
      this.memStripeEvents.set(params.eventId, event);

      this.memCreditLedger.push({
        id: crypto.randomUUID(),
        userId: user.id,
        walletAddress: params.walletAddress,
        action: "PURCHASE",
        amount: params.creditsAmount,
        balanceAfter: user.credits,
        stripeSessionId: params.sessionId,
        stripeEventId: params.eventId,
        nonce: null,
        description: `Stripe Checkout ${params.creditsAmount} Credits`,
        createdAt: new Date(),
      });

      return { success: true, duplicate: false, newBalance: user.credits };
    }

    return withDbRetry(async (db) => {
      const [existingEvent] = await db
        .select()
        .from(stripeEvents)
        .where(eq(stripeEvents.id, params.eventId));

      if (existingEvent) {
        return { success: true, duplicate: true };
      }

      let user = await this.getUserByWalletAddress(params.walletAddress);
      if (!user) {
        user = await this.createUser({
          username: `wallet_${params.walletAddress.slice(0, 8)}`,
          walletAddress: params.walletAddress,
          password: null,
        });
      }

      const customerId = params.customerId || user.stripeCustomerId;
      const [updatedUser] = await db
        .update(users)
        .set({
          credits: sql`${users.credits} + ${params.creditsAmount}`,
          stripeCustomerId: customerId,
        })
        .where(eq(users.id, user.id))
        .returning();

      const newBalance = updatedUser?.credits || (user.credits + params.creditsAmount);

      await db.insert(stripeEvents).values({
        id: params.eventId,
        type: params.eventType,
        sessionId: params.sessionId,
        walletAddress: params.walletAddress,
        creditsAwarded: params.creditsAmount,
        amountTotal: params.amountTotal || null,
        currency: params.currency || "usd",
        status: "completed",
      });

      await db.insert(creditLedger).values({
        userId: user.id,
        walletAddress: params.walletAddress,
        action: "PURCHASE",
        amount: params.creditsAmount,
        balanceAfter: newBalance,
        stripeSessionId: params.sessionId,
        stripeEventId: params.eventId,
        description: `Stripe Checkout ${params.creditsAmount} Credits`,
      });

      return { success: true, duplicate: false, newBalance };
    });
  }

  // Auth Challenges & Nonce Protection
  async createAuthChallenge(data: InsertAuthChallenge): Promise<AuthChallenge> {
    if (!this.isDbConfigured()) {
      const challenge: AuthChallenge = {
        nonce: data.nonce,
        walletAddress: data.walletAddress,
        action: data.action,
        domain: data.domain,
        issuedAt: data.issuedAt || new Date(),
        expiresAt: data.expiresAt,
        consumed: data.consumed ?? false,
        consumedAt: data.consumedAt || null,
      };
      this.memAuthChallenges.set(data.nonce, challenge);
      return challenge;
    }
    return withDbRetry(async (db) => {
      const [challenge] = await db.insert(authChallenges).values(data).returning();
      return challenge;
    });
  }

  async consumeAuthChallenge(params: {
    nonce: string;
    walletAddress: string;
    action: string;
    domain?: string;
  }): Promise<{ valid: boolean; error?: string }> {
    if (!this.isDbConfigured()) {
      const challenge = this.memAuthChallenges.get(params.nonce);
      if (!challenge) {
        return { valid: false, error: "Challenge nonce not found" };
      }
      if (challenge.consumed) {
        return { valid: false, error: "Challenge nonce has already been consumed (replay prevention)" };
      }
      if (new Date() > new Date(challenge.expiresAt)) {
        return { valid: false, error: "Challenge nonce has expired" };
      }
      if (challenge.walletAddress.toLowerCase() !== params.walletAddress.toLowerCase()) {
        return { valid: false, error: "Challenge nonce wallet mismatch" };
      }
      if (challenge.action !== params.action) {
        return { valid: false, error: "Challenge nonce action mismatch" };
      }
      if (params.domain && challenge.domain && challenge.domain !== params.domain) {
        return { valid: false, error: "Challenge nonce domain mismatch" };
      }
      challenge.consumed = true;
      challenge.consumedAt = new Date();
      this.memAuthChallenges.set(params.nonce, challenge);
      return { valid: true };
    }

    return withDbRetry(async (db) => {
      const [challenge] = await db
        .select()
        .from(authChallenges)
        .where(eq(authChallenges.nonce, params.nonce));

      if (!challenge) {
        return { valid: false, error: "Challenge nonce not found" };
      }

      if (challenge.consumed) {
        return { valid: false, error: "Challenge nonce has already been consumed (replay prevention)" };
      }

      if (new Date() > new Date(challenge.expiresAt)) {
        return { valid: false, error: "Challenge nonce has expired" };
      }

      if (challenge.walletAddress.toLowerCase() !== params.walletAddress.toLowerCase()) {
        return { valid: false, error: "Challenge nonce wallet mismatch" };
      }

      if (challenge.action !== params.action) {
        return { valid: false, error: "Challenge nonce action mismatch" };
      }

      if (params.domain && challenge.domain && challenge.domain !== params.domain) {
        return { valid: false, error: "Challenge nonce domain mismatch" };
      }

      const [consumedRecord] = await db
        .update(authChallenges)
        .set({
          consumed: true,
          consumedAt: new Date(),
        })
        .where(and(eq(authChallenges.nonce, params.nonce), eq(authChallenges.consumed, false)))
        .returning();

      if (!consumedRecord) {
        return { valid: false, error: "Nonce consumption race condition prevented" };
      }

      return { valid: true };
    });
  }
}

export const storage = new DatabaseStorage();
