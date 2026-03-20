# ScansBlue Agent Implementation Guide

## Overview
This guide explains how to integrate the three ScansBlue AI agents with their system prompts while maintaining security.

## Architecture

```
User → ScansBlue Frontend → Backend API → DeepSeek AI
                                ↓
                         System Prompt + User Input
```

## Implementation Steps

### 1. Backend API Setup

**Required environment variables:**
```bash
# Never expose these to frontend
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_ENDPOINT=https://api.deepseek.com/v1/chat/completions
SCANSBLUE_SECRET_KEY=your_backend_secret
```

**Store system prompts securely:**
```
/backend
  /prompts
    - code-auditor-system-prompt.md
    - comprehensive-analysis-system-prompt.md
    - quick-analysis-system-prompt.md
```

### 2. API Endpoint Structure

Create three separate endpoints:

```javascript
// Backend API (Node.js/Express example)

const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Load system prompts on server start (NOT on every request)
const systemPrompts = {
  'code-auditor': fs.readFileSync(
    path.join(__dirname, 'prompts/code-auditor-system-prompt.md'),
    'utf8'
  ),
  'comprehensive-analysis': fs.readFileSync(
    path.join(__dirname, 'prompts/comprehensive-analysis-system-prompt.md'),
    'utf8'
  ),
  'quick-analysis': fs.readFileSync(
    path.join(__dirname, 'prompts/quick-analysis-system-prompt.md'),
    'utf8'
  )
};

// Code Auditor endpoint
app.post('/api/code-auditor', async (req, res) => {
  try {
    const { userInput } = req.body;
    
    // Validate input
    if (!userInput || userInput.length > 100000) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Call DeepSeek API
    const response = await axios.post(
      process.env.DEEPSEEK_API_ENDPOINT,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompts['code-auditor']
          },
          {
            role: 'user',
            content: userInput
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Return only the AI response (never the system prompt)
    res.json({
      result: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error('API Error:', error.message); // Don't log full error with keys
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Comprehensive Analysis endpoint
app.post('/api/comprehensive-analysis', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Validate URL
    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    // First, crawl the website (implement your crawler)
    const crawlData = await crawlWebsite(url);

    // Then send to DeepSeek with context
    const response = await axios.post(
      process.env.DEEPSEEK_API_ENDPOINT,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompts['comprehensive-analysis']
          },
          {
            role: 'user',
            content: `Analyze this website: ${url}\n\nCrawled data:\n${JSON.stringify(crawlData, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 8000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      result: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Quick Analysis endpoint
app.post('/api/quick-analysis', async (req, res) => {
  try {
    const { url, categories } = req.body;
    
    // Validate
    if (!isValidUrl(url) || !Array.isArray(categories)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Fetch page data
    const pageData = await fetchPageData(url);

    // Send to DeepSeek
    const response = await axios.post(
      process.env.DEEPSEEK_API_ENDPOINT,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompts['quick-analysis']
          },
          {
            role: 'user',
            content: `Analyze ${url} for these categories: ${categories.join(', ')}\n\nPage data:\n${JSON.stringify(pageData, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      result: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Helper functions
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

app.listen(3000, () => {
  console.log('ScansBlue API running on port 3000');
});
```

### 3. Frontend Integration

**Update your HTML files to call the backend:**

```javascript
// code-and-site-auditor.html
document.querySelector('.send-button').addEventListener('click', async () => {
  const userInput = document.querySelector('.text-input').value;
  
  if (!userInput.trim()) {
    alert('Please enter some text to analyze');
    return;
  }

  // Show loading state
  const button = event.target;
  button.disabled = true;
  button.textContent = 'Analyzing...';

  try {
    // Call YOUR backend (not DeepSeek directly)
    const response = await fetch('https://your-backend.scansblue.com/api/code-auditor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userInput })
    });

    const data = await response.json();
    
    // Display result
    displayResult(data.result);
    
  } catch (error) {
    alert('Analysis failed. Please try again.');
  } finally {
    button.disabled = false;
    button.textContent = 'Send';
  }
});
```

### 4. Security Checklist

**✅ MUST DO:**
- [ ] Store API keys in environment variables (never in code)
- [ ] Use `.env` files for local development
- [ ] Add `.env` to `.gitignore`
- [ ] Load system prompts from server filesystem (not frontend)
- [ ] Validate all user inputs before sending to API
- [ ] Implement rate limiting on your backend endpoints
- [ ] Use HTTPS for all API communications
- [ ] Never expose DeepSeek API key to frontend/client
- [ ] Log errors safely (don't log full request/response with keys)
- [ ] Implement authentication for your API endpoints
- [ ] Set up CORS properly to only allow your frontend domain

**❌ NEVER DO:**
- [ ] Put API keys in frontend JavaScript
- [ ] Commit `.env` files to git
- [ ] Return system prompts to frontend
- [ ] Expose DeepSeek API directly to users
- [ ] Log sensitive data (keys, tokens, passwords)
- [ ] Skip input validation
- [ ] Allow unlimited requests (implement rate limiting)

### 5. Environment Setup

**For Development (.env.local):**
```bash
DEEPSEEK_API_KEY=sk-your-dev-key
DEEPSEEK_API_ENDPOINT=https://api.deepseek.com/v1/chat/completions
NODE_ENV=development
```

**For Production (.env.production):**
```bash
DEEPSEEK_API_KEY=sk-your-prod-key
DEEPSEEK_API_ENDPOINT=https://api.deepseek.com/v1/chat/completions
NODE_ENV=production
RATE_LIMIT=100
```

### 6. Deployment Security

**On your hosting platform (Vercel/Netlify/Railway/etc):**
1. Add environment variables in platform settings
2. Never store keys in code
3. Rotate keys regularly
4. Monitor API usage
5. Set up alerts for unusual activity

**For Replit:**
1. Use Replit Secrets (not .env files)
2. Add `DEEPSEEK_API_KEY` as a secret
3. Access with `process.env.DEEPSEEK_API_KEY`
4. Secrets are encrypted and not visible in code

### 7. Testing the Integration

**Test with cURL:**
```bash
# Test Code Auditor
curl -X POST https://your-backend.scansblue.com/api/code-auditor \
  -H "Content-Type: application/json" \
  -d '{"userInput": "function test() { console.log('hello'); }"}'

# Expected: Analysis response (NOT the system prompt)
```

### 8. Monitoring and Logging

**What TO log:**
- Request timestamps
- Endpoint accessed
- Response times
- Error messages (sanitized)
- Rate limit hits

**What NOT to log:**
- API keys
- System prompts
- User's sensitive data
- Full request/response bodies with credentials

### 9. Rate Limiting Example

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Apply to all API routes
app.use('/api/', apiLimiter);
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Exposing API Key in Frontend
```javascript
// WRONG - Never do this!
const apiKey = 'sk-1234567890'; // Exposed in browser
fetch('https://api.deepseek.com', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

### ✅ Correct: Call Your Backend
```javascript
// CORRECT - Backend handles the key
fetch('https://your-backend.scansblue.com/api/code-auditor', {
  method: 'POST',
  body: JSON.stringify({ userInput })
});
```

### ❌ Mistake 2: Returning System Prompt
```javascript
// WRONG - Never return the system prompt
res.json({
  systemPrompt: systemPrompts['code-auditor'], // Don't do this!
  result: response.data
});
```

### ✅ Correct: Return Only Result
```javascript
// CORRECT - Only return the analysis result
res.json({
  result: response.data.choices[0].message.content
});
```

## Questions & Troubleshooting

**Q: Where should I store the system prompts?**
A: On your backend server filesystem, loaded once at server startup.

**Q: Can users see the system prompts?**
A: No. They never leave your backend server.

**Q: How do I update prompts without redeploying?**
A: Store in a database or cloud storage, cache on server, refresh periodically.

**Q: What if someone reverse engineers my API calls?**
A: They'll see YOUR backend API, not DeepSeek. Protect your backend with authentication and rate limiting.

**Q: Should I cache responses?**
A: Yes, for identical inputs. Use Redis or similar to avoid redundant API calls.

## Next Steps

1. ✅ Review the three system prompt files
2. ✅ Set up backend API with proper security
3. ✅ Test with sample inputs
4. ✅ Implement rate limiting
5. ✅ Deploy with environment variables
6. ✅ Monitor API usage
7. ✅ Set up alerts for errors

Remember: The security of your API keys is critical. Never expose them to the frontend, always use environment variables, and implement proper authentication and rate limiting on your backend.
