import { connect } from '@planetscale/database';
import { drizzle } from 'drizzle-orm/planetscale-serverless';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure MySQL connection
const connection = connect({
  url: process.env.DATABASE_URL
});

// Create Drizzle database instance
export const db = drizzle(connection, { schema });