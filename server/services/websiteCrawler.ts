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

  // Send the entire crawl logic to Browserless as a function
  const crawlCode = `
export default async function ({ page }) {
  const startUrl = '${finalUrl}';
  const maxPages = ${maxPages};
  const visitedUrls = new Set();
  const pagesToAnalyze = [];
  const urlQueue = [startUrl];
  let baseUrl = null;

  // Crawl phase: discover pages
  while (urlQueue.length > 0 && pagesToAnalyze.length < maxPages) {
    const url = urlQueue.shift();
    
    if (visitedUrls.has(url)) continue;
    visitedUrls.add(url);

    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      const canonicalUrl = page.url();
      
      if (!baseUrl) {
        const urlObj = new URL(canonicalUrl);
        baseUrl = urlObj.hostname;
      }
      
      pagesToAnalyze.push(canonicalUrl);

      // Extract links
      const links = await page.$$eval("a[href]", (elements) =>
        elements
          .map((el) => el.getAttribute("href"))
          .filter((href) =>
            href &&
            !href.startsWith("#") &&
            !href.startsWith("javascript:") &&
            !href.startsWith("mailto:") &&
            !href.startsWith("tel:")
          )
      );

      // Add internal links to queue
      for (const link of links) {
        if (link && !visitedUrls.has(link)) {
          try {
            const linkUrl = new URL(link, canonicalUrl);
            if (baseUrl && linkUrl.hostname === baseUrl && pagesToAnalyze.length < maxPages) {
              const linkString = linkUrl.toString();
              if (!visitedUrls.has(linkString)) {
                urlQueue.push(linkString);
              }
            }
          } catch {
            // Skip invalid URLs
          }
        }
      }
    } catch (error) {
      console.warn(\`Failed to crawl \${url}: \${error.message}\`);
    }
  }

  // Analysis phase: analyze each discovered page
  const results = [];
  for (const pageUrl of pagesToAnalyze) {
    try {
      await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      const title = await page.title();

      // Accessibility analysis
      const accessibilityIssues = await page.evaluate(() => {
        const images = document.querySelectorAll("img");
        let missingAltText = 0;
        images.forEach((img) => {
          if (!img.getAttribute("alt") || img.getAttribute("alt")?.trim() === "") {
            missingAltText++;
          }
        });

        const interactiveElements = document.querySelectorAll("button, a, [role='button']");
        let missingAriaLabels = 0;
        interactiveElements.forEach((el) => {
          if (!el.textContent?.trim() && !el.getAttribute("aria-label")) {
            missingAriaLabels++;
          }
        });

        const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        const headingIssues = [];
        let lastHeadingLevel = 0;
        let h1Count = 0;

        headings.forEach((heading) => {
          const level = parseInt(heading.tagName[1]);
          if (!heading.textContent?.trim()) {
            headingIssues.push(\`Empty \${heading.tagName}\`);
          }
          if (heading.tagName === "H1") h1Count++;
          if (level - lastHeadingLevel > 1 && lastHeadingLevel > 0) {
            headingIssues.push(\`Skipped heading level from H\${lastHeadingLevel} to H\${level}\`);
          }
          lastHeadingLevel = level;
        });

        if (h1Count !== 1) {
          headingIssues.push(\`Expected 1 H1, found \${h1Count}\`);
        }

        return { missingAltText, missingAriaLabels, headingIssues };
      });

      // Content analysis
      const contentIssues = await page.evaluate(() => {
        const links = document.querySelectorAll("a[href]");
        const brokenLinks = [];

        links.forEach((link) => {
          const href = link.getAttribute("href");
          if (href && href.startsWith("/") && !href.includes(".")) {
            if (href.includes("404") || href.includes("null") || href === "/") {
              brokenLinks.push(href);
            }
          }
        });

        let missingImages = 0;
        const imgs = document.querySelectorAll("img");
        imgs.forEach((img) => {
          if (!img.src || img.src.includes("placeholder") || img.src.includes("404")) {
            missingImages++;
          }
        });

        let emptyHeadings = 0;
        document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((h) => {
          if (!h.textContent?.trim()) emptyHeadings++;
        });

        return { brokenLinks: [...new Set(brokenLinks)], missingImages, emptyHeadings };
      });

      // SEO analysis
      const seoIssues = await page.evaluate(() => {
        const metaDescription = document.querySelector('meta[name="description"]');
        const h1Elements = document.querySelectorAll("h1");

        return {
          noMetaDescription: !metaDescription || !metaDescription.getAttribute("content"),
          duplicateHeadings: Array.from(h1Elements).length > 1,
          missingH1: h1Elements.length === 0,
        };
      });

      // Performance heuristics
      const performance = await page.evaluate(() => {
        let largeImages = 0;
        let unoptimizedAssets = 0;

        document.querySelectorAll("img").forEach((img) => {
          if (img.naturalWidth && img.width && img.naturalWidth > img.width * 2) {
            unoptimizedAssets++;
          }
        });

        return { largeImages, unoptimizedAssets };
      });

      results.push({
        url: pageUrl,
        title,
        status: 200,
        accessibilityIssues,
        contentIssues,
        seoIssues,
        performance,
      });
    } catch (error) {
      results.push({
        url: pageUrl,
        title: "Error",
        status: 500,
        accessibilityIssues: { missingAltText: 0, missingAriaLabels: 0, headingIssues: [error.message] },
        contentIssues: { brokenLinks: [], missingImages: 0, emptyHeadings: 0 },
        seoIssues: { noMetaDescription: false, duplicateHeadings: false, missingH1: false },
        performance: { largeImages: 0, unoptimizedAssets: 0 },
      });
    }
  }

  return {
    pages: results,
    allUrls: Array.from(visitedUrls),
    type: "application/json"
  };
}
  `;

  try {
    const response = await pRetry(
      async () => {
        const res = await fetch(`${BROWSERLESS_URL}/function?token=${API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/javascript" },
          body: crawlCode,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Browserless error: ${res.status} - ${text}`);
        }

        return res;
      },
      { retries: 2, minTimeout: 1000 }
    );

    const result = await response.json();
    const crawlData = result.data || result;

    return {
      pages: crawlData.pages,
      allUrls: new Set(crawlData.allUrls || []),
    };
  } catch (error: any) {
    console.error("Website crawling error:", error);
    throw new Error(`Failed to crawl website: ${error.message}`);
  }
}
