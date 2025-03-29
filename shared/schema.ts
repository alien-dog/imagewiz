import { pgTable, serial, text, timestamp, integer, boolean, numeric, relations, pgEnum } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  creditBalance: integer('credit_balance').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  isAdmin: boolean('is_admin').default(false),
});

// Define users relation
export const usersRelations = relations(users, ({ many }) => ({
  rechargeHistory: many(rechargeHistory),
  mattingHistory: many(mattingHistory),
}));

// Payment status enum for better type safety
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed']);

// Recharge history table
export const rechargeHistory = pgTable('recharge_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  creditGained: integer('credit_gained').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').notNull(),
  paymentMethod: text('payment_method').notNull(),
  stripePaymentId: text('stripe_payment_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define recharge history relation
export const rechargeHistoryRelations = relations(rechargeHistory, ({ one }) => ({
  user: one(users, {
    fields: [rechargeHistory.userId],
    references: [users.id],
  }),
}));

// Matting history table (image processing history)
export const mattingHistory = pgTable('matting_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  originalImageUrl: text('original_image_url').notNull(),
  processedImageUrl: text('processed_image_url').notNull(),
  creditSpent: integer('credit_spent').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define matting history relation
export const mattingHistoryRelations = relations(mattingHistory, ({ one }) => ({
  user: one(users, {
    fields: [mattingHistory.userId],
    references: [users.id],
  }),
}));

// Credit packages table
export const creditPackages = pgTable('credit_packages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  credits: integer('credits').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  active: boolean('active').default(true),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertRechargeHistorySchema = createInsertSchema(rechargeHistory).omit({ id: true });
export const insertMattingHistorySchema = createInsertSchema(mattingHistory).omit({ id: true });
export const insertCreditPackageSchema = createInsertSchema(creditPackages).omit({ id: true });

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type RechargeHistory = typeof rechargeHistory.$inferSelect;
export type InsertRechargeHistory = z.infer<typeof insertRechargeHistorySchema>;

export type MattingHistory = typeof mattingHistory.$inferSelect;
export type InsertMattingHistory = z.infer<typeof insertMattingHistorySchema>;

export type CreditPackage = typeof creditPackages.$inferSelect;
export type InsertCreditPackage = z.infer<typeof insertCreditPackageSchema>;