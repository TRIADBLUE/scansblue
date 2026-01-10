# SITEINSPECTOR → SCANSBLUE COMPLETE REBRAND
## Full Brand Identity Update

---

## 🤖 AGENT INSTRUCTIONS - READ FIRST

You are rebranding the entire SiteInspector application to ScansBlue. This is a complete brand identity change including:
- Domain change: siteinspector.dev → scansblue.com
- Name change: SiteInspector → ScansBlue
- Logo replacement (new files provided)
- Tagline update
- All user-facing text

**CRITICAL:** This is NOT just a find-replace. You must:
1. Update all brand assets (logos, favicons)
2. Update all metadata (titles, descriptions, OpenGraph)
3. Update all user-facing text
4. Update all email templates
5. Keep internal code/file names unchanged (only user-facing changes)
6. Test all pages render correctly

**Do NOT:**
- Rename database tables
- Rename component files
- Rename route files
- Break any existing functionality

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
Three new files have been uploaded:
1. `scansblue-logo-icon.png` - Full logo with text + icon
2. `scansblue-logo-url.png` - Logo with "scansblue.com" URL
3. `scansblue_icon.png` - Icon only (shield with magnifying glass)

---

## 📁 STEP 1: REPLACE BRAND ASSETS

### **1. Logo Files**

**Replace these files in `/client/public/`:**
- DO NOT THROW OUT IMAGES.  ARCHIVE THEM IN THE ASSOCIATED FOLDER

```bash
# Old files (remove or rename):
- siteinspector-logo.png
- siteinspector-icon.png
- logo.png
- icon.png

# New files (add from uploads):
- scansblue-logo-icon.png (full logo with icon)
- scansblue-logo-url.png (logo with domain)
- scansblue_icon.png (icon only)
- logo.png (copy of scansblue-logo-icon.png for default usage)
```

**IMPORTANT:** Files are uploaded to `/client/public/` directory, NOT `/public/`

### **2. Favicon**

**Update favicon files in `/client/public/`:**

```bash
# Generate favicon sizes from scansblue_icon.png:
- favicon.ico (16x16, 32x32, 48x48)
- favicon-16x16.png
- favicon-32x32.png
- apple-touch-icon.png (180x180)
- android-chrome-192x192.png
- android-chrome-512x512.png
```

**Update in `/client/public/index.html` or equivalent:**
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

---

## 📝 STEP 2: UPDATE SITE METADATA

### **1. HTML Head / Meta Tags**

**Update in main HTML or layout component:**

```html
<head>
  <title>ScansBlue - Your Site Inspector Agent</title>
  <meta name="description" content="Website Analysis, Clarified. Understand structure, performance, and hidden issues instantly.">
  
  <!-- Open Graph -->
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
  
  <!-- Additional -->
  <meta name="application-name" content="ScansBlue">
  <meta name="apple-mobile-web-app-title" content="ScansBlue">
</head>
```

### **2. manifest.json (PWA)**

**Update `/client/public/manifest.json`:**

```json
{
  "name": "ScansBlue",
  "short_name": "ScansBlue",
  "description": "Your Site Inspector Agent - Website Analysis, Clarified",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#EEFBFF",
  "theme_color": "#0000FF",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🏠 STEP 3: UPDATE HOMEPAGE & MAIN UI

### **1. Header/Navigation**

**Find header component (likely `components/Header.tsx` or similar):**

```tsx
// Replace logo:
<img src="/scansblue-logo-icon.png" alt="ScansBlue" className="h-8" />

// Or if using URL version:
<img src="/scansblue-logo-url.png" alt="ScansBlue.com" className="h-8" />
```

### **2. Homepage Hero Section**

**Update main landing page:**

```html
<h1>ScansBlue</h1>
<h2>Your Site Inspector Agent</h2>
<p class="tagline">Website Analysis, Clarified</p>
<p class="description">
  Understand structure, performance, and hidden issues instantly
</p>
```

### **3. Footer**

**Update footer:**

```html
<footer>
  <div class="logo">
    <img src="/scansblue_icon.png" alt="ScansBlue" />
  </div>
  <p>&copy; 2026 ScansBlue. All rights reserved.</p>
  <p>Your Site Inspector Agent</p>
</footer>
```

### **4. About/Info Pages**

**Update any about, help, or documentation pages:**
- Replace "SiteInspector" with "ScansBlue"
- Update company name
- Update contact information (if any)
- Update domain references

---

## 📧 STEP 4: UPDATE EMAIL TEMPLATES

### **1. Find Email Templates**

**Likely locations:**
- `server/services/email.ts`
- `server/templates/emails/`
- Any email generation functions

### **2. Update All Email Content**

**Replace in ALL emails:**

```
OLD: SiteInspector
NEW: ScansBlue

OLD: siteinspector.dev
NEW: scansblue.com
```

**Example Email Header:**

```html
<div style="text-align: center; padding: 20px; background: #EEFBFF;">
  <img src="https://scansblue.com/scansblue-logo-icon.png" 
       alt="ScansBlue" 
       style="height: 60px;" />
  <h2 style="color: #0000FF; margin: 10px 0;">ScansBlue</h2>
  <p style="color: #09080E; font-size: 14px;">Your Site Inspector Agent</p>
</div>
```

**Example Email Footer:**

```html
<div style="text-align: center; padding: 20px; background: #f2f4f6; color: #09080E;">
  <p><strong>ScansBlue</strong></p>
  <p>Website Analysis, Clarified</p>
  <p style="font-size: 12px;">&copy; 2026 ScansBlue. All rights reserved.</p>
  <p style="font-size: 12px;">
    <a href="https://scansblue.com" style="color: #0000FF;">scansblue.com</a>
  </p>
</div>
```

---

## 🔍 STEP 5: UPDATE USER-FACING TEXT

### **Global Find & Replace Rules:**

**In ALL user-facing components:**

```
FIND: "SiteInspector"
REPLACE: "ScansBlue"

FIND: "Site Inspector"
REPLACE: "ScansBlue"

FIND: "siteinspector.dev"
REPLACE: "scansblue.com"

FIND: "siteinspector"
REPLACE: "scansblue"
```

**DO NOT replace in:**
- Database table names
- Component file names
- Internal function names
- API route paths (unless user-visible)
- Environment variable names (update separately)

### **Specific UI Text Updates:**

**Navigation/Buttons:**
```
"Run SiteInspector" → "Run ScansBlue"
"Get SiteInspector Report" → "Get ScansBlue Report"
"SiteInspector Analysis" → "ScansBlue Analysis"
```

**Page Titles:**
```
"SiteInspector - Quick Analysis" → "ScansBlue - Quick Analysis"
"SiteInspector - Comprehensive Analysis" → "ScansBlue - Comprehensive Analysis"
"SiteInspector - Code Auditor" → "ScansBlue - Code Auditor"
```

**Status Messages:**
```
"SiteInspector is analyzing..." → "ScansBlue is analyzing..."
"SiteInspector found X issues" → "ScansBlue found X issues"
```

---

## ⚙️ STEP 6: UPDATE CONFIGURATION FILES

### **1. Environment Variables**

**Update `.env` or Replit Secrets:**

```env
# Domain
SITE_URL=https://scansblue.com
SITE_NAME=ScansBlue

# API (if needed)
API_URL=https://scansblue.com/api

# Email sender
EMAIL_FROM=noreply@scansblue.com
EMAIL_FROM_NAME=ScansBlue
```

### **2. Package.json**

```json
{
  "name": "scansblue",
  "version": "2.0.0",
  "description": "Your Site Inspector Agent - Website Analysis, Clarified",
  "homepage": "https://scansblue.com"
}
```

### **3. README.md**

**Update project README:**

```markdown
# ScansBlue

**Your Site Inspector Agent**

Website Analysis, Clarified. Understand structure, performance, and hidden issues instantly.

## About

ScansBlue is a comprehensive website analysis tool that helps you understand your site's structure, performance, and hidden issues.

## Website

https://scansblue.com
```

---

## 📱 STEP 7: UPDATE SPECIFIC PAGES

### **1. Homepage (`/`)**

**Quick Analysis Page:**

```tsx
<div className="hero">
  <img src="/scansblue-logo-icon.png" alt="ScansBlue" className="logo" />
  <h1>ScansBlue</h1>
  <h2>Your Site Inspector Agent</h2>
  <p className="tagline">Website Analysis, Clarified</p>
  <p className="description">
    Understand structure, performance, and hidden issues instantly
  </p>
  
  <form onSubmit={handleSubmit}>
    <input 
      type="url" 
      placeholder="Enter website URL to analyze..." 
      required 
    />
    <button type="submit">Analyze with ScansBlue</button>
  </form>
</div>
```

### **2. Analysis Page (`/analyze`)**

**Comprehensive Analysis:**

```tsx
<h1>Comprehensive Website Analysis</h1>
<p>ScansBlue will crawl up to 50 pages and provide detailed recommendations.</p>
```

### **3. Auditor Page (`/auditor`)**

**Code Auditor:**

```tsx
<h1>ScansBlue Code & Site Auditor</h1>
<p>Chat with AI about your code, website, or business</p>
```

### **4. Results Pages**

**Analysis Results:**

```tsx
<h2>ScansBlue Analysis Complete</h2>
<p>ScansBlue analyzed {pageCount} pages and found {issueCount} issues.</p>
```

---

## 🧪 STEP 8: TESTING CHECKLIST

### **Visual Verification:**
- [ ] Homepage displays new logo correctly
- [ ] Favicon shows in browser tab
- [ ] All navigation items updated
- [ ] Footer shows correct branding
- [ ] Mobile view displays correctly

### **Functional Testing:**
- [ ] Quick Analysis still works
- [ ] Comprehensive Analysis still works
- [ ] Code Auditor still works
- [ ] All API endpoints respond
- [ ] Results display correctly

### **Text Verification:**
- [ ] No "SiteInspector" text visible to users
- [ ] No "siteinspector.dev" URLs visible
- [ ] All email templates updated
- [ ] Error messages updated
- [ ] Success messages updated

### **Metadata Testing:**
- [ ] Page title shows "ScansBlue"
- [ ] OpenGraph image is new logo
- [ ] Share links show correct branding
- [ ] PWA manifest updated

### **Email Testing:**
- [ ] Send test analysis report email
- [ ] Verify logo displays
- [ ] Verify all text says "ScansBlue"
- [ ] Verify links point to scansblue.com

---

## 📋 FILES TO UPDATE CHECKLIST

**Public Assets:**
- [ ] `/public/scansblue-logo-icon.png` (add)
- [ ] `/public/scansblue-logo-url.png` (add)
- [ ] `/public/scansblue_icon.png` (add)
- [ ] `/public/favicon.ico` (update)
- [ ] `/public/manifest.json` (update)

**HTML/Meta:**
- [ ] Main HTML file (title, meta tags)
- [ ] OpenGraph tags
- [ ] Twitter card tags

**Components:**
- [ ] Header component (logo)
- [ ] Footer component (branding)
- [ ] Homepage hero
- [ ] Navigation items
- [ ] Any "About" pages

**Email Templates:**
- [ ] All email templates (headers, footers, body text)
- [ ] Email sender name/address

**Configuration:**
- [ ] Environment variables
- [ ] package.json
- [ ] README.md

**User-Facing Text:**
- [ ] All button labels
- [ ] All page titles
- [ ] All status messages
- [ ] All help text

---

## ⚠️ CRITICAL REMINDERS

1. **DO NOT rename:**
   - Database tables (keep as `site_inspector_*`)
   - Component files (keep as `SiteInspector*.tsx`)
   - API route paths (unless user-visible)

2. **DO rename/update:**
   - All user-facing text
   - All brand assets (logos, favicons)
   - All metadata (titles, descriptions)
   - All email content

3. **Test thoroughly:**
   - Every page should load
   - Every feature should work
   - No broken images
   - No "SiteInspector" visible to users

4. **Deployment:**
   - DNS will be handled externally
   - App should work on scansblue.com domain
   - Update any hardcoded domain references

---

## ✅ COMPLETION CRITERIA

**Before marking complete, provide:**

1. **Screenshot Evidence:**
   - Homepage with new logo
   - Browser tab showing new favicon
   - Footer with new branding
   - Sample analysis results page

2. **Text Verification:**
   - Confirmation that no "SiteInspector" text is visible to users
   - Confirmation that all emails updated
   - List of files modified

3. **Functional Testing:**
   - Run one full analysis test
   - Verify results display correctly
   - Confirm email sends with new branding

4. **Files Updated:**
   - Complete list of all files modified
   - Confirmation that logos are in place
   - Confirmation that metadata is updated

---

**BEGIN REBRAND. FOLLOW STEPS IN ORDER. REPORT PROGRESS AFTER EACH STEP.**

*End of ScansBlue Rebrand Prompt*
