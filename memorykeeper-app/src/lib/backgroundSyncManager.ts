import { syncData } from './syncService';
import { getUnsyncedMemories, getProfile } from './indexedDBService';
import { isSupabaseConfigured } from './supabaseClient';

type SyncManager = {
  register(tag: string): Promise<void>;
};

type SyncCapableRegistration = ServiceWorkerRegistration & {
  sync: SyncManager;
};

const hasBackgroundSync = (registration: ServiceWorkerRegistration): registration is SyncCapableRegistration => {
  return typeof (registration as Partial<SyncCapableRegistration>).sync !== 'undefined';
};

/**
 * Background Sync Manager
 * Handles automatic synchronization between IndexedDB and Supabase
 * with intelligent retry mechanisms and offline detection
 * Integrates with Workbox Background Sync for enhanced offline capabilities
 */

class BackgroundSyncManager {
  private syncInterval: number | null = null;
  private retryTimeout: number | null = null;
  private isSyncing: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private baseRetryDelay: number = 5000; // 5 seconds
  private syncIntervalMs: number = 300000; // 5 minutes
  private userId: string | null = null;
  private isOnline: boolean = navigator.onLine;
  private listeners: Array<(status: SyncStatus) => void> = [];
  private lastPendingChanges: number = 0;
  private workboxSyncRegistered: boolean = false;

  constructor() {
    // Monitor online/offline status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Register service worker for background sync
    this.registerServiceWorker();
  }

  /**
   * Register service worker for enhanced background sync capabilities
   */
  private async registerServiceWorker(): Promise<void> {
    if (import.meta.env.DEV) {
      console.log('Skipping service worker registration in development');
      return;
    }

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker registered successfully');

        // Register background sync
        if (hasBackgroundSync(registration)) {
          try {
            await registration.sync.register('background-sync');
            console.log('Background sync registered');
            this.workboxSyncRegistered = true;
          } catch (error: unknown) {
            console.error('Failed to register background sync:', error);
          }
        }
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  }

  /**
   * Initialize the background sync manager with user ID
   */
  public init(userId: string): void {
    if (!isSupabaseConfigured) {
      console.log('Background sync not initialised: Supabase is not configured.');
      return;
    }
    this.userId = userId;
    
    // Clear any existing intervals
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Start periodic sync
    this.syncInterval = window.setInterval(this.sync.bind(this), this.syncIntervalMs);
    
    // Initial sync
    this.sync();
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    
    this.listeners = [];
  }

  /**
   * Add a listener for sync status updates
   */
  public addListener(listener: (status: SyncStatus) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove a listener
   */
  public removeListener(listener: (status: SyncStatus) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(status: SyncStatus): void {
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    if (!isSupabaseConfigured) {
      return;
    }
    this.isOnline = true;
    console.log('Device is online, triggering sync');
    this.sync();
    
    // Trigger Workbox background sync if available
    if (this.workboxSyncRegistered) {
      navigator.serviceWorker.ready
        .then(async (registration) => {
          if (hasBackgroundSync(registration)) {
            try {
              await registration.sync.register('background-sync');
            } catch (error: unknown) {
              console.error('Failed to trigger background sync:', error);
            }
          }
        })
        .catch((error: unknown) => {
          console.error('Failed to obtain service worker registration:', error);
        });
    }
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isOnline = false;
    console.log('Device is offline, pausing sync');
    this.notifyListeners({
      isOnline: false,
      lastSyncTime: this.getLastSyncTime(),
      pendingChanges: this.lastPendingChanges,
      status: 'offline'
    });
  }

  /**
   * Get the last sync time from localStorage
   */
  private getLastSyncTime(): number | null {
    try {
      const stored = localStorage.getItem('lastSyncTime');
      return stored ? parseInt(stored, 10) : null;
    } catch (error) {
      console.warn('Could not read lastSyncTime from localStorage:', error);
      return null;
    }
  }

  /**
   * Update the number of pending changes
   */
  private async updatePendingChanges(): Promise<void> {
    try {
      const unsyncedMemories = await getUnsyncedMemories();
      const localProfile = await getProfile();
      
      this.lastPendingChanges = unsyncedMemories.length + (localProfile && !localProfile.synced ? 1 : 0);
    } catch (error) {
      console.warn('Could not get pending changes count:', error);
    }
  }

  /**
   * Main sync function
   */
  public async sync(): Promise<void> {
    if (!isSupabaseConfigured) {
      this.notifyListeners({
        isOnline: this.isOnline,
        lastSyncTime: this.getLastSyncTime(),
        pendingChanges: this.lastPendingChanges,
        status: this.isOnline ? 'idle' : 'offline'
      });
      return;
    }
    // Don't sync if already syncing or offline
    if (this.isSyncing || !this.isOnline || !this.userId) {
      return;
    }

    this.isSyncing = true;
    
    // Update pending changes count
    await this.updatePendingChanges();
    
    this.notifyListeners({
      isOnline: true,
      lastSyncTime: this.getLastSyncTime(),
      pendingChanges: this.lastPendingChanges,
      status: 'syncing'
    });

    try {
      const result = await syncData(this.userId);
      
      if (result.success) {
        this.retryCount = 0; // Reset retry count on success
        
        // Update last sync time
        try {
          localStorage.setItem('lastSyncTime', Date.now().toString());
        } catch (error) {
          console.warn('Could not update lastSyncTime in localStorage:', error);
        }
        
        // Update pending changes after successful sync
        await this.updatePendingChanges();
        
        this.notifyListeners({
          isOnline: true,
          lastSyncTime: Date.now(),
          pendingChanges: this.lastPendingChanges,
          status: 'idle'
        });
      } else {
        console.error('Sync failed:', result.errors);
        this.handleSyncError();
      }
    } catch (error) {
      console.error('Sync error:', error);
      this.handleSyncError();
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Handle sync errors with exponential backoff
   */
  private handleSyncError(): void {
    this.retryCount++;
    
    if (this.retryCount <= this.maxRetries) {
      // Exponential backoff: 5s, 10s, 20s, etc.
      const delay = this.baseRetryDelay * Math.pow(2, this.retryCount - 1);
      
      this.notifyListeners({
        isOnline: true,
        lastSyncTime: this.getLastSyncTime(),
        pendingChanges: this.lastPendingChanges,
        status: 'error'
      });
      
      console.log(`Sync failed, retrying in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`);
      
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
      }
      
      this.retryTimeout = window.setTimeout(() => {
        this.sync();
      }, delay);
    } else {
      // Max retries reached
      this.retryCount = 0;
      this.notifyListeners({
        isOnline: true,
        lastSyncTime: this.getLastSyncTime(),
        pendingChanges: this.lastPendingChanges,
        status: 'error'
      });
      
      console.error('Max sync retries reached, giving up until next interval');
    }
  }

  /**
   * Force immediate sync
   */
  public async forceSync(): Promise<void> {
    if (!isSupabaseConfigured) {
      return;
    }
    // Clear any pending retries
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    
    this.retryCount = 0;
    await this.sync();
  }
  
  /**
   * Queue a sync request for background processing
   */
  public async queueSync(): Promise<void> {
    if (!isSupabaseConfigured) {
      return;
    }
    if (this.workboxSyncRegistered) {
      // Use Workbox background sync when available
      navigator.serviceWorker.ready
        .then(async (registration) => {
          if (hasBackgroundSync(registration)) {
            try {
              await registration.sync.register('background-sync');
            } catch (error: unknown) {
              console.error('Failed to queue background sync:', error);
              await this.sync();
            }
          } else {
            await this.sync();
          }
        })
        .catch((error: unknown) => {
          console.error('Failed to obtain service worker registration for queue:', error);
          this.sync();
        });
    } else {
      // Fallback to regular sync
      this.sync();
    }
  }
}

// Define the sync status interface
export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: number | null;
  pendingChanges: number;
  status: 'idle' | 'syncing' | 'error' | 'offline';
}

// Export singleton instance
export const backgroundSyncManager = new BackgroundSyncManager();
