import { useState, useEffect, useCallback, useRef, type FC } from 'react';
import { Zap, RotateCcw, Play, ChevronRight, Volume2, Pause, Mic, MicOff } from 'lucide-react';
import { useAppState } from '../lib/AppStateContext';
import { useAuth } from '../lib/AuthContext';
import { useError } from '../lib/ErrorContext';
import { useAdaptiveAgent } from '../hooks/useAdaptiveAgent';
import { addActivityAndRecalculate } from '../lib/memoryStrengthService';

const EchoEcho: FC<{ onBack: () => void }> = ({ onBack }) => {
  const { state } = useAppState();
  const { user } = useAuth();
  const { addToast } = useError();
  const currentMemory = state.memories[0]; // Get most recent memory
  const difficulty = 'medium'; // Default difficulty, could be configurable
  
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
    gameId: 'echo-echo',
    difficulty,
    currentMemory
  });

  // State for the auditory game
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [, setRecordedAudio] = useState<Blob | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'ready' | 'playing' | 'recording' | 'analyzing' | 'completed'>('ready');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [clipDuration, setClipDuration] = useState(10); // seconds based on difficulty

  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Get voice memories for the game
  const getVoiceMemories = useCallback(() => {
    return state.memories.filter(memory => 
      memory.type === 'audio' && memory.response && memory.response.length > 0
    );
  }, [state.memories]);

  // Select a random voice clip based on difficulty
  const selectVoiceClip = useCallback(() => {
    const voiceMemories = getVoiceMemories();
    if (voiceMemories.length === 0) {
      // Fallback: generate synthetic speech
      return null;
    }
    
    // Select a random voice memory
    const randomMemory = voiceMemories[Math.floor(Math.random() * voiceMemories.length)];
    // In a real implementation, we would fetch the actual audio file
    // For now, we'll simulate with a placeholder
    return randomMemory;
  }, [getVoiceMemories]);

  // Play audio clip
  const playAudioClip = useCallback(() => {
    if (audioUrl && audioRef.current) {
      setIsPlaying(true);
      audioRef.current.play();
    }
  }, [audioUrl]);

  // Stop audio playback
  const stopAudioPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  // Start recording user's echo
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedAudio(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        setGameStatus('analyzing');
        
        // Simulate AI analysis
        setTimeout(() => {
          // In a real implementation, we would send the audio to OpenAI Whisper for analysis
          // For now, we'll simulate with a random accuracy score
          const simulatedAccuracy = Math.floor(Math.random() * 50) + 50; // 50-99%
          setAccuracyScore(simulatedAccuracy);
          
          // Generate feedback based on accuracy
          let feedbackMessage = '';
          if (simulatedAccuracy >= 90) {
            feedbackMessage = 'Excellent pronunciation! You captured the essence perfectly.';
            setScore(prev => prev + 18);
          } else if (simulatedAccuracy >= 70) {
            feedbackMessage = 'Great job! Just a few small adjustments needed.';
            setScore(prev => prev + 12);
          } else if (simulatedAccuracy >= 50) {
            feedbackMessage = 'Good effort! Keep practicing to improve your recall.';
            setScore(prev => prev + 6);
          } else {
            feedbackMessage = 'Keep trying! Listen carefully and focus on the key details.';
          }
          
          setFeedback(feedbackMessage);
          setGameStatus('completed');
          setStreak(prev => prev + 1);
          setLevel(prev => Math.min(prev + 1, 10));
          
          // Show agent feedback
          setTimeout(() => showAgent(), 500);
          
          // Record completion and update memory strength
          recordGameCompletion(true, Date.now());
          
          if (user?.id) {
            const performanceBonus = Math.min(level, 5); // Cap bonus at level 5
            const totalPoints = score + performanceBonus;
            
            try {
              addActivityAndRecalculate(user.id, {
                type: 'game_completed',
                timestamp: new Date(),
                value: totalPoints,
                metadata: {
                  gameType: 'echo-echo',
                  difficulty: 'medium',
                  streakDays: streak
                }
              });
            } catch (error) {
              console.error('Error updating memory strength:', error);
            }
          }
        }, 2000);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setGameStatus('recording');
    } catch (error) {
      console.error('Error starting recording:', error);
      addToast({
        type: 'error',
        title: 'Recording Error',
        message: 'Could not access microphone. Please check permissions.',
        duration: 5000
      });
    }
  }, [showAgent, recordGameCompletion, user, score, level, streak, addToast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all media tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  }, [isRecording]);

  // Start new game
  const startGame = useCallback(() => {
    // Select a voice clip based on difficulty
    const selectedMemory = selectVoiceClip();
    
    if (!selectedMemory) {
      // Fallback message
      addToast({
        type: 'info',
        title: 'No Voice Memories',
        message: 'Record a voice memory first to play Echo Echo!',
        duration: 5000
      });
      return;
    }
    
    // In a real implementation, we would fetch the actual audio file
    // For now, we'll simulate with a placeholder
    setAudioUrl(null); // Would be actual audio URL
    
    // Set clip duration based on difficulty and memory strength
    // This is a simplified version - in reality, we'd use the actual memory strength
    const duration = state.memoryStrength < 40 ? 5 : 
                   state.memoryStrength < 70 ? 10 : 15;
    setClipDuration(duration);
    
    setGameStatus('ready');
    setRecordedAudio(null);
    setRecordedAudioUrl(null);
    setAccuracyScore(null);
    setFeedback('');
  }, [selectVoiceClip, state.memoryStrength, addToast]);

  // Reset game
  const resetGame = useCallback(() => {
    stopAudioPlayback();
    if (isRecording) {
      stopRecording();
    }
    
    setAudioUrl(null);
    setRecordedAudio(null);
    setRecordedAudioUrl(null);
    setAccuracyScore(null);
    setFeedback('');
    setGameStatus('ready');
    setIsPlaying(false);
    setIsRecording(false);
    hideAgent();
  }, [stopAudioPlayback, isRecording, stopRecording, hideAgent]);

  // Handle audio playback ended
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audioElement.addEventListener('ended', handleEnded);
    return () => {
      audioElement.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Initialize game on mount
  useEffect(() => {
    startGame();
    
    return () => {
      // Cleanup
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
      resetGame();
    };
  }, [startGame, resetGame, audioUrl, recordedAudioUrl]);

  // Update agent with game progress
  useEffect(() => {
    if (gameStatus === 'recording' || gameStatus === 'analyzing') {
      updateGameProgress(level, 0, streak, Date.now());
    }
  }, [level, streak, gameStatus, updateGameProgress]);

  return (
    <div className="pt-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100"
        >
          <ChevronRight className="w-6 h-6 rotate-180 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Echo Echo</h1>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Echo Echo</h2>
            <p className="text-sm text-gray-600">Repeat what you hear</p>
          </div>
        </div>

        <p className="text-gray-700 mb-6">
          Listen to the audio clip, then record yourself repeating what you heard as accurately as possible.
        </p>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-orange-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-orange-600">{level}</p>
            <p className="text-xs text-orange-800">Level</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{score}</p>
            <p className="text-xs text-green-800">Score</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{clipDuration}s</p>
            <p className="text-xs text-purple-800">Clip Length</p>
          </div>
        </div>

        {/* Audio Player */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">Listen to Clip</h3>
            <span className="text-sm text-gray-600">{clipDuration} seconds</span>
          </div>
          
          <div className="bg-purple-50 rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={isPlaying ? stopAudioPlayback : playAudioClip}
                disabled={gameStatus === 'recording' || gameStatus === 'analyzing'}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                  isPlaying 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
                } text-white transition-all disabled:opacity-50`}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: '30%' }} // Would be dynamic in real implementation
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            Press play to listen to the audio clip
          </p>
        </div>

        {/* Recording Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">Record Your Echo</h3>
          </div>
          
          <div className="bg-orange-50 rounded-2xl p-6 text-center mb-3">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={gameStatus === 'playing' || gameStatus === 'analyzing'}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4 transition-all ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                  : 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600'
              } text-white disabled:opacity-50`}
            >
              {isRecording ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
            
            <p className="text-gray-700 mb-2">
              {isRecording ? 'Recording... Speak now!' : 'Press to start recording'}
            </p>
            <p className="text-sm text-gray-600">
              {isRecording ? 'Press again to stop' : 'Repeat what you heard as accurately as possible'}
            </p>
          </div>
        </div>

        {/* Analysis Results */}
        {gameStatus === 'analyzing' && (
          <div className="bg-blue-50 rounded-2xl p-6 mb-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-blue-800 font-bold">Analyzing your pronunciation...</p>
            <p className="text-sm text-blue-600">AI is checking your accuracy</p>
          </div>
        )}

        {gameStatus === 'completed' && accuracyScore !== null && (
          <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-green-200">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-3">
                <Volume2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Analysis Complete!</h3>
              <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full">
                <span className="text-2xl font-bold">{accuracyScore}%</span>
                <span className="text-sm ml-1">Accuracy</span>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-4 mb-4">
              <p className="text-green-800 text-center">{feedback}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                Next Clip
              </button>
            </div>
          </div>
        )}

        {/* Game Controls */}
        <div className="flex gap-3">
          {gameStatus === 'ready' && (
            <button
              onClick={startGame}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Select Clip
            </button>
          )}

          <button
            onClick={resetGame}
            className="flex-1 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <RotateCcw className="w-5 h-5 inline mr-2" />
            Reset
          </button>
        </div>
      </div>

      {/* Hidden audio element */}
      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} className="hidden" />
      )}

      {/* Adaptive Agent */}
      {agentVisible && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-bold">
              AI
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 mb-2">Adaptive Agent</h3>
              <p className="text-gray-700 mb-3">
                {agentDecision?.agentMessage || "Great effort! Focus on clear pronunciation."}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={requestHint}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors"
                >
                  Get Hint
                </button>
                <button
                  onClick={hideAgent}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
        <h3 className="font-bold text-gray-800 mb-3">How to Play</h3>
        <ul className="text-gray-700 space-y-2 text-sm">
          <li>• Listen carefully to the audio clip from your memories</li>
          <li>• Press the microphone button and repeat what you heard</li>
          <li>• Speak clearly and at a steady pace</li>
          <li>• AI will analyze your pronunciation and provide feedback</li>
        </ul>
      </div>
    </div>
  );
};

export default EchoEcho;
