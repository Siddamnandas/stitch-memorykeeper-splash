import { type FC } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MemoryKeeperSplash from './MemoryKeeperSplash';
import NavigationTest from './NavigationTest';
import SupabaseTest from './SupabaseTest';
import SupabaseSignup from './SupabaseSignup';
import PasswordReset from './PasswordReset';
import UpdatePassword from './UpdatePassword';
import MemoryKeeperMain from './MemoryKeeperMain';
import AuthGuard from './AuthGuard';
import DevTestPage from '../DevTestPage';

const AuthenticationFlow: FC = () => {
  return (
    <div className="App flex min-h-screen flex-col">
      <Routes>
        <Route path="/" element={<MemoryKeeperSplash />} />
        <Route path="/auth" element={<NavigationTest />} />
        <Route
          path="/MemoryKeeperMain"
          element={<Navigate to="/memory-keeper-main" replace />}
        />
        {/* Protected main application routes */}
        <Route path="/memory-keeper-main" element={<AuthGuard><MemoryKeeperMain /></AuthGuard>} />
        {/* Test route to directly access main app - NO AUTH REQUIRED FOR DEVELOPMENT */}
        <Route path="/main" element={<MemoryKeeperMain />} />
        {/* Legacy route - redirect to auth */}
        <Route path="/signin" element={<NavigationTest />} />
        {/* Supabase authentication routes */}
        <Route path="/supabase-test" element={<SupabaseTest />} />
        <Route path="/supabase-signup" element={<SupabaseSignup />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        {/* Direct access to main app for development/testing - NO AUTH REQUIRED */}
        <Route path="/dev" element={<DevTestPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default AuthenticationFlow;
