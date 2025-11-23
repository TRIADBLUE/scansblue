# Site Inspector Agent

## Overview

Site Inspector Agent is a backend API service that provides AI-powered website analysis through natural language queries. The service uses Playwright for headless browser automation to inspect live websites and OpenAI's GPT model to parse user questions and generate conversational responses. It's designed to integrate with ConsoleBlue's Agent Chat system, providing analysis capabilities for buttons, logos, favicons, navigation structures, accessibility, and comprehensive website-wide analysis with task list generation.

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
   - Extracts analysis type (buttons, logos, favicon, navigation, compare, accessibility) and target URLs
   - Returns comparison subtype to enable deterministic cache keys
   - Uses retry logic with exponential backoff for rate limit handling
   - Leverages Replit's AI Integrations service for OpenAI API access

2. **Playwright Service** (`server/services/playwright.ts`)
   - Manages browser lifecycle with singleton pattern for connection reuse
   - Implements headless Chrome automation with security flags for containerized environments
   - Provides specialized analysis functions for each inspection type
   - Handles URL normalization and navigation timeouts

3. **Website Crawler Service** (`server/services/websiteCrawler.ts`)
   - Breadth-first crawl of entire websites (limit 10 pages default)
   - Discovers internal page structure
   - Analyzes each page for accessibility, content, SEO, and performance issues
   - Returns structured crawl results for task generation

4. **Task Generator Service** (`server/services/taskGenerator.ts`)
   - Converts crawl results into prioritized action items
   - Categorizes issues: accessibility, performance, SEO, UX, security, content
   - Assigns priority levels: critical, high, medium, low
   - Estimates effort: quick, medium, complex
   - Provides affected pages and detailed descriptions for each task

5. **Analysis Executor Service** (`server/services/analysisExecutor.ts`)
   - Centralized analysis orchestration for all analysis types
   - Handles cache lookup and storage
   - Uses comparison subtype from OpenAI for deterministic cache keys
   - Ensures consistent AgentResponse format across all endpoints

6. **Formatter Service** (`server/services/formatter.ts`)
   - Converts raw analysis data into conversational text responses
   - Structures output with bullet points and detailed measurements
   - Provides user-friendly error messages
   - Supports all analysis types including accessibility

7. **Accessibility Service** (`server/services/accessibility.ts`)
   - Evaluates ARIA labels and accessible names coverage
   - Checks alt text presence on images
   - Validates heading structure (H1 uniqueness, no skipped levels)
   - Returns detailed accessibility metrics with percentage coverage

8. **Webhook Service** (`server/services/webhook.ts`)
   - Sends HTTP POST notifications when analysis completes
   - Supports multiple event types: analysis_complete, batch_complete, website_analysis_complete
   - Includes retry logic (3 attempts) with exponential backoff
   - Non-blocking: webhook failures don't affect API responses

**API Endpoints**:
- `POST /api/agent` - Main analysis endpoint accepting natural language questions
  - Optional `webhookUrl` parameter for completion notifications
  - Returns `content` (analysis text) and `screenshot` (base64 PNG)
  - Supports single-page analysis of buttons, logos, favicon, navigation, accessibility
  
- `POST /api/agent/batch` - Batch analysis endpoint (up to 10 requests)
  - Processes requests in parallel with caching support
  - Optional `webhookUrl` for batch completion notifications
  - Returns array of analysis results
  
- `POST /api/agent/analyze-website` - **NEW** - Website-wide analysis endpoint
  - Crawls entire website (up to 10 pages)
  - Generates prioritized task list
  - Analyzes for accessibility, SEO, content, performance issues
  - Returns tasks grouped by priority and category
  - Results cached for repeated analysis of same URL
  - Optional `webhookUrl` for completion notifications
  
- `GET /api/health` - Browser automation health check

### Frontend Architecture

**Framework**: React with TypeScript and Vite build system

**Pages**:
- `/` - Home page with agent interaction interface (existing)
- `/analyze` - **NEW** - Website analysis interface with task list display

**UI Library**: shadcn/ui components with Radix UI primitives and Tailwind CSS for styling

**State Management**: TanStack Query (React Query) for server state and API interactions

### Data Layer

**Database**: PostgreSQL with Drizzle ORM

**Caching System**:
- Analysis results cached for 1 hour to improve performance
- Cache key: URL + analysis type
- Comparison cache keys use format: url1_url2_comparisonSubtype
- Website analysis results stored indefinitely (latest analysis retrieved)
- Graceful degradation: API works without database (caching disabled)
- Cache tables: `analysis_cache` with URL, analysis type, result (JSONB), and expiration timestamp
- `website_analysis` table stores complete crawl results, discovered pages, generated tasks, and summary

**Storage Interface** (`server/storage.ts`):
- `getCachedAnalysis` - Retrieves cached results by URL and type
- `setCachedAnalysis` - Stores analysis results with 1-hour TTL
- `cleanExpiredCache` - Removes expired cache entries
- `getWebsiteAnalysis` - Retrieves latest website analysis
- `setWebsiteAnalysis` - Stores website crawl results and tasks
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
- **NEW** Website-wide crawling and issue detection

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

**Database (configured)**:
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
- `DATABASE_URL` - PostgreSQL connection string (for caching and analysis storage)
- `PORT` - Server port (defaults to 3000)

### System Dependencies

**Critical**: Chromium browser dependencies required for Playwright
- May require manual installation in production environments
- Replit environment provides these automatically
- Docker/container deployments need additional system packages

## Recent Changes (November 23, 2025)

### NEW: Website Analysis with Task List Generation

**Added comprehensive website-wide analysis capability:**
- `POST /api/agent/analyze-website` endpoint that crawls entire websites
- Discovers and analyzes up to 10 pages per crawl
- Generates prioritized task lists based on detected issues
- Frontend page `/analyze` for user interaction with beautiful UI

**New Services:**
- Website crawler for discovering site structure
- Task generator that categorizes and prioritizes issues
- Support for analysis caching at page level

**New Issue Categories:**
- Accessibility: Missing alt text, ARIA labels, heading structure
- SEO: Missing H1, meta descriptions, heading hierarchy
- Content: Broken links, missing images, empty headings  
- Performance: Unoptimized images, asset loading
- UX/Security: Future expansion areas

**Priority System:**
- Critical: Blocks accessibility or SEO (H1, alt text, ARIA)
- High: Impacts user experience significantly (broken links, duplicates)
- Medium: Content or metadata issues
- Low: Performance optimization opportunities

**Effort Estimation:**
- Quick: Under 30 minutes (add meta descriptions, fix alt text)
- Medium: 1-3 hours (optimize images, refactor structure)
- Complex: 4+ hours (major content restructuring)

**Database Schema:**
- `website_analysis` table stores crawl results, discovered pages, generated tasks, and summary
- All analysis results cached with last-analyzed timestamp
