import React from 'react';
import { ChevronLeft, Network, Search, Filter, ZoomIn, ZoomOut, RotateCcw, Share, Download } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAppState } from '../lib/AppStateContext';
import { useError } from '../lib/ErrorContext';
import { analyzeMemoryConnection, extractMemoryKeywords, analyzeMemorySentiment } from '../lib/aiService';

interface MemoryNode {
  id: string;
  x: number;
  y: number;
  memory: any;
  connections: string[];
  color: string;
  keywords?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface Connection {
  from: string;
  to: string;
  strength: number;
  type: 'temporal' | 'thematic' | 'emotional' | 'keyword' | 'none';
}

const KnowledgeGraphView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<MemoryNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<MemoryNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { state } = useAppState();
  const { addToast } = useError();

  // Color palette for different memory themes
  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
  ];

  // Generate knowledge graph from memories
  useEffect(() => {
    if (state.memories.length === 0) return;

    generateGraph();
  }, [state.memories]);

  const generateGraph = async () => {
    setIsAnalyzing(true);
    const newNodes: MemoryNode[] = [];
    const newConnections: Connection[] = [];

    // Create nodes for each memory with AI analysis
    for (let i = 0; i < state.memories.length; i++) {
      const memory: any = state.memories[i];
      const angle = (i / state.memories.length) * 2 * Math.PI;
      const radius = Math.min(300, state.memories.length * 30);
      const x = Math.cos(angle) * radius + 400;
      const y = Math.sin(angle) * radius + 300;

      // AI analyze memory for keywords and sentiment
      let keywords: string[] = [];
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      
      try {
        const keywordResult = await extractMemoryKeywords(memory);
        if (keywordResult.success && keywordResult.keywords) {
          keywords = keywordResult.keywords;
        }
        
        const sentimentResult = await analyzeMemorySentiment(memory);
        if (sentimentResult.success && sentimentResult.sentiment) {
          sentiment = sentimentResult.sentiment;
        }
      } catch (error) {
        console.warn('Failed to analyze memory with AI:', error);
      }

      newNodes.push({
        id: memory.id || `memory-${i}`,
        x,
        y,
        memory,
        connections: [],
        color: colorPalette[i % colorPalette.length],
        keywords,
        sentiment
      });
    }

    // Create connections based on AI analysis
    for (let i = 0; i < newNodes.length; i++) {
      for (let j = i + 1; j < newNodes.length; j++) {
        const connection = await analyzeConnection(newNodes[i], newNodes[j]);
        if (connection && connection.type !== 'none' && connection.strength > 20) {
          newConnections.push(connection);
          newNodes[i].connections.push(newNodes[j].id);
          newNodes[j].connections.push(newNodes[i].id);
        }
      }
    }

    setNodes(newNodes);
    setConnections(newConnections);
    setIsAnalyzing(false);
  };

  const analyzeConnection = async (nodeA: MemoryNode, nodeB: MemoryNode): Promise<Connection | null> => {
    try {
      const result = await analyzeMemoryConnection(nodeA.memory, nodeB.memory);
      
      if (result.success && result.connectionType && result.strength) {
        return {
          from: nodeA.id,
          to: nodeB.id,
          strength: result.strength / 100, // Normalize to 0-1
          type: result.connectionType as 'temporal' | 'thematic' | 'emotional' | 'keyword' | 'none'
        };
      }
      
      // Fallback to basic connection analysis
      return analyzeConnectionBasic(nodeA, nodeB);
    } catch (error) {
      console.warn('AI connection analysis failed, using basic analysis:', error);
      return analyzeConnectionBasic(nodeA, nodeB);
    }
  };

  const analyzeConnectionBasic = (nodeA: MemoryNode, nodeB: MemoryNode): Connection | null => {
    const memoryA = nodeA.memory;
    const memoryB = nodeB.memory;

    // Check temporal connection (same date or close dates)
    const dateA = new Date(memoryA.date || memoryA.created_at);
    const dateB = new Date(memoryB.date || memoryB.created_at);
    const dateDiff = Math.abs(dateA.getTime() - dateB.getTime());
    const daysDiff = dateDiff / (1000 * 60 * 60 * 24);

    if (daysDiff <= 7) { // Within a week
      return {
        from: nodeA.id,
        to: nodeB.id,
        strength: Math.max(0.3, 1 - daysDiff / 7),
        type: 'temporal'
      };
    }

    // Check keyword connections
    if (nodeA.keywords && nodeB.keywords) {
      const commonKeywords = nodeA.keywords.filter(k => nodeB.keywords?.includes(k));
      if (commonKeywords.length > 0) {
        return {
          from: nodeA.id,
          to: nodeB.id,
          strength: Math.min(1, commonKeywords.length * 0.2),
          type: 'keyword'
        };
      }
    }

    // Check thematic connections (similar emotional tone)
    if (nodeA.sentiment && nodeB.sentiment && 
        nodeA.sentiment === nodeB.sentiment && 
        nodeA.sentiment !== 'neutral') {
      return {
        from: nodeA.id,
        to: nodeB.id,
        strength: 0.4,
        type: 'emotional'
      };
    }

    return null;
  };

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context for transformations
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    // Draw connections
    connections.forEach((connection: Connection) => {
      const fromNode = nodes.find((n: MemoryNode) => n.id === connection.from);
      const toNode = nodes.find((n: MemoryNode) => n.id === connection.to);

      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);

        // Connection styling based on type
        switch (connection.type) {
          case 'temporal':
            ctx.strokeStyle = '#3B82F6';
            ctx.lineWidth = 2;
            break;
          case 'keyword':
            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = 2;
            break;
          case 'emotional':
            ctx.strokeStyle = '#F59E0B';
            ctx.lineWidth = 2;
            break;
          case 'thematic':
            ctx.strokeStyle = '#8B5CF6';
            ctx.lineWidth = 2;
            break;
          default:
            ctx.strokeStyle = '#6B7280';
            ctx.lineWidth = 1;
        }

        ctx.globalAlpha = connection.strength * 0.6;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // Draw nodes
    nodes.forEach((node: MemoryNode) => {
      if (searchTerm && !node.memory.prompt.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !node.memory.response.toLowerCase().includes(searchTerm.toLowerCase())) {
        return;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);

      // Node styling
      if (selectedNode?.id === node.id) {
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 3;
      } else {
        ctx.fillStyle = node.color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
      }

      ctx.fill();
      ctx.stroke();

      // Draw node label (first few words)
      ctx.fillStyle = '#1F2937';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      const label = node.memory.prompt.length > 20
        ? node.memory.prompt.substring(0, 17) + '...'
        : node.memory.prompt;
      ctx.fillText(label, node.x, node.y + 40);
    });

    ctx.restore();
  }, [nodes, connections, selectedNode, zoom, panOffset, searchTerm]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - panOffset.x) / zoom;
    const y = (event.clientY - rect.top - panOffset.y) / zoom;

    // Check if clicked on a node
    const clickedNode = nodes.find((node: MemoryNode) => {
      const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      return distance <= 25;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
    } else {
      setSelectedNode(null);
    }
  };

  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `memory-knowledge-graph-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();

    addToast({
      type: 'success',
      title: 'Graph Exported!',
      message: 'Knowledge graph has been saved to your device.',
      duration: 3000
    });
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
        <h1 className="text-2xl font-bold text-gray-800">Memory Connections</h1>
      </div>

      {/* Controls */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100 mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 bg-orange-50/50 rounded-xl border border-orange-200 focus:border-orange-400 outline-none"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 bg-orange-50/50 rounded-xl border border-orange-200 focus:border-orange-400 outline-none"
            >
              <option value="all">All Connections</option>
              <option value="temporal">Time-based</option>
              <option value="keyword">Keyword-based</option>
              <option value="emotional">Emotional</option>
              <option value="thematic">Thematic</option>
            </select>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(Math.min(zoom * 1.2, 3))}
              className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom / 1.2, 0.3))}
              className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-blue-500 rounded"></div>
            <span>Time-based connections</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-green-500 rounded"></div>
            <span>Keyword connections</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-yellow-500 rounded"></div>
            <span>Emotional connections</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-purple-500 rounded"></div>
            <span>Thematic connections</span>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {isAnalyzing && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100 mb-6 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Analyzing memories with AI...</span>
          </div>
        </div>
      )}

      {/* Graph Canvas */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100 mb-6">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-gray-200 rounded-xl cursor-pointer bg-gray-50"
          onClick={handleCanvasClick}
        />
      </div>

      {/* Selected Memory Details */}
      {selectedNode && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex-shrink-0"
              style={{ backgroundColor: selectedNode.color }}
            />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{selectedNode.memory.prompt}</h3>
              <p className="text-gray-600 mb-3">{selectedNode.memory.response}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>📅 {new Date(selectedNode.memory.date || selectedNode.memory.created_at).toLocaleDateString()}</span>
                <span>🔗 {selectedNode.connections.length} connections</span>
                {selectedNode.sentiment && (
                  <span>😊 Sentiment: {selectedNode.sentiment}</span>
                )}
              </div>

              {/* Keywords */}
              {selectedNode.keywords && selectedNode.keywords.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold text-gray-700 mb-1">Keywords:</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.keywords.map((keyword, index) => (
                      <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Connection details */}
              {selectedNode.connections.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Connected Memories:</h4>
                  <div className="space-y-2">
                    {selectedNode.connections.slice(0, 3).map((connectionId: string) => {
                      const connectedNode = nodes.find((n: MemoryNode) => n.id === connectionId);
                      if (!connectedNode) return null;

                      const connection = connections.find(
                        (c: Connection) => (c.from === selectedNode.id && c.to === connectionId) ||
                             (c.from === connectionId && c.to === selectedNode.id)
                      );

                      return (
                        <div key={connectionId} className="flex items-center gap-2 text-sm">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: connectedNode.color }}
                          />
                          <span className="text-gray-600 truncate">{connectedNode.memory.prompt}</span>
                          <span className="text-xs text-gray-400 ml-auto">
                            {connection?.type} ({Math.round((connection?.strength || 0) * 100)}%)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {nodes.length === 0 && !isAnalyzing && (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-orange-100 text-center">
          <Network className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Memories to Connect</h3>
          <p className="text-gray-600">
            Add some memories first to see how they connect and form your personal knowledge graph.
          </p>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraphView;