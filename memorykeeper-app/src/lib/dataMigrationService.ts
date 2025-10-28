import { useState, useCallback } from 'react';

import { supabase } from './supabaseClient';
import {
  getAllMemories,
  getProfile,
  markMemoriesAsSynced,
  markProfileAsSynced
} from './indexedDBService';
import { Memory, UserProfile } from './dataService';

// Type for our safe Supabase client
type SafeSupabaseClient = NonNullable<typeof supabase>;

// Check if Supabase is properly configured
const isSupabaseConfigured = supabase !== null;

export interface MigrationResult {
  success: boolean;
  memoriesMigrated: number;
  profileMigrated: boolean;
  errors: string[];
}

export interface MigrationStatus {
  isMigrating: boolean;
  progress: number;
  currentStep: string;
  result?: MigrationResult;
}

/**
 * Migrate user data from IndexedDB to Supabase
 * This function handles the migration of local data to the cloud database
 */
export const migrateUserData = async (
  userId: string,
  onProgress?: (status: MigrationStatus) => void
): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: false,
    memoriesMigrated: 0,
    profileMigrated: false,
    errors: []
  };

  if (!isSupabaseConfigured) {
    result.errors.push('Supabase is not configured. Migration cannot proceed.');
    return result;
  }

  try {
    onProgress?.({
      isMigrating: true,
      progress: 0,
      currentStep: 'Checking local data...'
    });

    // Step 1: Get local memories
    const localMemories = await getAllMemories();
    const unsyncedMemories = localMemories.filter(memory => !memory.synced);

    onProgress?.({
      isMigrating: true,
      progress: 10,
      currentStep: `Found ${unsyncedMemories.length} memories to migrate...`
    });

    // Step 2: Get local profile
    const localProfile = await getProfile();

    onProgress?.({
      isMigrating: true,
      progress: 20,
      currentStep: 'Preparing data for migration...'
    });

    // Step 3: Migrate memories
    let migratedMemories = 0;
    if (unsyncedMemories.length > 0) {
      for (let i = 0; i < unsyncedMemories.length; i++) {
        const memory = unsyncedMemories[i];

        try {
          // Convert IndexedDB format to Supabase format
          const supabaseMemory: Omit<Memory, 'id' | 'created_at'> = {
            user_id: userId,
            prompt: memory.prompt,
            response: memory.response,
            date: memory.date,
            type: memory.type,
            tags: memory.tags
          };

          const { data, error } = await (supabase as SafeSupabaseClient)
            .from('memories')
            .insert([supabaseMemory])
            .select()
            .single();

          if (error) {
            // Check if it's a duplicate error (memory already exists)
            if (error.code === '23505') {
              // Memory already exists, mark as synced locally
              await markMemoriesAsSynced([memory.id]);
              migratedMemories++;
            } else {
              result.errors.push(`Failed to migrate memory "${memory.prompt}": ${error.message}`);
            }
          } else {
            // Successfully migrated, mark as synced
            await markMemoriesAsSynced([memory.id]);
            migratedMemories++;
          }
        } catch (error: any) {
          result.errors.push(`Failed to migrate memory "${memory.prompt}": ${error.message}`);
        }

        // Update progress
        const memoryProgress = (i + 1) / unsyncedMemories.length * 60; // 60% for memories
        onProgress?.({
          isMigrating: true,
          progress: 20 + memoryProgress,
          currentStep: `Migrating memories... (${i + 1}/${unsyncedMemories.length})`
        });
      }
    }

    result.memoriesMigrated = migratedMemories;

    onProgress?.({
      isMigrating: true,
      progress: 80,
      currentStep: 'Migrating user profile...'
    });

    // Step 4: Migrate profile
    if (localProfile && !localProfile.synced) {
      try {
        // Check if profile already exists in Supabase
        const { data: existingProfile, error: fetchError } = await (supabase as SafeSupabaseClient)
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // Error other than "not found"
          result.errors.push(`Failed to check existing profile: ${fetchError.message}`);
        } else {
          const profileData: Partial<UserProfile> = {
            full_name: localProfile.fullName || undefined,
            avatar_url: localProfile.avatarUrl || undefined,
            memory_strength: localProfile.memoryStrength || 0,
            updated_at: new Date().toISOString()
          };

          if (existingProfile) {
            // Update existing profile
            const { error: updateError } = await (supabase as SafeSupabaseClient)
              .from('profiles')
              .update(profileData)
              .eq('id', userId);

            if (updateError) {
              result.errors.push(`Failed to update profile: ${updateError.message}`);
            } else {
              result.profileMigrated = true;
              await markProfileAsSynced();
            }
          } else {
            // Create new profile
            const { error: insertError } = await (supabase as SafeSupabaseClient)
              .from('profiles')
              .insert([{
                id: userId,
                ...profileData,
                created_at: localProfile.createdAt || new Date().toISOString()
              }]);

            if (insertError) {
              result.errors.push(`Failed to create profile: ${insertError.message}`);
            } else {
              result.profileMigrated = true;
              await markProfileAsSynced();
            }
          }
        }
      } catch (error: any) {
        result.errors.push(`Failed to migrate profile: ${error.message}`);
      }
    }

    onProgress?.({
      isMigrating: true,
      progress: 90,
      currentStep: 'Finalizing migration...'
    });

    // Step 5: Verify migration success
    result.success = result.errors.length === 0;

    onProgress?.({
      isMigrating: false,
      progress: 100,
      currentStep: 'Migration completed!',
      result
    });

    return result;

  } catch (error: any) {
    result.errors.push(`Migration failed: ${error.message}`);
    onProgress?.({
      isMigrating: false,
      progress: 100,
      currentStep: 'Migration failed',
      result
    });
    return result;
  }
};

/**
 * Check if user has local data that needs migration
 */
export const hasLocalDataToMigrate = async (): Promise<{
  hasMemories: boolean;
  hasProfile: boolean;
  totalMemories: number;
}> => {
  try {
    const memories = await getAllMemories();
    const profile = await getProfile();

    return {
      hasMemories: memories.some(m => !m.synced),
      hasProfile: profile ? !profile.synced : false,
      totalMemories: memories.filter(m => !m.synced).length
    };
  } catch (error) {
    console.error('Error checking for local data:', error);
    return {
      hasMemories: false,
      hasProfile: false,
      totalMemories: 0
    };
  }
};

/**
 * Clear migrated local data (cleanup after successful migration)
 */
export const clearMigratedLocalData = async (): Promise<boolean> => {
  try {
    // Note: We'll keep the local data as backup for now
    // In a production app, you might want to clear it after confirming
    // the migration was successful and the user is satisfied
    console.log('Local data cleanup - keeping as backup for now');
    return true;
  } catch (error) {
    console.error('Error clearing migrated data:', error);
    return false;
  }
};

/**
 * React hook for data migration
 */
export const useDataMigration = () => {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    isMigrating: false,
    progress: 0,
    currentStep: ''
  });

  const migrateData = useCallback(async (userId: string) => {
    return await migrateUserData(userId, (status) => {
      setMigrationStatus(status);
    });
  }, []);

  return {
    migrateData,
    migrationStatus,
    hasLocalDataToMigrate
  };
};
