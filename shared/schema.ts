import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// User Schema
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  firebaseUid: text('firebase_uid').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  picture: text('picture'),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Candidate Schema
export const candidates = pgTable('candidates', {
  id: serial('id').primaryKey(),
  initials: text('initials').notNull(),
  profileImageUrl: text('profile_image_url'),
  fullName: text('full_name').notNull(),
  title: text('title').notNull(),
  location: text('location').notNull(),
  skills: text('skills').array().notNull(),
  experienceYears: integer('experience_years').notNull(),
  bio: text('bio').notNull(),
  education: text('education').notNull(),
  availability: text('availability').notNull(),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  certifications: text('certifications').array(),
  billRate: integer('bill_rate'),
  payRate: integer('pay_rate'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Interest Schema
export const interests = pgTable('interests', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id').notNull(),
  companyName: text('company_name').notNull(),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message'),
  status: text('status').notNull().default('new'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Analytics Schema - Candidate Views
export const candidateViews = pgTable('candidate_views', {
  id: serial('id').primaryKey(),
  candidateId: integer('candidate_id').notNull(),
  viewedAt: timestamp('viewed_at').defaultNow(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
});

// Analytics Schema - Search Activity
export const searchActivity = pgTable('search_activity', {
  id: serial('id').primaryKey(),
  searchQuery: text('search_query').notNull(),
  searchType: text('search_type').notNull(), // 'general', 'skills', 'experience', etc.
  resultsCount: integer('results_count').notNull(),
  searchedAt: timestamp('searched_at').defaultNow(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
});

// Insert Schemas
export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
});

export const insertInterestSchema = createInsertSchema(interests).omit({
  id: true,
  createdAt: true,
});

// Extended schemas for form validation
export const candidateFormSchema = insertCandidateSchema.extend({
  skills: z.union([
    z.string().transform((val) =>
      val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    ),
    z.array(z.string()),
  ]),
  certifications: z.union([
    z
      .string()
      .optional()
      .transform((val) => (val ? val.split(',').map((s) => s.trim()) : [])),
    z.array(z.string()).optional(),
  ]),
  billRate: z.number().optional(),
  payRate: z.number().optional(),
});

export const interestFormSchema = insertInterestSchema.extend({
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
});

// Types
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type CandidateForm = z.infer<typeof candidateFormSchema>;

export type Interest = typeof interests.$inferSelect;
export type InsertInterest = z.infer<typeof insertInterestSchema>;
export type InterestForm = z.infer<typeof interestFormSchema>;

export type User = typeof users.$inferSelect;
