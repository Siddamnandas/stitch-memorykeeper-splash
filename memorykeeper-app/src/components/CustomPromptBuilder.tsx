import { useState, type FC } from 'react';
import { Plus, Save, Trash2, Calendar, Repeat } from 'lucide-react';
import { useError } from '../lib/ErrorContext';

interface CustomPrompt {
  id: string;
  text: string;
  category: string;
  frequency: 'once' | 'weekly' | 'monthly';
  createdAt: Date;
}

const categories = [
  'Childhood',
  'Family',
  'Career',
  'Travel',
  'Holidays',
  'Relationships',
  'Achievements',
  'Challenges',
  'Traditions',
  'Other'
];

const CustomPromptBuilder: FC<{ 
  onPromptSaved: (prompt: string) => void;
}> = ({ onPromptSaved }) => {
  const [prompts, setPrompts] = useState<CustomPrompt[]>([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [frequency, setFrequency] = useState<'once' | 'weekly' | 'monthly'>('once');
  const { addToast } = useError();

  const handleSavePrompt = () => {
    if (!newPrompt.trim()) {
      addToast({
        type: 'warning',
        title: 'Empty Prompt',
        message: 'Please enter a prompt before saving.',
        duration: 3000
      });
      return;
    }

    const prompt: CustomPrompt = {
      id: Date.now().toString(),
      text: newPrompt,
      category: selectedCategory,
      frequency,
      createdAt: new Date()
    };

    setPrompts(prev => [...prev, prompt]);
    setNewPrompt('');
    
    addToast({
      type: 'success',
      title: 'Prompt Saved!',
      message: 'Your custom prompt has been saved to your library.',
      duration: 3000
    });
  };

  const handleUsePrompt = (prompt: CustomPrompt) => {
    onPromptSaved(prompt.text);
    addToast({
      type: 'success',
      title: 'Prompt Selected',
      message: 'Custom prompt loaded. You can now use it in your journaling.',
      duration: 3000
    });
  };

  const handleDeletePrompt = (id: string) => {
    setPrompts(prev => prev.filter(prompt => prompt.id !== id));
    addToast({
      type: 'info',
      title: 'Prompt Deleted',
      message: 'Custom prompt removed from your library.',
      duration: 3000
    });
  };

  return (
    <div className="space-y-6">
      {/* Create New Prompt */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-orange-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Create Custom Prompt</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prompt Text</label>
            <textarea
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              placeholder="Write your custom memory prompt here..."
              className="w-full h-20 p-3 bg-orange-50/50 rounded-xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none resize-none"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 bg-orange-50/50 rounded-xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'once' | 'weekly' | 'monthly')}
                className="w-full p-3 bg-orange-50/50 rounded-xl border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-200/50 outline-none"
              >
                <option value="once">Once</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleSavePrompt}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Prompt</span>
          </button>
        </div>
      </div>
      
      {/* Saved Prompts */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-orange-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Your Prompt Library</h3>
        
        {prompts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Plus className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No custom prompts yet. Create your first prompt above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prompts.map(prompt => (
              <div key={prompt.id} className="p-4 bg-orange-50/50 rounded-xl border border-orange-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{prompt.text}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                        {prompt.category}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                        {prompt.frequency === 'weekly' ? <Repeat className="w-3 h-3" /> : 
                         prompt.frequency === 'monthly' ? <Calendar className="w-3 h-3" /> : null}
                        {prompt.frequency.charAt(0).toUpperCase() + prompt.frequency.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUsePrompt(prompt)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Use
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomPromptBuilder;
