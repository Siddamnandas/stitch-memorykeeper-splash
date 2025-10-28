import * as React from 'react';
import { ChevronLeft, RotateCw, Trophy, Target, CheckCircle, X, Clock, Camera, Shuffle, Eye, Zap } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useAppState } from '../lib/AppStateContext';
import { useAdaptiveAgent } from '../hooks/useAdaptiveAgent';
import { updateMemoryStrength } from '../lib/dataService';
import AdaptiveAgentDisplay from './AdaptiveAgentDisplay';
import { useState, useEffect, useCallback } from 'react';

interface PuzzlePiece {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isPlaced: boolean;
  correctX: number;
  correctY: number;
}

interface DifferenceSpot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isFound: boolean;
}

interface SnapshotSolve1Props {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

const SnapshotSolve1: React.FC<SnapshotSolve1Props> = ({ onBack, onNavigate }) => {
  const { user } = useAuth();
  const { state } = useAppState();
  const currentMemory = state.memories[0]; // Get most recent memory
  const difficulty = state.memoryStrength < 40 ? 'easy' : 
                    state.memoryStrength < 70 ? 'medium' : 'hard';

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'success' | 'failed'>('ready');
  const [gameMode, setGameMode] = useState<'jigsaw' | 'spot-differences'>('jigsaw');
  const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([]);
  const [differences, setDifferences] = useState<DifferenceSpot[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
  const [placedPieces, setPlacedPieces] = useState<string[]>([]);
  const [foundDifferences, setFoundDifferences] = useState<string[]>([]);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per level
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [hintUsed, setHintUsed] = useState(false);

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
    gameId: 'snapshot-solve-1',
    difficulty,
    currentMemory
  });

  // Set game mode based on memory strength (adaptation logic from PRD)
  useEffect(() => {
    if (state.memoryStrength < 40) {
      setGameMode('jigsaw');
    } else if (state.memoryStrength < 70) {
      setGameMode('jigsaw');
    } else {
      // For advanced users, alternate between modes
      setGameMode(level % 2 === 0 ? 'spot-differences' : 'jigsaw');
    }
  }, [state.memoryStrength, level]);

  // Original image and puzzle configuration
  const originalImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuBUaWsiKv02tYSin77lYxrXoTZjxcGjRHbAVPmn0QMlstnatKrbd3DEw20cg_5dZtUulHp5IMAR0u7tKNuJbPijANt9aZszzFzXjSB0iOlPhh3B_Lr0OjMzH4IZdjpVv9mTv-Z6ssaSqAhjjXDH3nanuOAHRP7l4aRvR5wRPvu5DwsIuGeuucyilR33L17a0dScMZYdIbgOZyNPuTA15Lt-GSAGf6JiuTMTtJHi1pld0BzOqPsjFEz0iYbePCHNwjTNfkC07B7gIQw";

  // Generate puzzle pieces based on difficulty and level
  const generatePuzzlePieces = useCallback(() => {
    // Determine pieces count based on difficulty (from PRD)
    let piecesCount;
    if (state.memoryStrength < 40) {
      piecesCount = 9; // Easy: 9 pieces
    } else if (state.memoryStrength < 70) {
      piecesCount = 16; // Medium: 16 pieces
    } else {
      piecesCount = 25; // Hard: 25 pieces
    }
    
    const pieces: PuzzlePiece[] = [];
    const gridSize = Math.sqrt(piecesCount);
    const pieceSize = 240 / gridSize; // Size of each piece in pixels

    for (let i = 0; i < piecesCount; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;

      pieces.push({
        id: `piece-${i}`,
        x: Math.random() * 200 + 50, // Random position for scrambled pieces
        y: Math.random() * 200 + 100,
        width: pieceSize,
        height: pieceSize,
        isPlaced: false,
        correctX: col * pieceSize,
        correctY: row * pieceSize
      });
    }

    setPuzzlePieces(pieces);
    
    // Set time based on difficulty
    const time = state.memoryStrength < 40 ? 180 : 
                state.memoryStrength < 70 ? 150 : 120;
    setTimeLeft(time);
  }, [state.memoryStrength]);

  // Generate differences for spot-the-difference mode
  const generateDifferences = useCallback(() => {
    const differences: DifferenceSpot[] = [];
    const differenceCount = 5; // Always 5 differences per PRD

    for (let i = 0; i < differenceCount; i++) {
      differences.push({
        id: `diff-${i}`,
        x: Math.random() * 200 + 20, // Random position
        y: Math.random() * 120 + 20,
        width: 30 + Math.random() * 20, // Random size
        height: 30 + Math.random() * 20,
        isFound: false
      });
    }

    setDifferences(differences);
    
    // Set time based on difficulty
    const time = state.memoryStrength < 40 ? 180 : 
                state.memoryStrength < 70 ? 150 : 120;
    setTimeLeft(time);
  }, [state.memoryStrength]);

  // Check if a piece is placed correctly
  const checkPiecePlacement = useCallback((pieceId: string, x: number, y: number): boolean => {
    const piece = puzzlePieces.find(p => p.id === pieceId);
    if (!piece) return false;

    const tolerance = 20; // Allow some tolerance for placement
    return Math.abs(x - piece.correctX) < tolerance && Math.abs(y - piece.correctY) < tolerance;
  }, [puzzlePieces]);

  // Handle piece drag start
  const handleDragStart = (pieceId: string) => {
    setDraggedPiece(pieceId);
  };

  // Handle piece drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPiece) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 40; // Center the piece
    const y = e.clientY - rect.top - 40;

    const isCorrect = checkPiecePlacement(draggedPiece, x, y);

    setPuzzlePieces(prev => prev.map(piece => {
      if (piece.id === draggedPiece) {
        return {
          ...piece,
          x: isCorrect ? piece.correctX : x,
          y: isCorrect ? piece.correctY : y,
          isPlaced: isCorrect
        };
      }
      return piece;
    }));

    if (isCorrect) {
      setPlacedPieces(prev => [...prev, draggedPiece]);

      // Award points for correct placement
      const points = 10;
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);

      // Check if puzzle is complete
      const newPlacedPieces = [...placedPieces, draggedPiece];
      if (newPlacedPieces.length === puzzlePieces.length) {
        setGameState('success');
        setShowFeedback(true);
        setFeedbackMessage(`Great job! You reconstructed the memory with ${mistakes} mistakes.`);
        showAgent();

        // Record success
        recordGameCompletion(true, (120 - timeLeft));

        // Update memory strength
        if (user?.id) {
          updateMemoryStrength(user.id, score + streak * 8);
        }

        setTimeout(() => {
          onNavigate('snapshot-2');
        }, 3000);
      }
    } else {
      setMistakes(prev => prev + 1);
      setStreak(0);
    }

    setDraggedPiece(null);
  };

  // Handle difference click (spot-the-difference mode)
  const handleDifferenceClick = (differenceId: string) => {
    if (gameMode !== 'spot-differences') return;
    
    setDifferences(prev => prev.map(diff => {
      if (diff.id === differenceId && !diff.isFound) {
        const newFound = [...foundDifferences, differenceId];
        setFoundDifferences(newFound);
        
        // Award points for finding difference
        const points = 5;
        setScore(prev => prev + points);
        setStreak(prev => prev + 1);
        
        // Check if all differences found
        if (newFound.length === differences.length) {
          setGameState('success');
          setShowFeedback(true);
          setFeedbackMessage(`Excellent! You found all ${differences.length} differences with ${mistakes} mistakes.`);
          showAgent();

          // Record success
          recordGameCompletion(true, (120 - timeLeft));

          // Update memory strength
          if (user?.id) {
            updateMemoryStrength(user.id, score + streak * 5);
          }

          setTimeout(() => {
            onNavigate('snapshot-2');
          }, 3000);
        }
        
        return { ...diff, isFound: true };
      }
      return diff;
    }));
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('failed');
      setMistakes(prev => prev + 1);
      setStreak(0);
      setFeedbackMessage('Time\'s up! The memory faded away.');
      setShowFeedback(true);
      showAgent();
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft, recordGameCompletion, score, streak, user?.id, updateMemoryStrength, showAgent]);

  // Update agent with game progress
  useEffect(() => {
    if (gameState === 'playing') {
      const progress = gameMode === 'jigsaw' 
        ? placedPieces.length 
        : foundDifferences.length;
      updateGameProgress(progress, mistakes, streak, timeLeft);
    }
  }, [placedPieces.length, foundDifferences.length, mistakes, streak, timeLeft, gameState, updateGameProgress, gameMode]);

  // Start new game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setMistakes(0);
    setStreak(0);
    setPlacedPieces([]);
    setFoundDifferences([]);
    setTimeLeft(120);
    setHintUsed(false);
    
    if (gameMode === 'jigsaw') {
      generatePuzzlePieces();
    } else {
      generateDifferences();
    }
  };

  // Reset game
  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setLevel(1);
    setTimeLeft(120);
    setMistakes(0);
    setStreak(0);
    setPlacedPieces([]);
    setFoundDifferences([]);
    setPuzzlePieces([]);
    setDifferences([]);
    setShowFeedback(false);
    setHintUsed(false);
    hideAgent();
  };

  // Use hint
  const useHint = () => {
    setHintUsed(true);
    requestHint();
    
    if (gameMode === 'jigsaw') {
      // Highlight a random unplaced piece
      const unplacedPieces = puzzlePieces.filter(piece => !piece.isPlaced);
      if (unplacedPieces.length > 0) {
        const randomPiece = unplacedPieces[Math.floor(Math.random() * unplacedPieces.length)];
        // In a real implementation, we would visually highlight this piece
      }
    } else {
      // Highlight a random unfound difference
      const unfoundDifferences = differences.filter(diff => !diff.isFound);
      if (unfoundDifferences.length > 0) {
        const randomDiff = unfoundDifferences[Math.floor(Math.random() * unfoundDifferences.length)];
        // In a real implementation, we would visually highlight this difference
      }
    }
  };

  // Initialize game on start
  useEffect(() => {
    if (gameState === 'playing') {
      if (gameMode === 'jigsaw' && puzzlePieces.length === 0) {
        generatePuzzlePieces();
      } else if (gameMode === 'spot-differences' && differences.length === 0) {
        generateDifferences();
      }
    }
  }, [gameState, gameMode, puzzlePieces.length, differences.length, generatePuzzlePieces, generateDifferences]);

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
          <h1 className="text-xl font-bold text-center flex-1 pr-10 text-gray-800">Snapshot Solve</h1>
        </header>

        {/* Game Stats */}
        <div className="px-4 mb-4">
          <div className="grid grid-cols-4 gap-2">
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
                <RotateCw className="w-3 h-3 text-green-500" />
                <span className="text-xs font-bold text-gray-800">Streak</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{streak}</span>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-orange-100">
              <div className="flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-bold text-gray-800">Time</span>
              </div>
              <span className="text-sm font-bold text-gray-800">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Mode Indicator */}
        <div className="px-4 mb-4">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-orange-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-gray-800">
                  {gameMode === 'jigsaw' ? 'Jigsaw Mode' : 'Spot Differences Mode'}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {gameMode === 'jigsaw' 
                  ? state.memoryStrength < 40 ? '9 pieces' : 
                    state.memoryStrength < 70 ? '16 pieces' : '25 pieces'
                  : 'Find 5 differences'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              {gameMode === 'jigsaw' 
                ? 'Reconstruct the Memory' 
                : 'Find the Differences'}
            </h2>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-4 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="w-6 h-6 text-orange-500" />
                <span className="text-sm text-gray-600">
                  {gameMode === 'jigsaw' 
                    ? 'Drag pieces to reconstruct this special family moment' 
                    : 'Find 5 differences between these two images'}
                </span>
              </div>

              {gameState === 'ready' && (
                <div className="text-center py-8">
                  <button
                    onClick={startGame}
                    className="px-8 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
                  >
                    <Shuffle className="w-5 h-5" />
                    Start {gameMode === 'jigsaw' ? 'Puzzle' : 'Challenge'}
                  </button>
                </div>
              )}

              {(gameState === 'playing' || gameState === 'success' || gameState === 'failed') && (
                <div className="relative">
                  {/* Game Canvas */}
                  <div
                    className="relative bg-gray-100 rounded-2xl mx-auto mb-4 border-2 border-dashed border-gray-300"
                    style={{ width: 240, height: 160 }}
                    onDrop={gameMode === 'jigsaw' ? handleDrop : undefined}
                    onDragOver={gameMode === 'jigsaw' ? handleDragOver : undefined}
                  >
                    {/* Reference image */}
                    <div className="absolute inset-0">
                      <img
                        src={originalImage}
                        alt="Memory reference"
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </div>

                    {/* Jigsaw Mode: Placed pieces */}
                    {gameMode === 'jigsaw' && puzzlePieces.filter(piece => piece.isPlaced).map(piece => (
                      <div
                        key={piece.id}
                        className="absolute border-2 border-green-400 rounded"
                        style={{
                          left: piece.x,
                          top: piece.y,
                          width: piece.width,
                          height: piece.height,
                          backgroundImage: `url(${originalImage})`,
                          backgroundPosition: `-${piece.correctX}px -${piece.correctY}px`,
                          backgroundSize: '240px 160px'
                        }}
                      />
                    ))}

                    {/* Spot Differences Mode: Differences */}
                    {gameMode === 'spot-differences' && differences.map(diff => (
                      <div
                        key={diff.id}
                        onClick={() => handleDifferenceClick(diff.id)}
                        className={`absolute border-2 rounded cursor-pointer ${
                          diff.isFound 
                            ? 'border-green-500 bg-green-200/50' 
                            : 'border-red-500 hover:bg-red-200/30'
                        }`}
                        style={{
                          left: diff.x,
                          top: diff.y,
                          width: diff.width,
                          height: diff.height
                        }}
                      >
                        {diff.isFound && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Jigsaw Mode: Puzzle Pieces */}
                  {gameMode === 'jigsaw' && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {puzzlePieces.filter(piece => !piece.isPlaced).map(piece => (
                        <div
                          key={piece.id}
                          draggable
                          onDragStart={() => handleDragStart(piece.id)}
                          className="border-2 border-orange-300 rounded cursor-move hover:border-orange-500 transition-colors"
                          style={{
                            width: piece.width,
                            height: piece.height,
                            backgroundImage: `url(${originalImage})`,
                            backgroundPosition: `-${piece.correctX}px -${piece.correctY}px`,
                            backgroundSize: '240px 160px'
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Progress Indicator */}
                  <div className="text-center mb-4">
                    <div className="text-sm text-gray-600 mb-2">
                      {gameMode === 'jigsaw' 
                        ? `Progress: ${placedPieces.length} / ${puzzlePieces.length} pieces` 
                        : `Found: ${foundDifferences.length} / ${differences.length} differences`}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-rose-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: gameMode === 'jigsaw' 
                            ? `${(placedPieces.length / puzzlePieces.length) * 100}%` 
                            : `${(foundDifferences.length / differences.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Hint Button */}
                  <div className="text-center mb-4">
                    <button
                      onClick={useHint}
                      disabled={hintUsed}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      {hintUsed ? 'Hint Used' : 'Get Hint'}
                    </button>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {showFeedback && (
                <div className={`mt-6 p-4 rounded-2xl text-center ${
                  gameState === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {gameState === 'success' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <X className="w-6 h-6 text-red-600" />
                    )}
                    <span className={`font-bold ${
                      gameState === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {gameState === 'success' ? 'Memory Restored!' : 'Try Again'}
                    </span>
                  </div>
                  <p className={gameState === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {feedbackMessage}
                  </p>
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

      {/* Instructions */}
      <div className="px-4 pb-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-4 shadow-xl border border-orange-100">
          <h3 className="font-bold text-gray-800 mb-2">How to Play</h3>
          <ul className="text-gray-700 space-y-1 text-sm">
            {gameMode === 'jigsaw' ? (
              <>
                <li>• Drag puzzle pieces to their correct positions</li>
                <li>• Pieces will snap into place when positioned correctly</li>
                <li>• Complete the entire puzzle to advance</li>
              </>
            ) : (
              <>
                <li>• Click on areas that look different between the images</li>
                <li>• Find all 5 differences to complete the challenge</li>
                <li>• Use the hint button if you get stuck</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SnapshotSolve1;