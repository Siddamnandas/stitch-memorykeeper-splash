import { useCallback, useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const storageKey = 'memorykeeper_a2hs_dismissed';

const getInitialDismissedState = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.localStorage.getItem(storageKey) === '1';
};

export const useA2HS = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPromptVisible, setPromptVisible] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(getInitialDismissedState);

  const isStandalone = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any)?.standalone;
  }, []);

  const isIOS = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (dismissed || isStandalone) return;
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setPromptVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [dismissed, isStandalone]);

  useEffect(() => {
    const handleInstalled = () => {
      setPromptVisible(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleInstalled);
    return () => window.removeEventListener('appinstalled', handleInstalled);
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setPromptVisible(true);
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setPromptVisible(false);
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    setPromptVisible(false);
    setDismissed(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, '1');
    }
  }, []);

  const shouldShowEducation = !dismissed && !isStandalone && (isPromptVisible || isIOS);

  return {
    showPrompt: shouldShowEducation,
    isIOS,
    promptInstall,
    dismissPrompt
  };
};

export type UseA2HSReturn = ReturnType<typeof useA2HS>;
