import { Memory } from './dataService';
import { SupportedLanguage } from './LanguageContext';
import React, { useContext, useReducer, ReactNode, useEffect } from 'react';

// Remove conflicting local declarations

// Define the application state
export interface AppState {
  view: string;
  gameView: string | null;
  detailView: string | null;
  memories: Memory[];
  memoryStrength: number;
  isRecording: boolean;
  dailyPrompt: string;
  journalInput: string;
  showOnboarding: boolean;
  onboardingStep: number;
  speechTranscript: string;
  streakCount: number;
  lastEntryDate: string | null;
  // Language settings
  language: SupportedLanguage;
  // Memory strength activities
  activities: any[]; // In a real implementation, this would be properly typed
  // Data sync fields
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error' | 'offline';
  lastSyncTime: number | null;
  pendingChanges: number;
}

// Define action types
export type AppAction =
  | { type: 'SET_VIEW'; payload: string }
  | { type: 'SET_GAME_VIEW'; payload: string | null }
  | { type: 'SET_DETAIL_VIEW'; payload: string | null }
  | { type: 'SET_MEMORIES'; payload: Memory[] }
  | { type: 'ADD_MEMORY'; payload: Memory }
  | { type: 'UPDATE_MEMORY_STRENGTH'; payload: number }
  | { type: 'SET_IS_RECORDING'; payload: boolean }
  | { type: 'SET_DAILY_PROMPT'; payload: string }
  | { type: 'SET_JOURNAL_INPUT'; payload: string }
  | { type: 'SET_SHOW_ONBOARDING'; payload: boolean }
  | { type: 'SET_ONBOARDING_STEP'; payload: number }
  | { type: 'SET_SPEECH_TRANSCRIPT'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: SupportedLanguage }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET_JOURNAL_INPUT' }
  | { type: 'SET_STREAK_COUNT'; payload: number }
  | { type: 'SET_LAST_ENTRY_DATE'; payload: string | null }
  // Data sync actions
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'SET_SYNC_STATUS'; payload: AppState['syncStatus'] }
  | { type: 'SET_LAST_SYNC_TIME'; payload: number }
  | { type: 'SET_PENDING_CHANGES'; payload: number }
  | { type: 'INCREMENT_PENDING_CHANGES' }
  | { type: 'DECREMENT_PENDING_CHANGES' };

// Initial state
const initialState: AppState = {
  view: 'home',
  gameView: null,
  detailView: null,
  memories: [],
  memoryStrength: 75,
  isRecording: false,
  dailyPrompt: "What did your childhood kitchen smell like?",
  journalInput: '',
  showOnboarding: false,
  onboardingStep: 0,
  speechTranscript: '',
  streakCount: 0,
  lastEntryDate: null,
  language: 'en',
  activities: [],
  // Data sync initial state
  isOnline: navigator.onLine,
  syncStatus: 'idle',
  lastSyncTime: null,
  pendingChanges: 0
};

const initializeState = (state: AppState): AppState => {
  if (typeof window === 'undefined') {
    return state;
  }

  const hasSeenOnboarding = window.localStorage.getItem('hasSeenOnboarding');
  const storedStreak = window.localStorage.getItem('memoryKeeperStreakCount');
  const storedLastEntryDate = window.localStorage.getItem('memoryKeeperLastEntryDate');

  let streakCount = state.streakCount;
  if (storedStreak) {
    const parsed = parseInt(storedStreak, 10);
    if (!Number.isNaN(parsed)) {
      streakCount = parsed;
    }
  }

  return {
    ...state,
    showOnboarding: !hasSeenOnboarding,
    streakCount,
    lastEntryDate: storedLastEntryDate ?? state.lastEntryDate
  };
};

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload };
    case 'SET_GAME_VIEW':
      return { ...state, gameView: action.payload };
    case 'SET_DETAIL_VIEW':
      return { ...state, detailView: action.payload };
    case 'SET_MEMORIES':
      return { ...state, memories: action.payload };
    case 'ADD_MEMORY':
      return { 
        ...state, 
        memories: [action.payload, ...state.memories],
        journalInput: '',
        pendingChanges: state.pendingChanges + 1
      };
    case 'UPDATE_MEMORY_STRENGTH':
      return { ...state, memoryStrength: action.payload };
    case 'SET_IS_RECORDING':
      return { ...state, isRecording: action.payload };
    case 'SET_DAILY_PROMPT':
      return { ...state, dailyPrompt: action.payload };
    case 'SET_JOURNAL_INPUT':
      return { ...state, journalInput: action.payload };
    case 'SET_SHOW_ONBOARDING':
      return { ...state, showOnboarding: action.payload };
    case 'SET_ONBOARDING_STEP':
      return { ...state, onboardingStep: action.payload };
    case 'SET_SPEECH_TRANSCRIPT':
      return { ...state, speechTranscript: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'COMPLETE_ONBOARDING':
      return { ...state, showOnboarding: false, onboardingStep: 0 };
    case 'RESET_JOURNAL_INPUT':
      return { ...state, journalInput: '' };
    case 'SET_STREAK_COUNT': {
      const normalizedValue = Math.max(0, action.payload);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('memoryKeeperStreakCount', String(normalizedValue));
      }
      return { ...state, streakCount: normalizedValue };
    }
    case 'SET_LAST_ENTRY_DATE': {
      if (typeof window !== 'undefined') {
        if (action.payload) {
          window.localStorage.setItem('memoryKeeperLastEntryDate', action.payload);
        } else {
          window.localStorage.removeItem('memoryKeeperLastEntryDate');
        }
      }
      return { ...state, lastEntryDate: action.payload };
    }
    // Data sync actions
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'SET_SYNC_STATUS':
      return { ...state, syncStatus: action.payload };
    case 'SET_LAST_SYNC_TIME':
      return { ...state, lastSyncTime: action.payload };
    case 'SET_PENDING_CHANGES':
      return { ...state, pendingChanges: action.payload };
    case 'INCREMENT_PENDING_CHANGES':
      return { ...state, pendingChanges: state.pendingChanges + 1 };
    case 'DECREMENT_PENDING_CHANGES':
      return { ...state, pendingChanges: Math.max(0, state.pendingChanges - 1) };
    default:
      return state;
  }
};

// Create context
const AppStateContext = React.createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
interface AppStateProviderProps {
  children: ReactNode;
}

export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState, initializeState);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: true });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'idle' });
    };

    const handleOffline = () => {
      dispatch({ type: 'SET_ONLINE_STATUS', payload: false });
      dispatch({ type: 'SET_SYNC_STATUS', payload: 'offline' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    dispatch({ type: 'SET_ONLINE_STATUS', payload: navigator.onLine });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};

// Custom hook to use the context
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === null) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
