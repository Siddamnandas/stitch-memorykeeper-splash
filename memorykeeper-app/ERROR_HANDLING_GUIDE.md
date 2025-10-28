# MemoryKeeper Error Handling Guide

This guide outlines the error handling and user feedback mechanisms implemented in the MemoryKeeper application to provide a better user experience.

## Error Handling Architecture

### 1. Error Service
The [errorService.ts](file:///Users/siddamnandakishorebaba/Downloads/stitch_memorykeeper_splash/memorykeeper-app/src/lib/errorService.ts) file provides the core error handling functionality:

- **AppError**: Standard error interface with type, message, and timestamp
- **ErrorHandler**: Class for handling different types of errors
- **ToastManager**: Manages toast notifications for user feedback

### 2. Error Context
The [ErrorContext.tsx](file:///Users/siddamnandakishorebaba/Downloads/stitch_memorykeeper_splash/memorykeeper-app/src/lib/ErrorContext.tsx) provides a React context for error handling:

- **ErrorProvider**: Provider component that manages error state
- **useError**: Hook for consuming error handling functionality
- **ToastContainer**: Component for displaying toast notifications

### 3. Data Service Hooks
The [useDataService.ts](file:///Users/siddamnandakishorebaba/Downloads/stitch_memorykeeper_splash/memorykeeper-app/src/lib/useDataService.ts) provides React hooks for data operations with built-in error handling:

- **useMemories**: Hook for managing memories with error handling
- **useUserProfile**: Hook for managing user profiles with error handling
- **useMemoryStrength**: Hook for managing memory strength with error handling

## Error Types

### 1. Network Errors
Handled when there are connectivity issues or API failures.

### 2. Validation Errors
Handled when user input doesn't meet requirements.

### 3. Authentication Errors
Handled when there are issues with user authentication.

### 4. Server Errors
Handled when backend services encounter issues.

### 5. Not Found Errors
Handled when requested resources don't exist.

### 6. Unknown Errors
Fallback for unexpected errors.

## Toast Notifications

### Types
- **Success**: Green notifications for successful operations
- **Error**: Red notifications for errors
- **Warning**: Yellow notifications for warnings
- **Info**: Blue notifications for informational messages

### Features
- Auto-dismiss after configurable duration
- Manual dismiss with close button
- Progress indicator for remaining time
- Accessible with proper ARIA attributes

## Implementation Examples

### 1. Using the Error Context
```tsx
import { useError } from '../lib/ErrorContext';

const MyComponent = () => {
  const { handleError, addToast } = useError();
  
  const handleOperation = async () => {
    try {
      // Perform operation
      await someOperation();
      
      // Show success message
      addToast({
        type: 'success',
        title: 'Success',
        message: 'Operation completed successfully!'
      });
    } catch (error) {
      // Handle error
      handleError(error, 'Failed to complete operation');
    }
  };
  
  return <button onClick={handleOperation}>Perform Operation</button>;
};
```

### 2. Using Data Service Hooks
```tsx
import { useMemories } from '../lib/useDataService';

const MemoryList = ({ userId }) => {
  const { memories, loading, addMemory, updateMemory, deleteMemory } = useMemories(userId);
  
  if (loading) {
    return <div>Loading memories...</div>;
  }
  
  return (
    <div>
      {memories.map(memory => (
        <div key={memory.id}>
          {memory.response}
        </div>
      ))}
    </div>
  );
};
```

### 3. Handling Supabase Errors
```tsx
import { useError } from '../lib/ErrorContext';

const DataServiceComponent = () => {
  const { handleSupabaseError } = useError();
  
  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*');
      
      if (error) {
        handleSupabaseError(error);
        return;
      }
      
      // Process data
    } catch (error) {
      handleSupabaseError(error);
    }
  };
};
```

## Best Practices

### 1. Consistent Error Handling
- Always wrap async operations in try-catch blocks
- Use appropriate error handling hooks
- Provide user-friendly error messages

### 2. User Feedback
- Show success messages for completed operations
- Show error messages for failed operations
- Use appropriate toast types (success, error, warning, info)

### 3. Logging
- Log errors to console for debugging
- Include context information in error logs
- Don't expose sensitive information in user-facing messages

### 4. Accessibility
- Ensure toast notifications are accessible
- Use proper ARIA attributes
- Provide keyboard navigation support

## Testing Error Handling

### 1. Unit Tests
- Test error handling functions
- Verify toast notification behavior
- Check error type classification

### 2. Integration Tests
- Test error handling in components
- Verify user feedback mechanisms
- Check accessibility features

## Future Improvements

### 1. Error Boundaries
Implement React error boundaries for catching UI errors.

### 2. Error Reporting
Add error reporting to external services for production monitoring.

### 3. Retry Mechanisms
Implement automatic retry mechanisms for transient errors.

### 4. Offline Error Handling
Enhance error handling for offline scenarios.

## Troubleshooting

### 1. Toast Notifications Not Showing
- Check if ErrorProvider is properly configured
- Verify toast container is included in App component
- Check browser console for errors

### 2. Errors Not Being Handled
- Ensure try-catch blocks are properly implemented
- Verify error handling hooks are being used
- Check browser console for unhandled errors

### 3. Accessibility Issues
- Verify ARIA attributes are properly set
- Test with screen readers
- Check keyboard navigation