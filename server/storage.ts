import {
  Candidate,
  InsertCandidate,
  InsertInterest,
  Interest,
  User,
  candidateViews,
  candidates,
  interests,
  searchActivity,
  users,
} from '@shared/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { db } from './db';
import { admin as fireAdmin } from './firebase';

// Interface for storage operations
export interface IStorage {
  // Candidate operations
  getCandidates(): Promise<Candidate[]>;
  getCandidateById(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(
    id: number,
    candidate: Partial<InsertCandidate>
  ): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<boolean>;
  searchCandidates(query: string): Promise<Candidate[]>;
  filterCandidates(
    skills?: string[],
    experienceYears?: number,
    availability?: string
  ): Promise<Candidate[]>;

  // Interest operations
  getInterests(): Promise<Interest[]>;
  getInterestById(id: number): Promise<Interest | undefined>;
  getInterestsByCandidate(candidateId: number): Promise<Interest[]>;
  createInterest(interest: InsertInterest): Promise<Interest>;
  updateInterestStatus(
    id: number,
    status: string
  ): Promise<Interest | undefined>;

  // Analytics operations
  trackCandidateView(
    candidateId: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void>;
  trackSearch(
    query: string,
    searchType: string,
    resultsCount: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void>;
  getCandidateViewStats(): Promise<any[]>;
  getSearchStats(): Promise<any[]>;
  getTopViewedCandidates(limit?: number): Promise<any[]>;
  getRecentSearches(limit?: number): Promise<any[]>;
  getTotalSearchCount(): Promise<number>;
  getTotalViewCount(): Promise<number>;

  // User operations
  syncUser(firebaseUid: string): Promise<User>;
}

// Database implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async syncUser(idToken: string): Promise<User> {
    try {
      const {
        user_id: firebaseUid,
        email,
        picture,
        name,
      } = await fireAdmin.auth().verifyIdToken(idToken);

      const newUser = {
        firebaseUid,
        email: email || '',
        picture: picture || null,
        name: name || '',
      };

      const [insertedUser] = await db
        .insert(users)
        .values(newUser)
        .onConflictDoUpdate({
          target: users.firebaseUid,
          set: {
            email: newUser.email,
            picture: newUser.picture,
            name: newUser.name,
          },
        })
        .returning();

      return insertedUser;
    } catch (error) {
      console.error('Error verifying Firebase UID:', error);
      throw new Error('Invalid Firebase UID');
    }
  }

  // Candidate operations
  async getCandidates(): Promise<Candidate[]> {
    console.log('Fetching all candidates from the database');
    return await db.select().from(candidates);
  }

  async getCandidateById(id: number): Promise<Candidate | undefined> {
    const results = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const newCandidate = {
      ...candidate,
      profileImageUrl: candidate.profileImageUrl || null,
      contactEmail: candidate.contactEmail || null,
      contactPhone: candidate.contactPhone || null,
      certifications: candidate.certifications || [],
      billRate: candidate.billRate === undefined ? null : candidate.billRate,
      payRate: candidate.payRate === undefined ? null : candidate.payRate,
    };

    const [insertedCandidate] = await db
      .insert(candidates)
      .values(newCandidate)
      .returning();
    return insertedCandidate;
  }

  async updateCandidate(
    id: number,
    candidateData: Partial<InsertCandidate>
  ): Promise<Candidate | undefined> {
    // Process the candidate data to handle nulls and optional fields
    const updateData = {
      ...candidateData,
      profileImageUrl: candidateData.profileImageUrl || null,
      contactEmail: candidateData.contactEmail || null,
      contactPhone: candidateData.contactPhone || null,
      certifications: candidateData.certifications || [],
      billRate:
        candidateData.billRate === undefined ? null : candidateData.billRate,
      payRate:
        candidateData.payRate === undefined ? null : candidateData.payRate,
    };

    const result = await db
      .update(candidates)
      .set(updateData)
      .where(eq(candidates.id, id))
      .returning();

    return result.length > 0 ? result[0] : undefined;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    const result = await db
      .delete(candidates)
      .where(eq(candidates.id, id))
      .returning();
    return result.length > 0;
  }

  async searchCandidates(query: string): Promise<Candidate[]> {
    // If query is empty, return all active candidates
    if (!query || !query.trim()) {
      return db.select().from(candidates).where(eq(candidates.isActive, true));
    }

    // Get all candidates to filter in memory
    const allCandidates = await db
      .select()
      .from(candidates)
      .where(eq(candidates.isActive, true));

    // Extract potential years of experience from query
    const experienceMatch = query.match(
      /(\d+)\s*(?:\+)?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)?|\b(?:over|more\s+than)\s+(\d+)\s*(?:years?|yrs?)/i
    );
    const experienceYears = experienceMatch
      ? parseInt(experienceMatch[1] || experienceMatch[2])
      : null;

    // Extract skills from the query (common programming languages and technologies)
    const skills = [
      'javascript',
      'js',
      'typescript',
      'ts',
      'react',
      'angular',
      'vue',
      'node',
      'express',
      'python',
      'django',
      'flask',
      'java',
      'spring',
      'c#',
      '.net',
      'ruby',
      'rails',
      'php',
      'laravel',
      'go',
      'golang',
      'rust',
      'swift',
      'kotlin',
      'flutter',
      'dart',
      'aws',
      'azure',
      'gcp',
      'cloud',
      'devops',
      'docker',
      'kubernetes',
      'k8s',
      'sql',
      'mysql',
      'postgresql',
      'mongodb',
      'nosql',
      'graphql',
      'rest',
      'api',
      'html',
      'css',
      'scss',
      'sass',
      'tailwind',
      'bootstrap',
      'ui',
      'ux',
      'design',
      'mobile',
      'ios',
      'android',
      'react native',
      'lead',
      'senior',
      'junior',
      'mid',
      'fullstack',
      'frontend',
      'backend',
      'data',
      'ai',
      'ml',
      'machine learning',
    ];

    // Pattern for extracting skills
    const skillsPattern = skills
      .map((s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
      .join('|');
    const skillRegex = new RegExp(`\\b(${skillsPattern})\\b`, 'gi');
    const foundSkills = query.match(skillRegex) || [];

    // Normalize skills for comparison
    const lowerCaseSkills = foundSkills.map((s) => s.toLowerCase());
    const normalizedSkills = lowerCaseSkills.filter(
      (skill, index) => lowerCaseSkills.indexOf(skill) === index
    );

    // Extract availability from query
    const availabilityMatch = query.match(
      /\b(immediate|immediately|available\s+now|(\d+)\s*(?:week|wk|day|month|mth)s?)(?:\s+availability)?\b/i
    );
    const availabilityTerm = availabilityMatch
      ? availabilityMatch[0].toLowerCase()
      : null;

    // Filter candidates based on extracted criteria
    return allCandidates.filter((candidate) => {
      // If we have specific extracted criteria, apply those filters
      if (
        normalizedSkills.length > 0 ||
        experienceYears !== null ||
        availabilityTerm !== null
      ) {
        // Match by skills
        const skillsMatch =
          normalizedSkills.length === 0 ||
          normalizedSkills.some((querySkill) =>
            candidate.skills.some((candidateSkill) =>
              candidateSkill.toLowerCase().includes(querySkill)
            )
          );

        // Match by experience years
        const experienceMatch =
          experienceYears === null ||
          candidate.experienceYears >= experienceYears;

        // Match by availability
        const availabilityMatch =
          !availabilityTerm ||
          candidate.availability.toLowerCase().includes(availabilityTerm);

        return skillsMatch && experienceMatch && availabilityMatch;
      } else {
        // Basic text search across all relevant fields
        const searchLower = query.toLowerCase().trim();

        // Check if any of the candidate's skills match the search query
        const skillsMatch = candidate.skills.some((skill) =>
          skill.toLowerCase().includes(searchLower)
        );

        return (
          candidate.fullName.toLowerCase().includes(searchLower) ||
          candidate.title.toLowerCase().includes(searchLower) ||
          candidate.location.toLowerCase().includes(searchLower) ||
          candidate.bio.toLowerCase().includes(searchLower) ||
          candidate.education.toLowerCase().includes(searchLower) ||
          skillsMatch
        );
      }
    });
  }

  async filterCandidates(
    skills?: string[],
    experienceYears?: number,
    availability?: string
  ): Promise<Candidate[]> {
    // Get all candidates
    const allCandidates = await this.getCandidates();

    // If no filters, return all
    if (!skills?.length && experienceYears === undefined && !availability) {
      return allCandidates;
    }

    // Filter in memory (more flexible than SQL for array handling)
    return allCandidates.filter((candidate) => {
      // Filter by skills if provided
      const skillsMatch =
        !skills?.length ||
        skills.some((skill) =>
          candidate.skills.some((candidateSkill) =>
            candidateSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );

      // Filter by experience if provided
      const experienceMatch =
        experienceYears === undefined ||
        candidate.experienceYears >= experienceYears;

      // Filter by availability if provided
      const availabilityMatch =
        !availability ||
        candidate.availability.toLowerCase() === availability.toLowerCase();

      return skillsMatch && experienceMatch && availabilityMatch;
    });
  }

  // Interest operations
  async getInterests(): Promise<(Interest & { candidateName?: string })[]> {
    // Join interests with candidates to get candidate names
    const results = await db
      .select({
        interest: interests,
        candidateName: candidates.fullName,
      })
      .from(interests)
      .leftJoin(candidates, eq(interests.candidateId, candidates.id))
      .orderBy(desc(interests.createdAt));

    // Return the joined results
    // Transform to handle null candidate names properly
    return results.map((row) => {
      const interest = row.interest;
      return {
        ...interest,
        candidateName:
          row.candidateName || `Candidate #${interest.candidateId}`,
      };
    });
  }

  async getInterestById(id: number): Promise<Interest | undefined> {
    const results = await db
      .select()
      .from(interests)
      .where(eq(interests.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getInterestsByCandidate(candidateId: number): Promise<Interest[]> {
    return await db
      .select()
      .from(interests)
      .where(eq(interests.candidateId, candidateId));
  }

  async createInterest(interest: InsertInterest): Promise<Interest> {
    const newInterest = {
      ...interest,
      phone: interest.phone || null,
      message: interest.message || null,
    };

    const [insertedInterest] = await db
      .insert(interests)
      .values(newInterest)
      .returning();
    return insertedInterest;
  }

  async updateInterestStatus(
    id: number,
    status: string
  ): Promise<Interest | undefined> {
    const result = await db
      .update(interests)
      .set({ status })
      .where(eq(interests.id, id))
      .returning();

    return result.length > 0 ? result[0] : undefined;
  }

  // Analytics operations
  async trackCandidateView(
    candidateId: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    await db.insert(candidateViews).values({
      candidateId,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
    });
  }

  async trackSearch(
    query: string,
    searchType: string,
    resultsCount: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    await db.insert(searchActivity).values({
      searchQuery: query,
      searchType,
      resultsCount,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
    });
  }

  async getCandidateViewStats(): Promise<any[]> {
    const result = await db
      .select({
        candidateId: candidateViews.candidateId,
        initials: candidates.initials,
        title: candidates.title,
        viewCount: sql<number>`count(*)`,
        lastViewed: sql<string>`max(${candidateViews.viewedAt})`,
      })
      .from(candidateViews)
      .leftJoin(candidates, eq(candidateViews.candidateId, candidates.id))
      .groupBy(
        candidateViews.candidateId,
        candidates.initials,
        candidates.title
      )
      .orderBy(desc(sql`count(*)`));

    return result;
  }

  async getSearchStats(): Promise<any[]> {
    const result = await db
      .select({
        searchQuery: searchActivity.searchQuery,
        searchCount: sql<number>`count(*)`,
        avgResults: sql<number>`avg(${searchActivity.resultsCount})`,
        lastSearched: sql<string>`max(${searchActivity.searchedAt})`,
      })
      .from(searchActivity)
      .groupBy(searchActivity.searchQuery)
      .orderBy(desc(sql`count(*)`))
      .limit(50);

    return result;
  }

  async getTopViewedCandidates(limit = 10): Promise<any[]> {
    const result = await db
      .select({
        candidateId: candidateViews.candidateId,
        initials: candidates.initials,
        title: candidates.title,
        location: candidates.location,
        viewCount: sql<number>`count(*)`,
      })
      .from(candidateViews)
      .leftJoin(candidates, eq(candidateViews.candidateId, candidates.id))
      .groupBy(
        candidateViews.candidateId,
        candidates.initials,
        candidates.title,
        candidates.location
      )
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return result;
  }

  async getRecentSearches(limit = 20): Promise<any[]> {
    const result = await db
      .select({
        searchQuery: searchActivity.searchQuery,
        searchType: searchActivity.searchType,
        resultsCount: searchActivity.resultsCount,
        searchedAt: searchActivity.searchedAt,
      })
      .from(searchActivity)
      .orderBy(desc(searchActivity.searchedAt))
      .limit(limit);

    return result;
  }

  async getTotalSearchCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(searchActivity);
    return result[0]?.count || 0;
  }

  async getTotalViewCount(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(candidateViews);
    return result[0]?.count || 0;
  }
}

// Initialize storage and export the instance for use in the application
export const storage = new DatabaseStorage();
