# SITEINSPECTOR → SCANSBLUE COMPLETE REBRAND
## Comprehensive Brand Identity & Internal Code Update

---

## 🤖 AGENT INSTRUCTIONS - READ FIRST

You are performing a COMPLETE rebrand of the SiteInspector application to ScansBlue. This includes:
- ALL user-facing content (logos, text, emails, pages)
- ALL internal code (files, functions, variables, classes)
- ALL database structures (tables, columns, indexes, constraints)
- ALL configuration (env vars, scripts, routes)
- ALL documentation (comments, README, guides)

**This is NOT a partial rebrand. Everything changes from SiteInspector to ScansBlue.**

**CRITICAL:** You must:
1. Plan the complete migration strategy first
2. Execute each step systematically
3. Test after each major change
4. Verify nothing breaks
5. Report completion with evidence

**Do NOT:**
- Skip any steps
- Assume something doesn't need changing
- Break existing functionality
- Deploy without testing

---

## 🎨 NEW BRAND IDENTITY

### **Brand Name:**
**ScansBlue** (one word, camelCase)

### **Tagline:**
"Your Site Inspector Agent"

### **Subheadline:**
"Website Analysis, Clarified"

### **Description:**
"Understand structure, performance, and hidden issues instantly"

### **Domain:**
scansblue.com

### **Color Scheme:**
- Primary: #0000FF (Master Blue)
- Secondary: #B91C1C (Red/Burgundy - from logo)
- Accent: #10B981 (Green - .com)
- Background: #EEFBFF (Light Blue)
- Text: #09080E (Triad Black)

### **Brand Assets Provided:**
Three new files:
1. `scansblue-logo-icon.png` - Full logo with text + icon (shield with magnifying glass)
2. `scansblue-logo-url.png` - Logo with "scansblue.com" URL
3. `scansblue_icon.png` - Icon only (shield with magnifying glass inspector)

---

## 📋 PHASE 1: BRAND ASSETS & USER-FACING CONTENT

### **STEP 1: REPLACE LOGO FILES**

**Location:** `/client/public/`

**Remove/rename old files:**
```
siteinspector-logo.png (deprecate)
siteinspector-icon.png (deprecate)
logo.png (replace)
icon.png (replace)
```

**Add new files:**
```
/client/public/scansblue-logo-icon.png (full logo)
/client/public/scansblue-logo-url.png (logo with URL)
/client/public/scansblue_icon.png (icon only)
/client/public/logo.png (copy of scansblue-logo-icon.png)
/client/public/icon.png (copy of scansblue_icon.png)
```

---

### **STEP 2: UPDATE FAVICON**

**Generate favicon sizes from scansblue_icon.png:**

```bash
# Required favicon files in /client/public/:
favicon.ico (16x16, 32x32, 48x48 multi-resolution)
favicon-16x16.png
favicon-32x32.png
apple-touch-icon.png (180x180)
android-chrome-192x192.png
android-chrome-512x512.png
```

**Update HTML head:**

**File:** `/client/public/index.html` or equivalent

```html
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/manifest.json">
```

---

### **STEP 3: UPDATE SITE METADATA**

**File:** Main HTML file or layout component

```html
<head>
  <!-- Basic Meta -->
  <title>ScansBlue - Your Site Inspector Agent</title>
  <meta name="description" content="Website Analysis, Clarified. Understand structure, performance, and hidden issues instantly.">
  <meta name="keywords" content="website analysis, site inspector, performance, SEO, accessibility, ScansBlue">
  
  <!-- Open Graph (Social Sharing) -->
  <meta property="og:title" content="ScansBlue - Your Site Inspector Agent">
  <meta property="og:description" content="Website Analysis, Clarified. Understand structure, performance, and hidden issues instantly.">
  <meta property="og:image" content="https://scansblue.com/scansblue-logo-icon.png">
  <meta property="og:url" content="https://scansblue.com">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ScansBlue">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="ScansBlue - Your Site Inspector Agent">
  <meta name="twitter:description" content="Website Analysis, Clarified. Understand structure, performance, and hidden issues instantly.">
  <meta name="twitter:image" content="https://scansblue.com/scansblue-logo-icon.png">
  <meta name="twitter:site" content="@scansblue">
  
  <!-- Additional -->
  <meta name="application-name" content="ScansBlue">
  <meta name="apple-mobile-web-app-title" content="ScansBlue">
  <meta name="theme-color" content="#0000FF">
</head>
```

---

### **STEP 4: UPDATE PWA MANIFEST**

**File:** `/client/public/manifest.json`

```json
{
  "name": "ScansBlue",
  "short_name": "ScansBlue",
  "description": "Your Site Inspector Agent - Website Analysis, Clarified",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#EEFBFF",
  "theme_color": "#0000FF",
  "orientation": "any",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity", "utilities"],
  "lang": "en-US"
}
```

---

### **STEP 5: UPDATE HOMEPAGE**

**Find:** Homepage component (likely `/` route)

**Update hero section:**

```tsx
<div className="hero">
  <img 
    src="/scansblue-logo-icon.png" 
    alt="ScansBlue - Your Site Inspector Agent" 
    className="logo"
  />
  <h1>ScansBlue</h1>
  <h2>Your Site Inspector Agent</h2>
  <p className="tagline">Website Analysis, Clarified</p>
  <p className="description">
    Understand structure, performance, and hidden issues instantly
  </p>
  
  <form onSubmit={handleQuickAnalysis}>
    <input 
      type="url" 
      placeholder="Enter website URL to analyze with ScansBlue..." 
      required 
    />
    <button type="submit">Analyze with ScansBlue</button>
  </form>
</div>
```

---

### **STEP 6: UPDATE HEADER/NAVIGATION**

**Find:** Header component

```tsx
<header>
  <nav>
    <div className="logo">
      <Link to="/">
        <img src="/scansblue-logo-url.png" alt="ScansBlue.com" />
      </Link>
    </div>
    <ul>
      <li><Link to="/">Quick Analysis</Link></li>
      <li><Link to="/analyze">Comprehensive Analysis</Link></li>
      <li><Link to="/auditor">Code Auditor</Link></li>
    </ul>
  </nav>
</header>
```

---

### **STEP 7: UPDATE FOOTER**

```tsx
<footer>
  <div className="footer-content">
    <div className="footer-logo">
      <img src="/scansblue_icon.png" alt="ScansBlue" />
      <p><strong>ScansBlue</strong></p>
      <p>Your Site Inspector Agent</p>
    </div>
    <div className="footer-links">
      <a href="/about">About</a>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
    </div>
  </div>
  <div className="footer-copyright">
    <p>&copy; 2026 ScansBlue. All rights reserved.</p>
    <p>Website Analysis, Clarified</p>
  </div>
</footer>
```

---

### **STEP 8: UPDATE PAGE TITLES**

**Find all page components and update titles:**

```tsx
// Quick Analysis Page (/)
<title>ScansBlue - Quick Website Analysis</title>

// Comprehensive Analysis Page (/analyze)
<title>ScansBlue - Comprehensive Analysis</title>

// Code Auditor Page (/auditor)
<title>ScansBlue - Code & Site Auditor</title>

// Results Pages
<title>ScansBlue Analysis Results</title>
```

---

### **STEP 9: UPDATE ALL UI TEXT**

**Global find & replace in user-facing components:**

```
FIND: "SiteInspector"
REPLACE: "ScansBlue"

FIND: "Site Inspector"
REPLACE: "ScansBlue"

FIND: "siteinspector.dev"
REPLACE: "scansblue.com"
```

**Specific UI updates:**

**Buttons:**
```tsx
"Run SiteInspector Analysis" → "Run ScansBlue Analysis"
"Get SiteInspector Report" → "Get ScansBlue Report"
```

**Status Messages:**
```tsx
"SiteInspector is analyzing..." → "ScansBlue is analyzing..."
"SiteInspector found 12 issues" → "ScansBlue found 12 issues"
```

**Results Headers:**
```tsx
"SiteInspector Analysis Complete" → "ScansBlue Analysis Complete"
```

---

### **STEP 10: UPDATE EMAIL TEMPLATES**

**Find:** Email generation code (likely `server/` directory)

**Email structure (all emails):**

```html
<!-- Email Header -->
<div style="text-align: center; padding: 20px; background: #EEFBFF;">
  <img 
    src="https://scansblue.com/scansblue-logo-icon.png" 
    alt="ScansBlue" 
    style="height: 60px;"
  />
  <h2 style="color: #0000FF; margin: 10px 0;">ScansBlue</h2>
  <p style="color: #09080E; font-size: 14px;">Your Site Inspector Agent</p>
</div>

<!-- Email Content -->
<!-- (varies by email type) -->

<!-- Email Footer -->
<div style="text-align: center; padding: 20px; background: #f2f4f6; color: #09080E;">
  <img src="https://scansblue.com/scansblue_icon.png" alt="ScansBlue" style="height: 40px; margin-bottom: 10px;">
  <p><strong>ScansBlue</strong></p>
  <p>Website Analysis, Clarified</p>
  <p style="font-size: 12px;">&copy; 2026 ScansBlue. All rights reserved.</p>
  <p style="font-size: 12px;">
    <a href="https://scansblue.com" style="color: #0000FF;">scansblue.com</a>
  </p>
</div>
```

**Update all email text:**
- Analysis complete emails
- Report ready emails
- Error notification emails
- Any automated emails

---

### **STEP 11: UPDATE ABOUT/HELP PAGES**

**Update content in:**
- About page
- Help/Documentation pages
- FAQ page
- Privacy Policy (company name)
- Terms of Service (company name)
- Contact page

---

## 📋 PHASE 2: INTERNAL CODE REBRAND

### **STEP 12: RENAME DATABASE TABLES**

**Create migration file:**

```sql
-- Migration: rename_siteinspector_to_scansblue
-- Date: 2026-01-10

ALTER TABLE site_inspector_results RENAME TO scans_blue_results;
ALTER TABLE site_inspector_analyses RENAME TO scans_blue_analyses;
ALTER TABLE site_inspector_reports RENAME TO scans_blue_reports;
-- Add any other tables with siteinspector naming
```

**Update Drizzle schema:**

**File:** `db/schema.ts` or `server/db/schema.ts`

```typescript
// OLD
export const siteInspectorResults = pgTable('site_inspector_results', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  status: text('status').notNull(),
  results: jsonb('results'),
  createdAt: timestamp('created_at').defaultNow(),
});

// NEW
export const scansBlueResults = pgTable('scans_blue_results', {
  id: serial('id').primaryKey(),
  url: text('url').notNull(),
  status: text('status').notNull(),
  results: jsonb('results'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

### **STEP 13: UPDATE DATABASE INDEXES**

```sql
-- Find all indexes
SELECT indexname FROM pg_indexes WHERE tablename LIKE '%site_inspector%';

-- Rename each one
ALTER INDEX site_inspector_results_url_idx 
RENAME TO scans_blue_results_url_idx;

ALTER INDEX site_inspector_results_created_at_idx 
RENAME TO scans_blue_results_created_at_idx;

-- Repeat for all indexes
```

---

### **STEP 14: UPDATE FOREIGN KEY CONSTRAINTS**

```sql
-- Rename foreign key constraints
ALTER TABLE scans_blue_results 
RENAME CONSTRAINT site_inspector_results_user_id_fkey 
TO scans_blue_results_user_id_fkey;

-- Repeat for all constraints
```

---

### **STEP 15: RENAME ALL FILES**

**Find all files with "siteinspector" or "SiteInspector" in filename:**

```bash
# Find files
find . -name "*siteinspector*" -o -name "*SiteInspector*"
```

**Rename systematically:**

```
server/services/siteinspector.ts → server/services/scansblue.ts
server/routes/siteinspector.ts → server/routes/scansblue.ts
client/components/SiteInspectorResults.tsx → client/components/ScansBlueResults.tsx
client/pages/siteinspector-analyze.tsx → client/pages/scansblue-analyze.tsx
```

**Rename ALL files containing siteinspector in name.**

---

### **STEP 16: UPDATE ALL IMPORTS**

**After renaming files, update all imports:**

```typescript
// OLD
import { SiteInspectorService } from './services/siteinspector';
import SiteInspectorResults from './components/SiteInspectorResults';

// NEW
import { ScansBlueService } from './services/scansblue';
import ScansBlueResults from './components/ScansBlueResults';
```

---

### **STEP 17: RENAME COMPONENTS**

```typescript
// OLD
export function SiteInspectorResults() { }
export class SiteInspectorService { }
export const SiteInspectorCard = () => { };

// NEW
export function ScansBlueResults() { }
export class ScansBlueService { }
export const ScansBlueCard = () => { };
```

---

### **STEP 18: RENAME FUNCTIONS**

```typescript
// OLD
async function triggerSiteInspectorAnalysis() { }
async function getSiteInspectorResults() { }
function parseSiteInspectorData() { }

// NEW
async function triggerScansBlueAnalysis() { }
async function getScansBlueResults() { }
function parseScansBlueData() { }
```

---

### **STEP 19: RENAME VARIABLES**

```typescript
// OLD
const siteInspectorData = await fetch(...);
let siteInspectorResults = [];
const hasSiteInspectorReport = true;

// NEW
const scansBlueData = await fetch(...);
let scansBlueResults = [];
const hasScansBlueReport = true;
```

---

### **STEP 20: RENAME API ROUTES**

**Route definitions:**

```typescript
// OLD
app.get('/api/siteinspector/analyze', ...)
app.post('/api/siteinspector/webhook', ...)

// NEW
app.get('/api/scansblue/analyze', ...)
app.post('/api/scansblue/webhook', ...)
```

**Frontend API calls:**

```typescript
// OLD
fetch('/api/siteinspector/analyze', ...)

// NEW
fetch('/api/scansblue/analyze', ...)
```

---

### **STEP 21: UPDATE FRONTEND ROUTES**

**Route definitions:**

```typescript
// OLD
<Route path="/siteinspector" component={SiteInspectorPage} />
<Route path="/siteinspector/results/:id" component={ResultsPage} />

// NEW
<Route path="/scansblue" component={ScansBluePage} />
<Route path="/scansblue/results/:id" component={ResultsPage} />
```

**Navigation links:**

```tsx
// OLD
<Link to="/siteinspector">Go to SiteInspector</Link>

// NEW
<Link to="/scansblue">Go to ScansBlue</Link>
```

---

### **STEP 22: RENAME TYPE DEFINITIONS**

```typescript
// OLD
interface SiteInspectorResults {
  url: string;
  status: string;
  data: any;
}

type SiteInspectorAnalysis = {
  id: number;
  results: any;
};

// NEW
interface ScansBlueResults {
  url: string;
  status: string;
  data: any;
}

type ScansBlueAnalysis = {
  id: number;
  results: any;
};
```

---

### **STEP 23: RENAME CONSTANTS**

```typescript
// OLD
const SITEINSPECTOR_API_URL = process.env.SITEINSPECTOR_API_URL;
const SITEINSPECTOR_MAX_PAGES = 50;

// NEW
const SCANSBLUE_API_URL = process.env.SCANSBLUE_API_URL;
const SCANSBLUE_MAX_PAGES = 50;
```

---

### **STEP 24: UPDATE ENVIRONMENT VARIABLES IN CODE**

```typescript
// OLD
process.env.SITEINSPECTOR_API_KEY
process.env.SITEINSPECTOR_WEBHOOK_URL

// NEW
process.env.SCANSBLUE_API_KEY
process.env.SCANSBLUE_WEBHOOK_URL
```

**Note:** The actual environment variables in Replit Secrets are managed separately. This updates the CODE that reads them.

---

### **STEP 25: UPDATE CSS CLASS NAMES**

```css
/* OLD */
.siteinspector-container { }
.siteinspector-results { }
.siteinspector-card { }

/* NEW */
.scansblue-container { }
.scansblue-results { }
.scansblue-card { }
```

**In components:**

```tsx
// OLD
<div className="siteinspector-results">

// NEW
<div className="scansblue-results">
```

---

### **STEP 26: RENAME TEST FILES**

```
siteinspector.test.ts → scansblue.test.ts
SiteInspectorService.test.ts → ScansBlueService.test.ts
```

**Update test suites:**

```typescript
// OLD
describe('SiteInspector service', () => {
  it('should analyze websites', () => {

// NEW
describe('ScansBlue service', () => {
  it('should analyze websites', () => {
```

---

### **STEP 27: UPDATE MOCK DATA**

```typescript
// OLD
const mockSiteInspectorData = {
  url: 'example.com',
  analysis: { }
};

// NEW
const mockScansBlueData = {
  url: 'example.com',
  analysis: { }
};
```

---

### **STEP 28: UPDATE LOG MESSAGES**

```typescript
// OLD
console.log('[SiteInspector] Analysis started');
logger.info('SiteInspector webhook received');

// NEW
console.log('[ScansBlue] Analysis started');
logger.info('ScansBlue webhook received');
```

---

### **STEP 29: UPDATE ERROR MESSAGES**

```typescript
// OLD
throw new Error('SiteInspector API failed');
return { error: 'Could not connect to SiteInspector' };

// NEW
throw new Error('ScansBlue API failed');
return { error: 'Could not connect to ScansBlue' };
```

---

### **STEP 30: UPDATE COMMENTS**

```typescript
// OLD
// Trigger SiteInspector analysis
// SiteInspector API client
/* SiteInspector webhook handler */

// NEW
// Trigger ScansBlue analysis
// ScansBlue API client
/* ScansBlue webhook handler */
```

---

### **STEP 31: UPDATE ZOD SCHEMAS**

```typescript
// OLD
const siteInspectorResultsSchema = z.object({
  url: z.string(),
  status: z.enum(['pending', 'completed']),
});

// NEW
const scansBlueResultsSchema = z.object({
  url: z.string(),
  status: z.enum(['pending', 'completed']),
});
```

---

### **STEP 32: UPDATE SERVICE INSTANCES**

```typescript
// OLD
export const siteInspectorService = new SiteInspectorService();

// NEW
export const scansBlueService = new ScansBlueService();
```

**Update all imports of this instance.**

---

### **STEP 33: UPDATE PACKAGE.JSON**

```json
{
  "name": "scansblue",
  "version": "2.0.0",
  "description": "Your Site Inspector Agent - Website Analysis, Clarified",
  "homepage": "https://scansblue.com",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/scansblue"
  },
  "keywords": [
    "scansblue",
    "website-analysis",
    "site-inspector"
  ],
  "scripts": {
    "test:siteinspector": "..." → "test:scansblue": "...",
  }
}
```

---

### **STEP 34: UPDATE README**

**File:** `README.md`

```markdown
# ScansBlue

**Your Site Inspector Agent**

Website Analysis, Clarified. Understand structure, performance, and hidden issues instantly.

## About

ScansBlue is a comprehensive website analysis tool providing:
- Quick Analysis (10 pages, 8 categories)
- Comprehensive Analysis (50+ pages, prioritized tasks)
- AI Code Auditor (chat-based code review)

## Website

https://scansblue.com

## API

ScansBlue provides an API for integration with other platforms.

[Rest of README with updated references]
```

---

### **STEP 35: UPDATE CONFIGURATION FILES**

**Environment variables template (.env.example):**

```env
# ScansBlue Configuration
SCANSBLUE_API_KEY=your-api-key
SCANSBLUE_WEBHOOK_URL=https://your-site.com/webhook

# Database
DATABASE_URL=postgresql://...

# External Services
BROWSERLESS_API_KEY=...
DEEPSEEK_API_KEY=...
```

---

## 🔍 COMPREHENSIVE FIND & REPLACE

**Execute these in order (case-sensitive):**

1. **PascalCase:**
   - Find: `SiteInspector`
   - Replace: `ScansBlue`

2. **camelCase:**
   - Find: `siteInspector`
   - Replace: `scansBlue`

3. **snake_case:**
   - Find: `site_inspector`
   - Replace: `scans_blue`

4. **kebab-case:**
   - Find: `site-inspector`
   - Replace: `scans-blue`

5. **UPPERCASE:**
   - Find: `SITEINSPECTOR`
   - Replace: `SCANSBLUE`

6. **lowercase (routes/paths):**
   - Find: `siteinspector`
   - Replace: `scansblue`

7. **Domain:**
   - Find: `siteinspector.dev`
   - Replace: `scansblue.com`

---

## ⚠️ EXCEPTIONS - DO NOT CHANGE

1. **Git history** - Old commits stay as-is
2. **CHANGELOG.md** - Historical entries stay as SiteInspector
3. **Migration filenames** - Keep for history
4. **node_modules** - Don't touch
5. **External API payloads** - If third-party services send "siteInspector" fields, keep them

---

## 🧪 TESTING CHECKLIST

### **Visual Tests:**
- [ ] Homepage displays ScansBlue logo correctly
- [ ] Favicon shows ScansBlue icon in browser tab
- [ ] Header navigation shows ScansBlue branding
- [ ] Footer shows ScansBlue information
- [ ] All pages have updated titles

### **Functional Tests:**
- [ ] Quick Analysis works (/)
- [ ] Comprehensive Analysis works (/analyze)
- [ ] Code Auditor works (/auditor)
- [ ] Results display correctly
- [ ] All API endpoints respond

### **Database Tests:**
- [ ] Can query scans_blue_results table
- [ ] Can insert new records
- [ ] Foreign keys work
- [ ] Indexes improve query performance

### **Code Tests:**
- [ ] Application builds without errors
- [ ] No import errors
- [ ] All renamed functions work
- [ ] All renamed components render
- [ ] TypeScript has no errors

### **Integration Tests:**
- [ ] Run full analysis (Quick)
- [ ] Run full analysis (Comprehensive)
- [ ] Test Code Auditor chat
- [ ] Verify results save to database
- [ ] Verify emails send correctly

---

## 📋 COMPLETION CHECKLIST

Before reporting complete:

### **Assets & UI:**
- [ ] All logos replaced
- [ ] Favicon updated
- [ ] PWA manifest updated
- [ ] All page titles updated
- [ ] Homepage updated
- [ ] Header/nav updated
- [ ] Footer updated
- [ ] Email templates updated

### **Internal Code:**
- [ ] Database tables renamed
- [ ] Database indexes renamed
- [ ] Foreign keys renamed
- [ ] All files renamed
- [ ] All imports updated
- [ ] All components renamed
- [ ] All functions renamed
- [ ] All variables renamed
- [ ] All API routes renamed
- [ ] All frontend routes renamed
- [ ] All types renamed
- [ ] All constants renamed
- [ ] CSS classes renamed
- [ ] Test files renamed
- [ ] Comments updated
- [ ] Log messages updated
- [ ] Error messages updated

### **Configuration:**
- [ ] package.json updated
- [ ] README.md updated
- [ ] .env.example updated
- [ ] Documentation updated

### **Testing:**
- [ ] All visual tests pass
- [ ] All functional tests pass
- [ ] All database tests pass
- [ ] All code tests pass
- [ ] All integration tests pass
- [ ] No "SiteInspector" found in codebase (except historical/comments)

---

## 🚨 MIGRATION STRATEGY

**Recommended: All-at-once deployment**

1. Complete all changes in development
2. Test thoroughly
3. Create database backup
4. Run database migrations
5. Deploy all code changes
6. Update DNS to point to scansblue.com
7. Monitor for issues

**Timeline:** ~4-6 hours for complete rebrand

---

## ✅ COMPLETION REPORT

When complete, provide:

1. **List of all files renamed** (before/after)
2. **Database migration script** (SQL)
3. **Test results** (all tests passing)
4. **Screenshots:**
   - Homepage
   - Browser tab (favicon)
   - Analysis results page
   - Email template
5. **Confirmation:** No "SiteInspector" found in user-facing content

---

**BEGIN COMPLETE REBRAND NOW.**

Follow steps in order. Test after each major phase. Report progress regularly.
