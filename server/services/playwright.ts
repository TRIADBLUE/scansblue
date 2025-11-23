import { chromium, type Browser, type Page } from "playwright";
import type {
  ButtonAnalysis,
  LogoAnalysis,
  FaviconAnalysis,
  NavigationAnalysis,
  ComparisonResult,
} from "@shared/schema";

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    try {
      browserInstance = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    } catch (error: any) {
      throw new Error(
        `Failed to launch browser. This may be due to missing system dependencies. ` +
        `Error: ${error.message}. ` +
        `Note: This service requires Chromium system dependencies which may not be available in all environments. ` +
        `For production deployment, ensure the host system has the required browser dependencies installed.`
      );
    }
  }
  return browserInstance;
}

export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

async function navigateToUrl(page: Page, url: string): Promise<void> {
  // Ensure URL has protocol
  const finalUrl = url.startsWith("http") ? url : `https://${url}`;
  
  await page.goto(finalUrl, {
    waitUntil: "networkidle",
    timeout: 30000,
  });
}

export async function countButtons(url: string): Promise<ButtonAnalysis> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await navigateToUrl(page, url);

    // Count all interactive button-like elements
    const buttonData = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], [role="button"]'));
      
      const breakdown: { [key: string]: number } = {};

      buttons.forEach((btn) => {
        let location = "unknown";
        
        // Try to determine location based on parent structure
        if (btn.closest("header, [role='banner']")) {
          location = "header";
        } else if (btn.closest("nav, [role='navigation']")) {
          location = "navigation";
        } else if (btn.closest("footer")) {
          location = "footer";
        } else if (btn.closest("main, [role='main']")) {
          location = "main content";
        } else if (btn.closest("aside, [role='complementary']")) {
          location = "sidebar";
        } else if (btn.closest("form")) {
          location = "form";
        }

        breakdown[location] = (breakdown[location] || 0) + 1;
      });

      return {
        total: buttons.length,
        breakdown: Object.entries(breakdown).map(([location, count]) => ({ location, count }))
      };
    });

    await page.close();
    return buttonData;
  } catch (error: any) {
    await page.close();
    throw error;
  }
}

export async function findLogos(url: string): Promise<LogoAnalysis> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await navigateToUrl(page, url);

    const logoData = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      
      const logos = images
        .filter((img) => {
          const src = img.src.toLowerCase();
          const alt = img.alt.toLowerCase();
          const className = img.className.toLowerCase();
          
          return (
            src.includes('logo') ||
            alt.includes('logo') ||
            className.includes('logo')
          );
        })
        .map((img) => {
          const rect = img.getBoundingClientRect();
          let location = "unknown";
          
          if (img.closest("header, [role='banner']")) {
            location = "header";
          } else if (img.closest("nav")) {
            location = "navigation";
          } else if (img.closest("footer")) {
            location = "footer";
          }

          return {
            src: img.src,
            alt: img.alt || "",
            width: rect.width,
            height: rect.height,
            location,
          };
        });

      return {
        found: logos.length > 0,
        logos,
      };
    });

    await page.close();
    return logoData;
  } catch (error: any) {
    await page.close();
    throw error;
  }
}

export async function checkFavicon(url: string): Promise<FaviconAnalysis> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await navigateToUrl(page, url);

    const faviconData = await page.evaluate(() => {
      const faviconLink = document.querySelector<HTMLLinkElement>(
        'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
      );

      if (!faviconLink) {
        return {
          found: false,
          message: "No favicon link tag found in the page"
        };
      }

      return {
        found: true,
        href: faviconLink.href,
        type: faviconLink.type || "unknown",
        message: "Favicon link found"
      };
    });

    // Try to verify the favicon loads
    if (faviconData.found && faviconData.href) {
      try {
        const response = await page.goto(faviconData.href, { timeout: 10000 });
        if (response && response.ok()) {
          faviconData.message = "Favicon found and loads successfully";
        } else {
          faviconData.message = "Favicon link found but failed to load";
        }
      } catch {
        faviconData.message = "Favicon link found but failed to load";
      }
    }

    await page.close();
    return faviconData;
  } catch (error: any) {
    await page.close();
    throw error;
  }
}

export async function analyzeNavigation(url: string): Promise<NavigationAnalysis> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await navigateToUrl(page, url);

    const navData = await page.evaluate(() => {
      const navElements = Array.from(
        document.querySelectorAll('nav a, [role="navigation"] a, header a')
      );

      const structure = navElements
        .slice(0, 20) // Limit to first 20 items
        .map((link) => {
          const anchor = link as HTMLAnchorElement;
          return {
            label: anchor.textContent?.trim() || "",
            href: anchor.href || "",
          };
        })
        .filter((item) => item.label);

      return {
        menuItems: navElements.length,
        structure,
      };
    });

    await page.close();
    return navData;
  } catch (error: any) {
    await page.close();
    throw error;
  }
}

export async function compareEnvironments(
  devUrl: string,
  prodUrl: string,
  analysisType: "buttons" | "logos" | "favicon" | "navigation"
): Promise<ComparisonResult> {
  let devResult: any;
  let prodResult: any;

  switch (analysisType) {
    case "buttons":
      [devResult, prodResult] = await Promise.all([
        countButtons(devUrl),
        countButtons(prodUrl),
      ]);
      break;
    case "logos":
      [devResult, prodResult] = await Promise.all([
        findLogos(devUrl),
        findLogos(prodUrl),
      ]);
      break;
    case "favicon":
      [devResult, prodResult] = await Promise.all([
        checkFavicon(devUrl),
        checkFavicon(prodUrl),
      ]);
      break;
    case "navigation":
      [devResult, prodResult] = await Promise.all([
        analyzeNavigation(devUrl),
        analyzeNavigation(prodUrl),
      ]);
      break;
  }

  const differences: string[] = [];

  // Generate comparison insights based on type
  if (analysisType === "buttons") {
    if (devResult.total !== prodResult.total) {
      differences.push(
        `Dev has ${devResult.total} buttons, Production has ${prodResult.total}`
      );
    } else {
      differences.push("Both environments have the same number of buttons");
    }
  } else if (analysisType === "navigation") {
    if (devResult.menuItems !== prodResult.menuItems) {
      differences.push(
        `Dev has ${devResult.menuItems} menu items, Production has ${prodResult.menuItems}`
      );
    } else {
      differences.push("Both environments have the same number of menu items");
    }
  }

  return {
    devResult,
    prodResult,
    differences,
  };
}
