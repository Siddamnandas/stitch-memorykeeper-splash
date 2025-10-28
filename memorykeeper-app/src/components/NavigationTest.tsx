import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const NavigationTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, authError, clearAuthError } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleAuth called');
    clearAuthError();

    try {
      if (isSignUp) {
        console.log('Signing up with:', email, password);
        await signUp(email, password);
      } else {
        console.log('Signing in with:', email, password);
        await signIn(email, password);
      }
      console.log('Navigation to /memory-keeper-main');
      navigate('/memory-keeper-main');
    } catch (error) {
      // Error is handled by AuthContext
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-orange-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Sign up to start preserving your memories' : 'Sign in to your MemoryKeeper account'}
          </p>
        </div>

        {authError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {authError}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-orange-50/50 rounded-2xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-orange-50/50 rounded-2xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none transition-all"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            tabIndex={0}
            role="button"
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
            onClick={(e) => {
              e.preventDefault();
              console.log('Submit button clicked');
              handleAuth(e);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                console.log('Submit button key pressed:', e.key);
                handleAuth(e);
              }
            }}
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            tabIndex={0}
            role="button"
            onClick={() => {
              console.log('Toggle sign up clicked');
              setIsSignUp(!isSignUp);
              clearAuthError();
            }}
            className="text-orange-600 hover:text-orange-700 font-medium focus:outline-none focus:ring-1 focus:ring-orange-500 focus:ring-opacity-50"
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                console.log('Toggle sign up key pressed:', e.key);
                setIsSignUp(!isSignUp);
                clearAuthError();
              }
            }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              tabIndex={0}
              role="button"
              onClick={() => {
                console.log('Navigate to supabase-signup');
                navigate('/supabase-signup');
              }}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:ring-opacity-50"
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  console.log('Supabase signup key pressed:', e.key);
                  navigate('/supabase-signup');
                }
              }}
            >
              Sign up
            </button>
            <button
              tabIndex={0}
              role="button"
              onClick={() => {
                console.log('Navigate to supabase-test');
                navigate('/supabase-test');
              }}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:ring-opacity-50"
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  console.log('Supabase test key pressed:', e.key);
                  navigate('/supabase-test');
                }
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationTest;