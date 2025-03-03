import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  try {
    // Check if admin already exists
    const existingAdmin = await db.select().from(users).where(eq(users.username, "admin"));

    if (existingAdmin.length > 0) {
      // Update admin password
      const adminPassword = await hashPassword("admin123");
      await db.update(users)
        .set({ password: adminPassword })
        .where(eq(users.username, "admin"));
      console.log("Admin password updated successfully");
    } else {
      // Create new admin user
      const adminPassword = await hashPassword("admin123");
      await db.insert(users).values({
        username: "admin",
        password: adminPassword,
        credits: 1000 // Give admin plenty of credits
      });
      console.log("Admin user created successfully");
    }
  } catch (error) {
    console.error("Error managing admin user:", error);
  }
}

createAdminUser();