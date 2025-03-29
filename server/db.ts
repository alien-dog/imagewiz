import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// Use DATABASE_URL from environment
const connectionString = process.env.DATABASE_URL as string;
console.log(`Connecting to database at ${connectionString.split('@')[1]}`);

// Create postgres client
const client = postgres(connectionString, { max: 10 });

// Create drizzle database instance
export const db = drizzle(client, { schema });

// Export tables and types
export * from '@shared/schema';