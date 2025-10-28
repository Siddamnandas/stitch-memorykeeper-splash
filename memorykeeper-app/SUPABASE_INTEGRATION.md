# Supabase Integration Documentation

## Overview

This document describes the Supabase integration implementation in the MemoryKeeper application. The integration provides:

1. User authentication (email/password, OAuth)
2. Data persistence for memories and user profiles
3. Real-time data synchronization
4. Offline capabilities with IndexedDB
5. Automatic sync between local and cloud storage

## Architecture

The integration follows a layered architecture:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │────│  Auth Context    │────│  Supabase Auth  │
│  Components     │    │   & Hooks        │    │   Service       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Data Hooks    │────│  Data Service    │────│  Supabase DB    │
│  (useMemories,  │    │   & Sync         │    │   Service       │
│   etc.)         │    │   Service        │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
┌─────────────────┐    ┌──────────────────┐
│  Offline Store  │────│  IndexedDB       │
│  (IndexedDB)    │    │  Service         │
└─────────────────┘    └──────────────────┘
```

## Key Components

### 1. Supabase Client (`src/lib/supabaseClient.ts`)

- Initializes the Supabase client with environment variables
- Validates configuration
- Provides a singleton client instance

### 2. Authentication Context (`src/lib/AuthContext.tsx`)

- Manages user authentication state
- Handles sign in/up/out operations
- Provides user profile data
- Integrates with Supabase Auth

### 3. Data Service (`src/lib/dataService.ts`)

- CRUD operations for memories and profiles
- Real-time subscriptions for data changes
- Type definitions for data models

### 4. IndexedDB Service (`src/lib/indexedDBService.ts`)

- Local storage for offline data
- Sync status tracking
- Data caching

### 5. Sync Service (`src/lib/syncService.ts`)

- Bidirectional sync between local and cloud
- Conflict resolution
- Rate limiting
- Background sync

### 6. Data Sync Hook (`src/hooks/useDataSync.ts`)

- Automatic sync scheduling
- Manual sync triggers
- Sync status monitoring

## Data Models

### User Profile

```typescript
interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  memory_strength?: number;
  created_at?: string;
  updated_at?: string;
  onboarding_complete?: boolean;
  avatar_choice?: string;
  memory_goals?: string[];
  preferred_games?: string[];
  notification_preferences?: {
    emailReminders: boolean;
    pushNotifications: boolean;
    weeklyProgress: boolean;
  };
}
```

### Memory

```typescript
interface Memory {
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
```

## Real-time Features

The application uses Supabase real-time subscriptions to automatically update the UI when data changes:

1. **Memory Changes**: Automatically updates the memory list when memories are added/modified
2. **Profile Changes**: Updates user profile information in real-time
3. **Presence**: Tracks online users (future enhancement)

## Offline Support

The application provides full offline functionality:

1. **Local Storage**: All data is stored in IndexedDB
2. **Automatic Sync**: Data syncs automatically when online
3. **Conflict Resolution**: Handles conflicts between local and remote data
4. **Rate Limiting**: Prevents excessive sync operations

## Security Features

1. **Input Sanitization**: All user inputs are sanitized
2. **Rate Limiting**: Prevents abuse of sync and auth operations
3. **Row Level Security**: Database policies protect user data
4. **Environment Variables**: Secrets are stored securely

## Environment Configuration

The application requires the following environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage Examples

### Authentication

```typescript
import { useAuth } from './lib/AuthContext';

const MyComponent = () => {
  const { user, signIn, signOut } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn('user@example.com', 'password');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <div>
      {user ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
    </div>
  );
};
```

### Data Operations

```typescript
import { useDataSync } from './hooks/useDataSync';
import { addMemory, getMemories } from './lib/dataService';

const MemoryComponent = () => {
  const { manualSync, syncStatus } = useDataSync();

  const handleAddMemory = async () => {
    try {
      await addMemory({
        prompt: 'My memory prompt',
        response: 'My memory response',
        date: new Date().toISOString(),
        type: 'text',
        tags: ['personal']
      }, userId);
    } catch (error) {
      console.error('Failed to add memory:', error);
    }
  };

  return (
    <div>
      <button onClick={handleAddMemory}>Add Memory</button>
      <button onClick={manualSync} disabled={syncStatus === 'syncing'}>
        Sync Now
      </button>
    </div>
  );
};
```

## Testing

The integration includes comprehensive tests:

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test the full data flow
3. **Offline Tests**: Test offline functionality
4. **Security Tests**: Test input sanitization and rate limiting

## Future Enhancements

1. **Presence API**: Show online users
2. **Advanced Analytics**: Track user engagement
3. **Push Notifications**: Send notifications for important events
4. **Data Export**: Allow users to export their data
5. **Enhanced Security**: Add multi-factor authentication

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check environment variables and Supabase configuration
2. **Sync Failures**: Check network connectivity and rate limits
3. **Data Conflicts**: Review conflict resolution logic
4. **Performance Issues**: Check IndexedDB size and query performance

### Debugging

Enable debug logging by setting `localStorage.debug = 'memorykeeper:*'` in the browser console.

## Contributing

When contributing to the Supabase integration:

1. Follow the existing code patterns
2. Add tests for new functionality
3. Update documentation
4. Ensure security best practices
5. Test offline scenarios