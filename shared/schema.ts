import { mysqlTable, text, int, boolean, json, timestamp, primaryKey, varchar } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  credits: int("credits").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  fullName: varchar("full_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  avatarUrl: varchar("avatar_url", { length: 255 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const transactions = mysqlTable("transactions", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'credit_purchase', 'credit_usage'
  amount: int("amount").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: json("metadata")
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  transactions: many(transactions)
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  })
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  })
}));

export const images = mysqlTable("images", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  originalUrl: varchar("original_url", { length: 255 }).notNull(),
  processedUrl: varchar("processed_url", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default('pending'),
  metadata: json("metadata")
});

// Schemas for inserting data
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

export const insertProfileSchema = createInsertSchema(userProfiles).pick({
  fullName: true,
  email: true,
  avatarUrl: true
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  type: true,
  amount: true,
  description: true,
  metadata: true
});

export const insertImageSchema = createInsertSchema(images).pick({
  originalUrl: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Image = typeof images.$inferSelect;