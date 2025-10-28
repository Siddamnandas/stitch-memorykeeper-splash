import React, { useState, useEffect, useContext, useCallback, useMemo, useRef, lazy, memo, Suspense, startTransition, Component, ReactNode } from 'react';
import { Mic, Home, Gamepad2, BookOpen, User, Trophy, Star, Brain, ChevronRight, Plus, Share2, Zap, Heart, Sparkles, Award, ChevronLeft, LogOut, X } from 'lucide-react';
import { startSpeechRecognition, isSpeechRecognitionSupported } from '../lib/speechService';
import enhancedSpeechService from '../lib/enhancedSpeechService';
import { useAppState } from '../lib/AppStateContext';
import { useError } from '../lib/ErrorContext';
import { Memory } from '../lib/dataService';
import { addActivityAndRecalculate } from '../lib/memoryStrengthService';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { sanitizeTextInput, sanitizeMemoryData } from '../lib/inputSanitizer';
import { syncService } from '../lib/syncService';
import FileUpload, { ProcessedFileData } from './FileUpload';
import { addMemory as addOfflineMemory, markMemoriesAsSynced, getAllMemories as getOfflineMemories } from '../lib/indexedDBService';
import { cn, softText, ui } from '../lib/designSystem';

// Lazy load heavy components for code splitting
const MemoryMatchGame = lazy(() => import('./MemoryMatchGame'));
const MemoryMatchUpGame = lazy(() => import('./MemoryMatchUpGame'));
const AiStudio = lazy(() => import('./AiStudio'));
const CollaborativeMemory = lazy(() => import('./CollaborativeMemory'));
const EchoEcho = lazy(() => import('./EchoEcho'));
const GameSelection = lazy(() => import('./GameSelection'));
const HomeDashboard = lazy(() => import('./HomeDashboard'));
const InviteCollaborate = lazy(() => import('./InviteCollaborate'));
const LegacyLink = lazy(() => import('./LegacyLink'));
const MemoryMatchup1 = lazy(() => import('./MemoryMatchup1'));
const MemoryMatchup2 = lazy(() => import('./MemoryMatchup2'));
const MemoryStrengthFlower = lazy(() => import('./MemoryStrengthFlower'));
const KnowledgeGraphView = lazy(() => import('./KnowledgeGraphView'));
const PremiumFeaturesDetails = lazy(() => import('./PremiumFeaturesDetails'));
const ProactiveMemoryPrompt = lazy(() => import('./ProactiveMemoryPrompt'));
const ProfileSetup = lazy(() => import('./ProfileSetup'));
const QuickTutorial = lazy(() => import('./QuickTutorial'));
const ScrapbookTimeline = lazy(() => import('./ScrapbookTimeline'));
const SnapshotSolve1 = lazy(() => import('./SnapshotSolve1'));
const SnapshotSolve2 = lazy(() => import('./SnapshotSolve2'));
const StoryQuizQuest1 = lazy(() => import('./StoryQuizQuest1'));
const StoryQuizQuest2 = lazy(() => import('./StoryQuizQuest2'));
const TimelineTango = lazy(() => import('./TimelineTango'));
const ViewProgressAndSettings = lazy(() => import('./ViewProgressAndSettings'));
const VisualContentGenerator = lazy(() => import('./VisualContentGenerator'));
const UserProfileManager = lazy(() => import('./UserProfileManager'));
const SyncStatusIndicator = lazy(() => import('./SyncStatusIndicator'));
const DataExportImport = lazy(() => import('./DataExportImport'));
const MemoryImport = lazy(() => import('./MemoryImport'));
const MemoryStrengthBreakdown = lazy(() => import('./MemoryStrengthBreakdown'));
const CollaborativeCollections = lazy(() => import('./CollaborativeCollections'));
const EnhancedVoiceInput = lazy(() => import('./EnhancedVoiceInput'));
const OnboardingWizard = lazy(() => import('./OnboardingWizard'));

const SuspendedMemoryStrengthFlower: React.FC<{ strength: number; size: number }> = ({ strength, size }) => (
  <Suspense
    fallback={
      <div
        className="animate-pulse rounded-full bg-primary/15"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    }
  >
    <MemoryStrengthFlower strength={strength} size={size} />
  </Suspense>
);

interface GameSuggestion {
  title: string;
  description: string;
  time: string;
  icon: string;
  gameView: string;
  reason: string;
}

// Error boundary component
class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

const MemoryKeeperMain: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { handleError, addToast } = useError();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const runTransition = useCallback((fn: () => void) => {
    startTransition(fn);
  }, []);

  // Log state changes for debugging
  useEffect(() => {
    console.log('AppState updated:', state);
  }, [state]);

  const setJournalInput = useCallback(
    (value: string) => dispatch({ type: 'SET_JOURNAL_INPUT', payload: value }),
    [dispatch]
  );
  useEffect(() => {
    const prompts = [
      "What did your childhood kitchen smell like?",
      "Describe your first bicycle ride",
      "Who was your favorite teacher and why?",
      "What was your wedding day like?",
      "Tell me about your first job",
      "What games did you play as a child?",
    ];

    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    dispatch({ type: 'SET_DAILY_PROMPT', payload: randomPrompt });
  }, [dispatch]);

  useEffect(() => {
    if (state.memories.length > 0) {
      return;
    }

    let cancelled = false;

    const loadOfflineMemories = async () => {
      try {
        const offlineMemories = await getOfflineMemories();
        if (cancelled || offlineMemories.length === 0) {
          return;
        }

        const normalizedMemories: Memory[] = offlineMemories
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((memory) => ({
            id: memory.id,
            prompt: memory.prompt,
            response: memory.response,
            date: memory.date,
            type: memory.type,
            tags: memory.tags ?? []
          }));

        dispatch({ type: 'SET_MEMORIES', payload: normalizedMemories });
      } catch (error) {
        console.error('Error loading offline memories:', error);
      }
    };

    loadOfflineMemories();

    return () => {
      cancelled = true;
    };
  }, [dispatch, state.memories.length]);

  const determineGameSuggestion = useCallback(
    (memoriesOverride?: Memory[]): GameSuggestion | null => {
      const memories = memoriesOverride ?? state.memories;

      if (memories.length === 0) {
        return {
          title: 'Story Quiz Quest',
          description: 'Get started with your first memory',
          time: '1-2 min',
          icon: '📖',
          gameView: 'quiz-1',
          reason: 'Perfect for beginners'
        };
      }

      const recentMemory = memories[0];
      const memoryContent = (recentMemory.prompt + ' ' + recentMemory.response).toLowerCase();

      if (memoryContent.includes('beach') || memoryContent.includes('ocean') || memoryContent.includes('sea')) {
        return {
          title: 'Story Quiz Quest',
          description: 'Based on your beach memory',
          time: '1-2 min',
          icon: '📖',
          gameView: 'quiz-1',
          reason: 'Perfect for your beach memories'
        };
      }

      if (memoryContent.includes('family') || memoryContent.includes('friend') || memoryContent.includes('people')) {
        return {
          title: 'Memory Match-Up',
          description: 'Based on your social memories',
          time: '2-3 min',
          icon: '🎴',
          gameView: 'match',
          reason: 'Great for relationship memories'
        };
      }

      if (memoryContent.includes('recipe') || memoryContent.includes('food') || memoryContent.includes('cook')) {
        return {
          title: 'Timeline Tango',
          description: 'Based on your culinary memories',
          time: '3-4 min',
          icon: '📅',
          gameView: 'timeline',
          reason: 'Ideal for sequential memories'
        };
      }

      if (memoryContent.includes('travel') || memoryContent.includes('trip') || memoryContent.includes('journey')) {
        return {
          title: 'Snapshot Solve',
          description: 'Based on your travel memories',
          time: '2-3 min',
          icon: '📸',
          gameView: 'snapshot-1',
          reason: 'Perfect for visual memories'
        };
      }

      if (memories.length < 5) {
        return {
          title: 'Story Quiz Quest',
          description: 'Strengthen your memory recall',
          time: '1-2 min',
          icon: '📖',
          gameView: 'quiz-1',
          reason: 'Great for building memory strength'
        };
      }

      const games = [
        { title: 'Story Quiz Quest', icon: '📖', gameView: 'quiz-1', description: 'Test your story recall' },
        { title: 'Memory Match-Up', icon: '🎴', gameView: 'match', description: 'Match related memories' },
        { title: 'Timeline Tango', icon: '📅', gameView: 'timeline', description: 'Sort events chronologically' },
        { title: 'Echo Echo', icon: '🔁', gameView: 'echo', description: 'Repeat memory sequences' }
      ];

      const randomGame = games[Math.floor(Math.random() * games.length)];
      return {
        ...randomGame,
        time: '2-3 min',
        reason: 'Try something new today'
      };
    },
    [state.memories]
  );

  const persistOfflineMemory = useCallback(
    async (memory: Memory, synced: boolean) => {
      try {
        await addOfflineMemory({
          id: memory.id ?? `offline-${Date.now()}`,
          userId: user?.id,
          prompt: memory.prompt,
          response: memory.response,
          date: memory.date,
          type: memory.type,
          tags: memory.tags ?? [],
          synced
        });
      } catch (error) {
        console.error('Error caching memory locally:', error);
      }
    },
    [user?.id]
  );

  const updateStreakWithEntry = useCallback(
    (entryDate: Date) => {
      const entryDay = entryDate.toISOString().split('T')[0];
      const lastDay = state.lastEntryDate;
      let nextStreak = state.streakCount || 0;

      if (lastDay) {
        if (lastDay === entryDay) {
          nextStreak = Math.max(1, state.streakCount || 1);
        } else {
          const previous = new Date(`${lastDay}T00:00:00`);
          const current = new Date(`${entryDay}T00:00:00`);
          const diffDays = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            nextStreak = (state.streakCount || 0) + 1;
          } else if (diffDays <= 0) {
            nextStreak = Math.max(state.streakCount || 1, 1);
          } else {
            nextStreak = 1;
          }
        }
      } else {
        nextStreak = 1;
      }

      dispatch({ type: 'SET_STREAK_COUNT', payload: nextStreak });
      dispatch({ type: 'SET_LAST_ENTRY_DATE', payload: entryDay });
    },
    [dispatch, state.lastEntryDate, state.streakCount]
  );

  const currentGameSuggestion = useMemo(() => determineGameSuggestion(), [determineGameSuggestion]);

  const todayString = useMemo(() => new Date().toDateString(), []);
  const yesterdayString = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toDateString();
  }, []);

  const yesterdayMemory = useMemo(() => {
    const yesterdayEntry = state.memories.find(
      (memory) => new Date(memory.date).toDateString() === yesterdayString
    );
    if (yesterdayEntry) {
      return yesterdayEntry;
    }

    const previousEntry = state.memories.find(
      (memory) => new Date(memory.date).toDateString() !== todayString
    );
    return previousEntry ?? null;
  }, [state.memories, todayString, yesterdayString]);

  const handleAddMemory = async (journalInput?: string) => {
    const inputToUse = journalInput !== undefined ? journalInput : state.journalInput;

    // Sanitize input
    const sanitizedInput = sanitizeTextInput(inputToUse);
    if (!sanitizedInput.trim()) return;

    const words = sanitizedInput.toLowerCase().split(' ');
    const rawTags = words.filter(w => w.length > 4).slice(0, 3);

    const newMemoryData = sanitizeMemoryData({
      prompt: state.dailyPrompt,
      response: sanitizedInput,
      type: 'text',
      tags: rawTags,
    });

    const newMemory: Memory = {
      id: Date.now().toString(),
      prompt: newMemoryData.prompt,
      response: newMemoryData.response,
      date: new Date().toISOString(),
      type: newMemoryData.type,
      tags: newMemoryData.tags,
    };
    
    dispatch({ type: 'ADD_MEMORY', payload: newMemory });
    updateStreakWithEntry(new Date(newMemory.date));
    void persistOfflineMemory(newMemory, false);
    
    // Save memory to Supabase memories table
    try {
      if (user && supabase) {
        const { error } = await supabase
          .from('memories')
          .insert({
            id: newMemory.id,
            user_id: user.id,
            prompt: newMemory.prompt,
            response: newMemory.response,
            date: newMemory.date,
            type: newMemory.type,
            tags: newMemory.tags
          });

        if (error) throw error;
        if (newMemory.id) {
          await markMemoriesAsSynced([newMemory.id]);
        }
      }
    } catch (error) {
      console.error('Error saving memory to Supabase:', error);
      // Don't show error to user since the memory is still saved locally
    }
    
    // Add activity for memory added
    try {
      const { getActivityPoints } = await import('../lib/memoryStrengthService');
      const newStrength = await addActivityAndRecalculate(user?.id || 'user123', {
        type: 'memory_added',
        timestamp: new Date(),
        value: getActivityPoints('memory_added'),
        metadata: {
          memoryId: newMemory.id
        }
      });
      dispatch({ type: 'UPDATE_MEMORY_STRENGTH', payload: newStrength });
    } catch (error) {
      console.error('Error updating memory strength:', error);
      // Fallback to simple increment
      dispatch({ type: 'UPDATE_MEMORY_STRENGTH', payload: Math.min(100, state.memoryStrength + 2) });
    }
    
    // Show success toast
    const suggestion = determineGameSuggestion([newMemory, ...state.memories]);
    addToast({
      type: 'success',
      title: 'Memory Saved',
      message: suggestion
        ? `Your memory has been saved! Ready for a quick game? Try ${suggestion.title}.`
        : 'Your memory has been successfully saved!',
      duration: 4000
    });
  };

  const handleFileProcessed = useCallback(
    async (fileData: ProcessedFileData) => {
      const entryDate = new Date();
      const isVisual = fileData.type === 'image' || fileData.type === 'video';
      const captionText = uploadCaption.trim() 
        ? sanitizeTextInput(uploadCaption) 
        : sanitizeTextInput(
            state.journalInput || `Shared ${fileData.type === 'image' ? 'photo' : fileData.type === 'video' ? 'video' : 'document'}`
          );

      const payload = isVisual
        ? {
            caption: captionText,
            mediaType: fileData.type,
            fileName: fileData.metadata.name,
            size: fileData.metadata.size,
            preview: fileData.preview,
            uploadedAt: entryDate.toISOString()
          }
        : null;

      const sanitizedData = sanitizeMemoryData({
        prompt: state.dailyPrompt,
        response: payload
          ? JSON.stringify(payload)
          : fileData.textContent
          ? sanitizeTextInput(fileData.textContent).slice(0, 1000)
          : `Document upload: ${fileData.metadata.name}`,
        type: isVisual ? 'visual' : 'text',
        tags: isVisual
          ? ['upload', fileData.type]
          : ['upload', 'document']
      });

      const newMemory: Memory = {
        id: Date.now().toString(),
        prompt: sanitizedData.prompt,
        response: sanitizedData.response,
        date: entryDate.toISOString(),
        type: sanitizedData.type,
        tags: sanitizedData.tags
      };

      dispatch({ type: 'ADD_MEMORY', payload: newMemory });
      updateStreakWithEntry(entryDate);
      void persistOfflineMemory(newMemory, false);

      try {
        if (user && supabase) {
          const { error } = await supabase
            .from('memories')
            .insert({
              id: newMemory.id,
              user_id: user.id,
              prompt: newMemory.prompt,
              response: newMemory.response,
              date: newMemory.date,
              type: newMemory.type,
              tags: newMemory.tags
            });
          if (error) throw error;
          if (newMemory.id) {
            await markMemoriesAsSynced([newMemory.id]);
          }
        }
      } catch (error) {
        console.error('Error saving uploaded memory to Supabase:', error);
      }

      const suggestion = determineGameSuggestion([newMemory, ...state.memories]);
      const descriptor = isVisual ? (fileData.type === 'image' ? 'photo' : 'video') : 'memory';
      addToast({
        type: 'success',
        title: `${descriptor.charAt(0).toUpperCase()}${descriptor.slice(1)} Saved`,
        message: suggestion
          ? `Saved your ${descriptor}! Try ${suggestion.title} next.`
          : `Saved your ${descriptor}!`,
        duration: 4000
      });

      setUploadCaption('');
      setUploadModalOpen(false);
    },
    [addToast, determineGameSuggestion, state.dailyPrompt, state.journalInput, state.memories, updateStreakWithEntry, user, dispatch, setUploadModalOpen, uploadCaption]
  );

  const getAdaptiveDifficulty = (): 'easy' | 'medium' | 'hard' => {
    // Calculate difficulty based on memory strength
    if (state.memoryStrength >= 80) return 'hard';
    if (state.memoryStrength >= 60) return 'medium';
    return 'easy';
  };

  const handleVoiceInput = async () => {
    if (!isSpeechRecognitionSupported()) {
      handleError(null, 'Voice input is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    try {
      // Detect language from recent memories for better accuracy
      const recentText = state.memories.slice(0, 3).map(m => m.response).join(' ');
      const detectedLanguage = enhancedSpeechService.detectLanguage(recentText);
      
      // Get keywords from recent memories for keyword spotting
      const keywords = state.memories.slice(0, 5).flatMap(m => 
        m.tags.concat(m.response.split(' ').filter(word => word.length > 4))
      ).slice(0, 10);
      
      const stopListening = await enhancedSpeechService.startEnhancedSpeechRecognition(
        (result) => {
          // Format and enhance the transcript
          const formattedTranscript = enhancedSpeechService.formatTranscript(result.transcript);
          
          dispatch({ type: 'SET_SPEECH_TRANSCRIPT', payload: formattedTranscript });
          dispatch({ type: 'SET_JOURNAL_INPUT', payload: formattedTranscript });
        },
        (error) => {
          console.error('Speech recognition error:', error);
          dispatch({ type: 'SET_IS_RECORDING', payload: false });
          handleError(error, 'Error with voice input. Please try again.');
        },
        () => {
          dispatch({ type: 'SET_IS_RECORDING', payload: false });
        },
        {
          lang: detectedLanguage,
          continuous: true,
          interimResults: true,
          punctuationCorrection: true,
          keywordSpotting: keywords
        }
      );
      
      dispatch({ type: 'SET_IS_RECORDING', payload: true });
      
      // Auto-stop after 30 seconds for better user experience
      setTimeout(() => {
        if (enhancedSpeechService.isCurrentlyRecording()) {
          stopListening();
          dispatch({ type: 'SET_IS_RECORDING', payload: false });
          
          // Show a toast with transcription history option
          addToast({
            type: 'info',
            title: 'Voice Recording Complete',
            message: 'Your voice memo has been recorded. Check your transcription history for previous recordings.',
            duration: 5000
          });
        }
      }, 30000);
    } catch (error: any) {
      console.error('Error starting speech recognition:', error);
      dispatch({ type: 'SET_IS_RECORDING', payload: false });
      handleError(error, 'Error starting voice recording. Please try again.');
    }
  };

  // Nav Button Component
  const NavButton: React.FC<{ icon: React.ElementType; label: string; active: boolean; onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      tabIndex={0}
      role="button"
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 ${
        active 
          ? 'text-primary bg-primary/10' 
          : 'text-ink-muted hover:text-ink'
      }`}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <Icon className="w-6 h-6" aria-hidden="true" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  // Home View Component
  const HomeView: React.FC<{ 
    dailyPrompt: string; 
    journalInput: string; 
    setJournalInput: (value: string) => void;
    handleAddMemory: (journalInput?: string) => void;
    handleVoiceInput: () => void;
    isRecording: boolean;
    setGameView: React.Dispatch<React.SetStateAction<string | null>>;
    memories: Memory[];
    onUpload: () => void;
    streakCount: number;
    memoryStrength: number;
    yesterdayMemory: Memory | null;
    gameSuggestion: GameSuggestion | null;
  }> = memo(({
    dailyPrompt,
    journalInput,
    setJournalInput,
    handleAddMemory,
    handleVoiceInput,
    isRecording,
    setGameView,
    memories,
    onUpload,
    streakCount,
    memoryStrength,
    yesterdayMemory,
    gameSuggestion
  }) => {
    const todayLabel = useMemo(
      () => new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }),
      []
    );
    const scoreProgress = useMemo(() => Math.min(100, Math.max(0, memoryStrength)), [memoryStrength]);

    const handleButtonClick = useCallback((action: string) => {
      switch (action) {
        case 'record':
          handleVoiceInput();
          break;
        case 'write':
          break;
        case 'upload':
          onUpload();
          break;
        case 'start-ritual':
          runTransition(() => {
            dispatch({ type: 'SET_VIEW', payload: 'games' });
            dispatch({ type: 'SET_GAME_VIEW', payload: null });
          });
          break;
        case 'story-quiz':
          setGameView('quiz-1');
          break;
        default:
          break;
      }
    }, [dispatch, handleVoiceInput, onUpload, setGameView]);

    const renderMemoryExcerpt = useCallback((memory: Memory) => {
      if (memory.type === 'photo') {
        return `📷 ${memory.response}`;
      }
      if (memory.type === 'document') {
        return `📄 ${memory.response}`;
      }
      return memory.response;
    }, []);

    const yesterdayMemoryDate = useMemo(() => {
      if (!yesterdayMemory) return null;
      return new Date(yesterdayMemory.date).toLocaleDateString();
    }, [yesterdayMemory]);

    return (
      <div className="space-y-8 pt-6">
        {/* Daily Prompt Card */}
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-surface-muted backdrop-blur-soft rounded-3xl p-6 shadow-soft border border-border/60">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center" aria-hidden="true">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink">Daily Prompt</h2>
              <p className="text-lg text-ink-muted">Today's memory challenge</p>
            </div>
          </div>
          
          <p className="text-2xl font-bold text-ink mb-6">{dailyPrompt}</p>
          
          <div className="space-y-5">
            <label htmlFor="journal-input" className="sr-only">Write your memory here</label>
            <textarea
              id="journal-input"
              value={journalInput}
              onChange={(e) => setJournalInput(e.target.value)}
              placeholder="Write your memory here..."
              className="w-full h-36 rounded-2xl border border-border/60 bg-primary/10 p-5 text-lg outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              aria-label="Write your memory here"
            />
            
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleButtonClick('record')}
                aria-label={isRecording ? "Stop recording" : "Record voice memo"}
                className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-4 transition-all ${
                  isRecording
                    ? 'bg-danger text-white'
                    : 'bg-primary/15 text-primary hover:bg-primary/20'
                }`}
              >
                <Mic className="w-6 h-6" aria-hidden="true" />
                <span className="text-lg font-bold">{isRecording ? 'Listening...' : 'Voice'}</span>
              </button>
              
              <button
                onClick={() => {
                  // Pass the journal input directly to handleAddMemory
                  handleAddMemory(journalInput);
                  setJournalInput('');
                }}
                disabled={!journalInput.trim()}
                aria-label="Add memory"
                className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl hover:shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Plus className="w-6 h-6" aria-hidden="true" />
                <span className="text-lg font-bold">Add Memory</span>
              </button>

              <button
                onClick={() => handleButtonClick('upload')}
                aria-label="Upload a photo"
                className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/60 bg-surface-raised py-4 text-primary transition-all hover:bg-primary/10"
              >
                <span className="text-2xl" aria-hidden="true">📷</span>
                <span className="text-lg font-bold">Upload</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <p className="text-lg text-ink-muted">{todayLabel}</p>
              <p className="text-xl font-bold text-primary">🔥 {streakCount} day streak</p>
            </div>
            <div className="relative w-20 h-20">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(236,149,19,0.15)" strokeWidth="10"></circle>
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgb(var(--mk-color-primary))"
                  strokeWidth="10"
                  strokeDasharray={`${283 * (scoreProgress / 100)} 283`}
                  transform="rotate(-90 50 50)"
                  strokeLinecap="round"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {yesterdayMemory && (
          <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-6 shadow-subtle border border-border/60">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-ink">Yesterday's Joy</h2>
              {yesterdayMemoryDate && <span className="text-xs text-ink-muted">{yesterdayMemoryDate}</span>}
            </div>
            <p className="text-sm text-ink-muted mb-2">{yesterdayMemory.prompt}</p>
            <p className="text-ink line-clamp-3">{renderMemoryExcerpt(yesterdayMemory)}</p>
          </div>
        )}

        {gameSuggestion && (
          <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-6 shadow-subtle border border-border/60">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-ink">Suggested Game</h2>
              <span className="text-xs text-ink-muted">{gameSuggestion.reason}</span>
            </div>
            <p className="text-sm text-ink-muted mb-2">{gameSuggestion.description}</p>
            <button
              onClick={() => setGameView(gameSuggestion.gameView)}
              className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl hover:shadow-subtle transition-all"
            >
              <span className="text-lg font-bold">{gameSuggestion.title}</span>
              <ChevronRight className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface">
      <div className="w-full max-w-3xl">
        <HomeView
          dailyPrompt={state.dailyPrompt}
          journalInput={state.journalInput}
          setJournalInput={setJournalInput}
          handleAddMemory={handleAddMemory}
          handleVoiceInput={handleVoiceInput}
          isRecording={state.isRecording}
          setGameView={(view) => dispatch({ type: 'SET_GAME_VIEW', payload: view })}
          memories={state.memories}
          onUpload={() => setUploadModalOpen(true)}
          streakCount={state.streakCount}
          memoryStrength={state.memoryStrength}
          yesterdayMemory={yesterdayMemory}
          gameSuggestion={currentGameSuggestion}
        />
      </div>
      <FileUpload
        isOpen={isUploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onProcessed={handleFileProcessed}
        caption={uploadCaption}
        setCaption={setUploadCaption}
      />
    </div>
        )}

        {gameSuggestion && (
          <div className="rounded-3xl border border-border/60 bg-gradient-to-r from-surface to-accent/10 p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-ink">Today's Suggestion</h2>
              <span className="text-xs font-semibold text-accent bg-accent/15 px-2 py-1 rounded-full">Recommended</span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-accent/15 rounded-2xl flex items-center justify-center">
                <span className="text-xl" aria-hidden="true">{gameSuggestion.icon}</span>
              </div>
              <div>
                <h3 className="font-bold text-ink">{`${gameSuggestion.icon} ${gameSuggestion.title}`}</h3>
                <p className="text-sm text-ink-muted">{gameSuggestion.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-muted">{gameSuggestion.time}</span>
              <button
                className="bg-gradient-to-r from-primary to-accent text-white font-bold py-2 px-4 rounded-xl shadow-subtle hover:shadow-soft transition-all"
                onClick={() => setGameView(gameSuggestion.gameView)}
              >
                Play Now
              </button>
            </div>

            <div className="mt-3 text-xs text-accent italic">
              {gameSuggestion.reason}
            </div>
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-surface to-primary/10 rounded-3xl p-5 border border-border/60 flex flex-col items-center justify-center">
            <div className="mb-3">
              <SuspendedMemoryStrengthFlower strength={memoryStrength} size={80} />
            </div>
            <p className="text-xs text-primary text-center">Memory Strength</p>
          </div>
          
          <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-surface to-accent/10 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-white" aria-hidden="true">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{memories.length}</p>
                <p className="text-xs text-accent">Memories</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-ink mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: 'ai-studio' }))}
              aria-label="Open AI Studio"
              className="bg-gradient-to-br from-accent to-primary rounded-2xl p-4 text-white text-center shadow-subtle hover:shadow-soft transition-all"
            >
              <div className="text-3xl mb-2" aria-hidden="true">🤖</div>
              <p className="font-bold text-sm">AI Studio</p>
            </button>
            
            <button 
              onClick={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: 'visual-content' }))}
              aria-label="Create visual memories"
              className="bg-gradient-to-br from-primary to-primary-strong rounded-2xl p-4 text-white text-center shadow-subtle hover:shadow-soft transition-all"
            >
              <div className="text-3xl mb-2" aria-hidden="true">🎨</div>
              <p className="font-bold text-sm">Visualize</p>
            </button>
            
            <button 
              onClick={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: 'knowledge-graph' }))}
              aria-label="Explore memory connections"
              className="bg-gradient-to-br from-accent to-primary rounded-2xl p-4 text-white text-center shadow-subtle transition-all hover:shadow-soft"
            >
              <div className="text-3xl mb-2" aria-hidden="true">🔗</div>
              <p className="font-bold text-sm">Connections</p>
            </button>
            
            <button 
              onClick={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: 'collaborative-memory' }))}
              aria-label="Collaborate with family"
              className="bg-gradient-to-br from-primary to-accent rounded-2xl p-4 text-white text-center shadow-subtle transition-all hover:shadow-soft"
            >
              <div className="text-3xl mb-2" aria-hidden="true">👥</div>
              <p className="font-bold text-sm">Collaborate</p>
            </button>
          </div>
        </div>
        
        {/* Recent Memories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ink">Recent Memories</h2>
            <button 
              onClick={() => runTransition(() => dispatch({ type: 'SET_VIEW', payload: 'scrapbook' }))}
              className="text-primary hover:text-primary font-medium flex items-center gap-1"
              aria-label="See all memories"
            >
              See All <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          
          <div className="space-y-4">
            {memories.slice(0, 2).map((memory) => (
              <div key={memory.id} className="bg-surface/90 backdrop-blur-soft rounded-3xl p-5 shadow-subtle border border-border/60">
                <p className="font-semibold text-ink mb-2 line-clamp-2">{renderMemoryExcerpt(memory)}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-ink-muted">
                    {new Date(memory.date).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    {memory.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-primary/15 text-primary px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            {memories.length === 0 && (
              <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-8 text-center shadow-subtle border border-border/60">
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-3" aria-hidden="true" />
                <p className="text-ink-muted">No memories yet. Start by adding your first memory!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Games Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ink">Brain Games</h2>
            <button 
              onClick={() => runTransition(() => dispatch({ type: 'SET_VIEW', payload: 'games' }))}
              className="text-primary hover:text-primary font-medium flex items-center gap-1"
              aria-label="See all games"
            >
              See All <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: 'match' }))}
              aria-label="Play Memory Match game"
              className="bg-gradient-to-br from-accent to-primary rounded-2xl p-4 text-white text-center shadow-subtle transition-all hover:shadow-soft"
            >
              <div className="text-3xl mb-2" aria-hidden="true">🎴</div>
              <p className="font-bold text-sm">Match</p>
            </button>
            <button 
              onClick={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: 'quiz-1' }))}
              aria-label="Play Story Quiz game"
              className="bg-gradient-to-br from-primary to-accent rounded-2xl p-4 text-white text-center shadow-subtle transition-all hover:shadow-soft"
            >
              <div className="text-3xl mb-2" aria-hidden="true">❓</div>
              <p className="font-bold text-sm">Quiz</p>
            </button>
            <button 
              onClick={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: 'timeline' }))}
              aria-label="Play Timeline Tango game"
              className="bg-gradient-to-br from-success to-primary rounded-2xl p-4 text-white text-center shadow-subtle transition-all hover:shadow-soft"
            >
              <div className="text-3xl mb-2" aria-hidden="true">📅</div>
              <p className="font-bold text-sm">Timeline</p>
            </button>
          </div>
        </div>
      </div>
    );
  });

  // Games Lobby Component
  const GamesLobby: React.FC = () => (
    <div className="pt-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-ink mb-2">Brain Games</h1>
        <p className="text-ink-muted">Keep your mind sharp with daily challenges</p>
      </div>
      
      <div className="grid grid-cols-2 gap-5">
        <button 
          onClick={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: 'match' }))}
          className="bg-gradient-to-br from-accent to-primary rounded-3xl p-6 text-white text-center shadow-soft transition-all hover:shadow-ring"
        >
          <div className="text-6xl mb-4">🎴</div>
          <h3 className="text-xl font-bold mb-2">Memory Match</h3>
          <p className="text-white/80">Match pairs of cards</p>
        </button>
        
        <button 
          onClick={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: 'quiz' }))}
          className="bg-gradient-to-br from-primary to-accent rounded-3xl p-6 text-white text-center shadow-soft transition-all hover:shadow-ring"
        >
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-xl font-bold mb-2">Story Quiz</h3>
          <p className="text-white/80">Test your knowledge</p>
        </button>
        
        <button 
          onClick={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: 'timeline' }))}
          className="bg-gradient-to-br from-success to-primary rounded-3xl p-6 text-white text-center shadow-soft transition-all hover:shadow-ring"
        >
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold mb-2">Timeline Tango</h3>
          <p className="text-white/80">Sort events chronologically</p>
        </button>
        
        <button 
          onClick={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: 'echo' }))}
          className="bg-gradient-to-br from-accent to-primary rounded-3xl p-6 text-white text-center shadow-soft transition-all hover:shadow-ring"
        >
          <div className="text-6xl mb-4">🔁</div>
          <h3 className="text-xl font-bold mb-2">Echo Echo</h3>
          <p className="text-white/80">Repeat sequences</p>
        </button>
        
        <button 
          onClick={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: 'link' }))}
          className="bg-gradient-to-br from-primary to-primary-strong rounded-3xl p-6 text-white text-center shadow-soft transition-all hover:shadow-ring"
        >
          <div className="text-6xl mb-4">🔗</div>
          <h3 className="text-xl font-bold mb-2">Legacy Link</h3>
          <p className="text-white/80">Connect related memories</p>
        </button>
        
        <button 
          onClick={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: 'snapshot' }))}
          className="bg-gradient-to-br from-accent to-success rounded-3xl p-6 text-white text-center shadow-soft transition-all hover:shadow-ring"
        >
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-xl font-bold mb-2">Snapshot Solve</h3>
          <p className="text-white/80">Reconstruct scenes</p>
        </button>
      </div>
    </div>
  );

  // Game Container Component
  const GameContainer: React.FC<{ gameType: string }> = ({ gameType }) => {
    const gameTitles: Record<string, string> = {
      match: "Memory Match-Up",
      quiz: "Story Quiz",
      timeline: "Timeline Tango",
      echo: "Echo Echo",
      link: "Legacy Link",
      snapshot: "Snapshot Solve"
    };

    // Handle back navigation
    const handleBack = () => {
      runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: null }));
    };

    return (
      <div className="pt-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: null }))}
            className="w-10 h-10 bg-surface/90 backdrop-blur-soft rounded-2xl flex items-center justify-center shadow-subtle border border-border/60"
          >
            <ChevronRight className="w-6 h-6 rotate-180 text-ink" />
          </button>
          <h1 className="text-2xl font-bold text-ink">{gameTitles[gameType]}</h1>
        </div>
        
        {/* Render actual game components */}
        {gameType === 'match' ? (
          <MemoryMatchUpGame 
            onBack={handleBack} 
            memories={state.memories as any} 
            difficulty={getAdaptiveDifficulty()}
          />
        ) : (
          <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-8 shadow-soft border border-border/60 min-h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {gameType === 'match' && '🎴'}
                {gameType === 'quiz' && '❓'}
                {gameType === 'timeline' && '📅'}
                {gameType === 'echo' && '🔁'}
                {gameType === 'link' && '🔗'}
                {gameType === 'snapshot' && '📸'}
              </div>
              <h2 className="text-2xl font-bold text-ink mb-2">Game Coming Soon</h2>
              <p className="text-ink-muted mb-6">This game is under development. Check back soon!</p>
              <button
                onClick={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: null }))}
                className="py-3 px-6 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-semibold shadow-subtle hover:shadow-soft transition-all"
              >
                Back to Games
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Scrapbook View Component
  const ScrapbookView: React.FC = () => (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink">Memory Scrapbook</h1>
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-surface/90 backdrop-blur-soft rounded-2xl flex items-center justify-center shadow-subtle border border-border/60">
            <Share2 className="w-5 h-5 text-ink" />
          </button>
        </div>
      </div>
      
      {state.memories.length === 0 ? (
        <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-8 text-center shadow-subtle border border-border/60">
          <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-ink mb-2">No Memories Yet</h2>
          <p className="text-ink-muted mb-6">Start capturing your precious moments to build your scrapbook!</p>
          <button
            onClick={() => runTransition(() => dispatch({ type: 'SET_VIEW', payload: 'home' }))}
            className="py-3 px-6 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-semibold shadow-subtle hover:shadow-soft transition-all"
          >
            Add Your First Memory
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {state.memories.map((memory) => (
            <div key={memory.id} className="bg-surface/90 backdrop-blur-soft rounded-3xl p-6 shadow-subtle border border-border/60">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-ink mb-2">{memory.prompt}</p>
                  <p className="text-ink mb-4">{memory.response}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {memory.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-primary/15 text-primary px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-ink-muted">
                      {new Date(memory.date).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 bg-primary/15 rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors">
                        <Heart className="w-4 h-4 text-primary" />
                      </button>
                      <button className="w-8 h-8 bg-primary/15 rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors">
                        <Share2 className="w-4 h-4 text-primary" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Profile View Component
  const ProfileView: React.FC<{ memoryStrength: number; memoriesCount: number }> = ({ memoryStrength, memoriesCount }) => (
    <div className="pt-6 space-y-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center text-4xl text-white shadow-subtle">
          {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <h1 className="text-2xl font-bold text-ink">{profile?.full_name || 'User'}</h1>
        <p className="text-ink-muted">Memory Keeper Extraordinaire</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-4 text-center shadow-subtle border border-border/60">
          <p className="text-2xl font-bold text-ink">{memoriesCount}</p>
          <p className="text-sm text-ink-muted">Memories</p>
        </div>
        <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-4 text-center shadow-subtle border border-border/60 flex flex-col items-center justify-center">
          <div className="mb-2">
            <SuspendedMemoryStrengthFlower strength={memoryStrength} size={60} />
          </div>
          <p className="text-sm text-ink-muted">Strength</p>
        </div>
      </div>
      
      <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-6 shadow-subtle border border-border/60">
        <h2 className="text-xl font-bold text-ink mb-4">Achievements</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary/15 to-primary/30 rounded-2xl p-4 text-center">
            <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-xs font-semibold text-primary-strong">First Memory</p>
          </div>
          <div className="bg-gradient-to-br from-accent/15 to-accent/30 rounded-2xl p-4 text-center">
            <Star className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-xs font-semibold text-accent">5 Days</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-accent/15 to-accent/25 p-4 text-center opacity-50">
            <Brain className="w-8 h-8 text-accent mx-auto mb-2" />
            <p className="text-xs font-semibold text-accent">10 Games</p>
          </div>
        </div>
      </div>
      
      <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-6 shadow-subtle border border-border/60">
        <h2 className="text-xl font-bold text-ink mb-4">Settings</h2>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-primary/10 rounded-2xl hover:bg-primary/15 transition-colors">
            <span className="font-medium text-ink">Notification Settings</span>
            <ChevronRight className="w-5 h-5 text-ink-muted" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-primary/10 rounded-2xl hover:bg-primary/15 transition-colors">
            <span className="font-medium text-ink">Privacy Controls</span>
            <ChevronRight className="w-5 h-5 text-ink-muted" />
          </button>
          <button 
            className="w-full flex items-center justify-between p-4 bg-primary/10 rounded-2xl hover:bg-primary/15 transition-colors"
            onClick={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: 'knowledge-graph' }))}
          >
            <span className="font-medium text-ink">Memory Connections</span>
            <ChevronRight className="w-5 h-5 text-ink-muted" />
          </button>
          <button
            className="w-full flex items-center justify-between p-4 bg-primary/10 rounded-2xl hover:bg-primary/15 transition-colors"
            onClick={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: 'memory-import' }))}
          >
            <span className="font-medium text-ink">Import Memories</span>
            <ChevronRight className="w-5 h-5 text-ink-muted" />
          </button>
          <button
            className="w-full flex items-center justify-between p-4 bg-primary/10 rounded-2xl hover:bg-primary/15 transition-colors"
            onClick={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: 'data-export-import' }))}
          >
            <span className="font-medium text-ink">Export Memories</span>
            <ChevronRight className="w-5 h-5 text-ink-muted" />
          </button>
          <button
            className="w-full flex items-center justify-between p-4 bg-primary/10 rounded-2xl hover:bg-primary/15 transition-colors"
            onClick={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: 'visual-content' }))}
          >
            <span className="font-medium text-ink">Visual Memories</span>
            <ChevronRight className="w-5 h-5 text-ink-muted" />
          </button>
        </div>
      </div>
    </div>
  );

  if (state.showOnboarding) {
    return (
      <Suspense
        fallback={
          <div className={cn(ui.shell, 'flex min-h-screen items-center justify-center bg-gradient-to-br from-surface to-surface-muted')}>
            <div className={cn(ui.card, 'bg-surface-raised/90 text-center')}>
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-2xl border-4 border-primary/30 border-t-primary"></div>
              <p className={softText}>Preparing your personalized setup…</p>
            </div>
          </div>
        }
      >
        <OnboardingWizard />
      </Suspense>
    );
  }

  return (
    <div className={cn(ui.shell, 'bg-gradient-to-br from-surface to-surface-muted')}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <header className="safe-px sticky top-0 z-50 border-b border-border/60 bg-surface/80 py-4 backdrop-blur-soft">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-soft" aria-hidden="true">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-ink">MemoryKeeper</span>
              <p className="text-xs text-ink-muted">Your Story, Your Legacy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: 'memory-strength-breakdown' }))}
              className={cn(ui.ghostButton, 'h-10 rounded-full border border-border/60 bg-surface-muted/80 px-3 py-2 text-sm font-semibold')}
              aria-label="View memory strength breakdown"
            >
              <SuspendedMemoryStrengthFlower strength={state.memoryStrength} size={30} />
            </button>
            <Suspense
              fallback={<div className="h-8 w-8 animate-pulse rounded-full bg-primary/20" aria-hidden />}
            >
              <SyncStatusIndicator />
            </Suspense>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-md px-gutter pb-32">
        {/* Main Views */}
        <Suspense
          fallback={
            <div className="py-24 text-center text-ink-muted">
              Loading view...
            </div>
          }
        >
          {state.view === 'home' && !state.gameView && !state.detailView && (
            <ErrorBoundary
              fallback={
                <div className="mx-4 my-8 rounded-3xl bg-danger/15 py-12 text-center shadow-soft">
                  <h2 className="text-2xl font-bold text-danger">HomeView Failed to Load</h2>
                  <p className="text-ink-muted">The main interface component encountered an error.</p>
                </div>
              }
            >
              <HomeView
                dailyPrompt={state.dailyPrompt}
                journalInput={state.journalInput}
                setJournalInput={setJournalInput}
                handleAddMemory={handleAddMemory}
                handleVoiceInput={handleVoiceInput}
                isRecording={state.isRecording}
                setGameView={(value) => {
                  const newValue = typeof value === 'function' ? value(state.gameView || null) : value;
                  runTransition(() => {
                    dispatch({ type: 'SET_GAME_VIEW', payload: newValue });
                  });
                }}
                memories={state.memories}
                onUpload={() => setUploadModalOpen(true)}
                streakCount={state.streakCount}
                memoryStrength={state.memoryStrength}
                yesterdayMemory={yesterdayMemory}
                gameSuggestion={currentGameSuggestion}
              />
            </ErrorBoundary>
          )}
          
          {state.view === 'games' && !state.gameView && !state.detailView && (
            <GameSelection 
              onBack={() => runTransition(() => {
                dispatch({ type: 'SET_VIEW', payload: 'home' });
                dispatch({ type: 'SET_GAME_VIEW', payload: null });
              })} 
              onGameSelect={(gameId: string) => {
                runTransition(() => {
                  // Map game IDs to the appropriate game views
                  switch (gameId) {
                    case 'match-up':
                      dispatch({ type: 'SET_GAME_VIEW', payload: 'match' });
                      break;
                    case 'timeline-tango':
                      dispatch({ type: 'SET_GAME_VIEW', payload: 'timeline' });
                      break;
                    case 'echo-echo':
                      dispatch({ type: 'SET_GAME_VIEW', payload: 'echo' });
                      break;
                    case 'story-quiz-quest':
                      dispatch({ type: 'SET_GAME_VIEW', payload: 'quiz-1' });
                      break;
                    default:
                      console.warn('Unknown game ID:', gameId);
                  }
                });
              }} 
            />
          )}
          
          {state.view === 'scrapbook' && !state.detailView && (
            <ScrapbookTimeline onBack={() => runTransition(() => dispatch({ type: 'SET_VIEW', payload: 'home' }))} />
          )}
          
          {state.view === 'profile' && !state.detailView && (
            <UserProfileManager 
              onBack={() => runTransition(() => dispatch({ type: 'SET_VIEW', payload: 'home' }))}
            />
          )}
        </Suspense>
        
        {/* Game Views */}
        <Suspense
          fallback={
            <div className="py-24 text-center text-ink-muted">
              Loading game...
            </div>
          }
        >
          {state.gameView === 'match' && !state.detailView && (
            <MemoryMatchUpGame 
              onBack={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: null }))} 
              memories={state.memories as any} 
              difficulty={getAdaptiveDifficulty()}
            />
          )}
          
          {state.gameView === 'match-1' && !state.detailView && (
            <MemoryMatchup1 
              onBack={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: null }))} 
              onNavigate={(view: string) => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: view }))} 
            />
          )}
          
          {state.gameView === 'match-2' && !state.detailView && (
            <MemoryMatchup2 
              onBack={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: 'match-1' }))} 
              onNavigate={(view: string) => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: view }))} 
            />
          )}
          
          {state.gameView === 'quiz-1' && !state.detailView && (
            <StoryQuizQuest1 
              onBack={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: null }))} 
              onNavigate={(view: string) => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: view }))} 
            />
          )}
          
          {state.gameView === 'quiz-2' && !state.detailView && (
            <StoryQuizQuest2 
              onBack={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: 'quiz-1' }))} 
              onNavigate={(view: string) => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: view }))} 
            />
          )}
          
          {state.gameView === 'snapshot-1' && !state.detailView && (
            <SnapshotSolve1 
              onBack={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: null }))} 
              onNavigate={(view: string) => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: view }))} 
            />
          )}
          
          {state.gameView === 'snapshot-2' && !state.detailView && (
            <SnapshotSolve2 
              onBack={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: 'snapshot-1' }))} 
            />
          )}
          
          {state.gameView === 'timeline' && !state.detailView && (
            <TimelineTango onBack={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: null }))} />
          )}
          
          {state.gameView === 'echo' && !state.detailView && (
            <EchoEcho onBack={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: null }))} />
          )}
          
          {state.gameView === 'link' && !state.detailView && (
            <LegacyLink onBack={() => runTransition(() => dispatch({ type: 'SET_GAME_VIEW', payload: null }))} />
          )}
        </Suspense>
        
        {/* Detail Views with Suspense for lazy loading */}
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-ink-muted">Loading...</p>
            </div>
          </div>
        }>
          {state.detailView === 'ai-studio' && (
            <AiStudio onBack={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: null }))} />
          )}

          {state.detailView === 'collaborative-memory' && (
            <CollaborativeMemory onBack={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: null }))} />
          )}

          {state.detailView === 'invite-collaborate' && (
            <InviteCollaborate onBack={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: null }))} />
          )}

          {state.detailView === 'collaborative-collections' && (
            <CollaborativeCollections onBack={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: null }))} />
          )}

          {state.detailView === 'premium-features' && (
            <PremiumFeaturesDetails onBack={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: null }))} />
          )}

          {state.detailView === 'proactive-prompt' && (
            <ProactiveMemoryPrompt onBack={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: null }))} />
          )}

          {state.detailView === 'profile-setup' && (
            <ProfileSetup onBack={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: null }))} />
          )}

          {state.detailView === 'quick-tutorial' && (
            <QuickTutorial onBack={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: null }))} />
          )}

          {state.detailView === 'view-progress-settings' && (
            <ViewProgressAndSettings onBack={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: null }))} />
          )}

          {state.detailView === 'knowledge-graph' && (
            <KnowledgeGraphView onBack={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: null }))} />
          )}

          {state.detailView === 'visual-content' && (
            <VisualContentGenerator onBack={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: null }))} />
          )}

          {state.detailView === 'data-export-import' && (
            <DataExportImport />
          )}

          {state.detailView === 'memory-import' && (
            <MemoryImport />
          )}

          {state.detailView === 'memory-strength-breakdown' && (
            <MemoryStrengthBreakdown />
          )}
        </Suspense>
        
        {state.view === 'scrapbook' && !state.detailView && (
          <ScrapbookTimeline onBack={() => runTransition(() => dispatch({ type: 'SET_VIEW', payload: 'home' }))} />
        )}
      </main>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-surface-raised p-6 shadow-ring">
            <button
              onClick={() => {
                setUploadModalOpen(false);
                setUploadCaption('');
              }}
              className="absolute right-4 top-4 rounded-full border border-border/60 p-2 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
              aria-label="Close upload dialog"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-ink mb-2">Upload a memory</h2>
            <p className="text-sm text-ink-muted mb-4">
              Add a photo or document to capture a special moment. We'll save it alongside your journal.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-ink mb-1" htmlFor="upload-caption">
                Caption (Optional)
              </label>
              <textarea
                id="upload-caption"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-surface-raised p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15"
                rows={2}
                placeholder="Add a short caption to describe this memory..."
              />
            </div>
            
            <FileUpload
              onFileProcessed={handleFileProcessed}
              acceptedTypes={['image/*', '.pdf', '.txt']}
              maxFileSize={20}
              multiple={false}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      {!state.detailView && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-surface/90 backdrop-blur-soft shadow-ring" aria-label="Main navigation">
          <div className="max-w-md mx-auto flex justify-around py-3 px-2">
            <NavButton
              icon={Home}
              label="Home"
              active={state.view === 'home'}
              onClick={() =>
                runTransition(() => {
                  dispatch({ type: 'SET_VIEW', payload: 'home' });
                  dispatch({ type: 'SET_GAME_VIEW', payload: null });
                })
              }
            />
            <NavButton
              icon={Gamepad2}
              label="Games"
              active={state.view === 'games'}
              onClick={() =>
                runTransition(() => {
                  dispatch({ type: 'SET_VIEW', payload: 'games' });
                  dispatch({ type: 'SET_GAME_VIEW', payload: null });
                })
              }
            />
            <NavButton
              icon={BookOpen}
              label="Memories"
              active={state.view === 'scrapbook'}
              onClick={() =>
                runTransition(() => {
                  dispatch({ type: 'SET_VIEW', payload: 'scrapbook' });
                  dispatch({ type: 'SET_GAME_VIEW', payload: null });
                })
              }
            />
            <NavButton
              icon={User}
              label="Profile"
              active={state.view === 'profile'}
              onClick={() =>
                runTransition(() => {
                  dispatch({ type: 'SET_VIEW', payload: 'profile' });
                  dispatch({ type: 'SET_GAME_VIEW', payload: null });
                })
              }
            />
          </div>
        </nav>
      )}
      
      {/* Back Button for Detail Views */}
      {state.detailView && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border/60 bg-surface/90 backdrop-blur-soft shadow-ring">
          <div className="max-w-md mx-auto py-3 px-4">
            <button
              onClick={() => runTransition(() => dispatch({ type: 'SET_DETAIL_VIEW', payload: null }))}
              className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-semibold shadow-subtle hover:shadow-soft transition-all flex items-center justify-center gap-2"
              aria-label="Go back"
            >
              <ChevronRight className="w-5 h-5 rotate-180" aria-hidden="true" />
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );

};

export default memo(MemoryKeeperMain);
