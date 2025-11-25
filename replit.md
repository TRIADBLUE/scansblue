# Site Inspector Agent

## Overview
Site Inspector Agent is a backend API service that provides AI-powered website analysis through natural language queries. It integrates headless browser automation (Browserless) and OpenAI's GPT models to inspect live websites and generate conversational responses. The service is designed to work with ConsoleBlue's Agent Chat system, offering capabilities for analyzing website elements (buttons, logos, favicons, navigation, accessibility) and comprehensive website-wide analysis with task list generation. The business vision is to provide a robust, AI-driven tool for web analysis, enhancing efficiency for developers and businesses.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
The backend is built with **Express.js and TypeScript** on Node.js, following a service-oriented architecture. It features clear separation between routing, AI processing, and browser automation, with a stateless API design.

**Core Services:**
-   **OpenAI Service**: Parses natural language queries using GPT models to extract analysis types and target URLs.
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

**Error Handling**: Includes retries for OpenAI and Browserless APIs, Zod schema validation, and conversational error messages.
**CORS Configuration**: Wildcard CORS enabled.

### Frontend Architecture
Built with **React, TypeScript, and Vite**, using **shadcn/ui** components for styling.
-   **Pages**: Home (`/`), Website Analysis (`/analyze`), Dashboard (`/dashboard`).
-   **State Management**: TanStack Query for server state.

### Data Layer
-   **Database**: PostgreSQL with Drizzle ORM for caching and storing website analysis results.
-   **Caching System**: Analysis results are cached for 1 hour; website analysis results are stored indefinitely.

### Browser Automation
Leverages **Browserless Cloud API** via the `/chromium/evaluate` endpoint for interactive element counting, image detection, favicon validation, navigation structure extraction, accessibility analysis, and screenshot capture.

### Feature Specifications
-   **Natural Language Processing**: Recognizes comprehensive analysis requests (e.g., "complete analysis", "full audit") and specific element analyses (e.g., "how many buttons").
-   **Comprehensive Website Analysis**: Delivers multi-section reports including structure quality, SEO priorities, execution concerns, button/link trends, and business-level recommendations. Combines 7 analyses: Buttons, Navigation, Headings, Accessibility, Logos, Forms, Images.

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