# MemoryKeeper Authentication Flow

## Overview

The MemoryKeeper application implements a complete authentication flow using Supabase as the backend authentication service. This document describes the authentication architecture, components, and data flow.

## Architecture

### Authentication Context

The authentication system is built around the `AuthContext` which provides:

- User session management
- Profile data handling
- Sign in/up/out functionality
- User data synchronization

### Key Components

1. **AuthProvider** - Main authentication provider wrapper
2. **useAuth** - Custom hook for accessing authentication state
3. **AuthGuard** - Route protection component
4. **AuthenticationFlow** - Main routing component for authentication
5. **UserProfileManager** - User profile management interface

## Authentication Flow

### 1. Initial Access

```
User opens app → Splash Screen → Authentication Screen
```

### 2. Sign Up Process

1. User navigates to `/supabase-signup`
2. User enters email, password, and full name
3. `signUp` function called in AuthContext
4. Supabase creates user account
5. Profile data is initialized
6. User is redirected to main application

### 3. Sign In Process

1. User navigates to `/supabase-test`
2. User enters email and password
3. `signIn` function called in AuthContext
4. Supabase validates credentials
5. Session is established
6. User profile is fetched
7. User data is synchronized with app state
8. User is redirected to main application

### 4. Session Management

- Automatic session restoration on app reload
- Real-time session state updates
- Profile data synchronization
- User data persistence

### 5. Sign Out Process

1. User clicks "Sign Out" in profile view
2. `signOut` function called in AuthContext
3. Supabase session is terminated
4. Local state is cleared
5. User is redirected to splash screen

## Data Synchronization

### User Profile

Profile data is stored in the `profiles` table in Supabase and includes:

- `id` - User ID (matches auth user ID)
- `email` - User email
- `full_name` - User's full name
- `avatar_url` - URL to user's avatar image
- `created_at` - Profile creation timestamp

### User Data

Application data is stored in the `memories` table and includes:

- `id` - Memory ID
- `user_id` - Reference to user
- `prompt` - The memory prompt
- `response` - The user's memory response
- `date` - Date of the memory
- `type` - Type of memory (text, image, etc.)
- `tags` - Array of tags for the memory
- `created_at` - Record creation timestamp

## Security Considerations

### Session Security

- JWT-based authentication
- Secure HTTP-only cookies
- Automatic session refresh
- Token expiration handling

### Data Protection

- User data isolation
- Row-level security policies
- Encrypted data transmission
- Input validation and sanitization

## Implementation Details

### AuthContext.tsx

The authentication context provides:

```typescript
interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
  profileLoading: boolean;
}
```

### UserProfileManager.tsx

The profile manager component allows users to:

- View their profile information
- Edit their profile details
- Update their avatar
- Sign out of the application

### UserDataService.ts

The user data service handles:

- Adding memories to the memories table
- Managing user data synchronization with Supabase

## Testing

### Unit Tests

- Authentication flow validation
- Profile management testing
- Data synchronization verification
- Error handling scenarios

### Integration Tests

- End-to-end authentication flow
- Session persistence testing
- Data consistency checks
- Performance validation

## Error Handling

### Common Error Scenarios

1. **Network Issues**
   - Offline detection
   - Retry mechanisms
   - Graceful degradation

2. **Authentication Errors**
   - Invalid credentials
   - Expired sessions
   - Account lockout

3. **Data Synchronization Errors**
   - Conflict resolution
   - Data integrity checks
   - Rollback mechanisms

### Error Recovery

- Automatic retry for transient errors
- User-friendly error messages
- Fallback to local data when offline
- Session restoration after errors

## Best Practices

### Security

- Never store passwords in plain text
- Use HTTPS for all communications
- Implement proper input validation
- Regularly update dependencies

### Performance

- Minimize authentication requests
- Cache profile data appropriately
- Optimize data synchronization
- Implement efficient session management

### User Experience

- Provide clear feedback during authentication
- Handle loading states gracefully
- Preserve user context during navigation
- Implement smooth transitions between states

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Check Supabase configuration
   - Verify network connectivity
   - Review error logs

2. **Profile Loading Issues**
   - Confirm user session
   - Check database permissions
   - Validate profile data structure

3. **Data Synchronization Problems**
   - Verify internet connectivity
   - Check for conflicts
   - Review synchronization logs

### Debugging Tips

- Enable detailed logging
- Use browser developer tools
- Monitor network requests
- Check Supabase dashboard