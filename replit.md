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
- AWS Cognito authentication service (`cognitoAuth.ts`) for user authentication and session management
- Custom API client (`lunchWithApi.ts`) for external API communication with Cognito token integration

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
- **Backend Proxy** at `/api/lunchwith/*` forwards requests to LunchWith.ai API
  - Solves browser CORS restrictions
  - Preserves query strings for pagination/filtering support
  - Excludes request body from GET/HEAD/DELETE methods
  - Forwards Cognito access token in Authorization header to external API
  - Forwards X-LWAI-User-Id header for user identification
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
- **LunchWith.ai API:** Primary external service at `https://beta.lunchwith.ai`
  - **Authentication:** AWS Cognito User Pool authentication with JWT tokens
  - **Headers Required:**
    - `Authorization: Bearer <access_token>` - Cognito access token
    - `X-LWAI-User-Id: <user_id>` - LWAI account identifier extracted from Cognito
  - Backend proxy at `/api/lunchwith/*` forwards requests to avoid browser CORS restrictions
  - Endpoints for Characters, Scenes, and Cast management
  - API Operations: PUT (create), POST (update), GET (list/detail), DELETE (remove)
  - Response format: All responses wrapped in `{ results: [...], statusCode: 200, ...metadata }`
  - Frontend automatically unwraps `results` field for seamless integration

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

**Authentication Flow:**

The application uses AWS Cognito for user authentication with support for multiple LWAI accounts per user:

1. **Configuration:** Cognito User Pool ID and App Client ID are stored as environment variables (`VITE_COGNITO_USER_POOL_ID` and `VITE_COGNITO_CLIENT_ID`)
2. **Sign In:** Users authenticate with username and password via Cognito
3. **Session Management:** Cognito tokens (access, ID, refresh) are managed by `cognitoAuth.ts`
4. **Multi-Account Support:** All LWAI account IDs are extracted from Cognito ID token with priority:
   - Primary: `custom:lwai_accounts` (supports JSON array `["id1", "id2"]`, comma-delimited `"id1,id2"`, or single string `"id1"`)
   - Fallback: `custom:user_id` (single account)
   - Last resort: `sub` (Cognito user ID as fallback)
5. **Account Selection:**
   - If multiple accounts exist, a dropdown selector appears in the header
   - User can switch between accounts using the dropdown
   - Selected account index is persisted in localStorage
   - Switching accounts triggers a page reload to refresh all data
6. **API Requests:** Each request includes:
   - `Authorization: Bearer <access_token>` header
   - `X-LWAI-User-Id: <lwai_account_id>` header (current selected account)
7. **Token Persistence:** Cognito maintains session state across page reloads
8. **Sign Out:** Clears Cognito session and returns to login screen
9. **User Profile (Future):** Once `/user/me` endpoint is deployed, it will provide contactName and account preferences for display

**Cognito Configuration Requirements:**
- Cognito User Pool must have a custom attribute `custom:lwai_accounts` containing LWAI account ID(s)
- Format can be:
  - JSON array: `["1106072e-fa0f-44f4-8c0a-54661c8411e1", "2206072e-fa0f-44f4-8c0a-54661c8411e2"]`
  - Comma-delimited: `"1106072e-fa0f-44f4-8c0a-54661c8411e1,2206072e-fa0f-44f4-8c0a-54661c8411e2"`
  - Single string: `"1106072e-fa0f-44f4-8c0a-54661c8411e1"`
- Fallback attributes `custom:user_id` and `sub` are used if `custom:lwai_accounts` is not present

**Architectural Rationale:**

The application uses a backend proxy pattern where the frontend communicates with the Express backend, which forwards requests to the LunchWith.ai API. This architecture:

1. **Solves CORS restrictions** by using server-to-server communication with the external API
2. **Reduces backend complexity** by delegating business logic to the external API
3. **Improves user experience** through client-side state management and optimistic updates
4. **Maintains security** by using Cognito-managed authentication tokens
5. **Enables future expansion** with the database and storage abstraction already in place
6. **Supports rapid development** with hot module replacement and modern tooling

**Key Implementation Details:**
- Frontend makes requests to `/api/lunchwith/*` on the same origin (no CORS)
- Backend proxy forwards to `https://beta.lunchwith.ai` with proper authentication headers
- Update operations (POST) exclude ID fields from request body (IDs only in URL path)
- API responses are unwrapped from `{ results: [...] }` envelope automatically

## Feature Overview

### Characters Management
- CRUD operations for character entities with name, description, and motivation
- Search/filter by character name or ID
- Duplicate functionality for quick character creation
- Collapsible cards showing full details on demand

### Scenes Management
- CRUD operations for scene entities with name and description
- Cast member management within each scene (role, goal)
- Search/filter by scene name or ID
- Duplicate functionality
- Scene detail view with cast member list