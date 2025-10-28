import { useState, type FC } from 'react';
import { ChevronLeft, Image as ImageIcon, Sparkles, Download, Share, Heart } from 'lucide-react';
import { generateMemoryImage } from '../lib/aiService';
import { useAppState } from '../lib/AppStateContext';
import { useError } from '../lib/ErrorContext';

const VisualContentGenerator: FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedMemory, setSelectedMemory] = useState<any>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const { state } = useAppState();
  const { addToast } = useError();

  const handleGenerateImage = async () => {
    if (!selectedMemory && !customPrompt.trim()) {
      addToast({
        type: 'warning',
        title: 'Missing Content',
        message: 'Please select a memory or enter a custom prompt.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const promptToUse = selectedMemory
        ? `Create a visual representation for this memory: "${selectedMemory.prompt}" - ${selectedMemory.response}`
        : customPrompt.trim();

      // Create a mock memory object for the API
      const mockMemory = {
        prompt: selectedMemory?.prompt || 'Custom Visual',
        response: promptToUse,
        date: new Date().toISOString(),
        type: 'text',
        tags: ['visual', 'ai-generated']
      };

      const result = await generateMemoryImage(mockMemory);

      if (result.success && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
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

  const handleShare = async () => {
    if (!generatedImage) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'MemoryKeeper Visual',
          text: 'Check out this AI-generated visual from my memory!',
          url: generatedImage
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(generatedImage);
        addToast({
          type: 'success',
          title: 'Copied!',
          message: 'Image URL copied to clipboard.',
          duration: 3000
        });
      }
    } catch (error) {
      addToast({
        type: 'warning',
        title: 'Share Unavailable',
        message: 'Sharing is not supported on this device.',
        duration: 4000
      });
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
        <h1 className="text-2xl font-bold text-gray-800">Visual Generator</h1>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">AI Visual Creator</h2>
            <p className="text-sm text-gray-500">Transform memories into beautiful visuals</p>
          </div>
        </div>

        <p className="mb-6 text-gray-600">
          Create stunning AI-generated visuals from your cherished memories. Select a memory or describe what you'd like to visualize.
        </p>

        {/* Memory Selection */}
        <div className="mb-6">
          <label className="block text-lg font-medium mb-3 text-gray-800">Select a Memory (Optional):</label>
          <div className="max-h-40 overflow-y-auto bg-orange-50/50 rounded-2xl p-3 mb-4">
            {state.memories.length > 0 ? (
              state.memories.slice(0, 5).map((memory: any, index: number) => (
                <button
                  key={memory.id || index}
                  onClick={() => {
                    setSelectedMemory(memory);
                    setCustomPrompt('');
                  }}
                  className={`w-full text-left p-3 rounded-xl mb-2 transition-all ${
                    selectedMemory?.id === memory.id
                      ? 'bg-orange-200 border-2 border-orange-400'
                      : 'bg-white/80 hover:bg-orange-100'
                  }`}
                >
                  <div className="font-medium text-gray-800 truncate">{memory.prompt}</div>
                  <div className="text-sm text-gray-600 truncate">{memory.response}</div>
                </button>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No memories available. You can still create visuals with custom prompts!</p>
              </div>
            )}
          </div>

          <div className="text-center mb-4">
            <span className="text-sm text-gray-500">OR</span>
          </div>

          {/* Custom Prompt */}
          <div>
            <label className="block text-lg font-medium mb-2 text-gray-800">Custom Prompt:</label>
            <textarea
              value={customPrompt}
              onChange={(e) => {
                setCustomPrompt(e.target.value);
                if (e.target.value.trim()) {
                  setSelectedMemory(null);
                }
              }}
              placeholder="Describe the visual you'd like to create..."
              className="w-full h-24 p-4 bg-orange-50/50 rounded-2xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none resize-none transition-all"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateImage}
          disabled={isGenerating || (!selectedMemory && !customPrompt.trim())}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 mb-6"
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
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 mb-2">✨ Your AI-Generated Visual</h3>
              <p className="text-gray-600">A beautiful representation of your memory</p>
            </div>

            <div className="flex justify-center mb-6">
              <img
                src={generatedImage}
                alt="AI Generated Visual"
                className="max-w-full max-h-96 rounded-2xl shadow-lg border border-purple-200"
              />
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
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all shadow-lg"
              >
                <Share className="w-5 h-5" />
                <span>Share</span>
              </button>

              <button
                onClick={() => {
                  addToast({
                    type: 'success',
                    title: 'Saved to Favorites!',
                    message: 'Visual added to your memory collection.',
                    duration: 3000
                  });
                }}
                className="flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all shadow-lg"
              >
                <Heart className="w-5 h-5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
        <h3 className="text-lg font-bold text-gray-800 mb-3">💡 Visual Creation Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">For Memories:</h4>
            <ul className="space-y-1">
              <li>• Focus on emotional moments</li>
              <li>• Include sensory details</li>
              <li>• Describe the atmosphere</li>
              <li>• Mention significant objects</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Custom Prompts:</h4>
            <ul className="space-y-1">
              <li>• Be specific about style</li>
              <li>• Include color preferences</li>
              <li>• Mention artistic influences</li>
              <li>• Describe mood and lighting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualContentGenerator;
