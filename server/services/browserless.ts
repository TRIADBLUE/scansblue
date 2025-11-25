import pRetry from "p-retry";
import pLimit from "p-limit";
import type {
  ButtonAnalysis,
  LogoAnalysis,
  FaviconAnalysis,
  NavigationAnalysis,
  ComparisonResult,
  AccessibilityAnalysis,
  FormsAnalysis,
  ImagesAnalysis,
  HeadingStructure,
} from "@shared/schema";

const BROWSERLESS_URL = "https://production-sfo.browserless.io";
const API_KEY = process.env.BROWSERLESS_API_KEY;

if (!API_KEY) {
  console.warn("BROWSERLESS_API_KEY not set. Browser automation will be unavailable.");
}

async function runScript(
  url: string,
  scriptCode: string
): Promise<{ data: any; screenshot: string }> {
  if (!API_KEY) {
    throw new Error("Browserless API key not configured");
  }

  const finalUrl = url.startsWith("http") ? url : `https://${url}`;

  return pRetry(
    async () => {
      const code = "export default async function ({ page }) {\n" +
        "  await page.goto('" + finalUrl + "', { waitUntil: 'networkidle2', timeout: 30000 });\n" +
        "  \n" +
        "  try {\n" +
        "    await page.evaluate(() => {\n" +
        "      return new Promise((resolve) => {\n" +
        "        if (document.readyState === 'complete') {\n" +
        "          setTimeout(resolve, 500);\n" +
        "        } else {\n" +
        "          document.addEventListener('load', () => setTimeout(resolve, 500));\n" +
        "        }\n" +
        "      });\n" +
        "    });\n" +
        "  } catch (e) {}\n" +
        "  \n" +
        "  try {\n" +
        "    await page.evaluate(() => {\n" +
        "      return new Promise((resolve) => {\n" +
        "        const root = document.querySelector('[data-reactroot], [data-react-root], #__next, #root, [ng-app], [data-app], .vue-app');\n" +
        "        if (root && root.children.length === 0) {\n" +
        "          setTimeout(resolve, 1500);\n" +
        "        } else {\n" +
        "          resolve();\n" +
        "        }\n" +
        "      });\n" +
        "    });\n" +
        "  } catch (e) {}\n" +
        "  \n" +
        "  const result = " + scriptCode + ";\n" +
        "  \n" +
        "  const screenshot = await page.screenshot({ type: 'png', encoding: 'base64' });\n" +
        "  \n" +
        "  return {\n" +
        "    data: { ...result, screenshot },\n" +
        "    type: \"application/json\"\n" +
        "  };\n" +
        "}";

      const response = await fetch(BROWSERLESS_URL + "/function?token=" + API_KEY, {
        method: "POST",
        headers: { "Content-Type": "application/javascript" },
        body: code,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Browserless error: ${response.status} ${error}`);
      }

      const body = await response.json();
      return body.data || body;
    },
    { retries: 2, minTimeout: 1000 }
  );
}

export async function countButtons(url: string): Promise<ButtonAnalysis> {
  const script = `
    (() => {
      const collectButtons = () => {
        const items = [];
        const seen = new WeakSet();
        const debug = [];
        
        // Helper to check if element is interactive
        const isInteractive = (el) => {
          const tag = el.tagName.toLowerCase();
          if (['button', 'a', 'input'].includes(tag)) return true;
          if (el.onclick || el.getAttribute('onclick')) return true;
          if (el.getAttribute('role') === 'button') return true;
          const style = window.getComputedStyle(el);
          if (style.cursor === 'pointer') return true;
          return false;
        };
        
        // Helper to add unique buttons
        const add = (el) => {
          if (!el || seen.has(el)) return;
          const txt = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim();
          if (!txt || txt.length === 0) return;
          if (txt.length > 150) return; // Skip too-long text
          
          seen.add(el);
          const style = window.getComputedStyle(el);
          items.push({ 
            text: txt.substring(0, 80), 
            tag: el.tagName, 
            className: el.className,
            cursor: style.cursor
          });
        };
        
        // Count basic elements
        debug.push('total buttons: ' + document.querySelectorAll('button').length);
        debug.push('total links: ' + document.querySelectorAll('a').length);
        debug.push('total inputs: ' + document.querySelectorAll('input[type=button], input[type=submit]').length);
        debug.push('role=button elements: ' + document.querySelectorAll('[role=button]').length);
        
        // Collect all button tags
        try { document.querySelectorAll('button').forEach(add); } catch (e) { debug.push('button error: ' + e); }
        
        // Collect input buttons and submits
        try { document.querySelectorAll('input[type=button], input[type=submit]').forEach(add); } catch (e) {}
        
        // Collect role=button elements
        try { document.querySelectorAll('[role=button]').forEach(add); } catch (e) {}
        
        // Collect styled links that look like buttons (have padding, rounded corners, background)
        try {
          document.querySelectorAll('a').forEach(el => {
            const style = window.getComputedStyle(el);
            const hasBg = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
            const hasBorder = style.borderWidth !== '0px' || style.borderStyle !== 'none';
            const isPadded = parseInt(style.paddingTop) > 2 || parseInt(style.paddingLeft) > 2;
            if (hasBg || hasBorder || isPadded) add(el);
          });
        } catch (e) {}
        
        // Collect divs with onclick or role=button
        try {
          document.querySelectorAll('div[onclick], div[role=button], span[onclick], span[role=button]').forEach(add);
        } catch (e) {}
        
        // Look for common button patterns by class names
        try {
          const buttonSelectors = [
            '[class*="btn"]',
            '[class*="button"]',
            '[class*="action"]',
            '[class*="cta"]',
            '[class*="primary"]',
            '[class*="secondary"]',
            '[data-test*="button"]',
            '[data-testid*="button"]'
          ];
          buttonSelectors.forEach(sel => {
            try {
              document.querySelectorAll(sel).forEach(el => {
                if (el.offsetHeight > 15 && el.offsetWidth > 20) {
                  add(el);
                }
              });
            } catch (e) {}
          });
        } catch (e) {}
        
        // Find all clickable elements (not just cursor:pointer, also check for data attributes, event listeners)
        try {
          const walkDOM = (node, depth = 0) => {
            if (depth > 50 || items.length > 300) return;
            if (!node || !node.nodeType) return;
            
            if (node.nodeType === 1) { // Element node
              if (!seen.has(node)) {
                const style = window.getComputedStyle(node);
                const txt = node.textContent?.trim() || node.getAttribute('aria-label')?.trim() || '';
                
                // Check for many interactive indicators
                if (txt && txt.length > 0 && txt.length < 150) {
                  const isClickable = 
                    node.onclick ||
                    node.getAttribute('onclick') ||
                    style.cursor === 'pointer' ||
                    node.hasAttribute('data-test') ||
                    node.hasAttribute('data-testid') ||
                    node.hasAttribute('href') ||
                    (style.display !== 'none' && style.visibility !== 'hidden' && parseInt(style.opacity) > 0);
                  
                  if (isClickable && node.offsetHeight > 10 && node.offsetWidth > 15) {
                    add(node);
                  }
                }
              }
              
              for (let child of node.childNodes) {
                walkDOM(child, depth + 1);
              }
            }
          };
          walkDOM(document.body);
        } catch (e) {}
        
        return { items, debug };
      };
      
      try {
        const result = collectButtons();
        return { total: result.items.length, buttons: result.items, debug: result.debug };
      } catch (e) {
        return { total: 0, buttons: [], error: String(e), debug: ['exception: ' + String(e)] };
      }
    })()
  `;

  const result = await runScript(url, script);
  const data = result.data || result;
  console.log('[DEBUG] Button analysis for', url, ':', JSON.stringify(data.debug || 'No debug info', null, 2));
  return {
    total: data.total || 0,
    buttons: (data.buttons || []).map((b: any) => ({
      text: b.text || b.tagName || 'Unlabeled',
      link: b.link,
      location: 'unknown',
      state: 'enabled',
      styling: ''
    })),
    screenshot: result.screenshot
  };
}

export async function findLogos(url: string): Promise<LogoAnalysis> {
  const script = `(() => {
  const images = Array.from(document.querySelectorAll('img'));
  const logos = images
    .filter((img) => {
      const src = img.src.toLowerCase();
      const alt = img.alt.toLowerCase();
      const className = img.className.toLowerCase();
      const id = (img.id || '').toLowerCase();
      return src.includes('logo') || alt.includes('logo') || className.includes('logo') || id.includes('logo');
    })
    .map((img) => {
      let location = "unknown";
      if (img.closest("header, [role='banner']")) location = "header";
      else if (img.closest("nav")) location = "navigation";
      else if (img.closest("footer")) location = "footer";
      else if (img.closest("main, [role='main']")) location = "main content";
      
      return {
        src: img.src,
        alt: img.alt || "",
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        location,
        className: img.className
      };
    });
  return {
    found: logos.length > 0,
    logos
  };
})()`;

  const result = await runScript(url, script);
  return (result.data || result) as unknown as LogoAnalysis;
}

export async function findFavicon(url: string): Promise<FaviconAnalysis> {
  const script = `
    (() => {
      const link = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
      if (link) {
        return {
          found: true,
          href: link.href,
          type: link.type,
          message: \`Favicon found: \${link.href}\`
        };
      } else {
        return {
          found: false,
          message: "No favicon found in page header"
        };
      }
    })()
  `;

  const result = await runScript(url, script);
  return (result.data || result) as unknown as FaviconAnalysis;
}

export async function analyzeNavigation(url: string): Promise<NavigationAnalysis> {
  const script = `
    (() => {
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
              href: href,
              children: []
            });
          }
        });
      });
      
      return {
        menuItems: navItems.length,
        structure: navItems.slice(0, 50)
      };
    })()
  `;

  const result = await runScript(url, script);
  return (result.data || result) as unknown as NavigationAnalysis;
}

export async function analyzeForms(url: string): Promise<FormsAnalysis> {
  const script = `(() => {
  const forms = Array.from(document.querySelectorAll('form'));
  const formsList = forms.map((form) => {
    const inputs = Array.from(form.querySelectorAll('input, textarea, select'));
    const fields = inputs.map((input) => {
      const label = form.querySelector('label[for="' + input.id + '"]')?.textContent?.trim();
      return {
        name: input.name,
        type: input.type || input.tagName.toLowerCase(),
        required: input.required || input.getAttribute('required') === 'required',
        label: label
      };
    });
    
    return {
      id: form.id,
      name: form.name,
      method: (form.method || 'GET').toUpperCase(),
      action: form.action,
      fields
    };
  });
  
  return {
    totalForms: forms.length,
    forms: formsList
  };
})()`;

  const result = await runScript(url, script);
  return (result.data || result) as unknown as FormsAnalysis;
}

export async function analyzeImages(url: string): Promise<ImagesAnalysis> {
  const script = `
    (() => {
      const images = Array.from(document.querySelectorAll('img'));
      const imagesList = images.map((img) => {
        let location = "unknown";
        if (img.closest("header, [role='banner']")) location = "header";
        else if (img.closest("nav")) location = "navigation";
        else if (img.closest("footer")) location = "footer";
        else if (img.closest("main, [role='main']")) location = "main content";
        
        return {
          src: img.src,
          alt: img.alt || "",
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
          location
        };
      });
      
      const withAlt = imagesList.filter(img => img.alt.trim()).length;
      
      return {
        totalImages: images.length,
        images: imagesList,
        missingAlt: images.length - withAlt,
        altCoverage: images.length > 0 ? Math.round((withAlt / images.length) * 100) : 100
      };
    })()
  `;

  const result = await runScript(url, script);
  return (result.data || result) as unknown as ImagesAnalysis;
}

export async function analyzeHeadings(url: string): Promise<HeadingStructure> {
  const script = `
    (() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const headingsList = headings.map((h) => ({
        level: parseInt(h.tagName[1]),
        text: h.textContent?.trim() || "",
        id: h.id
      }));
      
      const h1s = headingsList.filter(h => h.level === 1).length;
      const issues = [];
      
      if (h1s === 0) issues.push('Missing H1 tag');
      if (h1s > 1) issues.push('Multiple H1 tags found');
      
      const levels = headingsList.map(h => h.level).sort();
      for (let i = 0; i < levels.length - 1; i++) {
        if (levels[i + 1] - levels[i] > 1) {
          issues.push(\`Heading level jumped from H\${levels[i]} to H\${levels[i + 1]}\`);
          break;
        }
      }
      
      return {
        headings: headingsList,
        issues,
        h1Count: h1s,
        isValid: issues.length === 0
      };
    })()
  `;

  const result = await runScript(url, script);
  return (result.data || result) as unknown as HeadingStructure;
}

export async function analyzeAccessibility(url: string): Promise<AccessibilityAnalysis> {
  const script = `
    (() => {
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
      
      return {
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
        }
      };
    })()
  `;

  const result = await runScript(url, script);
  return (result.data || result) as unknown as AccessibilityAnalysis;
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

  // Extract screenshots if they exist
  const devScreenshot = (devResult as any).screenshot || "";
  const prodScreenshot = (prodResult as any).screenshot || "";

  // Remove screenshots from comparison data
  const devResultCopy = { ...devResult };
  const prodResultCopy = { ...prodResult };
  delete (devResultCopy as any).screenshot;
  delete (prodResultCopy as any).screenshot;

  return {
    devResult: devResultCopy,
    prodResult: prodResultCopy,
    differences,
    devScreenshot,
    prodScreenshot,
  };
}

export interface ComprehensiveAnalysis {
  buttons: ButtonAnalysis;
  logos: LogoAnalysis;
  navigation: NavigationAnalysis;
  accessibility: AccessibilityAnalysis;
  forms: FormsAnalysis;
  images: ImagesAnalysis;
  headings: HeadingStructure;
  screenshot: string;
}

export async function performComprehensiveAnalysis(url: string): Promise<ComprehensiveAnalysis> {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Run analyses sequentially with delays to avoid Browserless rate limiting
  const buttons = await countButtons(url);
  await delay(500);
  
  const navigation = await analyzeNavigation(url);
  await delay(500);
  
  const headings = await analyzeHeadings(url);
  await delay(500);
  
  const accessibility = await analyzeAccessibility(url);
  await delay(500);
  
  // Run optional analyses with longer delays and error suppression
  let logos;
  try {
    logos = await findLogos(url);
  } catch {
    logos = { found: false, logos: [], screenshot: "" } as LogoAnalysis;
  }
  await delay(1000);
  
  let forms;
  try {
    forms = await analyzeForms(url);
  } catch {
    forms = { totalForms: 0, forms: [], screenshot: "" } as FormsAnalysis;
  }
  await delay(1000);
  
  let images;
  try {
    images = await analyzeImages(url);
  } catch {
    images = { totalImages: 0, images: [], altCoverage: 0, missingAlt: 0, screenshot: "" } as ImagesAnalysis;
  }

  return {
    buttons,
    logos,
    navigation,
    accessibility,
    forms,
    images,
    headings,
    screenshot: (buttons.screenshot || navigation.screenshot || headings.screenshot || "") as string,
  };
}
