import { useState, useEffect, type FC } from 'react';
import { Mic, Square, History, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { isSpeechRecognitionSupported } from '../lib/speechService';
import enhancedSpeechService from '../lib/enhancedSpeechService';

interface EnhancedVoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
}

const EnhancedVoiceInput: FC<EnhancedVoiceInputProps> = ({
  onTranscript,
  placeholder = "Speak to record your memory...",
  className = ""
}) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [detectedLanguage, setDetectedLanguage] = useState('en-US');

  // Update recording duration when recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(enhancedSpeechService.getRecordingDuration());
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Load transcription history on mount
  useEffect(() => {
    setHistory(enhancedSpeechService.getTranscriptionHistory());
  }, []);

  const startRecording = async () => {
    if (!isSpeechRecognitionSupported()) {
      setError(t('voice.error.browserNotSupported'));
      return;
    }

    try {
      setError(null);
      setTranscript('');
      
      // Detect language from existing text
      const detectedLang = enhancedSpeechService.detectLanguage(transcript);
      setDetectedLanguage(detectedLang);
      
      await enhancedSpeechService.startEnhancedSpeechRecognition(
        (result) => {
          const formattedTranscript = enhancedSpeechService.formatTranscript(result.transcript);
          setTranscript(formattedTranscript);
          onTranscript(formattedTranscript);
        },
        (err) => {
          console.error('Speech recognition error:', err);
          setError(t('voice.error.recognitionError'));
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
          // Update history when recording stops
          setHistory(enhancedSpeechService.getTranscriptionHistory());
        },
        {
          lang: detectedLang,
          continuous: true,
          interimResults: true,
          punctuationCorrection: true
        }
      );
      
      setIsRecording(true);
    } catch (err: any) {
      console.error('Error starting speech recognition:', err);
      setError(err.message || t('voice.error.startRecordingError'));
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    enhancedSpeechService.stopEnhancedSpeechRecognition();
    setIsRecording(false);
    // Update history when recording stops
    setHistory(enhancedSpeechService.getTranscriptionHistory());
  };

  const clearHistory = () => {
    enhancedSpeechService.clearTranscriptionHistory();
    setHistory([]);
  };

  const applyHistoricalTranscript = (text: string) => {
    setTranscript(text);
    onTranscript(text);
    setShowHistory(false);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="relative">
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder={placeholder}
          className="w-full p-4 bg-orange-50/50 rounded-2xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none resize-none transition-all min-h-[120px]"
        />
        
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          {isRecording && (
            <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              {recordingDuration.toFixed(1)}s
            </div>
          )}
          
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isRecording && recordingDuration > 29}
            className={`p-2 rounded-full transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
            aria-label={isRecording ? t('voice.stopRecording') : t('voice.startRecording')}
          >
            {isRecording ? (
              <Square className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors text-sm"
        >
          <History className="w-4 h-4" />
          {t('voice.transcriptionHistory')}
        </button>
        
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-1 px-3 py-2 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 transition-colors text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            {t('common.clear')}
          </button>
        )}
        
        <div className="text-xs text-gray-500 ml-2">
          {t('voice.detectedLanguage')}: {detectedLanguage}
        </div>
      </div>
      
      {showHistory && history.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-orange-100 max-h-60 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-3">{t('voice.transcriptionHistory')}</h3>
          <div className="space-y-3">
            {history.slice().reverse().map((item) => (
              <div 
                key={item.id}
                className="p-3 bg-orange-50 rounded-xl cursor-pointer hover:bg-orange-100 transition-colors"
                onClick={() => applyHistoricalTranscript(item.text)}
              >
                <p className="text-gray-800 text-sm line-clamp-2">{item.text}</p>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  <span>{(item.duration).toFixed(1)}s</span>
                  <span>{Math.round(item.confidence * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {showHistory && history.length === 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-orange-100 text-center text-gray-500">
          {t('voice.history.empty')}
        </div>
      )}
    </div>
  );
};

export default EnhancedVoiceInput;
