import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  type ReactNode,
  type FC
} from 'react';

import { supabase } from './supabaseClient';
import { Session, User } from '@supabase/supabase-js';
import { useAppState } from './AppStateContext';
import { subscribeToMemories, subscribeToProfile, UserProfile } from './dataService';
import { saveProfile as saveProfileOffline, getProfile as getOfflineProfile, markProfileAsSynced, addSingleMemory as cacheRemoteMemory, markMemoriesAsSynced as markCachedMemoriesSynced } from './indexedDBService';

interface AuthUserProfile extends UserProfile {
  email: string | null;
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

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: AuthUserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AuthUserProfile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  loading: boolean;
  profileLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  onboardingComplete: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const { dispatch } = useAppState();
  const subscriptionRef = useRef<{ memories: string; profile: string } | null>(null);

  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development';
  const useSupabaseInDev = (import.meta.env.VITE_ENABLE_SUPABASE || '').toLowerCase() === 'true';

  // In development mode with Supabase disabled, use mock authentication
  const shouldUseMockAuth = isDevelopment && !useSupabaseInDev;

  // Initialize with mock user in development when Supabase is disabled
  useEffect(() => {
    if (shouldUseMockAuth) {
      // Set up mock user and session
      const mockUser: User = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: 'developer@example.com',
        phone: '',
        role: 'authenticated',
        confirmed_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        phone_confirmed_at: undefined,
        last_sign_in_at: new Date().toISOString(),
        identities: []
      };

      const mockProfile: AuthUserProfile = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'developer@example.com',
        full_name: 'Developer User',
        avatar_url: undefined,
        created_at: new Date().toISOString(),
        memory_strength: 75,
        avatar_choice: 'default',
        age: 72,
        theme_preference: 'Nostalgic',
        memory_goals: [],
        preferred_games: [],
        notification_preferences: {
          emailReminders: true,
          pushNotifications: true,
          weeklyProgress: true
        },
        ai_consent_analysis: true,
        ai_consent_summaries: true,
        invited_family_emails: []
      };

      setUser(mockUser);
      setSession({
        provider_token: null,
        provider_refresh_token: null,
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: mockUser
      } as Session);
      setProfile(mockProfile);
      setLoading(false);
      setProfileLoading(false);
    }
  }, [shouldUseMockAuth]);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      if (!supabase) {
        try {
          const offlineProfile = await getOfflineProfile();
          if (offlineProfile) {
            const authProfile: AuthUserProfile = {
              id: offlineProfile.id,
              user_id: offlineProfile.userId,
              email: user?.email || null,
              full_name: offlineProfile.fullName || '',
              avatar_url: offlineProfile.avatarUrl,
              memory_strength: offlineProfile.memoryStrength,
              created_at: offlineProfile.createdAt,
              updated_at: offlineProfile.updatedAt
            };

            setProfile(authProfile);
            if (typeof authProfile.memory_strength === 'number') {
              dispatch({ type: 'UPDATE_MEMORY_STRENGTH', payload: authProfile.memory_strength });
            }
            return authProfile;
          }
        } catch (error) {
          console.warn('Unable to load offline profile:', error);
        }
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          return await createProfile(userId);
        }
        throw error;
      }

      // Convert to AuthUserProfile
      const authProfile: AuthUserProfile = {
        ...data,
        email: user?.email || null
      };

      setProfile(authProfile);
      await saveProfileOffline({
        id: 'default',
        userId,
        fullName: authProfile.full_name || '',
        avatarUrl: authProfile.avatar_url || undefined,
        memoryStrength: authProfile.memory_strength || 0,
        synced: true
      });
      await markProfileAsSynced();
      return authProfile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    } finally {
      setProfileLoading(false);
    }
  };

  // Create user profile
  const createProfile = async (userId: string) => {
    try {
      if (!supabase) return null;

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          updated_at: new Date().toISOString(),
          full_name: '',
          avatar_url: undefined,
          memory_strength: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Convert to AuthUserProfile
      const authProfile: AuthUserProfile = {
        ...data,
        email: user?.email || null
      };

      setProfile(authProfile);
      await saveProfileOffline({
        id: 'default',
        userId,
        fullName: authProfile.full_name || '',
        avatarUrl: authProfile.avatar_url || undefined,
        memoryStrength: authProfile.memory_strength || 0,
        synced: true
      });
      await markProfileAsSynced();
      return authProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  // Set up real-time subscriptions
  const setupSubscriptions = useCallback((userId: string) => {
    if (!supabase) return;

    // Subscribe to memories changes
    const memoriesSubscriptionId = subscribeToMemories(userId, async (memories) => {
      dispatch({ type: 'SET_MEMORIES', payload: memories });
      try {
        await Promise.all(
          memories.map((memory) =>
            cacheRemoteMemory({
              id: memory.id || `remote-${Date.now()}-${Math.random()}`,
              userId: memory.user_id,
              prompt: memory.prompt,
              response: memory.response,
              date: memory.date,
              type: memory.type,
              tags: memory.tags || [],
              synced: true
            })
          )
        );
        const syncedIds = memories
          .map((memory) => memory.id)
          .filter((id): id is string => Boolean(id));
        if (syncedIds.length > 0) {
          await markCachedMemoriesSynced(syncedIds);
        }
      } catch (error) {
        console.warn('Unable to update offline cache from subscription:', error);
      }
    });

    // Subscribe to profile changes
    const profileSubscriptionId = subscribeToProfile(userId, async (updatedProfile) => {
      // Convert to AuthUserProfile
      const authProfile: AuthUserProfile = {
        ...updatedProfile,
        email: user?.email || null
      };
      setProfile(authProfile);
      if (updatedProfile.memory_strength !== undefined) {
        dispatch({ type: 'UPDATE_MEMORY_STRENGTH', payload: updatedProfile.memory_strength });
      }
      try {
        await saveProfileOffline({
          id: 'default',
          userId,
          fullName: authProfile.full_name || '',
          avatarUrl: authProfile.avatar_url || undefined,
          memoryStrength: authProfile.memory_strength || 0,
          synced: true
        });
        await markProfileAsSynced();
      } catch (error) {
        console.warn('Unable to update offline profile from subscription:', error);
      }
    });

    subscriptionRef.current = {
      memories: memoriesSubscriptionId,
      profile: profileSubscriptionId
    };
  }, [dispatch, user?.email]);

  // Clean up subscriptions
  const cleanupSubscriptions = useCallback(() => {
    if (subscriptionRef.current) {
      if (subscriptionRef.current.memories) {
        // unsubscribe(subscriptionRef.current.memories);
      }
      if (subscriptionRef.current.profile) {
        // unsubscribe(subscriptionRef.current.profile);
      }
      subscriptionRef.current = null;
    }
  }, []);

  useEffect(() => {
    // If Supabase is not configured or we're in development mode, provide mock data
    if (!supabase || isDevelopment) {
      console.warn('Supabase not configured or in development mode, using mock data');

      // Provide mock user data for development
      if (isDevelopment) {
        // Use a valid UUID format for development mock user
        const mockUser: User = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: 'developer@example.com',
          phone: '',
          role: 'authenticated',
          confirmed_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          phone_confirmed_at: undefined,
          last_sign_in_at: new Date().toISOString(),
          identities: []
        };

      const mockProfile: AuthUserProfile = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'developer@example.com',
        full_name: 'Developer User',
        avatar_url: undefined,
        created_at: new Date().toISOString(),
        memory_strength: 75,
        avatar_choice: 'default',
        age: 72,
        theme_preference: 'Nostalgic',
        memory_goals: ['Maintain cognitive health'],
        preferred_games: ['Memory Matchup (Card Matching)'],
        notification_preferences: {
          emailReminders: true,
          pushNotifications: true,
          weeklyProgress: true
        },
        ai_consent_analysis: true,
        ai_consent_summaries: false,
        invited_family_emails: []
      };

        setUser(mockUser);
        setSession({
          provider_token: null,
          provider_refresh_token: null,
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser
        } as Session);
        setProfile(mockProfile);
        dispatch({ type: 'UPDATE_MEMORY_STRENGTH', payload: 75 });
      }

      setLoading(false);
      setProfileLoading(false);
      return;
    }

    // Check active session
    const getSession = async () => {
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user || null);

      // If user is authenticated, fetch their profile and set up subscriptions
      if (session?.user) {
        await fetchProfile(session.user.id);
        setupSubscriptions(session.user.id);

        // Fetch user memories and sync with app state
        try {
          const { data: memories, error } = await supabase
            .from('memories')
            .select('*')
            .eq('user_id', session.user.id)
            .order('date', { ascending: false });

          if (error) throw error;

          if (memories) {
            dispatch({ type: 'SET_MEMORIES', payload: memories });
            try {
              await Promise.all(
                memories.map((memory) =>
                  cacheRemoteMemory({
                    id: memory.id || `remote-${Date.now()}-${Math.random()}`,
                    userId: memory.user_id,
                    prompt: memory.prompt,
                    response: memory.response,
                    date: memory.date,
                    type: memory.type,
                    tags: memory.tags || [],
                    synced: true
                  })
                )
              );
              const syncedIds = memories
                .map((memory) => memory.id)
                .filter((id): id is string => Boolean(id));
              if (syncedIds.length > 0) {
                await markCachedMemoriesSynced(syncedIds);
              }
            } catch (error) {
              console.warn('Unable to cache remote memories for offline use:', error);
            }
          }
        } catch (error) {
          console.error('Error fetching user memories:', error);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);

      // Listen for auth changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        setUser(session?.user || null);

        // Clean up previous subscriptions
        cleanupSubscriptions();

        // If user is authenticated, fetch their profile and set up subscriptions
        if (session?.user) {
          await fetchProfile(session.user.id);
          setupSubscriptions(session.user.id);

          // Fetch user memories and sync with app state
          try {
            if (supabase) {
              const { data: memories, error } = await supabase
                .from('memories')
                .select('*')
                .eq('user_id', session.user.id)
                .order('date', { ascending: false });

              if (error) throw error;

              if (memories) {
                dispatch({ type: 'SET_MEMORIES', payload: memories });
              }
            }
          } catch (error) {
            console.error('Error fetching user memories:', error);
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
        cleanupSubscriptions();
      };
    };

    getSession();
  }, [setupSubscriptions, cleanupSubscriptions]);

  const signIn = async (email: string, password: string) => {
    // Clear any previous errors
    setAuthError(null);

    try {
      if (isDevelopment) {
        // Mock sign in for development
        const mockUser: User = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: email,
          phone: '',
          role: 'authenticated',
          confirmed_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          phone_confirmed_at: undefined,
          last_sign_in_at: new Date().toISOString(),
          identities: []
        };

        const mockProfile: AuthUserProfile = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: email,
          full_name: 'Developer User',
          avatar_url: undefined,
          created_at: new Date().toISOString(),
          memory_strength: 75,
          avatar_choice: 'default',
          age: 72,
          theme_preference: 'Nostalgic',
          memory_goals: ['Maintain cognitive health'],
          preferred_games: ['Memory Matchup (Card Matching)'],
          notification_preferences: {
            emailReminders: true,
            pushNotifications: true,
            weeklyProgress: true
          },
          ai_consent_analysis: true,
          ai_consent_summaries: false,
          invited_family_emails: []
        };

        setUser(mockUser);
        setSession({
          provider_token: null,
          provider_refresh_token: null,
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser
        } as Session);
        setProfile(mockProfile);
        dispatch({ type: 'UPDATE_MEMORY_STRENGTH', payload: 75 });
        return;
      }

      if (!supabase) {
        throw new Error('Authentication service is not available. Please check your connection.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // Handle specific Supabase auth errors
        let userFriendlyMessage = 'Sign in failed. Please try again.';

        switch (error.message) {
          case 'Invalid login credentials':
            userFriendlyMessage = 'Invalid email or password. Please check your credentials and try again.';
            break;
          case 'Email not confirmed':
            userFriendlyMessage = 'Please check your email and confirm your account before signing in.';
            break;
          case 'Too many requests':
            userFriendlyMessage = 'Too many sign-in attempts. Please wait a few minutes before trying again.';
            break;
          case 'User not found':
            userFriendlyMessage = 'No account found with this email address.';
            break;
          default:
            userFriendlyMessage = error.message || userFriendlyMessage;
        }

        setAuthError(userFriendlyMessage);
        throw new Error(userFriendlyMessage);
      }

      // Success - profile will be loaded by the auth state change listener
      if (data?.user) {
        setAuthError(null);
      }
    } catch (error: any) {
      // Re-throw with user-friendly message if not already set
      if (!authError) {
        const message = error.message || 'An unexpected error occurred during sign in. Please try again.';
        setAuthError(message);
        throw new Error(message);
      }
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Clear any previous errors
    setAuthError(null);

    try {
      if (isDevelopment) {
        // Mock sign up for development
        const mockUser: User = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: email,
          phone: '',
          role: 'authenticated',
          confirmed_at: new Date().toISOString(),
          email_confirmed_at: new Date().toISOString(),
          phone_confirmed_at: undefined,
          last_sign_in_at: new Date().toISOString(),
          identities: []
        };

        const mockProfile: AuthUserProfile = {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: email,
          full_name: fullName || 'Developer User',
          avatar_url: undefined,
          created_at: new Date().toISOString(),
          memory_strength: 0,
          avatar_choice: 'default',
          age: 72,
          theme_preference: 'Nostalgic',
          memory_goals: [],
          preferred_games: [],
          notification_preferences: {
            emailReminders: true,
            pushNotifications: true,
            weeklyProgress: true
          },
          ai_consent_analysis: false,
          ai_consent_summaries: false,
          invited_family_emails: []
        };

        setUser(mockUser);
        setSession({
          provider_token: null,
          provider_refresh_token: null,
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser
        } as Session);
        setProfile(mockProfile);
        dispatch({ type: 'UPDATE_MEMORY_STRENGTH', payload: 0 });
        return;
      }

      if (!supabase) {
        throw new Error('Authentication service is not available. Please check your connection.');
      }

      // Validate password strength
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
            avatar_url: undefined
          }
        }
      });

      if (error) {
        // Handle specific Supabase auth errors
        let userFriendlyMessage = 'Sign up failed. Please try again.';

        switch (error.message) {
          case 'User already registered':
            userFriendlyMessage = 'An account with this email already exists. Please try signing in instead.';
            break;
          case 'Password should be at least 6 characters':
            userFriendlyMessage = 'Password must be at least 6 characters long.';
            break;
          case 'Invalid email':
            userFriendlyMessage = 'Please enter a valid email address.';
            break;
          case 'Signup is disabled':
            userFriendlyMessage = 'New account registration is currently disabled. Please contact support.';
            break;
          default:
            userFriendlyMessage = error.message || userFriendlyMessage;
        }

        setAuthError(userFriendlyMessage);
        throw new Error(userFriendlyMessage);
      }

      // If user is created, profile will be handled by the auth state change
      if (data?.user) {
        setAuthError(null);
        // Note: In production, user might need to confirm email before being fully authenticated
      }
    } catch (error: any) {
      // Re-throw with user-friendly message if not already set
      if (!authError) {
        const message = error.message || 'An unexpected error occurred during sign up. Please try again.';
        setAuthError(message);
        throw new Error(message);
      }
      throw error;
    }
  };

  const signOut = async () => {
    // Clean up subscriptions
    cleanupSubscriptions();

    if (isDevelopment) {
      // Mock sign out for development
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }

    if (!supabase) {
      // Reset local state even if Supabase is not configured
      setUser(null);
      setSession(null);
      setProfile(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Reset profile state
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<AuthUserProfile>) => {
    // Clear any previous errors
    setAuthError(null);

    try {
      if (isDevelopment) {
        // Mock profile update for development
        if (profile) {
          const updatedProfile = { ...profile, ...updates };
          setProfile(updatedProfile);
          if (updates.memory_strength !== undefined) {
            dispatch({ type: 'UPDATE_MEMORY_STRENGTH', payload: updates.memory_strength });
          }
          await saveProfileOffline({
            id: 'default',
            userId: updatedProfile.id || user?.id,
            fullName: updatedProfile.full_name || '',
            avatarUrl: updatedProfile.avatar_url || undefined,
            memoryStrength: updatedProfile.memory_strength || 0,
            synced: false
          });
        }
        return;
      }

      if (!supabase || !user) {
        throw new Error('You must be signed in to update your profile.');
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        let userFriendlyMessage = 'Failed to update profile. Please try again.';

        switch (error.message) {
          case 'duplicate key value violates unique constraint':
            userFriendlyMessage = 'This information is already in use. Please choose different values.';
            break;
          case 'violates row-level security policy':
            userFriendlyMessage = 'You do not have permission to update this profile.';
            break;
          default:
            userFriendlyMessage = error.message || userFriendlyMessage;
        }

        setAuthError(userFriendlyMessage);
        throw new Error(userFriendlyMessage);
      }

      // Update local profile state
      if (profile) {
        const updatedProfile = { ...profile, ...updates };
        setProfile(updatedProfile);
        if (updates.memory_strength !== undefined) {
          dispatch({ type: 'UPDATE_MEMORY_STRENGTH', payload: updates.memory_strength });
        }
        await saveProfileOffline({
          id: 'default',
          userId: updatedProfile.id || user?.id,
          fullName: updatedProfile.full_name || '',
          avatarUrl: updatedProfile.avatar_url || undefined,
          memoryStrength: updatedProfile.memory_strength || 0,
          synced: true
        });
        await markProfileAsSynced();
      }
    } catch (error: any) {
      // Re-throw with user-friendly message if not already set
      if (!authError) {
        const message = error.message || 'An unexpected error occurred while updating your profile.';
        setAuthError(message);
        throw new Error(message);
      }
      throw error;
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const signInWithGoogle = async () => {
    // Clear any previous errors
    setAuthError(null);

    try {
      if (!supabase) {
        throw new Error('Authentication service is not available. Please check your connection.');
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/memory-keeper-main`
        }
      });

      if (error) {
        // Provide more specific error messages for common issues
        let errorMessage = `Google sign-in failed: ${error.message}`;
        if (error.message.includes('400')) {
          errorMessage = 'Google authentication is not properly configured. Please contact the application administrator.';
        }
        setAuthError(errorMessage);
        throw new Error(errorMessage);
      }

      // OAuth redirect will handle the rest
    } catch (error: any) {
      if (!authError) {
        const message = error.message || 'An unexpected error occurred during Google sign-in.';
        setAuthError(message);
        throw new Error(message);
      }
      throw error;
    }
  };

  const signInWithApple = async () => {
    // Clear any previous errors
    setAuthError(null);

    try {
      if (!supabase) {
        throw new Error('Authentication service is not available. Please check your connection.');
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/memory-keeper-main`
        }
      });

      if (error) {
        // Provide more specific error messages for common issues
        let errorMessage = `Apple sign-in failed: ${error.message}`;
        if (error.message.includes('400')) {
          errorMessage = 'Apple authentication is not properly configured. Please contact the application administrator.';
        }
        setAuthError(errorMessage);
        throw new Error(errorMessage);
      }

      // OAuth redirect will handle the rest
    } catch (error: any) {
      if (!authError) {
        const message = error.message || 'An unexpected error occurred during Apple sign-in.';
        setAuthError(message);
        throw new Error(message);
      }
      throw error;
    }
  };

  const completeOnboarding = async () => {
    // Clear any previous errors
    setAuthError(null);

    try {
      if (!user) {
        throw new Error('You must be signed in to complete onboarding.');
      }

      // Mark onboarding as complete in profile or user preferences
      if (profile) {
        await updateProfile({
          ...profile,
          onboarding_complete: true
        });
      }

      setOnboardingComplete(true);
    } catch (error: any) {
      // Re-throw with user-friendly message if not already set
      if (!authError) {
        const message = error.message || 'An unexpected error occurred while completing onboarding.';
        setAuthError(message);
        throw new Error(message);
      }
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    // Clear any previous errors
    setAuthError(null);

    try {
      if (isDevelopment) {
        // Mock password reset for development
        console.log(`Development mode: Password reset requested for ${email}`);
        return;
      }

      if (!supabase) {
        throw new Error('Authentication service is not available. Please check your connection.');
      }

      // Validate email format (basic check)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address.');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        let userFriendlyMessage = 'Failed to send password reset email. Please try again.';

        switch (error.message) {
          case 'User not found':
            userFriendlyMessage = 'If an account with this email exists, you will receive a password reset link.';
            break;
          case 'Email rate limit exceeded':
            userFriendlyMessage = 'Too many requests. Please wait a few minutes before trying again.';
            break;
          case 'Invalid email':
            userFriendlyMessage = 'Please enter a valid email address.';
            break;
          default:
            userFriendlyMessage = error.message || userFriendlyMessage;
        }

        setAuthError(userFriendlyMessage);
        throw new Error(userFriendlyMessage);
      }

      // Success - don't show specific success message for security reasons
      setAuthError(null);
    } catch (error: any) {
      // Re-throw with user-friendly message if not already set
      if (!authError) {
        const message = error.message || 'An unexpected error occurred while requesting password reset.';
        setAuthError(message);
        throw new Error(message);
      }
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    // Clear any previous errors
    setAuthError(null);

    try {
      if (isDevelopment) {
        // Mock password update for development
        console.log('Development mode: Password updated');
        return;
      }

      if (!supabase) {
        throw new Error('You must be signed in to update your password.');
      }

      // Validate password strength
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        let userFriendlyMessage = 'Failed to update password. Please try again.';

        switch (error.message) {
          case 'Password should be at least 6 characters':
            userFriendlyMessage = 'Password must be at least 6 characters long.';
            break;
          case 'Same password':
            userFriendlyMessage = 'New password must be different from your current password.';
            break;
          case 'Weak password':
            userFriendlyMessage = 'Please choose a stronger password.';
            break;
          default:
            userFriendlyMessage = error.message || userFriendlyMessage;
        }

        setAuthError(userFriendlyMessage);
        throw new Error(userFriendlyMessage);
      }

      // Success
      setAuthError(null);
    } catch (error: any) {
      // Re-throw with user-friendly message if not already set
      if (!authError) {
        const message = error.message || 'An unexpected error occurred while updating your password.';
        setAuthError(message);
        throw new Error(message);
      }
      throw error;
    }
  };

  const value = {
    user,
    session,
    profile,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    signInWithGoogle,
    signInWithApple,
    completeOnboarding,
    loading,
    profileLoading,
    authError,
    clearAuthError,
    onboardingComplete
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
