import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  startSpeechRecognition as originalStartSpeechRecognition,
  speakText as originalSpeakText,
  getVoices as originalGetVoices,
  speakWithVoice as originalSpeakWithVoice
} from './speechService';
import { requestTranscription } from './aiProxyClient';

export interface EnhancedSpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  timestamp: Date;
}

export interface EnhancedSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  grammar?: string; // SRGS grammar
}

export interface TranscriptionHistoryItem {
  id: string;
  text: string;
  timestamp: Date;
  duration: number; // in seconds
  confidence: number;
}

export interface SpeechEnhancementOptions {
  noiseReduction?: boolean;
  punctuationCorrection?: boolean;
  keywordSpotting?: string[]; // Keywords to highlight
  customGrammar?: string; // Custom speech grammar
  useWhisper?: boolean; // Use OpenAI Whisper for enhanced accuracy
}

/**
 * Enhanced speech recognition with better accuracy and features
 */
class EnhancedSpeechService {
  private transcriptionHistory: TranscriptionHistoryItem[] = [];
  private isRecording = false;
  private startTime: Date | null = null;
  private stopFunction: (() => void) | null = null;
  private audioChunks: Blob[] = [];
  private mediaRecorder: MediaRecorder | null = null;

  /**
   * Start enhanced speech recognition with improved features
   */
  async startEnhancedSpeechRecognition(
    onResult: (result: EnhancedSpeechRecognitionResult) => void,
    onError?: (error: any) => void,
    onEnd?: () => void,
    options: EnhancedSpeechRecognitionOptions & SpeechEnhancementOptions = {}
  ): Promise<() => void> {
    if (!isSpeechRecognitionSupported()) {
      throw new Error('Speech recognition is not supported in this browser');
    }

    // If Whisper is requested, use audio recording approach
    if (options.useWhisper) {
      return this.startWhisperSpeechRecognition(onResult, onError, onEnd, options);
    }

    // Apply enhancements
    const enhancedOptions: EnhancedSpeechRecognitionOptions = {
      lang: options.lang || 'en-US',
      continuous: options.continuous !== undefined ? options.continuous : true,
      interimResults: options.interimResults !== undefined ? options.interimResults : true,
      maxAlternatives: options.maxAlternatives || 1
    };

    this.startTime = new Date();
    this.isRecording = true;

    // Use the original speech recognition service with enhanced options
    this.stopFunction = originalStartSpeechRecognition(
      (result) => {
        // Apply post-processing enhancements
        const processedTranscript = this.applyEnhancements(
          result.transcript,
          options
        );

        onResult({
          transcript: processedTranscript,
          confidence: result.confidence,
          isFinal: true, // In continuous mode, we'll treat all results as final for simplicity
          timestamp: new Date()
        });

        // Add to transcription history
        this.addToTranscriptionHistory(processedTranscript, result.confidence);
      },
      (error) => {
        this.isRecording = false;
        if (onError) {
          onError(error);
        }
      },
      () => {
        this.isRecording = false;
        if (onEnd) {
          onEnd();
        }
      },
      enhancedOptions
    );

    return () => {
      this.stopEnhancedSpeechRecognition();
    };
  }

  /**
   * Stop enhanced speech recognition
   */
  stopEnhancedSpeechRecognition(): void {
    if (this.stopFunction) {
      this.stopFunction();
      this.stopFunction = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.isRecording = false;
  }

  /**
   * Start Whisper-based speech recognition for enhanced accuracy
   */
  private async startWhisperSpeechRecognition(
    onResult: (result: EnhancedSpeechRecognitionResult) => void,
    onError?: (error: any) => void,
    onEnd?: () => void,
    options: EnhancedSpeechRecognitionOptions & SpeechEnhancementOptions = {}
  ): Promise<() => void> {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          const transcription = await requestTranscription(audioBlob, {
            language: options.lang || 'en'
          });
          const transcript = transcription.text;

          // Apply post-processing enhancements
          const processedTranscript = this.applyEnhancements(transcript, options);

          onResult({
            transcript: processedTranscript,
            confidence: 0.95, // Whisper typically has high confidence
            isFinal: true,
            timestamp: new Date()
          });

          // Add to transcription history
          this.addToTranscriptionHistory(processedTranscript, 0.95);

          // Stop the media stream
          stream.getTracks().forEach(track => track.stop());

          if (onEnd) {
            onEnd();
          }
        } catch (error: any) {
          console.error('Whisper transcription error:', error);
          if (onError) {
            onError(error);
          }
        }
      };

      this.startTime = new Date();
      this.isRecording = true;
      this.mediaRecorder.start();

      return () => {
        this.stopEnhancedSpeechRecognition();
      };
    } catch (error: any) {
      console.error('Error starting Whisper recording:', error);
      if (onError) {
        onError(error);
      }
      throw error;
    }
  }

  /**
   * Apply speech enhancements to transcript
   */
  private applyEnhancements(
    transcript: string, 
    options: SpeechEnhancementOptions
  ): string {
    let processedTranscript = transcript;

    // Apply punctuation correction if enabled
    if (options.punctuationCorrection) {
      processedTranscript = this.correctPunctuation(processedTranscript);
    }

    // Apply keyword highlighting if specified
    if (options.keywordSpotting && options.keywordSpotting.length > 0) {
      processedTranscript = this.highlightKeywords(
        processedTranscript, 
        options.keywordSpotting
      );
    }

    return processedTranscript;
  }

  /**
   * Basic punctuation correction
   */
  private correctPunctuation(text: string): string {
    // Add periods at the end of sentences that don't have punctuation
    return text.replace(/([^.!?])\s*$/, '$1.');
  }

  /**
   * Highlight keywords in the transcript
   */
  private highlightKeywords(text: string, keywords: string[]): string {
    let highlightedText = text;
    
    keywords.forEach(keyword => {
      // Case insensitive replacement with highlighting
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, '**$1**');
    });
    
    return highlightedText;
  }

  /**
   * Add transcription to history
   */
  private addToTranscriptionHistory(text: string, confidence: number): void {
    if (!this.startTime) return;
    
    const endTime = new Date();
    const duration = (endTime.getTime() - this.startTime.getTime()) / 1000;
    
    const historyItem: TranscriptionHistoryItem = {
      id: `transcript_${Date.now()}`,
      text,
      timestamp: endTime,
      duration,
      confidence
    };
    
    this.transcriptionHistory.push(historyItem);
    
    // Keep only the last 50 transcriptions to prevent memory issues
    if (this.transcriptionHistory.length > 50) {
      this.transcriptionHistory.shift();
    }
  }

  /**
   * Get transcription history
   */
  getTranscriptionHistory(): TranscriptionHistoryItem[] {
    return [...this.transcriptionHistory];
  }

  /**
   * Clear transcription history
   */
  clearTranscriptionHistory(): void {
    this.transcriptionHistory = [];
  }

  /**
   * Get current recording status
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Get recording duration in seconds
   */
  getRecordingDuration(): number {
    if (!this.startTime || !this.isRecording) return 0;

    const now = new Date();
    return (now.getTime() - this.startTime.getTime()) / 1000;
  }

  /**
   * Transcribe existing audio file using Whisper
   */
  async transcribeAudioFile(audioBlob: Blob, language = 'en'): Promise<string> {
    try {
      const transcription = await requestTranscription(audioBlob, { language });
      return transcription.text;
    } catch (error) {
      console.error('Error transcribing audio file:', error);
      throw error;
    }
  }

  /**
   * Enhanced text-to-speech with more options
   */
  async enhancedSpeakText(
    text: string,
    options: {
      lang?: string;
      volume?: number;
      rate?: number;
      pitch?: number;
      voiceName?: string;
      onEnd?: () => void;
      onError?: (error: any) => void;
    } = {}
  ): Promise<boolean> {
    if (!isSpeechSynthesisSupported()) {
      console.warn('Speech synthesis is not supported in this browser');
      return false;
    }

    // If a specific voice is requested, use it
    if (options.voiceName) {
      return await originalSpeakWithVoice(
        text,
        options.voiceName,
        {
          volume: options.volume,
          rate: options.rate,
          pitch: options.pitch,
          onEnd: options.onEnd,
          onError: options.onError
        }
      );
    } else {
      // Use default speech synthesis
      return originalSpeakText(
        text,
        {
          lang: options.lang,
          volume: options.volume,
          rate: options.rate,
          pitch: options.pitch,
          onEnd: options.onEnd,
          onError: options.onError
        }
      );
    }
  }

  /**
   * Get available voices with additional information
   */
  async getEnhancedVoices(): Promise<Array<{
    name: string;
    lang: string;
    isDefault: boolean;
    isLocal: boolean;
    gender?: 'male' | 'female';
  }>> {
    const voices = await originalGetVoices();
    
    return voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      isDefault: voice.default,
      isLocal: !voice.voiceURI.includes('remote'),
      // Try to infer gender from voice name (simplified approach)
      gender: voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') 
        ? 'female' 
        : voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('man') 
          ? 'male' 
          : undefined
    }));
  }

  /**
   * Detect language of the input text (simplified)
   */
  detectLanguage(text: string): string {
    // Very basic language detection based on common words
    const words = text.toLowerCase().split(/\s+/);
    
    // Count occurrences of common words in different languages
    const languageScores: Record<string, number> = {
      'en-US': 0,
      'es-ES': 0,
      'fr-FR': 0,
      'de-DE': 0
    };
    
    // Simple word lists for language detection
    const languageWords: Record<string, string[]> = {
      'en-US': ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of'],
      'es-ES': ['el', 'la', 'y', 'o', 'pero', 'en', 'a', 'para', 'de'],
      'fr-FR': ['le', 'la', 'et', 'ou', 'mais', 'dans', 'à', 'pour', 'de'],
      'de-DE': ['der', 'die', 'und', 'oder', 'aber', 'in', 'zu', 'für', 'von']
    };
    
    words.forEach(word => {
      Object.keys(languageWords).forEach(lang => {
        if (languageWords[lang].includes(word)) {
          languageScores[lang]++;
        }
      });
    });
    
    // Return the language with the highest score
    let detectedLanguage = 'en-US';
    let maxScore = 0;
    
    Object.entries(languageScores).forEach(([lang, score]) => {
      if (score > maxScore) {
        maxScore = score;
        detectedLanguage = lang;
      }
    });
    
    return detectedLanguage;
  }

  /**
   * Format transcript for better readability
   */
  formatTranscript(transcript: string): string {
    // Capitalize first letter
    let formatted = transcript.charAt(0).toUpperCase() + transcript.slice(1);
    
    // Add proper spacing after punctuation
    formatted = formatted.replace(/([.!?])\s*/g, '$1 ');
    
    // Trim extra whitespace
    formatted = formatted.trim();
    
    return formatted;
  }
}

// Create and export a singleton instance
const enhancedSpeechService = new EnhancedSpeechService();
export default enhancedSpeechService;
