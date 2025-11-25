# Site Inspector Agent

## Overview

Site Inspector Agent is a backend API service that provides AI-powered website analysis through natural language queries. The service uses Browserless for headless browser automation to inspect live websites and OpenAI's GPT model to parse user questions and generate conversational responses. It's designed to integrate with ConsoleBlue's Agent Chat system, providing analysis capabilities for buttons, logos, favicons, navigation structures, accessibility, and comprehensive website-wide analysis with task list generation.

## User Preferences

Preferred communication style: Simple, everyday language.

## Design Specifications

**Button Styling Standards** (for Agent Builder reference):
- Padding: 10px all directions
- Margin: 0px all directions
- Border Radius: 7px (edges curve)

## System Architecture

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**Key Design Patterns**:
- Service-oriented architecture with clear separation between routing, AI processing, and browser automation
- Stateless API design - all analysis is performed in real-time
- Dual entry points for development (Vite integration) and production (static file serving)
- Browserless integration for production browser automation

**Core Services**:

1. **OpenAI Service** (`server/services/openai.ts`)
   - Parses natural language questions using GPT-5
   - Extracts analysis type (buttons, logos, favicon, navigation, compare, accessibility) and target URLs
   - Returns comparison subtype to enable deterministic cache keys
   - Uses retry logic with exponential backoff for rate limit handling
   - Leverages Replit's AI Integrations service for OpenAI API access

2. **Browserless Service** (`server/services/browserless.ts`)
   - Cloud-based browser automation via Browserless API
   - Uses `/chromium/evaluate` endpoint for script execution
   - Handles URL normalization and navigation timeouts
   - Supports both single-page and multi-page analysis
   - Provides specialized analysis functions for each inspection type
   - Captures screenshots for all analysis types (base64 PNG format)

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
   - Wrapper around Browserless accessibility analysis
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
  
- `POST /api/agent/analyze-website` - Website-wide analysis endpoint
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
- `/` - Home page with agent interaction interface and Inspector Agent logo
- `/analyze` - Website analysis interface with task list display
- `/dashboard` - Triad Blue Health Dashboard with brand logos and one-click analysis

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

**Technology**: Browserless Cloud API

**Configuration**: 
- Production endpoint: `https://production-sfo.browserless.io`
- Uses `/chromium/evaluate` endpoint for custom script execution
- Supports full Puppeteer API compatibility
- Handles screenshot capture with base64 encoding
- Automatic retry logic with exponential backoff

**Analysis Capabilities**:
- Interactive element counting (buttons, links, forms)
- Image detection with logo-specific filtering
- Favicon validation and loading verification
- Navigation structure extraction
- Accessibility analysis (ARIA labels, alt text, heading structure)
- Side-by-side environment comparison
- Screenshot capture for all analysis types (base64 PNG format)
- Website-wide crawling and issue detection

### Error Handling

**Approach**: Comprehensive error handling at multiple layers
- OpenAI API: Retry logic with rate limit detection
- Browserless: API error handling with descriptive messages
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

2. **Browserless Cloud API**
   - Production endpoint: `https://production-sfo.browserless.io`
   - Authentication: API key via `BROWSERLESS_API_KEY` environment variable
   - Chromium browser engine in the cloud
   - Full Puppeteer API compatibility
   - No system-level browser dependencies required

### Key NPM Packages

**Backend Core**:
- `express` - Web server framework
- `openai` - OpenAI API client
- `cors` - Cross-origin resource sharing
- `zod` - Runtime type validation
- `p-retry` - Retry logic with exponential backoff
- `p-limit` - Rate limiting for concurrent requests

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
- `BROWSERLESS_API_KEY` - API key from Browserless (https://browserless.io)

Optional:
- `DATABASE_URL` - PostgreSQL connection string (for caching and analysis storage)
- `PORT` - Server port (defaults to 3000)

### System Dependencies

**None required!** - Browserless handles all browser automation in the cloud. No Chromium or other system-level dependencies needed on production servers.

## Recent Changes (November 25, 2025)

### NEW: Comprehensive Website Analysis Upgrade
**Enhanced `/api/agent` endpoint with business-level analysis:**
- ✓ New "comprehensive" analysis type for full website audits
- ✓ Triggers on natural language like "complete analysis", "full audit", "structure quality", "business analysis", "SEO priorities"
- ✓ Delivers multi-section report with:
  - Overall Tendencies & Structure Quality Assessment
  - SEO-Minded Priority Points
  - Structure & Behavior Patterns
  - Execution Concerns & Call-Outs
  - Button/Link Trends & Inconsistencies
  - Business-Level Recommendations (3 priority tiers)
- ✓ Combines 7 analyses: Buttons, Navigation, Headings, Accessibility, Logos, Forms, Images
- ✓ Rate-limited execution to prevent Browserless throttling
- ✓ Graceful error handling - if optional analyses fail, core analysis continues
- ✓ Full screenshot included with report

### Natural Language Recognition
OpenAI now recognizes comprehensive analysis requests like:
- "Complete analysis of example.com"
- "Give me a full audit of businessblueprint.io"
- "Analyze structure quality, SEO priorities, and execution concerns"
- "Show button trends and inconsistencies"
- "Business-level website analysis"

### Previous: Navigation Rebranding
**Updated menu labels and page titles:**
- "Ask AI" → "Fast Check"
- "Analyze" → "Full Report"
- "Dashboard" → "ScanBlue"

**Fixed Browserless Integration:**
- ✓ Health endpoint checks Browserless cloud service
- ✓ Fixed type casting across all analysis functions
- ✓ All 8+ analysis types working with rate limiting
- ✓ Screenshot capture for all analysis types (base64 PNG)
- ✓ Comprehensive error handling

## Previous Changes (November 24, 2025)

### NEW: Browserless Integration for Production

**Replaced local Playwright with cloud-based Browserless:**
- Eliminates system dependency issues in production environments
- Uses Browserless `/chromium/evaluate` endpoint for script execution
- Full Puppeteer API compatibility maintained
- API key-based authentication for security
- Automatic retry logic with exponential backoff

**Benefits:**
- No system dependencies required
- Works on any cloud platform (AWS, GCP, Heroku, etc.)
- Better performance and reliability
- Automatic browser pool management in the cloud
- Easy to scale to high concurrency

**Backward compatibility maintained:**
- Same API surface from browser automation service
- All analysis functions work identically
- Screenshots still captured as base64 PNG
- Error handling consistent with previous approach

### Frontend Updates
- New homepage with Inspector Agent logo
- Updated header with Site Inspector branding
- Navigation tabs: Ask AI, Analyze, Dashboard
- Triad Blue Health Dashboard with pre-configured analysis buttons for HostsBlue, SwipesBlue, ConsoleBlue
- Business Blueprint subscription management card

### Branding
- Site Inspector logo in favicon and header
- Inspector Agent logo as homepage title
- Professional visual identity across all pages
