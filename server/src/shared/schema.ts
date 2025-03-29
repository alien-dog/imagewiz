import { pgTable, serial, text, timestamp, integer, boolean, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  creditBalance: integer("credit_balance").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recharge History table
export const rechargeHistory = pgTable("recharge_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  creditGained: integer("credit_gained").notNull(),
  paymentStatus: text("payment_status").notNull(),
  paymentMethod: text("payment_method").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Matting History table (image processing records)
export const mattingHistory = pgTable("matting_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  originalImageUrl: text("original_image_url").notNull(),
  processedImageUrl: text("processed_image_url").notNull(),
  creditSpent: integer("credit_spent").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  recharges: many(rechargeHistory),
  mattings: many(mattingHistory),
}));

export const rechargeHistoryRelations = relations(rechargeHistory, ({ one }) => ({
  user: one(users, {
    fields: [rechargeHistory.userId],
    references: [users.id],
  }),
}));

export const mattingHistoryRelations = relations(mattingHistory, ({ one }) => ({
  user: one(users, {
    fields: [mattingHistory.userId],
    references: [users.id],
  }),
}));

// Schemas for insertions
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertRechargeSchema = createInsertSchema(rechargeHistory).pick({
  userId: true,
  amount: true,
  creditGained: true,
  paymentStatus: true,
  paymentMethod: true,
  stripePaymentId: true,
});

export const insertMattingSchema = createInsertSchema(mattingHistory).pick({
  userId: true,
  originalImageUrl: true,
  processedImageUrl: true,
  creditSpent: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type RechargeHistory = typeof rechargeHistory.$inferSelect;
export type InsertRechargeHistory = z.infer<typeof insertRechargeSchema>;

export type MattingHistory = typeof mattingHistory.$inferSelect;
export type InsertMattingHistory = z.infer<typeof insertMattingSchema>;