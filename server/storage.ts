import {
  type User, type InsertUser,
  type Subscriber, type InsertSubscriber,
  type ContactMessage, type InsertContactMessage,
  type VipVerification, type InsertVipVerification,
  users, subscribers, contactMessages, vipVerifications
} from "@shared/schema";
import { withDbRetry } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deductCredits(id: string, amount: number): Promise<User | undefined>;

  createVipVerification(data: InsertVipVerification): Promise<VipVerification>;
  getLatestVipVerification(walletAddress: string): Promise<VipVerification | undefined>;
  updateUserVipByWallet(walletAddress: string, vipTier: string, dempBalance: string): Promise<User | undefined>;

  createSubscriber(data: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getAllSubscribers(): Promise<Subscriber[]>;

  createContactMessage(data: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  markMessageRead(id: number): Promise<ContactMessage | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    return withDbRetry(async (db) => {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return withDbRetry(async (db) => {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    });
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return withDbRetry(async (db) => {
      const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
      return user;
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return withDbRetry(async (db) => {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    return withDbRetry(async (db) => {
      const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
      return user;
    });
  }

  async deductCredits(id: string, amount: number): Promise<User | undefined> {
    return withDbRetry(async (db) => {
      const [user] = await db
        .update(users)
        .set({
          credits: sql`${users.credits} - ${amount}`
        })
        .where(eq(users.id, id))
        .returning();
      return user;
    });
  }

  async createVipVerification(data: InsertVipVerification): Promise<VipVerification> {
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
    return withDbRetry(async (db) => {
      const [subscriber] = await db.insert(subscribers).values(data).returning();
      return subscriber;
    });
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    return withDbRetry(async (db) => {
      const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.email, email));
      return subscriber;
    });
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return withDbRetry(async (db) => {
      return await db.select().from(subscribers);
    });
  }

  async createContactMessage(data: InsertContactMessage): Promise<ContactMessage> {
    return withDbRetry(async (db) => {
      const [message] = await db.insert(contactMessages).values(data).returning();
      return message;
    });
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return withDbRetry(async (db) => {
      return await db.select().from(contactMessages);
    });
  }

  async markMessageRead(id: number): Promise<ContactMessage | undefined> {
    return withDbRetry(async (db) => {
      const [message] = await db
        .update(contactMessages)
        .set({ read: true })
        .where(eq(contactMessages.id, id))
        .returning();
      return message;
    });
  }
}

export const storage = new DatabaseStorage();
