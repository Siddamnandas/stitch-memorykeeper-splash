import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../lib/AuthContext';
import { useAppState } from '../lib/AppStateContext';
import { syncData, getSyncStatus, queueBackgroundSync } from '../lib/syncService';
import { isRateLimited } from '../lib/inputSanitizer';
import { backgroundSyncManager, SyncStatus } from '../lib/backgroundSyncManager';
import { isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Custom hook for handling data synchronization between local storage and Supabase
 * Enhanced with Workbox Background Sync support for improved offline capabilities
 */
export const useDataSync = () => {
  const { user } = useAuth();
  const { state: appState, dispatch } = useAppState();
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  /**
   * Perform manual sync
   */
  const manualSync = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured) return;

    // Rate limiting: max 5 manual syncs per minute
    if (isRateLimited(`manual_sync_${user.id}`, 5, 60000)) {
      console.warn('Manual sync rate limited');
      return;
    }

    try {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'syncing' });
      const result = await syncData(user.id);
      
      if (result.success) {
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'idle' });
        dispatch({ type: 'SET_LAST_SYNC_TIME', payload: Date.now() });
        
        // Update pending changes count
        const status = await getSyncStatus(user.id);
        dispatch({ type: 'SET_PENDING_CHANGES', payload: status.pendingChanges });
      } else {
        dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
        console.error('Manual sync failed:', result.errors);
      }
    } catch (error) {
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'error' });
      console.error('Manual sync error:', error);
    }
  }, [user?.id, dispatch]);

  /**
   * Check current sync status
   */
  const checkSyncStatus = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured) return;

    try {
      const status = await getSyncStatus(user.id);
      dispatch({ type: 'SET_ONLINE_STATUS', payload: status.isOnline });
      dispatch({ type: 'SET_SYNC_STATUS', payload: status.status });
      if (status.lastSyncTime) {
        dispatch({ type: 'SET_LAST_SYNC_TIME', payload: status.lastSyncTime });
      }
      dispatch({ type: 'SET_PENDING_CHANGES', payload: status.pendingChanges });
    } catch (error) {
      console.error('Failed to check sync status:', error);
    }
  }, [user?.id, dispatch]);

  /**
   * Queue sync for background processing
   */
  const queueSync = useCallback(async () => {
    if (!user?.id || !isSupabaseConfigured) return;

    try {
      const success = await queueBackgroundSync(user.id);
      if (success) {
        console.log('Sync queued for background processing');
      } else {
        console.warn('Failed to queue sync, falling back to manual sync');
        await manualSync();
      }
    } catch (error) {
      console.error('Failed to queue sync:', error);
      await manualSync(); // Fallback to manual sync
    }
  }, [user?.id, manualSync]);

  // Initialize sync manager and set up listeners
  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured || isInitializedRef.current) return;
    
    isInitializedRef.current = true;

    // Initialize the background sync manager
    backgroundSyncManager.init(user.id);
    
    // Listen for sync status updates
    const handleSyncStatus = (status: SyncStatus) => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: status.isOnline });
      dispatch({ type: 'SET_SYNC_STATUS', payload: status.status });
      if (status.lastSyncTime) {
        dispatch({ type: 'SET_LAST_SYNC_TIME', payload: status.lastSyncTime });
      }
      dispatch({ type: 'SET_PENDING_CHANGES', payload: status.pendingChanges });
    };
    
    backgroundSyncManager.addListener(handleSyncStatus);

    // Check initial sync status
    checkSyncStatus();

    // Set up periodic sync every 5 minutes when online (fallback)
    syncIntervalRef.current = setInterval(() => {
      if (navigator.onLine && appState.syncStatus !== 'syncing') {
        manualSync();
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Listen for messages from service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        console.log('Background sync completed via service worker');
        checkSyncStatus();
      }
    };
    
    navigator.serviceWorker?.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      backgroundSyncManager.removeListener(handleSyncStatus);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
      isInitializedRef.current = false;
    };
  }, [user?.id, manualSync, checkSyncStatus, appState.syncStatus, dispatch]);

  return {
    isOnline: appState.isOnline,
    syncStatus: appState.syncStatus,
    lastSyncTime: appState.lastSyncTime,
    pendingChanges: appState.pendingChanges,
    manualSync,
    checkSyncStatus,
    queueSync,
    forceSync: backgroundSyncManager.forceSync.bind(backgroundSyncManager)
  };
};
