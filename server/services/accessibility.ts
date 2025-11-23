import type { AccessibilityAnalysis } from "@shared/schema";
import { getBrowser, navigateToUrl, captureScreenshot } from "./playwright";

export async function analyzeAccessibility(url: string): Promise<AccessibilityAnalysis> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await navigateToUrl(page, url);

    const accessibilityData = await page.evaluate(() => {
      // Check ARIA labels
      const interactiveElements = document.querySelectorAll(
        'button, a, input, select, textarea, [role="button"], [role="link"]'
      );
      let totalInteractive = interactiveElements.length;
      let missingAriaLabel = 0;

      interactiveElements.forEach((el) => {
        const hasAriaLabel = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
        const hasTitle = el.getAttribute('title');
        const hasText = el.textContent?.trim();
        
        if (!hasAriaLabel && !hasTitle && !hasText) {
          missingAriaLabel++;
        }
      });

      // Check alt text on images
      const images = document.querySelectorAll('img');
      const totalImages = images.length;
      let imagesWithAlt = 0;

      images.forEach((img) => {
        if (img.alt && img.alt.trim() !== '') {
          imagesWithAlt++;
        }
      });

      // Check heading structure
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)));
      
      let headingValid = true;
      const headingIssues: string[] = [];

      // Check for h1
      const h1Count = headingLevels.filter(level => level === 1).length;
      if (h1Count === 0) {
        headingIssues.push("No H1 heading found on page");
        headingValid = false;
      } else if (h1Count > 1) {
        headingIssues.push(`Multiple H1 headings found (${h1Count})`);
        headingValid = false;
      }

      // Check for skipped levels
      for (let i = 1; i < headingLevels.length; i++) {
        if (headingLevels[i] - headingLevels[i - 1] > 1) {
          headingIssues.push(`Heading level skipped from H${headingLevels[i - 1]} to H${headingLevels[i]}`);
          headingValid = false;
        }
      }

      if (headingIssues.length === 0) {
        headingIssues.push("Heading structure is valid");
      }

      return {
        ariaLabels: {
          total: totalInteractive,
          missing: missingAriaLabel,
          coverage: totalInteractive > 0 ? ((totalInteractive - missingAriaLabel) / totalInteractive) * 100 : 100,
        },
        altText: {
          totalImages,
          withAlt: imagesWithAlt,
          coverage: totalImages > 0 ? (imagesWithAlt / totalImages) * 100 : 100,
        },
        headingStructure: {
          valid: headingValid,
          issues: headingIssues,
        },
      };
    });

    const screenshot = await captureScreenshot(page);
    await page.close();
    // Don't close shared browser instance

    return { ...accessibilityData, screenshot };
  } catch (error: any) {
    await page.close();
    throw error;
  }
}
