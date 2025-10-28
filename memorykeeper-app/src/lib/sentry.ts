import * as Sentry from '@sentry/react';
import { env } from './env';

// Initialize Sentry if DSN is available
export const initializeSentry = () => {
  if (!env.VITE_SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: env.VITE_APP_ENV,
    release: env.VITE_APP_RELEASE || undefined,
    tracesSampleRate: env.isProduction ? 0.1 : 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance Monitoring
    replaysSessionSampleRate: env.isProduction ? 0.01 : 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};

// Web Vitals callback that reports to Sentry
export const reportWebVitalsToSentry = (metric: any) => {
  // Log as breadcrumb for debugging
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${metric.name}: ${metric.value}`,
    level: 'info',
    data: metric
  });

  // Set measurement if value is not poor (to avoid spam)
  const isPoor = (
    (metric.name === 'INP' && metric.value > 200) ||
    (metric.name === 'CLS' && metric.value > 0.1) ||
    ((metric.name === 'FCP' || metric.name === 'LCP' || metric.name === 'TTFB') && metric.value > 2500)
  );

  if (isPoor) {
    Sentry.setMeasurement(`${metric.name}_measurement`, metric.value, metric.name.includes('CLS') ? 'ratio' : 'millisecond');
  }
};
