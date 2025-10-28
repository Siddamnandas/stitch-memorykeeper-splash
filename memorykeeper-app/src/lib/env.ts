import { z } from 'zod';

const booleanString = z
  .union([z.literal('true'), z.literal('false')])
  .transform((value) => value === 'true');

const rawEnv = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_ENABLE_SUPABASE: import.meta.env.VITE_ENABLE_SUPABASE ?? 'false',
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV ?? import.meta.env.MODE ?? 'development',
  VITE_APP_RELEASE: import.meta.env.VITE_APP_RELEASE ?? '',
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN ?? '',
  POSTHOG_KEY: import.meta.env.POSTHOG_KEY ?? '',
  POSTHOG_API_HOST: import.meta.env.POSTHOG_API_HOST ?? '',
  VITE_DISABLE_ANALYTICS_CONSENT: import.meta.env.VITE_DISABLE_ANALYTICS_CONSENT ?? 'false'
};

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url({
    message: 'VITE_SUPABASE_URL must be a valid URL (e.g., https://xyzcompany.supabase.co).'
  }),
  VITE_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'VITE_SUPABASE_ANON_KEY is required')
    .refine((value) => !/^your[_-]supabase/i.test(value), 'VITE_SUPABASE_ANON_KEY must be set.'),
  VITE_ENABLE_SUPABASE: booleanString,
  VITE_APP_ENV: z.enum(['development', 'staging', 'production']),
  VITE_APP_RELEASE: z.string().optional(),
  VITE_SENTRY_DSN: z
    .string()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined))
    .pipe(z.string().url().optional()),
  POSTHOG_KEY: z.string().optional(),
  POSTHOG_API_HOST: z.string().optional(),
  VITE_DISABLE_ANALYTICS_CONSENT: booleanString
});

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  console.error('Environment validation failed:', parsed.error.flatten().fieldErrors);
  throw new Error('Missing or invalid environment configuration. See console for details.');
}

const data = parsed.data;

export const env = {
  VITE_SUPABASE_URL: data.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: data.VITE_SUPABASE_ANON_KEY,
  VITE_ENABLE_SUPABASE: data.VITE_ENABLE_SUPABASE,
  VITE_APP_ENV: data.VITE_APP_ENV,
  VITE_APP_RELEASE: data.VITE_APP_RELEASE,
  VITE_SENTRY_DSN: data.VITE_SENTRY_DSN,
  POSTHOG_KEY: data.POSTHOG_KEY,
  POSTHOG_API_HOST: data.POSTHOG_API_HOST,
  VITE_DISABLE_ANALYTICS_CONSENT: data.VITE_DISABLE_ANALYTICS_CONSENT,
  isProduction: data.VITE_APP_ENV === 'production'
};
