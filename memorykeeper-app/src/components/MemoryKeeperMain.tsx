import React, { useState, useEffect, useCallback, useMemo, memo, lazy, Suspense } from 'react';
import { Mic, Home, Gamepad2, BookOpen, User, Zap, Plus, Share2, Heart, Sparkles, ChevronRight, X, Award, Trophy, Star, Brain } from 'lucide-react';
import { useAppState } from '../lib/AppStateContext';
import { useAuth } from '../lib/AuthContext';
import { useError } from '../lib/ErrorContext';
import { cn } from '../lib/designSystem';
import { startSpeechRecognition, isSpeechRecognitionSupported } from '../lib/speechService';
import enhancedSpeechService from '../lib/enhancedSpeechService';
import { sanitizeTextInput } from '../lib/inputSanitizer';
import { supabase } from '../lib/supabaseClient';

// Lazy load components
const MemoryMatchUpGame = lazy(() => import('./MemoryMatchUpGame'));
const StoryQuizQuest1 = lazy(() => import('./StoryQuizQuest1'));
const GameSelection = lazy(() => import('./GameSelection'));
const FileUpload = lazy(() => import('./FileUpload'));
const OnboardingWizard = lazy(() => import('./OnboardingWizard'));
const TimelineTango = lazy(() => import('./TimelineTango'));

// Import types
type ProcessedFileData = any; // Will be properly imported from FileUpload interface

const MemoryKeeperMain: React.FC = () => {
  const { state, dispatch } = useAppState();
  const { user, profile } = useAuth();
  const { addToast, handleError } = useError();
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');

  // Initialize daily prompt
  useEffect(() => {
    if (!state.dailyPrompt) {
      const prompts = [
        "What did your childhood kitchen smell like?",
        "Describe your first bicycle ride",
        "Who was your favorite teacher and why?",
        "What was your wedding day like?",
        "Tell me about your first job"
      ];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      dispatch({ type: 'SET_DAILY_PROMPT', payload: randomPrompt });
    }
  }, [state.dailyPrompt, dispatch]);

  const handleAddMemory = useCallback(async (journalInput?: string) => {
    const inputToUse = journalInput !== undefined ? journalInput : state.journalInput;
    const sanitizedInput = sanitizeTextInput(inputToUse);

    if (!sanitizedInput.trim()) return;

    const words = sanitizedInput.toLowerCase().split(' ');
    const rawTags = words.filter(w => w.length > 4).slice(0, 3);

    const newMemory = {
      id: Date.now().toString(),
      prompt: state.dailyPrompt,
      response: sanitizedInput,
      date: new Date().toISOString(),
      type: 'text' as const,
      tags: rawTags,
    };

    dispatch({ type: 'ADD_MEMORY', payload: newMemory });
    updateStreakWithEntry(new Date(newMemory.date));

    // Show success toast
    addToast({
      type: 'success',
      title: 'Memory Saved',
      message: 'Your memory has been saved!',
      duration: 4000
    });
  }, [state.journalInput, state.dailyPrompt, dispatch, addToast]);

  const updateStreakWithEntry = useCallback((entryDate: Date) => {
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
  }, [dispatch, state.lastEntryDate, state.streakCount]);

  const handleVoiceInput = async () => {
    if (!isSpeechRecognitionSupported()) {
      handleError(null, 'Voice input is not supported in your browser.');
      return;
    }

    try {
      const stopListening = await enhancedSpeechService.startEnhancedSpeechRecognition(
        (result) => {
          dispatch({ type: 'SET_SPEECH_TRANSCRIPT', payload: result.transcript });
          dispatch({ type: 'SET_JOURNAL_INPUT', payload: result.transcript });
        },
        (error) => {
          console.error('Speech recognition error:', error);
          dispatch({ type: 'SET_IS_RECORDING', payload: false });
          handleError(error, 'Error with voice input.');
        },
        () => {
          dispatch({ type: 'SET_IS_RECORDING', payload: false });
        },
        {
          lang: navigator.language || 'en-US',
          continuous: true,
          interimResults: true
        }
      );

      dispatch({ type: 'SET_IS_RECORDING', payload: true });

      setTimeout(() => {
        if (enhancedSpeechService.isCurrentlyRecording()) {
          stopListening();
          dispatch({ type: 'SET_IS_RECORDING', payload: false });
        }
      }, 30000);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      dispatch({ type: 'SET_IS_RECORDING', payload: false });
      handleError(error, 'Error starting voice recording.');
    }
  };

  const yesterdayMemory = useMemo(() => {
    const yesterdayString = new Date(Date.now() - 86400000).toDateString();
    return state.memories.find(memory =>
      new Date(memory.date).toDateString() === yesterdayString
    );
  }, [state.memories]);

  const NavButton = useCallback(({ icon: Icon, label, active, onClick }: {
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
        active ? 'text-primary bg-primary/10' : 'text-ink-muted hover:text-ink'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  ), []);

  const HomeView = memo(() => {
    const todayLabel = useMemo(() => new Date().toLocaleDateString(), []);

    return (
      <div className="space-y-8 pt-6">
        {/* Daily Prompt Card */}
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-surface-muted backdrop-blur-soft rounded-3xl p-6 shadow-soft border border-border/60">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink">Daily Prompt</h2>
              <p className="text-lg text-ink-muted">Today's memory challenge</p>
            </div>
          </div>

          <p className="text-2xl font-bold text-ink mb-6">{state.dailyPrompt}</p>

          <div className="space-y-5">
            <textarea
              value={state.journalInput}
              onChange={(e) => dispatch({ type: 'SET_JOURNAL_INPUT', payload: e.target.value })}
              placeholder="Write your memory here..."
              className="w-full h-36 rounded-2xl border border-border/60 bg-primary/10 p-5 text-lg outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={handleVoiceInput}
                className={`flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl py-4 transition-all ${
                  state.isRecording ? 'bg-danger text-white' : 'bg-primary/15 text-primary hover:bg-primary/20'
                }`}
              >
                <Mic className="w-6 h-6" />
                <span className="text-lg font-bold">{state.isRecording ? 'Listening...' : 'Voice'}</span>
              </button>

              <button
                onClick={() => {
                  handleAddMemory(state.journalInput);
                  dispatch({ type: 'SET_JOURNAL_INPUT', payload: '' });
                }}
                disabled={!state.journalInput.trim()}
                className="flex-1 flex flex-col items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-2xl hover:shadow-subtle disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Plus className="w-6 h-6" />
                <span className="text-lg font-bold">Add Memory</span>
              </button>

              <button
                onClick={() => setUploadModalOpen(true)}
                className="flex-1 flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/60 bg-surface-raised py-4 text-primary transition-all hover:bg-primary/10"
              >
                <span className="text-2xl">📷</span>
                <span className="text-lg font-bold">Upload</span>
              </button>
            </div>
          </div>
        </div>

        {/* Streak Display */}
        <div className="flex items-center justify-between">
          <div className="text-right">
            <p className="text-lg text-ink-muted">{todayLabel}</p>
            <p className="text-xl font-bold text-primary">🔥 {state.streakCount} day streak</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(236,149,19,0.15)" strokeWidth="10"></circle>
              <circle
                cx="50" cy="50" r="45" fill="none" stroke="rgb(var(--mk-color-primary))"
                strokeWidth="10" strokeDasharray={`${283 * (state.memoryStrength / 100)} 283`}
                transform="rotate(-90 50 50)" strokeLinecap="round"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Yesterday's Memory */}
        {yesterdayMemory && (
          <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-6 shadow-subtle border border-border/60">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-ink">Yesterday's Joy</h2>
            </div>
            <p className="text-sm text-ink-muted mb-2">{yesterdayMemory.prompt}</p>
            <p className="text-ink line-clamp-3">{yesterdayMemory.response}</p>
          </div>
        )}

        {/* Recent Memories */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ink">Recent Memories</h2>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'scrapbook' })}
              className="text-primary hover:text-primary font-medium flex items-center gap-1"
            >
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {state.memories.slice(0, 2).map((memory) => (
              <div key={memory.id} className="bg-surface/90 backdrop-blur-soft rounded-3xl p-5 shadow-subtle border border-border/60">
                <p className="font-semibold text-ink mb-2 line-clamp-2">{memory.response}</p>
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

            {state.memories.length === 0 && (
              <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-8 text-center shadow-subtle border border-border/60">
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-3" />
                <p className="text-ink-muted">No memories yet. Start by adding your first memory!</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Games */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-ink">Brain Games</h2>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'games' })}
              className="text-primary hover:text-primary font-medium flex items-center gap-1"
            >
              See All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => dispatch({ type: 'SET_GAME_VIEW', payload: 'match' })}
              className="bg-gradient-to-br from-accent to-primary rounded-2xl p-4 text-white text-center shadow-subtle transition-all hover:shadow-soft"
            >
              <div className="text-3xl mb-2">🎴</div>
              <p className="font-bold text-sm">Match</p>
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_GAME_VIEW', payload: 'quiz-1' })}
              className="bg-gradient-to-br from-primary to-accent rounded-2xl p-4 text-white text-center shadow-subtle transition-all hover:shadow-soft"
            >
              <div className="text-3xl mb-2">❓</div>
              <p className="font-bold text-sm">Quiz</p>
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_GAME_VIEW', payload: 'timeline' })}
              className="bg-gradient-to-br from-success to-primary rounded-2xl p-4 text-white text-center shadow-subtle transition-all hover:shadow-soft"
            >
              <div className="text-3xl mb-2">📅</div>
              <p className="font-bold text-sm">Timeline</p>
            </button>
          </div>
        </div>
      </div>
    );
  });

  if (state.showOnboarding) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div>Loading...</div></div>}>
        <OnboardingWizard />
      </Suspense>
    );
  }

  return (
    <div className={cn('bg-gradient-to-br from-surface to-surface-muted')}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <header className="safe-px sticky top-0 z-50 border-b border-border/60 bg-surface/80 py-4 backdrop-blur-soft">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-white shadow-soft">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-ink">MemoryKeeper</span>
              <p className="text-xs text-ink-muted">Your Story, Your Legacy</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-md px-gutter pb-32">
        {state.view === 'home' && !state.gameView && (
          <HomeView />
        )}

        {state.view === 'games' && !state.gameView && (
          <Suspense fallback={<div>Loading games...</div>}>
            <GameSelection
              onBack={() => dispatch({ type: 'SET_VIEW', payload: 'home' })}
              onGameSelect={(gameId) => {
                switch (gameId) {
                  case 'memory-match-up':
                    dispatch({ type: 'SET_GAME_VIEW', payload: 'match' });
                    break;
                  case 'story-quiz-quest':
                    dispatch({ type: 'SET_GAME_VIEW', payload: 'quiz-1' });
                    break;
                  case 'timeline-tango':
                    dispatch({ type: 'SET_GAME_VIEW', payload: 'timeline' });
                    break;
                  default:
                    console.log('Game selected:', gameId);
                }
              }}
            />
          </Suspense>
        )}

        {state.view === 'scrapbook' && (
          <div className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-ink">Memory Scrapbook</h1>
            </div>

            {state.memories.length === 0 ? (
              <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-8 text-center shadow-subtle border border-border/60">
                <BookOpen className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold text-ink mb-2">No Memories Yet</h2>
                <p className="text-ink-muted mb-6">Start capturing your precious moments!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.memories.map((memory) => (
                  <div key={memory.id} className="bg-surface/90 backdrop-blur-soft rounded-3xl p-6 shadow-subtle border border-border/60">
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
                ))}
              </div>
            )}
          </div>
        )}

        {state.view === 'profile' && (
          <div className="pt-6 space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center text-4xl text-white shadow-subtle">
                {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h1 className="text-2xl font-bold text-ink">{profile?.full_name || 'User'}</h1>
              <p className="text-ink-muted">Memory Keeper</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-4 text-center shadow-subtle border border-border/60">
                <p className="text-2xl font-bold text-ink">{state.memories.length}</p>
                <p className="text-sm text-ink-muted">Memories</p>
              </div>
              <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-4 text-center shadow-subtle border border-border/60">
                <p className="text-2xl font-bold text-ink">{state.memoryStrength}%</p>
                <p className="text-sm text-ink-muted">Strength</p>
              </div>
              <div className="bg-surface/90 backdrop-blur-soft rounded-3xl p-4 text-center shadow-subtle border border-border/60">
                <p className="text-2xl font-bold text-ink">{state.streakCount}</p>
                <p className="text-sm text-ink-muted">Streak</p>
              </div>
            </div>
          </div>
        )}

        {/* Game Views */}
        <Suspense fallback={<div className="py-24 text-center">Loading game...</div>}>
          {state.gameView === 'match' && (
            <MemoryMatchUpGame
              onBack={() => dispatch({ type: 'SET_GAME_VIEW', payload: null })}
              memories={state.memories}
              difficulty="medium"
            />
          )}

          {state.gameView === 'quiz-1' && (
            <StoryQuizQuest1
              onBack={() => dispatch({ type: 'SET_GAME_VIEW', payload: null })}
              onNavigate={(view) => dispatch({ type: 'SET_GAME_VIEW', payload: view })}
            />
          )}

          {state.gameView === 'timeline' && (
            <TimelineTango
              onBack={() => dispatch({ type: 'SET_GAME_VIEW', payload: null })}
            />
          )}

          {state.gameView && !['match', 'quiz-1', 'timeline'].includes(state.gameView) && (
            <div className="pt-6 bg-surface/90 backdrop-blur-soft rounded-3xl p-8 shadow-soft border border-border/60 min-h-96 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-ink mb-2">Game Coming Soon</h2>
                <p className="text-ink-muted mb-6">This game is under development.</p>
                <button
                  onClick={() => dispatch({ type: 'SET_GAME_VIEW', payload: null })}
                  className="py-3 px-6 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-semibold"
                >
                  Back to Games
                </button>
              </div>
            </div>
          )}
        </Suspense>
      </main>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-lg rounded-3xl bg-surface-raised p-6 shadow-ring">
            <button
              onClick={() => {
                setUploadModalOpen(false);
                setUploadCaption('');
              }}
              className="absolute right-4 top-4 rounded-full border border-border/60 p-2 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-ink mb-2">Upload a memory</h2>
            <p className="text-sm text-ink-muted mb-4">Add a photo to capture a special moment.</p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-ink mb-1">Caption (Optional)</label>
              <textarea
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                className="w-full rounded-2xl border border-border/60 bg-surface-raised p-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/15"
                rows={2}
                placeholder="Add a short caption..."
              />
            </div>

            <Suspense fallback={<div>Loading upload...</div>}>
              <FileUpload
                onFileProcessed={(fileData: ProcessedFileData) => {
                  console.log('File processed:', fileData);
                  setUploadModalOpen(false);
                }}
                acceptedTypes={['image/*', '.pdf', '.txt']}
                maxFileSize={20}
                multiple={false}
              />
            </Suspense>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-surface/90 backdrop-blur-soft shadow-ring">
        <div className="max-w-md mx-auto flex justify-around py-3 px-2">
          <NavButton
            icon={Home}
            label="Home"
            active={state.view === 'home'}
            onClick={() => {
              dispatch({ type: 'SET_VIEW', payload: 'home' });
              dispatch({ type: 'SET_GAME_VIEW', payload: null });
            }}
          />
          <NavButton
            icon={Gamepad2}
            label="Games"
            active={state.view === 'games'}
            onClick={() => {
              dispatch({ type: 'SET_VIEW', payload: 'games' });
              dispatch({ type: 'SET_GAME_VIEW', payload: null });
            }}
          />
          <NavButton
            icon={BookOpen}
            label="Memories"
            active={state.view === 'scrapbook'}
            onClick={() => {
              dispatch({ type: 'SET_VIEW', payload: 'scrapbook' });
              dispatch({ type: 'SET_GAME_VIEW', payload: null });
            }}
          />
          <NavButton
            icon={User}
            label="Profile"
            active={state.view === 'profile'}
            onClick={() => {
              dispatch({ type: 'SET_VIEW', payload: 'profile' });
              dispatch({ type: 'SET_GAME_VIEW', payload: null });
            }}
          />
        </div>
      </nav>
    </div>
  );
};

export default memo(MemoryKeeperMain);
