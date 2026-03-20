# ScansBlue - Complete API Documentation

**Version:** 1.0.0  
**Last Updated:** January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [The Three Options (UI Features)](#the-three-options-ui-features)
3. [Internal API Endpoints](#internal-api-endpoints)
4. [BusinessBlueprint API Endpoints](#businessblueprint-api-endpoints)
5. [Request/Response Examples](#requestresponse-examples)
6. [Feature Analysis Details](#feature-analysis-details)
7. [Timing Estimates](#timing-estimates)
8. [Pricing/Tiers](#pricingtiers)

---

## Overview

ScansBlue is a website analysis tool with three main modes:

| Mode | Purpose | Speed | AI Used |
|------|---------|-------|---------|
| **Quick Analysis** | Fast scan of homepage + up to 10 pages | ~5-15 seconds | None (browser automation) |
| **Comprehensive Analysis** | Deep crawl of up to 50 pages with task list | ~30-120 seconds | None (browser automation) |
| **Code and Site Auditor** | AI chat for code review and questions | Instant responses | DeepSeek AI |

---

## The Three Options (UI Features)

### 1. Quick Analysis (Homepage `/`)

**What it does:**
- Crawls up to 10 pages starting from homepage
- Returns real-time metrics across 8 categories
- Shows status indicators (ok/warning/error) for each category

**Categories Analyzed:**
| Category | What's Checked | Status Logic |
|----------|----------------|--------------|
| Buttons | Total button count across pages | ok if >0, warning if 0 |
| Logos | Logo image detection | ok if found, warning if not |
| Favicon | Browser icon presence | ok if found, error if missing |
| Navigation | Menu items count | ok if >0, warning if 0 |
| Accessibility | ARIA labels, alt text, heading issues | ok if 0 issues, warning if <5, error if >=5 |
| Forms | Form element count | Always ok (informational) |
| Images | Image count + missing alt text | ok if all have alt, warning/error based on missing |
| Headings | H1 count + structure issues | ok if valid structure, warning/error based on issues |

**Data Source:** Real browser automation via Browserless Cloud API

---

### 2. Comprehensive Analysis (`/analyze`)

**What it does:**
- Crawls up to 50 pages (configurable 1-100)
- Generates prioritized task list with effort estimates
- Caches results for repeat visits

**Task Categories:**
- Accessibility
- Performance
- SEO
- UX
- Security
- Content

**Priority Levels:**
- Critical (red)
- High (orange)
- Medium (yellow)
- Low (blue)

**Effort Estimates:**
- Quick (minutes)
- Medium (hours)
- Complex (days)

**Data Source:** Real browser automation + task generation algorithm

---

### 3. Code and Site Auditor (`/auditor`)

**What it does:**
- Full chat interface with DeepSeek AI
- Analyze code, text, business descriptions
- Get honest, thorough feedback

**Features:**
- Conversation history (persistent)
- File attachments (upload any file)
- Voice input (speech-to-text)
- Multi-turn conversations

**AI Model:** DeepSeek (external API)

---

## Internal API Endpoints

These endpoints power the ScansBlue UI.

### `GET /api/health`
Health check for browser automation service.

**Response:**
```json
{
  "status": "healthy",
  "browserless": "operational",
  "message": "Browser automation is working correctly"
}
```

---

### `POST /api/agent`
Natural language website analysis.

**Request:**
```json
{
  "content": "How many buttons on example.com?",
  "webhookUrl": "https://your-webhook.com/callback"  // optional
}
```

**Aliases:** `query`, `message`, `prompt`, `text` all work as field names.

**Response:**
```json
{
  "content": "I found 12 buttons on example.com: 4 in the header navigation, 3 CTA buttons in the hero section, 2 in the features area, and 3 in the footer.",
  "screenshot": "base64-encoded-image"  // optional
}
```

---

### `POST /api/agent/batch`
Batch analysis (up to 10 requests).

**Request:**
```json
{
  "requests": [
    { "content": "How many buttons on site1.com?" },
    { "content": "Check accessibility on site2.com" }
  ],
  "webhookUrl": "https://your-webhook.com/callback"
}
```

**Response:**
```json
{
  "results": [
    { "content": "Found 15 buttons on site1.com..." },
    { "content": "Accessibility analysis for site2.com..." }
  ]
}
```

---

### `POST /api/agent/quick-site-scan`
Powers the Quick Analysis page.

**Request:**
```json
{
  "url": "example.com"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "pagesScanned": 5,
  "categories": {
    "buttons": {
      "count": 12,
      "status": "ok",
      "message": "Found 12 buttons"
    },
    "logos": {
      "count": 1,
      "status": "ok",
      "message": "Logo detected"
    },
    "favicon": {
      "found": true,
      "status": "ok",
      "message": "Favicon present"
    },
    "navigation": {
      "items": 7,
      "status": "ok",
      "message": "7 navigation items"
    },
    "accessibility": {
      "issues": 3,
      "status": "warning",
      "message": "3 issues found"
    },
    "forms": {
      "count": 2,
      "status": "ok",
      "message": "2 forms detected"
    },
    "images": {
      "count": 25,
      "missingAlt": 2,
      "status": "warning",
      "message": "2 images missing alt text"
    },
    "headings": {
      "h1Count": 1,
      "issues": 0,
      "status": "ok",
      "message": "Heading structure OK"
    }
  },
  "summary": "Scanned 5 pages on example.com. Found 12 buttons, 2 forms, 25 images. 3 accessibility issues, 0 heading issues. Some improvements recommended."
}
```

---

### `POST /api/agent/analyze-website`
Powers the Comprehensive Analysis page.

**Request:**
```json
{
  "url": "example.com",
  "maxPages": 50,
  "webhookUrl": "https://your-webhook.com/callback"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "pagesAnalyzed": ["https://example.com", "https://example.com/about", "..."],
  "totalIssues": 15,
  "tasks": [
    {
      "id": "task-1",
      "priority": "critical",
      "category": "accessibility",
      "title": "Add missing alt text to images",
      "description": "12 images across 5 pages are missing alt text...",
      "affectedPages": ["https://example.com", "https://example.com/about"],
      "estimatedEffort": "quick",
      "status": "open"
    }
  ],
  "summary": "Analyzed 25 pages. Found 15 issues requiring attention..."
}
```

---

### `POST /api/audit`
Powers the Code and Site Auditor chat.

**Request:**
```json
{
  "code": "function hello() { console.log('world'); }",
  "language": "javascript",
  "question": "Is this code efficient?"
}
```

**Response:**
```json
{
  "analysis": "This is a simple function that logs 'world' to the console...",
  "issues": ["No error handling", "Function name could be more descriptive"],
  "suggestions": ["Add JSDoc comments", "Consider using arrow function syntax"]
}
```

---

## BusinessBlueprint API Endpoints

These authenticated endpoints are for external integration.

**Base URL:** `/api/businessblueprint`  
**Authentication:** API key in header `X-API-Key`

---

### `GET /api/businessblueprint/health`
Health check.

**Response:**
```json
{
  "success": true,
  "service": "ScansBlue API",
  "client": "BusinessBlueprint",
  "timestamp": "2026-01-09T12:00:00.000Z",
  "version": "1.0.0"
}
```

---

### `POST /api/businessblueprint/fast-check`
Quick website analysis with scores.

**Request:**
```json
{
  "url": "example.com",
  "checks": ["comprehensive", "ssl", "speed", "mobile", "accessibility"]
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "timestamp": "2026-01-09T12:00:00.000Z",
  "results": {
    "ssl": {
      "present": true,
      "valid": true,
      "issuer": "Let's Encrypt",
      "expiresIn": 90,
      "expiryDate": "2026-04-09T12:00:00.000Z"
    },
    "performance": {
      "loadTime": 2.5,
      "firstContentfulPaint": 1.2,
      "largestContentfulPaint": 2.8,
      "timeToInteractive": 3.5,
      "score": 75,
      "bottlenecks": ["High number of images may slow page load"]
    },
    "mobile": {
      "optimized": true,
      "score": 85,
      "viewport": true,
      "textSize": true,
      "tapTargets": true,
      "issues": []
    },
    "accessibility": {
      "score": 70,
      "issues": {
        "critical": ["Missing form labels"],
        "moderate": ["Low contrast text"],
        "minor": ["Redundant alt text"]
      }
    },
    "criticalIssues": [
      {
        "type": "accessibility",
        "severity": "critical",
        "issue": "3 critical accessibility issues",
        "impact": "Users with disabilities cannot access your site",
        "recommendation": "Fix WCAG compliance issues",
        "estimatedEffort": "medium"
      }
    ],
    "summary": {
      "totalIssues": 8,
      "critical": 1,
      "highPriority": 2,
      "mediumPriority": 3,
      "lowPriority": 2,
      "overallScore": 72
    }
  }
}
```

---

### `POST /api/businessblueprint/full-report`
Queue a comprehensive report (Premium tier required).

**Request:**
```json
{
  "url": "example.com",
  "email": "user@example.com",
  "returnUrl": "https://businessblueprint.io/results",
  "webhookUrl": "https://your-webhook.com/callback"
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "rpt_abc123",
  "reportUrl": "https://scansblue.dev/reports/rpt_abc123",
  "status": "queued",
  "estimatedCompletion": "2026-01-09T12:05:00.000Z",
  "webhookUrl": "https://your-webhook.com/callback"
}
```

---

### `GET /api/businessblueprint/report/:reportId`
Retrieve a completed report.

**Response:**
```json
{
  "success": true,
  "report": {
    "id": "rpt_abc123",
    "url": "https://example.com",
    "status": "completed",
    "createdAt": "2026-01-09T12:00:00.000Z",
    "completedAt": "2026-01-09T12:03:00.000Z",
    "results": {
      "pagesAnalyzed": 45,
      "totalIssues": 23,
      "tasks": [...]
    }
  }
}
```

---

### `POST /api/businessblueprint/auditor`
Chat with AI auditor.

**Request:**
```json
{
  "conversationId": "conv_xyz789",
  "message": "What are the main SEO issues with this site?",
  "context": {
    "businessName": "Acme Corp",
    "industry": "retail",
    "currentScore": 65,
    "url": "https://acme.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "conversationId": "conv_xyz789",
  "response": "Based on the analysis of acme.com, I found several SEO issues...",
  "tokensUsed": 450,
  "analysisData": {
    "issuesFound": 5,
    "categories": ["seo", "content"],
    "recommendations": ["Add meta descriptions", "Fix broken links"]
  }
}
```

---

## Feature Analysis Details

### What Each Analysis Type Detects

| Analysis | Detects |
|----------|---------|
| **Buttons** | All clickable buttons, their text, destinations, styling |
| **Logos** | Logo images in header, footer, and content areas |
| **Favicon** | Browser tab icon (ico, png, svg) |
| **Navigation** | Menu items, dropdowns, mobile hamburger menus |
| **Accessibility** | ARIA labels, alt text, heading structure, color contrast |
| **Forms** | Form elements, input fields, required fields, labels |
| **Images** | All images, missing alt text, dimensions |
| **Headings** | H1-H6 structure, missing H1, duplicate H1, hierarchy issues |

### How Analysis Works

1. **Browser Automation:** Uses Browserless Cloud API for headless Chrome
2. **DOM Execution:** Scripts run in browser context via `page.evaluate()`
3. **Multi-Page Crawl:** BFS algorithm discovers internal links
4. **Real Metrics:** All counts are from actual rendered DOM, not estimates

---

## Timing Estimates

| Feature | Typical Duration | Factors |
|---------|------------------|---------|
| Quick Analysis (10 pages) | 5-15 seconds | Site speed, complexity |
| Comprehensive Analysis (50 pages) | 30-120 seconds | Number of pages, site size |
| Code Auditor Response | 1-3 seconds | Message length |
| Fast Check API | 5-10 seconds | Site speed |
| Full Report API | 1-5 minutes (queued) | Site size |

---

## Pricing/Tiers

### Current Implementation

| Tier | Access | Features |
|------|--------|----------|
| **Free** | `/api/agent/quick-site-scan` | Quick Analysis via UI |
| **Free** | `/api/agent/analyze-website` | Comprehensive Analysis via UI |
| **Free** | `/api/audit` | Code Auditor via UI |
| **API Key Required** | `/api/businessblueprint/fast-check` | External API access |
| **API Key + Premium** | `/api/businessblueprint/full-report` | Queued reports |
| **API Key Required** | `/api/businessblueprint/auditor` | External AI chat |

### API Key Authentication

The BusinessBlueprint endpoints require:
- Header: `X-API-Key: your-api-key`
- Premium tier endpoints additionally require tier verification

---

## Environment Variables Required

| Variable | Purpose |
|----------|---------|
| `BROWSERLESS_API_KEY` | Browserless Cloud API for browser automation |
| `DEEPSEEK_API_KEY` | DeepSeek AI for Code Auditor |
| `DATABASE_URL` | PostgreSQL for caching and conversations |

---

## Summary: The Three Options

| # | Name | URL | Purpose | Speed |
|---|------|-----|---------|-------|
| 1 | **Quick Analysis** | `/` | Fast scan, 8 categories, real metrics | ~5-15s |
| 2 | **Comprehensive Analysis** | `/analyze` | Deep crawl, prioritized task list | ~30-120s |
| 3 | **Code and Site Auditor** | `/auditor` | AI chat for code review, questions | Instant |

---

*End of Documentation*
