/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Extend the Window interface with Web Speech API types
interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
  speechSynthesis: any;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
