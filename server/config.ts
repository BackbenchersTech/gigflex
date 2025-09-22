import dotenv from 'dotenv';
dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL || '';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
export const FIREBASE_SERVICE_ACCOUNT_PROJECT_ID =
  process.env.FIREBASE_SERVICE_ACCOUNT_PROJECT_ID || '';
export const FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL =
  process.env.FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL || '';
export const FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY =
  process.env.FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n') || '';
