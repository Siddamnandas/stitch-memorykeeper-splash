import { useState, useEffect, useCallback, useMemo, useRef, type FC } from 'react';
import { ChevronLeft, Calendar, Clock, Trophy, Target, RotateCcw, ArrowUp, ArrowDown, CheckCircle, X } from 'lucide-react';
import { useAdaptiveAgent } from '../hooks/useAdaptiveAgent';
import { useAuth } from '../lib/AuthContext';
import { useAppState } from '../lib/AppStateContext';
import { addMemory, updateMemoryStrength } from '../lib/dataService';
import AdaptiveAgentDisplay from './AdaptiveAgentDisplay';

interface TimelineTangoProps {
  onBack: () => void;
}

interface TimelineEvent {
  id: string;
  year: number;
  title: string;
  description: string;
  image: string;
  category: 'personal' | 'family' | 'career' | 'milestone';
}

const TimelineTango: FC<TimelineTangoProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { state } = useAppState();
  const currentMemory = state.memories[0]; // Get most recent memory
  const difficulty = 'medium'; // Default difficulty

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'sorting' | 'success' | 'failed'>('ready');
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [scrambledEvents, setScrambledEvents] = useState<TimelineEvent[]>([]);
  const [sortedEvents, setSortedEvents] = useState<TimelineEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes for sorting
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [moves, setMoves] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Adaptive agent integration
  const {
    agentDecision,
    isVisible: agentVisible,
    showAgent,
    hideAgent,
    requestHint,
    updateGameProgress,
    recordGameCompletion
  } = useAdaptiveAgent({
    userId: user?.id || 'guest',
    gameId: 'timeline-tango',
    difficulty,
    currentMemory
  });

  // Generate timeline events based on level
  const generateTimelineEvents = useCallback(() => {
    const baseEvents: TimelineEvent[] = [
      {
        id: 'graduation',
        year: 1985,
        title: 'High School Graduation',
        description: 'Completed high school education',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUaWsiKv02tYSin77lYxrXoTZjxcGjRHbAVPmn0QMlstnatKrbd3DEw20cg_5dZtUulHp5IMAR0u7tKNuJbPijANt9aZszzFzXjSB0iOlPhh3B_Lr0OjMzH4IZdjpVv9mTv-Z6ssaSqAhjjXDH3nanuOAHRP7l4aRvR5wRPvu5DwsIuGeuucyilR33L17a0dScMZYdIbgOZyNPuTA15Lt-GSAGf6JiuTMTtJHi1pld0BzOqPsjFEz0iYbePCHNwjTNfkC07B7gIQw',
        category: 'milestone'
      },
      {
        id: 'wedding',
        year: 1992,
        title: 'Wedding Day',
        description: 'Married the love of my life',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDulxaiopxVIgV472gcdR09Tw9bD4UlMjSia1ZiuWEHSqmeBBiThlmDGbjsW9_G9aAdpa3RE6XQM-SHn63MqmBVI_RVwRNHglpZ6pOPlN0wfnW1jX5QFSt7_h54LPdWTj28uwMMNCKDHt_8B5sjotIHkFHosol16ecRQ6Vh6p3S4rL17IhW7d1hGgCu4kPl8kUyuLEgxmRNFp_soDVVPZzyMcZmNTmV9EHYcc10rX-G91GzxDHAAWEGLOnj_uvpXz5PVf6lUdGlUgc',
        category: 'personal'
      },
      {
        id: 'first-child',
        year: 1995,
        title: 'First Child Born',
        description: 'Welcomed our first baby into the world',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB19zwxfoOPthsaPBcAeQ6eJkkPiIAylokRTpufXp6r-4wYeErA1UICX1Nejhe294or8QBUuo_1DgoaRL23w998kvlTT1qmrCrmbrpF7f3Z00XCHwClHiOu-5wgH2_fPmTVZe48H6FalZakdIlrkbzU5nFBkicJtl3DCQuMSeQKxapT5VCRKflSZhTuBeDXJ61eXzldQBPVwcL8-0A3mPG_STd-KspeYGjvmQYKsg6jWNdDysHUYVQ7lksUTfqmoINzzW6Vnqwa45k',
        category: 'family'
      },
      {
        id: 'career-change',
        year: 2002,
        title: 'Career Change',
        description: 'Started a new career path',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW5uq67oHgV0c-nVdjpjZFzCjmUPPNM_dv5IaKQ0Wb-b8aA6PdCQYteswBTcrV82m_v_q3bteVPp3ivnNczSesi30vaAeaHIyhe8SLSwQ6X91AQvMgNPUM1pDlLbedg3eI7zUzjZPMSWE7otFI8LCUN73c3GkqsMzj_-hxarueKAnapzveHWmcrAtLh9ZTRuuuVtzVyCIbzhFo6lnw8yOuA_1if5ogjYCCcO2Rt3T6s89eKS83pjl4b993Mr3OhGYu4OT2M9GF67g',
        category: 'career'
      },
      {
        id: 'retirement',
        year: 2018,
        title: 'Retirement',
        description: 'Retired after 35 years of dedicated service',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb6xiq3VcsWTuZSsFt0dxNnZH0RLQgqo9r9WJwIGXxR7g8KOY-vWGreLg7YrHApB3lY-Xsn3EHHzc2ars73kaPyQ7ttjHPGcoDKnr8mZDZTAksddDZk808_RasLIMIqqEK270yNmQLlD_LD_AxuLGeJx4B5cf4pSWQPrObG_mDs4REvURinbTx5W_e7oIO9PlXqwuMY0osNfgjAWvVgmQ2huHPZPA2dRfgR4q-v_OSoQlSdOsSF8e58f-6DNKaB45kFH3mTjnMyzU',
        category: 'milestone'
      }
    ];

    // Select events based on level (more events for higher levels)
    const eventsCount = Math.min(3 + level, baseEvents.length);
    const selectedEvents = baseEvents.slice(0, eventsCount);

    setEvents(selectedEvents);
    setScrambledEvents([...selectedEvents].sort(() => Math.random() - 0.5));
    setSortedEvents([]);
  }, [level]);

  // Timer effect
  useEffect(() => {
    if (gameState !== 'sorting' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('failed');
          setMistakes(prev => prev + 1);
          setFeedbackMessage('Time\'s up! The timeline faded away.');
          setShowFeedback(true);
          showAgent();
          recordGameCompletion(false, Date.now());
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, recordGameCompletion, showAgent]);

  // Update agent with game progress
  useEffect(() => {
    if (gameState === 'sorting') {
      updateGameProgress(moves, mistakes, sortedEvents.length, timeLeft);
    }
  }, [moves, mistakes, sortedEvents.length, timeLeft, gameState, updateGameProgress]);

  // Check if timeline is correctly sorted
  const checkTimelineOrder = useCallback(() => {
    if (sortedEvents.length !== events.length) return false;

    for (let i = 0; i < sortedEvents.length - 1; i++) {
      if (sortedEvents[i].year > sortedEvents[i + 1].year) {
        return false;
      }
    }
    return true;
  }, [sortedEvents, events]);

  // Move event up or down in the sorted list
  const moveEvent = (eventId: string, direction: 'up' | 'down') => {
    if (gameState !== 'sorting') return;

    const eventIndex = sortedEvents.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return;

    const newSorted = [...sortedEvents];
    const targetIndex = direction === 'up' ? eventIndex - 1 : eventIndex + 1;

    if (targetIndex >= 0 && targetIndex < newSorted.length) {
      [newSorted[eventIndex], newSorted[targetIndex]] = [newSorted[targetIndex], newSorted[eventIndex]];
      setSortedEvents(newSorted);
      setMoves(prev => prev + 1);
    }
  };

  // Add event to sorted timeline
  const addEventToTimeline = (eventId: string) => {
    if (gameState !== 'sorting') return;

    const event = scrambledEvents.find(e => e.id === eventId);
    if (!event) return;

    setScrambledEvents(prev => prev.filter(e => e.id !== eventId));
    setSortedEvents(prev => [...prev, event]);
    setMoves(prev => prev + 1);
  };

  // Submit timeline for checking
  const submitTimeline = () => {
    const isCorrect = checkTimelineOrder();
    setShowFeedback(true);

    if (isCorrect) {
      setGameState('success');
      const timeBonus = Math.floor(timeLeft / 10);
      const efficiencyBonus = Math.max(0, events.length * 10 - moves);
      const finalScore = events.length * 20 + timeBonus + efficiencyBonus;
      setScore(prev => prev + finalScore);
      setFeedbackMessage(`Perfect! You arranged the timeline correctly! +${finalScore} points`);

      // Update memory strength and record success
      recordGameCompletion(true, Date.now());
      if (user?.id) {
        updateMemoryStrength(user.id, score + finalScore);
      }

      setTimeout(() => {
        onBack(); // Return to main menu for now
      }, 3000);
    } else {
      setMistakes(prev => prev + 1);
      setFeedbackMessage('Not quite right. Check the chronological order again.');
      setTimeout(() => setShowFeedback(false), 2000);
    }
  };

  // Start game
  const startGame = () => {
    setGameState('sorting');
    setTimeLeft(180);
    setScore(0);
    setMoves(0);
    setMistakes(0);
    generateTimelineEvents();
  };

  // Reset game
  const resetGame = () => {
    setGameState('ready');
    setTimeLeft(180);
    setScore(0);
    setMoves(0);
    setMistakes(0);
    setScrambledEvents([]);
    setSortedEvents([]);
    setSelectedEvent(null);
    setShowFeedback(false);
    hideAgent();
  };

  // Game Stats Component
  const GameStats = () => (
    <div className="grid grid-cols-4 gap-2 mb-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-orange-100">
        <div className="flex items-center gap-1 mb-1">
          <Trophy className="w-3 h-3 text-yellow-500" />
          <span className="text-xs font-bold text-gray-800">Score</span>
        </div>
        <span className="text-sm font-bold text-gray-800">{score}</span>
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-orange-100">
        <div className="flex items-center gap-1 mb-1">
          <Target className="w-3 h-3 text-blue-500" />
          <span className="text-xs font-bold text-gray-800">Level</span>
        </div>
        <span className="text-sm font-bold text-gray-800">{level}</span>
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-orange-100">
        <div className="flex items-center gap-1 mb-1">
          <RotateCcw className="w-3 h-3 text-green-500" />
          <span className="text-xs font-bold text-gray-800">Moves</span>
        </div>
        <span className="text-sm font-bold text-gray-800">{moves}</span>
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-orange-100">
        <div className="flex items-center gap-1 mb-1">
          <Clock className="w-3 h-3 text-orange-500" />
          <span className="text-xs font-bold text-gray-800">Time</span>
        </div>
        <span className="text-sm font-bold text-gray-800">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen justify-between bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 font-display">
      <main className="flex-grow">
        <header className="flex items-center p-4">
          <button
            className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100"
            onClick={onBack}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-center flex-1 pr-10 text-gray-800">Timeline Tango</h1>
        </header>
        <GameStats />
        <div className="px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Arrange the Timeline</h2>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-6 mb-6">
              {gameState === 'ready' && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Calendar className="w-8 h-8 text-orange-500" />
                    <span className="text-lg text-gray-600">Organize life events in chronological order</span>
                  </div>
                  <button
                    onClick={startGame}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Start Timeline
                  </button>
                </div>
              )}

              {(gameState === 'sorting' || gameState === 'success' || gameState === 'failed') && (
                <div>
                  {/* Scrambled Events Pool */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3 text-gray-800">Available Events:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {scrambledEvents.map((event) => (
                        <div
                          key={event.id}
                          className="bg-orange-50 border-2 border-orange-200 rounded-xl p-3 cursor-pointer hover:bg-orange-100 transition-colors"
                          onClick={() => addEventToTimeline(event.id)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-orange-500" />
                            <span className="font-bold text-gray-800">{event.year}</span>
                          </div>
                          <h4 className="font-medium text-gray-700 mb-1">{event.title}</h4>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sorted Timeline */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3 text-gray-800">Your Timeline:</h3>
                    <div className="space-y-3">
                      {sortedEvents.map((event, index) => (
                        <div
                          key={event.id}
                          className={`bg-white border-2 rounded-xl p-4 shadow-sm ${
                            selectedEvent === event.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                          }`}
                          onClick={() => setSelectedEvent(event.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-bold text-gray-800">{event.year} - {event.title}</div>
                                <div className="text-sm text-gray-600">{event.description}</div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveEvent(event.id, 'up');
                                }}
                                disabled={index === 0}
                                className="p-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveEvent(event.id, 'down');
                                }}
                                disabled={index === sortedEvents.length - 1}
                                className="p-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="mb-6">
                    <div className="text-sm text-gray-600 mb-2">
                      Events Organized: {sortedEvents.length} / {events.length}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-rose-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(sortedEvents.length / events.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {showFeedback && (
                    <div className={`mb-4 p-4 rounded-2xl text-center ${
                      gameState === 'success' ? 'bg-green-100' : gameState === 'failed' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <div className="flex items-center justify-center gap-2">
                        {gameState === 'success' ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : gameState === 'failed' ? (
                          <X className="w-6 h-6 text-red-600" />
                        ) : null}
                        <span className={
                          gameState === 'success' ? 'text-green-800' :
                          gameState === 'failed' ? 'text-red-800' : 'text-orange-800'
                        }>
                          {feedbackMessage}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="text-center">
                    <button
                      onClick={submitTimeline}
                      disabled={sortedEvents.length !== events.length || gameState !== 'sorting'}
                      className={`px-8 py-3 font-bold rounded-2xl shadow-lg transition-all ${
                        sortedEvents.length === events.length && gameState === 'sorting'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Check Timeline Order
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Reset Button */}
            <div className="text-center">
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
              >
                Reset Game
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Adaptive Agent Display */}
      {agentDecision && (
        <AdaptiveAgentDisplay
          hint={agentDecision.hint}
          scaffolding={agentDecision.scaffolding}
          agentMessage={agentDecision.agentMessage}
          agentType={agentDecision.agentType}
          isVisible={agentVisible}
          onDismiss={hideAgent}
          onRequestHint={requestHint}
        />
      )}
    </div>
  );
};

export default TimelineTango;
