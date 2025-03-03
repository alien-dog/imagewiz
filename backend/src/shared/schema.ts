import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  credits: integer("credits").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fullName: text("full_name"),
  email: text("email"),
  avatarUrl: text("avatar_url"),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const images = pgTable("images", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  originalUrl: text("original_url").notNull(),
  processedUrl: text("processed_url"),
  status: text("status").notNull().default("pending"),
  metadata: jsonb("metadata")
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  })
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  })
}));


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

export const insertImageSchema = createInsertSchema(images).pick({
  originalUrl: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type Image = typeof images.$inferSelect;