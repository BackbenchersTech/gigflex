import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { interestFormSchema, candidateFormSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET all candidates
  app.get("/api/candidates", async (req, res) => {
    try {
      const candidates = await storage.getCandidates();
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  // GET single candidate by ID
  app.get("/api/candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }

      const candidate = await storage.getCandidateById(id);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidate" });
    }
  });

  // POST create new candidate
  app.post("/api/candidates", async (req, res) => {
    try {
      const candidateData = candidateFormSchema.parse(req.body);
      const newCandidate = await storage.createCandidate(candidateData);
      res.status(201).json(newCandidate);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid candidate data", 
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create candidate" });
    }
  });

  // PUT update candidate
  app.put("/api/candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }

      // Get the existing candidate to ensure we have the right data
      const existingCandidate = await storage.getCandidateById(id);
      if (!existingCandidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Process the form data, handling skills and certifications specially
      let skills = req.body.skills;
      if (typeof skills === 'string') {
        skills = skills.split(',').map(s => s.trim()).filter(Boolean);
        if (skills.length === 0) skills = ["None"];
      }

      let certifications = req.body.certifications;
      if (certifications === undefined || certifications === "") {
        certifications = [];
      } else if (typeof certifications === 'string') {
        certifications = certifications.split(',').map(s => s.trim()).filter(Boolean);
      }

      // Create the update data
      const candidateData = {
        initials: req.body.initials,
        fullName: req.body.fullName,
        title: req.body.title,
        location: req.body.location,
        skills: skills,
        experienceYears: parseInt(req.body.experienceYears),
        bio: req.body.bio,
        education: req.body.education,
        availability: req.body.availability,
        profileImageUrl: req.body.profileImageUrl || null,
        contactEmail: req.body.contactEmail || null,
        contactPhone: req.body.contactPhone || null,
        certifications: certifications,
        isActive: req.body.isActive === true || req.body.isActive === "true"
      };
      
      console.log("Processed candidate data:", JSON.stringify(candidateData));
      
      const updatedCandidate = await storage.updateCandidate(id, candidateData);
      res.json(updatedCandidate);
    } catch (error) {
      console.error("Update candidate error:", error);
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      
      if (error instanceof ZodError) {
        console.error("Zod validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ 
          message: "Invalid candidate data", 
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to update candidate" });
    }
  });

  // DELETE candidate
  app.delete("/api/candidates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }

      const success = await storage.deleteCandidate(id);
      if (!success) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete candidate" });
    }
  });

  // GET search candidates
  app.get("/api/candidates/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const candidates = await storage.searchCandidates(query);
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ message: "Failed to search candidates" });
    }
  });

  // GET filter candidates
  app.get("/api/candidates/filter", async (req, res) => {
    try {
      const skills = req.query.skills ? (req.query.skills as string).split(",") : undefined;
      const experienceYears = req.query.experience ? parseInt(req.query.experience as string) : undefined;
      const availability = req.query.availability as string | undefined;

      const candidates = await storage.filterCandidates(skills, experienceYears, availability);
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter candidates" });
    }
  });

  // POST create interest
  app.post("/api/interests", async (req, res) => {
    try {
      const interestData = interestFormSchema.parse(req.body);
      const newInterest = await storage.createInterest(interestData);
      res.status(201).json(newInterest);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid interest data", 
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to submit interest" });
    }
  });

  // GET all interests
  app.get("/api/interests", async (req, res) => {
    try {
      const interests = await storage.getInterests();
      res.json(interests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interests" });
    }
  });

  // GET interests by candidate
  app.get("/api/candidates/:id/interests", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }

      const interests = await storage.getInterestsByCandidate(id);
      res.json(interests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interests" });
    }
  });

  // PUT update interest status
  app.put("/api/interests/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid interest ID" });
      }

      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updatedInterest = await storage.updateInterestStatus(id, status);
      if (!updatedInterest) {
        return res.status(404).json({ message: "Interest not found" });
      }
      res.json(updatedInterest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update interest status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
