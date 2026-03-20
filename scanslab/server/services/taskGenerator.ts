import type { CrawlResult } from "./websiteCrawler";

export interface Task {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  category: "accessibility" | "performance" | "seo" | "ux" | "security" | "content";
  title: string;
  description: string;
  affectedPages: string[];
  estimatedEffort: "quick" | "medium" | "complex";
  status: "open" | "in-progress" | "completed";
}

export function generateTasks(crawlResults: CrawlResult[]): { tasks: Task[]; summary: string } {
  const tasks: Task[] = [];
  const issueMap = new Map<string, { pages: string[]; severity: number }>();

  let totalIssues = 0;
  let criticalIssues = 0;

  for (const result of crawlResults) {
    // Accessibility issues
    if (result.accessibilityIssues.missingAltText > 0) {
      const key = `missing-alt-text`;
      if (!issueMap.has(key)) {
        issueMap.set(key, { pages: [], severity: 3 });
      }
      issueMap.get(key)!.pages.push(result.url);
      totalIssues += result.accessibilityIssues.missingAltText;
      criticalIssues++;
    }

    if (result.accessibilityIssues.missingAriaLabels > 0) {
      const key = `missing-aria-labels`;
      if (!issueMap.has(key)) {
        issueMap.set(key, { pages: [], severity: 3 });
      }
      issueMap.get(key)!.pages.push(result.url);
      totalIssues += result.accessibilityIssues.missingAriaLabels;
      criticalIssues++;
    }

    if (result.accessibilityIssues.headingIssues.length > 0) {
      const key = `heading-structure`;
      if (!issueMap.has(key)) {
        issueMap.set(key, { pages: [], severity: 2 });
      }
      issueMap.get(key)!.pages.push(result.url);
      totalIssues += result.accessibilityIssues.headingIssues.length;
    }

    // Content issues
    if (result.contentIssues.brokenLinks.length > 0) {
      const key = `broken-links`;
      if (!issueMap.has(key)) {
        issueMap.set(key, { pages: [], severity: 2 });
      }
      issueMap.get(key)!.pages.push(result.url);
      totalIssues += result.contentIssues.brokenLinks.length;
    }

    if (result.contentIssues.missingImages > 0) {
      const key = `missing-images`;
      if (!issueMap.has(key)) {
        issueMap.set(key, { pages: [], severity: 2 });
      }
      issueMap.get(key)!.pages.push(result.url);
      totalIssues += result.contentIssues.missingImages;
    }

    // SEO issues
    if (result.seoIssues.noMetaDescription) {
      const key = `missing-meta-description`;
      if (!issueMap.has(key)) {
        issueMap.set(key, { pages: [], severity: 1 });
      }
      issueMap.get(key)!.pages.push(result.url);
      totalIssues++;
    }

    if (result.seoIssues.missingH1) {
      const key = `missing-h1`;
      if (!issueMap.has(key)) {
        issueMap.set(key, { pages: [], severity: 2 });
      }
      issueMap.get(key)!.pages.push(result.url);
      totalIssues++;
      criticalIssues++;
    }

    if (result.seoIssues.duplicateHeadings) {
      const key = `duplicate-h1`;
      if (!issueMap.has(key)) {
        issueMap.set(key, { pages: [], severity: 2 });
      }
      issueMap.get(key)!.pages.push(result.url);
      totalIssues++;
    }

    // Performance issues
    if (result.performance.unoptimizedAssets > 0) {
      const key = `unoptimized-images`;
      if (!issueMap.has(key)) {
        issueMap.set(key, { pages: [], severity: 1 });
      }
      issueMap.get(key)!.pages.push(result.url);
      totalIssues += result.performance.unoptimizedAssets;
    }
  }

  // Convert issue map to tasks
  const issueEntries = Array.from(issueMap.entries());
  const taskIdMap: { [key: string]: Task } = {
    "missing-alt-text": {
      id: "missing-alt-text",
      priority: "critical",
      category: "accessibility",
      title: "Add missing alt text to images",
      description: "Multiple images lack alt text, which is essential for accessibility and SEO. Screen reader users and search engines need alt text to understand images.",
      affectedPages: issueMap.get("missing-alt-text")?.pages || [],
      estimatedEffort: "medium",
      status: "open",
    },
    "missing-aria-labels": {
      id: "missing-aria-labels",
      priority: "high",
      category: "accessibility",
      title: "Add ARIA labels to interactive elements",
      description: "Some interactive elements (buttons, links) lack descriptive labels for screen readers. This impacts accessibility compliance.",
      affectedPages: issueMap.get("missing-aria-labels")?.pages || [],
      estimatedEffort: "medium",
      status: "open",
    },
    "heading-structure": {
      id: "heading-structure",
      priority: "high",
      category: "accessibility",
      title: "Fix heading structure hierarchy",
      description: "Heading levels are skipped or improperly structured. Proper hierarchy is critical for accessibility and SEO.",
      affectedPages: issueMap.get("heading-structure")?.pages || [],
      estimatedEffort: "quick",
      status: "open",
    },
    "broken-links": {
      id: "broken-links",
      priority: "high",
      category: "content",
      title: "Fix broken internal links",
      description: "Several internal links are broken, leading to 404 errors. This harms user experience and SEO ranking.",
      affectedPages: issueMap.get("broken-links")?.pages || [],
      estimatedEffort: "quick",
      status: "open",
    },
    "missing-images": {
      id: "missing-images",
      priority: "medium",
      category: "content",
      title: "Replace missing or placeholder images",
      description: "Some images are missing or show placeholder text. This degrades content quality and user experience.",
      affectedPages: issueMap.get("missing-images")?.pages || [],
      estimatedEffort: "medium",
      status: "open",
    },
    "missing-meta-description": {
      id: "missing-meta-description",
      priority: "medium",
      category: "seo",
      title: "Add meta descriptions to all pages",
      description: "Meta descriptions improve click-through rates from search results and provide context about page content.",
      affectedPages: issueMap.get("missing-meta-description")?.pages || [],
      estimatedEffort: "quick",
      status: "open",
    },
    "missing-h1": {
      id: "missing-h1",
      priority: "critical",
      category: "seo",
      title: "Add H1 heading to pages",
      description: "Pages lacking H1 headings hurt SEO. Each page should have exactly one H1 that describes its main topic.",
      affectedPages: issueMap.get("missing-h1")?.pages || [],
      estimatedEffort: "quick",
      status: "open",
    },
    "duplicate-h1": {
      id: "duplicate-h1",
      priority: "high",
      category: "seo",
      title: "Remove duplicate H1 headings",
      description: "Multiple H1 headings on one page confuses search engines. Each page should have exactly one H1.",
      affectedPages: issueMap.get("duplicate-h1")?.pages || [],
      estimatedEffort: "quick",
      status: "open",
    },
    "unoptimized-images": {
      id: "unoptimized-images",
      priority: "low",
      category: "performance",
      title: "Optimize images for web",
      description: "Some images are larger than displayed. Optimizing will improve page load speed and user experience.",
      affectedPages: issueMap.get("unoptimized-images")?.pages || [],
      estimatedEffort: "medium",
      status: "open",
    },
  };

  // Build task list from found issues
  for (const [key] of issueEntries) {
    if (taskIdMap[key]) {
      tasks.push(taskIdMap[key]);
    }
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Generate summary
  const pages = crawlResults.length;
  const critical = tasks.filter((t) => t.priority === "critical").length;
  const high = tasks.filter((t) => t.priority === "high").length;

  let summary = `Analyzed ${pages} page${pages !== 1 ? "s" : ""} and found ${totalIssues} total issue${totalIssues !== 1 ? "s" : ""}: `;
  summary += `${critical} critical, ${high} high priority tasks that need attention.`;

  return { tasks, summary };
}
