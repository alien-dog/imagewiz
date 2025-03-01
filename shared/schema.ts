import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  credits: integer("credits").notNull().default(0)
});

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  originalUrl: text("original_url").notNull(),
  processedUrl: text("processed_url"),
  status: text("status").notNull().default("pending"),
  metadata: jsonb("metadata")
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

export const insertImageSchema = createInsertSchema(images).pick({
  originalUrl: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Image = typeof images.$inferSelect;
