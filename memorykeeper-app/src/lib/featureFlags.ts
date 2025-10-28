import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { trackError } from './analytics';
import { env } from './env';

// Feature flag interface
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  enabled_percentage?: number;
  user_ids?: string[];
  user_emails?: string[];
  created_at: string;
  updated_at: string;
}

// Feature flag keys
export const FEATURE_FLAGS = {
  AI_STUDIO: 'ai_studio',
  COLLABORATION: 'collaboration',
  PAYMENTS: 'payments',
  ADVANCED_GAMES: 'advanced_games',
  CANARY: 'canary',
  ANALYTICS: 'analytics_enabled',
  PUSH_NOTIFICATIONS: 'push_notifications'
} as const;

export type FeatureFlagKey = typeof FEATURE_FLAGS[keyof typeof FEATURE_FLAGS];

// Default feature flags (fallback when Supabase unavailable)
const DEFAULT_FLAGS: Record<FeatureFlagKey, boolean> = {
  [FEATURE_FLAGS.AI_STUDIO]: true,
  [FEATURE_FLAGS.COLLABORATION]: false,
  [FEATURE_FLAGS.PAYMENTS]: false,
  [FEATURE_FLAGS.ADVANCED_GAMES]: true,
  [FEATURE_FLAGS.CANARY]: false,
  [FEATURE_FLAGS.ANALYTICS]: !env.VITE_DISABLE_ANALYTICS_CONSENT,
  [FEATURE_FLAGS.PUSH_NOTIFICATIONS]: false
};

// Feature flag cache and hooks
let flagsCache: Record<FeatureFlagKey, boolean> | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Admin function to create feature flags table (run once)
export const initializeFeatureFlags = async () => {
  if (!supabase) return;

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS feature_flags (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        enabled BOOLEAN DEFAULT FALSE,
        enabled_percentage INTEGER DEFAULT 0 CHECK (enabled_percentage >= 0 AND enabled_percentage <= 100),
        user_ids UUID[] DEFAULT ARRAY[]::UUID[],
        user_emails TEXT[] DEFAULT ARRAY[]::TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Enable RLS
      ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

      -- Service role can read/write flags (for admin operations)
      CREATE POLICY "Service role can manage feature flags" ON feature_flags
        FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

      -- Everyone can read flags (cached on client)
      CREATE POLICY "Everyone can read feature flags" ON feature_flags
        FOR SELECT USING (true);

      -- Insert default flags
      INSERT INTO feature_flags (key, name, description, enabled, enabled_percentage)
      VALUES
        ('ai_studio', 'AI Studio', 'Enable AI-powered storytelling and content generation', true, 100),
        ('collaboration', 'Collaboration', 'Allow sharing memories with family members', false, 0),
        ('payments', 'Payments', 'Enable premium features and billing', false, 0),
        ('advanced_games', 'Advanced Games', 'Unlock advanced memory games', true, 100),
        ('canary', 'Canary Deployment', 'Enable new features for testing', false, 0),
        ('analytics_enabled', 'Analytics', 'Enable user behavior tracking', true, 100),
        ('push_notifications', 'Push Notifications', 'Enable push notification reminders', false, 0)
      ON CONFLICT (key) DO NOTHING;
    `
  });

  if (error) {
    console.error('Failed to initialize feature flags:', error);
    trackError('feature_flags_init_failed', { error: error.message });
  }
};

// Fetch feature flags from Supabase
const fetchFeatureFlags = async (): Promise<Record<FeatureFlagKey, boolean>> => {
  if (!supabase) {
    console.warn('Supabase not configured, using default feature flags');
    return DEFAULT_FLAGS;
  }

  try {
    const { data: flags, error } = await supabase
      .from('feature_flags')
      .select('key, enabled, enabled_percentage, user_ids, user_emails')
      .order('key');

    if (error) throw error;

    const result: Record<string, boolean> = { ...DEFAULT_FLAGS };

    for (const flag of flags) {
      let isEnabled = flag.enabled;

      // For percentage rollouts and user-specific flags, we need user context
      // For now, fall back to database values - admin can override via DB
      // Could enhance this later to include user context

      result[flag.key] = isEnabled;
    }

    return result;
  } catch (error: any) {
    console.error('Failed to fetch feature flags:', error);
    trackError('feature_flags_fetch_failed', { error: error.message });
    return DEFAULT_FLAGS;
  }
};

// Get a specific feature flag (with caching)
export const getFeatureFlag = async (key: FeatureFlagKey): Promise<boolean> => {
  const now = Date.now();

  if (!flagsCache || now - cacheTimestamp > CACHE_DURATION) {
    flagsCache = await fetchFeatureFlags();
    cacheTimestamp = now;
  }

  return flagsCache[key] || DEFAULT_FLAGS[key] || false;
};

// Get all feature flags (with caching)
export const getAllFeatureFlags = async (): Promise<Record<FeatureFlagKey, boolean>> => {
  const now = Date.now();

  if (!flagsCache || now - cacheTimestamp > CACHE_DURATION) {
    flagsCache = await fetchFeatureFlags();
    cacheTimestamp = now;
  }

  return { ...flagsCache };
};

// React hook for feature flags
export const useFeatureFlag = (key: FeatureFlagKey): boolean => {
  const [enabled, setEnabled] = useState(DEFAULT_FLAGS[key] || false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadFlag = async () => {
      try {
        const isEnabled = await getFeatureFlag(key);
        if (mounted) {
          setEnabled(isEnabled);
          setLoading(false);
        }
      } catch (error) {
        console.error(`Failed to load feature flag ${key}:`, error);
        setLoading(false);
      }
    };

    loadFlag();

    // Real-time updates disabled for now - cache provides sufficient performance

    return () => { mounted = false; };
  }, [key]);

  return enabled;
};

// React hook for all feature flags
export const useFeatureFlags = (): Record<FeatureFlagKey, boolean> & { loading: boolean } => {
  const [flags, setFlags] = useState<Record<FeatureFlagKey, boolean>>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadFlags = async () => {
      try {
        const allFlags = await getAllFeatureFlags();
        if (mounted) {
          setFlags(allFlags);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load feature flags:', error);
        setLoading(false);
      }
    };

    loadFlags();

    // Real-time updates disabled for now - cache provides sufficient performance

    return () => { mounted = false; };
  }, []);

  return { ...flags, loading };
};

// Admin functions for managing feature flags
export const updateFeatureFlag = async (key: FeatureFlagKey, updates: Partial<FeatureFlag>): Promise<void> => {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('feature_flags')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('key', key);

  if (error) throw error;

  // Invalidate cache
  flagsCache = null;
};

export const createFeatureFlag = async (flag: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('feature_flags')
    .insert([flag]);

  if (error) throw error;

  // Invalidate cache
  flagsCache = null;
};

export const deleteFeatureFlag = async (key: FeatureFlagKey): Promise<void> => {
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('feature_flags')
    .delete()
    .eq('key', key);

  if (error) throw error;

  // Invalidate cache
  flagsCache = null;
};

// Utility to check if canary mode is enabled
export const isCanaryUser = async (): Promise<boolean> => {
  return getFeatureFlag(FEATURE_FLAGS.CANARY);
};
