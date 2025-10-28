import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import type { FC } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { useAppState } from '../lib/AppStateContext';
import { useError } from '../lib/ErrorContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  selectedMemory: any;
  onMemorySelect: (memory: any) => void;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
}

const ChatInterface: FC<ChatInterfaceProps> = ({ selectedMemory, onMemorySelect, onImageGenerated }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI Memory Assistant. I can help you explore your memories, generate images, or answer questions about your life story. What would you like to do today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { state } = useAppState();
  const { addToast } = useError();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isGenerating) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    try {
      // Process user input and generate appropriate response
      const response = await processUserInput(inputValue, selectedMemory);
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error processing chat message:', error);
      addToast({
        type: 'error',
        title: 'Chat Error',
        message: 'Failed to process your message. Please try again.',
        duration: 4000
      });
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Could you try rephrasing that?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const processUserInput = async (input: string, memory: any): Promise<string> => {
    // Check for specific commands
    const lowerInput = input.toLowerCase();
    
    // Image generation command
    if (lowerInput.includes('generate') && (lowerInput.includes('image') || lowerInput.includes('visual') || lowerInput.includes('picture'))) {
      return handleImageGenerationRequest(input, memory);
    }
    
    // Memory selection command
    if (lowerInput.includes('memory') || lowerInput.includes('recall')) {
      return handleMemorySelectionRequest(input);
    }
    
    // Default conversational response
    return await generateConversationalResponse(input);
  };

  const handleImageGenerationRequest = async (input: string, memory: any): Promise<string> => {
    if (!memory) {
      return "Please select a memory first before I can generate an image. You can choose a memory from the selection panel.";
    }

    try {
      // Extract image description from input or use memory content
      let imagePrompt = input;
      if (memory) {
        imagePrompt = `Create an image representing this memory: "${memory.prompt}" - ${memory.response}`;
      }

      // Simulate image generation (in a real implementation, this would call the AI service)
      setTimeout(() => {
        // This would be replaced with actual image generation
        const placeholderUrl = "https://placehold.co/600x400/4F46E5/FFFFFF?text=AI+Generated+Image";
        onImageGenerated(placeholderUrl, imagePrompt);
      }, 1000);

      return `I'm creating an image based on your memory: "${memory.prompt}". This will take just a moment...`;
    } catch (error) {
      console.error('Error generating image:', error);
      return "I'm sorry, I couldn't generate an image right now. Please try again later.";
    }
  };

  const handleMemorySelectionRequest = (input: string): string => {
    if (state.memories.length === 0) {
      return "You don't have any memories saved yet. Try adding some memories first!";
    }

    // Find matching memories based on keywords
    const matchingMemories = state.memories.filter(memory => 
      input.includes(memory.prompt.toLowerCase()) || 
      memory.prompt.toLowerCase().includes(input) ||
      memory.response.toLowerCase().includes(input)
    );

    if (matchingMemories.length > 0) {
      // Select the first matching memory
      onMemorySelect(matchingMemories[0]);
      return `I found a memory that matches your request: "${matchingMemories[0].prompt}". I've selected it for you. What would you like to do with this memory?`;
    }

    // If no specific match, suggest the most recent memory
    const recentMemory = state.memories[0];
    onMemorySelect(recentMemory);
    return `I've selected your most recent memory: "${recentMemory.prompt}". What would you like to do with this memory?`;
  };

  const generateConversationalResponse = async (input: string): Promise<string> => {
    // In a real implementation, this would call the AI service for conversational responses
    // For now, we'll provide template responses based on input content
    
    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return "Hello! It's great to see you today. How can I help you with your memories?";
    }
    
    if (input.includes('help')) {
      return "I can help you in several ways:\n\n1. Explore your memories by asking questions about them\n2. Generate images from your memories\n3. Find specific memories by topic or date\n4. Suggest ways to enhance your memories\n\nWhat would you like to do?";
    }
    
    if (input.includes('thank')) {
      return "You're very welcome! I'm here to help preserve and celebrate your precious memories.";
    }
    
    // Default response
    return "That's an interesting point. I'm here to help you explore your memories in meaningful ways. Would you like me to help you generate an image from one of your memories, or perhaps find a specific memory for you?";
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-2xl mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-purple-500 text-white rounded-br-none'
                  : 'bg-white border border-gray-200 rounded-bl-none'
              }`}
            >
              <div className="flex items-start gap-2">
                {message.role === 'assistant' ? (
                  <Bot className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <User className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none p-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-500" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me about your memories..."
          className="flex-1 h-16 p-3 bg-white border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isGenerating}
        />
        <button
          onClick={handleSend}
          disabled={isGenerating || !inputValue.trim()}
          className="w-12 h-12 bg-purple-500 text-white rounded-2xl flex items-center justify-center hover:bg-purple-600 transition-colors disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
