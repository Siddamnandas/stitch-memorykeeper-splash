import React from 'react';
import { ChevronRight, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';

interface Card {
  id: number;
  emoji: string;
  matched: boolean;
  flipped?: boolean;
}

interface MemoryMatchGameProps {
  onBack: () => void;
}

const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onBack }) => {
  const navigate = useNavigate();

  // Card data with emojis and matching pairs
  const cardData = useMemo<Card[]>(() => [
    { id: 1, emoji: '🌟', matched: false },
    { id: 2, emoji: '🌟', matched: false },
    { id: 3, emoji: '❤️', matched: false },
    { id: 4, emoji: '❤️', matched: false },
    { id: 5, emoji: '🎮', matched: false },
    { id: 6, emoji: '🎮', matched: false },
    { id: 7, emoji: '🎵', matched: false },
    { id: 8, emoji: '🎵', matched: false },
    { id: 9, emoji: '🌺', matched: false },
    { id: 10, emoji: '🌺', matched: false },
    { id: 11, emoji: '🍕', matched: false },
    { id: 12, emoji: '🍕', matched: false },
  ], []);

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const resetGame = useCallback(() => {
    // Shuffle cards
    const shuffled: Card[] = [...cardData]
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
    setIsRunning(true);
    setGameOver(false);
  }, [cardData]);

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

  // Check for game completion
  useEffect(() => {
    if (matchedPairs === cardData.length / 2 && cardData.length > 0) {
      setIsRunning(false);
      setGameOver(true);
    }
  }, [matchedPairs, cardData.length]);

  const handleCardClick = (clickedCard: Card) => {
    // Don't process if card is already flipped or matched
    if (clickedCard.flipped || clickedCard.matched || flippedCards.length === 2) {
      return;
    }

    // Flip the card
    const updatedCards: Card[] = cards.map(card =>
      card.id === clickedCard.id ? { ...card, flipped: true } : card
    );
    
    setCards(updatedCards);
    
    // Add to flipped cards
    const newFlippedCards: Card[] = [...flippedCards, clickedCard];
    setFlippedCards(newFlippedCards);

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      const [firstCard, secondCard] = newFlippedCards;
      
      if (firstCard.emoji === secondCard.emoji) {
        // Match found
        setTimeout(() => {
          const matchedCards: Card[] = updatedCards.map(card =>
            card.emoji === firstCard.emoji ? { ...card, matched: true } : card
          );
          setCards(matchedCards);
          setMatchedPairs(matchedPairs + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match, flip cards back
        setTimeout(() => {
          const resetCards: Card[] = updatedCards.map(card =>
            card.id === firstCard.id || card.id === secondCard.id
              ? { ...card, flipped: false }
              : card
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
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

  return (
    <div className="pt-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={handleBack}
          className="w-12 h-12 bg-surface/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-border/60"
        >
          <ChevronRight className="w-6 h-6 rotate-180 text-ink" />
        </button>
        <h1 className="text-3xl font-bold text-ink">Memory Match</h1>
      </div>

      {!gameOver ? (
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-surface-muted backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-border/60">
          {/* Game stats */}
          <div className="flex justify-between items-center mb-6">
            <div className="bg-primary/20 px-5 py-3 rounded-2xl">
              <p className="text-lg font-bold text-primary">Moves: {moves}</p>
            </div>
            <div className="bg-accent/20 px-5 py-3 rounded-2xl">
              <p className="text-lg font-bold text-accent">Time: {formatTime(timer)}</p>
            </div>
          </div>

          {/* Game board */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                className={`aspect-square rounded-2xl flex items-center justify-center text-4xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  card.flipped || card.matched
                    ? 'bg-surface-raised shadow-lg border border-border/60'
                    : 'bg-gradient-to-br from-primary to-accent shadow-lg'
                } ${card.matched ? 'ring-4 ring-success' : ''}`}
              >
                {card.flipped || card.matched ? card.emoji : '?'}
              </div>
            ))}
          </div>

          {/* Reset button */}
          <div className="flex justify-center">
            <button
              onClick={resetGame}
              className="flex items-center gap-3 py-4 px-8 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <RotateCcw className="w-6 h-6" />
              Reset Game
            </button>
          </div>
        </div>
      ) : (
        // Game over screen
        <div className="bg-gradient-to-br from-primary/15 via-primary/5 to-surface-muted backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-border/60 min-h-96 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-ink mb-2">Congratulations!</h2>
            <p className="text-ink-muted mb-2">You've matched all pairs!</p>
            
            <div className="bg-primary/10 rounded-2xl p-5 my-6">
              <div className="flex justify-around">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{moves}</p>
                  <p className="text-lg text-ink-muted">Moves</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-accent">{formatTime(timer)}</p>
                  <p className="text-lg text-ink-muted">Time</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <button
                onClick={resetGame}
                className="py-4 px-8 bg-gradient-to-r from-primary to-accent text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                Play Again
              </button>
              <button
                onClick={handleBack}
                className="py-4 px-8 bg-surface border border-border/60 text-ink rounded-2xl font-bold text-lg shadow-lg hover:bg-surface-muted transition-all"
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

export default MemoryMatchGame;