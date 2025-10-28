
import { useState, type FC, type FormEvent } from 'react';

import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useError } from '../lib/ErrorContext';

const UpdatePassword: FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdated, setIsUpdated] = useState(false);
  const { updatePassword, loading } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useError();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      addToast({
        type: 'error',
        title: 'Passwords Don\'t Match',
        message: 'Please make sure both password fields match.',
        duration: 4000
      });
      return;
    }

    try {
      await updatePassword(newPassword);
      setIsUpdated(true);
      addToast({
        type: 'success',
        title: 'Password Updated!',
        message: 'Your password has been successfully updated.',
        duration: 4000
      });
      // Redirect to main app after a delay
      setTimeout(() => {
        navigate('/memory-keeper-main');
      }, 2000);
    } catch (error) {
      // Error handling is already done in the AuthContext
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Please try again or contact support if the problem persists.',
        duration: 5000
      });
    }
  };

  if (isUpdated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-orange-100 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Password Updated!</h1>
          <p className="text-gray-600 mb-6">
            Your password has been successfully updated. You're being redirected to the main application.
          </p>
          <button
            onClick={() => navigate('/memory-keeper-main')}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Continue to MemoryKeeper
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-orange-100 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Update Password</h1>
          <p className="text-gray-600">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 bg-orange-50/50 rounded-2xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none transition-all"
              required
              minLength={6}
              placeholder="Enter new password"
            />
            <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-orange-50/50 rounded-2xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none transition-all"
              required
              minLength={6}
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <button
            onClick={() => navigate('/auth')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
