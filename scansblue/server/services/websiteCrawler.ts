import pRetry from "p-retry";

export interface CrawlResult {
  url: string;
  title: string;
  status: number;
  accessibilityIssues: {
    missingAltText: number;
    missingAriaLabels: number;
    headingIssues: string[];
  };
  contentIssues: {
    brokenLinks: string[];
    missingImages: number;
    emptyHeadings: number;
  };
  seoIssues: {
    noMetaDescription: boolean;
    duplicateHeadings: boolean;
    missingH1: boolean;
  };
  performance: {
    largeImages: number;
    unoptimizedAssets: number;
  };
  metrics?: {
    buttonCount: number;
    formCount: number;
    imageCount: number;
    navItemCount: number;
    hasLogo: boolean;
    hasFavicon: boolean;
    h1Count: number;
  };
}

const API_KEY = process.env.BROWSERLESS_API_KEY;
const BROWSERLESS_URL = "https://production-sfo.browserless.io";

if (!API_KEY) {
  console.warn("Browserless API key not configured for website crawler");
}

export async function crawlWebsite(startUrl: string, maxPages: number = 50): Promise<{ pages: CrawlResult[]; allUrls: Set<string> }> {
  if (!API_KEY) {
    throw new Error("Browserless API key not configured");
  }

  // Ensure URL has protocol
  const finalUrl = startUrl.startsWith("http") ? startUrl : `https://${startUrl}`;

  // LIGHTWEIGHT discovery-only crawler to avoid timeouts
  const crawlCode = `
export default async function ({ page }) {
  const startUrl = '${finalUrl}';
  const maxPages = ${maxPages};
  const visitedUrls = new Set();
  const discoveredPages = [];
  const urlQueue = [startUrl];
  let baseUrl = null;

  // Simple discovery phase - just find pages, no analysis
  while (urlQueue.length > 0 && discoveredPages.length < maxPages) {
    const url = urlQueue.shift();
    
    if (visitedUrls.has(url)) continue;
    visitedUrls.add(url);

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const canonicalUrl = page.url();
      
      if (!baseUrl) {
        const urlObj = new URL(canonicalUrl);
        baseUrl = urlObj.hostname;
      }
      
      discoveredPages.push(canonicalUrl);

      // Quick link extraction - no analysis
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a[href]'))
          .map(el => el.getAttribute('href'))
          .filter(href => href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:'));
      });

      // Queue internal links - strict domain matching
      for (const link of links) {
        if (link && !visitedUrls.has(link) && discoveredPages.length < maxPages) {
          try {
            const linkUrl = new URL(link, canonicalUrl);
            // Strict: exact domain match, no subdomains unless base URL had subdomain
            const linkDomain = linkUrl.hostname.toLowerCase();
            const baseDomain = baseUrl.toLowerCase();
            if (linkDomain === baseDomain) {
              const linkString = linkUrl.toString().split('#')[0]; // Remove fragments
              if (!visitedUrls.has(linkString)) {
                urlQueue.push(linkString);
              }
            }
          } catch {}
        }
      }
    } catch (error) {
      // Silent fail - continue discovery
    }
  }

  // Return ONLY discovered pages - no analysis
  return { pages: discoveredPages };
}
`;

  // Call Browserless to discover pages
  const response = await pRetry(
    async () => {
      const res = await fetch(BROWSERLESS_URL + "/function?token=" + API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/javascript" },
        body: crawlCode,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Browserless error: ${res.status} ${text.substring(0, 100)}`);
      }

      return res.json();
    },
    { retries: 2, minTimeout: 1000, maxTimeout: 5000 }
  );

  let discoveredPages: string[] = response.pages || [];
  
  // Filter to only same-domain pages (catch OAuth redirects and external links)
  if (discoveredPages.length > 0) {
    try {
      const baseUrlObj = new URL(finalUrl);
      const baseDomain = baseUrlObj.hostname.toLowerCase();
      discoveredPages = discoveredPages.filter(pageUrl => {
        try {
          const urlObj = new URL(pageUrl);
          return urlObj.hostname.toLowerCase() === baseDomain;
        } catch {
          return false;
        }
      });
    } catch {}
  }

  // Now analyze each discovered page separately to avoid timeouts
  const results: CrawlResult[] = [];
  
  for (const pageUrl of discoveredPages) {
    try {
      const result = await analyzePageQuick(pageUrl);
      results.push(result);
    } catch (error) {
      // Continue with other pages
    }
  }

  return { 
    pages: results.length > 0 ? results : discoveredPages.map(url => ({
      url,
      title: url,
      status: 200,
      accessibilityIssues: { missingAltText: 0, missingAriaLabels: 0, headingIssues: [] },
      contentIssues: { brokenLinks: [], missingImages: 0, emptyHeadings: 0 },
      seoIssues: { noMetaDescription: false, duplicateHeadings: false, missingH1: false },
      performance: { largeImages: 0, unoptimizedAssets: 0 },
    })),
    allUrls: new Set(discoveredPages)
  };
}

async function analyzePageQuick(pageUrl: string): Promise<CrawlResult> {
  const analyzeCode = `
export default async function ({ page }) {
  await page.goto('${pageUrl}', { waitUntil: 'domcontentloaded', timeout: 10000 });
  
  // Wait for content to render
  await page.evaluate(() => new Promise(r => setTimeout(r, 500)));
  
  const title = await page.title();
  
  // Count images and check alt text
  const images = await page.$$('img');
  let imageCount = images.length;
  let missingAltText = 0;
  for (const img of images) {
    const alt = await img.evaluate(el => el.getAttribute('alt'));
    if (!alt || alt.trim() === '') missingAltText++;
  }
  
  // Count buttons and interactive elements
  const buttons = await page.$$('button, [role="button"], input[type="submit"], input[type="button"], a.btn, a.button');
  const buttonCount = buttons.length;
  
  // Count forms
  const forms = await page.$$('form');
  const formCount = forms.length;
  
  // Count navigation items
  const navItems = await page.$$('nav a, header a, [role="navigation"] a');
  const navItemCount = navItems.length;
  
  // Check for logo
  const logoElements = await page.$$('img[class*="logo"], img[alt*="logo"], img[src*="logo"], [class*="logo"] img, a[class*="logo"] img');
  const hasLogo = logoElements.length > 0;
  
  // Check for favicon
  const favicon = await page.$('link[rel="icon"], link[rel="shortcut icon"]');
  const hasFavicon = favicon !== null;
  
  // Count headings
  const h1s = await page.$$('h1');
  const h1Count = h1s.length;
  
  // Check meta description
  const metaDesc = await page.$eval('meta[name="description"]', el => el?.getAttribute('content') || null).catch(() => null);
  
  // Check for missing ARIA labels on interactive elements
  const interactives = await page.$$('button:not([aria-label]), [role="button"]:not([aria-label])');
  const missingAriaLabels = interactives.length;
  
  return {
    title,
    imageCount,
    missingAltText,
    buttonCount,
    formCount,
    navItemCount,
    hasLogo,
    hasFavicon,
    h1Count,
    hasMetaDescription: !!metaDesc,
    missingAriaLabels
  };
}
`;

  try {
    const response = await fetch(BROWSERLESS_URL + "/function?token=" + API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/javascript" },
      body: analyzeCode,
      signal: AbortSignal.timeout(20000),
    });

    const data = await response.json();
    
    return {
      url: pageUrl,
      title: data.title || pageUrl,
      status: 200,
      accessibilityIssues: {
        missingAltText: data.missingAltText || 0,
        missingAriaLabels: data.missingAriaLabels || 0,
        headingIssues: []
      },
      contentIssues: {
        brokenLinks: [],
        missingImages: 0,
        emptyHeadings: 0
      },
      seoIssues: {
        noMetaDescription: !data.hasMetaDescription,
        duplicateHeadings: false,
        missingH1: data.h1Count === 0
      },
      performance: {
        largeImages: 0,
        unoptimizedAssets: 0
      },
      metrics: {
        buttonCount: data.buttonCount || 0,
        formCount: data.formCount || 0,
        imageCount: data.imageCount || 0,
        navItemCount: data.navItemCount || 0,
        hasLogo: data.hasLogo || false,
        hasFavicon: data.hasFavicon || false,
        h1Count: data.h1Count || 0
      }
    };
  } catch (error) {
    return {
      url: pageUrl,
      title: pageUrl,
      status: 200,
      accessibilityIssues: { missingAltText: 0, missingAriaLabels: 0, headingIssues: [] },
      contentIssues: { brokenLinks: [], missingImages: 0, emptyHeadings: 0 },
      seoIssues: { noMetaDescription: false, duplicateHeadings: false, missingH1: false },
      performance: { largeImages: 0, unoptimizedAssets: 0 },
      metrics: {
        buttonCount: 0,
        formCount: 0,
        imageCount: 0,
        navItemCount: 0,
        hasLogo: false,
        hasFavicon: false,
        h1Count: 0
      }
    };
  }
}
