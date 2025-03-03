import { users, userProfiles, type User, type InsertUser, type UserProfile } from "./shared/schema.js";
import { db } from "./db.js";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db.js";
import { type Image, images } from "./shared/schema.js"; 

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

  // Image operations
  getUserImages(userId: number): Promise<Image[]>;
  getImage(id: number): Promise<Image | undefined>;
  createImage(image: Omit<Image, "id">): Promise<Image>;
  deleteImage(id: number): Promise<void>;

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
        .values(insertUser)
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
          .set(profile)
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

  async getUserImages(userId: number): Promise<Image[]> {
    try {
      return await db
        .select()
        .from(images)
        .where(eq(images.userId, userId))
        .orderBy(desc(images.id));
    } catch (error) {
      console.error('Error getting user images:', error);
      return [];
    }
  }

  async getImage(id: number): Promise<Image | undefined> {
    try {
      const [image] = await db
        .select()
        .from(images)
        .where(eq(images.id, id));
      return image;
    } catch (error) {
      console.error('Error getting image:', error);
      return undefined;
    }
  }

  async createImage(image: Omit<Image, "id">): Promise<Image> {
    try {
      const [newImage] = await db
        .insert(images)
        .values(image)
        .returning();
      return newImage;
    } catch (error) {
      console.error('Error creating image:', error);
      throw error;
    }
  }

  async deleteImage(id: number): Promise<void> {
    try {
      await db
        .delete(images)
        .where(eq(images.id, id));
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();