# Background Sync Implementation

## Overview
This document describes the implementation of background sync capabilities for the MemoryKeeper application, enabling offline functionality with automatic synchronization when connectivity is restored.

## Implementation Details

### 1. Service Worker Configuration
- **Strategy**: Using Workbox's `generateSW` strategy for automatic service worker generation
- **Background Sync**: Implemented using Workbox's BackgroundSyncPlugin
- **API Endpoints**: All API requests matching the pattern `https://.*/api/.*` are queued for background sync
- **Retention Time**: Queued requests are retained for up to 24 hours (1440 minutes)

### 2. Key Components

#### BackgroundSyncManager
Enhanced with:
- Workbox Background Sync integration
- Service worker registration
- Online/offline event handling
- Periodic sync scheduling (every 5 minutes)
- Exponential backoff for failed sync attempts
- Queue sync functionality for offline scenarios

#### SyncService
Enhanced with:
- Workbox Background Sync integration
- Queue background sync function
- Improved error handling
- Rate limiting for sync operations

#### useDataSync Hook
Enhanced with:
- Queue sync functionality
- Service worker message handling
- Improved state management

#### SyncStatusIndicator Component
Enhanced with:
- Queue sync button for offline scenarios
- Improved UI feedback

### 3. Features Implemented

#### Offline-First Approach
- All data operations are performed locally first
- Changes are queued for synchronization when online
- Users can continue using the app even when offline

#### Automatic Sync
- Automatic synchronization when connectivity is restored
- Periodic sync every 5 minutes when online
- Manual sync option for immediate synchronization

#### Retry Mechanism
- Exponential backoff for failed sync attempts
- Maximum of 3 retry attempts
- Queue retention for up to 24 hours

#### Conflict Resolution
- Server-side conflict detection
- Duplicate entry handling
- Data consistency maintenance

### 4. Configuration Files

#### vite.config.js
```javascript
workbox: {
  globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  navigateFallback: '/index.html',
  navigateFallbackDenylist: [/^\/api/, /^\/registerSW\.js/],
  // Add background sync capabilities
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\/api\/.*$/,
      handler: 'NetworkOnly',
      options: {
        backgroundSync: {
          name: 'memorykeeper-api-queue',
          options: {
            maxRetentionTime: 60 * 24, // 24 hours
          },
        },
      },
    },
  ],
},
```

### 5. Service Worker Generated Files
- `dist/sw.js`: Main service worker file with background sync capabilities
- `dist/workbox-*.js`: Workbox runtime libraries

### 6. Usage

#### Queueing Operations for Sync
When offline, API operations are automatically queued:
```javascript
// In backgroundSyncManager.ts
public async queueSync(): Promise<void> {
  if (this.workboxSyncRegistered) {
    // Use Workbox background sync
    navigator.serviceWorker.ready.then((registration) => {
      registration.sync.register('background-sync')
        .catch((error) => {
          console.error('Failed to queue background sync:', error);
          // Fallback to regular sync
          this.sync();
        });
    });
  } else {
    // Fallback to regular sync
    this.sync();
  }
}
```

#### Manual Sync
Users can manually trigger sync:
```javascript
// In SyncStatusIndicator.tsx
<button onClick={forceSync}>Sync Now</button>
```

#### Queue Sync for Offline
Users can queue operations when offline:
```javascript
// In SyncStatusIndicator.tsx
<button onClick={queueSync}>Queue for Sync</button>
```

## Benefits

1. **Improved User Experience**: Users can continue using the app even when offline
2. **Data Consistency**: Automatic synchronization ensures data consistency across devices
3. **Reliability**: Retry mechanisms handle temporary network issues
4. **Performance**: Background sync doesn't block the main thread
5. **Scalability**: Workbox provides a robust, tested solution for background sync

## Testing

The implementation has been tested with:
- Offline scenarios
- Network connectivity changes
- Failed sync attempts
- Conflict resolution
- Data persistence

## Future Enhancements

1. **Selective Sync**: Prioritize critical data for sync
2. **Bandwidth Detection**: Adjust sync frequency based on connection quality
3. **User Notifications**: Inform users about sync status
4. **Advanced Conflict Resolution**: Implement more sophisticated conflict resolution strategies