# Site Inspector Agent

## Overview

Site Inspector Agent is a backend API service that provides AI-powered website analysis through natural language queries. The service uses Playwright for headless browser automation to inspect live websites and OpenAI's GPT model to parse user questions and generate conversational responses. It's designed to integrate with ConsoleBlue's Agent Chat system, providing analysis capabilities for buttons, logos, favicons, navigation structures, and environment comparisons.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**Key Design Patterns**:
- Service-oriented architecture with clear separation between routing, AI processing, and browser automation
- Stateless API design - no persistent storage required as all analysis is performed in real-time
- Dual entry points for development (Vite integration) and production (static file serving)

**Core Services**:

1. **OpenAI Service** (`server/services/openai.ts`)
   - Parses natural language questions using GPT-5
   - Extracts analysis type (buttons, logos, favicon, navigation, compare) and target URLs
   - Uses retry logic with exponential backoff for rate limit handling
   - Leverages Replit's AI Integrations service for OpenAI API access

2. **Playwright Service** (`server/services/playwright.ts`)
   - Manages browser lifecycle with singleton pattern for connection reuse
   - Implements headless Chrome automation with security flags for containerized environments
   - Provides specialized analysis functions for each inspection type
   - Handles URL normalization and navigation timeouts

3. **Formatter Service** (`server/services/formatter.ts`)
   - Converts raw analysis data into conversational text responses
   - Structures output with bullet points and detailed measurements
   - Provides user-friendly error messages
   - Supports all analysis types including accessibility

4. **Accessibility Service** (`server/services/accessibility.ts`)
   - Evaluates ARIA labels and accessible names coverage
   - Checks alt text presence on images
   - Validates heading structure (H1 uniqueness, no skipped levels)
   - Returns detailed accessibility metrics with percentage coverage

5. **Webhook Service** (`server/services/webhook.ts`)
   - Sends HTTP POST notifications when analysis completes
   - Includes retry logic (3 attempts) with exponential backoff
   - Non-blocking: webhook failures don't affect API responses

**API Endpoints**:
- `POST /api/agent` - Main analysis endpoint accepting natural language questions
  - Optional `webhookUrl` parameter for completion notifications
  - Returns `content` (analysis text) and `screenshot` (base64 PNG)
- `POST /api/agent/batch` - Batch analysis endpoint (up to 10 requests)
  - Processes requests in parallel with caching support
  - Optional `webhookUrl` for batch completion notifications
- `GET /api/health` - Browser automation health check

### Frontend Architecture

**Framework**: React with TypeScript and Vite build system

**Purpose**: While the project is primarily a backend API service (per design_guidelines.md), it includes a minimal React frontend for demonstration and testing purposes. The production integration is expected to use the API through ConsoleBlue's Agent Chat system.

**UI Library**: shadcn/ui components with Radix UI primitives and Tailwind CSS for styling

**State Management**: TanStack Query (React Query) for server state and API interactions

### Data Layer

**Database**: PostgreSQL with Drizzle ORM

**Caching System**:
- Analysis results cached for 1 hour to improve performance
- Cache key: URL + analysis type
- Graceful degradation: API works without database (caching disabled)
- Cache table: `analysis_cache` with URL, analysis type, result (JSONB), and expiration timestamp

**Storage Interface** (`server/storage.ts`):
- `getCachedAnalysis` - Retrieves cached results by URL and type
- `setCachedAnalysis` - Stores analysis results with 1-hour TTL
- `cleanExpiredCache` - Removes expired cache entries
- Fallback mode: Returns mock results when database unavailable

### Browser Automation

**Technology**: Playwright with Chromium

**Configuration**: 
- Headless mode with security flags optimized for containerized deployments
- No-sandbox mode for Replit environment compatibility
- Single-process mode to minimize resource usage
- Browser instance reuse via singleton pattern

**Analysis Capabilities**:
- Interactive element counting (buttons, links, forms)
- Image detection with logo-specific filtering
- Favicon validation and loading verification
- Navigation structure extraction
- Accessibility analysis (ARIA labels, alt text, heading structure)
- Side-by-side environment comparison
- Screenshot capture for all analysis types (base64 PNG format)

### Error Handling

**Approach**: Comprehensive error handling at multiple layers
- OpenAI API: Retry logic with rate limit detection
- Playwright: Browser launch failures with descriptive error messages
- API validation: Zod schema validation for request/response contracts
- User-facing: Conversational error messages explaining issues and suggesting solutions

### CORS Configuration

**Purpose**: Enable cross-origin requests from ConsoleBlue's Agent Chat system and other external consumers

**Implementation**: Wildcard CORS enabled on all routes

## External Dependencies

### Third-Party Services

1. **OpenAI API** (via Replit AI Integrations)
   - Model: GPT-5
   - Purpose: Natural language question parsing and intent recognition
   - Authentication: Provided through Replit's AI Integrations service
   - No direct API key required from user

2. **Playwright Browser Automation**
   - Chromium browser engine
   - Requires system-level browser dependencies in production environments
   - May not work in all containerized environments without proper setup

### Key NPM Packages

**Backend Core**:
- `express` - Web server framework
- `playwright` - Browser automation
- `openai` - OpenAI API client
- `cors` - Cross-origin resource sharing
- `zod` - Runtime type validation

**Database (configured but minimal usage)**:
- `drizzle-orm` - TypeScript ORM
- `@neondatabase/serverless` - Serverless Postgres driver
- `drizzle-kit` - Database migrations

**Frontend**:
- `react` & `react-dom` - UI framework
- `@tanstack/react-query` - Server state management
- `wouter` - Lightweight routing
- `@radix-ui/*` - Headless UI components
- `tailwindcss` - Utility-first CSS

**Development**:
- `vite` - Frontend build tool and dev server
- `typescript` - Type safety
- `tsx` - TypeScript execution for Node.js

### Environment Variables

Required:
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - Provided by Replit AI Integrations
- `AI_INTEGRATIONS_OPENAI_API_KEY` - Provided by Replit AI Integrations

Optional:
- `DATABASE_URL` - PostgreSQL connection string (for future storage features)
- `PORT` - Server port (defaults to 3000)

### System Dependencies

**Critical**: Chromium browser dependencies required for Playwright
- May require manual installation in production environments
- Replit environment provides these automatically
- Docker/container deployments need additional system packages