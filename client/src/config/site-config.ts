// client/src/config/site-config.ts

export const SITE_CONFIG = {
  // Brand
  name: "scansblue.com",
  tagline: "Go Blue. Get Scanned. Get Scored.",
  parentCompany: "TRIADBLUE, Inc.",
  supportEmail: "support@scansblue.com",

  // Colors — single source of truth
  colors: {
    background: "#E9ECF0",      // Triad White
    foreground: "#09080E",      // Triad Black — all text
    primary: "#00203A",         // Primary buttons & UI
    accent: "#1844A6",          // Accent, links, focus rings
    brandRed: "#A00028",        // ScansBlue red
    lightBlue: "#6EA6FF",       // Secondary highlights
    warning: "#82323C",         // Warning / error
    card: "#FFFFFF",            // Card backgrounds
    muted: "#6B7280",           // Secondary text
  },

  // Tabs — drives header nav, tab labels, footer product links, and routing
  tabs: [
    {
      id: "quick",
      label: "Quick Analysis",
      path: "/",
      queryParam: "quick",
      description: "See how your site stacks up in under a minute.",
      icon: "Search",
    },
    {
      id: "comprehensive",
      label: "Comprehensive Analysis",
      path: "/analyze",
      queryParam: "comprehensive",
      description: "A full report on every page of your site.",
      icon: "FileText",
    },
    {
      id: "auditor",
      label: "Code and Site Auditor",
      path: "/auditor",
      queryParam: "auditor",
      description: "Ask questions about your site's code, SEO, and security.",
      icon: "MessageSquare",
    },
    {
      id: "pricing",
      label: "Pricing",
      path: "/pricing",
      queryParam: "pricing",
      description: "Simple, per-site pricing.",
      icon: "Tag",
    },
  ],

  // Pricing — single source for all pricing displays
  pricing: {
    quickAnalysis: {
      label: "Quick Analysis",
      price: 0,
      priceLabel: "Free",
      pagesIncluded: 5,
      features: [
        "Up to 5 pages scanned",
        "Button, logo, and favicon detection",
        "Navigation structure check",
        "Accessibility issue count",
        "Image alt text coverage",
        "Heading structure review",
      ],
    },
    comprehensive: {
      label: "Comprehensive Analysis",
      price: 1000,
      priceLabel: "$10",
      priceNote: "per website",
      pagesIncluded: 50,
      features: [
        "Up to 50 pages crawled and analyzed",
        "Accessibility, SEO, and performance audit",
        "Broken links and missing meta data",
        "Prioritized task list by severity",
        "Report delivered to your email",
        "Marketing stack detection",
      ],
    },
    bundle: {
      label: "Comprehensive + Auditor",
      price: 1500,
      priceLabel: "$15",
      priceNote: "per website",
      features: [
        "Everything in Comprehensive Analysis",
        "5 auditor questions about your site",
        "Ask anything — code, SEO, security, content",
        "24-hour access from time of purchase",
      ],
    },
    additionalPages: {
      label: "5 More Pages",
      price: 500,
      priceLabel: "$5",
      pagesIncluded: 5,
      description: "Scan 5 additional pages on the same site. No limit on purchases.",
    },
    additionalQuestions: {
      label: "5 More Auditor Questions",
      price: 500,
      priceLabel: "$5",
      questionsIncluded: 5,
      description: "5 more questions about the same site. Valid for 24 hours.",
    },
  },

  // Ecosystem — drives the footer. Fixed order. Never changes.
  ecosystem: {
    tagline: "Six Platforms. One Ecosystem. Go Blue.",
    platforms: [
      {
        name: "businessblueprint.io",
        url: "https://businessblueprint.io",
        tagline: "Get Assessed. Get Prescribed. Get Business.",
        logoFile: "bb-header-logo.png",
      },
      {
        name: "swipesblue.com",
        url: "https://swipesblue.com",
        tagline: "Go Blue. Get Swiped. Get Paid.",
        logoFile: "swipesblue_logo_image_and_text_as_url.png",
      },
      {
        name: "hostsblue.com",
        url: "https://hostsblue.com",
        tagline: "Go Blue. Get Site. Go Live.",
        logoFile: "hostsblue_logo_image_and_text_as_url.png",
      },
      {
        name: "scansblue.com",
        url: "https://scansblue.com",
        tagline: "Go Blue. Get Scanned. Get Scored.",
        logoFile: "scansblue_logo_image_and_text_as_url.png",
        isCurrent: true as const,
      },
      {
        name: "BUILDERBLUE\u00B2.COM",
        url: "https://builderblue2.com",
        tagline: "Go Blue. Get Vibed. Get Ahead.",
        logoFile: "builderblue2-logo-url.png",
      },
    ],
  },
} as const;

// Type exports for consuming components
export type TabId = typeof SITE_CONFIG.tabs[number]["id"];
export type PricingPlan = keyof typeof SITE_CONFIG.pricing;
