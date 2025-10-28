/**
 * Input sanitization utilities for user data security
 */

/**
 * Sanitizes text input by removing potential XSS vectors and trimming whitespace
 */
export const sanitizeTextInput = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: URLs
    .replace(/javascript:/gi, '')
    // Remove data: URLs that could contain scripts
    .replace(/data:\s*text\/html/gi, '')
    // Limit length to prevent abuse
    .substring(0, 10000);
};

/**
 * Sanitizes user prompts for AI services
 */
export const sanitizePrompt = (prompt: string): string => {
  return sanitizeTextInput(prompt)
    // Additional prompt-specific sanitization
    .replace(/system\s+prompt/gi, '') // Prevent system prompt injection
    .replace(/ignore\s+previous\s+instructions/gi, '') // Prevent prompt injection attacks
    .trim();
};

/**
 * Validates and sanitizes memory data
 */
export const sanitizeMemoryData = (memory: {
  prompt?: string;
  response?: string;
  type?: string;
  tags?: string[];
}): {
  prompt: string;
  response: string;
  type: string;
  tags: string[];
} => {
  return {
    prompt: sanitizePrompt(memory.prompt || ''),
    response: sanitizeTextInput(memory.response || ''),
    type: ['text', 'audio', 'visual'].includes(memory.type || '') ? memory.type! : 'text',
    tags: (memory.tags || [])
      .filter(tag => typeof tag === 'string' && tag.length > 0 && tag.length <= 50)
      .map(tag => sanitizeTextInput(tag))
      .slice(0, 10) // Limit number of tags
  };
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Sanitizes filename for safe file operations
 */
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9_.-]/g, '_') // Replace unsafe characters
    .replace(/_{2,}/g, '_') // Replace multiple underscores
    .substring(0, 255); // Limit length
};

/**
 * Rate limiting helper
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = userAttempts.filter(time => now - time < windowMs);

    if (validAttempts.length >= maxAttempts) {
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }

  getRemainingAttempts(key: string, maxAttempts: number = 5, windowMs: number = 60000): number {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    const validAttempts = userAttempts.filter(time => now - time < windowMs);
    return Math.max(0, maxAttempts - validAttempts.length);
  }
}

export const rateLimiter = new RateLimiter();

// Export rate limiting functions
export const isRateLimited = (key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
  return !rateLimiter.isAllowed(key, maxAttempts, windowMs);
};

export const getRemainingSyncAttempts = (userId: string): number => {
  return rateLimiter.getRemainingAttempts(`sync_${userId}`, 10, 60000); // 10 syncs per minute
};
