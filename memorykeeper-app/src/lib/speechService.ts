export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

/**
 * Check if speech recognition is supported
 */
export const isSpeechRecognitionSupported = (): boolean => {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

/**
 * Check if speech synthesis is supported
 */
export const isSpeechSynthesisSupported = (): boolean => {
  return !!window.speechSynthesis;
};

/**
 * Start speech recognition
 */
export const startSpeechRecognition = (
  onResult: (result: SpeechRecognitionResult) => void,
  onError?: (error: any) => void,
  onEnd?: () => void,
  options: SpeechRecognitionOptions = {}
): (() => void) => {
  if (!isSpeechRecognitionSupported()) {
    throw new Error('Speech recognition is not supported in this browser');
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = options.lang || 'en-US';
  recognition.continuous = options.continuous || false;
  recognition.interimResults = options.interimResults || false;

  recognition.onresult = (event: any) => {
    const result = event.results[event.resultIndex];
    if (result && result[0]) {
      onResult({
        transcript: result[0].transcript,
        confidence: result[0].confidence
      });
    }
  };

  recognition.onerror = (event: any) => {
    if (onError) {
      onError(event);
    }
  };

  recognition.onend = () => {
    if (onEnd) {
      onEnd();
    }
  };

  recognition.start();

  // Return a function to stop the recognition
  return () => {
    recognition.stop();
  };
};

/**
 * Speak text using speech synthesis
 */
export const speakText = (
  text: string,
  options: {
    lang?: string;
    volume?: number;
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
    onError?: (error: any) => void;
  } = {}
): boolean => {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis is not supported in this browser');
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  utterance.lang = options.lang || 'en-US';
  utterance.volume = options.volume !== undefined ? options.volume : 1;
  utterance.rate = options.rate !== undefined ? options.rate : 1;
  utterance.pitch = options.pitch !== undefined ? options.pitch : 1;

  if (options.onEnd) {
    utterance.onend = () => options.onEnd && options.onEnd();
  }

  if (options.onError) {
    utterance.onerror = (event: any) => options.onError && options.onError(event);
  }

  window.speechSynthesis.speak(utterance);
  return true;
};

/**
 * Stop all speech synthesis
 */
export const stopSpeaking = (): void => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Pause speech synthesis
 */
export const pauseSpeaking = (): void => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.pause();
  }
};

/**
 * Resume speech synthesis
 */
export const resumeSpeaking = (): void => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.resume();
  }
};

/**
 * Get available voices
 */
export const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve([]);
      return;
    }

    let voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // If voices aren't immediately available, wait for them to load
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };

    // Set a timeout in case voices never load
    setTimeout(() => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    }, 1000);
  });
};

/**
 * Speak text with a specific voice
 */
export const speakWithVoice = async (
  text: string,
  voiceName: string,
  options: {
    volume?: number;
    rate?: number;
    pitch?: number;
    onEnd?: () => void;
    onError?: (error: any) => void;
  } = {}
): Promise<boolean> => {
  if (!isSpeechSynthesisSupported()) {
    console.warn('Speech synthesis is not supported in this browser');
    return false;
  }

  const voices = await getVoices();
  const voice = voices.find(v => v.name === voiceName);

  const utterance = new SpeechSynthesisUtterance(text);
  
  utterance.voice = voice || null;
  utterance.volume = options.volume !== undefined ? options.volume : 1;
  utterance.rate = options.rate !== undefined ? options.rate : 1;
  utterance.pitch = options.pitch !== undefined ? options.pitch : 1;

  if (options.onEnd) {
    utterance.onend = () => options.onEnd && options.onEnd();
  }

  if (options.onError) {
    utterance.onerror = (event: any) => options.onError && options.onError(event);
  }

  window.speechSynthesis.speak(utterance);
  return true;
};