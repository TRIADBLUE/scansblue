import { getBrowser, navigateToUrl } from "./playwright";
import type { Page } from "playwright";

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

export async function crawlWebsite(startUrl: string, maxPages: number = 10): Promise<{ pages: CrawlResult[]; allUrls: Set<string> }> {
  const browser = await getBrowser();
  const visitedUrls = new Set<string>();
  const pagesToAnalyze: string[] = [];
  const urlQueue: string[] = [startUrl];
  let baseUrl: URL | null = null;

  try {
    // Crawl to discover pages (limited breadth-first search)
    while (urlQueue.length > 0 && pagesToAnalyze.length < maxPages) {
      const url = urlQueue.shift()!;

      if (visitedUrls.has(url)) continue;
      visitedUrls.add(url);

      try {
        const page = await browser.newPage();
        const canonicalUrl = await navigateToUrl(page, url);
        
        // On first navigation, set baseUrl to the canonical URL (handles vanity domain redirects)
        if (!baseUrl) {
          baseUrl = new URL(canonicalUrl);
        }
        
        pagesToAnalyze.push(canonicalUrl);

        // Extract links for next pages
        const links = await page.$$eval("a[href]", (elements: any[]) =>
          elements
            .map((el) => el.getAttribute("href"))
            .filter(
              (href) =>
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
              // Only follow internal links (use canonical baseUrl from first navigation)
              if (baseUrl && linkUrl.hostname === baseUrl.hostname && pagesToAnalyze.length < maxPages) {
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

        await page.close();
      } catch (error) {
        console.warn(`Failed to crawl ${url}:`, error);
      }
    }

    // Analyze each discovered page
    const results: CrawlResult[] = [];
    for (const pageUrl of pagesToAnalyze) {
      const result = await analyzePage(browser, pageUrl);
      results.push(result);
    }

    return { pages: results, allUrls: visitedUrls };
  } catch (error) {
    console.error("Website crawling error:", error);
    throw error;
  }
}

async function analyzePage(browser: any, url: string): Promise<CrawlResult> {
  const page = await browser.newPage();

  try {
    const canonicalUrl = await navigateToUrl(page, url);

    // Get page title
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

      const elementsWithAriaLabel = document.querySelectorAll("[aria-label]");
      const interactiveElements = document.querySelectorAll("button, a, [role='button']");
      let missingAriaLabels = 0;
      interactiveElements.forEach((el) => {
        if (!el.textContent?.trim() && !el.getAttribute("aria-label")) {
          missingAriaLabels++;
        }
      });

      const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const headingIssues: string[] = [];
      let lastHeadingLevel = 0;
      let h1Count = 0;

      headings.forEach((heading) => {
        const level = parseInt(heading.tagName[1]);
        if (!heading.textContent?.trim()) {
          headingIssues.push(`Empty ${heading.tagName}`);
        }
        if (heading.tagName === "H1") h1Count++;
        if (level - lastHeadingLevel > 1 && lastHeadingLevel > 0) {
          headingIssues.push(`Skipped heading level from H${lastHeadingLevel} to H${level}`);
        }
        lastHeadingLevel = level;
      });

      if (h1Count !== 1) {
        headingIssues.push(`Expected 1 H1, found ${h1Count}`);
      }

      return { missingAltText, missingAriaLabels, headingIssues };
    });

    // Content analysis
    const contentIssues = await page.evaluate(() => {
      const links = document.querySelectorAll("a[href]");
      const brokenLinks: string[] = [];

      links.forEach((link) => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("/") && !href.includes(".")) {
          // Check if internal link looks broken (very basic check)
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
        // Check for width/height mismatches (unoptimized)
        if (img.naturalWidth && img.width && img.naturalWidth > img.width * 2) {
          unoptimizedAssets++;
        }
      });

      return { largeImages, unoptimizedAssets };
    });

    return {
      url: canonicalUrl,
      title,
      status: 200,
      accessibilityIssues,
      contentIssues,
      seoIssues,
      performance,
    };
  } catch (error: any) {
    return {
      url: url,
      title: "Error",
      status: error.message?.includes("timeout") ? 504 : 500,
      accessibilityIssues: { missingAltText: 0, missingAriaLabels: 0, headingIssues: [error.message] },
      contentIssues: { brokenLinks: [], missingImages: 0, emptyHeadings: 0 },
      seoIssues: { noMetaDescription: false, duplicateHeadings: false, missingH1: false },
      performance: { largeImages: 0, unoptimizedAssets: 0 },
    };
  } finally {
    await page.close();
  }
}
