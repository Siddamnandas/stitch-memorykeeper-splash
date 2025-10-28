import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Save, RotateCcw, Volume2 } from 'lucide-react';
import { useError } from '../lib/ErrorContext';

interface SpeechInputProps {
  onSpeechResult: (transcript: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const SpeechInput: React.FC<SpeechInputProps> = ({
  onSpeechResult,
  placeholder = "Click the microphone to start speaking...",
  className = "",
  disabled = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { addToast } = useError();

  // Check if speech recognition is supported
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();

      // Configure recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      // Set up event handlers
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setIsProcessing(false);
        addToast({
          type: 'info',
          title: 'Listening...',
          message: 'Speak clearly into your microphone.',
          duration: 3000
        });
      };

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        if (finalTranscript) {
          setIsProcessing(true);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsProcessing(false);

        let errorMessage = 'Speech recognition failed. Please try again.';

        switch (event.error) {
          case 'network':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly and try again.';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was cancelled.';
            break;
          case 'audio-capture':
            errorMessage = 'No microphone detected. Please check your audio settings.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service is not available.';
            break;
          default:
            break;
        }

        addToast({
          type: 'error',
          title: 'Speech Recognition Error',
          message: errorMessage,
          duration: 5000
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsProcessing(false);

        if (transcript.trim()) {
          onSpeechResult(transcript.trim());
          addToast({
            type: 'success',
            title: 'Speech Captured!',
            message: `"${transcript.trim()}"`,
            duration: 3000
          });
        }
      };
    } else {
      setIsSupported(false);
      addToast({
        type: 'warning',
        title: 'Not Supported',
        message: 'Speech recognition is not supported in this browser.',
        duration: 5000
      });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [addToast, onSpeechResult]);

  const startListening = () => {
    if (!isSupported) {
      addToast({
        type: 'error',
        title: 'Not Supported',
        message: 'Speech recognition is not available in this browser.',
        duration: 4000
      });
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      try {
        setTranscript('');
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        addToast({
          type: 'error',
          title: 'Start Failed',
          message: 'Could not start speech recognition. Please try again.',
          duration: 4000
        });
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const clearTranscript = () => {
    setTranscript('');
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      window.speechSynthesis.speak(utterance);
    } else {
      addToast({
        type: 'warning',
        title: 'Text-to-Speech Not Supported',
        message: 'Your browser does not support text-to-speech.',
        duration: 4000
      });
    }
  };

  if (!isSupported) {
    return (
      <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center ${className}`}>
        <MicOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">
          Speech recognition is not supported in this browser.
          Try using Chrome, Edge, or Safari for the best experience.
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 p-4 ${className}`}>
      {/* Input Display */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Mic className={`w-5 h-5 ${isListening ? 'text-red-500' : 'text-gray-400'}`} />
          <span className="text-sm font-medium text-gray-700">
            {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Voice Input'}
          </span>
          {transcript && (
            <button
              onClick={() => speakText(transcript)}
              className="ml-auto p-1 rounded-lg hover:bg-gray-100 transition-colors"
              title="Read aloud"
            >
              <Volume2 className="w-4 h-4 text-blue-500" />
            </button>
          )}
        </div>

        <div className="min-h-[60px] p-3 bg-gray-50 rounded-xl border border-gray-200">
          {transcript ? (
            <p className="text-gray-800">{transcript}</p>
          ) : (
            <p className="text-gray-400 italic">{placeholder}</p>
          )}

          {isListening && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-600">Listening...</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={startListening}
          disabled={disabled || isProcessing}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
        >
          {isListening ? (
            <>
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>{isProcessing ? 'Processing...' : 'Start Recording'}</span>
            </>
          )}
        </button>

        {transcript && (
          <>
            <button
              onClick={clearTranscript}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>

            <button
              onClick={() => onSpeechResult(transcript)}
              disabled={disabled}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Use Text</span>
            </button>
          </>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-xl">
        <p className="text-xs text-blue-800">
          💡 <strong>Tips:</strong> Speak clearly and at a normal pace. Click "Stop" when finished.
          Your speech will be converted to text automatically.
        </p>
      </div>
    </div>
  );
};

export default SpeechInput;