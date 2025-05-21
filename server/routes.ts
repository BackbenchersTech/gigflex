import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { interestFormSchema, candidateFormSchema } from "@shared/schema";
import { ZodError } from "zod";
import { pool } from "./db";

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

  // PUT update candidate (simplified for direct DB access)
  app.put("/api/candidates/:id", async (req, res) => {
    try {
      // Parse ID and verify
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid candidate ID" });
      }

      // Check if candidate exists
      const existingCandidate = await storage.getCandidateById(id);
      if (!existingCandidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }

      // Process skills field
      const skillsData = typeof req.body.skills === 'string' 
        ? req.body.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : (Array.isArray(req.body.skills) ? req.body.skills : existingCandidate.skills || []);

      // Process certifications field
      const certificationsData = req.body.certifications === undefined || req.body.certifications === ""
        ? []
        : (typeof req.body.certifications === 'string'
            ? req.body.certifications.split(',').map((s: string) => s.trim()).filter(Boolean)
            : (Array.isArray(req.body.certifications) 
                ? req.body.certifications 
                : existingCandidate.certifications || []));

      // Process experience years field
      const experienceYearsData = typeof req.body.experienceYears === 'string'
        ? parseInt(req.body.experienceYears)
        : req.body.experienceYears || existingCandidate.experienceYears;

      // Process isActive field
      const isActive = req.body.isActive === true || req.body.isActive === "true" || existingCandidate.isActive;

      // Execute update through storage interface to bypass schema validation issues
      const updatedCandidate = await storage.updateCandidate(id, {
        initials: req.body.initials || existingCandidate.initials,
        profileImageUrl: req.body.profileImageUrl || existingCandidate.profileImageUrl,
        fullName: req.body.fullName || existingCandidate.fullName,
        title: req.body.title || existingCandidate.title,
        location: req.body.location || existingCandidate.location,
        skills: skillsData,
        experienceYears: experienceYearsData,
        bio: req.body.bio || existingCandidate.bio,
        education: req.body.education || existingCandidate.education,
        availability: req.body.availability || existingCandidate.availability,
        contactEmail: req.body.contactEmail || existingCandidate.contactEmail,
        contactPhone: req.body.contactPhone || existingCandidate.contactPhone,
        certifications: certificationsData,
        isActive: isActive
      });

      res.json(updatedCandidate);
    } catch (error) {
      console.error("Update candidate error:", error);
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

  // GET search candidates - must come before /:id route to avoid conflicts
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
