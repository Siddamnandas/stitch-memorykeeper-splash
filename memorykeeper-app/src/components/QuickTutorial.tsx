import React from 'react';
import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';

import { ChevronLeft } from 'lucide-react';

interface QuickTutorialProps {
  onBack: () => void;
}

const QuickTutorial: React.FC<QuickTutorialProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to MemoryKeeper",
      description: "Preserve your precious memories with our easy-to-use platform.",
      image: "https://placehold.co/300x200/ee862b/ffffff?text=MemoryKeeper"
    },
    {
      title: "Record Your Memories",
      description: "Capture moments through photos, voice recordings, or written stories.",
      image: "https://placehold.co/300x200/ee862b/ffffff?text=Record+Memories"
    },
    {
      title: "Play Memory Games",
      description: "Strengthen your recall with fun, interactive memory games.",
      image: "https://placehold.co/300x200/ee862b/ffffff?text=Memory+Games"
    },
    {
      title: "Share with Family",
      description: "Invite loved ones to contribute to and enjoy shared memories.",
      image: "https://placehold.co/300x200/ee862b/ffffff?text=Share+Memories"
    }
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial completed
      onBack();
    }
  };

  const handleSkip = () => {
    onBack();
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 font-display">
      <main className="flex-grow p-4">
        <header className="flex items-center justify-between mb-6">
          <button
            className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100"
            onClick={onBack}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button 
            className="font-bold text-orange-600"
            onClick={handleSkip}
          >
            Skip
          </button>
        </header>
        
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-6 mb-6">
          <div className="text-center mb-6">
            <img
              alt={tutorialSteps[currentStep].title}
              className="w-full h-48 object-cover rounded-2xl mb-6 shadow-lg"
              src={tutorialSteps[currentStep].image}
            />
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{tutorialSteps[currentStep].title}</h2>
            <p className="text-gray-600 mb-6">
              {tutorialSteps[currentStep].description}
            </p>
          </div>
          
          <div className="flex justify-center mb-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full mx-1 ${
                  index === currentStep 
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500' 
                    : 'bg-orange-200'
                }`}
              ></div>
            ))}
          </div>
          
          <button 
            className="w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-4 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            onClick={handleNext}
          >
            {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default QuickTutorial;