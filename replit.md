# Talent Showcase Application

## Overview

This is a talent showcase web application built with React (frontend) and Express (backend). It allows users to browse candidate profiles and for recruiters to express interest in candidates. The application uses a modern stack with TypeScript, Drizzle ORM, React Query, and shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a client-server architecture:

1. **Frontend**: React application built with Vite, using TypeScript for type safety
2. **Backend**: Express.js server handling API requests
3. **Database**: PostgreSQL (via Drizzle ORM) for storing candidate and interest data
4. **State Management**: React Query for server state management
5. **UI**: shadcn/ui component system with Tailwind CSS for styling

The application is structured with clear separation between client and server code:
- `/client`: Contains all frontend code
- `/server`: Contains all backend API and server logic
- `/shared`: Contains shared schemas and types used by both client and server

## Key Components

### Frontend Components

1. **Page Components**:
   - `HomePage`: Main landing page displaying candidate listings with filter and search capabilities
   - `AdminPage`: Admin interface for managing candidates and viewing interest requests
   - `NotFound`: 404 error page

2. **Core Feature Components**:
   - `CandidateCard`: Displays a candidate's summary information
   - `CandidateDetail`: Expanded view of a candidate's information
   - `CandidateFilter`: Filter UI for finding candidates by skills, experience, etc.
   - `InterestForm`: Form for recruiters to express interest in a candidate
   - `SearchBar`: Search functionality for finding candidates

3. **Layout Components**:
   - `Navbar`: Navigation header with theme toggle and mobile responsiveness

4. **UI Components**:
   - Comprehensive set of shadcn/ui components for consistent UI design

### Backend Components

1. **API Routes**:
   - Candidate CRUD operations
   - Interest form submission and management

2. **Data Layer**:
   - `storage.ts`: Interface for database operations
   - `schema.ts`: Drizzle ORM schema definitions

### Database Schema

1. **Candidates Table**:
   - Basic information (name, title, location)
   - Professional details (skills, experience, bio, education)
   - Availability and contact information

2. **Interests Table**:
   - Links to candidates via foreign key
   - Recruiter contact information
   - Status tracking for interest requests

## Data Flow

1. **Candidate Listing Flow**:
   - Client makes GET request to `/api/candidates`
   - Server retrieves candidates from database
   - Client displays candidates with filtering and search capabilities

2. **Interest Submission Flow**:
   - User views candidate details and completes interest form
   - Client validates form data and submits to `/api/interests`
   - Server validates and stores the interest record
   - Confirmation displayed to user

3. **Admin Management Flow**:
   - Admin views candidates and interests in the admin panel
   - Admin can create/edit/delete candidate profiles
   - Admin can update interest request statuses

## External Dependencies

### Frontend Dependencies
- React and React DOM for UI rendering
- React Query for data fetching and caching
- Wouter for client-side routing
- Shadcn/UI component library (based on Radix UI)
- Tailwind CSS for styling
- React Hook Form with Zod for form validation

### Backend Dependencies
- Express for API routing
- Drizzle ORM for database operations
- Zod for schema validation

## Deployment Strategy

The application is configured for deployment on Replit:

1. **Development Mode**:
   - Run with `npm run dev` which starts the Vite dev server and Express backend

2. **Production Mode**:
   - Build frontend with `npm run build`
   - Start production server with `npm run start`
   - Server serves static assets from the build directory

3. **Database**:
   - Uses PostgreSQL database provided by Replit
   - Migrations managed via Drizzle Kit

## Getting Started

1. Ensure the PostgreSQL database is provisioned in Replit
2. Run `npm install` to install dependencies
3. Set up the `DATABASE_URL` environment variable
4. Run `npm run db:push` to push the schema to the database
5. Run `npm run dev` to start the development server

## Development Workflow

1. Make changes to the client or server code
2. API changes should update both the server route handlers and client queries
3. Database schema changes should update the shared schema file
4. Use the form validation schemas for both frontend and backend validation