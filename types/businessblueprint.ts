# SITEINSPECTOR API - COMPLETE IMPLEMENTATION
## For SiteInspector.dev Replit Project

---

## 📁 FILE STRUCTURE

```
/siteinspector-replit/
├── api/
│   └── businessblueprint.ts          # NEW - BusinessBlueprint API endpoints
├── services/
│   ├── fast-check.ts                 # EXISTING - enhance if needed
│   ├── full-report.ts                # EXISTING - enhance if needed
│   ├── auditor.ts                    # EXISTING - enhance if needed
│   └── api-auth.ts                   # NEW - API key authentication
├── middleware/
│   └── verify-api-key.ts             # NEW - API key middleware
├── types/
│   └── businessblueprint.ts          # NEW - TypeScript types for API
└── server.ts                         # UPDATE - add new routes
```

---

## 🔐 PART 1: AUTHENTICATION MIDDLEWARE

**File: `/middleware/verify-api-key.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  apiClient?: {
    name: string;
    tier: 'free' | 'premium';
    rateLimit: number;
  };
}

const API_KEYS = {
  // BusinessBlueprint Production Key
  [process.env.BUSINESSBLUEPRINT_API_KEY || 'BBAPI_live_changeme']: {
    name: 'BusinessBlueprint',
    tier: 'premium' as const,
    rateLimit: 10000 // requests per day
  },
  // BusinessBlueprint Test Key
  [process.env.BUSINESSBLUEPRINT_TEST_KEY || 'BBAPI_test_changeme']: {
    name: 'BusinessBlueprint (Test)',
    tier: 'premium' as const,
    rateLimit: 1000
  }
};

export function verifyApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string || req.body.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      message: 'Include API key in X-API-Key header or request body'
    });
  }

  const client = API_KEYS[apiKey];

  if (!client) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  // Attach client info to request
  req.apiClient = client;

  // TODO: Check rate limits here if needed

  next();
}

export function requirePremiumTier(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.apiClient?.tier !== 'premium') {
    return res.status(403).json({
      success: false,
      error: 'Premium tier required',
      message: 'This endpoint requires a premium API key'
    });
  }

  next();
}
```

---

## 📊 PART 2: TYPESCRIPT TYPES

**File: `/types/businessblueprint.ts`**

```typescript
export interface FastCheckRequest {
  url: string;
  apiKey?: string;
  checks?: ('comprehensive' | 'ssl' | 'speed' | 'mobile' | 'accessibility')[];
}

export interface FastCheckResponse {
  success: boolean;
  url: string;
  timestamp: string;
  results: {
    ssl: SSLResult;
    performance: PerformanceResult;
    mobile: MobileResult;
    accessibility?: AccessibilityResult;
    criticalIssues: Issue[];
    summary: Summary;
  };
  error?: string;
}

export interface SSLResult {
  present: boolean;
  valid: boolean;
  issuer?: string;
  expiresIn?: number; // days
  expiryDate?: string;
}

export interface PerformanceResult {
  loadTime: number; // seconds
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  timeToInteractive?: number;
  score: number; // 0-100
  bottlenecks: string[];
}

export interface MobileResult {
  optimized: boolean;
  score: number; // 0-100
  viewport: boolean;
  textSize: boolean;
  tapTargets: boolean;
  issues: string[];
}

export interface AccessibilityResult {
  score: number; // 0-100
  issues: {
    critical: string[];
    moderate: string[];
    minor: string[];
  };
}

export interface Issue {
  type: 'security' | 'performance' | 'seo' | 'accessibility' | 'usability';
  severity: 'critical' | 'high' | 'medium' | 'low';
  issue: string;
  impact: string;
  recommendation: string;
  estimatedEffort?: 'low' | 'medium' | 'high';
}

export interface Summary {
  totalIssues: number;
  critical: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  overallScore: number; // 0-100
}

export interface FullReportRequest {
  url: string;
  apiKey?: string;
  email?: string;
  returnUrl?: string;
  webhookUrl?: string;
}

export interface FullReportResponse {
  success: boolean;
  reportId: string;
  reportUrl: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedCompletion?: string;
  webhookUrl?: string;
  error?: string;
}

export interface AuditorRequest {
  apiKey?: string;
  conversationId?: string;
  message: string;
  context?: {
    businessName?: string;
    industry?: string;
    currentScore?: number;
    url?: string;
  };
}

export interface AuditorResponse {
  success: boolean;
  conversationId: string;
  response: string;
  tokensUsed: number;
  analysisData?: {
    issuesFound?: number;
    categories?: string[];
    recommendations?: string[];
  };
  error?: string;
}
```

---

## 🚀 PART 3: BUSINESSBLUEPRINT API ROUTES

**File: `/api/businessblueprint.ts`**

```typescript
import { Router } from 'express';
import { verifyApiKey, requirePremiumTier } from '../middleware/verify-api-key';
import { FastCheckService } from '../services/fast-check';
import { FullReportService } from '../services/full-report';
import { AuditorService } from '../services/auditor';
import type {
  FastCheckRequest,
  FastCheckResponse,
  FullReportRequest,
  FullReportResponse,
  AuditorRequest,
  AuditorResponse
} from '../types/businessblueprint';

const router = Router();

// Apply authentication to all routes
router.use(verifyApiKey);

/**
 * POST /api/businessblueprint/fast-check
 * 
 * Run Fast Check analysis on a URL
 * Used during BusinessBlueprint assessment for automated Website & SEO scoring
 */
router.post('/fast-check', async (req, res) => {
  try {
    const { url, checks = ['comprehensive'] } = req.body as FastCheckRequest;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required',
        message: 'Please provide a valid website URL'
      });
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL',
        message: 'Please provide a valid website URL'
      });
    }

    console.log(`[BusinessBlueprint API] Fast Check requested for: ${validUrl.href}`);

    // Run the analysis
    const analysis = await FastCheckService.runComprehensive(validUrl.href);

    // Format response
    const response: FastCheckResponse = {
      success: true,
      url: validUrl.href,
      timestamp: new Date().toISOString(),
      results: {
        ssl: {
          present: analysis.ssl?.present || false,
          valid: analysis.ssl?.valid || false,
          issuer: analysis.ssl?.issuer,
          expiresIn: analysis.ssl?.expiresIn,
          expiryDate: analysis.ssl?.expiryDate
        },
        performance: {
          loadTime: analysis.performance?.loadTime || 0,
          firstContentfulPaint: analysis.performance?.fcp,
          largestContentfulPaint: analysis.performance?.lcp,
          timeToInteractive: analysis.performance?.tti,
          score: analysis.performance?.score || 0,
          bottlenecks: analysis.performance?.bottlenecks || []
        },
        mobile: {
          optimized: analysis.mobile?.optimized || false,
          score: analysis.mobile?.score || 0,
          viewport: analysis.mobile?.viewport || false,
          textSize: analysis.mobile?.textSize || false,
          tapTargets: analysis.mobile?.tapTargets || false,
          issues: analysis.mobile?.issues || []
        },
        accessibility: checks.includes('accessibility') ? {
          score: analysis.accessibility?.score || 0,
          issues: {
            critical: analysis.accessibility?.critical || [],
            moderate: analysis.accessibility?.moderate || [],
            minor: analysis.accessibility?.minor || []
          }
        } : undefined,
        criticalIssues: analysis.priorityIssues || [],
        summary: {
          totalIssues: analysis.summary?.total || 0,
          critical: analysis.summary?.critical || 0,
          highPriority: analysis.summary?.high || 0,
          mediumPriority: analysis.summary?.medium || 0,
          lowPriority: analysis.summary?.low || 0,
          overallScore: analysis.overallScore || 0
        }
      }
    };

    console.log(`[BusinessBlueprint API] Fast Check completed. Score: ${response.results.summary.overallScore}`);

    res.json(response);

  } catch (error) {
    console.error('[BusinessBlueprint API] Fast Check error:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * POST /api/businessblueprint/full-report
 * 
 * Queue a full website crawl and report generation
 * Used when user wants complete prioritized task list
 */
router.post('/full-report', requirePremiumTier, async (req, res) => {
  try {
    const { url, email, returnUrl, webhookUrl } = req.body as FullReportRequest;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL'
      });
    }

    console.log(`[BusinessBlueprint API] Full Report requested for: ${validUrl.href}`);

    // Queue the report
    const report = await FullReportService.queueReport({
      url: validUrl.href,
      email,
      source: 'businessblueprint',
      webhookUrl,
      returnUrl
    });

    const response: FullReportResponse = {
      success: true,
      reportId: report.id,
      reportUrl: `${process.env.SITE_URL || 'https://siteinspector.dev'}/reports/${report.id}`,
      status: report.status,
      estimatedCompletion: report.estimatedCompletion,
      webhookUrl: webhookUrl
    };

    console.log(`[BusinessBlueprint API] Report queued: ${report.id}`);

    res.json(response);

  } catch (error) {
    console.error('[BusinessBlueprint API] Full Report error:', error);
    res.status(500).json({
      success: false,
      error: 'Report generation failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/businessblueprint/report/:reportId
 * 
 * Retrieve a completed report
 */
router.get('/report/:reportId', async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await FullReportService.getReport(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Only return reports created via BusinessBlueprint API
    if (report.source !== 'businessblueprint') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      report: {
        id: report.id,
        url: report.url,
        status: report.status,
        createdAt: report.createdAt,
        completedAt: report.completedAt,
        results: report.results
      }
    });

  } catch (error) {
    console.error('[BusinessBlueprint API] Get Report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve report',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * POST /api/businessblueprint/auditor
 * 
 * Chat with AI Auditor (DeepSeek)
 * Used by Coach Blue for technical website analysis
 */
router.post('/auditor', async (req, res) => {
  try {
    const { conversationId, message, context } = req.body as AuditorRequest;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log(`[BusinessBlueprint API] Auditor request: ${message.substring(0, 50)}...`);

    // Call Auditor service
    const result = await AuditorService.chat({
      conversationId,
      message,
      context: {
        source: 'businessblueprint',
        ...context
      }
    });

    const response: AuditorResponse = {
      success: true,
      conversationId: result.conversationId,
      response: result.response,
      tokensUsed: result.tokensUsed,
      analysisData: result.analysisData
    };

    console.log(`[BusinessBlueprint API] Auditor response generated. Tokens: ${result.tokensUsed}`);

    res.json(response);

  } catch (error) {
    console.error('[BusinessBlueprint API] Auditor error:', error);
    res.status(500).json({
      success: false,
      error: 'Auditor analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/businessblueprint/health
 * 
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'SiteInspector API',
    client: 'BusinessBlueprint',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
```

---

## 🔧 PART 4: UPDATE SERVER.TS

**File: `/server.ts` (add these lines)**

```typescript
// ... existing imports ...
import businessBlueprintApi from './api/businessblueprint';

// ... existing middleware setup ...

// BusinessBlueprint API routes
app.use('/api/businessblueprint', businessBlueprintApi);

// ... rest of existing routes ...
```

---

## 🌍 PART 5: ENVIRONMENT VARIABLES

**File: `.env` (add these)**

```bash
# BusinessBlueprint API Keys
BUSINESSBLUEPRINT_API_KEY=BBAPI_live_[generate-random-32-chars]
BUSINESSBLUEPRINT_TEST_KEY=BBAPI_test_[generate-random-32-chars]

# Site URL (for generating report links)
SITE_URL=https://siteinspector.dev

# Rate limiting (optional)
API_RATE_LIMIT_WINDOW=86400000
API_RATE_LIMIT_MAX=10000
```

---

## 📝 PART 6: API DOCUMENTATION

**File: `/docs/BUSINESSBLUEPRINT_API.md`**

```markdown
# BusinessBlueprint API Documentation

## Base URL
```
https://siteinspector.dev/api/businessblueprint
```

## Authentication
All requests require an API key sent via:
- Header: `X-API-Key: YOUR_API_KEY`
- OR Body: `{ "apiKey": "YOUR_API_KEY", ... }`

## Endpoints

### 1. Fast Check
**POST** `/fast-check`

Quick website analysis for automated scoring.

**Request:**
```json
{
  "url": "https://example.com",
  "checks": ["comprehensive"]
}
```

**Response:** See FastCheckResponse type

---

### 2. Full Report
**POST** `/full-report`

Queue complete website crawl.

**Request:**
```json
{
  "url": "https://example.com",
  "email": "user@example.com",
  "webhookUrl": "https://businessblueprint.io/api/siteinspector-webhook"
}
```

**Response:** See FullReportResponse type

---

### 3. Get Report
**GET** `/report/:reportId`

Retrieve completed report.

---

### 4. Auditor Chat
**POST** `/auditor`

AI-powered technical analysis chat.

**Request:**
```json
{
  "message": "Analyze https://example.com",
  "context": {
    "businessName": "Joe's Pizza",
    "industry": "Restaurant"
  }
}
```

---

### 5. Health Check
**GET** `/health`

Service status check.
```

---

## 🧪 PART 7: TESTING SCRIPT

**File: `/tests/test-businessblueprint-api.ts`**

```typescript
const API_KEY = process.env.BUSINESSBLUEPRINT_TEST_KEY;
const BASE_URL = 'http://localhost:3000/api/businessblueprint';

async function testFastCheck() {
  console.log('Testing Fast Check...');

  const response = await fetch(`${BASE_URL}/fast-check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY!
    },
    body: JSON.stringify({
      url: 'https://businessblueprint.io'
    })
  });

  const data = await response.json();
  console.log('Fast Check Result:', JSON.stringify(data, null, 2));

  return data.success;
}

async function testFullReport() {
  console.log('Testing Full Report...');

  const response = await fetch(`${BASE_URL}/full-report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY!
    },
    body: JSON.stringify({
      url: 'https://businessblueprint.io',
      webhookUrl: 'https://webhook.site/your-unique-id'
    })
  });

  const data = await response.json();
  console.log('Full Report Result:', JSON.stringify(data, null, 2));

  return data.success;
}

async function testAuditor() {
  console.log('Testing Auditor...');

  const response = await fetch(`${BASE_URL}/auditor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY!
    },
    body: JSON.stringify({
      message: 'What are the most common website performance issues?',
      context: {
        businessName: 'Test Business',
        industry: 'Technology'
      }
    })
  });

  const data = await response.json();
  console.log('Auditor Result:', JSON.stringify(data, null, 2));

  return data.success;
}

async function runTests() {
  const results = {
    fastCheck: await testFastCheck(),
    fullReport: await testFullReport(),
    auditor: await testAuditor()
  };

  console.log('\n=== TEST RESULTS ===');
  console.log(results);
  console.log(Object.values(results).every(r => r) ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
}

runTests();
```

---

## 🚀 DEPLOYMENT CHECKLIST

**Before deploying to production:**

- [ ] Generate secure API keys (32+ random characters)
- [ ] Add keys to Replit Secrets
- [ ] Test all endpoints with Postman/curl
- [ ] Set up rate limiting if needed
- [ ] Configure webhooks for Full Reports
- [ ] Add logging/monitoring
- [ ] Document API for BusinessBlueprint team
- [ ] Create backup/rollback plan

---

## 📊 USAGE MONITORING

**Add to admin dashboard (optional):**

```typescript
// Track API usage
interface APIUsage {
  client: string;
  endpoint: string;
  timestamp: Date;
  responseTime: number;
  statusCode: number;
}

// Log each request
router.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    logApiUsage({
      client: req.apiClient?.name || 'unknown',
      endpoint: req.path,
      timestamp: new Date(),
      responseTime: duration,
      statusCode: res.statusCode
    });
  });

  next();
});
```

---

**END OF SITEINSPECTOR API IMPLEMENTATION**

**Ready to copy into SiteInspector Replit project!**