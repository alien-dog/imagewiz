import { 
  User, 
  InsertUser, 
  RechargeHistory, 
  InsertRechargeHistory, 
  MattingHistory, 
  InsertMattingHistory,
  users,
  rechargeHistory,
  mattingHistory
} from "./shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { z } from "zod";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserCreditBalance(userId: number, newBalance: number): Promise<User>;

  // Recharge operations
  createRechargeRecord(recharge: InsertRechargeHistory): Promise<RechargeHistory>;
  getUserRechargeHistory(userId: number): Promise<RechargeHistory[]>;

  // Matting operations
  createMattingRecord(matting: InsertMattingHistory): Promise<MattingHistory>;
  getUserMattingHistory(userId: number): Promise<MattingHistory[]>;
  getMattingRecord(id: number): Promise<MattingHistory | undefined>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

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

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserCreditBalance(userId: number, newBalance: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ creditBalance: newBalance })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createRechargeRecord(recharge: InsertRechargeHistory): Promise<RechargeHistory> {
    const [record] = await db.insert(rechargeHistory).values(recharge).returning();
    return record;
  }

  async getUserRechargeHistory(userId: number): Promise<RechargeHistory[]> {
    return await db
      .select()
      .from(rechargeHistory)
      .where(eq(rechargeHistory.userId, userId))
      .orderBy(rechargeHistory.createdAt);
  }

  async createMattingRecord(matting: InsertMattingHistory): Promise<MattingHistory> {
    const [record] = await db.insert(mattingHistory).values(matting).returning();
    return record;
  }

  async getUserMattingHistory(userId: number): Promise<MattingHistory[]> {
    return await db
      .select()
      .from(mattingHistory)
      .where(eq(mattingHistory.userId, userId))
      .orderBy(mattingHistory.createdAt);
  }

  async getMattingRecord(id: number): Promise<MattingHistory | undefined> {
    const [record] = await db
      .select()
      .from(mattingHistory)
      .where(eq(mattingHistory.id, id));
    return record;
  }
}

export const storage = new DatabaseStorage();