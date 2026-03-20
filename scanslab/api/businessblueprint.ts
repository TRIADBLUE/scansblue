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
      reportUrl: `${process.env.SITE_URL || 'https://scansblue.com'}/reports/${report.id}`,
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
    service: 'ScansBlue API',
    client: 'BusinessBlueprint',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;