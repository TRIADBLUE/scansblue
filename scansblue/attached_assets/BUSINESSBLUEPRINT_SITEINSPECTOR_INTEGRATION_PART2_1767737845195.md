# BUSINESSBLUEPRINT + SITEINSPECTOR INTEGRATION (PART 2)
## Prescription Display, Coach Blue, Deployment

---

## 📋 PART 10: UPDATE PRESCRIPTION DETAIL PAGE

**File: `/client/src/pages/portal/prescription-detail.tsx`**

```typescript
import { useQuery } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { SiteInspectorResults } from '@/components/siteinspector-results';

export default function PrescriptionDetail() {
  const [, params] = useRoute('/portal/prescriptions/:id');
  const prescriptionId = params?.id;

  const { data: prescription } = useQuery({
    queryKey: [`/api/prescriptions/${prescriptionId}`],
  });

  const { data: recommendations } = useQuery({
    queryKey: [`/api/prescriptions/${prescriptionId}/recommendations`],
  });
  
  // NEW: Fetch SiteInspector results
  const { data: siteInspectorResults } = useQuery({
    queryKey: [`/api/siteinspector/results/${prescription?.assessmentId}`],
    enabled: !!prescription?.assessmentId
  });

  // Group recommendations by category
  const groupedRecs = recommendations?.reduce((acc, rec) => {
    if (!acc[rec.category]) acc[rec.category] = [];
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EEFBFF' }}>
      {/* Header with score */}
      <div className="bg-[#09080E] text-[#EEFBFF] py-12 border-b-4 border-[#F97316]">
        <div className="max-w-4xl mx-auto px-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Archivo Semi Expanded' }}>
            {prescription.title}
          </h1>
          <p className="text-lg">{prescription.summary}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12">
        {/* NEW: SiteInspector Results (if available) */}
        {siteInspectorResults && (
          <div className="mb-12">
            <SiteInspectorResults 
              results={siteInspectorResults}
              websiteUrl={prescription.websiteUrl}
            />
          </div>
        )}
        
        {/* Recommendations grouped by area */}
        {Object.entries(groupedRecs).map(([category, recs]) => (
          <div key={category} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src={getIconForCategory(category)} 
                alt={category} 
                className="w-12 h-12"
              />
              <h2 className="text-2xl font-bold text-[#0000FF]" style={{ fontFamily: 'Archivo Semi Expanded' }}>
                {category}
              </h2>
            </div>
            
            <div className="space-y-4">
              {recs.map((rec) => (
                <Card key={rec.id} className="border-l-6 border-[#F97316] bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-[#0000FF]">
                        {rec.title}
                      </h3>
                      <Badge className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                    </div>
                    
                    <p className="text-[#09080E] mb-4">{rec.description}</p>
                    
                    <div className="flex gap-4 text-sm text-gray-600 mb-4">
                      <span><strong>Impact:</strong> {rec.estimatedImpact}</span>
                      <span><strong>Effort:</strong> {rec.estimatedEffort}</span>
                    </div>
                    
                    {/* Product link */}
                    {rec.product && (
                      <Button
                        variant="outline"
                        className="border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white"
                        onClick={() => window.open(getProductUrl(rec.product), '_blank')}
                      >
                        Learn More About {rec.product} →
                      </Button>
                    )}
                    
                    {/* Special: SiteInspector Full Report for Website & SEO */}
                    {category === 'Website & SEO' && !siteInspectorResults?.fullReportUrl && (
                      <Button
                        variant="outline"
                        className="border-[#0000FF] text-[#0000FF] hover:bg-[#0000FF] hover:text-white ml-2"
                        onClick={() => window.open(`https://siteinspector.dev?url=${prescription.websiteUrl}`, '_blank')}
                      >
                        Run Complete Site Analysis →
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Bundle advantage callout */}
            {getBundleAdvantage(category) && (
              <div className="mt-6 p-4 bg-[#EEFBFF] rounded-lg border-2 border-[#0000FF]">
                <p className="text-[#09080E]">
                  💡 <strong>Bundle Advantage:</strong> {getBundleAdvantage(category)}
                </p>
              </div>
            )}
          </div>
        ))}
        
        {/* Coach Blue CTA */}
        <div className="mt-12 p-8 bg-white rounded-lg border-2 border-[#0000FF] text-center">
          <h3 className="text-2xl font-bold text-[#0000FF] mb-4">
            Need Help Implementing These Recommendations?
          </h3>
          <p className="text-[#09080E] mb-6">
            Coach Blue is available 24/7 to guide you through setup, answer questions, and help you achieve Digital Excellence.
          </p>
          <Button
            className="bg-[#F97316] hover:bg-[#F97316]/90 text-white"
            onClick={() => window.location.href = '/portal/coach'}
          >
            Chat with Coach Blue →
          </Button>
        </div>
      </div>
    </div>
  );
}

function getIconForCategory(category: string): string {
  const icons: Record<string, string> = {
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
  return icons[category] || '/icon-commverse.png';
}

function getProductUrl(product: string): string {
  const urls: Record<string, string> = {
    'Inbox': '/products/inbox',
    'Send': '/products/send',
    'Content': '/products/content',
    'LiveChat': '/products/livechat',
    'CommVerse': '/products/commverse',
    'Listings': '/products/listings',
    'Reputation': '/products/reputation',
    'LocalBlue': '/products/localblue',
    'Relationships': '/products/relationships',
    'HostsBlue': 'https://hostsblue.com',
    'SwipesBlue': 'https://swipesblue.com'
  };
  return urls[product] || '/products';
}

function getBundleAdvantage(category: string): string | null {
  if (['Email & SMS Marketing', 'Social Media Content', 'Customer Response & Timing', 'Live Chat'].includes(category)) {
    return 'Get all communication tools in the CommVerse bundle for $99/month - that\'s all four apps in one integrated platform. Save compared to buying separately.';
  }
  if (['Business Listings', 'Reputation Management', 'Google Business Profile'].includes(category)) {
    return 'Get complete local SEO control with LocalBlue for $59/month - includes listings management, reputation monitoring, and Google Business Profile optimization.';
  }
  return null;
}
```

---

## 🎯 PART 11: COACH BLUE ENHANCED PROMPTS

**File: `/server/services/aiCoach.ts` (enhanced system prompt)**

```typescript
const COACH_BLUE_SYSTEM_PROMPT = `You are Coach Blue, the AI business mentor for BusinessBlueprint.io.

PERSONALITY:
- Patient, encouraging teacher
- Celebrate user successes
- Break down complex topics into simple steps
- Always available to help
- Guide users toward Digital Excellence

TOOLS AVAILABLE:
- SiteInspector Technical Analysis: For website issues, speed problems, technical SEO
- You can trigger technical analysis when users ask about website problems

PRODUCTS YOU CAN RECOMMEND:

**CommVerse Bundle ($99/mo):**
- Inbox: Unified communications hub
- Send: Email & SMS marketing
- Content: Social media management
- LiveChat: Website chat widget
Bundle saves $37/month vs buying separately

**LocalBlue ($59/mo):**
- Listings: Business directory management
- Reputation: Review management
- Complete local SEO package

**Relationships CRM ($29/mo):**
- Customer database
- Sales pipeline
- Free version available

**Coach Blue ($99/mo):**
- That's YOU! 24/7 AI mentor

**HostsBlue (partner):**
- Web hosting, domains, website builder
- Fixes technical issues automatically

**SwipesBlue (partner):**
- Payment processing

WHEN TO RECOMMEND PRODUCTS:
- User asks how to solve a problem
- User expresses frustration with current tools
- User is implementing a prescription recommendation
- User asks "what should I do about [X]"

HOW TO RECOMMEND:
1. Lead with the benefit/outcome
2. Explain how our product solves their specific problem
3. Highlight relevant features (3-5 points)
4. Mention bundle savings when applicable
5. Offer implementation guidance
6. NEVER be pushy - always be helpful

WHEN TO USE SITEINSPECTOR:
If user mentions website problems (slow, broken, technical, SSL, mobile issues):
1. Offer to analyze their site
2. Use SiteInspector Auditor to get technical analysis
3. Explain findings in simple, friendly terms
4. Recommend specific fixes
5. Suggest HostsBlue if issues are major

EXAMPLE - Technical Issue:
User: "My website is really slow"
You: "Let me analyze your site to see what's causing the slowdown... 

[You trigger SiteInspector Auditor analysis]

I found the main issue: your homepage is loading 15MB of unoptimized images. That's like downloading a movie every time someone visits! Here's what we need to do:

1. Compress those images (I can show you how)
2. Enable caching (takes 5 minutes)
3. Or move to HostsBlue - their hosting is optimized for speed and would solve this automatically

Want me to walk you through the quick fixes first, or would you like to explore HostsBlue?"

EXAMPLE - Product Recommendation:
User: "I keep losing track of customers"
You: "That's a common challenge, and it can really hurt your business. Our Relationships CRM was built specifically to solve this problem.

It becomes your single source of truth - every customer interaction, across every channel, all in one place. Plus, it sends you automated reminders so you never miss a follow-up again.

The best part? There's a free version to get started (up to 100 contacts), and the paid version is only $29/month for unlimited contacts.

Want me to walk you through how to set it up?"

REMEMBER:
- You know their business (check context)
- You can see their Digital IQ score and recommendations
- Reference their specific situation
- Focus on implementation, not theory
- Encourage action, track progress
- Celebrate wins!

Current user context will be provided with each message.`;
```

---

## 🚀 PART 12: API ROUTES FOR SITEINSPECTOR DATA

**File: `/server/routes.ts` (add these endpoints)**

```typescript
// Get SiteInspector results for an assessment
app.get('/api/siteinspector/results/:assessmentId', isAuthenticated, async (req, res) => {
  try {
    const assessmentId = parseInt(req.params.assessmentId);
    
    // Verify user owns this assessment
    const assessment = await db.query.assessments.findFirst({
      where: eq(assessments.id, assessmentId)
    });
    
    if (!assessment || assessment.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const results = await siteInspectorService.getResults(assessmentId);
    
    if (!results) {
      return res.status(404).json({ error: 'No SiteInspector results found' });
    }
    
    res.json(results);
    
  } catch (error) {
    console.error('Error fetching SiteInspector results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

// Request Full Report (user-initiated)
app.post('/api/siteinspector/request-report', isAuthenticated, async (req, res) => {
  try {
    const { url, assessmentId } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }
    
    const result = await siteInspectorService.requestFullReport(
      url,
      req.user.email,
      assessmentId
    );
    
    if (!result) {
      return res.status(500).json({ error: 'Failed to queue report' });
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error requesting full report:', error);
    res.status(500).json({ error: 'Failed to request report' });
  }
});

// Coach Blue triggers Auditor (internal use)
app.post('/api/coach-blue/technical-analysis', isAuthenticated, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    const result = await siteInspectorService.chatWithAuditor(message, context);
    
    if (!result) {
      return res.status(500).json({ error: 'Analysis failed' });
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Error in technical analysis:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});
```

---

## 🧪 PART 13: TESTING GUIDE

**File: `/docs/SITEINSPECTOR_TESTING.md`**

```markdown
# SiteInspector Integration Testing

## Prerequisites

1. SiteInspector API is deployed and running
2. API keys are set in BusinessBlueprint environment variables
3. Database migrations have been run

## Test Sequence

### Test 1: Fast Check During Assessment

1. Go to `/assessment`
2. Fill out form with a real website URL (e.g., businessblueprint.io)
3. Submit assessment
4. **Expected:** 
   - Assessment processes normally
   - Console shows: "[SiteInspector] Running Fast Check for: [URL]"
   - Console shows: "[SiteInspector] Fast Check completed. Overall score: X"
   - Database `site_inspector_results` table has new row
5. **Verify:**
   ```sql
   SELECT * FROM site_inspector_results 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

### Test 2: Prescription Shows Technical Issues

1. After assessment completes, view prescription
2. Navigate to Website & SEO section
3. **Expected:**
   - SiteInspector results component displays
   - Shows SSL status, load time, mobile score
   - Lists specific technical issues found
   - "Run Full Report" button present
4. **Verify:** Click "Run Full Report" button opens SiteInspector

### Test 3: Full Report Request

1. In prescription, click "Run Complete Site Analysis"
2. SiteInspector loads with URL pre-filled
3. Complete the Full Report on SiteInspector
4. **Expected:**
   - Report generates
   - Webhook fires to BusinessBlueprint
   - Database updates with report ID and URL
   - User can see completed report in prescription

### Test 4: Coach Blue Technical Analysis

1. Go to `/portal/coach`
2. Ask: "My website is loading very slowly, what's wrong?"
3. **Expected:**
   - Coach Blue triggers SiteInspector Auditor
   - Console shows: "[Coach Blue] Delegating to SiteInspector Auditor"
   - Response includes technical analysis in friendly terms
   - Coach offers to help fix issues or suggests HostsBlue

### Test 5: Email Shows Technical Issues

1. Submit new assessment
2. Check email inbox for assessment report
3. **Expected:**
   - Email includes "Technical Issues Detected" section
   - Shows specific issues from SiteInspector
   - Includes "Run Complete Analysis" button
   - Button links to SiteInspector with URL pre-filled

## Manual API Testing

### Test Fast Check API

```bash
curl -X POST https://siteinspector.dev/api/businessblueprint/fast-check \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{"url": "https://businessblueprint.io"}'
```

**Expected Response:**
```json
{
  "success": true,
  "url": "https://businessblueprint.io",
  "timestamp": "2026-01-06T...",
  "results": {
    "ssl": {...},
    "performance": {...},
    "mobile": {...},
    "criticalIssues": [...],
    "summary": {...}
  }
}
```

### Test Full Report API

```bash
curl -X POST https://siteinspector.dev/api/businessblueprint/full-report \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "url": "https://businessblueprint.io",
    "webhookUrl": "https://businessblueprint.io/api/siteinspector-webhook"
  }'
```

### Test Auditor API

```bash
curl -X POST https://siteinspector.dev/api/businessblueprint/auditor \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "message": "What are common website performance issues?",
    "context": {
      "businessName": "Test Business"
    }
  }'
```

## Troubleshooting

### Issue: "Invalid API key"
- Check environment variables are set correctly
- Verify API key matches what's in SiteInspector

### Issue: Fast Check not running during assessment
- Check console for errors
- Verify SITEINSPECTOR_API_URL is correct
- Test API manually with curl

### Issue: Webhook not receiving Full Report completion
- Check SiteInspector logs
- Verify webhook URL is accessible
- Test webhook endpoint manually

### Issue: Coach Blue not using Auditor
- Check if message contains technical keywords
- Verify context includes websiteUrl
- Check Coach Blue console logs
```

---

## 🚀 PART 14: DEPLOYMENT CHECKLIST

```markdown
# SiteInspector Integration Deployment

## Pre-Deployment

### SiteInspector (Replit) Side:
- [ ] Deploy all API files to SiteInspector Replit
- [ ] Generate secure API keys (32+ characters)
- [ ] Add API keys to Replit Secrets:
  - `BUSINESSBLUEPRINT_API_KEY`
  - `BUSINESSBLUEPRINT_TEST_KEY`
- [ ] Test all endpoints with Postman
- [ ] Verify webhook can receive POST requests
- [ ] Set `SITE_URL` environment variable

### BusinessBlueprint Side:
- [ ] Deploy all integration files
- [ ] Add to environment variables:
  - `SITEINSPECTOR_API_URL`
  - `SITEINSPECTOR_API_KEY`
  - `SITEINSPECTOR_TEST_KEY`
- [ ] Run database migrations (`npm run db:push`)
- [ ] Verify `site_inspector_results` table created
- [ ] Test SiteInspector service with sample URL
- [ ] Verify webhook endpoint is accessible

## Deployment Steps

### Step 1: Deploy SiteInspector API
1. Copy all files to SiteInspector Replit
2. Install dependencies if needed
3. Restart Replit server
4. Test health endpoint: `GET /api/businessblueprint/health`

### Step 2: Deploy BusinessBlueprint Integration
1. Merge integration branch to main
2. Deploy to production
3. Run migrations
4. Restart server

### Step 3: Configure API Keys
1. Generate production keys
2. Add to both services
3. Test authentication

### Step 4: Test End-to-End
1. Submit test assessment
2. Verify Fast Check runs
3. Check prescription shows results
4. Test Full Report request
5. Test Coach Blue technical analysis

## Post-Deployment

### Monitoring
- [ ] Set up logging for API calls
- [ ] Monitor error rates
- [ ] Track API usage
- [ ] Set up alerts for failures

### Documentation
- [ ] Update team documentation
- [ ] Document API keys location
- [ ] Create troubleshooting guide
- [ ] Update user-facing help docs

### Gradual Rollout (Optional)
- [ ] Enable for 10% of assessments
- [ ] Monitor performance and errors
- [ ] Increase to 50%
- [ ] Full rollout

## Rollback Plan

If integration causes issues:

1. **Disable SiteInspector calls:**
   ```typescript
   // In presenceScanner.ts
   const SITEINSPECTOR_ENABLED = false;
   ```

2. **Revert database:**
   ```sql
   -- If needed
   DROP TABLE site_inspector_results;
   ```

3. **Remove from UI:**
   - Hide SiteInspectorResults component
   - Remove from prescription display

4. **Keep webhook endpoint** (in case reports complete later)

## Success Metrics

After 1 week, verify:
- [ ] X% of assessments include SiteInspector data
- [ ] Average Website & SEO score accuracy improved
- [ ] Users engaging with Full Report links
- [ ] Coach Blue using Auditor successfully
- [ ] No significant error rate increase
```

---

## 📊 PART 15: ADMIN MONITORING (OPTIONAL)

**File: `/client/src/pages/admin-panel.tsx` (add SiteInspector tab)**

```typescript
{/* Add to admin navigation */}
<TabsContent value="siteinspector">
  <Card>
    <CardHeader>
      <CardTitle>SiteInspector Integration Status</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Assessments Analyzed</p>
            <p className="text-2xl font-bold">{stats.totalAnalyzed}</p>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <p className="text-sm text-gray-600">Full Reports Requested</p>
            <p className="text-2xl font-bold">{stats.fullReports}</p>
          </div>
          <div className="p-4 bg-purple-50 rounded">
            <p className="text-sm text-gray-600">Auditor Queries</p>
            <p className="text-2xl font-bold">{stats.auditorQueries}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Recent SiteInspector Activity</h3>
          {/* Table of recent analyses */}
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

---

**END OF BUSINESSBLUEPRINT INTEGRATION - PART 2**

**All files ready for deployment!**
