import { users, type User, type InsertUser, rechargeHistory, type RechargeHistory, 
  type InsertRechargeHistory, mattingHistory, type MattingHistory, type InsertMattingHistory,
  creditPackages, type CreditPackage, type InsertCreditPackage } from './db';
import { db } from './db';
import { eq, desc } from 'drizzle-orm';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { Pool } from 'pg';

// PostgreSQL session store
const PostgresSessionStore = connectPg(session);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUserCredits(userId: number, credits: number): Promise<User>;
  
  // Recharge history methods
  createRechargeHistory(insertHistory: InsertRechargeHistory): Promise<RechargeHistory>;
  getUserRechargeHistory(userId: number): Promise<RechargeHistory[]>;
  updateRechargeStatus(id: number, status: string, stripePaymentId?: string): Promise<RechargeHistory>;
  
  // Matting history methods
  createMattingHistory(insertHistory: InsertMattingHistory): Promise<MattingHistory>;
  getUserMattingHistory(userId: number): Promise<MattingHistory[]>;
  getMattingDetail(id: number): Promise<MattingHistory | undefined>;
  
  // Credit package methods
  getActivePackages(): Promise<CreditPackage[]>;
  getPackage(id: number): Promise<CreditPackage | undefined>;
  createPackage(insertPackage: InsertCreditPackage): Promise<CreditPackage>;
  
  // Session store
  sessionStore: session.SessionStore;
}

// Database implementation of the storage interface
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserCredits(userId: number, credits: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        creditBalance: credits 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Recharge history methods
  async createRechargeHistory(insertHistory: InsertRechargeHistory): Promise<RechargeHistory> {
    const [history] = await db.insert(rechargeHistory).values(insertHistory).returning();
    return history;
  }

  async getUserRechargeHistory(userId: number): Promise<RechargeHistory[]> {
    return db
      .select()
      .from(rechargeHistory)
      .where(eq(rechargeHistory.userId, userId))
      .orderBy(desc(rechargeHistory.createdAt));
  }

  async updateRechargeStatus(id: number, status: string, stripePaymentId?: string): Promise<RechargeHistory> {
    const updateData: any = { paymentStatus: status };
    if (stripePaymentId) {
      updateData.stripePaymentId = stripePaymentId;
    }

    const [history] = await db
      .update(rechargeHistory)
      .set(updateData)
      .where(eq(rechargeHistory.id, id))
      .returning();
    return history;
  }

  // Matting history methods
  async createMattingHistory(insertHistory: InsertMattingHistory): Promise<MattingHistory> {
    const [history] = await db.insert(mattingHistory).values(insertHistory).returning();
    return history;
  }

  async getUserMattingHistory(userId: number): Promise<MattingHistory[]> {
    return db
      .select()
      .from(mattingHistory)
      .where(eq(mattingHistory.userId, userId))
      .orderBy(desc(mattingHistory.createdAt));
  }

  async getMattingDetail(id: number): Promise<MattingHistory | undefined> {
    const [history] = await db
      .select()
      .from(mattingHistory)
      .where(eq(mattingHistory.id, id));
    return history;
  }

  // Credit package methods
  async getActivePackages(): Promise<CreditPackage[]> {
    return db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.active, true));
  }

  async getPackage(id: number): Promise<CreditPackage | undefined> {
    const [pkg] = await db
      .select()
      .from(creditPackages)
      .where(eq(creditPackages.id, id));
    return pkg;
  }

  async createPackage(insertPackage: InsertCreditPackage): Promise<CreditPackage> {
    const [pkg] = await db.insert(creditPackages).values(insertPackage).returning();
    return pkg;
  }
}

// Export a singleton instance
export const storage = new DatabaseStorage();