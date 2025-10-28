import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const config = {
  runtime: 'edge'
};

const jsonResponse = (data: Record<string, unknown>, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    status: init?.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    ...init
  });

const ensureApiKey = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }
};

const extractModerationText = (payload: any): string | null => {
  if (!payload) return null;

  if ('messages' in payload && Array.isArray(payload.messages)) {
    return payload.messages
      .map((message: any) => {
        if (typeof message?.content === 'string') {
          return message.content;
        }
        if (Array.isArray(message?.content)) {
          return message.content
            .map((part: any) => (typeof part?.text === 'string' ? part.text : ''))
            .join('\n');
        }
        return '';
      })
      .join('\n')
      .trim();
  }

  if ('prompt' in payload && typeof payload.prompt === 'string') {
    return payload.prompt;
  }

  return null;
};

const runModeration = async (text: string | null) => {
  if (!text) return;

  const moderation = await openai.moderations.create({
    model: 'omni-moderation-latest',
    input: text
  });

  if (moderation?.results?.[0]?.flagged) {
    throw new Error('Content violates safety guidelines.');
  }
};

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    ensureApiKey();

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const mode = (formData.get('mode') || 'transcription') as string;

      if (mode !== 'transcription') {
        return jsonResponse({ error: 'Unsupported multipart mode' }, { status: 400 });
      }

      const file = formData.get('file');
      if (!(file instanceof File)) {
        return jsonResponse({ error: 'Audio file is required' }, { status: 400 });
      }

      const language = (formData.get('language') || 'en').toString();
      const prompt = formData.get('prompt');

      const transcription = await openai.audio.transcriptions.create({
        file,
        model: 'whisper-1',
        language,
        prompt: typeof prompt === 'string' ? prompt : undefined
      });

      return jsonResponse({ text: transcription.text });
    }

    const { mode = 'chat', payload } = await request.json();

    if (!payload) {
      return jsonResponse({ error: 'Payload is required' }, { status: 400 });
    }

    switch (mode) {
      case 'chat': {
        await runModeration(extractModerationText(payload));
        const response = await openai.chat.completions.create(payload);
        return jsonResponse(response as unknown as Record<string, unknown>);
      }
      case 'image': {
        await runModeration(extractModerationText(payload));
        const response = await openai.images.generate(payload);
        return jsonResponse(response as unknown as Record<string, unknown>);
      }
      default:
        return jsonResponse({ error: `Unsupported mode: ${mode}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[api/ai] Error:', error);
    const status = error?.message?.includes('safety') ? 400 : 500;
    return jsonResponse(
      {
        error: error?.message || 'AI proxy error'
      },
      { status }
    );
  }
}
