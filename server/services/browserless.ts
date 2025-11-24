import pRetry from "p-retry";
import type {
  ButtonAnalysis,
  LogoAnalysis,
  FaviconAnalysis,
  NavigationAnalysis,
  ComparisonResult,
  AccessibilityAnalysis,
} from "@shared/schema";

const BROWSERLESS_URL = "https://production-sfo.browserless.io";
const API_KEY = process.env.BROWSERLESS_API_KEY;

if (!API_KEY) {
  console.warn("BROWSERLESS_API_KEY not set. Browser automation will be unavailable.");
}

async function runScript(
  url: string,
  script: string
): Promise<{ data: any; screenshot: string }> {
  if (!API_KEY) {
    throw new Error("Browserless API key not configured");
  }

  const finalUrl = url.startsWith("http") ? url : `https://${url}`;

  return pRetry(
    async () => {
      const response = await fetch(`${BROWSERLESS_URL}/chromium/evaluate?token=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: finalUrl,
          code: `
            (async () => {
              const result = ${script};
              return result;
            })();
          `,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Browserless error: ${response.status} ${error}`);
      }

      const body = await response.json();
      
      // Extract result and screenshot
      const data = body.result || body;
      const screenshot = body.screenshot || "";

      return { data, screenshot };
    },
    { retries: 2, minTimeout: 1000 }
  );
}

export async function countButtons(url: string): Promise<ButtonAnalysis> {
  const script = `
    await page.goto('${url.startsWith("http") ? url : `https://${url}`}', { waitUntil: 'networkidle' });
    const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"]'));
    const breakdown = {};
    buttons.forEach((btn) => {
      let location = "unknown";
      if (btn.closest("header, [role='banner']")) location = "header";
      else if (btn.closest("nav, [role='navigation']")) location = "navigation";
      else if (btn.closest("footer")) location = "footer";
      else if (btn.closest("main, [role='main']")) location = "main content";
      else if (btn.closest("aside, [role='complementary']")) location = "sidebar";
      else if (btn.closest("form")) location = "form";
      breakdown[location] = (breakdown[location] || 0) + 1;
    });
    const screenshot = await page.screenshot({ type: 'png', encoding: 'base64' });
    ({
      total: buttons.length,
      breakdown: Object.entries(breakdown).map(([location, count]) => ({ location, count })),
      screenshot
    })
  `;

  const result = await runScript(url, script);
  return { ...result.data, screenshot: result.screenshot };
}

export async function findLogos(url: string): Promise<LogoAnalysis> {
  const script = `
    await page.goto('${url.startsWith("http") ? url : `https://${url}`}', { waitUntil: 'networkidle' });
    const images = Array.from(document.querySelectorAll('img'));
    const logos = images
      .filter((img) => {
        const src = img.src.toLowerCase();
        const alt = img.alt.toLowerCase();
        const className = img.className.toLowerCase();
        return src.includes('logo') || alt.includes('logo') || className.includes('logo');
      })
      .map((img) => {
        const rect = img.getBoundingClientRect();
        let location = "unknown";
        if (img.closest("header, [role='banner']")) location = "header";
        else if (img.closest("nav")) location = "navigation";
        else if (img.closest("footer")) location = "footer";
        return {
          src: img.src,
          alt: img.alt || "",
          width: rect.width,
          height: rect.height,
          location,
        };
      });
    const screenshot = await page.screenshot({ type: 'png', encoding: 'base64' });
    ({ found: logos.length > 0, logos, screenshot })
  `;

  const result = await runScript(url, script);
  return { ...result.data, screenshot: result.screenshot };
}

export async function findFavicon(url: string): Promise<FaviconAnalysis> {
  const script = `
    await page.goto('${url.startsWith("http") ? url : `https://${url}`}', { waitUntil: 'networkidle' });
    const link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    let result;
    if (link) {
      result = {
        found: true,
        href: link.href,
        type: link.type,
        message: \`Favicon found: \${link.href}\`
      };
    } else {
      result = { found: false, message: "No favicon found in page header" };
    }
    const screenshot = await page.screenshot({ type: 'png', encoding: 'base64' });
    ({ ...result, screenshot })
  `;

  const result = await runScript(url, script);
  return { ...result.data, screenshot: result.screenshot };
}

export async function analyzeNavigation(url: string): Promise<NavigationAnalysis> {
  const script = `
    await page.goto('${url.startsWith("http") ? url : `https://${url}`}', { waitUntil: 'networkidle' });
    const navItems = [];
    const selectors = ['nav a', '[role="navigation"] a', 'header a[href]', '.navbar a[href]'];
    const seenHrefs = new Set();
    
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '#' && !seenHrefs.has(href)) {
          seenHrefs.add(href);
          navItems.push({
            label: link.textContent?.trim() || link.getAttribute('aria-label') || 'Unlabeled',
            href: href
          });
        }
      });
    });
    
    const screenshot = await page.screenshot({ type: 'png', encoding: 'base64' });
    ({
      menuItems: navItems.length,
      structure: navItems.slice(0, 20),
      screenshot
    })
  `;

  const result = await runScript(url, script);
  return { ...result.data, screenshot: result.screenshot };
}

export async function analyzeAccessibility(url: string): Promise<AccessibilityAnalysis> {
  const script = `
    await page.goto('${url.startsWith("http") ? url : `https://${url}`}', { waitUntil: 'networkidle' });
    const images = Array.from(document.querySelectorAll('img'));
    const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    
    const withAria = buttons.filter(b => b.getAttribute('aria-label') || b.getAttribute('aria-labelledby')).length;
    const withAlt = images.filter(img => img.alt && img.alt.trim()).length;
    
    let headingIssues = [];
    const h1s = headings.filter(h => h.tagName === 'H1').length;
    if (h1s === 0) headingIssues.push('Missing H1 tag');
    if (h1s > 1) headingIssues.push('Multiple H1 tags found');
    
    const headingLevels = headings.map(h => parseInt(h.tagName[1])).sort();
    for (let i = 0; i < headingLevels.length - 1; i++) {
      if (headingLevels[i + 1] - headingLevels[i] > 1) {
        headingIssues.push(\`Heading level jumped from H\${headingLevels[i]} to H\${headingLevels[i + 1]}\`);
        break;
      }
    }
    
    const screenshot = await page.screenshot({ type: 'png', encoding: 'base64' });
    ({
      ariaLabels: {
        total: buttons.length,
        missing: buttons.length - withAria,
        coverage: buttons.length > 0 ? Math.round((withAria / buttons.length) * 100) : 100
      },
      altText: {
        totalImages: images.length,
        withAlt: withAlt,
        coverage: images.length > 0 ? Math.round((withAlt / images.length) * 100) : 100
      },
      headingStructure: {
        valid: headingIssues.length === 0,
        issues: headingIssues
      },
      screenshot
    })
  `;

  const result = await runScript(url, script);
  return { ...result.data, screenshot: result.screenshot };
}

export async function compareEnvironments(
  devUrl: string,
  prodUrl: string,
  analysisType: "buttons" | "logos" | "favicon" | "navigation"
): Promise<ComparisonResult> {
  let devFn: () => Promise<any>, prodFn: () => Promise<any>;

  switch (analysisType) {
    case "buttons":
      devFn = () => countButtons(devUrl);
      prodFn = () => countButtons(prodUrl);
      break;
    case "logos":
      devFn = () => findLogos(devUrl);
      prodFn = () => findLogos(prodUrl);
      break;
    case "favicon":
      devFn = () => findFavicon(devUrl);
      prodFn = () => findFavicon(prodUrl);
      break;
    case "navigation":
      devFn = () => analyzeNavigation(devUrl);
      prodFn = () => analyzeNavigation(prodUrl);
      break;
  }

  const [devResult, prodResult] = await Promise.all([devFn(), prodFn()]);

  const differences: string[] = [];
  if (JSON.stringify(devResult) !== JSON.stringify(prodResult)) {
    if (analysisType === "buttons" && (devResult as ButtonAnalysis).total !== (prodResult as ButtonAnalysis).total) {
      differences.push(`Button count differs: dev has ${(devResult as ButtonAnalysis).total}, prod has ${(prodResult as ButtonAnalysis).total}`);
    } else if (analysisType === "logos" && (devResult as LogoAnalysis).logos?.length !== (prodResult as LogoAnalysis).logos?.length) {
      differences.push(`Logo count differs: dev has ${(devResult as LogoAnalysis).logos?.length}, prod has ${(prodResult as LogoAnalysis).logos?.length}`);
    } else if (analysisType === "navigation" && (devResult as NavigationAnalysis).menuItems !== (prodResult as NavigationAnalysis).menuItems) {
      differences.push(`Navigation items differ: dev has ${(devResult as NavigationAnalysis).menuItems}, prod has ${(prodResult as NavigationAnalysis).menuItems}`);
    } else {
      differences.push("Analysis results differ between environments");
    }
  }

  return {
    devResult,
    prodResult,
    differences,
    devScreenshot: devResult.screenshot,
    prodScreenshot: prodResult.screenshot,
  };
}
