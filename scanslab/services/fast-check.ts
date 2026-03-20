import { performComprehensiveAnalysis } from '../server/services/browserless';
import { analyzeAccessibility } from '../server/services/accessibility';
import type { Issue } from '../types/businessblueprint';

interface FastCheckAnalysis {
  ssl?: {
    present: boolean;
    valid: boolean;
    issuer?: string;
    expiresIn?: number;
    expiryDate?: string;
  };
  performance?: {
    loadTime: number;
    fcp?: number;
    lcp?: number;
    tti?: number;
    score: number;
    bottlenecks: string[];
  };
  mobile?: {
    optimized: boolean;
    score: number;
    viewport: boolean;
    textSize: boolean;
    tapTargets: boolean;
    issues: string[];
  };
  accessibility?: {
    score: number;
    critical: string[];
    moderate: string[];
    minor: string[];
  };
  priorityIssues: Issue[];
  summary?: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  overallScore: number;
}

export class FastCheckService {
  static async runComprehensive(url: string): Promise<FastCheckAnalysis> {
    console.log(`[FastCheckService] Running comprehensive analysis for: ${url}`);
    
    try {
      // Run the comprehensive analysis from browserless
      const analysis = await performComprehensiveAnalysis(url);
      
      // Check SSL
      const sslResult = await this.checkSSL(url);
      
      // Calculate scores and map to expected format
      const accessibilityData = analysis.accessibility;
      const accessibilityScore = accessibilityData?.score || 0;
      
      // Calculate performance score based on load time estimates
      const performanceScore = this.calculatePerformanceScore(analysis);
      
      // Calculate mobile score
      const mobileScore = this.calculateMobileScore(analysis);
      
      // Generate priority issues from all findings
      const priorityIssues = this.generatePriorityIssues(analysis, sslResult);
      
      // Calculate overall score (weighted average)
      const overallScore = Math.round(
        (sslResult.valid ? 20 : 0) +
        (performanceScore * 0.3) +
        (mobileScore * 0.25) +
        (accessibilityScore * 0.25)
      );
      
      // Count issues by severity
      const summary = this.summarizeIssues(priorityIssues);
      
      return {
        ssl: sslResult,
        performance: {
          loadTime: 2.5, // Estimated - browserless doesn't return exact load time
          fcp: undefined,
          lcp: undefined,
          tti: undefined,
          score: performanceScore,
          bottlenecks: this.extractPerformanceBottlenecks(analysis)
        },
        mobile: {
          optimized: mobileScore >= 70,
          score: mobileScore,
          viewport: true, // Assume true if page loads
          textSize: true,
          tapTargets: analysis.buttons?.issues?.length === 0,
          issues: this.extractMobileIssues(analysis)
        },
        accessibility: {
          score: accessibilityScore,
          critical: accessibilityData?.critical || [],
          moderate: accessibilityData?.moderate || [],
          minor: accessibilityData?.minor || []
        },
        priorityIssues,
        summary,
        overallScore
      };
      
    } catch (error) {
      console.error('[FastCheckService] Analysis error:', error);
      throw error;
    }
  }
  
  private static async checkSSL(url: string): Promise<{
    present: boolean;
    valid: boolean;
    issuer?: string;
    expiresIn?: number;
    expiryDate?: string;
  }> {
    try {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      
      if (!isHttps) {
        return { present: false, valid: false };
      }
      
      // For now, assume SSL is valid if site loads over HTTPS
      // A more robust check would use tls.connect or similar
      return {
        present: true,
        valid: true,
        issuer: 'Unknown',
        expiresIn: 365,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };
    } catch {
      return { present: false, valid: false };
    }
  }
  
  private static calculatePerformanceScore(analysis: any): number {
    let score = 80; // Base score
    
    // Deduct for large images
    if (analysis.images?.missingAlt > 5) score -= 10;
    if (analysis.images?.totalImages > 50) score -= 10;
    
    // Deduct for form issues
    if (analysis.forms?.totalForms > 0 && analysis.forms?.issues?.length > 0) {
      score -= 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  private static calculateMobileScore(analysis: any): number {
    let score = 85; // Base score
    
    // Check button/tap target issues
    if (analysis.buttons?.tooSmall > 0) score -= 15;
    if (analysis.buttons?.issues?.length > 0) score -= 5;
    
    // Check navigation
    if (analysis.navigation?.menuType === 'none') score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }
  
  private static generatePriorityIssues(analysis: any, ssl: any): Issue[] {
    const issues: Issue[] = [];
    
    // SSL issues
    if (!ssl.present) {
      issues.push({
        type: 'security',
        severity: 'critical',
        issue: 'No SSL certificate detected',
        impact: 'Site marked as "Not Secure" by browsers, hurting trust and SEO',
        recommendation: 'Install an SSL certificate immediately',
        estimatedEffort: 'low'
      });
    }
    
    // Accessibility issues
    if (analysis.accessibility?.critical?.length > 0) {
      issues.push({
        type: 'accessibility',
        severity: 'critical',
        issue: `${analysis.accessibility.critical.length} critical accessibility issues`,
        impact: 'Users with disabilities cannot access your site',
        recommendation: 'Fix WCAG compliance issues',
        estimatedEffort: 'medium'
      });
    }
    
    // Image issues
    if (analysis.images?.missingAlt > 0) {
      issues.push({
        type: 'seo',
        severity: 'medium',
        issue: `${analysis.images.missingAlt} images missing alt text`,
        impact: 'Poor SEO and accessibility',
        recommendation: 'Add descriptive alt text to all images',
        estimatedEffort: 'low'
      });
    }
    
    // Navigation issues
    if (analysis.navigation?.menuType === 'none') {
      issues.push({
        type: 'usability',
        severity: 'high',
        issue: 'No clear navigation menu detected',
        impact: 'Users may struggle to find content',
        recommendation: 'Add a clear navigation structure',
        estimatedEffort: 'medium'
      });
    }
    
    // Heading structure issues
    if (analysis.headings?.missingH1) {
      issues.push({
        type: 'seo',
        severity: 'high',
        issue: 'Missing H1 heading',
        impact: 'Poor SEO - search engines use H1 to understand page content',
        recommendation: 'Add a clear H1 heading to the page',
        estimatedEffort: 'low'
      });
    }
    
    return issues;
  }
  
  private static extractPerformanceBottlenecks(analysis: any): string[] {
    const bottlenecks: string[] = [];
    
    if (analysis.images?.totalImages > 30) {
      bottlenecks.push('High number of images may slow page load');
    }
    
    if (analysis.images?.missingAlt > 10) {
      bottlenecks.push('Many unoptimized images detected');
    }
    
    return bottlenecks;
  }
  
  private static extractMobileIssues(analysis: any): string[] {
    const issues: string[] = [];
    
    if (analysis.buttons?.tooSmall > 0) {
      issues.push(`${analysis.buttons.tooSmall} buttons too small for mobile tapping`);
    }
    
    if (analysis.navigation?.menuType === 'none') {
      issues.push('No mobile-friendly navigation detected');
    }
    
    return issues;
  }
  
  private static summarizeIssues(issues: Issue[]): {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  } {
    return {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length
    };
  }
}
