import React from 'react';
import { useNavigate } from 'react-router-dom';

const DevTestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-orange-100 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Developer Test Page</h1>
          <p className="text-gray-600">Testing environment for MemoryKeeper development</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Authentication</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-2 px-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
              >
                Auth Flow
              </button>
              <button
                onClick={() => navigate('/supabase-test')}
                className="w-full py-2 px-4 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/supabase-signup')}
                className="w-full py-2 px-4 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors"
              >
                Sign Up
              </button>
            </div>
          </div>

          <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Main App</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/memory-keeper-main')}
                className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Main Application
              </button>
              <button
                onClick={() => navigate('/main')}
                className="w-full py-2 px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Direct Access (No Auth)
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="py-2 px-6 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevTestPage;