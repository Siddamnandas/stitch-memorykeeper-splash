# OpenAI Setup Guide for MemoryKeeper

This guide explains how to set up OpenAI for the MemoryKeeper application.

## Prerequisites

1. Create an OpenAI account at [https://platform.openai.com](https://platform.openai.com)
2. Generate an API key from the API keys section

## Setup Instructions

### 1. Configure Environment Variables

Update the `.env` file with your OpenAI API key (note the absence of the `VITE_` prefix because this value must never ship to the browser bundle):

```
OPENAI_API_KEY=your-openai-api-key
```

**Important Security Note**:
- The `OPENAI_API_KEY` secret is read exclusively by the `/api/ai` Edge Function (see below) so nothing sensitive lands in the browser bundle.
- When running locally, prefer `vercel dev` so the Vercel runtime can serve the Edge Function next to Vite. Calling OpenAI directly from the client will now return `401 Unauthorized`.

### 2. AI Service Functions

The application includes an AI service (`src/lib/aiService.ts`) with the following functions:

- `generateMemoryPrompt(memories)`: Generates personalized memory prompts based on user's memory history
- `analyzeMemory(memory)`: Analyzes a memory for keywords, sentiment, and summary
- `generateStory(memory)`: Creates a beautifully written short story based on a memory
- `generateRelatedQuestions(memory)`: Generates thoughtful follow-up questions for deeper memory exploration
- `generateMemoryStrengthScore(memory)`: Generates a score indicating the richness and detail of a memory

### 3. Testing the Integration

1. Start the development server: `npm run dev`
2. Navigate to `/openai-test` to test the AI features
3. Run different tests to verify the integration works correctly

## AI Features in the Application

### Memory Prompt Generation
The AI generates personalized prompts based on the user's previous memories to encourage recall of related or contrasting experiences.

### Memory Analysis
The AI analyzes memories for:
- Keywords extraction
- Sentiment analysis (positive, negative, neutral)
- Brief summarization

### Story Generation
The AI can expand a simple memory into a beautifully written short story with descriptive details and emotional depth.

### Related Questions
The AI generates thoughtful follow-up questions to help users explore their memories more deeply.

### Memory Strength Scoring
The AI evaluates memories and provides a score (1-100) based on factors like emotional depth, specific details, sensory descriptions, and narrative structure.

## AI Proxy Architecture

MemoryKeeper now ships with a Vercel Edge Function at `api/ai.ts` that proxies every AI request through a single hardened surface. The proxy:

1. Accepts JSON payloads for chat/image generation or multipart form-data for Whisper transcriptions.
2. Runs OpenAI moderation checks before invoking the relevant API.
3. Logs failures server-side while returning sanitized error messages to the client.
4. Keeps the `OPENAI_API_KEY` confined to the server runtime (no `dangerouslyAllowBrowser` usage).

The React app never imports the OpenAI SDK directly—`src/lib/aiProxyClient.ts` simply calls `/api/ai`, making it easy to extend or migrate providers without touching the browser bundle.

## Troubleshooting

If you encounter issues:

1. Verify that your OpenAI API key is correctly set in the `.env` file
2. Check that you have sufficient credits in your OpenAI account
3. Ensure that your API key has the necessary permissions
4. Check the browser console for any error messages
5. Verify that the OpenAI client is properly initialized

## Rate Limiting and Caching

To prevent excessive API calls:

1. Implement client-side caching for AI responses
2. Add rate limiting to prevent excessive calls
3. Consider using localStorage to cache recent AI responses
4. Implement proper error handling for rate limit errors

## Cost Management

OpenAI API usage incurs costs. To manage costs:

1. Monitor your API usage in the OpenAI dashboard
2. Implement caching to reduce redundant calls
3. Use appropriate models (gpt-3.5-turbo is more cost-effective than gpt-4)
4. Set up billing alerts to monitor spending
