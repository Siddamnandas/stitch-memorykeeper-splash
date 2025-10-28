import { requestChatCompletion, requestImageGeneration } from './aiProxyClient';
import { Memory } from './dataService';

export interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
  imageUrl?: string;
}

export interface MemoryAnalysis {
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  summary: string;
}

/**
 * Generate a personalized memory prompt based on user's memory history
 */
export const generateMemoryPrompt = async (memories: Memory[]): Promise<AIResponse> => {
  try {
    // Extract recent memories for context
    const recentMemories = memories.slice(0, 5);
    const memoryContext = recentMemories.map(m => 
      `Prompt: ${m.prompt}\nResponse: ${m.response}`
    ).join('\n\n');

    const prompt = `You are an AI assistant helping seniors recall precious memories. 
    Based on the following previous memories, generate a thoughtful and engaging prompt 
    that would help the user recall another meaningful memory:

    ${memoryContext}

    Generate a single, thoughtful prompt that encourages the user to share a related or 
    contrasting memory. Make it specific and emotionally resonant. Return only the prompt, 
    nothing else.`;

    const response = await requestChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for seniors recalling precious memories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content?.trim() || 'What is a cherished memory from your past?';
    
    return {
      content,
      success: true
    };
  } catch (error: any) {
    console.error('Error generating memory prompt:', error);
    return {
      content: 'What is a cherished memory from your past?',
      success: false,
      error: error.message || 'Failed to generate prompt'
    };
  }
};

/**
 * Analyze a memory for keywords, sentiment, and summary
 */
export const analyzeMemory = async (memory: Memory): Promise<AIResponse & { analysis?: MemoryAnalysis }> => {
  try {
    const prompt = `Analyze the following memory and provide:
1. 5-10 important keywords (comma separated)
2. Sentiment (positive, negative, or neutral)
3. A brief 1-sentence summary

Memory:
Prompt: ${memory.prompt}
Response: ${memory.response}

Format your response exactly as follows:
Keywords: keyword1, keyword2, keyword3
Sentiment: positive|negative|neutral
Summary: summary sentence`;

    const response = await requestChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant analyzing personal memories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    
    // Parse the response
    const keywordsLine = content.split('\n').find(line => line.startsWith('Keywords:'));
    const sentimentLine = content.split('\n').find(line => line.startsWith('Sentiment:'));
    const summaryLine = content.split('\n').find(line => line.startsWith('Summary:'));
    
    const keywords = keywordsLine 
      ? keywordsLine.replace('Keywords:', '').trim().split(',').map(k => k.trim()) 
      : [];
    const sentiment = sentimentLine 
      ? sentimentLine.replace('Sentiment:', '').trim() as 'positive' | 'negative' | 'neutral'
      : 'neutral';
    const summary = summaryLine 
      ? summaryLine.replace('Summary:', '').trim()
      : memory.response.substring(0, 100) + '...';

    return {
      content,
      success: true,
      analysis: {
        keywords,
        sentiment,
        summary
      }
    };
  } catch (error: any) {
    console.error('Error analyzing memory:', error);
    return {
      content: '',
      success: false,
      error: error.message || 'Failed to analyze memory'
    };
  }
};

/**
 * Generate a story based on a memory
 */
export const generateStory = async (memory: Memory): Promise<AIResponse> => {
  try {
    const prompt = `Based on the following memory, create a beautifully written short story (2-3 paragraphs) 
    that expands on the memory with descriptive details and emotional depth. Make it engaging and warm:

    Prompt: ${memory.prompt}
    Memory: ${memory.response}`;

    const response = await requestChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a skilled storyteller helping seniors preserve their memories in beautiful narratives.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    
    return {
      content,
      success: true
    };
  } catch (error: any) {
    console.error('Error generating story:', error);
    return {
      content: '',
      success: false,
      error: error.message || 'Failed to generate story'
    };
  }
};

/**
 * Generate related questions for a memory
 */
export const generateRelatedQuestions = async (memory: Memory): Promise<AIResponse & { questions?: string[] }> => {
  try {
    const prompt = `Based on the following memory, generate 3 thoughtful follow-up questions 
    that would help the person explore related memories or details. Make them open-ended 
    and emotionally engaging:

    Prompt: ${memory.prompt}
    Memory: ${memory.response}

    Return only the 3 questions, one per line, nothing else.`;

    const response = await requestChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant helping users explore their memories more deeply.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    const questions = content.split('\n').filter(q => q.trim() !== '');
    
    return {
      content,
      success: true,
      questions
    };
  } catch (error: any) {
    console.error('Error generating related questions:', error);
    return {
      content: '',
      success: false,
      error: error.message || 'Failed to generate questions'
    };
  }
};

/**
 * Generate a memory strength score based on memory content
 */
export const generateMemoryStrengthScore = async (memory: Memory): Promise<AIResponse & { score?: number }> => {
  try {
    const prompt = `Analyze the following memory and provide a score from 1-100 indicating 
    how rich and detailed the memory is. Consider factors like:
    - Emotional depth
    - Specific details
    - Sensory descriptions
    - Narrative structure
    
    Memory:
    Prompt: ${memory.prompt}
    Response: ${memory.response}
    
    Return only the numerical score (1-100), nothing else.`;

    const response = await requestChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI evaluator assessing the richness of personal memories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 10,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    const score = parseInt(content) || 50;
    
    return {
      content,
      success: true,
      score: Math.max(1, Math.min(100, score)) // Ensure score is between 1-100
    };
  } catch (error: any) {
    console.error('Error generating memory strength score:', error);
    return {
      content: '',
      success: false,
      error: error.message || 'Failed to generate score',
      score: 50 // Default score
    };
  }
};

/**
 * Generate an image based on a memory using DALL-E
 */
export const generateMemoryImage = async (memory: Memory): Promise<AIResponse & { imageUrl?: string }> => {
  try {
    // Create a prompt for image generation based on the memory
    const imagePrompt = `Create a nostalgic, warm illustration that represents this memory: 
    
    Memory Prompt: ${memory.prompt}
    Memory Content: ${memory.response}
    
    Style: Warm, nostalgic, slightly vintage, detailed illustration
    Don't include any text in the image.`;

    const response = await requestImageGeneration({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    });

    const imageUrl = response.data?.[0]?.url;
    
    if (!imageUrl) {
      throw new Error('No image URL returned from API');
    }
    
    return {
      content: 'Image generated successfully',
      success: true,
      imageUrl
    };
  } catch (error: any) {
    console.error('Error generating memory image:', error);
    return {
      content: '',
      success: false,
      error: error.message || 'Failed to generate image'
    };
  }
};

/**
 * Analyze connections between two memories using AI
 */
export const analyzeMemoryConnection = async (memoryA: Memory, memoryB: Memory): Promise<AIResponse & { connectionType?: string; strength?: number }> => {
  try {
    const prompt = `Analyze the connection between these two memories and determine:
1. The type of connection (temporal, thematic, emotional, keyword, or none)
2. Connection strength (0-100)

Memory A:
Prompt: ${memoryA.prompt}
Response: ${memoryA.response}

Memory B:
Prompt: ${memoryB.prompt}
Response: ${memoryB.response}

Return your response in this exact format:
Type: temporal|thematic|emotional|keyword|none
Strength: 0-100

Example:
Type: emotional
Strength: 75`;

    const response = await requestChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant analyzing connections between personal memories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    
    // Parse the response
    const typeLine = content.split('\n').find(line => line.startsWith('Type:'));
    const strengthLine = content.split('\n').find(line => line.startsWith('Strength:'));
    
    const connectionType = typeLine 
      ? typeLine.replace('Type:', '').trim()
      : 'none';
    const strength = strengthLine 
      ? parseInt(strengthLine.replace('Strength:', '').trim()) || 0
      : 0;

    return {
      content,
      success: true,
      connectionType: connectionType as string,
      strength: Math.max(0, Math.min(100, strength))
    };
  } catch (error: any) {
    console.error('Error analyzing memory connection:', error);
    return {
      content: '',
      success: false,
      error: error.message || 'Failed to analyze connection'
    };
  }
};

/**
 * Extract keywords from a memory using AI
 */
export const extractMemoryKeywords = async (memory: Memory): Promise<AIResponse & { keywords?: string[] }> => {
  try {
    const prompt = `Extract 5-10 important keywords from this memory that capture its essence:

Memory:
Prompt: ${memory.prompt}
Response: ${memory.response}

Return only the keywords as a comma-separated list, nothing else.`;

    const response = await requestChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant extracting keywords from personal memories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 100,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    const keywords = content.split(',').map(k => k.trim()).filter(k => k.length > 0);
    
    return {
      content,
      success: true,
      keywords
    };
  } catch (error: any) {
    console.error('Error extracting memory keywords:', error);
    return {
      content: '',
      success: false,
      error: error.message || 'Failed to extract keywords'
    };
  }
};

/**
 * Analyze the sentiment of a memory using AI
 */
export const analyzeMemorySentiment = async (memory: Memory): Promise<AIResponse & { sentiment?: 'positive' | 'negative' | 'neutral' }> => {
  try {
    const prompt = `Analyze the sentiment of this memory and respond with only one word:
positive, negative, or neutral

Memory:
Prompt: ${memory.prompt}
Response: ${memory.response}`;

    const response = await requestChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant analyzing the sentiment of personal memories. Respond with only one word: positive, negative, or neutral.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 10,
      temperature: 0.3
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    const sentiment = content.toLowerCase() as 'positive' | 'negative' | 'neutral';
    
    // Validate sentiment
    const validSentiments: ('positive' | 'negative' | 'neutral')[] = ['positive', 'negative', 'neutral'];
    const validSentiment = validSentiments.includes(sentiment) ? sentiment : 'neutral';

    return {
      content,
      success: true,
      sentiment: validSentiment
    };
  } catch (error: any) {
    console.error('Error analyzing memory sentiment:', error);
    return {
      content: '',
      success: false,
      error: error.message || 'Failed to analyze sentiment'
    };
  }
};

/**
 * Cluster memories by themes using AI
 */
export const clusterMemoriesByThemes = async (memories: Memory[]): Promise<AIResponse & { clusters?: Array<{ theme: string; memoryIds: string[] }> }> => {
  try {
    const memoriesText = memories.map(m => 
      `ID: ${m.id}\nPrompt: ${m.prompt}\nResponse: ${m.response}`
    ).join('\n\n');

    const prompt = `Analyze these memories and group them into thematic clusters. 
    Identify 3-5 main themes and list which memory IDs belong to each theme.
    
    Memories:
    ${memoriesText}
    
    Return your response in this exact format:
    Theme: [Theme Name]
    Memories: id1, id2, id3
    
    Theme: [Another Theme Name]
    Memories: id4, id5
    
    (Continue for all themes)`;

    const response = await requestChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant clustering personal memories by themes.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.5
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    
    // Parse clusters from response
    const clusters: Array<{ theme: string; memoryIds: string[] }> = [];
    const themeBlocks = content.split('Theme:').filter(block => block.trim() !== '');
    
    themeBlocks.forEach(block => {
      const lines = block.trim().split('\n');
      const theme = lines[0].trim();
      const memoriesLine = lines.find(line => line.startsWith('Memories:'));
      if (memoriesLine) {
        const memoryIds = memoriesLine.replace('Memories:', '').trim().split(',').map(id => id.trim());
        clusters.push({ theme, memoryIds });
      }
    });

    return {
      content,
      success: true,
      clusters
    };
  } catch (error: any) {
    console.error('Error clustering memories:', error);
    return {
      content: '',
      success: false,
      error: error.message || 'Failed to cluster memories'
    };
  }
};

/**
 * Analyze timeline and chronological patterns in memories
 */
export const analyzeTimelinePatterns = async (memories: Memory[]): Promise<AIResponse & { timelineInsights?: string }> => {
  try {
    const memoriesWithDates = memories.map(m => 
      `Date: ${m.date}\nPrompt: ${m.prompt}\nResponse: ${m.response}`
    ).join('\n\n');

    const prompt = `Analyze these memories chronologically and identify:
1. Time periods with the most memories
2. Patterns in memory frequency over time
3. Significant life events or transitions
4. Any gaps in memory recording

Memories:
${memoriesWithDates}

Provide a concise analysis in 3-4 paragraphs.`;

    const response = await requestChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant analyzing chronological patterns in personal memories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.5
    });

    const content = response.choices[0]?.message?.content?.trim() || '';

    return {
      content,
      success: true,
      timelineInsights: content
    };
  } catch (error: any) {
    console.error('Error analyzing timeline patterns:', error);
    return {
      content: '',
      success: false,
      error: error.message || 'Failed to analyze timeline patterns'
    };
  }
};

/**
 * Map emotional journey across memories
 */
export const mapEmotionalJourney = async (memories: Memory[]): Promise<AIResponse & { emotionalJourney?: string }> => {
  try {
    const memoriesWithSentiment = memories.map(m => 
      `Prompt: ${m.prompt}\nResponse: ${m.response}\nDate: ${m.date}`
    ).join('\n\n');

    const prompt = `Analyze these memories and create an emotional journey map:
1. Identify emotional highs and lows across the timeline
2. Note significant emotional transitions
3. Highlight patterns in emotional experiences
4. Describe the overall emotional arc

Memories:
${memoriesWithSentiment}

Provide a narrative describing the emotional journey in 3-4 paragraphs.`;

    const response = await requestChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant mapping emotional journeys through personal memories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.5
    });

    const content = response.choices[0]?.message?.content?.trim() || '';

    return {
      content,
      success: true,
      emotionalJourney: content
    };
  } catch (error: any) {
    console.error('Error mapping emotional journey:', error);
    return {
      content: '',
      success: false,
      error: error.message || 'Failed to map emotional journey'
    };
  }
};

/**
 * Generate memory enhancement suggestions
 */
export const generateMemoryEnhancementSuggestions = async (memory: Memory): Promise<AIResponse & { suggestions?: string[] }> => {
  try {
    const prompt = `Based on this memory, suggest 3-5 ways to enhance or enrich it:
1. Details that could be added
2. Sensory elements to include
3. Emotional aspects to explore
4. Related memories to connect

Memory:
Prompt: ${memory.prompt}
Response: ${memory.response}

Return only the suggestions as a numbered list, one per line.`;

    const response = await requestChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant suggesting ways to enhance personal memories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    const suggestions = content.split('\n').map(s => s.trim()).filter(s => s.length > 0);

    return {
      content,
      success: true,
      suggestions
    };
  } catch (error: any) {
    console.error('Error generating enhancement suggestions:', error);
    return {
      content: '',
      success: false,
      error: error.message || 'Failed to generate enhancement suggestions'
    };
  }
};

/**
 * Generate collaborative memory suggestions
 */
export const generateCollaborativeSuggestions = async (memory: Memory, relationship: string): Promise<AIResponse & { suggestions?: string[] }> => {
  try {
    const prompt = `Based on this memory, suggest ways to share or collaborate on it with a ${relationship}:
1. Questions to ask them about their perspective
2. Ways to involve them in preserving this memory
3. Activities you could do together related to this memory
4. How to pass this memory to future generations

Memory:
Prompt: ${memory.prompt}
Response: ${memory.response}

Return only the suggestions as a numbered list, one per line.`;

    const response = await requestChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant suggesting collaborative approaches to personal memories.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const content = response.choices[0]?.message?.content?.trim() || '';
    const suggestions = content.split('\n').map(s => s.trim()).filter(s => s.length > 0);

    return {
      content,
      success: true,
      suggestions
    };
  } catch (error: any) {
    console.error('Error generating collaborative suggestions:', error);
    return {
      content: '',
      success: false,
      error: error.message || 'Failed to generate collaborative suggestions'
    };
  }
};
