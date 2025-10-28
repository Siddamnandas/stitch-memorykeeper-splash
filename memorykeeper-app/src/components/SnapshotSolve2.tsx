import * as React from 'react';
import { useState } from 'react';

import { ChevronLeft } from 'lucide-react';

interface SnapshotSolve2Props {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

const SnapshotSolve2: React.FC<SnapshotSolve2Props> = ({ onBack, onNavigate }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    // Check if answer is correct (this is a placeholder - in a real app, this would be more complex)
    const correct = userAnswer.toLowerCase().includes('vacation') || userAnswer.toLowerCase().includes('beach');
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleFinish = () => {
    // Navigate back to games or home
    if (onNavigate) {
      onNavigate('games');
    } else {
      onBack();
    }
  };

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
          <h1 className="text-xl font-bold text-center flex-1 pr-10 text-gray-800">Snapshot Solve: Level 2</h1>
        </header>
        <div className="px-4 py-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">What do you remember about this moment?</h2>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-4 mb-6">
              <img
                alt="Memory snapshot"
                className="w-full h-64 object-cover rounded-2xl mb-4 shadow-lg"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDulxaiopxVIgV472gcdR09Tw9bD4UlMjSia1ZiuWEHSqmeBBiThlmDGbjsW9_G9aAdpa3RE6XQM-SHn63MqmBVI_RVwRNHglpZ6pOPlN0wfnW1jX5QFSt7_h54LPdWTj28uwMMNCKDHt_8B5sjotIHkFHosol16ecRQ6Vh6p3S4rL17IhW7d1hGgCu4kPl8kUyuLEgxmRNFp_soDVVPZzyMcZmNTmV9EHYcc10rX-G91GzxDHAAWEGLOnj_uvpXz5PVf6lUdGlUgc"
              />
              <p className="text-gray-600 text-sm">
                This photo captures a special vacation moment. Try to recall what happened here.
              </p>
            </div>
            {!showResult ? (
              <div>
                <label className="block text-lg font-medium mb-2 text-gray-800" htmlFor="memory-answer">
                  Your Memory:
                </label>
                <textarea
                  className="w-full bg-white/80 backdrop-blur-xl border border-orange-200 rounded-2xl p-4 text-gray-800 shadow-lg"
                  id="memory-answer"
                  rows={4}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Describe what you remember about this moment..."
                ></textarea>
                <button
                  className="mt-4 w-full bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-4 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  onClick={handleSubmit}
                >
                  Submit Answer
                </button>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 text-center shadow-xl border border-orange-100">
                {isCorrect ? (
                  <div>
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">Excellent!</h3>
                    <p className="mb-6 text-gray-700">You have a wonderful memory of this special time.</p>
                    <button
                      className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                      onClick={handleFinish}
                    >
                      Finish Game
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-red-500 text-5xl mb-4">✗</div>
                    <h3 className="text-2xl font-bold text-red-600 mb-2">Keep Trying!</h3>
                    <p className="mb-6 text-gray-700">Think about the details of this vacation moment.</p>
                    <button
                      className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                      onClick={() => setShowResult(false)}
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SnapshotSolve2;