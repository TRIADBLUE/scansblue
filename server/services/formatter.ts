import type {
  ButtonAnalysis,
  LogoAnalysis,
  FaviconAnalysis,
  NavigationAnalysis,
  ComparisonResult,
  AccessibilityAnalysis,
} from "@shared/schema";

export function formatButtonAnalysis(url: string, analysis: ButtonAnalysis): string {
  if (analysis.total === 0) {
    return `I didn't find any buttons on ${url}.`;
  }

  let response = `I found ${analysis.total} button${analysis.total > 1 ? 's' : ''} on ${url}`;

  if (analysis.breakdown.length > 0) {
    response += ":\n\n";
    analysis.breakdown.forEach(({ location, count }) => {
      response += `• ${count} in the ${location}\n`;
    });
  } else {
    response += ".";
  }

  return response.trim();
}

export function formatLogoAnalysis(url: string, analysis: LogoAnalysis): string {
  if (!analysis.found || analysis.logos.length === 0) {
    return `I didn't find any logos on ${url}. I looked for images with "logo" in their source URL, alt text, or class name.`;
  }

  let response = `I found ${analysis.logos.length} logo${analysis.logos.length > 1 ? 's' : ''} on ${url}:\n\n`;

  analysis.logos.forEach((logo, idx) => {
    response += `${idx + 1}. `;
    if (logo.alt) {
      response += `"${logo.alt}" - `;
    }
    response += `${Math.round(logo.width)}×${Math.round(logo.height)}px`;
    if (logo.location !== "unknown") {
      response += ` in the ${logo.location}`;
    }
    response += `\n   URL: ${logo.src}\n\n`;
  });

  return response.trim();
}

export function formatFaviconAnalysis(url: string, analysis: FaviconAnalysis): string {
  if (!analysis.found) {
    return `${analysis.message} on ${url}. The site may not have a favicon configured, or it might be using a default browser icon.`;
  }

  let response = `${analysis.message} for ${url}.\n\n`;
  if (analysis.href) {
    response += `Favicon URL: ${analysis.href}\n`;
  }
  if (analysis.type && analysis.type !== "unknown") {
    response += `Type: ${analysis.type}`;
  }

  return response.trim();
}

export function formatNavigationAnalysis(url: string, analysis: NavigationAnalysis): string {
  if (analysis.menuItems === 0) {
    return `I didn't find any navigation menu items on ${url}.`;
  }

  let response = `I found ${analysis.menuItems} navigation menu item${analysis.menuItems > 1 ? 's' : ''} on ${url}`;

  if (analysis.structure.length > 0) {
    response += ". Here are the main menu items:\n\n";
    analysis.structure.forEach(({ label, href }, idx) => {
      response += `${idx + 1}. ${label}\n   ${href}\n\n`;
    });
  } else {
    response += ".";
  }

  return response.trim();
}

export function formatComparison(
  devUrl: string,
  prodUrl: string,
  analysisType: string,
  comparison: ComparisonResult
): string {
  let response = `Comparing ${analysisType} between ${devUrl} and ${prodUrl}:\n\n`;

  if (comparison.differences.length > 0) {
    response += "Differences:\n";
    comparison.differences.forEach((diff) => {
      response += `• ${diff}\n`;
    });
    response += "\n";
  }

  response += `Development:\n`;
  if (analysisType === "buttons") {
    response += `Total: ${comparison.devResult.total} buttons\n`;
  } else if (analysisType === "navigation") {
    response += `Total: ${comparison.devResult.menuItems} menu items\n`;
  }

  response += `\nProduction:\n`;
  if (analysisType === "buttons") {
    response += `Total: ${comparison.prodResult.total} buttons\n`;
  } else if (analysisType === "navigation") {
    response += `Total: ${comparison.prodResult.menuItems} menu items\n`;
  }

  return response.trim();
}

export function formatAccessibilityAnalysis(url: string, analysis: AccessibilityAnalysis): string {
  let response = `Accessibility Analysis for ${url}:\n\n`;

  // ARIA Labels
  response += `ARIA Labels & Accessible Names:\n`;
  response += `• Total interactive elements: ${analysis.ariaLabels.total}\n`;
  response += `• Elements with accessible names: ${analysis.ariaLabels.total - analysis.ariaLabels.missing}\n`;
  response += `• Elements missing accessible names: ${analysis.ariaLabels.missing}\n`;
  response += `• Coverage: ${analysis.ariaLabels.coverage.toFixed(1)}%\n\n`;

  // Alt Text
  response += `Image Alt Text:\n`;
  response += `• Total images: ${analysis.altText.totalImages}\n`;
  response += `• Images with alt text: ${analysis.altText.withAlt}\n`;
  response += `• Images missing alt text: ${analysis.altText.totalImages - analysis.altText.withAlt}\n`;
  response += `• Coverage: ${analysis.altText.coverage.toFixed(1)}%\n\n`;

  // Heading Structure
  response += `Heading Structure:\n`;
  response += `• Valid: ${analysis.headingStructure.valid ? 'Yes' : 'No'}\n`;
  if (analysis.headingStructure.issues.length > 0) {
    analysis.headingStructure.issues.forEach(issue => {
      response += `• ${issue}\n`;
    });
  }

  return response.trim();
}
