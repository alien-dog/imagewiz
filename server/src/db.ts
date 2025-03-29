import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./shared/schema";

// PostgreSQL connection
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Drizzle instance with our schema
export const db = drizzle(pool, { schema });