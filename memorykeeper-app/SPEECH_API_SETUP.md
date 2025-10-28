# Web Speech API Setup Guide for MemoryKeeper

This guide explains how to use the Web Speech API for voice commands and recording in the MemoryKeeper application.

## Overview

The Web Speech API enables voice interaction in web applications. This implementation provides both speech recognition (voice-to-text) and speech synthesis (text-to-speech) capabilities.

## Browser Support

The Web Speech API is supported in most modern browsers:
- Chrome 25+ (with webkit prefix)
- Edge 79+
- Firefox (partial support)
- Safari (partial support)

**Note**: Speech recognition requires a secure context (HTTPS or localhost).

## Key Features

1. **Speech Recognition**: Convert spoken words to text
2. **Speech Synthesis**: Convert text to spoken words
3. **Voice Customization**: Adjust volume, rate, and pitch
4. **Multiple Voices**: Use different available voices
5. **Error Handling**: Comprehensive error handling for all operations

## Implementation Details

### Speech Service Functions

The application includes a speech service (`src/lib/speechService.ts`) with the following functions:

- `isSpeechRecognitionSupported()`: Check if speech recognition is supported
- `isSpeechSynthesisSupported()`: Check if speech synthesis is supported
- `startSpeechRecognition()`: Start speech recognition with callbacks
- `speakText()`: Speak text with customizable options
- `stopSpeaking()`: Stop all speech synthesis
- `pauseSpeaking()`: Pause speech synthesis
- `resumeSpeaking()`: Resume speech synthesis
- `getVoices()`: Get available voices
- `speakWithVoice()`: Speak text with a specific voice

### Data Structures

1. **SpeechRecognitionResult**: Represents a speech recognition result
   - `transcript`: The recognized text
   - `confidence`: Confidence level (0.0 to 1.0)

2. **SpeechRecognitionOptions**: Options for speech recognition
   - `lang`: Language code (default: 'en-US')
   - `continuous`: Continuous recognition (default: false)
   - `interimResults`: Interim results (default: false)

## Usage Examples

### Speech Recognition

```typescript
import { startSpeechRecognition, isSpeechRecognitionSupported } from '../lib/speechService';

if (isSpeechRecognitionSupported()) {
  const stopListening = startSpeechRecognition(
    (result) => {
      console.log('Transcript:', result.transcript);
      console.log('Confidence:', result.confidence);
    },
    (error) => {
      console.error('Speech recognition error:', error);
    },
    () => {
      console.log('Speech recognition ended');
    },
    {
      lang: 'en-US',
      continuous: false,
      interimResults: false
    }
  );
  
  // To stop listening
  // stopListening();
} else {
  console.log('Speech recognition not supported');
}
```

### Speech Synthesis

```typescript
import { speakText, isSpeechSynthesisSupported } from '../lib/speechService';

if (isSpeechSynthesisSupported()) {
  const success = speakText('Hello, world!', {
    volume: 1,
    rate: 1,
    pitch: 1,
    onEnd: () => {
      console.log('Speech finished');
    },
    onError: (error) => {
      console.error('Speech error:', error);
    }
  });
  
  if (!success) {
    console.log('Failed to speak text');
  }
} else {
  console.log('Speech synthesis not supported');
}
```

### Using Specific Voices

```typescript
import { getVoices, speakWithVoice } from '../lib/speechService';

// Get available voices
const voices = await getVoices();

// Speak with a specific voice
if (voices.length > 0) {
  const success = await speakWithVoice('Hello with a specific voice!', voices[0].name, {
    volume: 1,
    rate: 1,
    pitch: 1
  });
}
```

## Testing the Integration

1. Start the development server: `npm run dev`
2. Navigate to `/speech-test` to test the Web Speech API features
3. Use the test interface to try speech recognition and synthesis

## Security Considerations

1. **HTTPS Required**: Speech recognition requires a secure context (HTTPS or localhost)
2. **User Permission**: Users must grant microphone permission for speech recognition
3. **Privacy**: Audio is processed locally and not sent to external servers by default

## Error Handling

The implementation includes comprehensive error handling:

- Browser compatibility checks
- Permission denied errors
- Network errors (for cloud-based services)
- Audio input errors
- Speech synthesis errors

## Performance Considerations

- Speech recognition is processed locally in modern browsers
- Minimal impact on application performance
- Asynchronous operations to prevent UI blocking

## Integration with MemoryKeeper Features

### Voice Journaling

Users can record their memories using voice input:

```typescript
const handleVoiceInput = () => {
  startSpeechRecognition(
    (result) => {
      // Add the transcript to the journal
      setJournalInput(result.transcript);
    },
    (error) => {
      console.error('Voice input error:', error);
      alert('Error with voice input. Please try again.');
    }
  );
};
```

### Voice Hints in Games

Provide audio hints in memory games:

```typescript
const provideVoiceHint = (hintText: string) => {
  speakText(hintText, {
    rate: 0.9,
    pitch: 1.1,
    onEnd: () => {
      // Hide hint after speaking
      setShowHint(false);
    }
  });
};
```

### Accessibility Features

Enhance accessibility for users with visual impairments:

```typescript
const speakNavigation = (text: string) => {
  if (userPrefersVoiceNavigation) {
    speakText(text);
  }
};
```

## Troubleshooting

If you encounter issues:

1. Check browser console for Web Speech API errors
2. Verify that the browser supports the Web Speech API
3. Ensure you're using HTTPS or localhost for speech recognition
4. Check that the user has granted microphone permission
5. Verify that a microphone is connected and working
6. Review error messages in the test interface

## Future Enhancements

1. **Continuous Recognition**: Implement continuous speech recognition for longer sessions
2. **Command Recognition**: Add specific voice commands for app navigation
3. **Voice Training**: Implement voice training for better recognition accuracy
4. **Multi-language Support**: Add support for multiple languages
5. **Offline Voice Recognition**: Implement offline voice recognition capabilities