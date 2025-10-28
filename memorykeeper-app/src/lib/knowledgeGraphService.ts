import { Memory } from './dataService';
import { analyzeMemory } from './aiService';
import { requestChatCompletion } from './aiProxyClient';

// Knowledge Graph Data Structures
export interface KnowledgeNode {
  id: string;
  type: 'memory' | 'concept' | 'entity' | 'theme';
  label: string;
  properties: Record<string, any>;
  connections: string[]; // IDs of connected nodes
}

export interface KnowledgeEdge {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  type: 'related_to' | 'part_of' | 'similar_to' | 'contrasts_with' | 'evolves_to';
  weight: number; // 0-1 strength of connection
  properties: Record<string, any>;
}

export interface KnowledgeGraph {
  nodes: Record<string, KnowledgeNode>;
  edges: Record<string, KnowledgeEdge>;
}

export interface MemoryGraphNode extends KnowledgeNode {
  type: 'memory';
  memoryId: string;
  summary?: string;
  keywords: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  properties: Record<string, any>;
}

export interface ConceptNode extends KnowledgeNode {
  type: 'concept';
  category: string; // e.g., 'emotion', 'event', 'person', 'place'
  properties: Record<string, any>;
}

// Knowledge Graph Service
class KnowledgeGraphService {
  private graph: KnowledgeGraph = {
    nodes: {},
    edges: {}
  };

  /**
   * Analyze a memory and create nodes and edges in the knowledge graph
   */
  async addMemoryToGraph(memory: Memory): Promise<void> {
    try {
      // Analyze the memory using AI
      const analysis = await analyzeMemory(memory);
      
      if (!analysis.success || !analysis.analysis) {
        console.warn('Failed to analyze memory for knowledge graph:', analysis.error);
        return;
      }
      
      const { keywords, sentiment, summary } = analysis.analysis;
      
      // Create memory node
      const memoryNodeId = `memory_${memory.id}`;
      const memoryNode: MemoryGraphNode = {
        id: memoryNodeId,
        type: 'memory',
        label: memory.prompt,
        memoryId: memory.id || '',
        summary,
        keywords,
        sentiment,
        connections: [],
        properties: {}
      };
      
      this.graph.nodes[memoryNodeId] = memoryNode;
      
      // Create concept nodes and edges for keywords
      for (const keyword of keywords) {
        const conceptNodeId = await this.getOrCreateConceptNode(keyword, 'topic');
        
        // Create edge between memory and concept
        const edgeId = `edge_${memoryNodeId}_${conceptNodeId}`;
        const edge: KnowledgeEdge = {
          id: edgeId,
          source: memoryNodeId,
          target: conceptNodeId,
          type: 'related_to',
          weight: 0.8, // High weight for direct keyword relationships
          properties: {}
        };
        
        this.graph.edges[edgeId] = edge;
        
        // Update connections in both nodes
        if (!this.graph.nodes[memoryNodeId].connections.includes(conceptNodeId)) {
          this.graph.nodes[memoryNodeId].connections.push(conceptNodeId);
        }
        if (!this.graph.nodes[conceptNodeId].connections.includes(memoryNodeId)) {
          this.graph.nodes[conceptNodeId].connections.push(memoryNodeId);
        }
      }
      
      // Connect to other memories based on shared concepts
      await this.connectRelatedMemories(memoryNodeId);
      
    } catch (error) {
      console.error('Error adding memory to knowledge graph:', error);
    }
  }

  /**
   * Get or create a concept node
   */
  private async getOrCreateConceptNode(label: string, category: string): Promise<string> {
    // Check if concept node already exists (case insensitive)
    const existingNodeId = Object.keys(this.graph.nodes).find(nodeId => {
      const node = this.graph.nodes[nodeId];
      return node.type === 'concept' && 
             node.label.toLowerCase() === label.toLowerCase();
    });
    
    if (existingNodeId) {
      return existingNodeId;
    }
    
    // Create new concept node
    const conceptNodeId = `concept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const conceptNode: ConceptNode = {
      id: conceptNodeId,
      type: 'concept',
      label,
      category,
      connections: [],
      properties: {}
    };
    
    this.graph.nodes[conceptNodeId] = conceptNode;
    return conceptNodeId;
  }

  /**
   * Connect a memory to other related memories based on shared concepts
   */
  private async connectRelatedMemories(memoryNodeId: string): Promise<void> {
    const memoryNode = this.graph.nodes[memoryNodeId] as MemoryGraphNode;
    if (!memoryNode) return;
    
    // Find other memories that share concepts
    for (const nodeId in this.graph.nodes) {
      const node = this.graph.nodes[nodeId];
      
      // Skip if it's the same memory or not a memory node
      if (nodeId === memoryNodeId || node.type !== 'memory') continue;
      
      const otherMemoryNode = node as MemoryGraphNode;
      
      // Calculate similarity based on shared keywords
      const sharedKeywords = memoryNode.keywords.filter(keyword => 
        otherMemoryNode.keywords.includes(keyword)
      );
      
      if (sharedKeywords.length > 0) {
        // Create connection based on shared concepts
        const edgeId = `edge_${memoryNodeId}_${nodeId}`;
        const similarity = sharedKeywords.length / Math.max(
          memoryNode.keywords.length, 
          otherMemoryNode.keywords.length
        );
        
        const edge: KnowledgeEdge = {
          id: edgeId,
          source: memoryNodeId,
          target: nodeId,
          type: 'related_to',
          weight: similarity,
          properties: {
            sharedKeywords
          }
        };
        
        this.graph.edges[edgeId] = edge;
        
        // Update connections in both nodes
        if (!memoryNode.connections.includes(nodeId)) {
          memoryNode.connections.push(nodeId);
        }
        if (!otherMemoryNode.connections.includes(memoryNodeId)) {
          otherMemoryNode.connections.push(memoryNodeId);
        }
      }
    }
  }

  /**
   * Find related memories based on shared concepts
   */
  findRelatedMemories(memoryId: string, maxResults: number = 5): MemoryGraphNode[] {
    const memoryNodeId = `memory_${memoryId}`;
    const memoryNode = this.graph.nodes[memoryNodeId] as MemoryGraphNode;
    
    if (!memoryNode) return [];
    
    // Get directly connected memories
    const relatedMemories: { node: MemoryGraphNode; weight: number }[] = [];
    
    for (const connectedNodeId of memoryNode.connections) {
      const connectedNode = this.graph.nodes[connectedNodeId];
      
      if (connectedNode.type === 'memory') {
        // Find the edge between these nodes
        const edgeId = `edge_${memoryNodeId}_${connectedNodeId}`;
        const edge = this.graph.edges[edgeId];
        
        if (edge) {
          relatedMemories.push({
            node: connectedNode as MemoryGraphNode,
            weight: edge.weight
          });
        }
      }
    }
    
    // Sort by weight and return top results
    return relatedMemories
      .sort((a, b) => b.weight - a.weight)
      .slice(0, maxResults)
      .map(item => item.node);
  }

  /**
   * Find memories related to a concept
   */
  findMemoriesByConcept(concept: string, maxResults: number = 5): MemoryGraphNode[] {
    // Find the concept node
    const conceptNodeId = Object.keys(this.graph.nodes).find(nodeId => {
      const node = this.graph.nodes[nodeId];
      return node.type === 'concept' && 
             node.label.toLowerCase() === concept.toLowerCase();
    });
    
    if (!conceptNodeId) return [];
    
    const conceptNode = this.graph.nodes[conceptNodeId];
    const relatedMemories: MemoryGraphNode[] = [];
    
    // Find all memories connected to this concept
    for (const connectedNodeId of conceptNode.connections) {
      const connectedNode = this.graph.nodes[connectedNodeId];
      
      if (connectedNode.type === 'memory') {
        relatedMemories.push(connectedNode as MemoryGraphNode);
        
        if (relatedMemories.length >= maxResults) break;
      }
    }
    
    return relatedMemories;
  }

  /**
   * Get the entire knowledge graph
   */
  getGraph(): KnowledgeGraph {
    return { ...this.graph };
  }

  /**
   * Clear the knowledge graph
   */
  clearGraph(): void {
    this.graph = {
      nodes: {},
      edges: {}
    };
  }

  /**
   * Generate insights from the knowledge graph using AI
   */
  async generateInsights(): Promise<string> {
    try {
      // Prepare graph data for AI analysis
      const memoryNodes = Object.values(this.graph.nodes).filter(
        node => node.type === 'memory'
      ) as MemoryGraphNode[];
      
      const conceptNodes = Object.values(this.graph.nodes).filter(
        node => node.type === 'concept'
      ) as ConceptNode[];
      
      // Create a summary of the knowledge graph
      const graphSummary = `
Knowledge Graph Summary:
- Total Memories: ${memoryNodes.length}
- Total Concepts: ${conceptNodes.length}
- Total Connections: ${Object.keys(this.graph.edges).length}

Top Concepts:
${conceptNodes.slice(0, 10).map(node => `- ${node.label} (${node.connections.length} connections)`).join('\n')}

Memory Themes:
${this.extractThemes(memoryNodes).join('\n')}
      `.trim();
      
      const prompt = `Based on the following knowledge graph of a person's memories, 
      provide insightful observations about patterns, themes, and connections in their life story. 
      Focus on what these memories reveal about their values, interests, and life journey.
      
      ${graphSummary}
      
      Provide 3-5 key insights in a conversational, encouraging tone. 
      Each insight should be a complete sentence.`;
      
      const response = await requestChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant analyzing personal memory patterns to provide meaningful life insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      });
      
      return response.choices[0]?.message?.content?.trim() || 'No insights generated.';
    } catch (error) {
      console.error('Error generating insights:', error);
      return 'Unable to generate insights at this time.';
    }
  }

  /**
   * Extract themes from memory nodes
   */
  private extractThemes(memoryNodes: MemoryGraphNode[]): string[] {
    const themeCounts: Record<string, number> = {};
    
    for (const node of memoryNodes) {
      if (node.sentiment) {
        themeCounts[node.sentiment] = (themeCounts[node.sentiment] || 0) + 1;
      }
      
      for (const keyword of node.keywords.slice(0, 3)) { // Top 3 keywords per memory
        themeCounts[keyword] = (themeCounts[keyword] || 0) + 1;
      }
    }
    
    // Sort by count and return top themes
    return Object.entries(themeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);
  }
}

// Create and export a singleton instance
const knowledgeGraphService = new KnowledgeGraphService();
export default knowledgeGraphService;
