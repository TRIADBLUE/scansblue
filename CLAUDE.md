# CLAUDE.md — scansblue.com
# Last updated: April 2, 2026

---

## READ THE UNIVERSAL RULES FIRST

Before doing ANY work, fetch and read the TRIADBLUE universal brand rules:
```
curl -s "https://linkblue-githubproxy.up.railway.app/api/github/file?repo=.github&path=CLAUDE.md"
```
Those rules govern colors, fonts, naming, payments, and ecosystem standards. They are non-negotiable.

---

## PLATFORM IDENTITY

**Name:** scansblue.com
**Tagline:** Get scanned. Get scored. Go Blue.
**Role:** Website auditing engine, powers the Digital IQ assessment for businessblueprint.io
**Stack:** React + TypeScript + Tailwind + shadcn/ui + Express + Drizzle ORM + PostgreSQL + Wouter + Playwright + DeepSeek AI
**Deployment:** Replit (Autoscale)
**Local path:** `/Users/deanlewis/scansblue`

---

## SCANSBLUE-SPECIFIC BRAND COLORS

These override the universal defaults for this platform only:

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#E9ECF0` | Triad White — page backgrounds |
| Text | `#09080E` | Triad Black — all text |
| Primary | `#00203A` | Primary buttons, primary UI |
| Accent | `#1844A6` | Links, focus rings, accent elements |
| Brand Red | `#A00028` | ScansBlue red — logo color, key brand touches |
| Light Blue | `#6EA6FF` | Secondary highlights |
| Warning/Error | `#82323C` | Error states, destructive actions |

**Colors that MUST NOT appear on this site:**
- `#0000FF` — Pure Blue. Not for text, headers, borders, or buttons.
- `#E00420` — this is the / scan app color inside businessblueprint.io, NOT the scansblue.com brand red.
- `#FF6B00` — not a ScansBlue color.

---

## ARCHITECTURE

### What ScansBlue Does
1. **Quick Analysis** — free scan of up to 5 pages. Checks buttons, logos, favicons, navigation, accessibility, forms, images, headings.
2. **Comprehensive Analysis** — $10. Full site crawl up to 50 pages. Prioritized task list delivered via email.
3. **Code and Site Auditor** — chat interface. Ask questions about a website's code, SEO, security.
4. **Bundle** — $15. Comprehensive + 5 auditor questions.
5. **Add-ons** — $5 per 5 additional pages or 5 additional questions. No limit on purchases.

### Pricing (Option A — Bundle-first)
- $10 — Comprehensive Analysis
- $15 — Comprehensive + 5 Auditor Questions
- $5 — 5 more pages or 5 more questions (unlimited increments)
- No standalone auditor — everyone starts with a report

### Homepage Structure — 4 Tabbed Sections
Everything lives on the homepage in curved file-folder tabs:

| Tab | Label (from site-config.ts) |
|-----|----------------------------|
| 1 | Quick Analysis |
| 2 | Comprehensive Analysis |
| 3 | Code and Site Auditor |
| 4 | Pricing |

All tab labels, prices, and features come from `client/src/config/site-config.ts`. Zero hardcoded strings in components.

### Configuration
**`client/src/config/site-config.ts`** is the SINGLE SOURCE OF TRUTH for tab names, prices, features, colors, ecosystem data. One change here propagates to the header nav, tab bar, footer product column, and pricing cards.

### AI Engine
Three DeepSeek system prompts in `server/prompts/`:
- `code-auditor-system-prompt.md` — code review + marketing stack detection
- `comprehensive-analysis-system-prompt.md` — full site crawl + prioritized task list
- `quick-analysis-system-prompt.md` — fast per-category checks

All three are platform-aware (know about businessblueprint.io apps, scoring model, and setup cadence). Rewritten in Phase C (commit 7580e56).

### Integration with businessblueprint.io
ScansBlue powers the Digital IQ assessment:
- `POST /api/businessblueprint/fast-check` — quick scan for assessment pipeline
- `POST /api/businessblueprint/full-report` — comprehensive report queue
- `POST /api/businessblueprint/auditor` — interactive follow-up

### Payment Flow
All payments through swipesblue.com. ScansBlue calls SwipesBlue's checkout API.

### Logo Assets
Use logo files from `/Users/Shared/global assets/logo images and texts/scansblue-com/` on the local machine.

### Key Files
- `client/src/App.tsx` — routing
- `client/src/pages/home.tsx` — homepage with 4 tabs
- `client/src/config/site-config.ts` — centralized config (must be created)
- `client/src/components/app-header.tsx` — header navigation
- `client/src/components/footer.tsx` — footer (must be created)
- `server/routes.ts` — API routes (quick scan limit = 5 pages)
- `server/prompts/` — DeepSeek system prompts
- `server/services/deepseek.ts` — DeepSeek API service

---

## COMPLETED

- DeepSeek AI integration (3 analysis modes) ✓
- Quick scan endpoint ✓
- Comprehensive analysis endpoint ✓
- Code auditor chat endpoint ✓
- businessblueprint.io integration API ✓
- SwipesBlue payment integration (HMAC webhook verification) ✓
- Phase C — DeepSeek prompt rewrites with platform awareness (7580e56) ✓
- Purchase page with plan selection ✓
- Pricing page ✓

## PENDING — SITE OVERHAUL

The site is functional but does not follow TRIADBLUE brand standards. A complete overhaul prompt has been written (SCANSBLUE_SITE_OVERHAUL_PROMPT.md) covering:

- [ ] CSS theme rewrite — correct brand colors
- [ ] Logo replacement from local assets
- [ ] All hardcoded wrong colors removed (#0000FF, #E00420, #FF6B00)
- [ ] Quick Analysis limit: 10 pages → 5 pages
- [ ] $5 increments for additional pages (unlimited)
- [ ] Homepage redesign with 4 curved file-folder tabs
- [ ] Centralized site-config.ts — zero hardcoded strings
- [ ] Footer on every page with ecosystem + legal
- [ ] Legal placeholder pages (privacy, terms, acceptable use, data deletion)
- [ ] "Site Inspector" references purged
- [ ] index.html meta tags updated
- [ ] design_guidelines.md deleted or replaced

---

## CURRENT STATE CHANGELOG

| Date | Changes |
|------|---------|
| 2026-03-31 | Phase C: DeepSeek prompt rewrites committed (7580e56). All 3 prompts now platform-aware. README updated. |
| 2026-04-02 | Site overhaul prompt written. Ecosystem footer prompt written. Brand color audit completed — wrong colors identified throughout frontend. |

**AGENTS: Update this section on every commit. Your work is not done until this changelog reflects it.**
