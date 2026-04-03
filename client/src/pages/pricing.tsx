import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Globe, FileText, MessageSquare, ArrowRight, Shield, Search } from "lucide-react";
import { SITE_CONFIG } from "@/config/site-config";

const { quickAnalysis, comprehensive, bundle, additionalPages, additionalQuestions } = SITE_CONFIG.pricing;

const plans = [
  {
    config: quickAnalysis,
    accent: SITE_CONFIG.colors.accent,
    featured: false,
    cta: "Run a Free Scan",
    ctaLink: "/?tab=quick",
    ctaStyle: { backgroundColor: "transparent", color: SITE_CONFIG.colors.accent, border: `2px solid ${SITE_CONFIG.colors.accent}` },
  },
  {
    config: comprehensive,
    accent: SITE_CONFIG.colors.brandRed,
    featured: true,
    cta: `Get Your Full Report — ${comprehensive.priceLabel}`,
    ctaLink: "/purchase?plan=comprehensive",
    ctaStyle: { backgroundColor: SITE_CONFIG.colors.primary, color: "#FFFFFF" },
  },
  {
    config: bundle,
    accent: SITE_CONFIG.colors.brandRed,
    featured: false,
    cta: `Get Report + Auditor — ${bundle.priceLabel}`,
    ctaLink: "/purchase?plan=bundle",
    ctaStyle: { backgroundColor: SITE_CONFIG.colors.brandRed, color: "#FFFFFF" },
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: SITE_CONFIG.colors.foreground }}>
            Simple, Per-Site Pricing
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: SITE_CONFIG.colors.foreground }}>
            Every website is different. Pay for the site you need analyzed — no subscriptions, no hidden fees. Subdomains count as separate sites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.config.label}
              className="relative flex flex-col"
              style={{
                borderColor: plan.featured ? plan.accent : undefined,
                borderWidth: plan.featured ? "2px" : undefined,
              }}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="text-xs font-semibold px-3 py-1" style={{ backgroundColor: plan.accent, color: "#FFFFFF" }}>
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl" style={{ color: SITE_CONFIG.colors.foreground }}>
                  {plan.config.label}
                </CardTitle>
                <div className="mt-3">
                  <span className="text-4xl font-bold" style={{ color: SITE_CONFIG.colors.foreground }}>
                    {plan.config.priceLabel}
                  </span>
                  {"priceNote" in plan.config && plan.config.priceNote && (
                    <span className="text-sm ml-2" style={{ color: SITE_CONFIG.colors.muted }}>
                      {plan.config.priceNote}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1">
                  {plan.config.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: plan.accent }} />
                      <span className="text-sm" style={{ color: SITE_CONFIG.colors.foreground }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.ctaLink}>
                  <button className="w-full h-12 mt-8 font-semibold flex items-center justify-center gap-2" style={plan.ctaStyle}>
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-2xl mx-auto mb-16 space-y-4">
          <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-6 py-8 px-6">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: SITE_CONFIG.colors.accent, borderRadius: "0.875rem" }}>
                <Search className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold" style={{ color: SITE_CONFIG.colors.foreground }}>{additionalPages.label}</h3>
                <p className="text-sm mt-1" style={{ color: SITE_CONFIG.colors.muted }}>{additionalPages.description}</p>
              </div>
              <div className="text-center flex-shrink-0">
                <span className="text-2xl font-bold" style={{ color: SITE_CONFIG.colors.foreground }}>{additionalPages.priceLabel}</span>
                <p className="text-xs" style={{ color: SITE_CONFIG.colors.muted }}>per {additionalPages.pagesIncluded} pages</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-6 py-8 px-6">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: SITE_CONFIG.colors.brandRed, borderRadius: "0.875rem" }}>
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold" style={{ color: SITE_CONFIG.colors.foreground }}>{additionalQuestions.label}</h3>
                <p className="text-sm mt-1" style={{ color: SITE_CONFIG.colors.muted }}>{additionalQuestions.description}</p>
              </div>
              <div className="text-center flex-shrink-0">
                <span className="text-2xl font-bold" style={{ color: SITE_CONFIG.colors.foreground }}>{additionalQuestions.priceLabel}</span>
                <p className="text-xs" style={{ color: SITE_CONFIG.colors.muted }}>per {additionalQuestions.questionsIncluded} questions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: SITE_CONFIG.colors.foreground }}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "1", icon: Globe, title: "Enter Your Website", desc: "Tell us which site to analyze. One URL per purchase — subdomains are separate." },
              { step: "2", icon: FileText, title: "We Scan Every Page", desc: `Our scanner crawls up to ${comprehensive.pagesIncluded} pages, checking accessibility, SEO, performance, and content.` },
              { step: "3", icon: CheckCircle2, title: "Get Your Report", desc: "A prioritized task list delivered to your email. Every issue ranked by what matters most." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: SITE_CONFIG.colors.primary, borderRadius: "0.875rem" }}>
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2" style={{ color: SITE_CONFIG.colors.foreground }}>{item.title}</h3>
                <p className="text-sm" style={{ color: SITE_CONFIG.colors.muted }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="p-6" style={{ backgroundColor: `${SITE_CONFIG.colors.accent}0D`, border: `1px solid ${SITE_CONFIG.colors.accent}33`, borderRadius: "1rem" }}>
            <p className="text-sm font-semibold mb-2" style={{ color: SITE_CONFIG.colors.accent }}>
              WHAT THIS MEANS FOR YOUR BUSINESS
            </p>
            <p className="text-sm" style={{ color: SITE_CONFIG.colors.foreground }}>
              You don't need a developer to figure out what's wrong with your website. For the cost of a couple coffees, you get a clear list of every issue — ranked by what will make the biggest difference for your customers. Fix the top items first, and you'll see results.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm" style={{ color: SITE_CONFIG.colors.muted }}>
          <Shield className="w-4 h-4" />
          <span>Secure payment processed by swipesblue.com</span>
        </div>
      </div>
    </div>
  );
}
