# AI Knowledge Graph System

The AI Knowledge Graph System is a core feature of the MemoryKeeper application that creates intelligent connections between memories to reveal patterns, themes, and insights in a user's life story.

## Overview

The system uses AI analysis to build a knowledge graph of a user's memories, identifying concepts, themes, and relationships between different memories. This allows users to visualize and explore connections in their life story that might not be immediately apparent.

## Components

### 1. KnowledgeGraphService

The core service that manages the knowledge graph data structure and operations.

**Data Structures:**
- `KnowledgeNode`: Represents entities in the graph (memories, concepts, themes)
- `KnowledgeEdge`: Represents relationships between nodes
- `KnowledgeGraph`: The complete graph structure

**Functions:**
- `addMemoryToGraph(memory)`: Analyzes a memory and adds it to the knowledge graph
- `findRelatedMemories(memoryId)`: Finds memories related to a specific memory
- `findMemoriesByConcept(concept)`: Finds memories related to a specific concept
- `generateInsights()`: Uses AI to generate life insights from the knowledge graph
- `getGraph()`: Returns the complete knowledge graph

### 2. KnowledgeGraphView Component

A React component that visualizes the knowledge graph and provides an interactive interface for exploring memory connections.

**Features:**
- Visual representation of memories and concepts as nodes
- Connection lines showing relationships between memories
- Interactive selection of memories to see details and related memories
- AI-generated life insights based on the knowledge graph
- Search functionality to find specific memories or concepts

### 3. Integration with AI Analysis

The knowledge graph system integrates with the existing AI service to:

1. **Analyze Memories**: Uses the `analyzeMemory` function to extract keywords, sentiment, and summaries
2. **Create Concepts**: Automatically identifies concepts from memory keywords
3. **Establish Relationships**: Connects memories based on shared concepts
4. **Generate Insights**: Uses AI to provide meaningful observations about life patterns

## Implementation Details

### Graph Construction

1. **Memory Analysis**: Each memory is analyzed using AI to extract:
   - Keywords (5-10 important terms)
   - Sentiment (positive, negative, neutral)
   - Summary (brief 1-sentence overview)

2. **Node Creation**: 
   - Memory nodes are created for each memory
   - Concept nodes are created for each unique keyword
   - Properties are stored with each node

3. **Edge Creation**:
   - Edges are created between memories and their concepts
   - Edges are created between memories that share concepts
   - Edge weights are calculated based on similarity

### Relationship Detection

The system identifies several types of relationships:
- **Related To**: Memories connected through shared concepts
- **Part Of**: Hierarchical relationships (e.g., event parts)
- **Similar To**: Memories with similar themes or sentiment
- **Contrasts With**: Memories with opposing themes or sentiment
- **Evolves To**: Temporal relationships showing progression

### Visualization

The knowledge graph is visualized using:
- Circular layout with memories and concepts positioned around the center
- Color-coded nodes (orange for memories, purple for concepts)
- Connection lines with opacity based on relationship strength
- Interactive selection to explore details

## Benefits

1. **Pattern Recognition**: Helps users identify recurring themes and patterns in their life
2. **Memory Enhancement**: Reveals connections between seemingly unrelated memories
3. **Life Insights**: Provides AI-generated observations about personal growth and values
4. **Enhanced Recall**: Makes it easier to remember related memories when exploring one
5. **Narrative Building**: Helps users construct a coherent life narrative from discrete memories

## Future Enhancements

Planned improvements to the knowledge graph system include:
- Advanced relationship detection using natural language processing
- Temporal relationship mapping to show memory evolution over time
- Integration with external knowledge bases for richer concept understanding
- Collaborative knowledge graphs for family memories
- Machine learning algorithms for more sophisticated pattern detection
- Enhanced visualization with 3D graph exploration
- Export features for knowledge graph data