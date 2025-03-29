import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  creditBalance: integer("credit_balance").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recharge history table
export const rechargeHistory = pgTable("recharge_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  amount: text("amount").notNull(),
  creditGained: integer("credit_gained").notNull(),
  paymentStatus: text("payment_status").notNull(),
  paymentMethod: text("payment_method").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Matting history table
export const mattingHistory = pgTable("matting_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  originalImageUrl: text("original_image_url").notNull(),
  processedImageUrl: text("processed_image_url").notNull(),
  creditSpent: integer("credit_spent").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define the insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertRechargeHistorySchema = createInsertSchema(rechargeHistory).omit({ id: true, createdAt: true });
export const insertMattingHistorySchema = createInsertSchema(mattingHistory).omit({ id: true, createdAt: true });

// Define the types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RechargeHistory = typeof rechargeHistory.$inferSelect;
export type InsertRechargeHistory = z.infer<typeof insertRechargeHistorySchema>;
export type MattingHistory = typeof mattingHistory.$inferSelect;
export type InsertMattingHistory = z.infer<typeof insertMattingHistorySchema>;