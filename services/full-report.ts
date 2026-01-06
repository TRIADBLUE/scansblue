import { crawlWebsite } from '../server/services/websiteCrawler';

interface QueuedReport {
  id: string;
  url: string;
  email?: string;
  source: string;
  webhookUrl?: string;
  returnUrl?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedCompletion: string;
  createdAt: Date;
  completedAt?: Date;
  results?: any;
}

// In-memory report queue (for MVP - would use DB in production)
const reportQueue: Map<string, QueuedReport> = new Map();

export class FullReportService {
  static async queueReport(params: {
    url: string;
    email?: string;
    source: string;
    webhookUrl?: string;
    returnUrl?: string;
  }): Promise<QueuedReport> {
    // Generate unique report ID
    const id = this.generateReportId();
    
    // Estimate completion time (5 minutes from now)
    const estimatedCompletion = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    const report: QueuedReport = {
      id,
      url: params.url,
      email: params.email,
      source: params.source,
      webhookUrl: params.webhookUrl,
      returnUrl: params.returnUrl,
      status: 'queued',
      estimatedCompletion,
      createdAt: new Date()
    };
    
    // Store in queue
    reportQueue.set(id, report);
    
    console.log(`[FullReportService] Report queued: ${id} for ${params.url}`);
    
    // Start processing in background
    this.processReport(id).catch(err => {
      console.error(`[FullReportService] Error processing report ${id}:`, err);
    });
    
    return report;
  }
  
  static async getReport(reportId: string): Promise<QueuedReport | null> {
    return reportQueue.get(reportId) || null;
  }
  
  private static async processReport(reportId: string): Promise<void> {
    const report = reportQueue.get(reportId);
    if (!report) return;
    
    try {
      // Update status to processing
      report.status = 'processing';
      reportQueue.set(reportId, report);
      
      console.log(`[FullReportService] Processing report: ${reportId}`);
      
      // Run the crawl
      const crawlResults = await crawlWebsite(report.url, 20);
      
      // Process and format results
      const results = this.formatCrawlResults(crawlResults);
      
      // Update report with results
      report.status = 'completed';
      report.completedAt = new Date();
      report.results = results;
      reportQueue.set(reportId, report);
      
      console.log(`[FullReportService] Report completed: ${reportId}`);
      
      // Send webhook if configured
      if (report.webhookUrl) {
        await this.sendWebhook(report);
      }
      
    } catch (error) {
      console.error(`[FullReportService] Report failed: ${reportId}`, error);
      report.status = 'failed';
      reportQueue.set(reportId, report);
      
      // Send failure webhook if configured
      if (report.webhookUrl) {
        await this.sendWebhook(report);
      }
    }
  }
  
  private static formatCrawlResults(crawlResults: any): any {
    const { pages, allUrls } = crawlResults;
    
    // Aggregate issues across all pages
    const aggregatedIssues = {
      accessibility: {
        missingAltText: 0,
        missingAriaLabels: 0,
        headingIssues: [] as string[]
      },
      seo: {
        pagesWithoutMetaDescription: 0,
        pagesWithoutH1: 0,
        duplicateHeadings: 0
      },
      content: {
        brokenLinks: [] as string[],
        missingImages: 0
      },
      performance: {
        largeImages: 0,
        unoptimizedAssets: 0
      }
    };
    
    for (const page of pages) {
      aggregatedIssues.accessibility.missingAltText += page.accessibilityIssues?.missingAltText || 0;
      aggregatedIssues.accessibility.missingAriaLabels += page.accessibilityIssues?.missingAriaLabels || 0;
      
      if (page.seoIssues?.noMetaDescription) {
        aggregatedIssues.seo.pagesWithoutMetaDescription++;
      }
      if (page.seoIssues?.missingH1) {
        aggregatedIssues.seo.pagesWithoutH1++;
      }
      
      if (page.contentIssues?.brokenLinks) {
        aggregatedIssues.content.brokenLinks.push(...page.contentIssues.brokenLinks);
      }
      
      aggregatedIssues.performance.largeImages += page.performance?.largeImages || 0;
    }
    
    // Generate prioritized task list
    const tasks = this.generateTaskList(aggregatedIssues, pages.length);
    
    return {
      pagesScanned: pages.length,
      totalUrlsFound: allUrls?.size || pages.length,
      issues: aggregatedIssues,
      tasks,
      pages: pages.map((p: any) => ({
        url: p.url,
        title: p.title,
        issues: this.countPageIssues(p)
      }))
    };
  }
  
  private static generateTaskList(issues: any, pageCount: number): any[] {
    const tasks: any[] = [];
    
    // Critical tasks
    if (issues.accessibility.missingAltText > 0) {
      tasks.push({
        priority: 'high',
        category: 'Accessibility',
        task: `Add alt text to ${issues.accessibility.missingAltText} images`,
        impact: 'Improves accessibility and SEO',
        effort: 'low'
      });
    }
    
    if (issues.seo.pagesWithoutMetaDescription > 0) {
      tasks.push({
        priority: 'high',
        category: 'SEO',
        task: `Add meta descriptions to ${issues.seo.pagesWithoutMetaDescription} pages`,
        impact: 'Better search engine visibility',
        effort: 'low'
      });
    }
    
    if (issues.seo.pagesWithoutH1 > 0) {
      tasks.push({
        priority: 'high',
        category: 'SEO',
        task: `Add H1 headings to ${issues.seo.pagesWithoutH1} pages`,
        impact: 'Critical for SEO ranking',
        effort: 'low'
      });
    }
    
    if (issues.content.brokenLinks.length > 0) {
      tasks.push({
        priority: 'critical',
        category: 'Content',
        task: `Fix ${issues.content.brokenLinks.length} broken links`,
        impact: 'Poor user experience and SEO penalty',
        effort: 'medium'
      });
    }
    
    if (issues.performance.largeImages > 0) {
      tasks.push({
        priority: 'medium',
        category: 'Performance',
        task: `Optimize ${issues.performance.largeImages} large images`,
        impact: 'Faster page load times',
        effort: 'medium'
      });
    }
    
    return tasks.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 3);
    });
  }
  
  private static countPageIssues(page: any): number {
    let count = 0;
    count += page.accessibilityIssues?.missingAltText || 0;
    count += page.accessibilityIssues?.missingAriaLabels || 0;
    count += page.contentIssues?.brokenLinks?.length || 0;
    if (page.seoIssues?.noMetaDescription) count++;
    if (page.seoIssues?.missingH1) count++;
    return count;
  }
  
  private static async sendWebhook(report: QueuedReport): Promise<void> {
    if (!report.webhookUrl) return;
    
    try {
      console.log(`[FullReportService] Sending webhook to: ${report.webhookUrl}`);
      
      await fetch(report.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: report.status === 'completed' ? 'report.completed' : 'report.failed',
          reportId: report.id,
          url: report.url,
          status: report.status,
          completedAt: report.completedAt?.toISOString(),
          reportUrl: `${process.env.SITE_URL || 'https://siteinspector.dev'}/reports/${report.id}`,
          results: report.status === 'completed' ? report.results : undefined
        })
      });
      
      console.log(`[FullReportService] Webhook sent successfully`);
    } catch (error) {
      console.error(`[FullReportService] Webhook failed:`, error);
    }
  }
  
  private static generateReportId(): string {
    // Generate a readable report ID
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `rpt_${timestamp}_${random}`;
  }
}
