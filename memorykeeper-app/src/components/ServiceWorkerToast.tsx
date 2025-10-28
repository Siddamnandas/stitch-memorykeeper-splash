import React, { useEffect, useMemo, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000;
let updateIntervalId: number | undefined;

const ServiceWorkerToast: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [toastType, setToastType] = useState<'offline' | 'update' | null>(null);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) {
        return;
      }
      if (typeof window !== 'undefined' && updateIntervalId === undefined) {
        updateIntervalId = window.setInterval(() => {
          registration.update();
        }, UPDATE_CHECK_INTERVAL_MS);
      }
    }
  });

  useEffect(() => {
    if (offlineReady) {
      setToastType('offline');
      setIsOpen(true);
      const timeout = setTimeout(() => {
        setOfflineReady(false);
        setIsOpen(false);
      }, 4000);
      return () => clearTimeout(timeout);
    }
    return;
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (needRefresh) {
      const timeout = setTimeout(() => {
        setToastType('update');
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
    return;
  }, [needRefresh]);

  const copy = useMemo(() => {
    if (toastType === 'offline') {
      return {
        title: 'Offline ready',
        body: 'We cached the latest memories so you can keep journaling without a connection.'
      };
    }
    if (toastType === 'update') {
      return {
        title: 'New version available',
        body: 'Refresh to load the latest MemoryKeeper improvements.'
      };
    }
    return null;
  }, [toastType]);

  if (!isOpen || !copy) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-orange-200 bg-white/95 p-4 text-sm shadow-2xl shadow-orange-200/50 backdrop-blur dark:border-orange-500/30 dark:bg-[#1b1208]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{copy.title}</p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{copy.body}</p>
        </div>
        <button
          type="button"
          aria-label="Dismiss update message"
          className="text-gray-400 transition hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-50"
          onClick={() => {
            setIsOpen(false);
            if (toastType === 'update') {
              setNeedRefresh(false);
            } else {
              setOfflineReady(false);
            }
          }}
        >
          ✕
        </button>
      </div>
      {toastType === 'update' && (
        <button
          type="button"
          className="mt-3 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 py-2 text-sm font-semibold text-white shadow hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
          onClick={() => updateServiceWorker(true)}
        >
          Update now
        </button>
      )}
    </aside>
  );
};

export default ServiceWorkerToast;
