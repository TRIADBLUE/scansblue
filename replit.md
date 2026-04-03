# ScansBlue

## Overview
ScansBlue is a website auditing engine that provides AI-powered website analysis through natural language queries. It integrates headless browser automation (Browserless) and DeepSeek AI to inspect live websites and generate conversational responses. The service powers the Digital IQ assessment for businessblueprint.io, offering capabilities for analyzing website elements (buttons, logos, favicons, navigation, accessibility) and comprehensive website-wide analysis with task list generation.

**Brand Identity:**
- **Tagline**: "Get scanned. Get scored. Go Blue."
- **Colors**: Primary #00203A, Accent #1844A6, Brand Red #A00028, Background #E9ECF0 (Triad White), Text #09080E (Triad Black)

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
The backend is built with **Express.js and TypeScript** on Node.js, following a service-oriented architecture. It features clear separation between routing, AI processing, and browser automation, with a stateless API design.

**Core Services:**
-   **Question Parser Service**: Parses natural language queries using DeepSeek AI to extract analysis types and target URLs.
-   **Browserless Service**: Utilizes the Browserless Cloud API for headless browser automation, executing scripts and capturing screenshots.
-   **Website Crawler Service**: Performs breadth-first crawls of entire websites (configurable 1-100 pages, default 50), discovering internal pages for analysis.
-   **Task Generator Service**: Converts crawl results into prioritized, categorized action items with effort estimates.
-   **Analysis Executor Service**: Orchestrates all analysis types, handling cache lookups and storage.
-   **Formatter Service**: Converts raw analysis data into conversational, user-friendly text responses.
-   **Accessibility Service**: Evaluates ARIA labels, alt text, and heading structures.
-   **Webhook Service**: Sends non-blocking HTTP POST notifications upon analysis completion.

**API Endpoints:**
-   `POST /api/agent`: Main analysis endpoint for natural language questions, supports single-page and comprehensive audits.
-   `POST /api/agent/batch`: Batch analysis endpoint for up to 10 requests, processed in parallel with caching.
-   `POST /api/agent/analyze-website`: Website-wide analysis endpoint, crawls and analyzes internal pages, generates prioritized task lists.
-   `GET /api/health`: Browser automation health check.

**Error Handling**: Includes retries for DeepSeek and Browserless APIs, Zod schema validation, and conversational error messages.
**CORS Configuration**: Wildcard CORS enabled.

### Frontend Architecture
Built with **React, TypeScript, and Vite**, using **shadcn/ui** components for styling.
-   **Pages**: Home (`/`), Website Analysis (`/analyze`), Code Auditor (`/auditor`), Dashboard (`/dashboard`).
-   **State Management**: TanStack Query for server state.

### Data Layer
-   **Database**: PostgreSQL with Drizzle ORM for caching and storing website analysis results.
-   **Caching System**: Analysis results are cached for 1 hour; website analysis results are stored indefinitely.

### Browser Automation
Leverages **Browserless Cloud API** via the `/chromium/evaluate` endpoint for interactive element counting, image detection, favicon validation, navigation structure extraction, accessibility analysis, and screenshot capture.

**CRITICAL Implementation Notes:**
-   **Browser Context Execution**: DOM analysis scripts MUST run in browser page context using `page.evaluate(() => { return eval(JSON.stringify(scriptCode)) })`, NOT in Node.js context. This ensures scripts have access to the rendered DOM.
-   **Security**: The eval approach is safe because only repository-controlled scripts are used (no user injection path).
-   **Rendering Reliability**: Uses `waitForSelector('body *', 10s timeout)` + 1.5s post-render delay to handle JavaScript-heavy sites.
-   **Browser Settings**: Uses Chrome UA and 1920x1080 viewport for compatibility.

### Feature Specifications
-   **Natural Language Processing**: Recognizes comprehensive analysis requests (e.g., "complete analysis", "full audit") and specific element analyses (e.g., "how many buttons").
-   **Comprehensive Website Analysis**: Delivers multi-section reports including structure quality, SEO priorities, execution concerns, button/link trends, and business-level recommendations. Combines 7 analyses: Buttons, Navigation, Headings, Accessibility, Logos, Forms, Images.

## External Dependencies

### Third-Party Services
1.  **DeepSeek API**: DeepSeek Chat model for natural language processing and question parsing.
2.  **Browserless Cloud API**: `https://production-sfo.browserless.io` for cloud-based headless browser automation.

### Key NPM Packages
-   **Backend**: `express`, `cors`, `zod`, `p-retry`, `p-limit`, `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`.
-   **Frontend**: `react`, `react-dom`, `@tanstack/react-query`, `wouter`, `@radix-ui/*`, `tailwindcss`.
-   **Development**: `vite`, `typescript`, `tsx`.

### Environment Variables
-   **Required**: `DEEPSEEK_API_KEY`, `BROWSERLESS_API_KEY`.
-   **Optional**: `DATABASE_URL`, `PORT`.
