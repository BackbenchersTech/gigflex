import * as schema from '@shared/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_URL } from './config';

if (!DATABASE_URL) {
  throw new Error(
    'DATABASE_URL must be set. Did you forget to provision a database?'
  );
}

let client;
try {
  client = postgres(DATABASE_URL, { prepare: false });
} catch (err) {
  console.log('Error connecting to Postgres:', err);
  throw err;
}

let db: ReturnType<typeof drizzle>;
try {
  db = drizzle(client, { schema });
} catch (err) {
  console.log('Error initializing Drizzle ORM:', err);
  throw err;
}

export { db };
