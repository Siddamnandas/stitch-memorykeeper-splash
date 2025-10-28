import { supabase, isSupabaseConfigured } from './supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';

// Type for our safe Supabase client
type SafeSupabaseClient = NonNullable<typeof supabase>;

export interface Memory {
  id?: string;
  user_id?: string;
  prompt: string;
  response: string;
  date: string;
  type: string;
  tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  id?: string;
  user_id?: string;
  full_name?: string;
  avatar_url?: string;
  memory_strength?: number;
  created_at?: string;
  updated_at?: string;
  onboarding_complete?: boolean;
  avatar_choice?: string;
  age?: number;
  theme_preference?: string;
  memory_goals?: string[];
  preferred_games?: string[];
  notification_preferences?: {
    emailReminders: boolean;
    pushNotifications: boolean;
    weeklyProgress: boolean;
  };
  ai_consent_analysis?: boolean;
  ai_consent_summaries?: boolean;
  invited_family_emails?: string[];
}

// Real-time subscription handlers
type MemoryChangeHandler = (memories: Memory[]) => void;
type ProfileChangeHandler = (profile: UserProfile) => void;

const memorySubscriptions = new Map<string, MemoryChangeHandler>();
const profileSubscriptions = new Map<string, ProfileChangeHandler>();

// Memories operations
export const getMemories = async (userId: string): Promise<{ data: Memory[] | null; error: PostgrestError | null }> => {
  // If Supabase is not configured, return empty data
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Returning empty memory list.');
    return { data: [], error: null };
  }
  
  try {
    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('memories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching memories:', error);
    return { data: null, error: error as PostgrestError };
  }
};

export const addMemory = async (memory: Omit<Memory, 'id' | 'created_at' | 'updated_at' | 'user_id'>, userId: string): Promise<{ data: Memory | null; error: PostgrestError | null }> => {
  // If Supabase is not configured, return null data
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Cannot add memory.');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('memories')
      .insert([{ ...memory, user_id: userId }])
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error adding memory:', error);
    return { data: null, error: error as PostgrestError };
  }
};

export const updateMemory = async (id: string, updates: Partial<Memory>): Promise<{ data: Memory | null; error: PostgrestError | null }> => {
  // If Supabase is not configured, return null data
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Cannot update memory.');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('memories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error updating memory:', error);
    return { data: null, error: error as PostgrestError };
  }
};

export const deleteMemory = async (id: string): Promise<{ data: Memory | null; error: PostgrestError | null }> => {
  // If Supabase is not configured, return null data
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Cannot delete memory.');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('memories')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error deleting memory:', error);
    return { data: null, error: error as PostgrestError };
  }
};

// User profile operations
export const getUserProfile = async (userId: string): Promise<{ data: UserProfile | null; error: PostgrestError | null }> => {
  // If Supabase is not configured, return null data
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Cannot get user profile.');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error: error as PostgrestError };
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<{ data: UserProfile | null; error: PostgrestError | null }> => {
  // If Supabase is not configured, return null data
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Cannot update user profile.');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { data: null, error: error as PostgrestError };
  }
};

export const createUserProfile = async (userId: string, profile: Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<{ data: UserProfile | null; error: PostgrestError | null }> => {
  // If Supabase is not configured, return null data
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Cannot create user profile.');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('profiles')
      .insert([{ ...profile, user_id: userId }])
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { data: null, error: error as PostgrestError };
  }
};

// Memory strength operations
export const getMemoryStrength = async (userId: string): Promise<{ data: number | null; error: PostgrestError | null }> => {
  // If Supabase is not configured, return default value
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Returning default memory strength.');
    return { data: 0, error: null };
  }
  
  try {
    const { data: profile, error } = await (supabase as SafeSupabaseClient)
      .from('profiles')
      .select('memory_strength')
      .eq('user_id', userId)
      .single();
    
    if (error) return { data: null, error };
    
    return { data: profile?.memory_strength || 0, error: null };
  } catch (error) {
    console.error('Error fetching memory strength:', error);
    return { data: null, error: error as PostgrestError };
  }
};

export const updateMemoryStrength = async (userId: string, strength: number): Promise<{ data: UserProfile | null; error: PostgrestError | null }> => {
  // If Supabase is not configured, return null data
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Cannot update memory strength.');
    return { data: null, error: null };
  }
  
  try {
    const { data, error } = await (supabase as SafeSupabaseClient)
      .from('profiles')
      .update({ memory_strength: strength })
      .eq('user_id', userId)
      .select()
      .single();
    
    return { data, error };
  } catch (error) {
    console.error('Error updating memory strength:', error);
    return { data: null, error: error as PostgrestError };
  }
};

// Real-time subscriptions
export const subscribeToMemories = (userId: string, handler: MemoryChangeHandler): string => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Cannot subscribe to memories.');
    return '';
  }

  const subscriptionId = `memories_${userId}_${Date.now()}`;
  
  // Store the handler
  memorySubscriptions.set(subscriptionId, handler);
  
  // Set up real-time subscription
  (supabase as SafeSupabaseClient)
    .channel(`memories_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'memories',
        filter: `user_id=eq.${userId}`
      },
      async (_payload) => {
        // Fetch updated memories list
        const { data: memories } = await getMemories(userId);
        if (memories) {
          // Notify all subscribers
          memorySubscriptions.forEach((handler, id) => {
            if (id.startsWith(`memories_${userId}`)) {
              handler(memories);
            }
          });
        }
      }
    )
    .subscribe();

  return subscriptionId;
};

export const subscribeToProfile = (userId: string, handler: ProfileChangeHandler): string => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Cannot subscribe to profile.');
    return '';
  }

  const subscriptionId = `profile_${userId}_${Date.now()}`;
  
  // Store the handler
  profileSubscriptions.set(subscriptionId, handler);
  
  // Set up real-time subscription
  (supabase as SafeSupabaseClient)
    .channel(`profile_${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${userId}`
      },
      async (_payload) => {
        // Fetch updated profile
        const { data: profile } = await getUserProfile(userId);
        if (profile) {
          // Notify all subscribers
          profileSubscriptions.forEach((handler, id) => {
            if (id.startsWith(`profile_${userId}`)) {
              handler(profile);
            }
          });
        }
      }
    )
    .subscribe();

  return subscriptionId;
};

export const unsubscribe = (subscriptionId: string): void => {
  if (!isSupabaseConfigured) return;

  // Remove handler
  memorySubscriptions.delete(subscriptionId);
  profileSubscriptions.delete(subscriptionId);

  // Close channel if no more subscriptions for this user
  const userId = subscriptionId.split('_')[1];
  const hasMemoriesSub = Array.from(memorySubscriptions.keys()).some(id => id.startsWith(`memories_${userId}`));
  const hasProfileSub = Array.from(profileSubscriptions.keys()).some(id => id.startsWith(`profile_${userId}`));

  if (!hasMemoriesSub && !hasProfileSub) {
    (supabase as SafeSupabaseClient).channel(`memories_${userId}`).unsubscribe();
    (supabase as SafeSupabaseClient).channel(`profile_${userId}`).unsubscribe();
  }
};
