import React from 'react';
import { ChevronLeft, Home, Gamepad2, BookOpen, User, Volume2, Lock, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MemoryMatchup2Props {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

const MemoryMatchup2: React.FC<MemoryMatchup2Props> = ({ onBack, onNavigate }) => {
  const [timeLeft, setTimeLeft] = useState(75); // percentage for progress bar
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set()); // cards that are flipped
  const [matchedCards, setMatchedCards] = useState<Set<number>>(new Set()); // matched pairs
  const [mismatchCards, setMismatchCards] = useState<Set<number>>(new Set()); // cards with mismatch animation
  const [isPremiumUser] = useState(true); // For demo purposes, assume all users have premium
  const [audioPlaying, setAudioPlaying] = useState<number | null>(null); // Track which card's audio is playing

  interface Card {
    id: number;
    word: string;
    image: string;
    audio?: string; // Added audio property for premium feature
    isPremium?: boolean; // Added to identify premium cards
  }

  const cards: Card[] = [
    {
      id: 0,
      word: 'Childhood',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUaWsiKv02tYSin77lYxrXoTZjxcGjRHbAVPmn0QMlstnatKrbd3DEw20cg_5dZtUulHp5IMAR0u7tKNuJbPijANt9aZszzFzXjSB0iOlPhh3B_Lr0OjMzH4IZdjpVv9mTv-Z6ssaSqAhjjXDH3nanuOAHRP7l4aRvR5wRPvu5DwsIuGeuucyilR33L17a0dScMZYdIbgOZyNPuTA15Lt-GSAGf6JiuTMTtJHi1pld0BzOqPsjFEz0iYbePCHNwjTNfkC07B7gIQw',
      isPremium: true
    },
    {
      id: 1,
      word: 'Adventure',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDulxaiopxVIgV472gcdR09Tw9bD4UlMjSia1ZiuWEHSqmeBBiThlmDGbjsW9_G9aAdpa3RE6XQM-SHn63MqmBVI_RVwRNHglpZ6pOPlN0wfnW1jX5QFSt7_h54LPdWTj28uwMMNCKDHt_8B5sjotIHkFHosol16ecRQ6Vh6p3S4rL17IhW7d1hGgCu4kPl8kUyuLEgxmRNFp_soDVVPZzyMcZmNTmV9EHYcc10rX-G91GzxDHAAWEGLOnj_uvpXz5PVf6lUdGlUgc',
      isPremium: true
    },
    {
      id: 2,
      word: 'Tradition',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB19zwxfoOPthsaPBcAeQ6eJkkPiIAylokRTpufXp6r-4wYeErA1UICX1Nejhe294or8QBUuo_1DgoaRL23w998kvlTT1qmrCrmbrpF7f3Z00XCHwClHiOu-5wgH2_fPmTVZe48H6FalZakdIlrkbzU5nFBkicJtl3DCQuMSeQKxapT5VCRKflSZhTuBeDXJ61eXzldQBPVwcL8-0A3mPG_STd-KspeYGjvmQYKsg6jWNdDysHUYVQ7lksUTfqmoINzzW6Vnqwa45k',
      isPremium: true
    },
    {
      id: 3,
      word: 'Childhood',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW5uq67oHgV0c-nVdjpjZFzCjmUPPNM_dv5IaKQ0Wb-b8aA6PdCQYteswBTcrV82m_v_q3bteVPp3ivnNczSesi30vaAeaHIyhe8SLSwQ6X91AQvMgNPUM1pDlLbedg3eI7zUzjZPMSWE7otFI8LCUN73c3GkqsMzj_-hxarueKAnapzveHWmcrAtLh9ZTRuuuVtzVyCIbzhFo6lnw8yOuA_1if5ogjYCCcO2Rt3T6s89eKS83pjl4b993Mr3OhGYu4OT2M9GF67g',
      isPremium: true
    },
    {
      id: 4,
      word: 'Tradition',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDb6xiq3VcsWTuZSsFt0dxNnZH0RLQgqo9r9WJwIGXxR7g8KOY-vWGreLg7YrHApB3lY-Xsn3EHHzc2ars73kaPyQ7ttjHPGcoDKnr8mZDZTAksddDZk808_RasLIMIqqEK270yNmQLlD_LD_AxuLGeJx4B5cf4pSWQPrObG_mDs4REvURinbTx5W_e7oIO9PlXqwuMY0osNfgjAWvVgmQ2huHPZPA2dRfgR4q-v_OSoQlSdOsSF8e58f-6DNKaB45kFH3mTjnMyzU',
      isPremium: true
    },
    {
      id: 5,
      word: 'Adventure',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArzvfHKY265DrkAMOeN9EApdWoMTG8eONeaQ36EFAtC3Wfn32EniOunfadGFSiChGkgD9pHHesr0Hg7EGQzikNz9DNX6E88F4wImuvgt9tLc5BfE0ewCGnybbBm4yifrJW3ch42n5snY2VpQhySgNkHdW4eWnm-94t09UC7B0rNOzvGzmsMWiMRFMVesI2vXkANeBqsLxn-3M2192ATaR5Y-6mncHZLYyufF6OvbFuzWe8THkoNoR8ZVAEuTERyZHUbAXJZf1ff-w',
      isPremium: true
    }
  ];

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Clear mismatch animation after animation completes
  useEffect(() => {
    if (mismatchCards.size > 0) {
      const timer = setTimeout(() => {
        setMismatchCards(new Set());
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [mismatchCards]);

  const handleCardClick = (cardId: number) => {
    if (matchedCards.has(cardId) || flippedCards.has(cardId)) return;

    const newFlipped = new Set(flippedCards);
    newFlipped.add(cardId);
    setFlippedCards(newFlipped);

    // Check for matches if two cards are flipped
    if (newFlipped.size === 2) {
      const flippedArray = Array.from(newFlipped);
      const card1 = cards.find(c => c.id === flippedArray[0]);
      const card2 = cards.find(c => c.id === flippedArray[1]);

      if (card1 && card2 && card1.word === card2.word) {
        // Match found
        setMatchedCards(new Set([...matchedCards, ...newFlipped]));
        setFlippedCards(new Set());
      } else {
        // No match - show mismatch animation
        setMismatchCards(new Set(flippedArray));
        // Flip cards back after animation
        setTimeout(() => {
          setFlippedCards(new Set());
        }, 600);
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

  const handleNavigation = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <div className="pt-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Memory Match-Up: Level 2</h1>
        {isPremiumUser ? (
          <div className="ml-auto flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            <Star className="w-4 h-4" />
            Premium
          </div>
        ) : (
          <button 
            className="ml-auto flex items-center gap-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold"
            onClick={() => handleNavigation('premium-features')}
          >
            <Lock className="w-4 h-4" />
            Upgrade
          </button>
        )}
      </div>
      
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
        
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Match Your Story Words!</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`card aspect-square cursor-pointer rounded-2xl overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 ${
                flippedCards.has(card.id) ? 'flipped' : ''} ${
                matchedCards.has(card.id) ? 'matched ring-4 ring-green-500' : ''} ${
                mismatchCards.has(card.id) ? 'mismatch ring-4 ring-red-500' : ''}`}
              onClick={() => handleCardClick(card.id)}
            >
              <div className="card-inner w-full h-full relative">
                <div className={`card-front absolute inset-0 w-full h-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center ${
                  flippedCards.has(card.id) || matchedCards.has(card.id) ? 'hidden' : ''}`}>
                  <div className="flex flex-col items-center">
                    <span className="text-4xl text-white">?</span>
                    {isPremiumUser && card.isPremium && (
                      <span className="text-xs text-orange-100 mt-1">Your Memory</span>
                    )}
                  </div>
                </div>
                <div
                  className={`card-back absolute inset-0 w-full h-full bg-cover bg-center ${
                    flippedCards.has(card.id) || matchedCards.has(card.id) ? '' : 'hidden'}`}
                  style={{ backgroundImage: `url('${card.image}')` }}
                >
                  <div className="w-full h-full bg-black/20 flex flex-col items-end p-2">
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
                    <p className="font-bold text-white text-lg mt-auto">{card.word}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-orange-100 shadow-2xl">
        <div className="max-w-md mx-auto flex justify-around py-3 px-2">
          <button
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-500 hover:text-gray-700"
            onClick={() => handleNavigation('home')}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 p-2 rounded-xl bg-orange-50 text-orange-600"
            onClick={() => handleNavigation('games')}
          >
            <Gamepad2 className="w-6 h-6" />
            <span className="text-xs font-bold">Games</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-500 hover:text-gray-700"
            onClick={() => handleNavigation('scrapbook')}
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-xs font-medium">Scrapbook</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-gray-500 hover:text-gray-700"
            onClick={() => handleNavigation('profile')}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default MemoryMatchup2;