// @ts-nocheck
import {
  type User, type InsertUser,
  type Subscriber, type InsertSubscriber,
  type ContactMessage, type InsertContactMessage,
  users, subscribers, contactMessages
} from "@shared/schema";
import { getDb } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deductCredits(id: string, amount: number): Promise<User | undefined>;

  createSubscriber(data: InsertSubscriber): Promise<Subscriber>;
  getSubscriberByEmail(email: string): Promise<Subscriber | undefined>;
  getAllSubscribers(): Promise<Subscriber[]>;

  createContactMessage(data: InsertContactMessage): Promise<ContactMessage>;
  getAllContactMessages(): Promise<ContactMessage[]>;
  markMessageRead(id: number): Promise<ContactMessage | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await getDb().select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await getDb().select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await getDb().select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await getDb().insert(users).values(insertUser as any).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await getDb().update(users).set(data as any).where(eq(users.id, id)).returning();
    return user;
  }

  async deductCredits(id: string, amount: number): Promise<User | undefined> {
    const [user] = await getDb()
      .update(users)
      .set({
        credits: sql`${users.credits} - ${amount}`
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createSubscriber(data: InsertSubscriber): Promise<Subscriber> {
    const [subscriber] = await getDb().insert(subscribers).values(data).returning();
    return subscriber;
  }

  async getSubscriberByEmail(email: string): Promise<Subscriber | undefined> {
    const [subscriber] = await getDb().select().from(subscribers).where(eq(subscribers.email, email));
    return subscriber;
  }

  async getAllSubscribers(): Promise<Subscriber[]> {
    return await getDb().select().from(subscribers);
  }

  async createContactMessage(data: InsertContactMessage): Promise<ContactMessage> {
    const [message] = await getDb().insert(contactMessages).values(data).returning();
    return message;
  }

  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await getDb().select().from(contactMessages);
  }

  async markMessageRead(id: number): Promise<ContactMessage | undefined> {
    const [message] = await getDb()
      .update(contactMessages)
      .set({ read: true })
      .where(eq(contactMessages.id, id))
      .returning();
    return message;
  }
}

export const storage = new DatabaseStorage();

