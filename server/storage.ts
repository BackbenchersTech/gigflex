import { 
  candidates, Candidate, InsertCandidate,
  interests, Interest, InsertInterest
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, gte, and, or, inArray, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // Candidate operations
  getCandidates(): Promise<Candidate[]>;
  getCandidateById(id: number): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
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
  updateInterestStatus(id: number, status: string): Promise<Interest | undefined>;
}

// Database implementation
export class DatabaseStorage implements IStorage {
  // Candidate operations
  async getCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates);
  }

  async getCandidateById(id: number): Promise<Candidate | undefined> {
    const results = await db.select().from(candidates).where(eq(candidates.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const newCandidate = {
      ...candidate,
      profileImageUrl: candidate.profileImageUrl || null,
      contactEmail: candidate.contactEmail || null,
      contactPhone: candidate.contactPhone || null,
      certifications: candidate.certifications || null
    };
    
    const [insertedCandidate] = await db.insert(candidates).values(newCandidate).returning();
    return insertedCandidate;
  }

  async updateCandidate(id: number, candidateData: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    // Process the candidate data to handle nulls and optional fields
    const updateData = {
      ...candidateData,
      profileImageUrl: candidateData.profileImageUrl || null,
      contactEmail: candidateData.contactEmail || null,
      contactPhone: candidateData.contactPhone || null,
      certifications: candidateData.certifications || null
    };
    
    const result = await db.update(candidates)
      .set(updateData)
      .where(eq(candidates.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    const result = await db.delete(candidates).where(eq(candidates.id, id)).returning();
    return result.length > 0;
  }

  async searchCandidates(query: string): Promise<Candidate[]> {
    if (!query) return this.getCandidates();
    
    return await db.select().from(candidates).where(
      or(
        ilike(candidates.fullName, `%${query}%`),
        ilike(candidates.title, `%${query}%`),
        ilike(candidates.location, `%${query}%`),
        ilike(candidates.bio, `%${query}%`)
        // Note: Searching in array fields like skills requires more complex logic
        // This is a simplified implementation
      )
    );
  }

  async filterCandidates(
    skills?: string[], 
    experienceYears?: number, 
    availability?: string
  ): Promise<Candidate[]> {
    let conditions = [];
    
    // Add filters based on parameters
    if (skills && skills.length > 0) {
      // For PostgreSQL array filtering, we'll need a more complex approach later
      // For now, let's just fetch all candidates and filter them in memory
      console.log("Filtering for skills:", skills);
    }
    
    if (experienceYears !== undefined) {
      conditions.push(gte(candidates.experienceYears, experienceYears));
    }
    
    if (availability) {
      conditions.push(eq(candidates.availability, availability));
    }
    
    // If no conditions, return all candidates
    if (conditions.length === 0) {
      return this.getCandidates();
    }
    
    // Apply all conditions with AND logic
    return await db.select().from(candidates).where(and(...conditions));
  }

  // Interest operations
  async getInterests(): Promise<Interest[]> {
    return await db.select().from(interests);
  }

  async getInterestById(id: number): Promise<Interest | undefined> {
    const results = await db.select().from(interests).where(eq(interests.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getInterestsByCandidate(candidateId: number): Promise<Interest[]> {
    return await db.select().from(interests).where(eq(interests.candidateId, candidateId));
  }

  async createInterest(interest: InsertInterest): Promise<Interest> {
    const newInterest = {
      ...interest,
      phone: interest.phone || null,
      message: interest.message || null
    };
    
    const [insertedInterest] = await db.insert(interests).values(newInterest).returning();
    return insertedInterest;
  }

  async updateInterestStatus(id: number, status: string): Promise<Interest | undefined> {
    const result = await db.update(interests)
      .set({ status })
      .where(eq(interests.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }
}

// Initialize sample data
async function seedDatabase() {
  const count = await db.select().from(candidates);
  
  // Only seed if the database is empty
  if (count.length === 0) {
    const sampleCandidates: InsertCandidate[] = [
      {
        initials: "JD",
        profileImageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
        fullName: "John Doe",
        title: "Full Stack Developer",
        location: "San Francisco, CA",
        skills: ["JavaScript", "React", "Node.js", "TypeScript"],
        experienceYears: 5,
        bio: "Experienced full stack developer with a passion for building scalable web applications.",
        education: "BS in Computer Science, Stanford University",
        availability: "Immediate",
        contactEmail: "john.doe@example.com",
        contactPhone: "123-456-7890",
        certifications: ["AWS Certified Developer", "MongoDB Certified Developer"],
        isActive: true,
      },
      {
        initials: "AS",
        profileImageUrl: "https://randomuser.me/api/portraits/women/1.jpg",
        fullName: "Alice Smith",
        title: "UX/UI Designer",
        location: "New York, NY",
        skills: ["UX Design", "UI Design", "Figma", "Adobe XD"],
        experienceYears: 4,
        bio: "Creative designer focused on creating intuitive user experiences.",
        education: "BFA in Graphic Design, RISD",
        availability: "2 weeks",
        contactEmail: "alice.smith@example.com",
        contactPhone: "234-567-8901",
        certifications: ["Google UX Design Certificate"],
        isActive: true,
      },
      {
        initials: "MJ",
        profileImageUrl: "https://randomuser.me/api/portraits/men/2.jpg",
        fullName: "Michael Johnson",
        title: "DevOps Engineer",
        location: "Austin, TX",
        skills: ["Docker", "Kubernetes", "AWS", "CI/CD"],
        experienceYears: 7,
        bio: "DevOps engineer with experience automating infrastructure and deployment pipelines.",
        education: "MS in Computer Engineering, Georgia Tech",
        availability: "1 month",
        contactEmail: "michael.johnson@example.com",
        contactPhone: "345-678-9012",
        certifications: ["AWS Certified DevOps Engineer", "Certified Kubernetes Administrator"],
        isActive: true,
      },
      {
        initials: "EW",
        profileImageUrl: "https://randomuser.me/api/portraits/women/2.jpg",
        fullName: "Emma Williams",
        title: "Data Scientist",
        location: "Seattle, WA",
        skills: ["Python", "Machine Learning", "TensorFlow", "Data Analysis"],
        experienceYears: 3,
        bio: "Data scientist specializing in machine learning models and data analytics.",
        education: "PhD in Statistics, University of Washington",
        availability: "Immediate",
        contactEmail: "emma.williams@example.com",
        contactPhone: "456-789-0123",
        certifications: ["TensorFlow Developer Certificate", "IBM Data Science Professional Certificate"],
        isActive: true,
      },
      {
        initials: "RB",
        profileImageUrl: "https://randomuser.me/api/portraits/men/3.jpg",
        fullName: "Robert Brown",
        title: "Frontend Developer",
        location: "Chicago, IL",
        skills: ["HTML", "CSS", "JavaScript", "React", "Vue.js"],
        experienceYears: 2,
        bio: "Frontend developer passionate about creating responsive and accessible web interfaces.",
        education: "BS in Computer Science, University of Illinois",
        availability: "2 weeks",
        contactEmail: "robert.brown@example.com",
        contactPhone: "567-890-1234",
        certifications: ["Frontend Web Developer Nanodegree"],
        isActive: true,
      },
      {
        initials: "SJ",
        profileImageUrl: "https://randomuser.me/api/portraits/women/3.jpg",
        fullName: "Sophia Jones",
        title: "Backend Developer",
        location: "Denver, CO",
        skills: ["Java", "Spring Boot", "Hibernate", "PostgreSQL"],
        experienceYears: 6,
        bio: "Backend developer with expertise in Java-based technologies and database management.",
        education: "MS in Software Engineering, University of Colorado",
        availability: "3 weeks",
        contactEmail: "sophia.jones@example.com",
        contactPhone: "678-901-2345",
        certifications: ["Oracle Certified Professional, Java SE 11 Developer"],
        isActive: true,
      },
      {
        initials: "DM",
        profileImageUrl: "https://randomuser.me/api/portraits/men/4.jpg",
        fullName: "David Miller",
        title: "Mobile App Developer",
        location: "Los Angeles, CA",
        skills: ["React Native", "Swift", "Kotlin", "Firebase"],
        experienceYears: 4,
        bio: "Mobile developer with experience building cross-platform and native applications.",
        education: "BS in Mobile Application Development, UCLA",
        availability: "Immediate",
        contactEmail: "david.miller@example.com",
        contactPhone: "789-012-3456",
        certifications: ["Google Associate Android Developer"],
        isActive: true,
      },
      {
        initials: "OT",
        profileImageUrl: "https://randomuser.me/api/portraits/women/4.jpg",
        fullName: "Olivia Taylor",
        title: "Product Manager",
        location: "Boston, MA",
        skills: ["Product Strategy", "Agile", "User Research", "Roadmapping"],
        experienceYears: 8,
        bio: "Product manager with a track record of delivering successful digital products.",
        education: "MBA, Harvard Business School",
        availability: "1 month",
        contactEmail: "olivia.taylor@example.com",
        contactPhone: "890-123-4567",
        certifications: ["Certified Scrum Product Owner", "Product Management Certificate"],
        isActive: true,
      }
    ];

    // Create a new storage instance to add sample data
    const storage = new DatabaseStorage();
    
    // Add sample candidates sequentially
    for (const candidate of sampleCandidates) {
      await storage.createCandidate(candidate);
    }
    
    console.log("Database seeded with sample data");
  }
}

// Initialize the storage
export const storage = new DatabaseStorage();

// Seed the database with initial data (this runs when the server starts)
seedDatabase().catch(err => {
  console.error("Error seeding database:", err);
});
