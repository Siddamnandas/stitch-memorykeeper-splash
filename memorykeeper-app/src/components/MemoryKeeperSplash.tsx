import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/AuthContext';
import AddToHomeScreenPrompt from './AddToHomeScreenPrompt';
import { useA2HS } from '../hooks/useA2HS';
import { cn, gradients, ui } from '../lib/designSystem';

const MemoryKeeperSplash = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showPrompt, isIOS, promptInstall, dismissPrompt } = useA2HS();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(user ? '/memory-keeper-main' : '/auth');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate, user]);

  const handlePrimaryAction = useCallback(() => {
    console.log('Primary action clicked');
    navigate(user ? '/memory-keeper-main' : '/auth');
  }, [navigate, user]);

  const handleSecondaryAction = useCallback(() => {
    console.log('Secondary action clicked');
    navigate('/supabase-test');
  }, [navigate]);

  return (
    <div className={cn(ui.shell, gradients.sunrise, 'relative flex h-screen flex-col justify-between overflow-hidden')}>
      <div className="flex flex-1 flex-col items-center justify-center space-y-8 px-gutter text-center">
        <div className="relative inline-flex h-32 w-32 items-center justify-center rounded-2xl bg-white/30 text-primary shadow-soft backdrop-blur-soft">
          <svg className="h-20 w-20 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
          </svg>
          <div className="absolute inset-0 animate-shimmer rounded-2xl opacity-40"></div>
        </div>
        <div className="space-y-6">
          <h1 className="text-display-1 font-extrabold text-white drop-shadow-lg">MemoryKeeper</h1>
          <p className="text-2xl font-medium text-white/90">{t('splash.tagline', 'Warm Nostalgia Begins Here!')}</p>
        </div>
      </div>

      <div className="safe-px space-y-5 pb-12">
        <button
          tabIndex={0}
          role="button"
          className={cn(ui.primaryButton, gradients.sunrise, 'h-16 w-full text-2xl text-white shadow-ring')}
          onClick={handlePrimaryAction}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePrimaryAction();
            }
          }}
        >
          {user ? 'Continue to MemoryKeeper' : 'Get Started'}
        </button>
        <button
          tabIndex={0}
          role="button"
          className={cn(ui.ghostButton, 'w-full justify-center border border-white/40 text-white text-xl py-4')}
          onClick={handleSecondaryAction}
          onKeyPress={(e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSecondaryAction();
            }
          }}
        >
          {user ? 'Switch accounts' : 'Already have an account? Sign In'}
        </button>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-white/25"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float 12s infinite ${i * 0.4}s`,
              transform: 'translateY(0)',
            }}
          />
        ))}
      </div>

      <AddToHomeScreenPrompt visible={showPrompt} isIOS={isIOS} onInstall={promptInstall} onDismiss={dismissPrompt} />
    </div>
  );
};

export default MemoryKeeperSplash;
