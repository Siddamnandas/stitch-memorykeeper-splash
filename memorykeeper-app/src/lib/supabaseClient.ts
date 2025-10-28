import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Use validated environment variables
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

// Allow devs to explicitly opt-in to Supabase while running the dev server.
// By default we rely on the rich mock data instead of hitting the remote instance.
const isDevelopmentMode = env.VITE_APP_ENV === 'development';
const useSupabaseInDev = env.VITE_ENABLE_SUPABASE;

// Validate Supabase URL
const isValidSupabaseUrl = (url: string): boolean => {
  try {
    if (!url || url === 'YOUR_SUPABASE_URL') return false;
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

const shouldInitialiseClient =
  (!isDevelopmentMode || useSupabaseInDev) &&
  isValidSupabaseUrl(SUPABASE_URL) &&
  SUPABASE_ANON_KEY &&
  SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';

// Create a single supabase client for interacting with your database
// Only create client if credentials are provided and valid
export const supabase = shouldInitialiseClient
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export const isSupabaseConfigured = supabase !== null;

// Log configuration status for debugging
if (supabase === null) {
  console.warn(
    useSupabaseInDev
      ? 'Supabase initialisation skipped despite VITE_ENABLE_SUPABASE because credentials are missing or invalid.'
      : 'Supabase client not initialized. Running in mock/offline mode.'
  );
  if (!isValidSupabaseUrl(SUPABASE_URL)) {
    console.warn('Invalid or missing VITE_SUPABASE_URL:', SUPABASE_URL);
  }
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn('Invalid or missing VITE_SUPABASE_ANON_KEY');
  }
}
