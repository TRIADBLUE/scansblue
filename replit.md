# Site Inspector Agent

## Overview
Site Inspector Agent is a backend API service that provides AI-powered website analysis through natural language queries. It integrates headless browser automation (Browserless) and OpenAI's GPT models to inspect live websites and generate conversational responses. The service is designed to work with ConsoleBlue's Agent Chat system, offering capabilities for analyzing website elements like buttons, logos, favicons, navigation, and accessibility, as well as comprehensive website-wide analysis with task list generation. The business vision is to provide a robust, AI-driven tool for web analysis, enhancing efficiency for developers and businesses.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
The backend is built with **Express.js and TypeScript** on Node.js, following a service-oriented architecture. It features clear separation between routing, AI processing, and browser automation, with a stateless API design.

**Core Services:**
-   **OpenAI Service**: Parses natural language queries using GPT-5 to extract analysis types and target URLs, leveraging Replit's AI Integrations. Includes retry logic.
-   **Browserless Service**: Utilizes the Browserless Cloud API for headless browser automation, executing scripts and capturing screenshots for various analysis types.
-   **Website Crawler Service**: Performs breadth-first crawls of entire websites (configurable 1-100 pages, default 50), discovering internal pages and analyzing them for accessibility, content, SEO, and performance issues.
-   **Task Generator Service**: Converts crawl results into prioritized, categorized action items with effort estimates and detailed descriptions.
-   **Analysis Executor Service**: Orchestrates all analysis types, handling cache lookups and storage, ensuring consistent `AgentResponse` format.
-   **Formatter Service**: Converts raw analysis data into conversational, user-friendly text responses.
-   **Accessibility Service**: Wraps Browserless accessibility analysis to evaluate ARIA labels, alt text, and heading structures.
-   **Webhook Service**: Sends non-blocking HTTP POST notifications upon analysis completion, with retry logic.

**API Endpoints:**
-   `POST /api/agent` - Main analysis endpoint accepting natural language questions
  - Optional `webhookUrl` parameter for completion notifications
  - Returns `content` (analysis text) and `screenshot` (base64 PNG)
  - Supports single-page analysis and comprehensive business-level audits
  
-   `POST /api/agent/batch` - Batch analysis endpoint (up to 10 requests)
  - Processes requests in parallel with caching support
  - Optional `webhookUrl` for batch completion notifications
  - Returns array of analysis results
  
-   `POST /api/agent/analyze-website` - Website-wide analysis endpoint
  - Crawls entire website (configurable 1-100 pages, default 50)
  - Request body: `{ url: string, maxPages?: number, webhookUrl?: string }`
  - Discovers and analyzes all internal pages via breadth-first crawl
  - Generates prioritized task list across all discovered pages
  - Analyzes for accessibility, SEO, content, performance issues
  - Returns tasks grouped by priority and category with affected pages
  - Results cached for repeated analysis of same URL
  - Optional `webhookUrl` for completion notifications
  
-   `GET /api/health` - Browser automation health check

**Error Handling**: Comprehensive error handling with retries for OpenAI and Browserless APIs, Zod schema validation, and conversational error messages.
**CORS Configuration**: Wildcard CORS enabled to support cross-origin requests from ConsoleBlue and other consumers.

### Frontend Architecture
Built with **React, TypeScript, and Vite**, using **shadcn/ui** components (Radix UI, Tailwind CSS) for styling.
-   **Pages**: Home (`/`), Website Analysis (`/analyze`), Dashboard (`/dashboard`).
-   **State Management**: TanStack Query for server state.

### Data Layer
-   **Database**: PostgreSQL with Drizzle ORM for caching and storing website analysis results.
-   **Caching System**: Analysis results are cached for 1 hour (URL + analysis type), and website analysis results are stored indefinitely. Graceful degradation ensures API functionality even if the database is unavailable.

### Browser Automation
Leverages **Browserless Cloud API** via the `/chromium/evaluate` endpoint. It supports full Puppeteer API compatibility and provides capabilities for interactive element counting, image detection, favicon validation, navigation structure extraction, accessibility analysis, environment comparison, and screenshot capture.

## External Dependencies

### Third-Party Services
1.  **OpenAI API**: Accessed via Replit AI Integrations (Model: GPT-5) for natural language processing.
2.  **Browserless Cloud API**: `https://production-sfo.browserless.io` for cloud-based headless browser automation.

### Key NPM Packages
-   **Backend**: `express`, `openai`, `cors`, `zod`, `p-retry`, `p-limit`, `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`.
-   **Frontend**: `react`, `react-dom`, `@tanstack/react-query`, `wouter`, `@radix-ui/*`, `tailwindcss`.
-   **Development**: `vite`, `typescript`, `tsx`.

### Environment Variables
-   **Required**: `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`, `BROWSERLESS_API_KEY`.
-   **Optional**: `DATABASE_URL`, `PORT`.

### System Dependencies
None required, as Browserless handles all browser automation in the cloud.

## API Usage Examples

### Full Report Analysis (Website-Wide Crawling)

**Basic Request (Default 50 pages):**
```bash
curl -X POST http://localhost:5000/api/agent/analyze-website \
  -H "Content-Type: application/json" \
  -d '{
    "url": "businessblueprint.io"
  }'
```

**Custom Page Limit (crawl up to 100 pages):**
```bash
curl -X POST http://localhost:5000/api/agent/analyze-website \
  -H "Content-Type: application/json" \
  -d '{
    "url": "businessblueprint.io",
    "maxPages": 100
  }'
```

**With Webhook Notification:**
```bash
curl -X POST http://localhost:5000/api/agent/analyze-website \
  -H "Content-Type: application/json" \
  -d '{
    "url": "businessblueprint.io",
    "maxPages": 100,
    "webhookUrl": "https://your-domain.com/webhooks/analysis"
  }'
```

**Response Example:**
```json
{
  "url": "https://businessblueprint.io",
  "pagesAnalyzed": [
    "https://businessblueprint.io/",
    "https://businessblueprint.io/about",
    "https://businessblueprint.io/services",
    "https://businessblueprint.io/contact"
  ],
  "totalIssues": 12,
  "tasks": [
    {
      "id": "missing-alt-text",
      "title": "Add alt text to images",
      "priority": "high",
      "category": "accessibility",
      "description": "19 images missing alt text descriptions",
      "affectedPages": [
        "https://businessblueprint.io/",
        "https://businessblueprint.io/services"
      ],
      "estimatedEffort": "medium",
      "status": "open"
    }
  ],
  "summary": "Analyzed 4 pages and found 12 total issues: 2 critical, 3 high, 5 medium, 2 low priority tasks"
}
```

### Fast Check Analysis (Natural Language)

**Comprehensive Business Analysis:**
```bash
curl -X POST http://localhost:5000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Complete analysis of example.com including structure quality, SEO priorities, execution concerns, and button trends"
  }'
```

**Specific Element Analysis:**
```bash
curl -X POST http://localhost:5000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "content": "How many buttons are on example.com and what do they do?"
  }'
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "browserless": "operational",
  "message": "Browser automation is working correctly"
}
```

## Recent Changes (November 25, 2025)

### NEW: Full Report Configurable Page Crawling
**Enhanced `/api/agent/analyze-website` endpoint with flexible site coverage:**
- ✓ Configurable page limit (1-100 pages, default 50 - was hardcoded to 10)
- ✓ Optional `maxPages` parameter in request body
- ✓ Breadth-first discovery of all internal pages
- ✓ No need to specify which pages - crawler finds them automatically
- ✓ True "full report" capability for sites of any size

**Request Examples:**
```json
// Default: crawls up to 50 pages
{ "url": "businessblueprint.io" }

// Custom: crawls entire site up to 100 pages
{ "url": "businessblueprint.io", "maxPages": 100 }

// With webhook notification
{ "url": "businessblueprint.io", "maxPages": 100, "webhookUrl": "https://..." }
```

**API Changes:**
- Schema: `websiteAnalysisRequestSchema` now includes optional `maxPages: number` field (1-100, default 50)
- Crawler default: Changed from 10 pages to 50 pages
- Route handler: Passes `maxPages` parameter to `crawlWebsite()` function
- Backwards compatible: Old requests without `maxPages` default to 50 pages

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

## Implementation Notes

### Files Modified (November 25, 2025)

**Schema & Types:**
- `shared/schema.ts` - Added `maxPages` parameter to `websiteAnalysisRequestSchema`

**Backend Services:**
- `server/services/websiteCrawler.ts` - Changed default from 10 to 50 pages
- `server/routes.ts` - Updated `/api/agent/analyze-website` route to accept and use `maxPages` parameter

**Documentation:**
- `replit.md` - Updated API endpoint documentation, service descriptions, and added comprehensive API usage examples

### Backwards Compatibility
All changes are **fully backwards compatible**:
- Existing requests without `maxPages` default to 50 pages
- API still works exactly as before for clients not using the new parameter
- No database migrations required
- No breaking changes to response format

### Configuration Options

| Parameter | Type | Range | Default | Required |
|-----------|------|-------|---------|----------|
| `url` | string | any valid URL | N/A | Yes |
| `maxPages` | number | 1-100 | 50 | No |
| `webhookUrl` | string | any valid URL | N/A | No |

### Performance Considerations

- **Default (50 pages)**: Balanced for most websites, completes in 2-5 minutes
- **High limit (100 pages)**: For comprehensive audits, allows 5-15 minutes depending on site complexity
- **Results cached**: Repeated analysis of same URL returns instantly from cache
- **Rate limiting**: Sequential page analysis to avoid Browserless throttling
