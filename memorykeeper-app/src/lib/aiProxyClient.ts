const AI_PROXY_ENDPOINT = '/api/ai';

export type ChatMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface ChatCompletionMessage {
  role: ChatMessageRole;
  content: string;
}

export interface ChatCompletionRequest {
  messages: ChatCompletionMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatCompletionChoice {
  index: number;
  finish_reason: string | null;
  message: {
    role: ChatMessageRole;
    content: string | null;
  };
}

export interface ChatCompletionResult {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
}

export interface ImageGenerationRequest {
  prompt: string;
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024';
  model?: string;
  response_format?: 'url' | 'b64_json';
  quality?: 'standard' | 'hd';
}

export interface ImageGenerationResult {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({}));
    const message =
      (errorPayload && errorPayload.error) ||
      (errorPayload && errorPayload.message) ||
      `AI proxy error (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error.message?.includes('429') || error.message?.includes('502') || error.message?.includes('503') || error.message?.includes('500');

      if (i === maxRetries - 1 || !isRetryable) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, i) + Math.random() * 1000; // Exponential backoff with jitter
      await sleep(delay);
    }
  }

  throw new Error('Max retries exceeded');
}

export const requestChatCompletion = async (
  payload: ChatCompletionRequest
): Promise<ChatCompletionResult> => {
  return withRetry(async () => {
    const response = await fetch(AI_PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'chat',
        payload
      })
    });

    return handleResponse<ChatCompletionResult>(response);
  });
};

export const requestImageGeneration = async (
  payload: ImageGenerationRequest
): Promise<ImageGenerationResult> => {
  return withRetry(async () => {
    const response = await fetch(AI_PROXY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'image',
        payload
      })
    });

    return handleResponse<ImageGenerationResult>(response);
  });
};

export const requestTranscription = async (
  file: File | Blob,
  options: TranscriptionOptions = {}
): Promise<{ text: string }> => {
  return withRetry(async () => {
    const formData = new FormData();
    formData.append('mode', 'transcription');
    formData.append('file', file);

    if (options.language) {
      formData.append('language', options.language);
    }

    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }

    const response = await fetch(AI_PROXY_ENDPOINT, {
      method: 'POST',
      body: formData
    });

    return handleResponse<{ text: string }>(response);
  });
};
