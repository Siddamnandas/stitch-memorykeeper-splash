import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  getAllMemories,
  getUnsyncedMemories,
  saveProfile,
  getProfile,
  markMemoriesAsSynced,
  markProfileAsSynced,
  addSingleMemory,
  OfflineMemory,
  OfflineProfile
} from './indexedDBService';
import { getMemories, getUserProfile, type Memory } from './dataService';
import { isRateLimited, getRemainingSyncAttempts } from './inputSanitizer';

type SafeSupabaseClient = NonNullable<typeof supabase>;

type SyncManager = {
  register(_tag: string): Promise<void>;
};

type SyncCapableRegistration = ServiceWorkerRegistration & {
  sync: SyncManager;
};

const hasBackgroundSync = (registration: ServiceWorkerRegistration): registration is SyncCapableRegistration => {
  return typeof (registration as Partial<SyncCapableRegistration>).sync !== 'undefined';
};

export interface SyncResult {
  success: boolean;
  uploadedCount: number;
  downloadedCount: number;
  conflictsResolved: number;
  errors: string[];
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: number | null;
  pendingChanges: number;
  status: 'idle' | 'syncing' | 'error' | 'offline';
}

/**
 * Sync data between IndexedDB and Supabase
 * Handles bidirectional synchronization with conflict resolution
 * Enhanced with Workbox Background Sync support
 */
export const syncData = async (userId: string): Promise<SyncResult> => {
  const result: SyncResult = {
    success: false,
    uploadedCount: 0,
    downloadedCount: 0,
    conflictsResolved: 0,
    errors: []
  };

  if (!isSupabaseConfigured) {
    result.success = true;
    return result;
  }

  if (!userId) {
    result.errors.push('User ID required for sync');
    return result;
  }

  try {
    // Step 1: Upload local changes to Supabase
    const unsyncedMemories = await getUnsyncedMemories();

    for (const memory of unsyncedMemories) {
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

        const { error } = await (supabase as SafeSupabaseClient)
          .from('memories')
          .insert([supabaseMemory])
          .select()
          .single();

        if (error) {
          // Handle potential conflicts (duplicate entries)
          if (error.code === '23505') { // Unique constraint violation
            // Mark as synced since it already exists in cloud
            await markMemoriesAsSynced([memory.id]);
            result.conflictsResolved++;
          } else {
            result.errors.push(`Failed to upload memory "${memory.prompt}": ${error.message}`);
            continue;
          }
        } else {
          // Successfully uploaded, mark as synced
          await markMemoriesAsSynced([memory.id]);
          result.uploadedCount++;
        }
      } catch (error: any) {
        result.errors.push(`Error uploading memory "${memory.prompt}": ${error.message}`);
      }
    }

    // Step 2: Download new data from Supabase
    try {
      const { data: remoteMemories, error: fetchError } = await getMemories(userId);

      if (fetchError) {
        result.errors.push(`Failed to fetch remote memories: ${fetchError.message}`);
      } else if (remoteMemories) {
        // Get local memories for comparison
        const localMemories = await getAllMemories();

        // Find memories that exist remotely but not locally
        const localIds = new Set(localMemories.map(m => m.id));

        const newRemoteMemories = remoteMemories.filter(m => m.id && !localIds.has(m.id));

        // Download new memories to local storage
        for (const memory of newRemoteMemories) {
          const offlineMemory: Omit<OfflineMemory, 'createdAt' | 'updatedAt'> = {
            id: memory.id || `remote-${Date.now()}-${Math.random()}`,
            userId: userId,
            prompt: memory.prompt,
            response: memory.response,
            date: memory.date,
            type: memory.type,
            tags: memory.tags,
            synced: true
          };

          const success = await addSingleMemory(offlineMemory);
          if (success) {
            result.downloadedCount++;
          } else {
            result.errors.push(`Failed to store memory "${memory.prompt}" locally`);
          }
        }
      }
    } catch (error: any) {
      result.errors.push(`Error downloading memories: ${error.message}`);
    }

    // Step 3: Sync user profile
    try {
      const { data: remoteProfile, error: profileError } = await getUserProfile(userId);

      if (!profileError && remoteProfile) {
        // Update local profile with remote data if needed
        const profileData: Omit<OfflineProfile, 'createdAt' | 'updatedAt'> = {
          id: 'default',
          userId: userId,
          fullName: remoteProfile.full_name || undefined,
          avatarUrl: remoteProfile.avatar_url || undefined,
          memoryStrength: remoteProfile.memory_strength || 0,
          synced: true
        };

        await saveProfile(profileData);
        await markProfileAsSynced();
      }
    } catch (error: any) {
      result.errors.push(`Error syncing profile: ${error.message}`);
    }

    result.success = result.errors.length === 0;

    // Update last sync time on successful sync
    if (result.success) {
      try {
        localStorage.setItem('lastSyncTime', Date.now().toString());
      } catch (error) {
        console.warn('Could not update lastSyncTime in localStorage:', error);
      }
    }

    return result;

  } catch (error: any) {
    result.errors.push(`Sync failed: ${error.message}`);
    return result;
  }
};

/**
 * Check if device is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Get current sync status
 */
export const getSyncStatus = async (_userId: string): Promise<SyncStatus> => {
  const unsyncedMemories = await getUnsyncedMemories();
  const localProfile = await getProfile();

  // Get last sync time from localStorage
  let lastSyncTime: number | null = null;
  try {
    const stored = localStorage.getItem('lastSyncTime');
    if (stored) {
      lastSyncTime = parseInt(stored, 10);
    }
  } catch (error) {
    console.warn('Could not read lastSyncTime from localStorage:', error);
  }

  return {
    isOnline: isOnline(),
    lastSyncTime: lastSyncTime,
    pendingChanges: unsyncedMemories.length + (localProfile && !localProfile.synced ? 1 : 0),
    status: isOnline() ? 'idle' : 'offline'
  };
};

/**
 * Force a manual sync with rate limiting
 */
export const forceSync = async (userId: string): Promise<SyncResult> => {
  if (!isSupabaseConfigured) {
    return {
      success: true,
      uploadedCount: 0,
      downloadedCount: 0,
      conflictsResolved: 0,
      errors: []
    };
  }
  // Rate limiting: max 10 syncs per minute per user
  if (isRateLimited(`sync_${userId}`, 10, 60000)) {
    const remaining = getRemainingSyncAttempts(userId);
    return {
      success: false,
      uploadedCount: 0,
      downloadedCount: 0,
      conflictsResolved: 0,
      errors: [`Rate limited. ${remaining} sync attempts remaining.`]
    };
  }

  if (!isOnline()) {
    return {
      success: false,
      uploadedCount: 0,
      downloadedCount: 0,
      conflictsResolved: 0,
      errors: ['Device is offline. Cannot sync.']
    };
  }

  // Update last sync time before starting
  try {
    localStorage.setItem('lastSyncTime', Date.now().toString());
  } catch (error) {
    console.warn('Could not update lastSyncTime in localStorage:', error);
  }

  return await syncData(userId);
};

/**
 * Background sync when coming back online
 */
export const setupBackgroundSync = (userId: string, onSyncComplete?: (result: SyncResult) => void) => {
  if (!isSupabaseConfigured) {
    return () => undefined;
  }
  const handleOnline = async () => {
    console.log('Device came back online, starting background sync...');
    try {
      const result = await syncData(userId);
      onSyncComplete?.(result);
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  };

  window.addEventListener('online', handleOnline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
  };
};

/**
 * Queue sync operation for background processing using Workbox
 */
export const queueBackgroundSync = async (userId: string): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    return true;
  }
  try {
    // Try to use Workbox background sync if available
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (hasBackgroundSync(registration)) {
        await registration.sync.register('background-sync');
        return true;
      }
    }
    
    // Fallback to immediate sync
    await syncData(userId);
    return true;
  } catch (error: unknown) {
    console.error('Failed to queue background sync:', error);
    return false;
  }
};

// Export the sync service object
export const syncService = {
  syncData,
  isOnline,
  getSyncStatus,
  forceSync,
  setupBackgroundSync,
  queueBackgroundSync
};
