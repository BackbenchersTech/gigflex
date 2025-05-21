import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Candidate Schema
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  initials: text("initials").notNull(),
  profileImageUrl: text("profile_image_url"),
  fullName: text("full_name").notNull(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  skills: text("skills").array().notNull(),
  experienceYears: integer("experience_years").notNull(),
  bio: text("bio").notNull(),
  education: text("education").notNull(),
  availability: text("availability").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  certifications: text("certifications").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Interest Schema
export const interests = pgTable("interests", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow(),
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
export const candidateFormSchema = z.object({
  initials: z.string().min(1).max(3),
  profileImageUrl: z.string().optional(),
  fullName: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  skills: z.string().transform(val => {
    const skillArray = val.split(',').map(s => s.trim()).filter(Boolean);
    return skillArray.length > 0 ? skillArray : ["None"]; // Ensure we have at least one value
  }),
  experienceYears: z.number().min(0),
  bio: z.string().min(1),
  education: z.string().min(1),
  availability: z.string().min(1),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional().or(z.literal('')),
  certifications: z.string().optional().transform(val => {
    if (!val) return [];
    const certArray = val.split(',').map(s => s.trim()).filter(Boolean);
    return certArray.length > 0 ? certArray : [];
  }),
  isActive: z.boolean().default(true),
});

export const interestFormSchema = insertInterestSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
});

// Types
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type CandidateForm = z.infer<typeof candidateFormSchema>;

export type Interest = typeof interests.$inferSelect;
export type InsertInterest = z.infer<typeof insertInterestSchema>;
export type InterestForm = z.infer<typeof interestFormSchema>;
