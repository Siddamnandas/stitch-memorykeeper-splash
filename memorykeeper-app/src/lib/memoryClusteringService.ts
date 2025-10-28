import { Memory } from './dataService';
import { requestChatCompletion } from './aiProxyClient';
import { analyzeMemory } from './aiService';

// Types for clustering
export interface MemoryCluster {
  id: string;
  name: string;
  memories: string[]; // Memory IDs
  keywords: string[];
  theme: string;
  description: string;
  strength: number; // 1-100 based on number of memories and connections
}

export interface PredictivePrompt {
  id: string;
  prompt: string;
  category: 'time' | 'people' | 'places' | 'events' | 'emotions' | 'achievements' | 'traditions' | 'random';
  relevanceScore: number; // 1-100 based on user's memory patterns
  reason: string; // Why this prompt was generated
}

export interface UserMemoryPatterns {
  frequentTopics: string[];
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  timePatterns: {
    mostActiveDecade?: string;
    seasonalPatterns: string[];
  };
  relationshipPatterns: string[];
  memoryDensity: 'high' | 'medium' | 'low';
}

/**
 * Advanced Memory Clustering Service
 * Groups memories based on semantic similarity, themes, and patterns
 */
class MemoryClusteringService {
  /**
   * Cluster memories based on semantic similarity and themes
   */
  async clusterMemories(memories: Memory[]): Promise<MemoryCluster[]> {
    if (memories.length === 0) return [];

    try {
      // First, analyze all memories to extract keywords and themes
      const analyzedMemories = await Promise.all(
        memories.map(async (memory) => {
          const analysis = await analyzeMemory(memory);
          return {
            memory,
            analysis: analysis.analysis
          };
        })
      );

      // Group memories by common keywords/themes
      const clusters: MemoryCluster[] = [];
      const processedMemoryIds = new Set<string>();

      // Create clusters based on shared keywords
      for (const { memory, analysis } of analyzedMemories) {
        if (!analysis || !memory.id || processedMemoryIds.has(memory.id)) continue;

        // Find other memories with similar keywords
        const similarMemories = analyzedMemories.filter(({ memory: otherMemory, analysis: otherAnalysis }) => {
          if (!otherAnalysis || !otherMemory.id || !memory.id || processedMemoryIds.has(otherMemory.id) || otherMemory.id === memory.id) {
            return false;
          }

          // Calculate keyword similarity
          const sharedKeywords = analysis.keywords.filter(keyword =>
            otherAnalysis.keywords.includes(keyword)
          );

          // Require at least 2 shared keywords or 50% overlap
          return sharedKeywords.length >= 2 || 
                 sharedKeywords.length / Math.max(analysis.keywords.length, otherAnalysis.keywords.length) >= 0.5;
        });

        // If we found similar memories, create a cluster
        if (similarMemories.length > 0) {
          // Include the original memory in the cluster
          const clusterMemories = [memory, ...similarMemories.map(({ memory }) => memory)];
          const clusterKeywords = this.extractClusterKeywords(clusterMemories, analyzedMemories);
          
          // Generate cluster name and description using AI
          const { name, description, theme } = await this.generateClusterDetails(clusterMemories, clusterKeywords);
          
          const cluster: MemoryCluster = {
            id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            memories: clusterMemories.map(m => m.id).filter((id): id is string => id !== undefined),
            keywords: clusterKeywords,
            theme,
            description,
            strength: Math.min(100, Math.round((clusterMemories.length / memories.length) * 100))
          };

          clusters.push(cluster);
          
          // Mark these memories as processed
          clusterMemories.forEach(m => { if (m.id) processedMemoryIds.add(m.id); });
        }
      }

      // Handle unclustered memories
      const unclusteredMemories = memories.filter(memory => !memory.id || !processedMemoryIds.has(memory.id));
      for (const memory of unclusteredMemories) {
        const analysis = analyzedMemories.find(item => item.memory.id === memory.id)?.analysis;
        if (!analysis) continue;

        const { name, description, theme } = await this.generateSingleMemoryClusterDetails(memory, analysis);
        
        const cluster: MemoryCluster = {
          id: `cluster_${memory.id}`,
          name,
          memories: memory.id ? [memory.id] : [],
          keywords: analysis.keywords,
          theme,
          description,
          strength: 20 // Single memory clusters are weaker
        };

        clusters.push(cluster);
      }

      return clusters;
    } catch (error) {
      console.error('Error clustering memories:', error);
      return [];
    }
  }

  /**
   * Extract common keywords from a group of memories
   */
  private extractClusterKeywords(memories: Memory[], analyzedMemories: any[]): string[] {
    const allKeywords: string[] = [];
    
    memories.forEach(memory => {
      const analysis = analyzedMemories.find(item => item.memory.id === memory.id)?.analysis;
      if (analysis) {
        allKeywords.push(...analysis.keywords);
      }
    });

    // Count keyword frequency
    const keywordCounts: Record<string, number> = {};
    allKeywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });

    // Return top 5 keywords sorted by frequency
    return Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([keyword]) => keyword);
  }

  /**
   * Generate cluster name and description using AI
   */
  private async generateClusterDetails(memories: Memory[], keywords: string[]): Promise<{ name: string; description: string; theme: string }> {
    try {
      const memorySummaries = memories.slice(0, 3).map(m => 
        `Prompt: ${m.prompt}\nResponse: ${m.response.substring(0, 100)}...`
      ).join('\n\n');

      const prompt = `Based on these related memories and common keywords, create:
1. A concise cluster name (3-5 words)
2. A brief theme category (one word like Family, Career, Travel, etc.)
3. A one-sentence description of what connects these memories

Keywords: ${keywords.join(', ')}

Memories:
${memorySummaries}

Format your response exactly as:
Name: [cluster name]
Theme: [theme category]
Description: [one sentence description]`;

      const response = await requestChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that groups related memories into meaningful clusters.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content?.trim() || '';
      
      // Parse the response
      const nameLine = content.split('\n').find(line => line.startsWith('Name:'));
      const themeLine = content.split('\n').find(line => line.startsWith('Theme:'));
      const descriptionLine = content.split('\n').find(line => line.startsWith('Description:'));
      
      return {
        name: nameLine ? nameLine.replace('Name:', '').trim() : 'Memory Cluster',
        theme: themeLine ? themeLine.replace('Theme:', '').trim() : 'General',
        description: descriptionLine ? descriptionLine.replace('Description:', '').trim() : 'A collection of related memories'
      };
    } catch (error) {
      console.error('Error generating cluster details:', error);
      return {
        name: 'Memory Cluster',
        theme: 'General',
        description: 'A collection of related memories'
      };
    }
  }

  /**
   * Generate details for a single memory cluster
   */
  private async generateSingleMemoryClusterDetails(memory: Memory, analysis: any): Promise<{ name: string; description: string; theme: string }> {
    try {
      const prompt = `Based on this memory, create:
1. A concise cluster name (3-5 words)
2. A brief theme category (one word like Family, Career, Travel, etc.)
3. A one-sentence description

Memory:
Prompt: ${memory.prompt}
Response: ${memory.response.substring(0, 100)}...

Keywords: ${analysis.keywords.join(', ')}

Format your response exactly as:
Name: [cluster name]
Theme: [theme category]
Description: [one sentence description]`;

      const response = await requestChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that groups related memories into meaningful clusters.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content?.trim() || '';
      
      // Parse the response
      const nameLine = content.split('\n').find(line => line.startsWith('Name:'));
      const themeLine = content.split('\n').find(line => line.startsWith('Theme:'));
      const descriptionLine = content.split('\n').find(line => line.startsWith('Description:'));
      
      return {
        name: nameLine ? nameLine.replace('Name:', '').trim() : memory.prompt,
        theme: themeLine ? themeLine.replace('Theme:', '').trim() : 'General',
        description: descriptionLine ? descriptionLine.replace('Description:', '').trim() : memory.response.substring(0, 100) + '...'
      };
    } catch (error) {
      console.error('Error generating single memory cluster details:', error);
      return {
        name: memory.prompt,
        theme: 'General',
        description: memory.response.substring(0, 100) + '...'
      };
    }
  }

  /**
   * Analyze user's memory patterns to generate predictive prompts
   */
  async generatePredictivePrompts(memories: Memory[], patterns?: UserMemoryPatterns): Promise<PredictivePrompt[]> {
    try {
      // If no patterns provided, analyze the memories to generate them
      const userPatterns = patterns || await this.analyzeMemoryPatterns(memories);
      
      const prompt = `Based on a user's memory patterns, generate 5 thoughtful, personalized memory prompts.
The user's patterns are:
- Frequent topics: ${userPatterns.frequentTopics.join(', ')}
- Sentiment distribution: ${userPatterns.sentimentDistribution.positive}% positive, ${userPatterns.sentimentDistribution.negative}% negative, ${userPatterns.sentimentDistribution.neutral}% neutral
- Relationship patterns: ${userPatterns.relationshipPatterns.join(', ')}
- Memory density: ${userPatterns.memoryDensity}

Create 5 diverse prompts that would help the user explore new memories related to:
1. Time periods they haven't explored much
2. People in their life
3. Places they've been
4. Significant events
5. A random creative prompt

For each prompt, also provide:
- A category (time, people, places, events, emotions, achievements, traditions, random)
- A relevance score (1-100) indicating how well it matches their patterns
- A brief reason for why this prompt was generated

Format your response as:
1. [Prompt]
Category: [category]
Score: [score]
Reason: [reason]

2. [Prompt]
Category: [category]
Score: [score]
Reason: [reason]

(And so on for all 5 prompts)`;

      const response = await requestChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that generates personalized memory prompts based on user patterns.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.8
      });

      const content = response.choices[0]?.message?.content?.trim() || '';
      
      // Parse the response into PredictivePrompt objects
      const prompts: PredictivePrompt[] = [];
      const lines = content.split('\n').filter(line => line.trim() !== '');
      
      let currentPrompt: any = null;
      
      for (const line of lines) {
        if (/^\d+\./.test(line)) {
          // New prompt
          if (currentPrompt) {
            prompts.push(currentPrompt);
          }
          
          currentPrompt = {
            id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            prompt: line.replace(/^\d+\.\s*/, '').trim(),
            category: 'random', // Default
            relevanceScore: 50, // Default
            reason: 'Generated based on memory patterns'
          };
        } else if (line.startsWith('Category:')) {
          const category = line.replace('Category:', '').trim().toLowerCase() as PredictivePrompt['category'];
          if (currentPrompt && ['time', 'people', 'places', 'events', 'emotions', 'achievements', 'traditions', 'random'].includes(category)) {
            currentPrompt.category = category;
          }
        } else if (line.startsWith('Score:')) {
          const score = parseInt(line.replace('Score:', '').trim());
          if (currentPrompt && !isNaN(score)) {
            currentPrompt.relevanceScore = Math.max(1, Math.min(100, score));
          }
        } else if (line.startsWith('Reason:')) {
          if (currentPrompt) {
            currentPrompt.reason = line.replace('Reason:', '').trim();
          }
        }
      }
      
      // Add the last prompt
      if (currentPrompt) {
        prompts.push(currentPrompt);
      }
      
      return prompts;
    } catch (error) {
      console.error('Error generating predictive prompts:', error);
      return [];
    }
  }

  /**
   * Analyze user's memory patterns
   */
  async analyzeMemoryPatterns(memories: Memory[]): Promise<UserMemoryPatterns> {
    if (memories.length === 0) {
      return {
        frequentTopics: [],
        sentimentDistribution: { positive: 33, negative: 33, neutral: 34 },
        timePatterns: { seasonalPatterns: [] },
        relationshipPatterns: [],
        memoryDensity: 'low'
      };
    }

    try {
      // Analyze all memories
      const analyzedMemories = await Promise.all(
        memories.map(async (memory) => {
          const analysis = await analyzeMemory(memory);
          return {
            memory,
            analysis: analysis.analysis
          };
        })
      );

      // Extract patterns
      const allKeywords: string[] = [];
      const sentiments = { positive: 0, negative: 0, neutral: 0 };
      const relationships: string[] = [];
      
      analyzedMemories.forEach(({ analysis }) => {
        if (!analysis) return;
        
        allKeywords.push(...analysis.keywords);
        
        if (analysis.sentiment) {
          sentiments[analysis.sentiment]++;
        }
      });
      
      // Calculate sentiment distribution
      const total = memories.length;
      const sentimentDistribution = {
        positive: Math.round((sentiments.positive / total) * 100),
        negative: Math.round((sentiments.negative / total) * 100),
        neutral: Math.round((sentiments.neutral / total) * 100)
      };
      
      // Find frequent topics (top 5 keywords)
      const keywordCounts: Record<string, number> = {};
      allKeywords.forEach(keyword => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });
      
      const frequentTopics = Object.entries(keywordCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([keyword]) => keyword);
      
      // Determine memory density
      const memoryDensity = total > 20 ? 'high' : total > 5 ? 'medium' : 'low';
      
      return {
        frequentTopics,
        sentimentDistribution,
        timePatterns: { seasonalPatterns: [] }, // Would need date analysis for this
        relationshipPatterns: relationships,
        memoryDensity
      };
    } catch (error) {
      console.error('Error analyzing memory patterns:', error);
      return {
        frequentTopics: [],
        sentimentDistribution: { positive: 33, negative: 33, neutral: 34 },
        timePatterns: { seasonalPatterns: [] },
        relationshipPatterns: [],
        memoryDensity: 'low'
      };
    }
  }
}

// Create and export a singleton instance
const memoryClusteringService = new MemoryClusteringService();
export default memoryClusteringService;
