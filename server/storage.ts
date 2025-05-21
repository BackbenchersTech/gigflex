import { 
  candidates, Candidate, InsertCandidate,
  interests, Interest, InsertInterest
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private candidates: Map<number, Candidate>;
  private interests: Map<number, Interest>;
  private candidateCounter: number;
  private interestCounter: number;

  constructor() {
    this.candidates = new Map();
    this.interests = new Map();
    this.candidateCounter = 1;
    this.interestCounter = 1;

    // Initialize some sample candidates
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

    // Add sample candidates
    sampleCandidates.forEach(candidate => {
      this.createCandidate(candidate);
    });
  }

  // Candidate operations
  async getCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }

  async getCandidateById(id: number): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const id = this.candidateCounter++;
    const newCandidate: Candidate = { ...candidate, id, createdAt: new Date() };
    this.candidates.set(id, newCandidate);
    return newCandidate;
  }

  async updateCandidate(id: number, candidateData: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const existingCandidate = this.candidates.get(id);
    if (!existingCandidate) return undefined;

    const updatedCandidate: Candidate = { ...existingCandidate, ...candidateData };
    this.candidates.set(id, updatedCandidate);
    return updatedCandidate;
  }

  async deleteCandidate(id: number): Promise<boolean> {
    return this.candidates.delete(id);
  }

  async searchCandidates(query: string): Promise<Candidate[]> {
    if (!query) return Array.from(this.candidates.values());
    
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.candidates.values()).filter(candidate => 
      candidate.fullName.toLowerCase().includes(lowercaseQuery) ||
      candidate.title.toLowerCase().includes(lowercaseQuery) ||
      candidate.location.toLowerCase().includes(lowercaseQuery) ||
      candidate.skills.some(skill => skill.toLowerCase().includes(lowercaseQuery)) ||
      candidate.bio.toLowerCase().includes(lowercaseQuery)
    );
  }

  async filterCandidates(
    skills?: string[], 
    experienceYears?: number, 
    availability?: string
  ): Promise<Candidate[]> {
    let filteredCandidates = Array.from(this.candidates.values());

    if (skills && skills.length > 0) {
      filteredCandidates = filteredCandidates.filter(candidate => 
        skills.some(skill => candidate.skills.includes(skill))
      );
    }

    if (experienceYears !== undefined) {
      filteredCandidates = filteredCandidates.filter(candidate => 
        candidate.experienceYears >= experienceYears
      );
    }

    if (availability) {
      filteredCandidates = filteredCandidates.filter(candidate => 
        candidate.availability === availability
      );
    }

    return filteredCandidates;
  }

  // Interest operations
  async getInterests(): Promise<Interest[]> {
    return Array.from(this.interests.values());
  }

  async getInterestById(id: number): Promise<Interest | undefined> {
    return this.interests.get(id);
  }

  async getInterestsByCandidate(candidateId: number): Promise<Interest[]> {
    return Array.from(this.interests.values()).filter(
      interest => interest.candidateId === candidateId
    );
  }

  async createInterest(interest: InsertInterest): Promise<Interest> {
    const id = this.interestCounter++;
    const newInterest: Interest = { ...interest, id, createdAt: new Date() };
    this.interests.set(id, newInterest);
    return newInterest;
  }

  async updateInterestStatus(id: number, status: string): Promise<Interest | undefined> {
    const existingInterest = this.interests.get(id);
    if (!existingInterest) return undefined;

    const updatedInterest: Interest = { ...existingInterest, status };
    this.interests.set(id, updatedInterest);
    return updatedInterest;
  }
}

export const storage = new MemStorage();
