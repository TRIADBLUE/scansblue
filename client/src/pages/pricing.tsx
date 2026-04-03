import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Globe, FileText, MessageSquare, ArrowRight, Shield } from "lucide-react";

const plans = [
  {
    name: "Quick Analysis",
    price: "Free",
    priceNote: null,
    description: "See how your site stacks up in under a minute.",
    accent: "#0000FF",
    featured: false,
    features: [
      "Up to 10 pages scanned",
      "Button, logo, and favicon detection",
      "Navigation structure check",
      "Accessibility issue count",
      "Image alt text coverage",
      "Heading structure review",
    ],
    cta: "Run a Free Scan",
    ctaLink: "/",
    ctaStyle: { backgroundColor: "transparent", color: "#0000FF", border: "2px solid #0000FF" },
  },
  {
    name: "Comprehensive Analysis",
    price: "$10",
    priceNote: "per website",
    description: "A full report on every page of your site — with a prioritized list of exactly what to fix.",
    accent: "#E00420",
    featured: true,
    features: [
      "Up to 50 pages crawled and analyzed",
      "Accessibility, SEO, and performance audit",
      "Broken links and missing meta data",
      "Prioritized task list by severity",
      "Report delivered to your email",
      "Subdomains analyzed separately",
    ],
    cta: "Get Your Full Report — $10",
    ctaLink: "/purchase?plan=comprehensive",
    ctaStyle: { backgroundColor: "#FF6B00", color: "#FFFFFF" },
  },
  {
    name: "Comprehensive + Auditor",
    price: "$15",
    priceNote: "per website",
    description: "Everything in the full report, plus 5 questions answered by our AI auditor about that same site.",
    accent: "#E00420",
    featured: false,
    features: [
      "Everything in Comprehensive Analysis",
      "5 auditor questions about your site",
      "Ask anything — code, SEO, security, content",
      "24-hour access from time of purchase",
      "$5 for 5 more questions anytime",
      "Powered by DeepSeek AI",
    ],
    cta: "Get Report + Auditor — $15",
    ctaLink: "/purchase?plan=bundle",
    ctaStyle: { backgroundColor: "#E00420", color: "#FFFFFF" },
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "#09080E" }}>
            Simple, Per-Site Pricing
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#09080E" }}>
            Every website is different. Pay for the site you need analyzed — no subscriptions, no hidden fees. Subdomains count as separate sites.
          </p>
        </div>

        {/* Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className="relative flex flex-col"
              style={{
                borderColor: plan.featured ? plan.accent : undefined,
                borderWidth: plan.featured ? "2px" : undefined,
              }}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge
                    className="text-xs font-semibold px-3 py-1"
                    style={{ backgroundColor: plan.accent, color: "#FFFFFF" }}
                  >
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-xl" style={{ color: "#09080E" }}>
                  {plan.name}
                </CardTitle>
                <div className="mt-3">
                  <span className="text-4xl font-bold" style={{ color: "#09080E" }}>
                    {plan.price}
                  </span>
                  {plan.priceNote && (
                    <span className="text-sm ml-2" style={{ color: "#808080" }}>
                      {plan.priceNote}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-3" style={{ color: "#808080" }}>
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2
                        className="w-5 h-5 mt-0.5 flex-shrink-0"
                        style={{ color: plan.accent }}
                      />
                      <span className="text-sm" style={{ color: "#09080E" }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.ctaLink}>
                  <button
                    className="w-full h-12 mt-8 font-semibold flex items-center justify-center gap-2"
                    style={plan.ctaStyle}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Questions Add-on */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-6 py-8 px-6">
              <div
                className="w-14 h-14 flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: "#E00420",
                  borderRadius: "0.875rem",
                }}
              >
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold" style={{ color: "#09080E" }}>
                  Need More Auditor Questions?
                </h3>
                <p className="text-sm mt-1" style={{ color: "#808080" }}>
                  After any purchase, add 5 more questions about the same site for $5. Each set is valid for 24 hours. Ask about code, SEO, security, performance — anything.
                </p>
              </div>
              <div className="text-center flex-shrink-0">
                <span className="text-2xl font-bold" style={{ color: "#09080E" }}>$5</span>
                <p className="text-xs" style={{ color: "#808080" }}>per 5 questions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "#09080E" }}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                icon: Globe,
                title: "Enter Your Website",
                desc: "Tell us which site to analyze. One URL per purchase — subdomains are separate.",
              },
              {
                step: "2",
                icon: FileText,
                title: "We Scan Every Page",
                desc: "Our scanner crawls up to 50 pages, checking accessibility, SEO, performance, and content.",
              },
              {
                step: "3",
                icon: CheckCircle2,
                title: "Get Your Report",
                desc: "A prioritized task list delivered to your email. Every issue ranked by what matters most.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div
                  className="w-12 h-12 mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: "#E00420", borderRadius: "0.875rem" }}
                >
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: "#09080E" }}>
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: "#808080" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* What This Means callout */}
        <div className="max-w-2xl mx-auto mb-12">
          <div
            className="p-6"
            style={{
              backgroundColor: "rgba(224, 4, 32, 0.05)",
              border: "1px solid rgba(224, 4, 32, 0.2)",
              borderRadius: "1rem",
            }}
          >
            <p className="text-sm font-semibold mb-2" style={{ color: "#E00420" }}>
              WHAT THIS MEANS FOR YOUR BUSINESS
            </p>
            <p className="text-sm" style={{ color: "#09080E" }}>
              You don't need a developer to figure out what's wrong with your website. For the cost of a couple coffees, you get a clear list of every issue — ranked by what will make the biggest difference for your customers. Fix the top items first, and you'll see results.
            </p>
          </div>
        </div>

        {/* Trust footer */}
        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: "#808080" }}>
          <Shield className="w-4 h-4" />
          <span>Secure payment processed by swipesblue.com</span>
        </div>
      </div>
    </div>
  );
}
