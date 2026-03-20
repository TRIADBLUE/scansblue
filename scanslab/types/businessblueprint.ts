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
