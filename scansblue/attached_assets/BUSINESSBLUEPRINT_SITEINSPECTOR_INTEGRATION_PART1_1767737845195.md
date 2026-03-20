# BUSINESSBLUEPRINT + SITEINSPECTOR INTEGRATION
## Complete Implementation for BusinessBlueprint.io

---

## 📁 FILE STRUCTURE

```
/businessblueprint/
├── server/
│   ├── services/
│   │   ├── siteinspector.ts             # NEW - SiteInspector API client
│   │   ├── presenceScanner.ts           # UPDATE - add SiteInspector integration
│   │   ├── openai.ts                    # UPDATE - include SiteInspector data in AI
│   │   └── aiCoach.ts                   # UPDATE - Auditor integration
│   └── routes.ts                        # UPDATE - webhook endpoint
├── client/src/
│   ├── components/
│   │   └── siteinspector-results.tsx    # NEW - display SiteInspector results
│   └── pages/
│       └── portal/
│           └── prescription-detail.tsx   # UPDATE - show technical issues
└── shared/
    └── schema.ts                         # UPDATE - add SiteInspector results table
```

---

## 🔐 PART 1: ENVIRONMENT VARIABLES

**File: `.env` (add these to BusinessBlueprint)**

```bash
# SiteInspector Integration
SITEINSPECTOR_API_URL=https://siteinspector.dev/api/businessblueprint
SITEINSPECTOR_API_KEY=BBAPI_live_[your-generated-key]
SITEINSPECTOR_TEST_KEY=BBAPI_test_[your-generated-key]
```

---

## 📊 PART 2: DATABASE SCHEMA

**File: `/shared/schema.ts` (add this table)**

```typescript
export const siteInspectorResults = pgTable("site_inspector_results", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").references(() => assessments.id),
  url: text("url").notNull(),
  
  // Fast Check Results
  overallScore: integer("overall_score"), // 0-100
  
  // SSL
  sslPresent: boolean("ssl_present"),
  sslValid: boolean("ssl_valid"),
  sslIssuer: text("ssl_issuer"),
  sslExpiresIn: integer("ssl_expires_in"), // days
  
  // Performance
  loadTime: real("load_time"), // seconds
  performanceScore: integer("performance_score"), // 0-100
  
  // Mobile
  mobileOptimized: boolean("mobile_optimized"),
  mobileScore: integer("mobile_score"), // 0-100
  
  // Issues (JSON array)
  criticalIssues: text("critical_issues"), // JSON string
  
  // Full Report (if requested)
  fullReportId: text("full_report_id"),
  fullReportUrl: text("full_report_url"),
  fullReportStatus: text("full_report_status"), // queued, processing, completed
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export type SiteInspectorResult = typeof siteInspectorResults.$inferSelect;
export type NewSiteInspectorResult = typeof siteInspectorResults.$inferInsert;
```

**Run migration:**
```bash
npm run db:push
```

---

## 🌐 PART 3: SITEINSPECTOR SERVICE

**File: `/server/services/siteinspector.ts`**

```typescript
import { db } from '../db';
import { siteInspectorResults } from '../../shared/schema';

interface FastCheckResult {
  success: boolean;
  url: string;
  results: {
    ssl: {
      present: boolean;
      valid: boolean;
      issuer?: string;
      expiresIn?: number;
    };
    performance: {
      loadTime: number;
      score: number;
      bottlenecks: string[];
    };
    mobile: {
      optimized: boolean;
      score: number;
      issues: string[];
    };
    criticalIssues: Array<{
      type: string;
      severity: string;
      issue: string;
      impact: string;
      recommendation: string;
    }>;
    summary: {
      totalIssues: number;
      critical: number;
      highPriority: number;
      overallScore: number;
    };
  };
}

interface FullReportResult {
  success: boolean;
  reportId: string;
  reportUrl: string;
  status: string;
}

interface AuditorResult {
  success: boolean;
  conversationId: string;
  response: string;
  tokensUsed: number;
}

export class SiteInspectorService {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = process.env.NODE_ENV === 'production' 
      ? process.env.SITEINSPECTOR_API_KEY!
      : process.env.SITEINSPECTOR_TEST_KEY!;
    this.baseUrl = process.env.SITEINSPECTOR_API_URL || 'https://siteinspector.dev/api/businessblueprint';
  }
  
  /**
   * Run Fast Check analysis on a website
   * Used during assessment for automated Website & SEO scoring
   */
  async runFastCheck(url: string): Promise<FastCheckResult | null> {
    try {
      console.log(`[SiteInspector] Running Fast Check for: ${url}`);
      
      const response = await fetch(`${this.baseUrl}/fast-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          url,
          checks: ['comprehensive']
        })
      });
      
      if (!response.ok) {
        throw new Error(`SiteInspector API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'SiteInspector analysis failed');
      }
      
      console.log(`[SiteInspector] Fast Check completed. Overall score: ${data.results.summary.overallScore}`);
      
      return data;
      
    } catch (error) {
      console.error('[SiteInspector] Fast Check error:', error);
      // Don't throw - we don't want to block assessment if SiteInspector fails
      return null;
    }
  }
  
  /**
   * Queue a Full Report for comprehensive analysis
   * Used when user wants detailed prioritized task list
   */
  async requestFullReport(url: string, email?: string, assessmentId?: number): Promise<FullReportResult | null> {
    try {
      console.log(`[SiteInspector] Requesting Full Report for: ${url}`);
      
      const webhookUrl = `${process.env.FRONTEND_URL || 'https://businessblueprint.io'}/api/siteinspector-webhook`;
      
      const response = await fetch(`${this.baseUrl}/full-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          url,
          email,
          webhookUrl,
          returnUrl: assessmentId ? `${process.env.FRONTEND_URL}/portal/prescriptions/${assessmentId}` : undefined
        })
      });
      
      if (!response.ok) {
        throw new Error(`SiteInspector API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to queue report');
      }
      
      console.log(`[SiteInspector] Full Report queued: ${data.reportId}`);
      
      return data;
      
    } catch (error) {
      console.error('[SiteInspector] Full Report error:', error);
      return null;
    }
  }
  
  /**
   * Chat with Auditor AI
   * Used by Coach Blue for technical analysis
   */
  async chatWithAuditor(message: string, context?: {
    businessName?: string;
    industry?: string;
    currentScore?: number;
    url?: string;
    conversationId?: string;
  }): Promise<AuditorResult | null> {
    try {
      console.log(`[SiteInspector] Auditor chat: ${message.substring(0, 50)}...`);
      
      const response = await fetch(`${this.baseUrl}/auditor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          message,
          conversationId: context?.conversationId,
          context: {
            businessName: context?.businessName,
            industry: context?.industry,
            currentScore: context?.currentScore,
            url: context?.url
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`SiteInspector API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Auditor chat failed');
      }
      
      console.log(`[SiteInspector] Auditor response received. Tokens: ${data.tokensUsed}`);
      
      return data;
      
    } catch (error) {
      console.error('[SiteInspector] Auditor error:', error);
      return null;
    }
  }
  
  /**
   * Save Fast Check results to database
   */
  async saveFastCheckResults(assessmentId: number, url: string, results: FastCheckResult): Promise<void> {
    try {
      await db.insert(siteInspectorResults).values({
        assessmentId,
        url,
        overallScore: results.results.summary.overallScore,
        sslPresent: results.results.ssl.present,
        sslValid: results.results.ssl.valid,
        sslIssuer: results.results.ssl.issuer,
        sslExpiresIn: results.results.ssl.expiresIn,
        loadTime: results.results.performance.loadTime,
        performanceScore: results.results.performance.score,
        mobileOptimized: results.results.mobile.optimized,
        mobileScore: results.results.mobile.score,
        criticalIssues: JSON.stringify(results.results.criticalIssues)
      });
      
      console.log(`[SiteInspector] Results saved for assessment ${assessmentId}`);
    } catch (error) {
      console.error('[SiteInspector] Error saving results:', error);
    }
  }
  
  /**
   * Update Full Report status when webhook is received
   */
  async updateFullReportStatus(assessmentId: number, reportId: string, reportUrl: string, status: string): Promise<void> {
    try {
      await db.update(siteInspectorResults)
        .set({
          fullReportId: reportId,
          fullReportUrl: reportUrl,
          fullReportStatus: status,
          updatedAt: new Date()
        })
        .where(eq(siteInspectorResults.assessmentId, assessmentId));
      
      console.log(`[SiteInspector] Full Report status updated: ${status}`);
    } catch (error) {
      console.error('[SiteInspector] Error updating report status:', error);
    }
  }
  
  /**
   * Get SiteInspector results for an assessment
   */
  async getResults(assessmentId: number): Promise<any> {
    try {
      const results = await db.query.siteInspectorResults.findFirst({
        where: eq(siteInspectorResults.assessmentId, assessmentId)
      });
      
      if (results && results.criticalIssues) {
        return {
          ...results,
          criticalIssues: JSON.parse(results.criticalIssues)
        };
      }
      
      return results;
    } catch (error) {
      console.error('[SiteInspector] Error getting results:', error);
      return null;
    }
  }
}

export const siteInspectorService = new SiteInspectorService();
```

---

## 🔍 PART 4: UPDATE PRESENCE SCANNER

**File: `/server/services/presenceScanner.ts` (add SiteInspector integration)**

```typescript
import { siteInspectorService } from './siteinspector';

export class PresenceScannerService {
  // ... existing code ...
  
  async scanWebsite(url: string, assessmentId?: number): Promise<WebsiteScan> {
    console.log(`Scanning website: ${url}`);
    
    // Existing basic checks
    const basicScan = await this.checkBasicPresence(url);
    
    // NEW: Run SiteInspector Fast Check in parallel
    const siteInspectorResults = await siteInspectorService.runFastCheck(url);
    
    // Combine results
    const combined = {
      ...basicScan,
      technical: siteInspectorResults ? {
        overallScore: siteInspectorResults.results.summary.overallScore,
        ssl: siteInspectorResults.results.ssl,
        performance: siteInspectorResults.results.performance,
        mobile: siteInspectorResults.results.mobile,
        issues: siteInspectorResults.results.criticalIssues
      } : null
    };
    
    // Save SiteInspector results to database if we have them
    if (siteInspectorResults && assessmentId) {
      await siteInspectorService.saveFastCheckResults(assessmentId, url, siteInspectorResults);
    }
    
    return combined;
  }
  
  // NEW: Enhanced Website & SEO scoring
  calculateWebsiteScore(websiteScan: WebsiteScan): number {
    let score = 0;
    const maxScore = 20;
    
    // Basic presence (0-10 points) - existing logic
    if (websiteScan.hasWebsite) score += 5;
    if (websiteScan.isResponsive) score += 2;
    if (websiteScan.hasMetaTags) score += 2;
    if (websiteScan.hasSitemap) score += 1;
    
    // Technical score from SiteInspector (0-10 points) - NEW
    if (websiteScan.technical) {
      const techScore = websiteScan.technical.overallScore; // 0-100
      score += Math.round((techScore / 100) * 10); // Convert to 0-10
    }
    
    return Math.min(maxScore, Math.round(score));
  }
}
```

---

## 🤖 PART 5: UPDATE AI PRESCRIPTION GENERATION

**File: `/server/services/openai.ts` (include SiteInspector data)**

```typescript
async analyzeBusinessPresence(input: BusinessAnalysisInput): Promise<AnalysisResult> {
  // ... existing code ...
  
  // NEW: Get SiteInspector results if available
  const siteInspectorResults = await siteInspectorService.getResults(input.assessmentId);
  
  const prompt = `You are analyzing a local business's digital presence...

WEBSITE & SEO TECHNICAL ANALYSIS (from SiteInspector):
${siteInspectorResults ? `
- Overall Score: ${siteInspectorResults.overallScore}/100
- SSL Status: ${siteInspectorResults.sslPresent ? 'Present' : 'Missing'}${siteInspectorResults.sslValid ? ' and Valid' : ' but Invalid'}
- Load Time: ${siteInspectorResults.loadTime}s (target: <2s)
- Performance Score: ${siteInspectorResults.performanceScore}/100
- Mobile Optimized: ${siteInspectorResults.mobileOptimized ? 'Yes' : 'No'} (score: ${siteInspectorResults.mobileScore}/100)

CRITICAL ISSUES DETECTED:
${siteInspectorResults.criticalIssues.map(issue => `
- [${issue.severity.toUpperCase()}] ${issue.issue}
  Impact: ${issue.impact}
  Fix: ${issue.recommendation}
`).join('\n')}
` : 'Technical analysis not available'}

When creating Website & SEO recommendations:
1. Reference these SPECIFIC technical issues
2. Recommend SiteInspector Full Report for complete analysis
3. Recommend HostsBlue to fix technical issues automatically
4. Be specific about what's wrong (don't be generic)

...rest of prompt...
`;
  
  // ... rest of existing code ...
}
```

---

## 💬 PART 6: UPDATE COACH BLUE

**File: `/server/services/aiCoach.ts` (add Auditor integration)**

```typescript
import { siteInspectorService } from './siteinspector';

export class AICoachService {
  // ... existing code ...
  
  async getPersonalizedGuidance(request: CoachRequest): Promise<CoachResponse> {
    // Check if user is asking about technical website issues
    const technicalKeywords = ['website', 'slow', 'broken', 'technical', 'ssl', 'speed', 'mobile', 'error'];
    const isTechnicalQuestion = technicalKeywords.some(keyword => 
      request.message.toLowerCase().includes(keyword)
    );
    
    if (isTechnicalQuestion && request.context?.websiteUrl) {
      // Use SiteInspector Auditor for technical analysis
      console.log('[Coach Blue] Delegating to SiteInspector Auditor for technical analysis');
      
      const auditorResult = await siteInspectorService.chatWithAuditor(
        request.message,
        {
          businessName: request.context.businessName,
          industry: request.context.industry,
          currentScore: request.context.digitalScore,
          url: request.context.websiteUrl,
          conversationId: request.conversationId
        }
      );
      
      if (auditorResult) {
        // Coach Blue explains Auditor's technical findings in friendly terms
        const coachResponse = await this.explainTechnicalFindings(
          auditorResult.response,
          request.context
        );
        
        return {
          conversationId: auditorResult.conversationId,
          response: coachResponse,
          suggestions: ['Want me to help you fix these?', 'Should we look at HostsBlue?'],
          resources: auditorResult.analysisData?.recommendations
        };
      }
    }
    
    // Regular Coach Blue response for non-technical questions
    return await this.regularGuidance(request);
  }
  
  private async explainTechnicalFindings(technicalResponse: string, context: any): Promise<string> {
    // Have Coach Blue translate technical jargon into friendly language
    const systemPrompt = `You are Coach Blue, a friendly AI business mentor. 
    
A technical analyst just provided this analysis:
"${technicalResponse}"

Explain this to ${context.businessName} in simple, encouraging terms. Focus on:
1. What the problems mean for their business (lost customers, lower rankings)
2. Which issues to tackle first
3. That you're here to help them through it

Keep it warm, supportive, and actionable. No jargon.`;
    
    // Call your existing AI to rephrase
    const response = await this.callAI(systemPrompt, '');
    return response;
  }
}
```

---

## 🔗 PART 7: WEBHOOK ENDPOINT

**File: `/server/routes.ts` (add webhook handler)**

```typescript
import { siteInspectorService } from './services/siteinspector';

// ... existing routes ...

/**
 * Webhook endpoint for SiteInspector Full Report completion
 */
app.post('/api/siteinspector-webhook', async (req, res) => {
  try {
    const { reportId, status, url, summary, assessmentId } = req.body;
    
    console.log(`[Webhook] SiteInspector report ${reportId} status: ${status}`);
    
    if (status === 'completed' && assessmentId) {
      // Update database with Full Report info
      await siteInspectorService.updateFullReportStatus(
        assessmentId,
        reportId,
        `https://siteinspector.dev/reports/${reportId}`,
        status
      );
      
      // TODO: Send notification email to user that their full report is ready
      // await emailService.sendFullReportReady(user.email, reportId);
    }
    
    res.json({ success: true, received: true });
    
  } catch (error) {
    console.error('[Webhook] Error processing SiteInspector webhook:', error);
    res.status(500).json({ success: false, error: 'Webhook processing failed' });
  }
});
```

---

## 🎨 PART 8: SITEINSPECTOR RESULTS COMPONENT

**File: `/client/src/components/siteinspector-results.tsx`**

```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface SiteInspectorResultsProps {
  results: {
    overallScore: number;
    sslPresent: boolean;
    sslValid: boolean;
    loadTime: number;
    performanceScore: number;
    mobileOptimized: boolean;
    mobileScore: number;
    criticalIssues: Array<{
      type: string;
      severity: string;
      issue: string;
      impact: string;
      recommendation: string;
    }>;
    fullReportUrl?: string;
  };
  websiteUrl: string;
}

export function SiteInspectorResults({ results, websiteUrl }: SiteInspectorResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, any> = {
      critical: { className: 'bg-red-600 text-white', label: 'Critical' },
      high: { className: 'bg-orange-600 text-white', label: 'High' },
      medium: { className: 'bg-yellow-600 text-white', label: 'Medium' },
      low: { className: 'bg-blue-600 text-white', label: 'Low' }
    };
    
    const variant = variants[severity.toLowerCase()] || variants.medium;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };
  
  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="border-2 border-[#0000FF]">
        <CardHeader>
          <CardTitle className="text-[#0000FF]" style={{ fontFamily: 'Archivo Semi Expanded' }}>
            Website Technical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Overall Technical Score</p>
              <p className={`text-5xl font-bold ${getScoreColor(results.overallScore)}`}>
                {results.overallScore}<span className="text-2xl">/100</span>
              </p>
            </div>
            <div className="text-right">
              <Button
                variant="outline"
                className="border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white"
                onClick={() => window.open(`https://siteinspector.dev?url=${websiteUrl}`, '_blank')}
              >
                Run Full Report <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#EEFBFF] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {results.sslPresent && results.sslValid ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <p className="font-semibold text-[#09080E]">SSL Certificate</p>
              </div>
              <p className="text-sm text-gray-600">
                {results.sslPresent && results.sslValid ? 'Valid and secure' : 'Missing or invalid'}
              </p>
            </div>
            
            <div className="bg-[#EEFBFF] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {results.loadTime < 2.5 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                <p className="font-semibold text-[#09080E]">Load Time</p>
              </div>
              <p className="text-sm text-gray-600">
                {results.loadTime.toFixed(2)}s {results.loadTime > 2.5 && '(target: <2.5s)'}
              </p>
            </div>
            
            <div className="bg-[#EEFBFF] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {results.mobileOptimized ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <p className="font-semibold text-[#09080E]">Mobile Friendly</p>
              </div>
              <p className="text-sm text-gray-600">
                Score: {results.mobileScore}/100
              </p>
            </div>
          </div>
          
          {/* Critical Issues */}
          {results.criticalIssues && results.criticalIssues.length > 0 && (
            <div>
              <h4 className="font-semibold text-[#09080E] mb-3">Issues Detected</h4>
              <div className="space-y-3">
                {results.criticalIssues.map((issue, index) => (
                  <div key={index} className="border-l-4 border-[#F97316] bg-white p-4 rounded">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-[#09080E]">{issue.issue}</h5>
                      {getSeverityBadge(issue.severity)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Impact:</strong> {issue.impact}
                    </p>
                    <p className="text-sm text-[#0000FF]">
                      <strong>Recommendation:</strong> {issue.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {results.fullReportUrl && (
            <div className="mt-6 p-4 bg-[#EEFBFF] rounded-lg border-2 border-[#0000FF]">
              <p className="text-sm text-[#09080E] mb-3">
                <strong>Your complete technical report is ready!</strong> View the full prioritized task list with detailed recommendations.
              </p>
              <Button
                className="bg-[#F97316] hover:bg-[#F97316]/90 text-white"
                onClick={() => window.open(results.fullReportUrl, '_blank')}
              >
                View Full Report <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📧 PART 9: UPDATE EMAIL TEMPLATES

**File: `/server/services/email.ts` (include SiteInspector findings)**

```typescript
private async generateReportHTML(data: EmailReportData): Promise<string> {
  // Get SiteInspector results if available
  const siteInspectorResults = await siteInspectorService.getResults(data.assessmentId);
  
  // ... existing email template code ...
  
  // Add technical issues section if we have SiteInspector data
  const technicalIssuesSection = siteInspectorResults ? `
    <div class="section">
      <h2 style="color: #0000FF; font-family: 'Archivo Semi Expanded', sans-serif;">
        🔍 Technical Issues Detected
      </h2>
      <p style="color: #09080E;">
        Our automated website analysis found ${siteInspectorResults.criticalIssues.length} issues that need attention:
      </p>
      
      ${siteInspectorResults.criticalIssues.slice(0, 3).map(issue => `
        <div class="recommendation">
          <h3 style="color: #F97316;">${issue.issue}</h3>
          <p><strong>Impact:</strong> ${issue.impact}</p>
          <p><strong>Fix:</strong> ${issue.recommendation}</p>
        </div>
      `).join('')}
      
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://siteinspector.dev?url=${encodeURIComponent(data.websiteUrl)}" 
           class="cta-button secondary-button"
           target="_blank">
          Run Complete Analysis →
        </a>
      </div>
    </div>
  ` : '';
  
  // Insert into email template at appropriate location
  return fullEmailHTML;
}
```

---

**CONTINUING IN NEXT FILE...**
