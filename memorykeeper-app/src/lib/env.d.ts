/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Extend the Window interface with Web Speech API types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}



interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_ENABLE_SUPABASE?: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_APP_RELEASE?: string;
  readonly VITE_SENTRY_DSN?: string;
  readonly POSTHOG_KEY?: string;
  readonly POSTHOG_API_HOST?: string;
  readonly VITE_DISABLE_ANALYTICS_CONSENT?: string;
  readonly MODE?: string;
  readonly DEV?: boolean;
}

// Make this an external module
export {};
