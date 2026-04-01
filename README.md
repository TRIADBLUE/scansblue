# ScansBlue — Website Assessment Engine

AI-powered website analysis and diagnostic service. Part of the TRIADBLUE ecosystem. Powers the Digital IQ assessment for businessblueprint.io.

ScansBlue scans websites for technical health, SEO issues, marketing tool presence, security vulnerabilities, accessibility compliance, and more — then generates prioritized, actionable reports written for small business owners who need plain-language guidance.

## Features

- **Comprehensive Site Analysis**: Full website crawl with prioritized task lists across 8 diagnostic categories
- **Quick Analysis**: Fast, category-specific checks (buttons, logos, favicons, navigation, accessibility, forms, images, headings, marketing stack)
- **Marketing Stack Detection**: Identifies email platforms, chat widgets, CRM tracking, automation tools, analytics, and SMS marketing
- **Code Auditing**: Analyze code, configurations, and system descriptions with security-first feedback
- **Business Impact Framing**: Every finding is explained in terms of customers, revenue, and visibility
- **Digital IQ Integration**: Feeds scan results into the businessblueprint.io Digital IQ scoring model (0-140)

## Analysis Categories

1. **Website & Technical** — SSL, speed, mobile, SEO, accessibility
2. **Directory & Listings** — Google, Yelp, Facebook, NAP consistency
3. **Reviews & Reputation** — Review count, ratings, response rates
4. **Social Media Presence** — Platform presence, posting activity
5. **Email & Marketing** — Email capture, campaign tools, list building
6. **Customer Response** — Chat widgets, contact forms, response time
7. **Content & Blog** — Blog presence, posting frequency, freshness
8. **CRM & Automation** — CRM tracking, marketing automation tools

## API Endpoints

### POST /api/agent

Ask natural language questions about websites. Uses DeepSeek AI with the Code Auditor system prompt.

**Request:**
```json
{
  "content": "Analyze the marketing stack on example.com"
}
```

**Response:**
```json
{
  "content": "MARKETING STACK ANALYSIS\n\nEmail Marketing: Mailchimp detected\nLive Chat: Not detected\n..."
}
```

### POST /api/businessblueprint/fast-check

Run a fast check scan for the businessblueprint.io assessment pipeline. Returns SSL, performance, mobile, and critical issue data.

**Request:**
```json
{
  "url": "https://example.com",
  "checks": ["comprehensive"]
}
```

### POST /api/businessblueprint/full-report

Queue a comprehensive full-site crawl and analysis report.

### POST /api/businessblueprint/auditor

Interactive auditor chat — ask follow-up questions about a business's website.

### GET /api/health

Check if browser automation is working correctly.

**Response:**
```json
{
  "status": "healthy",
  "playwright": "operational",
  "message": "Browser automation is working correctly"
}
```

## Technical Stack

- **Backend**: Express.js with TypeScript
- **Browser Automation**: Playwright (Chromium)
- **AI**: DeepSeek API (code auditing, comprehensive analysis, quick analysis)
- **Frontend**: React with Tailwind CSS
- **Deployment**: Replit

## System Requirements

### Production Deployment

This service requires Chromium browser and system dependencies:

- Chromium browser
- libglib2.0, libnspr4, libnss3
- libdbus-1, libatk1.0, libatk-bridge2.0
- libcups2, libxcb1, libxkbcommon0
- libx11, libxcomposite, libxdamage, libxfixes, libxrandr
- libgbm, libcairo, libpango, libasound

### Replit Deployment

1. The production infrastructure includes necessary browser dependencies
2. Test the `/api/health` endpoint after deployment to verify Playwright is working
3. CORS is pre-configured to allow cross-origin requests

### Alternative Deployment Platforms

For Docker, AWS, or other platforms:

1. Use a Playwright-compatible base image (e.g., `mcr.microsoft.com/playwright:v1.40.0`)
2. Or install dependencies: `npx playwright install-deps chromium`
3. Ensure the environment has sufficient memory (minimum 1GB recommended)

## Environment Variables

- `DEEPSEEK_API_KEY` — DeepSeek API key for AI analysis
- `SCANSBLUE_API_KEY` — API key for businessblueprint.io integration
- `PORT` — Server port (default: 5000)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## CORS Configuration

CORS is enabled by default to allow the API to be consumed by businessblueprint.io and Console.Blue.

## TRIADBLUE Ecosystem

ScansBlue is part of the TRIADBLUE platform ecosystem:

- **businessblueprint.io** — Business growth platform (primary consumer)
- **hostsblue.com** — Domains, hosting, email, website builder
- **swipesblue.com** — Payment processing
- **scansblue.com** — Website auditing and scanning (this service)
- **Console.Blue** — Internal operations interface
- **BUILDERBLUE2.COM** — AI-powered vibe coding platform
- **TRIADBLUE.COM** — Parent company

## License

MIT
