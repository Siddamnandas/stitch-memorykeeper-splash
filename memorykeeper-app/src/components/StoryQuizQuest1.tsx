import React, { memo } from 'react';
import { ChevronLeft, RotateCcw, Trophy, Target, Sparkles, Clock, Bot, CheckCircle, X, BookOpen } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useAppState } from '../lib/AppStateContext';
import { useAdaptiveAgent } from '../hooks/useAdaptiveAgent';
import { addMemory, updateMemoryStrength } from '../lib/dataService';
import AdaptiveAgentDisplay from './AdaptiveAgentDisplay';
import { useState, useEffect, useCallback } from 'react';

interface Question {
  question: string;
  options: string[];
  correct: number;
  story: string;
}

interface StoryQuizQuest1Props {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

const StoryQuizQuest1: React.FC<StoryQuizQuest1Props> = ({ onBack, onNavigate }) => {
  const { user } = useAuth();
  const { state } = useAppState();
  const currentMemory = state.memories[0]; // Get most recent memory
  const difficulty = 'medium'; // Default difficulty

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
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
    gameId: 'story-quiz-quest-1',
    difficulty,
    currentMemory
  });

  // Story-based questions with AI-generated content
  const questions: Question[] = [
    {
      question: "In the story about grandmother's recipe book, who was the main character?",
      options: ["The grandmother", "The grandchild", "The neighbor", "The chef"],
      correct: 0,
      story: "Once upon a time, there was a grandmother who kept all her special recipes in a beautiful old book..."
    },
    {
      question: "Where did the family gather for the important celebration?",
      options: ["At the park", "In the backyard", "At grandmother's house", "At the restaurant"],
      correct: 2,
      story: "The family always gathered at grandmother's house for special celebrations..."
    },
    {
      question: "What special tradition did the family follow?",
      options: ["Morning walks", "Storytelling after dinner", "Cooking together", "Gardening"],
      correct: 1,
      story: "After every family dinner, they would sit together and share stories from the past..."
    },
    {
      question: "What was the most cherished item passed down through generations?",
      options: ["A photo album", "Grandmother's recipe book", "An old quilt", "A music box"],
      correct: 1,
      story: "The most precious item in the family was grandmother's recipe book, filled with handwritten recipes..."
    },
    {
      question: "How did the family preserve their memories?",
      options: ["Through photographs", "Through storytelling", "Through cooking", "All of the above"],
      correct: 3,
      story: "The family preserved their memories through photographs, stories, and cooking together..."
    }
  ];

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && !showResult && !showFeedback) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && !showResult) {
      // Time's up - move to next question or show result
      handleTimeUp();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, showResult, showFeedback]);

  const handleTimeUp = useCallback(() => {
    setMistakes(prev => prev + 1);
    setStreak(0);
    setFeedbackMessage('Time\'s up! The story detail faded away.');
    setShowFeedback(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setTimeLeft(30);
        setShowFeedback(false);
      } else {
        setShowResult(true);
        setShowFeedback(false);
        // Record completion
        recordGameCompletion(score >= questions.length * 0.7, Date.now());
        // Update memory strength
        if (user?.id) {
          updateMemoryStrength(user.id, score * 10);
        }
      }
    }, 2000);
  }, [currentQuestion, questions.length, score, recordGameCompletion, user?.id]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showFeedback) return;
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    const isCorrect = selectedAnswer === questions[currentQuestion].correct;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      setFeedbackMessage('Perfect! You remembered that story detail.');
    } else {
      setMistakes(prev => prev + 1);
      setStreak(0);
      setFeedbackMessage('Not quite right. Let\'s try the next question.');
    }

    setShowFeedback(true);
    showAgent(); // Show agent feedback

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setTimeLeft(30);
        setShowFeedback(false);
      } else {
        setShowResult(true);
        setShowFeedback(false);
        // Record completion
        const finalScore = isCorrect ? score + 1 : score;
        recordGameCompletion(finalScore >= questions.length * 0.7, Date.now());
        // Update memory strength
        if (user?.id) {
          updateMemoryStrength(user.id, finalScore * 10);
        }
      }
    }, 2000);
  };

  const handleContinue = () => {
    onNavigate('story-quiz-quest-2');
  };

  // Update agent with game progress
  useEffect(() => {
    if (!showResult) {
      updateGameProgress(currentQuestion, mistakes, streak, timeLeft);
    }
  }, [currentQuestion, mistakes, streak, timeLeft, showResult, updateGameProgress]);

  // Game Stats Component
  const GameStats = () => (
    <div className="grid grid-cols-3 gap-2 mb-6">
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-orange-100">
        <div className="flex items-center gap-1 mb-1">
          <Trophy className="w-3 h-3 text-yellow-500" />
          <span className="text-xs font-bold text-gray-800">Score</span>
        </div>
        <span className="text-sm font-bold text-gray-800">{score}</span>
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-orange-100">
        <div className="flex items-center gap-1 mb-1">
          <Sparkles className="w-3 h-3 text-green-500" />
          <span className="text-xs font-bold text-gray-800">Streak</span>
        </div>
        <span className="text-sm font-bold text-gray-800">{streak}</span>
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-orange-100">
        <div className="flex items-center gap-1 mb-1">
          <Clock className="w-3 h-3 text-orange-500" />
          <span className="text-xs font-bold text-gray-800">Time</span>
        </div>
        <span className="text-sm font-bold text-gray-800">{timeLeft}s</span>
      </div>
    </div>
  );

  if (showResult) {
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
            <h1 className="text-xl font-bold text-center flex-1 pr-10 text-gray-800">Story Quiz Quest</h1>
          </header>
          <GameStats />
          <div className="px-4 py-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <BookOpen className="w-8 h-8 text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-800">Story Quest Complete!</h2>
              </div>
              <div className="text-5xl font-bold mb-4 text-orange-500">{score}/{questions.length}</div>
              <p className="mb-6 text-gray-700">
                {score === questions.length
                  ? "Perfect! You remembered every detail of the story."
                  : score >= questions.length * 0.8
                  ? "Excellent! You have a strong memory for stories."
                  : score >= questions.length * 0.6
                  ? "Good job! You remembered most of the story details."
                  : "Keep practicing to strengthen your story memory!"}
              </p>
              <button
                className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                onClick={handleContinue}
              >
                Continue to Quest 2
              </button>
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
  }

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
          <h1 className="text-xl font-bold text-center flex-1 pr-10 text-gray-800">Story Quiz Quest</h1>
        </header>
        <GameStats />
        <div className="px-4 py-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-800">Question {currentQuestion + 1}/{questions.length}</span>
              <span className="text-lg font-medium text-gray-800">Progress: {score}/{currentQuestion + (selectedAnswer !== null ? 1 : 0)}</span>
            </div>
            <div className="bg-orange-200 h-2.5 rounded-full mb-6">
              <div
                className="bg-gradient-to-r from-orange-500 to-rose-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Feedback Message */}
            {showFeedback && (
              <div className={`mb-4 p-4 rounded-2xl text-center ${
                feedbackMessage.includes('Perfect') ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {feedbackMessage.includes('Perfect') ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : feedbackMessage.includes('Time') ? (
                    <Clock className="w-6 h-6 text-orange-600" />
                  ) : (
                    <X className="w-6 h-6 text-red-600" />
                  )}
                  <span className={feedbackMessage.includes('Perfect') ? 'text-green-800' : 'text-red-800'}>
                    {feedbackMessage}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-6">
              {/* Story Context */}
              {questions[currentQuestion].story && (
                <div className="mb-4 p-3 bg-orange-50 rounded-xl">
                  <p className="text-sm text-gray-700 italic">
                    "{questions[currentQuestion].story}"
                  </p>
                </div>
              )}

              <h2 className="text-xl font-bold mb-6 text-gray-800">{questions[currentQuestion].question}</h2>
              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-colors shadow-lg ${
                      selectedAnswer === index
                        ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-500 text-orange-700'
                        : selectedAnswer !== null
                        ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-white/80 backdrop-blur-xl border-orange-200 text-gray-800 hover:bg-orange-50'
                    } ${showFeedback ? 'cursor-not-allowed' : ''}`}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null || showFeedback}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                className={`mt-6 w-full py-4 px-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all ${
                  selectedAnswer !== null && !showFeedback
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={selectedAnswer === null || showFeedback}
                onClick={handleNext}
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Complete Quest'}
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

export default memo(StoryQuizQuest1);