import type { ReportCallback } from 'web-vitals';
import { reportWebVitalsToSentry } from './lib/sentry';

const reportWebVitals = (onPerfEntry?: ReportCallback): void => {
  // Default to Sentry reporter if no callback provided
  if (!onPerfEntry) {
    onPerfEntry = reportWebVitalsToSentry;
  }

  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
    onINP(onPerfEntry);
  });
};

export default reportWebVitals;
