import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Image as ImageIcon, BookOpen, MessageSquare, Lightbulb, Network, Grid3X3, Calendar, Heart, TrendingUp, Users, Edit3 } from 'lucide-react';
import { analyzeMemory, generateStory, generateRelatedQuestions, clusterMemoriesByThemes, analyzeTimelinePatterns, mapEmotionalJourney, generateMemoryEnhancementSuggestions, generateCollaborativeSuggestions } from '../lib/aiService';
import { useAppState } from '../lib/AppStateContext';
import { useError } from '../lib/ErrorContext';
import ChatInterface from './ChatInterface';
import EnhancedVisualGenerator from './EnhancedVisualGenerator';
import CustomPromptBuilder from './CustomPromptBuilder';

const AiStudio: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedMemory, setSelectedMemory] = useState<any>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'visual' | 'prompts' | 'analyze' | 'story' | 'questions' | 'graph' | 'clusters' | 'timeline' | 'journey' | 'enhance' | 'collaborate'>('chat');
  const { state } = useAppState();
  const { addToast } = useError();

  const handleAnalyzeMemory = async () => {
    if (!selectedMemory) {
      addToast({
        type: 'warning',
        title: 'No Memory Selected',
        message: 'Please select a memory to analyze.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setGeneratedImage(null);

    try {
      const result = await analyzeMemory(selectedMemory);
      if (result.success && result.analysis) {
        setGeneratedContent(`📊 **Analysis Results:**

**Keywords:** ${result.analysis.keywords.join(', ')}

**Sentiment:** ${result.analysis.sentiment}

**Summary:** ${result.analysis.summary}

**Emotional Insights:** This memory appears to carry ${result.analysis.sentiment} emotions and focuses on themes of ${result.analysis.keywords.slice(0, 3).join(', ')}.`);
      } else {
        setGeneratedContent('Unable to analyze this memory. Please try again.');
        addToast({
          type: 'error',
          title: 'Analysis Failed',
          message: 'Could not analyze the selected memory.',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error analyzing memory:', error);
      setGeneratedContent('Error analyzing memory. Please try again.');
      addToast({
        type: 'error',
        title: 'Analysis Error',
        message: 'An unexpected error occurred during analysis.',
        duration: 4000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!selectedMemory) {
      addToast({
        type: 'warning',
        title: 'No Memory Selected',
        message: 'Please select a memory to create a story from.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setGeneratedImage(null);

    try {
      const result = await generateStory(selectedMemory);
      if (result.success) {
        setGeneratedContent(`📖 **AI-Generated Story:**

${result.content}`);
      } else {
        setGeneratedContent('Unable to generate a story. Please try again.');
        addToast({
          type: 'error',
          title: 'Story Generation Failed',
          message: 'Could not create a story from the selected memory.',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error generating story:', error);
      setGeneratedContent('Error generating story. Please try again.');
      addToast({
        type: 'error',
        title: 'Story Generation Error',
        message: 'An unexpected error occurred during story creation.',
        duration: 4000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!selectedMemory) {
      addToast({
        type: 'warning',
        title: 'No Memory Selected',
        message: 'Please select a memory to generate questions for.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setGeneratedImage(null);

    try {
      const result = await generateRelatedQuestions(selectedMemory);
      if (result.success && result.questions) {
        setGeneratedContent(`🤔 **Follow-up Questions:**

${result.questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}

These questions can help you explore this memory more deeply and uncover additional details.`);
      } else {
        setGeneratedContent('Unable to generate questions. Please try again.');
        addToast({
          type: 'error',
          title: 'Question Generation Failed',
          message: 'Could not generate follow-up questions.',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setGeneratedContent('Error generating questions. Please try again.');
      addToast({
        type: 'error',
        title: 'Question Generation Error',
        message: 'An unexpected error occurred during question generation.',
        duration: 4000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExploreGraph = async () => {
    if (!selectedMemory) {
      addToast({
        type: 'warning',
        title: 'No Memory Selected',
        message: 'Please select a memory to explore connections.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setGeneratedImage(null);

    try {
      // In a real implementation, this would navigate to the knowledge graph view
      // For now, we'll simulate the response
      setGeneratedContent(`🔗 **Memory Connections Explorer:**

Your selected memory: "${selectedMemory.prompt}"

**AI Analysis:**
- This memory connects to 3 other memories in your collection
- Strongest connection: Emotional similarity (85%)
- Keywords in common: family, love, tradition
- Temporal proximity: 2 related memories from the same time period

**Suggested Exploration:**
1. View the knowledge graph to see visual connections
2. Explore related memories through the "Connections" tab
3. Generate a story that weaves together connected memories

The knowledge graph shows how your memories form a rich tapestry of interconnected experiences, revealing patterns and themes across your life story.`);
    } catch (error) {
      console.error('Error exploring graph:', error);
      setGeneratedContent('Error exploring memory connections. Please try again.');
      addToast({
        type: 'error',
        title: 'Connection Exploration Error',
        message: 'An unexpected error occurred during connection exploration.',
        duration: 4000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClusterMemories = async () => {
    if (state.memories.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Memories Available',
        message: 'Please add some memories first to cluster them.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setGeneratedImage(null);

    try {
      const result = await clusterMemoriesByThemes(state.memories);
      if (result.success && result.clusters) {
        let content = `🧩 **Memory Clusters by Themes:**\n\n`;
        
        result.clusters.forEach((cluster, index) => {
          content += `**Theme ${index + 1}: ${cluster.theme}**\n`;
          content += `Memories: ${cluster.memoryIds.length}\n\n`;
        });
        
        content += `These themes represent the main topics and experiences in your memory collection. You can explore each theme to see related memories.`;
        
        setGeneratedContent(content);
      } else {
        setGeneratedContent('Unable to cluster memories. Please try again.');
        addToast({
          type: 'error',
          title: 'Clustering Failed',
          message: 'Could not cluster your memories.',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error clustering memories:', error);
      setGeneratedContent('Error clustering memories. Please try again.');
      addToast({
        type: 'error',
        title: 'Clustering Error',
        message: 'An unexpected error occurred during memory clustering.',
        duration: 4000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeTimeline = async () => {
    if (state.memories.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Memories Available',
        message: 'Please add some memories first to analyze the timeline.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setGeneratedImage(null);

    try {
      const result = await analyzeTimelinePatterns(state.memories);
      if (result.success && result.timelineInsights) {
        setGeneratedContent(`📅 **Timeline Analysis:**

${result.timelineInsights}

This analysis reveals patterns in when and how frequently you've recorded memories, helping you understand your memory recording habits.`);
      } else {
        setGeneratedContent('Unable to analyze timeline. Please try again.');
        addToast({
          type: 'error',
          title: 'Timeline Analysis Failed',
          message: 'Could not analyze your memory timeline.',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error analyzing timeline:', error);
      setGeneratedContent('Error analyzing timeline. Please try again.');
      addToast({
        type: 'error',
        title: 'Timeline Analysis Error',
        message: 'An unexpected error occurred during timeline analysis.',
        duration: 4000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMapEmotionalJourney = async () => {
    if (state.memories.length === 0) {
      addToast({
        type: 'warning',
        title: 'No Memories Available',
        message: 'Please add some memories first to map your emotional journey.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setGeneratedImage(null);

    try {
      const result = await mapEmotionalJourney(state.memories);
      if (result.success && result.emotionalJourney) {
        setGeneratedContent(`💖 **Emotional Journey Map:**

${result.emotionalJourney}

This emotional journey shows how your feelings and experiences have evolved over time, revealing patterns in your emotional life.`);
      } else {
        setGeneratedContent('Unable to map emotional journey. Please try again.');
        addToast({
          type: 'error',
          title: 'Emotional Journey Mapping Failed',
          message: 'Could not map your emotional journey.',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error mapping emotional journey:', error);
      setGeneratedContent('Error mapping emotional journey. Please try again.');
      addToast({
        type: 'error',
        title: 'Emotional Journey Mapping Error',
        message: 'An unexpected error occurred during emotional journey mapping.',
        duration: 4000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceMemory = async () => {
    if (!selectedMemory) {
      addToast({
        type: 'warning',
        title: 'No Memory Selected',
        message: 'Please select a memory to enhance.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setGeneratedImage(null);

    try {
      const result = await generateMemoryEnhancementSuggestions(selectedMemory);
      if (result.success && result.suggestions) {
        setGeneratedContent(`✨ **Memory Enhancement Suggestions:**

${result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n\n')}

These suggestions can help you enrich your memory with additional details, sensory experiences, and emotional depth.`);
      } else {
        setGeneratedContent('Unable to generate enhancement suggestions. Please try again.');
        addToast({
          type: 'error',
          title: 'Enhancement Suggestions Failed',
          message: 'Could not generate enhancement suggestions.',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error generating enhancement suggestions:', error);
      setGeneratedContent('Error generating enhancement suggestions. Please try again.');
      addToast({
        type: 'error',
        title: 'Enhancement Suggestions Error',
        message: 'An unexpected error occurred while generating enhancement suggestions.',
        duration: 4000
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCollaborativeSuggestions = async () => {
    if (!selectedMemory) {
      addToast({
        type: 'warning',
        title: 'No Memory Selected',
        message: 'Please select a memory to generate collaborative suggestions.',
        duration: 3000
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    setGeneratedImage(null);

    try {
      // For demo purposes, we'll use "family member" as the relationship
      const result = await generateCollaborativeSuggestions(selectedMemory, 'family member');
      if (result.success && result.suggestions) {
        setGeneratedContent(`👥 **Collaborative Memory Suggestions:**

${result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n\n')}

These suggestions can help you share this memory with loved ones and create shared experiences around it.`);
      } else {
        setGeneratedContent('Unable to generate collaborative suggestions. Please try again.');
        addToast({
          type: 'error',
          title: 'Collaborative Suggestions Failed',
          message: 'Could not generate collaborative suggestions.',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error generating collaborative suggestions:', error);
      setGeneratedContent('Error generating collaborative suggestions. Please try again.');
      addToast({
        type: 'error',
        title: 'Collaborative Suggestions Error',
        message: 'An unexpected error occurred while generating collaborative suggestions.',
        duration: 4000
      });
    } finally {
      setIsGenerating(false);
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
        <h1 className="text-2xl font-bold text-gray-800">AI Studio</h1>
      </div>
      
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">AI Memory Assistant</h2>
            <p className="text-sm text-gray-500">Analyze and enhance your memories</p>
          </div>
        </div>
        
        <p className="mb-6 text-gray-600">
          Select a memory and use AI to analyze, create stories, generate questions, or create visual representations.
        </p>

        {/* Memory Selection */}
        <div className="mb-6">
          <label className="block text-lg font-medium mb-3 text-gray-800">Select a Memory:</label>
          <div className="max-h-40 overflow-y-auto bg-orange-50/50 rounded-2xl p-3">
            {state.memories.length > 0 ? (
              state.memories.slice(0, 5).map((memory: any, index: number) => (
                <button
                  key={memory.id || index}
                  onClick={() => setSelectedMemory(memory)}
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
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No memories available. Add some memories first!</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Studio Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { key: 'chat', label: 'Chat', icon: MessageSquare },
              { key: 'visual', label: 'Visual Builder', icon: ImageIcon },
              { key: 'prompts', label: 'Prompts', icon: Edit3 },
              { key: 'analyze', label: 'Analyze', icon: Sparkles },
              { key: 'story', label: 'Create Story', icon: BookOpen },
              { key: 'questions', label: 'Questions', icon: MessageSquare },
              { key: 'graph', label: 'Connections', icon: Network },
              { key: 'clusters', label: 'Clusters', icon: Grid3X3 },
              { key: 'timeline', label: 'Timeline', icon: Calendar },
              { key: 'journey', label: 'Journey', icon: Heart },
              { key: 'enhance', label: 'Enhance', icon: TrendingUp },
              { key: 'collaborate', label: 'Collaborate', icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1 min-w-[100px] ${
                  activeTab === key
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'chat' && (
              <ChatInterface
                selectedMemory={selectedMemory}
                onMemorySelect={setSelectedMemory}
                onImageGenerated={(imageUrl, prompt) => {
                  setGeneratedImage(imageUrl);
                  setGeneratedContent(`🎨 **AI-Generated Visual:**\n\n${prompt}`);
                }}
              />
            )}

            {activeTab === 'visual' && (
              <EnhancedVisualGenerator
                selectedMemory={selectedMemory}
                onImageGenerated={(imageUrl, prompt) => {
                  setGeneratedImage(imageUrl);
                  setGeneratedContent(`🎨 **AI-Generated Visual:**\n\n${prompt}`);
                }}
                onSavedToScrapbook={(_imageUrl) => {
                  addToast({
                    type: 'success',
                    title: 'Saved to Scrapbook!',
                    message: 'Visual added to your memory collection.',
                    duration: 3000
                  });
                }}
              />
            )}

            {activeTab === 'prompts' && (
              <CustomPromptBuilder
                onPromptSaved={(_prompt) => {
                  addToast({
                    type: 'success',
                    title: 'Prompt Loaded!',
                    message: 'Custom prompt loaded. You can now use it in your journaling.',
                    duration: 3000
                  });
                }}
              />
            )}

            {/* Existing tab content for other tabs */}
            {activeTab !== 'chat' && activeTab !== 'visual' && activeTab !== 'prompts' && (
              <button
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={
                  activeTab === 'analyze' ? handleAnalyzeMemory :
                  activeTab === 'story' ? handleGenerateStory :
                  activeTab === 'questions' ? handleGenerateQuestions :
                  activeTab === 'graph' ? handleExploreGraph :
                  activeTab === 'clusters' ? handleClusterMemories :
                  activeTab === 'timeline' ? handleAnalyzeTimeline :
                  activeTab === 'journey' ? handleMapEmotionalJourney :
                  activeTab === 'enhance' ? handleEnhanceMemory :
                  handleCollaborativeSuggestions
                }
                disabled={isGenerating || (['analyze', 'story', 'questions', 'graph', 'enhance', 'collaborate'].includes(activeTab) && !selectedMemory)}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-5 h-5" />
                    <span>
                      {activeTab === 'analyze' ? 'Analyze Memory' :
                       activeTab === 'story' ? 'Create Story' :
                       activeTab === 'questions' ? 'Generate Questions' :
                       activeTab === 'graph' ? 'Explore Connections' :
                       activeTab === 'clusters' ? 'Cluster Memories' :
                       activeTab === 'timeline' ? 'Analyze Timeline' :
                       activeTab === 'journey' ? 'Map Journey' :
                       activeTab === 'enhance' ? 'Enhance Memory' :
                       'Collaborative Suggestions'}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {(generatedContent || generatedImage) && (
          <div className="mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-200">
            <h3 className="font-bold mb-2 text-gray-800">AI Response:</h3>
            {generatedImage ? (
              <div className="flex flex-col items-center">
                <img 
                  src={generatedImage} 
                  alt="AI Generated Visual" 
                  className="w-full max-w-md rounded-xl shadow-lg mb-4"
                />
                <p className="text-gray-700 text-center">{generatedContent}</p>
              </div>
            ) : (
              <div className="whitespace-pre-line text-gray-700">{generatedContent}</div>
            )}
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t border-orange-200">
          <h3 className="font-bold mb-3 text-gray-800">Quick Actions:</h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              onClick={() => {
                // Navigate to the knowledge graph view
                addToast({
                  type: 'info',
                  title: 'Navigating to Knowledge Graph',
                  message: 'Taking you to the memory connections view...',
                  duration: 2000
                });
                // In a real implementation, this would navigate to the knowledge graph view
                setTimeout(() => {
                  addToast({
                    type: 'success',
                    title: 'Knowledge Graph',
                    message: 'You can explore memory connections in the Knowledge Graph view!',
                    duration: 4000
                  });
                }, 2000);
              }}
            >
              <Network className="w-5 h-5" />
              <span>View Full Knowledge Graph</span>
            </button>
            <button
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              onClick={() => {
                addToast({
                  type: 'info',
                  title: 'Memory Report',
                  message: 'Generating a comprehensive memory health report...',
                  duration: 4000
                });
              }}
            >
              <BookOpen className="w-5 h-5" />
              <span>Generate Memory Report</span>
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">
            Advanced AI features for deeper memory insights and connections
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiStudio;
