import React, { memo, useState, useEffect } from 'react';
import { ChevronRight, RotateCcw, Trophy, Target, Zap, Bot, CheckCircle, X, Clock, ChevronLeft, Volume2, Lock, Star } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useAppState } from '../lib/AppStateContext';
import { useAdaptiveAgent } from '../hooks/useAdaptiveAgent';
import { addMemory, updateMemoryStrength } from '../lib/dataService';
import AdaptiveAgentDisplay from './AdaptiveAgentDisplay';

interface MemoryCard {
  id: number;
  word: string;
  image: string;
  audio?: string; // Added audio property for premium feature
  isPremium?: boolean; // Added to identify premium cards
}

interface MemoryMatchup1Props {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

const MemoryMatchup1: React.FC<MemoryMatchup1Props> = ({ onBack, onNavigate }) => {
  const { user, profile } = useAuth();
  const { state } = useAppState();
  const currentMemory = state.memories[0]; // Get most recent memory
  const difficulty = 'medium'; // Default difficulty

  // Check if user has premium features (simplified approach for now)
  // In a real implementation, this would check subscription status
  const isPremiumUser = profile ? true : false; // For demo purposes, assume all authenticated users have premium

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'success' | 'failed'>('ready');
  const [timeLeft, setTimeLeft] = useState(100); // percentage for progress bar
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set()); // cards that are flipped
  const [matchedCards, setMatchedCards] = useState<Set<number>>(new Set()); // matched pairs
  const [mismatchCards, setMismatchCards] = useState<Set<number>>(new Set()); // cards with mismatch animation
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [audioPlaying, setAudioPlaying] = useState<number | null>(null); // Track which card's audio is playing

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
    gameId: 'memory-matchup-1',
    difficulty,
    currentMemory
  });

  // Enhanced cards with user's actual memories
  const baseCards: MemoryCard[] = (() => {
    // If user has premium features and memories with media, use those
    if (isPremiumUser && state.memories.length > 0) {
      // Filter memories with media content
      const mediaMemories = state.memories.filter(memory => {
        try {
          const response = JSON.parse(memory.response);
          return response.mediaType === 'image' || response.mediaType === 'video';
        } catch {
          return false;
        }
      });
      
      // Use user's media if available, otherwise fallback to default
      if (mediaMemories.length > 0) {
        return mediaMemories.slice(0, 3).map((memory, index) => {
          try {
            const response = JSON.parse(memory.response);
            return {
              id: index,
              word: response.caption || `Memory ${index + 1}`,
              image: response.preview || 'https://placehold.co/300x300/FFA500/FFFFFF?text=Memory',
              isPremium: true
            };
          } catch {
            return {
              id: index,
              word: `Memory ${index + 1}`,
              image: 'https://placehold.co/300x300/FFA500/FFFFFF?text=Memory',
              isPremium: true
            };
          }
        });
      }
    }
    
    // Default cards for non-premium users or when no media available
    return [
      {
        id: 0,
        word: 'Family',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUaWsiKv02tYSin77lYxrXoTZjxcGjRHbAVPmn0QMlstnatKrbd3DEw20cg_5dZtUulHp5IMAR0u7tKNuJbPijANt9aZszzFzXjSB0iOlPhh3B_Lr0OjMzH4IZdjpVv9mTv-Z6ssaSqAhjjXDH3nanuOAHRP7l4aRvR5wRPvu5DwsIuGeuucyilR33L17a0dScMZYdIbgOZyNPuTA15Lt-GSAGf6JiuTMTtJHi1pld0BzOqPsjFEz0iYbePCHNwjTNfkC07B7gIQw',
        isPremium: false
      },
      {
        id: 1,
        word: 'Joy',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDulxaiopxVIgV472gcdR09Tw9bD4UlMjSia1ZiuWEHSqmeBBiThlmDGbjsW9_G9aAdpa3RE6XQM-SHn63MqmBVI_RVwRNHglpZ6pOPlN0wfnW1jX5QFSt7_h54LPdWTj28uwMMNCKDHt_8B5sjotIHkFHosol16ecRQ6Vh6p3S4rL17IhW7d1hGgCu4kPl8kUyuLEgxmRNFp_soDVVPZzyMcZmNTmV9EHYcc10rX-G91GzxDHAAWEGLOnj_uvpXz5PVf6lUdGlUgc',
        isPremium: false
      },
      {
        id: 2,
        word: 'Home',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB19zwxfoOPthsaPBcAeQ6eJkkPiIAylokRTpufXp6r-4wYeErA1UICX1Nejhe294or8QBUuo_1DgoaRL23w998kvlTT1qmrCrmbrpF7f3Z00XCHwClHiOu-5wgH2_fPmTVZe48H6FalZakdIlrkbzU5nFBkicJtl3DCQuMSeQKxapT5VCRKflSZhTuBeDXJ61eXzldQBPVwcL8-0A3mPG_STd-KspeYGjvmQYKsg6jWNdDysHUYVQ7lksUTfqmoINzzW6Vnqwa45k',
        isPremium: false
      }
    ];
  })();

  // Create paired cards dynamically
  const cards: MemoryCard[] = baseCards.flatMap(card => [
    { ...card, id: card.id * 2 },
    { ...card, id: card.id * 2 + 1 }
  ]);

  // Timer effect
  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0) {
          setGameState('failed');
          setMistakes(prev => prev + 1);
          setStreak(0);
          setFeedbackMessage('Time\'s up! Try again.');
          setShowFeedback(true);
          showAgent();
          // Record failure
          recordGameCompletion(false, Date.now());
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState, timeLeft, recordGameCompletion, showAgent]);

  // Clear mismatch animation after animation completes
  useEffect(() => {
    if (mismatchCards.size > 0) {
      const timer = setTimeout(() => {
        setMismatchCards(new Set());
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [mismatchCards]);

  // Update agent with game progress
  useEffect(() => {
    if (gameState === 'playing') {
      updateGameProgress(attempts, mistakes, streak, timeLeft);
    }
  }, [attempts, mistakes, streak, timeLeft, gameState, updateGameProgress]);

  const handleCardClick = (cardId: number) => {
    if (gameState !== 'playing' || matchedCards.has(cardId) || flippedCards.has(cardId)) return;

    const newFlipped = new Set(flippedCards);
    newFlipped.add(cardId);
    setFlippedCards(newFlipped);
    setAttempts(prev => prev + 1);

    // Check for matches if two cards are flipped
    if (newFlipped.size === 2) {
      const flippedArray = Array.from(newFlipped);
      const card1 = cards.find(c => c.id === flippedArray[0]);
      const card2 = cards.find(c => c.id === flippedArray[1]);

      if (card1 && card2 && card1.word === card2.word) {
        // Match found
        setMatchedCards(new Set([...matchedCards, ...newFlipped]));
        setFlippedCards(new Set());
        setStreak(prev => prev + 1);

        // Calculate score based on time and attempts
        const timeBonus = Math.floor(timeLeft / 10);
        const attemptPenalty = Math.max(0, attempts - 6) * 2; // Penalty for too many attempts
        const matchScore = 20 + timeBonus - attemptPenalty;
        setScore(prev => prev + Math.max(5, matchScore)); // Minimum 5 points per match

        // Check if game is complete
        const newMatchedCards = new Set([...matchedCards, ...newFlipped]);
        if (newMatchedCards.size === cards.length) {
          setGameState('success');
          setFeedbackMessage('Perfect! You matched all the pairs!');
          setShowFeedback(true);
          showAgent();

          // Record success and update memory strength
          recordGameCompletion(true, Date.now());
          if (user?.id) {
            updateMemoryStrength(user.id, score + streak * 5);
          }

          setTimeout(() => {
            onNavigate('memory-matchup-2');
          }, 3000);
        }
      } else {
        // No match - show mismatch animation
        setMismatchCards(new Set(flippedArray));
        setMistakes(prev => prev + 1);
        setStreak(0);
        setFeedbackMessage('Not a match. Try again!');
        setShowFeedback(true);

        // Flip cards back after animation
        setTimeout(() => {
          setFlippedCards(new Set());
          setShowFeedback(false);
        }, 800);
      }
    }
  };

  // Play audio hint for a card
  const playAudioHint = (cardId: number) => {
    if (!isPremiumUser) {
      // Show premium feature message
      setFeedbackMessage('Audio hints are a premium feature. Upgrade to unlock!');
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 3000);
      return;
    }
    
    const card = cards.find(c => c.id === cardId);
    if (card?.audio) {
      setAudioPlaying(cardId);
      // In a real implementation, we would play the actual audio
      // For now, we'll just simulate it
      setTimeout(() => setAudioPlaying(null), 2000);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setAttempts(0);
    setMistakes(0);
    setStreak(0);
    setTimeLeft(100);
    setFlippedCards(new Set());
    setMatchedCards(new Set());
    setMismatchCards(new Set());
    setShowFeedback(false);
  };

  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setAttempts(0);
    setMistakes(0);
    setStreak(0);
    setTimeLeft(100);
    setFlippedCards(new Set());
    setMatchedCards(new Set());
    setMismatchCards(new Set());
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
          <span className="text-xs font-bold text-gray-800">Attempts</span>
        </div>
        <span className="text-sm font-bold text-gray-800">{attempts}</span>
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-orange-100">
        <div className="flex items-center gap-1 mb-1">
          <Clock className="w-3 h-3 text-orange-500" />
          <span className="text-xs font-bold text-gray-800">Time</span>
        </div>
        <span className="text-sm font-bold text-gray-800">{Math.floor(timeLeft / 10)}s</span>
      </div>
    </div>
  );

  return (
    <div className="pt-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Memory Match-Up</h1>
        {isPremiumUser ? (
          <div className="ml-auto flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            <Star className="w-4 h-4" />
            Premium
          </div>
        ) : (
          <button 
            className="ml-auto flex items-center gap-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold"
            onClick={() => onNavigate('premium-features')}
          >
            <Lock className="w-4 h-4" />
            Upgrade
          </button>
        )}
      </div>

      <GameStats />

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-6 mb-6">
        <div className="mb-6">
          <p className="text-sm font-medium mb-2 text-gray-700">Time Remaining</p>
          <div className="bg-orange-200 h-2.5 rounded-full">
            <div
              className="bg-gradient-to-r from-orange-400 to-rose-500 h-2.5 rounded-full transition-all duration-100"
              style={{ width: `${timeLeft}%` }}
            ></div>
          </div>
        </div>

        {gameState === 'ready' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Match Your Memory Pairs!</h2>
            <p className="text-gray-600 mb-6">
              {isPremiumUser 
                ? "Find matching pairs using your own memories!" 
                : "Find matching word-image pairs to strengthen your memory."}
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Start Matching
            </button>
            
            {!isPremiumUser && (
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-purple-800">Premium Features Available</h3>
                </div>
                <p className="text-sm text-purple-700 mb-3">
                  Upgrade to use your own photos and audio hints in the game!
                </p>
                <button 
                  className="text-sm font-bold text-purple-600 hover:text-purple-800"
                  onClick={() => onNavigate('premium-features')}
                >
                  Learn More →
                </button>
              </div>
            )}
          </div>
        )}

        {(gameState === 'playing' || gameState === 'success' || gameState === 'failed') && (
          <>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
              {isPremiumUser ? "Match Your Memories!" : "Find the Matching Pairs!"}
            </h2>

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
                  ) : (
                    <X className="w-6 h-6 text-orange-600" />
                  )}
                  <span className={
                    gameState === 'success' ? 'text-green-800' :
                    gameState === 'failed' ? 'text-red-800' : 'text-orange-800'
                  }>
                    {feedbackMessage}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className={`card aspect-square cursor-pointer rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 ${
                    gameState === 'playing' ? 'hover:scale-105' : ''
                  } ${
                    flippedCards.has(card.id) ? 'ring-4 ring-blue-400' : ''
                  } ${
                    matchedCards.has(card.id) ? 'ring-4 ring-green-500' : ''
                  } ${
                    mismatchCards.has(card.id) ? 'ring-4 ring-red-500 animate-pulse' : ''
                  } ${
                    gameState !== 'playing' ? 'cursor-not-allowed opacity-75' : ''
                  }`}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div className="card-inner w-full h-full relative">
                    <div className={`card-front absolute inset-0 w-full h-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center ${
                      flippedCards.has(card.id) || matchedCards.has(card.id) ? 'hidden' : ''
                    }`}>
                      <div className="flex flex-col items-center">
                        <span className="text-4xl text-white">?</span>
                        {isPremiumUser && card.isPremium && (
                          <span className="text-xs text-orange-100 mt-1">Your Memory</span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`card-back absolute inset-0 w-full h-full bg-cover bg-center ${
                        flippedCards.has(card.id) || matchedCards.has(card.id) ? '' : 'hidden'
                      }`}
                      style={{ backgroundImage: `url('${card.image}')` }}
                    >
                      <div className="w-full h-full bg-black/30 flex flex-col items-end p-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudioHint(card.id);
                          }}
                          className={`p-1 rounded-full ${
                            audioPlaying === card.id 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white/30 text-white hover:bg-white/50'
                          }`}
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <p className="font-bold text-white text-lg drop-shadow-lg mt-auto">{card.word}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Indicator */}
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-600 mb-2">
                Matched Pairs: {matchedCards.size / 2} / {cards.length / 2}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(matchedCards.size / cards.length) * 100}%` }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Reset Button */}
      <div className="text-center mb-6">
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
        >
          Reset Game
        </button>
      </div>

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

export default memo(MemoryMatchup1);