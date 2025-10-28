import React from 'react';
import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';

import { ChevronRight, RotateCcw, Volume2, Clock, Zap, Bot, Lock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addActivityAndRecalculate } from '../lib/memoryStrengthService';
import { getDifficultySettings } from '../lib/difficultyService';
import { useAdaptiveAgent } from '../hooks/useAdaptiveAgent';
import AdaptiveAgentDisplay from './AdaptiveAgentDisplay';
import { Memory } from '../lib/dataService';

const MemoryMatchUpGame = ({ onBack, memories = [], difficulty = 'medium' }: { onBack: () => void; memories: Memory[]; difficulty?: 'easy' | 'medium' | 'hard' }) => {
  const navigate = useNavigate();
  
  // Get the first memory for context (in a real app, this would be more sophisticated)
  const currentMemory = memories && memories.length > 0 ? memories[0] : undefined;
  
  // Initialize adaptive agent
  const {
    agentDecision,
    isVisible,
    showAgent,
    hideAgent,
    requestHint,
    updateGameProgress,
    recordGameCompletion
  } = useAdaptiveAgent({
    userId: 'user123', // In a real app, this would come from auth context
    gameId: 'memory-match',
    difficulty,
    currentMemory
  });

  // For demo purposes, assume all users have premium
  const isPremiumUser = true;

  // Extract words from memories or use default words if no memories
  const getWordPairs = useCallback(() => {
    // Get difficulty settings
    const settings = getDifficultySettings(difficulty, 'memory-match');
    
    if (memories && memories.length > 0) {
      // Get recent memories (based on difficulty)
      const recentMemories = memories.slice(0, Math.min(3, Math.ceil(settings.memoryWords / 2)));
      
      // Extract words from memories
      const words: string[] = [];
      recentMemories.forEach(memory => {
        const memoryWords = memory.response
          .toLowerCase()
          .split(' ')
          .filter((word: string) => word.length > 3)
          .slice(0, Math.ceil(settings.memoryWords / recentMemories.length));
        words.push(...memoryWords);
      });
      
      // Create pairs from words
      const uniqueWords = [...new Set(words)].slice(0, settings.memoryWords); // Get words based on difficulty
      const pairs: { id: number; word: string; matched: boolean; audio?: string; isPremium?: boolean }[] = [];
      
      // Create pairs based on difficulty
      const pairsToCreate = Math.min(settings.pairs, uniqueWords.length);
      for (let i = 0; i < pairsToCreate; i++) {
        pairs.push({ 
          id: i * 2, 
          word: uniqueWords[i], 
          matched: false,
          isPremium: true // Mark as premium content
        });
        pairs.push({ 
          id: i * 2 + 1, 
          word: uniqueWords[i], 
          matched: false,
          isPremium: true // Mark as premium content
        });
      }
      
      return pairs;
    } else {
      // Default words if no memories
      const defaultWords = ['memory', 'story', 'time', 'family', 'love', 'home', 'photo', 'music'];
      const pairs: { id: number; word: string; matched: boolean; audio?: string; isPremium?: boolean }[] = [];
      
      // Create pairs based on difficulty
      const pairsToCreate = Math.min(settings.pairs, defaultWords.length);
      for (let i = 0; i < pairsToCreate; i++) {
        pairs.push({ 
          id: i * 2, 
          word: defaultWords[i], 
          matched: false,
          isPremium: false // Default content is not premium
        });
        pairs.push({ 
          id: i * 2 + 1, 
          word: defaultWords[i], 
          matched: false,
          isPremium: false // Default content is not premium
        });
      }
      
      return pairs;
    }
  }, [memories, difficulty]);

  const [cards, setCards] = useState<{ id: number; word: string; flipped: boolean; matched: boolean; audio?: string; isPremium?: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<{ id: number; word: string; flipped: boolean; matched: boolean; audio?: string; isPremium?: boolean }[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [hintWord, setHintWord] = useState('');
  const [winningWord, setWinningWord] = useState('');
  const [mismatches, setMismatches] = useState(0); // Track mismatches for hint frequency
  const [timeLimit, setTimeLimit] = useState<number | null>(null); // Time limit based on difficulty
  const [hintFrequency, setHintFrequency] = useState(3); // Hint frequency based on difficulty
  const [audioPlaying, setAudioPlaying] = useState<number | null>(null); // Track which card's audio is playing

  const resetGame = useCallback(() => {
    const wordPairs = getWordPairs();
    
    // Get difficulty settings
    const settings = getDifficultySettings(difficulty, 'memory-match');
    
    // Shuffle cards
    const shuffled = [...wordPairs]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        ...card,
        id: index,
        flipped: false,
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimer(0);
    setMismatches(0);
    setTimeLimit(settings.timeLimit);
    setHintFrequency(settings.hintFrequency);
    setIsRunning(true);
    setGameOver(false);
    setShowHint(false);
    setHintWord('');
  }, [getWordPairs, difficulty]);

  // Initialize game
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && !gameOver) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else if (gameOver && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, gameOver]);

  // Update adaptive agent with game progress
  useEffect(() => {
    updateGameProgress(moves, mismatches, matchedPairs, timer);
  }, [moves, mismatches, matchedPairs, timer, updateGameProgress]);

  // Check for time limit exceeded
  useEffect(() => {
    if (timeLimit && timer >= timeLimit && isRunning) {
      setIsRunning(false);
      setGameOver(true);
      // In a real implementation, we would handle time limit exceeded
    }
  }, [timer, timeLimit, isRunning]);

  // Check for game completion
  useEffect(() => {
    const wordPairs = getWordPairs();
    if (matchedPairs === wordPairs.length / 2 && wordPairs.length > 0) {
      setIsRunning(false);
      setGameOver(true);
      // Set the last matched word for win animation
      if (flippedCards.length >= 2) {
        setWinningWord(flippedCards[0].word);
      }
      
      // Record game completion with adaptive agent
      recordGameCompletion(true, timer);
      
      // Update memory strength when game is completed
      const updateMemoryStrength = async () => {
        try {
          // Calculate points based on performance and difficulty
          const basePoints = difficulty === 'hard' ? 30 : difficulty === 'medium' ? 20 : 15;
          const timeBonus = Math.max(0, 100 - timer); // Bonus for faster completion
          const moveBonus = Math.max(0, 50 - moves); // Bonus for fewer moves
          
          // Difficulty multiplier
          const difficultyMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1;
          const totalPoints = Math.round((basePoints + timeBonus + moveBonus) * difficultyMultiplier);
          
          await addActivityAndRecalculate('user123', {
            type: 'game_completed',
            timestamp: new Date(),
            value: totalPoints
          });
        } catch (error) {
          console.error('Error updating memory strength:', error);
        }
      };
      
      updateMemoryStrength();
    }
  }, [matchedPairs, getWordPairs, flippedCards, timer, moves, recordGameCompletion]);

  const handleCardClick = (clickedCard: { id: number; word: string; flipped: boolean; matched: boolean; audio?: string; isPremium?: boolean }) => {
    // Don't process if card is already flipped or matched
    if (clickedCard.flipped || clickedCard.matched || flippedCards.length === 2) {
      return;
    }

    // Flip the card
    const updatedCards = cards.map(card =>
      card.id === clickedCard.id ? { ...card, flipped: true } : card
    );
    
    setCards(updatedCards);
    
    // Add to flipped cards
    const newFlippedCards = [...flippedCards, clickedCard];
    setFlippedCards(newFlippedCards);

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      const [firstCard, secondCard] = newFlippedCards;
      
      if (firstCard.word === secondCard.word) {
        // Match found
        setTimeout(() => {
          const matchedCards = updatedCards.map(card =>
            card.word === firstCard.word ? { ...card, matched: true } : card
          );
          setCards(matchedCards);
          setMatchedPairs(matchedPairs + 1);
          setFlippedCards([]);
          setShowHint(false);
        }, 500);
      } else {
        // No match, handle based on hint frequency
        setMismatches(mismatches + 1);
        
        setTimeout(() => {
          const resetCards = updatedCards.map(card =>
            card.id === firstCard.id || card.id === secondCard.id
              ? { ...card, flipped: false }
              : card
          );
          setCards(resetCards);
          setFlippedCards([]);
          
          // Show hint based on hint frequency setting
          if ((mismatches + 1) % hintFrequency === 0) {
            // Show hint for mismatched cards
            setHintWord(firstCard.word);
            setShowHint(true);
            setTimeout(() => setShowHint(false), 3000);
          }
        }, 1000);
      }
    }
  };

  // Play audio hint for a card
  const playAudioHint = (cardId: number) => {
    if (!isPremiumUser) {
      // In a real implementation, we would show a message about premium features
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

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/games');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.6;
      speechSynthesis.speak(utterance);
    }
  };

  const getPerformanceMessage = (): string => {
    const wordPairs = getWordPairs();
    const totalPairs = wordPairs.length / 2;
    
    // Calculate efficiency metrics
    const movesEfficiency = moves / totalPairs;
    const timePerPair = timer / totalPairs;
    
    // Generate message based on difficulty and performance
    if (difficulty === 'hard') {
      if (movesEfficiency <= 1.5 && timePerPair <= 15) {
        return 'Exceptional performance! You mastered this advanced level with precision.';
      } else if (movesEfficiency <= 2.5 && timePerPair <= 30) {
        return 'Great job! You handled the advanced level well.';
      } else {
        return 'Good effort! Keep practicing to improve your skills at this level.';
      }
    } else if (difficulty === 'medium') {
      if (movesEfficiency <= 1.8 && timePerPair <= 20) {
        return 'Excellent work! You\'ve got a strong grasp of this intermediate level.';
      } else if (movesEfficiency <= 3 && timePerPair <= 40) {
        return 'Nice job! You completed the intermediate level successfully.';
      } else {
        return 'Good attempt! With more practice, you\'ll master this level.';
      }
    } else {
      // Easy level
      if (movesEfficiency <= 2 && timePerPair <= 25) {
        return 'Well done! You completed the beginner level with ease.';
      } else if (movesEfficiency <= 3.5 && timePerPair <= 50) {
        return 'Good job! You successfully completed the beginner level.';
      } else {
        return 'Nice try! Keep practicing to improve your memory matching skills.';
      }
    }
  };

  // Determine grid classes based on screen size
  const gridClasses = "grid gap-4 mb-6";
  const cardClasses = "aspect-square rounded-2xl flex items-center justify-center text-lg font-bold cursor-pointer transition-all duration-300 transform hover:scale-105 p-2 text-center";
  
  // Get difficulty-based grid columns
  const getGridColumns = () => {
    const wordPairs = getWordPairs();
    const totalCards = wordPairs.length;
    
    if (totalCards <= 8) return "grid-cols-4"; // 2x4 grid for easy
    if (totalCards <= 12) return "grid-cols-4 sm:grid-cols-6"; // 2x6 grid for medium
    return "grid-cols-4 sm:grid-cols-8"; // 2x8 grid for hard
  };

  return (
    <div className="pt-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={handleBack}
          className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100"
        >
          <ChevronRight className="w-6 h-6 rotate-180 text-gray-700" />
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
            onClick={() => navigate('/premium-features')}
          >
            <Lock className="w-4 h-4" />
            Upgrade
          </button>
        )}
      </div>

      {/* Shuffle Animation Header */}
      <div className="text-center mb-6 animate-bounce">
        <h2 className="text-xl font-bold text-orange-600">
          {isPremiumUser ? "Match Your Memories!" : "Match Your Story Words!"}
        </h2>
      </div>

      {!gameOver ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
          {/* Game stats */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <div className="bg-orange-100 px-3 py-2 rounded-xl">
                <p className="text-sm text-orange-800">Moves: {moves}</p>
              </div>
              <div className="bg-amber-100 px-3 py-2 rounded-xl">
                <p className="text-sm text-amber-800">Level: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
              </div>
            </div>
            <div className="bg-rose-100 px-4 py-2 rounded-xl">
              <p className="text-sm text-rose-800">Time: {formatTime(timer)}</p>
              {timeLimit && (
                <p className="text-xs text-rose-600">Limit: {formatTime(timeLimit)}</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-orange-400 to-rose-500 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${(matchedPairs / (cards.length / 2)) * 100 || 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Progress</span>
              <span>{matchedPairs} / {cards.length / 2} pairs</span>
            </div>
          </div>

          {/* Hint bubble */}
          {showHint && (
            <div className="mb-4 flex items-center justify-center">
              <div className="bg-blue-100 rounded-2xl p-3 relative">
                <div className="absolute -top-2 left-6 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-blue-100"></div>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-800 font-medium">Hint: "{hintWord}"</span>
                </div>
              </div>
            </div>
          )}

          {/* Adaptive Agent Display */}
          {agentDecision && (
            <AdaptiveAgentDisplay
              hint={agentDecision.hint}
              scaffolding={agentDecision.scaffolding}
              agentMessage={agentDecision.agentMessage}
              agentType={agentDecision.agentType}
              isVisible={isVisible}
              onDismiss={hideAgent}
              onRequestHint={requestHint}
            />
          )}

          {/* Game board - adaptive grid based on difficulty */}
          <div className={`${gridClasses} ${getGridColumns()}`}>
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`${cardClasses} ${
                  card.flipped || card.matched
                    ? 'bg-white shadow-lg'
                    : 'bg-gradient-to-br from-orange-400 to-rose-400 shadow-lg'
                } ${card.matched ? 'ring-4 ring-green-400' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <span>{card.flipped || card.matched ? card.word : '?'}</span>
                  {isPremiumUser && card.isPremium && (
                    <span className="text-xs text-orange-700 mt-1">Your Memory</span>
                  )}
                  {card.flipped || card.matched ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudioHint(card.id);
                      }}
                      className={`mt-2 p-1 rounded-full ${
                        audioPlaying === card.id 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white/30 text-white hover:bg-white/50'
                      }`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {/* Reset button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={resetGame}
              className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Reset Game
            </button>
          </div>
        </div>
      ) : (
        // Game over screen with animation burst
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-orange-100 min-h-96 flex flex-col items-center justify-center">
          {/* Adaptive Agent Display */}
          {agentDecision && (
            <AdaptiveAgentDisplay
              hint={agentDecision.hint}
              scaffolding={agentDecision.scaffolding}
              agentMessage={agentDecision.agentMessage}
              agentType={agentDecision.agentType}
              isVisible={isVisible}
              onDismiss={hideAgent}
              onRequestHint={requestHint}
            />
          )}
          
          <div className="text-center">
            {/* Animation burst */}
            <div className="relative mb-6">
              <div className="text-6xl animate-ping absolute inset-0 m-auto">🎉</div>
              <div className="text-6xl relative">🎊</div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
            <p className="text-gray-600 mb-2">You've matched all pairs!</p>
            
            {/* Quote replay */}
            <div className="bg-orange-50 rounded-2xl p-4 my-6">
              <p className="text-orange-800 font-medium mb-2">"'{winningWord}' replayed"</p>
              <button 
                onClick={() => speakWord(winningWord)}
                className="flex items-center justify-center gap-2 py-2 px-4 bg-orange-500 text-white rounded-xl mx-auto"
              >
                <Volume2 className="w-5 h-5" />
                Replay Word
              </button>
            </div>
            
            <div className="bg-orange-50 rounded-2xl p-4 my-6">
              <div className="flex justify-around">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{moves}</p>
                  <p className="text-sm text-gray-600">Moves</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-rose-600">{formatTime(timer)}</p>
                  <p className="text-sm text-gray-600">Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
                  <p className="text-sm text-gray-600">Level</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 my-6 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-gray-800">Performance Analysis</h3>
              </div>
              <p className="text-gray-600 text-sm">
                {getPerformanceMessage()}
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={resetGame}
                className="py-3 px-6 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Play Again
              </button>
              <button
                onClick={handleBack}
                className="py-3 px-6 bg-white border border-orange-200 text-orange-600 rounded-2xl font-semibold shadow-lg hover:bg-orange-50 transition-all"
              >
                Back to Games
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryMatchUpGame;