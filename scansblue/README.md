# Site Inspector Agent

AI-powered website analysis service that answers natural language questions about live websites using Playwright browser automation and OpenAI.

## Features

- **Button Analysis**: Count all interactive elements (buttons, links, forms) on any webpage
- **Logo Detection**: Find and measure logos with detailed size and location information
- **Favicon Validation**: Verify favicon setup and check if it loads successfully
- **Navigation Analysis**: Extract and analyze navigation structure and menu items
- **Environment Comparison**: Compare dev vs production environments side-by-side

## API Endpoint

### POST /api/agent

Ask natural language questions about websites.

**Request:**
```json
{
  "content": "How many buttons are on example.com?"
}
```

**Response:**
```json
{
  "content": "I found 15 buttons on example.com:\n\n• 5 in the header\n• 8 in the main content\n• 2 in the footer"
}
```

### GET /api/health

Check if browser automation is working correctly.

**Response:**
```json
{
  "status": "healthy",
  "playwright": "operational",
  "message": "Browser automation is working correctly"
}
```

## Example Questions

- "How many buttons are on google.com?"
- "Find logos on github.com"
- "Check favicon on replit.com"
- "Analyze navigation on stripe.com"
- "Compare dev.example.com and example.com navigation"

## Technical Stack

- **Backend**: Express.js with TypeScript
- **Browser Automation**: Playwright (Chromium)
- **AI/NLP**: OpenAI (via Replit AI Integrations)
- **Frontend**: React with Tailwind CSS (testing UI)

## System Requirements

### Production Deployment

This service requires Chromium browser and system dependencies to be installed on the host system:

- Chromium browser
- libglib2.0, libnspr4, libnss3
- libdbus-1, libatk1.0, libatk-bridge2.0
- libcups2, libxcb1, libxkbcommon0
- libx11, libxcomposite, libxdamage, libxfixes, libxrandr
- libgbm, libcairo, libpango, libasound

### Replit Deployment

When deploying to Replit's Autoscale deployment:

1. The production infrastructure includes necessary browser dependencies
2. Test the `/api/health` endpoint after deployment to verify Playwright is working
3. CORS is pre-configured to allow cross-origin requests

### Alternative Deployment Platforms

For deployment to Docker, AWS, or other platforms:

1. Use a Playwright-compatible base image (e.g., `mcr.microsoft.com/playwright:v1.40.0`)
2. Or install dependencies: `npx playwright install-deps chromium`
3. Ensure the environment has sufficient memory (minimum 1GB recommended)

## Environment Variables

The following environment variables are automatically configured when using Replit AI Integrations:

- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI API base URL (auto-configured)
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key (auto-configured)
- `PORT` - Server port (default: 5000)

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## CORS Configuration

CORS is enabled by default to allow the API to be consumed by external applications like ConsoleBlue's Agent Chat system.

## Error Handling

The service provides helpful error messages for common issues:

- **Invalid URL**: "I couldn't find a valid URL in your question..."
- **Timeout**: "The site took too long to respond..."
- **Inaccessible**: "I couldn't access that URL. Please check that it's valid..."
- **Browser Launch Failure**: "Failed to launch browser. This may be due to missing system dependencies..."

## Response Format

All responses are conversational and include:
- Specific counts and measurements
- Location details (header, footer, navigation, etc.)
- Clear breakdowns for easy understanding
- Actionable error messages when issues occur

## Integration with ConsoleBlue Agent Chat

Once deployed, provide the public URL to integrate with ConsoleBlue's Agent Chat system:

```
POST https://your-replit-url.repl.co/api/agent
```

The conversational responses are optimized for display in chat interfaces.

## License

MIT
