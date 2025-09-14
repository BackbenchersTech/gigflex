import * as schema from '@shared/schema';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { DATABASE_URL } from './config';

if (!DATABASE_URL) {
  throw new Error(
    'DATABASE_URL must be set. Did you forget to provision a database?'
  );
}

const client = postgres(DATABASE_URL);
export const db = drizzle({ client, schema });
