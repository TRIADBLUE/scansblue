# COMPREHENSIVE PRESCRIPTION SYSTEM UPDATE
## Fix Emails + Prescriptions + Assessment + Product Integration

**Priority:** CRITICAL  
**Complexity:** Very High  
**Estimated Time:** 12-16 hours  

---

## ⚠️ MANDATORY FIRST STEPS ⚠️

**STOP. Before doing ANYTHING, you MUST:**

1. **Read ALL required TriadBlue documentation:**
   - `/docs/AI_OPERATIONS_GUIDE.md`
   - `/docs/TEAM_PROTOCOL.md`
   - `/docs/replit.md`
   - `/docs/TRIAD_BLUE_STANDARDS.md`
   - `/docs/_constants.md`
   - `/docs/SYSTEM_KNOWLEDGE_BASE.md`
   - This entire implementation prompt

2. **Read the Product Catalog** (below) - memorize every product
3. **Understand the Selling Strategy** - prescriptions MUST sell our products
4. **Create detailed implementation plan**
5. **Present plan to Dean for approval**
6. **WAIT for explicit approval** before writing any code

---

## 🎯 TRIADBLUE PRODUCT CATALOG

### **COMMUNICATIONS UNIVERSE - CommVerse Bundle ($99/mo)**

**Individual Apps (if sold separately: $34/mo each):**

1. **Inbox** - Unified Communication Hub
   - Consolidates email, SMS, social messages, live chat into ONE inbox
   - Never miss a customer message again
   - Respond faster, close more deals
   - Track response times and conversation history
   - Icon: `/public/assets/approved icons and logos/Additional Apps/icon-inbox.png`

2. **Send** - Email & SMS Marketing Platform
   - Build and segment your customer list
   - Create professional email campaigns
   - Send targeted SMS messages
   - Automated drip campaigns
   - Track open rates, clicks, conversions
   - Icon: `/public/assets/approved icons and logos/Additional Apps/icon-send.png`

3. **Content** - Social Media Management
   - Schedule posts across all platforms
   - Create engaging content with AI assistance
   - Track engagement and performance
   - Respond to comments and DMs
   - Content calendar and planning tools
   - Icon: `/public/assets/approved icons and logos/Additional Apps/icon-content.png`

4. **LiveChat** - Website Chat Widget
   - Real-time customer support
   - Proactive chat invitations
   - Mobile app for on-the-go responses
   - Chat transcripts and history
   - Lead capture and qualification
   - Icon: `/public/assets/approved icons and logos/Additional Apps/icon-livechat.png`

**Bundle Value:** Get all 4 for $99/mo instead of $136/mo separately = **SAVE $37/month**

---

### **LOCAL PRESENCE - LocalBlue ($59/mo)**

**Individual Services (if sold separately: $39/mo each):**

1. **Listings** - Business Listings Management
   - Manage 50+ directory listings from one dashboard
   - Ensure NAP (Name, Address, Phone) consistency
   - Update hours, services, photos across all platforms
   - Monitor listing performance
   - Icon: `/public/assets/approved icons and logos/Additional Apps/icon-listings.png`

2. **Reputation** - Ratings & Review Management
   - Monitor reviews across all platforms
   - Automated review request campaigns
   - Respond to reviews from one dashboard
   - Sentiment analysis and trending
   - Showcase positive reviews on your website
   - Icon: `/public/assets/approved icons and logos/Additional Apps/icon-reputation.png`

3. **LocalBlue Complete** - Full Local SEO Package
   - Includes Listings + Reputation
   - Google Business Profile optimization
   - Local keyword tracking
   - Competitor analysis
   - Monthly performance reports
   - Icon: `/public/assets/approved icons and logos/Additional Apps/icon-localblue.png`

**Bundle Value:** Get complete local SEO for $59/mo instead of $78/mo separately

---

### **CENTRAL PLATFORM - Relationships CRM ($29/mo)**

**The Truth Center - Everything Starts Here**

- Centralized customer database (single source of truth)
- Track every interaction across all channels
- Customer lifecycle management
- Sales pipeline and opportunity tracking
- Automated follow-ups and reminders
- Integration with all CommVerse and LocalBlue tools
- Custom fields and tagging
- Reports and analytics
- Icon: `/public/assets/approved icons and logos/Additional Apps/approved-apps-relationship-icon.png`

**Free Version Available:**
- Up to 100 contacts
- Basic contact management
- Limited to 1 user
- 30-day activity history

**Paid Version ($29/mo):**
- Unlimited contacts
- Unlimited users
- Full activity history
- Advanced automation
- Custom reports
- API access

---

### **AI MENTOR - Coach Blue ($99/mo)**

**Your 24/7 AI Business Guide**

- Personalized guidance based on YOUR business
- Teaches you how to use the platform
- Explains each app and its benefits
- Helps you implement prescription recommendations
- Answers questions about digital marketing
- Creates step-by-step action plans
- Tracks your progress and celebrates wins
- Available anytime, anywhere
- Integrated throughout the entire platform

**Coach Blue's Personality:**
- Patient and encouraging teacher
- Celebrates your successes
- Makes complex concepts simple
- Always available when you need help
- Knows your business and your goals
- Recommends products when appropriate (with clear benefits/value)

---

### **ASSESSMENT & ANALYSIS - Business IQ Scanner (FREE)**

**What It Does:**
- Scans your entire digital presence automatically
- Analyzes 9 key areas of digital marketing
- Provides Digital IQ Score (0-140 points)
- Generates personalized prescription
- Identifies quick wins and priority improvements
- Shows exactly what's working and what's not

**The 9 Areas Analyzed:**
1. Email & SMS Marketing (0-15 points)
2. Social Media Content (0-13 points)
3. Reputation Management (0-16 points)
4. Customer Response & Timing (0-15 points)
5. Live Chat (0-15 points)
6. Business Listings (0-18 points)
7. Google Business Profile (0-16 points)
8. Website & SEO (0-20 points)
9. CRM Systems (0-12 points)

---

### **EXTERNAL PARTNERS**

1. **SwipesBlue.com** - Payment Processing
   - Integrated payment gateway
   - Shopping cart and checkout
   - Secure payment processing
   - Transaction-fee model (2.9% + 30¢ per transaction)
   - All features included free
   - **This is OUR external product - can recommend**

2. **HostsBlue.com** - Web Services
   - Domain registration and transfer
   - Professional email hosting
   - SSL certificates and trust badges
   - Website builder (drag-and-drop)
   - One-click WordPress install
   - 99.9% uptime guarantee
   - **This is OUR external product - can recommend**

3. **SiteInspector.dev** - Website Analysis Tool
   - **Fast Check:** Quick button-based tests (SSL, mobile, speed, meta tags, broken links)
   - **Full Report:** Complete site crawl with prioritized improvement list
   - **AI Auditor:** DeepSeek-powered analyst for any text/project review
   - Professional-grade analysis without agency fees
   - **This is OUR tool - integrate into assessment and prescriptions**
   - Position as part of BusinessBlueprint ecosystem
   - Use to diagnose issues before recommending HostsBlue as solution

---

## 🔍 SITEINSPECTOR.DEV INTEGRATION STRATEGY

### **Integration Approach: Automated During Assessment (RECOMMENDED)**

**When user submits assessment with website URL:**
1. Business IQ Scanner runs automated presence checks
2. SiteInspector Fast Check runs in parallel (if API available)
3. Results combined into Website & SEO score (0-20 points)
4. Technical issues included in prescription recommendations

**Benefits:**
- More accurate, data-driven Website & SEO scoring
- Specific technical recommendations (not generic)
- No extra user effort required
- Professional analysis included free

### **Enhanced Website Scoring with SiteInspector**

```typescript
// Location: /server/services/presenceScanner.ts

async scanWebsite(url: string): Promise<WebsiteScan> {
  // Existing presence scanner checks (0-10 points)
  const basicScan = await this.checkBasicPresence(url);
  
  // NEW: Add SiteInspector Fast Check (0-10 points)
  const technicalScan = await this.runSiteInspectorCheck(url);
  
  return {
    score: basicScan.score + technicalScan.score, // 0-20 total
    hasWebsite: basicScan.hasWebsite,
    technical: {
      ssl: technicalScan.ssl,
      loadTime: technicalScan.loadTime,
      mobileOptimized: technicalScan.mobile,
      brokenLinks: technicalScan.brokenLinks,
      metaIssues: technicalScan.metaIssues,
      performanceScore: technicalScan.performance,
      issues: technicalScan.priorityIssues
    },
    recommendations: this.generateTechnicalRecommendations(technicalScan)
  };
}

async runSiteInspectorCheck(url: string): Promise<any> {
  try {
    // Option 1: If SiteInspector has API
    const response = await fetch('https://siteinspector.dev/api/fast-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const results = await response.json();
    
    // Calculate technical score (0-10 points)
    let score = 10;
    if (!results.ssl) score -= 2;
    if (results.loadTime > 3) score -= 2;
    if (!results.mobileOptimized) score -= 2;
    if (results.brokenLinks > 5) score -= 2;
    if (results.metaIssues > 10) score -= 2;
    
    return { ...results, score: Math.max(0, score) };
    
  } catch (error) {
    console.error('SiteInspector check failed:', error);
    // Don't block assessment if SiteInspector fails
    return { score: 0, failed: true };
  }
}
```

### **In Prescription Recommendations (Website & SEO)**

When Website & SEO score is low, recommend SiteInspector Full Report + HostsBlue:

```markdown
🌐 **WEBSITE & SEO**

**The Prescription:** Your website needs technical optimization to improve speed, search rankings, and user experience.

**Current Issues Detected:**
${siteInspectorResults.issues.map(issue => `- ${issue}`).join('\n')}

**Why This Matters:**
53% of mobile users abandon sites that take over 3 seconds to load. Google's Core Web Vitals are now a ranking factor - slow sites get buried in search results. Your current load time of ${loadTime} seconds is costing you customers.

**Our Recommendation: Complete Website Optimization**

**Step 1: Get the Full Picture**
Run a complete SiteInspector Full Report to see every issue prioritized by impact. Our AI-powered tool will show you exactly what to fix first.

[Run Full SiteInspector Report →](https://siteinspector.dev?url=${userWebsite})

**Step 2: Fix the Foundation - HostsBlue**
Move to HostsBlue for hosting that solves these issues automatically:
- Lightning-fast load times (under 2 seconds guaranteed)
- Free SSL certificate included
- Mobile-optimized from day one  
- Automatic security updates
- 99.9% uptime SLA

**Step 3: Build It Right**
Use HostsBlue's website builder to create a modern, fast site:
- Drag-and-drop simplicity
- Passes Core Web Vitals automatically
- SEO optimization built-in
- Integrates with LiveChat, Inbox, and all your tools

Once your website is fast and secure, add our LiveChat widget to capture leads and connect Inbox to manage all website inquiries from one dashboard.

[Learn More About HostsBlue →](https://hostsblue.com)
```

### **Coach Blue + SiteInspector Integration**

Update Coach Blue's knowledge and capabilities:

```typescript
// Add to Coach Blue's system prompt

TOOLS AVAILABLE:
- SiteInspector.dev: Website analysis tool
  - Fast Check: Quick tests
  - Full Report: Complete crawl
  - AI Auditor: Text analysis

WHEN TO USE SITEINSPECTOR:
- User asks about website problems
- User mentions slow site, broken links, technical issues
- Website & SEO score is below 12/20
- User wants specific technical guidance

HOW TO USE:
1. Offer to analyze their site
2. Run SiteInspector check
3. Explain results in simple, actionable terms
4. Recommend HostsBlue if major issues found
5. Offer step-by-step help with fixes

EXAMPLE:
User: "My website is really slow"
You: "Let me analyze your site with our SiteInspector tool to see what's causing the slowdown... 

[runs analysis]

I found the main issue: your homepage is loading 15MB of unoptimized images. That's like trying to download a movie every time someone visits. Here's what we need to do:

1. Compress those images (I can show you how)
2. Enable caching (takes 5 minutes)
3. Consider moving to HostsBlue - their hosting is optimized for speed and would solve this automatically

Want me to walk you through the quick fixes first, or would you like to explore HostsBlue?"
```

### **Email Integration**

In assessment report email, if Website & SEO score < 12/20:

```html
<div class="recommendation">
  <div class="flex items-center gap-3 mb-3">
    <img src="/icon-webseo.png" alt="Website" style="width: 48px; height: 48px;" />
    <h3 style="margin: 0; color: #0000FF;">Your Website Needs Attention</h3>
  </div>
  
  <p>Your website scored ${websiteScore}/20. We detected ${issueCount} technical issues that could be hurting your business:</p>
  
  <ul style="margin: 10px 0; padding-left: 20px;">
    ${topIssues.map(issue => `<li>${issue}</li>`).join('')}
  </ul>
  
  <p><strong>Get the Full Analysis:</strong> Run SiteInspector to see everything that needs fixing, prioritized by impact.</p>
  
  <a href="https://siteinspector.dev?url=${userWebsite}" 
     style="display: inline-block; background: #0000FF; color: #EEFBFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
    Analyze My Website →
  </a>
  
  <p style="margin-top: 15px; font-size: 14px; color: #09080E;">
    Once you know what to fix, HostsBlue provides fast, secure hosting and an easy website builder to get your site performing at its best.
  </p>
</div>
```

### **Implementation Checklist**

**Phase 1: Basic Integration**
- [ ] Add SiteInspector Fast Check to assessment flow
- [ ] Enhance Website & SEO scoring with technical data
- [ ] Include technical issues in prescription
- [ ] Add SiteInspector link to Website recommendations

**Phase 2: Advanced Integration**  
- [ ] Coach Blue can trigger SiteInspector on demand
- [ ] Display SiteInspector results in prescription portal
- [ ] Show technical score breakdown (basic + technical)
- [ ] Track which users run Full Reports

**Phase 3: Full Integration**
- [ ] Embed SiteInspector reports in platform
- [ ] Automated follow-up if critical issues found
- [ ] Progress tracking (issues fixed over time)
- [ ] Before/after comparisons for HostsBlue migrations

### **Positioning Strategy**

**In All Communications:**
- "Our website analysis tool, SiteInspector"
- "Built with the same AI technology that powers your assessments"
- "Professional-grade analysis included with BusinessBlueprint"

**Value Proposition:**
- "Agency-level website audits cost $500-2000. We include it free."
- "Know exactly what's wrong and how to fix it"
- "Prioritized by impact so you fix what matters most first"

---

## 🎯 SELLING STRATEGY (CRITICAL)

### **Core Principle: The Prescription IS the Product**

**WRONG Approach (Generic Advice):**
> "You should collect email addresses and send regular campaigns to stay top-of-mind with customers."

**CORRECT Approach (Our Product Solution):**
> "**You need a systematic email marketing platform.** We recommend our **Send** app because it makes this effortless - build your list with automated capture forms, create professional campaigns in minutes, and track exactly what's working. Unlike standalone tools that cost $50-200/month, Send is included in our CommVerse bundle at just $99/month alongside Inbox, Content, and LiveChat."

---

### **Prescription Writing Rules**

**1. Start with the NEED (prescriptive, authoritative)**
   - "You need a CRM system"
   - "Your business requires unified inbox management"
   - "Email marketing is essential for your growth"

**2. Explain WHY it matters**
   - Impact on revenue
   - Time savings
   - Customer experience improvement
   - Competitive advantage

**3. Recommend OUR solution**
   - Name the specific app
   - Explain key benefits (3-5 bullet points)
   - Show how it solves their specific problem

**4. Highlight bundle value (when applicable)**
   - "Get Send as part of CommVerse bundle with 3 other tools"
   - "Save money by bundling"
   - Don't mention specific pricing, just "save" or "included"

**5. Link to product page**
   - Always include clickable link
   - Open in new tab (target="_blank")
   - Link should have clear CTA: "Learn More About Send →"

**6. Never recommend external products**
   - EXCEPTION: HostsBlue and SwipesBlue (our partners)
   - For everything else, recommend OUR solution
   - If we don't have a product for that area, focus on what we DO have

---

### **Example Prescription Recommendations**

**Email & SMS Marketing:**

```
📧 **EMAIL & SMS MARKETING**

**The Prescription:** You need a systematic email marketing platform to stay connected with your customers and drive repeat business.

**Why This Matters:**
Email marketing delivers an average ROI of $42 for every $1 spent. Your competitors are already in your customers' inboxes - if you're not, you're leaving money on the table. Plus, 90% of consumers check email daily, making it your most reliable channel.

**Our Recommendation: Send**
Send is our email and SMS marketing platform built specifically for local businesses like yours:

- **Easy List Building:** Automated capture forms and import tools get you started fast
- **Professional Templates:** Create campaigns in minutes, no design skills needed
- **SMS Integration:** Reach customers instantly with text messages when email isn't enough
- **Smart Automation:** Set up welcome series, birthday offers, and win-back campaigns that run themselves
- **Real Results:** Track opens, clicks, and revenue so you know exactly what's working

**Save with CommVerse Bundle:**
Get Send alongside Inbox, Content, and LiveChat in our complete CommVerse bundle. Manage all your customer communications from one platform and save compared to buying tools separately.

[Learn More About Send →](#link-to-send-page)
```

**CRM:**

```
📊 **CRM (CUSTOMER RELATIONSHIP MANAGEMENT)**

**The Prescription:** You need a centralized system to track every customer interaction and ensure no opportunities fall through the cracks.

**Why This Matters:**
Without a CRM, you're relying on memory, sticky notes, and scattered spreadsheets. Important follow-ups get missed, customer history gets lost, and deals slip away. Companies using CRM systems see a 29% increase in sales productivity and 34% improvement in customer satisfaction.

**Our Recommendation: Relationships**
Relationships is the truth center of your entire BusinessBlueprint platform:

- **Single Source of Truth:** Every customer interaction, across every channel, in one place
- **Never Miss Follow-ups:** Automated reminders ensure you reach out at the perfect time
- **Complete History:** See every email, text, call, and meeting with each customer
- **Sales Pipeline:** Visualize your opportunities and forecast revenue accurately
- **Seamless Integration:** Works perfectly with all your CommVerse and LocalBlue tools

**Flexible Options:**
- **Free Version:** Up to 100 contacts, perfect for getting started
- **Paid Version ($29/mo):** Unlimited contacts, users, and advanced features

Relationships becomes even more powerful when combined with Inbox (unified communications), Send (email campaigns), and Reputation (review tracking).

[Learn More About Relationships →](#link-to-relationships-page)
```

**Website (HostsBlue Partner):**

```
🌐 **WEBSITE & SEO**

**The Prescription:** Your business needs a fast, professional website optimized for search engines and conversions.

**Why This Matters:**
75% of consumers judge a company's credibility based on their website. If your site is slow, outdated, or hard to navigate, you're losing customers before they even contact you. Plus, 93% of online experiences begin with a search engine - if your website isn't optimized, potential customers will find your competitors instead.

**Our Recommendation: HostsBlue Website Builder**
HostsBlue is our web services partner, offering everything you need in one place:

- **Drag-and-Drop Builder:** Create a professional site in hours, not weeks
- **Mobile-Optimized:** Looks perfect on every device automatically
- **Lightning Fast:** Optimized hosting ensures pages load in under 2 seconds
- **SEO Built-In:** Meta tags, sitemaps, and schema markup configured automatically
- **Secure by Default:** Free SSL certificate and automatic security updates

**Complete Package Includes:**
- Domain registration/transfer
- Professional email (@yourbusiness.com)
- Website builder
- Hosting with 99.9% uptime
- SSL certificate
- 24/7 support

Once your website is live, integrate our LiveChat widget to capture leads instantly and connect Inbox to manage all inquiries from one dashboard.

[Learn More About HostsBlue →](https://hostsblue.com)
```

---

### **Bundle Advantage Messaging**

When multiple recommendations involve products in the same bundle:

**CommVerse Products (Inbox, Send, Content, LiveChat):**
> "💡 **Smart Move:** All of these tools are included in our CommVerse bundle for $99/month - that's all four communication tools in one integrated platform. Save time, save money, and manage everything from one dashboard."

**LocalBlue Products (Listings, Reputation, LocalBlue complete):**
> "💡 **Local SEO Bundle:** Get complete control of your local presence with LocalBlue for $59/month. Includes business listings management, reputation monitoring, and Google Business Profile optimization - everything you need to dominate local search."

**Combinations:**
> "💡 **The Complete Solution:** Pair CommVerse ($99/mo) with LocalBlue ($59/mo) and Relationships CRM ($29/mo) to build a complete digital growth system for $187/month. That's less than hiring one part-time employee, but with 24/7 coverage across every customer touchpoint."

---

### **Call-to-Action Structure**

**End each prescription with:**

1. **Summary of what they need** (2-3 sentences)
2. **Next step** (clear, single action)
3. **Coach Blue availability** (remind them of ongoing support)

**Example CTAs:**

**Strong CTA:**
> "**Ready to transform your digital presence?** Start with the tools that will have the biggest impact on your business. Click the links above to explore each app, and remember - Coach Blue is available 24/7 to guide you through setup and answer any questions. Let's turn this prescription into results."

**Alternative CTA:**
> "**Your roadmap to digital excellence is ready.** Review each recommendation above, explore the apps that fit your priorities, and take action on at least one this week. Coach Blue will be here every step of the way to ensure you're successful. [Start Your Transformation →](#link-to-dashboard)"

**Soft CTA (for overwhelmed users):**
> "**Feeling overwhelmed? That's normal.** You don't have to implement everything at once. Pick ONE recommendation above that excites you most and start there. Ask Coach Blue for step-by-step guidance anytime - he'll break it down into simple, manageable actions. [Chat with Coach Blue →](#link-to-coach)"

---

## PART 1: UPDATE AI PRESCRIPTION GENERATION

### **File: `/server/services/openai.ts`**

**Function:** `analyzeBusinessPresence()`

**Replace the AI prompt with this product-focused version:**

```typescript
async analyzeBusinessPresence(input: BusinessAnalysisInput): Promise<AnalysisResult> {
  const prompt = `You are a digital marketing consultant for BusinessBlueprint.io analyzing a local business's digital presence.

BUSINESS INFO:
- Name: ${input.businessName}
- Industry: ${input.industry}
- Digital IQ Score: ${input.presenceScore.overallScore}/140

DIGITAL IQ BREAKDOWN:
1. Email & SMS Marketing: ${input.presenceScore.emailSMS || 0}/15
2. Social Media Content: ${input.presenceScore.socialContent || 0}/13
3. Reputation Management: ${input.presenceScore.reputation || 0}/16
4. Customer Response & Inbox: ${input.presenceScore.response || 0}/15
5. Live Chat: ${input.presenceScore.liveChat || 0}/15
6. Business Listings: ${input.presenceScore.listings || 0}/18
7. Google Business Profile: ${input.presenceScore.gbp || 0}/16
8. Website & SEO: ${input.presenceScore.website || 0}/20
9. CRM: ${input.presenceScore.crm || 0}/12

BUSINESSBLUEPRINT PRODUCTS:

**CommVerse Bundle ($99/mo):** Unified communications platform
- Inbox: Unified inbox for all messages
- Send: Email & SMS marketing
- Content: Social media management
- LiveChat: Website chat widget

**LocalBlue ($59/mo):** Complete local SEO
- Listings: Business listings management
- Reputation: Review management
- Google Business Profile optimization

**Relationships CRM ($29/mo):** Customer database and sales tracking
- Free version: up to 100 contacts
- Paid version: unlimited contacts + automation

**Coach Blue ($99/mo):** 24/7 AI business mentor
- Teaches platform usage
- Helps implement recommendations
- Answers marketing questions

**HostsBlue (partner):** Web services
- Domain, hosting, website builder

**SwipesBlue (partner):** Payment processing
- Cart, checkout, payment gateway

CRITICAL RULES FOR RECOMMENDATIONS:

1. **ALWAYS recommend BusinessBlueprint products first**
   - Don't suggest "use Mailchimp" - recommend our "Send" app
   - Don't suggest "try Hootsuite" - recommend our "Content" app
   - Don't suggest "get a CRM" without specifying our "Relationships" product

2. **Structure each recommendation:**
   ```json
   {
     "category": "[One of the 9 areas - EXACT name]",
     "title": "Use [Our Product Name] for [Specific Benefit]",
     "description": "Start with the NEED (prescriptive tone): 'You need [X].' Then explain WHY it matters (business impact). Then recommend OUR product with 3-5 specific benefits. End with bundle advantage if applicable.",
     "product": "[Product name: Inbox, Send, Content, LiveChat, Listings, Reputation, LocalBlue, Relationships, Coach Blue, HostsBlue, SwipesBlue]",
     "bundle": "[CommVerse, LocalBlue, or null]",
     "priority": "high|medium|low",
     "estimatedImpact": "high|medium|low",
     "estimatedEffort": "low|medium|high",
     "timeframe": "1-2 weeks"
   }
   ```

3. **Prioritization based on score gaps:**
   - HIGH priority: Score < 50% of area maximum AND high business impact
   - MEDIUM priority: Score 50-75% of area maximum
   - LOW priority: Score > 75% of area maximum (optimization)

4. **Generate 12-18 total recommendations:**
   - At least 1 per area that scored below maximum
   - Areas with lower scores get 2-3 recommendations
   - Focus on products that solve their specific gaps

5. **Bundle strategy:**
   - If recommending 2+ CommVerse products → mention bundle advantage
   - If recommending both Listings and Reputation → suggest LocalBlue complete
   - Emphasize savings without specific pricing

6. **External products (ONLY these two):**
   - Website/hosting issues → recommend HostsBlue
   - Payment processing → recommend SwipesBlue
   - Everything else → recommend OUR products

7. **Writing style:**
   - Prescriptive and authoritative ("You need..." not "You might want to consider...")
   - Focus on business outcomes (revenue, time, customers)
   - Specific benefits, not generic features
   - Make products sound compelling and valuable

8. **Executive summary:**
   - 2-3 sentences
   - Current state + biggest opportunity + confidence in success
   - Encouraging but honest tone

EXAMPLE RECOMMENDATION:

{
  "category": "Email & SMS Marketing",
  "title": "Build Your Customer List with Send",
  "description": "You need a systematic email marketing platform to drive repeat business and increase revenue. Email delivers a $42 ROI for every $1 spent, and 90% of consumers check email daily - making it your most reliable channel. Our Send app makes this effortless: automated list building captures contacts automatically, professional templates let you create campaigns in minutes, and SMS integration reaches customers instantly when needed. Unlike expensive standalone tools, Send is included in our CommVerse bundle alongside Inbox, Content, and LiveChat - giving you complete control of all customer communications.",
  "product": "Send",
  "bundle": "CommVerse",
  "priority": "high",
  "estimatedImpact": "high",
  "estimatedEffort": "low",
  "timeframe": "1-2 weeks"
}

Return valid JSON only with this structure:
{
  "summary": "Executive summary here",
  "recommendations": [array of recommendation objects]
}`;

  // ... rest of existing code to call AI and parse response ...
}
```

---

## PART 2: UPDATE EMAIL TEMPLATES

### **Assessment Report Email**

**File:** `/server/services/email.ts`

**Function:** `generateReportHTML()`

**Key Changes:**
- Group recommendations by category (the 9 areas)
- Show product names and benefits
- Include bundle advantages
- Link to product pages (open in new tab)
- Use brand colors and icons
- End with CTA to view full prescription

**Template structure:**

```typescript
private generateReportHTML(data: EmailReportData): string {
  // Group recommendations by category
  const grouped = data.recommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) acc[rec.category] = [];
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, any[]>);
  
  // Icon mapping
  const icons = {
    'Email & SMS Marketing': '/icon-send.png',
    'Social Media Content': '/icon-content.png',
    'Reputation Management': '/icon-reputation.png',
    'Customer Response & Timing': '/icon-inbox.png',
    'Live Chat': '/icon-livechat.png',
    'Business Listings': '/icon-listings.png',
    'Google Business Profile': '/icon-localblue.png',
    'Website & SEO': '/icon-webseo.png',
    'CRM': '/approved-apps-relationship-icon.png'
  };
  
  return `
  [Full HTML email template with:
   - Header with Digital IQ score
   - Executive summary
   - Recommendations grouped by area with icons
   - Product links that open in new tab
   - Bundle advantage callouts
   - CTA to view full prescription
   - Coach Blue availability reminder
   - Brand colors: #EEFBFF bg, #09080E text, #0000FF headers, #F97316 CTAs]
  `;
}
```

*(Full email template HTML provided in previous sections - use that with these product-focused modifications)*

---

### **Coach Blue Introduction Email**

*(Use the complete template from Part 1B in previous prompt, no changes needed)*

---

## PART 3: UPDATE PRESCRIPTION DISPLAY

### **Prescription Detail Page**

**File:** `/client/src/pages/portal/prescription-detail.tsx`

**Key Changes:**
- Group recommendations by the 9 areas
- Show product names prominently
- Display product icons
- Link to product pages (new tab)
- Show bundle advantages as callout boxes
- Include Coach Blue CTA

**Layout:**

```
[Header with score and summary]

[For each of the 9 areas:]
  [Area Icon] [Area Name]
  [Recommendations in this area, each showing:]
    - Product name and title
    - Description (the prescriptive text)
    - Priority badge
    - Impact/effort indicators
    - [Learn More About {Product}] button
  
  [If multiple products in same bundle:]
    💡 Bundle Advantage: [description]

[Footer with overall CTA and Coach Blue]
```

---

## PART 4: EXPAND ASSESSMENT FORM

*(Use all the conditional question logic from previous prompt - no changes to this part)*

---

## PART 5: FILE ORGANIZATION

### **Create Archive Structure**

**Create these directories:**
```
/public/assets/archived/
/public/assets/archived/old-icons/
/public/assets/archived/old-screenshots/
/public/assets/archived/deprecated-assets/
```

**Create archive log:**
```
/public/assets/archived/ARCHIVE_LOG.md
```

### **Archive Rules:**

1. **NEVER remove ANY images** - only move to archive
2. **Keep all approved icons** in current locations:
   - `/public/assets/approved icons and logos/Additional Apps/`
   - `/public/assets/approved icons and logos/App Names/`
   - `/public/assets/approved icons and logos/Brand Logos/`
   - `/public/assets/approved icons and logos/How it Works Steps Icons/`
   - `/public/assets/approved icons and logos/Subscription Apps Icons/`

3. **Move to archive:**
   - Any icons NOT in the "approved icons and logos" folder
   - Development screenshots
   - Unused graphics
   - Old versions of assets

4. **Document everything:**
   - Log what was moved, when, and why
   - Include original path and new archive path
   - Note if asset was referenced anywhere

5. **Update references:**
   - Search codebase for any references to archived assets
   - Update to use approved assets OR
   - Update to use archived path if still needed

**Script to create:**

```bash
#!/bin/bash
# Archive old assets safely

# Create archive structure
mkdir -p /public/assets/archived/{old-icons,old-screenshots,deprecated-assets}

# Create log file
echo "# Asset Archive Log" > /public/assets/archived/ARCHIVE_LOG.md
echo "Archive created: $(date)" >> /public/assets/archived/ARCHIVE_LOG.md
echo "" >> /public/assets/archived/ARCHIVE_LOG.md

# Move screenshots (example - adjust paths as needed)
find /public -name "Screenshot*.png" -not -path "*/approved*" -exec mv {} /public/assets/archived/old-screenshots/ \;

# Log archived files
echo "## Archived Screenshots" >> /public/assets/archived/ARCHIVE_LOG.md
ls /public/assets/archived/old-screenshots/ >> /public/assets/archived/ARCHIVE_LOG.md
```

---

## PART 6: COACH BLUE TRAINING

### **Update Coach Blue Knowledge Base**

**File:** Create `/server/services/coach-blue-knowledge.ts`

```typescript
export const PRODUCT_CATALOG = {
  commverse: {
    name: 'CommVerse Bundle',
    price: '$99/month',
    savings: 'Save $37/month vs buying separately',
    apps: ['Inbox', 'Send', 'Content', 'LiveChat'],
    description: 'Complete communications platform for managing all customer interactions',
    benefits: [
      'Unified dashboard for all channels',
      'Never miss a customer message',
      'Automated marketing campaigns',
      'Social media scheduling',
      'Real-time chat support'
    ],
    useCases: {
      inbox: 'When they need unified communications',
      send: 'When they need email/SMS marketing',
      content: 'When they need social media management',
      livechat: 'When they need website chat'
    }
  },
  localblue: {
    name: 'LocalBlue',
    price: '$59/month',
    savings: 'Save $19/month vs buying separately',
    services: ['Listings', 'Reputation', 'GBP Optimization'],
    description: 'Complete local SEO solution',
    benefits: [
      'Manage 50+ directory listings',
      'Monitor and respond to reviews',
      'Optimize Google Business Profile',
      'Track local rankings',
      'Automated review requests'
    ],
    useCases: {
      listings: 'When they need directory management',
      reputation: 'When they need review management',
      localSEO: 'When they need complete local presence'
    }
  },
  relationships: {
    name: 'Relationships CRM',
    price: '$29/month (Free version available)',
    description: 'The truth center - your central customer database',
    benefits: [
      'Single source of truth for all customers',
      'Track every interaction',
      'Automated follow-ups',
      'Sales pipeline management',
      'Integrates with all tools'
    ],
    useCases: {
      tracking: 'When they mention losing track of customers',
      followUp: 'When they miss follow-up opportunities',
      organization: 'When data is scattered across tools'
    }
  },
  coachBlue: {
    name: 'Coach Blue',
    price: '$99/month',
    description: 'Your 24/7 AI business mentor',
    benefits: [
      'Personalized guidance',
      'Platform training',
      'Implementation support',
      'Marketing education',
      'Always available'
    ]
  },
  hostsBlue: {
    name: 'HostsBlue',
    partner: true,
    url: 'https://hostsblue.com',
    description: 'Complete web services',
    offerings: ['Domains', 'Hosting', 'Email', 'Website Builder', 'SSL']
  },
  swipesBlue: {
    name: 'SwipesBlue',
    partner: true,
    url: 'https://swipesblue.com',
    description: 'Payment processing and e-commerce',
    offerings: ['Payment Gateway', 'Shopping Cart', 'Checkout']
  }
};

export const COACH_PERSONALITY = {
  role: 'Patient teacher and mentor',
  tone: 'Encouraging, supportive, knowledgeable',
  approach: [
    'Celebrate successes',
    'Break down complex topics',
    'Provide specific examples',
    'Offer step-by-step guidance',
    'Recommend products when appropriate'
  ],
  whenToRecommendProducts: [
    'User asks how to solve a problem we have a product for',
    'User expresses frustration with current tools/process',
    'User asks "what should I do about [X]"',
    'User is implementing a prescription recommendation'
  ],
  howToRecommend: [
    'Lead with the benefit/outcome',
    'Explain how our product solves their specific problem',
    'Mention bundle savings when relevant',
    'Offer to walk them through setup',
    'Never pushy - always helpful'
  ]
};
```

### **Update Coach Blue AI Prompt**

**File:** `/server/services/aiCoach.ts`

Add product knowledge to Coach Blue's system prompt:

```typescript
const systemPrompt = `You are Coach Blue, the AI business mentor for BusinessBlueprint.io.

PERSONALITY:
- Patient, encouraging teacher
- Celebrate user successes
- Make complex concepts simple
- Always available to help
- Guide users toward Digital Excellence

MISSION:
Help users understand and implement their digital growth prescription using BusinessBlueprint tools.

YOUR PRODUCT KNOWLEDGE:
${JSON.stringify(PRODUCT_CATALOG, null, 2)}

WHEN TO RECOMMEND PRODUCTS:
- User asks how to solve a problem
- User expresses frustration with current tools
- User is implementing a prescription recommendation
- User asks "what should I do about [X]"

HOW TO RECOMMEND:
1. Lead with the benefit/outcome
2. Explain how our product solves their specific problem
3. Highlight relevant features
4. Mention bundle savings when applicable
5. Offer implementation guidance
6. Never be pushy - always be helpful

EXAMPLE:
User: "I keep losing track of customers and missing follow-ups"
You: "That's a common challenge, and it can really hurt your business. The good news is our Relationships CRM was built specifically to solve this. It becomes your single source of truth - every customer interaction, across every channel, all in one place. Plus, it sends you automated reminders so you never miss a follow-up again. Want me to walk you through how to set it up?"

REMEMBER:
- You know their business (check context for their assessment and prescription)
- You can see their Digital IQ score and recommendations
- Reference their specific situation when helping
- Focus on implementation, not just theory
- Encourage action, track progress

Current user context:
${JSON.stringify(context, null, 2)}`;
```

---

## TESTING REQUIREMENTS

### **Test Sequence:**

1. **Submit test assessment**
   - Fill out basic info
   - Answer some (not all) operational questions
   - Submit

2. **Verify AI prescription generation**
   - Check recommendations reference our products
   - Verify proper categorization across 9 areas
   - Confirm bundle advantages mentioned
   - Ensure no external products recommended (except HostsBlue/SwipesBlue)

3. **Check emails**
   - Assessment confirmation arrives with branding
   - Assessment report arrives with product recommendations
   - Coach Blue intro arrives with welcome
   - All emails use correct colors and fonts

4. **Test prescription portal**
   - View prescription in portal
   - Verify product links work (open new tab)
   - Check bundle advantage callouts display
   - Confirm icons show correctly

5. **Test Coach Blue**
   - Ask about a problem
   - Verify Coach recommends appropriate product
   - Check Coach explains benefits clearly
   - Confirm Coach mentions bundle savings

6. **Verify file organization**
   - Approved assets still in correct location
   - Old assets moved to archive
   - Archive log created and complete
   - No broken image references

---

## ACCEPTANCE CRITERIA

**Prescriptions:**
- [ ] AI generates 12-18 product-specific recommendations
- [ ] All recommendations reference BusinessBlueprint products
- [ ] No external products recommended (except HostsBlue/SwipesBlue)
- [ ] Recommendations grouped by 9 areas
- [ ] Bundle advantages highlighted
- [ ] Product links work correctly

**Emails:**
- [ ] All 3 emails use correct branding
- [ ] Assessment report showcases products
- [ ] Coach Blue intro welcoming and informative
- [ ] Product links open in new tab
- [ ] Mobile responsive

**Prescription Portal:**
- [ ] Recommendations grouped by area
- [ ] Product icons display
- [ ] Bundle callouts show
- [ ] Links to product pages work
- [ ] CTA clear and compelling

**Coach Blue:**
- [ ] Recommends products appropriately
- [ ] Explains benefits clearly
- [ ] Mentions bundle savings
- [ ] Helpful not pushy
- [ ] Knows user's business context

**File Organization:**
- [ ] Approved assets untouched
- [ ] Old assets archived
- [ ] Archive log complete
- [ ] No broken references
- [ ] Nothing deleted

---

## CRITICAL REMINDERS

1. **Prescriptions sell products** - This is the entire business model
2. **Coach Blue is a teacher AND salesperson** - but helpful, not pushy
3. **Bundle advantages matter** - always mention savings
4. **Never recommend competitors** - only our products (except HostsBlue/SwipesBlue)
5. **Product links must work** - open in new tabs, go to correct pages
6. **Never delete images** - only archive with documentation
7. **Branding is mandatory** - use exact colors and fonts everywhere

---

**READY TO IMPLEMENT**

**Estimated completion:** 12-16 hours  
**Priority:** CRITICAL  
**Revenue Impact:** HIGH - This transforms prescriptions from free advice into sales tool

---

**END OF PROMPT**
