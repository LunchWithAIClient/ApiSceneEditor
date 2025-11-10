# LunchWith.ai Manager

## Overview

LunchWith.ai Manager is a web-based management interface for the LunchWith.ai API. The application provides CRUD (Create, Read, Update, Delete) operations for managing characters, scenes, and cast members in a storytelling or content creation context. Built as a full-stack TypeScript application, it features a React frontend with a clean, data-focused UI and an Express backend configured for API integration.

The application follows a Material Design-inspired approach with Carbon Design influences, prioritizing information density, clarity, and efficient workflows. Users can manage characters with their descriptions and motivations, create scenes, and assign cast members to scenes with specific roles and goals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing (alternative to React Router)

**UI Component Library:**
- Shadcn/ui components built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Component library follows the "New York" style variant
- Inter font family from Google Fonts for typography

**State Management:**
- TanStack Query (React Query) v5 for server state management and data fetching
- Local component state with React hooks for UI state
- Custom API client (`lunchWithApi.ts`) for external API communication

**Design System:**
- CSS custom properties for theming (light/dark mode support built-in)
- Material Design and Carbon Design principles for data-heavy interfaces
- Consistent spacing system using Tailwind's scale (2, 4, 6, 8, 12, 16)
- Maximum content width of 7xl with centered layouts
- Hover and active elevation effects for interactive elements

**Key Design Decisions:**
- **Information-first approach:** Maximizes content visibility by minimizing chrome and UI overhead
- **Card-based layouts:** Characters and scenes displayed as cards in responsive grids
- **Dialog-based forms:** Create/edit operations use modal dialogs to maintain context
- **Toast notifications:** Non-blocking feedback for user actions

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for the HTTP server
- ES modules (type: "module") for modern JavaScript syntax
- Middleware for JSON parsing and request logging

**Database Layer:**
- Drizzle ORM configured for PostgreSQL (via `@neondatabase/serverless`)
- Schema defined in `shared/schema.ts` for type-safe database operations
- Database migrations managed through Drizzle Kit
- Currently includes a `users` table with UUID primary keys

**Storage Abstraction:**
- `IStorage` interface defines the contract for data operations
- `MemStorage` implementation provides in-memory storage for development
- Design allows easy swapping to database-backed storage (Drizzle ORM ready)

**API Design:**
- RESTful endpoints prefixed with `/api`
- Server-side rendering setup with Vite integration in development
- Static file serving for production builds

**Session Management:**
- Express session support configured with `connect-pg-simple` for PostgreSQL-backed sessions

**Development Tools:**
- Replit-specific plugins for enhanced development experience
- Custom error overlay for runtime errors
- Request/response logging middleware with timing information

### External Dependencies

**Third-Party API Integration:**
- **LunchWith.ai API:** Primary external service at `https://api.lunchwith.ai`
  - Bearer token authentication using user-provided API key
  - Stored in localStorage under `lunchwith_api_key`
  - Endpoints for Characters, Scenes, and Cast management
  - RESTful operations: GET (list/detail), POST (create), PUT (update), DELETE

**Database:**
- **PostgreSQL** via Neon serverless driver (`@neondatabase/serverless`)
- Connection string provided via `DATABASE_URL` environment variable
- Drizzle ORM for type-safe queries and migrations

**UI Component Libraries:**
- **Radix UI:** Headless component primitives (20+ components including Dialog, Dropdown, Toast, etc.)
- **Lucide React:** Icon library for consistent iconography
- **cmdk:** Command palette component for keyboard-driven interfaces
- **Embla Carousel:** Touch-friendly carousel component
- **date-fns:** Date manipulation and formatting

**Development Dependencies:**
- **TypeScript:** Static type checking across frontend and backend
- **ESBuild:** Fast bundling for production server code
- **PostCSS & Autoprefixer:** CSS processing pipeline
- **Tailwind CSS:** Utility-first CSS framework

**Form Handling:**
- React Hook Form with Zod resolvers for type-safe form validation
- Drizzle-Zod for automatic schema validation from database models

**Architectural Rationale:**

The application separates concerns between a lightweight backend (primarily for session management and potential server-side rendering) and a feature-rich frontend that communicates directly with the LunchWith.ai API. This architecture:

1. **Reduces backend complexity** by delegating business logic to the external API
2. **Improves user experience** through client-side state management and optimistic updates
3. **Maintains security** by requiring user-provided API keys (not server-stored credentials)
4. **Enables future expansion** with the database and storage abstraction already in place
5. **Supports rapid development** with hot module replacement and modern tooling