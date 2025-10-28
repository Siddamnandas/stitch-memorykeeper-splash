import { type FC, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useError } from '../lib/ErrorContext';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard: FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { addToast } = useError();

  // Check if we're in development mode
  const isDevelopment = import.meta.env.MODE === 'development';

  // In development mode, allow access without authentication for testing
  if (isDevelopment && import.meta.env.VITE_ENABLE_SUPABASE === 'false') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center" role="status" aria-label="Loading application">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your MemoryKeeper experience...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we verify your authentication</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Show error message for unauthorized access
    addToast({
      type: 'warning',
      title: 'Authentication Required',
      message: 'Please sign in to access MemoryKeeper.',
      duration: 4000
    });

    // Redirect to auth page with return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
