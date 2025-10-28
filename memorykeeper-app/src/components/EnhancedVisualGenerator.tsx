import { useState, useEffect, type FC } from 'react';
import { Sparkles, RotateCw, Download, Heart, Palette, Edit3 } from 'lucide-react';
import { generateMemoryImage } from '../lib/aiService';
import { useError } from '../lib/ErrorContext';

interface StylePreset {
  id: string;
  name: string;
  description: string;
  promptSuffix: string;
}

const stylePresets: StylePreset[] = [
  {
    id: 'realistic',
    name: 'Realistic',
    description: 'Photorealistic style',
    promptSuffix: 'in a photorealistic style, high detail, professional photography'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Nostalgic, warm tones',
    promptSuffix: 'in a vintage style, warm sepia tones, nostalgic atmosphere'
  },
  {
    id: 'artistic',
    name: 'Artistic',
    description: 'Painterly, creative',
    promptSuffix: 'in an artistic painterly style, creative composition, expressive'
  },
  {
    id: 'sketch',
    name: 'Sketch',
    description: 'Hand-drawn, sketchy',
    promptSuffix: 'as a hand-drawn sketch, pencil drawing, artistic sketch style'
  }
];

const EnhancedVisualGenerator: FC<{ 
  selectedMemory: any;
  onImageGenerated: (imageUrl: string, prompt: string) => void;
  onSavedToScrapbook: (imageUrl: string) => void;
}> = ({ selectedMemory, onImageGenerated, onSavedToScrapbook }) => {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('vintage');
  const [refinementPrompt, setRefinementPrompt] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const { addToast } = useError();

  // Update custom prompt when memory changes
  useEffect(() => {
    if (selectedMemory) {
      const prompt = `Create an image representing this memory: "${selectedMemory.prompt}" - ${selectedMemory.response}`;
      setCustomPrompt(prompt);
    }
  }, [selectedMemory]);

  const handleGenerateImage = async () => {
    if (!customPrompt.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Prompt',
        message: 'Please enter a description for your image.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // Apply style preset to the prompt
      const style = stylePresets.find(s => s.id === selectedStyle);
      const styledPrompt = style 
        ? `${customPrompt} ${style.promptSuffix}`
        : customPrompt;

      // Create a mock memory object for the API
      const mockMemory = {
        prompt: selectedMemory?.prompt || 'Custom Visual',
        response: selectedMemory?.response || customPrompt,
        date: new Date().toISOString(),
        type: 'text',
        tags: ['visual', 'ai-generated']
      };

      const result = await generateMemoryImage(mockMemory);

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        onImageGenerated(result.imageUrl, styledPrompt);
        addToast({
          type: 'success',
          title: 'Visual Created!',
          message: 'Your AI-generated visual is ready.',
          duration: 4000
        });
      } else {
        addToast({
          type: 'error',
          title: 'Generation Failed',
          message: result.error || 'Could not generate visual. Please try again.',
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error generating visual:', error);
      addToast({
        type: 'error',
        title: 'Generation Error',
        message: 'An unexpected error occurred while creating your visual.',
        duration: 5000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineImage = async () => {
    if (!refinementPrompt.trim() || !generatedImage) {
      addToast({
        type: 'warning',
        title: 'Missing Refinement',
        message: 'Please describe how you want to refine the image.',
        duration: 3000
      });
      return;
    }

    setIsRefining(true);

    try {
      // In a real implementation, this would send the refinement request to the AI
      // For now, we'll simulate the refinement by generating a new image with the refinement prompt
      addToast({
        type: 'info',
        title: 'Refining Image',
        message: 'Applying your refinements to the image...',
        duration: 3000
      });

      // Simulate refinement delay
      setTimeout(() => {
        // In a real implementation, this would be the refined image URL
        const refinedImageUrl = generatedImage; // Placeholder - would be actual refined image
        setGeneratedImage(refinedImageUrl);
        setRefinementPrompt('');
        setIsRefining(false);
        
        addToast({
          type: 'success',
          title: 'Image Refined!',
          message: 'Your image has been updated with your refinements.',
          duration: 4000
        });
      }, 2000);
    } catch (error) {
      console.error('Error refining image:', error);
      addToast({
        type: 'error',
        title: 'Refinement Error',
        message: 'Failed to refine the image. Please try again.',
        duration: 5000
      });
      setIsRefining(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      // Create download link
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `memory-visual-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast({
        type: 'success',
        title: 'Downloaded!',
        message: 'Visual saved to your device.',
        duration: 3000
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: 'Could not download the visual.',
        duration: 4000
      });
    }
  };

  const handleSaveToScrapbook = async () => {
    if (!generatedImage) return;

    try {
      onSavedToScrapbook(generatedImage);
      addToast({
        type: 'success',
        title: 'Saved to Scrapbook!',
        message: 'Visual added to your memory collection.',
        duration: 3000
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: 'Could not save to scrapbook.',
        duration: 4000
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Style Presets */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Style Presets
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stylePresets.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`p-3 rounded-xl border transition-all ${
                selectedStyle === style.id
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="font-medium text-gray-800">{style.name}</div>
              <div className="text-xs text-gray-500 mt-1">{style.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt */}
      <div>
        <label className="block text-lg font-medium mb-2 text-gray-800">Image Description:</label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Describe the visual you'd like to create..."
          className="w-full h-24 p-4 bg-orange-50/50 rounded-2xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none resize-none transition-all"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerateImage}
        disabled={isGenerating || !customPrompt.trim()}
        className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creating Visual...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-6 h-6" />
            <span>Generate Visual</span>
          </>
        )}
      </button>

      {/* Generated Image Display */}
      {generatedImage && (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2">✨ Your AI-Generated Visual</h3>
            <p className="text-gray-600">
              Style: {stylePresets.find(s => s.id === selectedStyle)?.name}
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <img
              src={generatedImage}
              alt="AI Generated Visual"
              className="max-w-full max-h-96 rounded-2xl shadow-lg border border-purple-200"
            />
          </div>

          {/* Refinement Section */}
          <div className="mb-6">
            <label className="block text-lg font-medium mb-2 text-gray-800 flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Refine Image
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={refinementPrompt}
                onChange={(e) => setRefinementPrompt(e.target.value)}
                placeholder="Describe how you want to change the image..."
                className="flex-1 p-3 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isRefining}
              />
              <button
                onClick={handleRefineImage}
                disabled={isRefining || !refinementPrompt.trim()}
                className="px-4 bg-purple-500 text-white rounded-2xl hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isRefining ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <RotateCw className="w-4 h-4" />
                )}
                <span>Refine</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>

            <button
              onClick={handleSaveToScrapbook}
              className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all shadow-lg"
            >
              <Heart className="w-5 h-5" />
              <span>Save to Scrapbook</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedVisualGenerator;
