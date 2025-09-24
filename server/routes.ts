import { candidateFormSchema, interestFormSchema } from '@shared/schema';
import type { Express } from 'express';
import { createServer, type Server } from 'http';
import multer from 'multer';
import { ZodError } from 'zod';
import { parseResume } from './openai';
import { storage } from './storage';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype.startsWith('text/')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Routes for natural language search and filtering
  // Important: Order matters - specific routes must come before parametrized routes

  // GET search candidates - natural language search
  app.get('/api/candidates/search', async (req, res) => {
    try {
      const query = (req.query.q as string) || '';
      const candidates = await storage.searchCandidates(query);
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ message: 'Failed to search candidates' });
    }
  });

  // GET filter candidates - for future compatibility, but we're using natural language now
  app.get('/api/candidates/filter', async (req, res) => {
    try {
      const skills = req.query.skills
        ? (req.query.skills as string).split(',')
        : undefined;
      const experienceYears = req.query.experience
        ? parseInt(req.query.experience as string)
        : undefined;
      const availability = req.query.availability as string | undefined;

      const candidates = await storage.filterCandidates(
        skills,
        experienceYears,
        availability
      );
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ message: 'Failed to filter candidates' });
    }
  });

  // GET all candidates
  app.get('/api/candidates', async (req, res) => {
    try {
      const candidates = await storage.getCandidates();
      res.json(candidates);
    } catch (error) {
      console.error('Error in /api/candidates:', error);
      res.status(500).json({ message: 'Failed to fetch candidates' });
    }
  });

  // GET single candidate by ID
  app.get('/api/candidates/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid candidate ID' });
      }

      const candidate = await storage.getCandidateById(id);
      if (!candidate) {
        return res.status(404).json({ message: 'Candidate not found' });
      }
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch candidate' });
    }
  });

  // POST sync user by Firebase UID
  app.post('/api/auth/sync', async (req, res) => {
    try {
      const { firebaseIdToken } = req.body;
      const user = await storage.syncUser(firebaseIdToken);

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Failed to sync user' });
    }
  });

  // POST create new candidate
  app.post('/api/candidates', async (req, res) => {
    try {
      const candidateData = candidateFormSchema.parse(req.body);
      const newCandidate = await storage.createCandidate(candidateData);
      res.status(201).json(newCandidate);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid candidate data',
          errors: error.errors,
        });
      }
      res.status(500).json({ message: 'Failed to create candidate' });
    }
  });

  // PUT update candidate
  app.put('/api/candidates/:id', async (req, res) => {
    try {
      // Parse ID and verify
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid candidate ID' });
      }

      // Check if candidate exists
      const existingCandidate = await storage.getCandidateById(id);
      if (!existingCandidate) {
        return res.status(404).json({ message: 'Candidate not found' });
      }

      // Process skills field
      const skillsData =
        typeof req.body.skills === 'string'
          ? req.body.skills
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
          : Array.isArray(req.body.skills)
          ? req.body.skills
          : existingCandidate.skills || [];

      // Process certifications field
      const certificationsData =
        req.body.certifications === undefined || req.body.certifications === ''
          ? []
          : typeof req.body.certifications === 'string'
          ? req.body.certifications
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean)
          : Array.isArray(req.body.certifications)
          ? req.body.certifications
          : existingCandidate.certifications || [];

      // Process experience years field
      const experienceYearsData =
        typeof req.body.experienceYears === 'string'
          ? parseInt(req.body.experienceYears)
          : req.body.experienceYears || existingCandidate.experienceYears;

      // Process isActive field
      const isActive =
        req.body.isActive !== undefined
          ? req.body.isActive === true || req.body.isActive === 'true'
          : existingCandidate.isActive;

      // Process bill rate and pay rate fields
      const billRate =
        req.body.billRate !== undefined
          ? typeof req.body.billRate === 'string'
            ? parseInt(req.body.billRate)
            : req.body.billRate
          : existingCandidate.billRate;

      const payRate =
        req.body.payRate !== undefined
          ? typeof req.body.payRate === 'string'
            ? parseInt(req.body.payRate)
            : req.body.payRate
          : existingCandidate.payRate;

      // Execute update through storage interface
      const updatedCandidate = await storage.updateCandidate(id, {
        // Use nullish coalescing for fields that should be updated even when empty
        initials:
          req.body.initials !== undefined
            ? req.body.initials
            : existingCandidate.initials,
        profileImageUrl:
          req.body.profileImageUrl !== undefined
            ? req.body.profileImageUrl
            : existingCandidate.profileImageUrl,
        fullName:
          req.body.fullName !== undefined
            ? req.body.fullName
            : existingCandidate.fullName,
        title:
          req.body.title !== undefined
            ? req.body.title
            : existingCandidate.title,
        location:
          req.body.location !== undefined
            ? req.body.location
            : existingCandidate.location,
        skills: skillsData,
        experienceYears: experienceYearsData,
        bio: req.body.bio !== undefined ? req.body.bio : existingCandidate.bio,
        education:
          req.body.education !== undefined
            ? req.body.education
            : existingCandidate.education,
        availability:
          req.body.availability !== undefined
            ? req.body.availability
            : existingCandidate.availability,
        contactEmail:
          req.body.contactEmail !== undefined
            ? req.body.contactEmail
            : existingCandidate.contactEmail,
        contactPhone:
          req.body.contactPhone !== undefined
            ? req.body.contactPhone
            : existingCandidate.contactPhone,
        certifications: certificationsData,
        billRate: billRate,
        payRate: payRate,
        isActive: isActive,
      });

      res.json(updatedCandidate);
    } catch (error) {
      console.error('Update candidate error:', error);
      res.status(500).json({ message: 'Failed to update candidate' });
    }
  });

  // DELETE candidate
  app.delete('/api/candidates/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid candidate ID' });
      }

      const success = await storage.deleteCandidate(id);
      if (!success) {
        return res.status(404).json({ message: 'Candidate not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete candidate' });
    }
  });

  // GET interests by candidate
  app.get('/api/candidates/:id/interests', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid candidate ID' });
      }

      const interests = await storage.getInterestsByCandidate(id);
      res.json(interests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch interests' });
    }
  });

  // POST parse resume and create candidate
  app.post(
    '/api/candidates/parse-resume',
    upload.single('resume'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }

        let resumeText = '';

        if (req.file.mimetype === 'application/pdf') {
          // Dynamically import pdf-parse to avoid initialization issues
          const pdfParse = (await import('pdf-parse')).default;
          const pdfData = await pdfParse(req.file.buffer);
          resumeText = pdfData.text;
        } else {
          resumeText = req.file.buffer.toString('utf-8');
        }

        const parsedData = await parseResume(resumeText);

        // Generate initials from full name
        const initials = parsedData.fullName
          .split(' ')
          .map((name) => name.charAt(0).toUpperCase())
          .join('');

        const candidateData = {
          initials,
          fullName: parsedData.fullName,
          title: parsedData.title,
          location: parsedData.location,
          skills: parsedData.skills,
          experienceYears: parsedData.experienceYears,
          education: parsedData.education,
          bio: parsedData.bio,
          certifications: parsedData.certifications,
          contactEmail: parsedData.email,
          contactPhone: parsedData.phone,
          availability: 'Available',
          isActive: true,
          billRate: 100, // Default rate, can be updated later
          payRate: 80,
          profileImageUrl: null,
        };

        const newCandidate = await storage.createCandidate(candidateData);
        res.status(201).json(newCandidate);
      } catch (error) {
        console.error('Resume parsing error:', error);
        res.status(500).json({ message: 'Failed to parse resume' });
      }
    }
  );

  // POST create interest
  app.post('/api/interests', async (req, res) => {
    try {
      const interestData = interestFormSchema.parse(req.body);
      const newInterest = await storage.createInterest(interestData);
      res.status(201).json(newInterest);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Invalid interest data',
          errors: error.errors,
        });
      }
      res.status(500).json({ message: 'Failed to submit interest' });
    }
  });

  // GET all interests
  app.get('/api/interests', async (req, res) => {
    try {
      const interests = await storage.getInterests();
      res.json(interests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch interests' });
    }
  });

  // PUT update interest status
  app.put('/api/interests/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid interest ID' });
      }

      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: 'Status is required' });
      }

      const updatedInterest = await storage.updateInterestStatus(id, status);
      if (!updatedInterest) {
        return res.status(404).json({ message: 'Interest not found' });
      }
      res.json(updatedInterest);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update interest status' });
    }
  });

  // Analytics routes
  // POST track candidate view
  app.post('/api/analytics/candidate-view', async (req, res) => {
    try {
      const { candidateId } = req.body;
      if (!candidateId) {
        return res.status(400).json({ message: 'Candidate ID is required' });
      }

      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;

      await storage.trackCandidateView(candidateId, userAgent, ipAddress);
      res.status(200).json({ message: 'View tracked' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to track view' });
    }
  });

  // POST track search
  app.post('/api/analytics/search', async (req, res) => {
    try {
      const { query, searchType, resultsCount } = req.body;
      if (!query || !searchType || resultsCount === undefined) {
        return res.status(400).json({
          message: 'Query, searchType, and resultsCount are required',
        });
      }

      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;

      await storage.trackSearch(
        query,
        searchType,
        resultsCount,
        userAgent,
        ipAddress
      );
      res.status(200).json({ message: 'Search tracked' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to track search' });
    }
  });

  // GET analytics dashboard data
  app.get('/api/analytics/dashboard', async (req, res) => {
    try {
      const [
        candidateViewStats,
        searchStats,
        topViewedCandidates,
        recentSearches,
        totalViews,
        totalSearches,
      ] = await Promise.all([
        storage.getCandidateViewStats(),
        storage.getSearchStats(),
        storage.getTopViewedCandidates(10),
        storage.getRecentSearches(20),
        storage.getTotalViewCount(),
        storage.getTotalSearchCount(),
      ]);

      res.json({
        candidateViewStats,
        searchStats,
        topViewedCandidates,
        recentSearches,
        totalViews,
        totalSearches,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch analytics data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
