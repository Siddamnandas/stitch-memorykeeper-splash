# IndexedDB Setup Guide for MemoryKeeper

This guide explains how to use IndexedDB for offline data storage in the MemoryKeeper application.

## Overview

IndexedDB is a low-level API for client-side storage of significant amounts of structured data, including files/blobs. This implementation provides offline-first functionality with background sync capabilities.

## Key Features

1. **Offline Data Storage**: Store memories and user profiles locally
2. **Sync Status Tracking**: Track which data has been synced with the server
3. **Background Sync**: Sync data when connectivity is restored
4. **Data Persistence**: Data persists even after browser restarts

## Implementation Details

### Data Structures

1. **OfflineMemory**: Represents a memory stored locally
   - `id`: Unique identifier
   - `userId`: Associated user ID
   - `prompt`: Memory prompt
   - `response`: Memory response
   - `date`: Date of the memory
   - `type`: Type of memory (text, image, audio)
   - `tags`: Array of tags
   - `createdAt`: Creation timestamp
   - `updatedAt`: Last update timestamp
   - `synced`: Sync status with server

2. **OfflineProfile**: Represents user profile stored locally
   - `id`: Unique identifier
   - `userId`: Associated user ID
   - `fullName`: User's full name
   - `avatarUrl`: URL to user's avatar
   - `memoryStrength`: User's memory strength score
   - `createdAt`: Creation timestamp
   - `updatedAt`: Last update timestamp
   - `synced`: Sync status with server

### IndexedDB Service Functions

The application includes an IndexedDB service (`src/lib/indexedDBService.ts`) with the following functions:

- `addMemory(memory)`: Add a new memory to IndexedDB
- `getAllMemories()`: Get all memories from IndexedDB
- `getUnsyncedMemories()`: Get memories that haven't been synced
- `updateMemory(memory)`: Update an existing memory
- `deleteMemory(id)`: Delete a memory by ID
- `saveProfile(profile)`: Save user profile to IndexedDB
- `getProfile()`: Get user profile from IndexedDB
- `markMemoriesAsSynced(ids)`: Mark memories as synced
- `markProfileAsSynced()`: Mark profile as synced
- `clearAllData()`: Clear all data (for testing)

### Sync Service Functions

The sync service (`src/lib/syncService.ts`) handles synchronization between IndexedDB and Supabase:

- `syncMemories(userId)`: Sync local memories with Supabase
- `syncProfile(userId)`: Sync user profile with Supabase
- `syncAllData(userId)`: Sync all data with Supabase
- `loadSupabaseData(userId)`: Load data from Supabase to IndexedDB

## Usage Examples

### Adding a Memory

```typescript
import { addMemory } from '../lib/indexedDBService';

const newMemory = {
  id: 'mem_123',
  userId: 'user_456',
  prompt: 'What did you have for breakfast?',
  response: 'I had pancakes with maple syrup.',
  date: '2023-07-01',
  type: 'text',
  tags: ['food', 'morning'],
  synced: false
};

await addMemory(newMemory);
```

### Syncing Data

```typescript
import { syncAllData } from '../lib/syncService';

// Assuming you have the user ID from authentication
const userId = 'user_456';
const result = await syncAllData(userId);

if (result.success) {
  console.log('Sync successful:', result.message);
} else {
  console.error('Sync failed:', result.error);
}
```

## Testing the Integration

1. Start the development server: `npm run dev`
2. Navigate to `/indexeddb-test` to test the IndexedDB features
3. Use the test interface to add memories, profiles, and test sync functionality

## Offline-First Strategy

The application follows an offline-first strategy:

1. **Data Creation**: All new data is immediately stored in IndexedDB
2. **Background Sync**: When online, data is automatically synced with Supabase
3. **Offline Access**: Users can access their data even when offline
4. **Conflict Resolution**: The system handles conflicts by prioritizing the most recent update

## Sync Process

1. When online, the application periodically checks for unsynced data
2. Unsynced memories and profiles are sent to Supabase
3. Successfully synced items are marked as synced in IndexedDB
4. If sync fails, data remains in IndexedDB for retry on next connection

## Error Handling

The implementation includes comprehensive error handling:

- Network errors during sync are caught and logged
- Failed sync operations are retried
- Data integrity is maintained through transactional operations
- User feedback is provided for sync status

## Performance Considerations

- IndexedDB operations are asynchronous and non-blocking
- Large data sets are handled through pagination
- Memory usage is optimized through efficient data structures
- Sync operations are batched to reduce network requests

## Security

- Data is stored locally and is only accessible to the application
- Sensitive information should not be stored in IndexedDB
- All data is automatically cleared when the user logs out
- Encryption can be added for additional security if needed

## Browser Support

IndexedDB is supported in all modern browsers:
- Chrome 24+
- Firefox 16+
- Safari 8+
- Edge 12+

## Troubleshooting

If you encounter issues:

1. Check browser console for IndexedDB errors
2. Verify that the browser supports IndexedDB
3. Clear browser data if database corruption is suspected
4. Check network connectivity for sync issues
5. Review error messages in the test interface

## Future Enhancements

1. **Data Encryption**: Add encryption for sensitive data
2. **Advanced Querying**: Implement more complex querying capabilities
3. **Storage Quotas**: Handle storage quota limitations
4. **Progressive Enhancement**: Add more sophisticated offline capabilities