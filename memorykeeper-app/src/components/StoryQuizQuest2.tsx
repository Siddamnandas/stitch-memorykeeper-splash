import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';

interface StoryQuizQuest2Props {
  onBack: () => void;
  onNavigate: (view: string) => void;
}

const StoryQuizQuest2: React.FC<StoryQuizQuest2Props> = ({ onBack, onNavigate }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const questions = [
    {
      question: "What was the main event in this story?",
      options: ["Birthday party", "Wedding", "Graduation", "Reunion"],
      correct: 3
    },
    {
      question: "Which character played the most important role?",
      options: ["Friend", "Sibling", "Parent", "Grandparent"],
      correct: 3
    },
    {
      question: "What was the setting of the story?",
      options: ["Restaurant", "Garden", "Beach", "Living room"],
      correct: 1
    }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === questions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleFinish = () => {
    // Navigate back to games
    onBack();
  };

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
            <h1 className="text-xl font-bold text-center flex-1 pr-10 text-gray-800">Story Quiz Quest: Level 2</h1>
          </header>
          <div className="px-4 py-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-6 text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Quiz Complete!</h2>
              <div className="text-5xl font-bold mb-4 text-orange-500">{score}/{questions.length}</div>
              <p className="mb-6 text-gray-700">
                {score === questions.length
                  ? "Perfect score! You know this story well."
                  : score >= questions.length / 2
                  ? "Good job! You remembered most of the details."
                  : "Keep practicing to remember more details!"}
              </p>
              <button
                className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                onClick={handleFinish}
              >
                Finish Game
              </button>
            </div>
          </div>
        </main>
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
          <h1 className="text-xl font-bold text-center flex-1 pr-10 text-gray-800">Story Quiz Quest: Level 2</h1>
        </header>
        <div className="px-4 py-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-800">Question {currentQuestion + 1}/{questions.length}</span>
              <span className="text-lg font-medium text-gray-800">Score: {score}</span>
            </div>
            <div className="bg-orange-200 h-2.5 rounded-full mb-6">
              <div
                className="bg-gradient-to-r from-orange-500 to-rose-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{questions[currentQuestion].question}</h2>
              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-colors shadow-lg ${
                      selectedAnswer === index
                        ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-500 text-orange-700'
                        : 'bg-white/80 backdrop-blur-xl border-orange-200 text-gray-800 hover:bg-orange-50'
                    }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button
                className={`mt-6 w-full py-4 px-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all ${
                  selectedAnswer !== null
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={selectedAnswer === null}
                onClick={handleNext}
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StoryQuizQuest2;