import React from 'react';
import { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';

import { ChevronLeft, Sparkles, RotateCcw, Save, Loader2 } from 'lucide-react';
import { useAppState } from '../lib/AppStateContext';
import { generateMemoryPrompt } from '../lib/aiService';
import { addMemory } from '../lib/dataService';
import { useAuth } from '../lib/AuthContext';
import { useError } from '../lib/ErrorContext';

const ProactiveMemoryPrompt: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { state } = useAppState();
  const { user } = useAuth();
  const { addToast } = useError();

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    try {
      const result = await generateMemoryPrompt(state.memories);
      if (result.success) {
        setPrompt(result.content);
      } else {
        // Fallback to sample prompts if AI fails
        const samplePrompts = [
          "What did you have for breakfast this morning?",
          "Describe a cherished childhood memory.",
          "What's something you're grateful for today?",
          "Tell me about a meaningful conversation you had recently."
        ];
        setPrompt(samplePrompts[Math.floor(Math.random() * samplePrompts.length)]);
        addToast({
          type: 'warning',
          title: 'Using Sample Prompt',
          message: 'AI prompt generation unavailable. Using a curated prompt instead.',
          duration: 4000
        });
      }
    } catch (error) {
      // Fallback to sample prompts
      const samplePrompts = [
        "What did you have for breakfast this morning?",
        "Describe a cherished childhood memory.",
        "What's something you're grateful for today?",
        "Tell me about a meaningful conversation you had recently."
      ];
      setPrompt(samplePrompts[Math.floor(Math.random() * samplePrompts.length)]);
      addToast({
        type: 'error',
        title: 'Generation Failed',
        message: 'Could not generate AI prompt. Using a sample prompt instead.',
        duration: 4000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!prompt || !response.trim()) {
      addToast({
        type: 'warning',
        title: 'Incomplete Response',
        message: 'Please provide a response to the memory prompt.',
        duration: 3000
      });
      return;
    }

    if (!user) {
      addToast({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please sign in to save your memories.',
        duration: 4000
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await addMemory({
        prompt,
        response: response.trim(),
        date: new Date().toISOString().split('T')[0],
        type: 'text',
        tags: ['ai-generated', 'proactive']
      }, user.id);

      if (result.error) {
        throw new Error(result.error.message);
      }

      addToast({
        type: 'success',
        title: 'Memory Saved!',
        message: 'Thank you for sharing your memory. It has been saved successfully.',
        duration: 4000
      });

      setPrompt('');
      setResponse('');
    } catch (error: any) {
      console.error('Error saving memory:', error);
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save your memory. Please try again.',
        duration: 5000
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pt-6">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-orange-100"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Memory Prompt</h1>
      </div>
      
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-orange-100 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Daily Memory Prompt</h2>
            <p className="text-sm text-gray-500">Reflect on your experiences</p>
          </div>
        </div>
        
        {!prompt ? (
          <div className="text-center py-8">
            <button 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
              onClick={handleGeneratePrompt}
            >
              <Sparkles className="w-5 h-5" />
              <span>Generate Prompt</span>
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-purple-50 rounded-2xl border border-purple-200">
              <p className="text-lg font-medium text-gray-800">{prompt}</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-lg font-medium mb-2 text-gray-800">Your Response:</label>
              <textarea
                className="w-full h-32 bg-orange-50 border border-orange-200 rounded-2xl p-4 text-gray-700 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none resize-none"
                placeholder="Write your memory here..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex gap-3">
              <button 
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                onClick={handleSubmitResponse}
              >
                <Save className="w-5 h-5" />
                <span>Save Memory</span>
              </button>
              <button 
                className="flex-1 bg-orange-100 text-orange-700 font-bold py-3 px-4 rounded-2xl hover:bg-orange-200 transition-all flex items-center justify-center gap-2"
                onClick={handleGeneratePrompt}
              >
                <RotateCcw className="w-5 h-5" />
                <span>New Prompt</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProactiveMemoryPrompt;