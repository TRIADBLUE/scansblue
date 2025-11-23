# Site Inspector Agent - Design Guidelines

## Project Classification

This is a **backend API service** without a user-facing interface. The service provides a REST API endpoint (`POST /api/agent`) that will be consumed by ConsoleBlue's Agent Chat system.

## No Visual Interface Required

Based on the build request, this project consists of:
- Express server with API endpoints
- Playwright browser automation (headless)
- OpenAI integration for natural language processing
- JSON request/response handling

**There is no frontend UI to design.**

## API Response Format Guidelines

While there's no visual interface, the API should return well-structured conversational responses:

### Response Structure
```
{
  "content": "Conversational analysis with specific details"
}
```

### Response Tone & Style
- **Conversational and friendly**: "I found 12 buttons on swipesblue.com:"
- **Specific and detailed**: Include exact counts, measurements, and locations
- **Structured lists**: Use bullet points for clarity in text responses
- **Helpful error messages**: Clear, actionable guidance when issues occur

### Response Examples

**Success Response:**
"I found 12 buttons on swipesblue.com: 4 in the header navigation, 3 CTA buttons in the hero section, 2 in the features area, and 3 in the footer."

**Error Response:**
"I couldn't access that URL. Please check that it's valid and publicly accessible."

**Comparison Response:**
"Comparing navigation between dev.listit.com and listit.com:
- Dev has 7 menu items, Production has 6
- Dev includes an extra 'Beta Features' link
- Both share the same header structure"

## Integration Note

This service will integrate with ConsoleBlue's Agent Chat system, which will handle the actual user interface and conversation display. Your API responses should be optimized for rendering within that existing chat interface.

**No additional design work is required for this project.**