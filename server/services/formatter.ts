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

export function formatButtonAnalysis(url: string, analysis: ButtonAnalysis): string {
  if (analysis.total === 0) {
    return `I didn't find any buttons on ${url}.`;
  }

  let response = `I found ${analysis.total} button${analysis.total > 1 ? 's' : ''} on ${url}:\n\n`;

  analysis.buttons.forEach((btn, idx) => {
    response += `${idx + 1}. ${btn.text || 'Unlabeled Button'}\n`;
    if (btn.link) {
      response += `   Link: ${btn.link}\n`;
    }
    response += `   Location: ${btn.location}\n`;
    response += `   State: ${btn.state}\n`;
    if (btn.styling) {
      response += `   Styling: ${btn.styling}\n`;
    }
    response += '\n';
  });

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
    response += `\n   URL: ${logo.src}\n`;
    if (logo.className) {
      response += `   CSS Class: ${logo.className}\n`;
    }
    response += '\n';
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

  let response = `I found ${analysis.menuItems} navigation menu item${analysis.menuItems > 1 ? 's' : ''} on ${url}:\n\n`;

  const buildTree = (items: any[], depth: number = 0): string => {
    return items.map(item => {
      const indent = '  '.repeat(depth) + '• ';
      let line = `${indent}${item.label}`;
      if (item.href) {
        line += ` → ${item.href}`;
      }
      let result = line + '\n';
      if (item.children && item.children.length > 0) {
        result += buildTree(item.children, depth + 1);
      }
      return result;
    }).join('');
  };

  response += buildTree(analysis.structure);

  return response.trim();
}

export function formatFormsAnalysis(url: string, analysis: FormsAnalysis): string {
  if (analysis.totalForms === 0) {
    return `I didn't find any forms on ${url}.`;
  }

  let response = `I found ${analysis.totalForms} form${analysis.totalForms > 1 ? 's' : ''} on ${url}:\n\n`;

  analysis.forms.forEach((form, formIdx) => {
    response += `Form ${formIdx + 1}:\n`;
    if (form.id) response += `  ID: ${form.id}\n`;
    if (form.name) response += `  Name: ${form.name}\n`;
    response += `  Method: ${form.method}\n`;
    if (form.action) response += `  Action: ${form.action}\n`;
    
    if (form.fields.length > 0) {
      response += `  Fields:\n`;
      form.fields.forEach((field, idx) => {
        response += `    ${idx + 1}. Type: ${field.type}`;
        if (field.name) response += `, Name: ${field.name}`;
        if (field.label) response += `, Label: ${field.label}`;
        response += `, Required: ${field.required ? 'Yes' : 'No'}\n`;
      });
    }
    response += '\n';
  });

  return response.trim();
}

export function formatImagesAnalysis(url: string, analysis: ImagesAnalysis): string {
  let response = `Found ${analysis.totalImages} image${analysis.totalImages > 1 ? 's' : ''} on ${url}.\n`;
  response += `Alt Text Coverage: ${analysis.altCoverage}% (${analysis.images.filter(img => img.alt).length}/${analysis.totalImages} with alt text)\n`;
  
  if (analysis.missingAlt > 0) {
    response += `⚠️ ${analysis.missingAlt} image${analysis.missingAlt > 1 ? 's' : ''} missing alt text.\n\n`;
  } else {
    response += `✓ All images have alt text.\n\n`;
  }

  response += `Image Details:\n`;
  analysis.images.slice(0, 20).forEach((img, idx) => {
    response += `${idx + 1}. `;
    if (img.alt) {
      response += `"${img.alt}" - `;
    }
    response += `${img.width}×${img.height}px`;
    if (img.location !== "unknown") {
      response += ` (${img.location})`;
    }
    response += `\n   URL: ${img.src}\n\n`;
  });

  if (analysis.images.length > 20) {
    response += `... and ${analysis.images.length - 20} more images`;
  }

  return response.trim();
}

export function formatHeadingsAnalysis(url: string, analysis: HeadingStructure): string {
  let response = `Heading Structure Analysis for ${url}:\n\n`;

  if (analysis.headings.length === 0) {
    return response + `No headings found on the page.`;
  }

  response += `Found ${analysis.headings.length} heading${analysis.headings.length > 1 ? 's' : ''}:\n`;
  response += `H1 Count: ${analysis.h1Count}\n`;
  response += `Structure Valid: ${analysis.isValid ? 'Yes ✓' : 'No ✗'}\n\n`;

  if (analysis.issues.length > 0) {
    response += `Issues Found:\n`;
    analysis.issues.forEach(issue => {
      response += `• ${issue}\n`;
    });
    response += '\n';
  }

  response += `Heading Hierarchy:\n`;
  analysis.headings.forEach((h, idx) => {
    const indent = '  '.repeat(h.level - 1);
    response += `${indent}H${h.level}: ${h.text.substring(0, 60)}${h.text.length > 60 ? '...' : ''}\n`;
  });

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
