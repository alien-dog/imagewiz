import { users, userProfiles, transactions, type User, type InsertUser, type UserProfile, type Transaction } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Profile operations
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  updateUserProfile(userId: number, profile: Partial<UserProfile>): Promise<UserProfile>;

  // Transaction operations
  getUserTransactions(userId: number): Promise<Transaction[]>;
  createTransaction(userId: number, transaction: Omit<Transaction, "id" | "userId">): Promise<Transaction>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values({
          ...insertUser,
          credits: 3 // Give new users 3 free credits
        })
        .returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    try {
      const [profile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId));
      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return undefined;
    }
  }

  async updateUserProfile(userId: number, profile: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const [existingProfile] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId));

      if (existingProfile) {
        const [updatedProfile] = await db
          .update(userProfiles)
          .set({ ...profile, updatedAt: new Date() })
          .where(eq(userProfiles.userId, userId))
          .returning();
        return updatedProfile;
      } else {
        const [newProfile] = await db
          .insert(userProfiles)
          .values({ ...profile, userId })
          .returning();
        return newProfile;
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    try {
      return await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(transactions.createdAt);
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }

  async createTransaction(
    userId: number,
    transaction: Omit<Transaction, "id" | "userId">
  ): Promise<Transaction> {
    try {
      const [newTransaction] = await db
        .insert(transactions)
        .values({ ...transaction, userId })
        .returning();
      return newTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();