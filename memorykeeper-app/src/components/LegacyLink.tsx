import React, { memo } from 'react';
import { ChevronLeft, Link, CheckCircle, X, RotateCcw, Trophy, Target, Clock, Plus, Minus, Zap } from 'lucide-react';
import { useAdaptiveAgent } from '../hooks/useAdaptiveAgent';
import { useAuth } from '../lib/AuthContext';
import { useAppState } from '../lib/AppStateContext';
import { addMemory, updateMemoryStrength } from '../lib/dataService';
import AdaptiveAgentDisplay from './AdaptiveAgentDisplay';
import { useState, useEffect, useCallback } from 'react';

interface LegacyLinkProps {
  onBack: () => void;
}

interface Node {
  id: string;
  text: string;
  type: 'memory' | 'concept' | 'person' | 'place' | 'emotion' | 'event';
  x: number;
  y: number;
  isCentral?: boolean;
}

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  strength: number; // 1-10
}

const LegacyLink: React.FC<LegacyLinkProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { state } = useAppState();
  const currentMemory = state.memories[0]; // Get most recent memory
  const difficulty = state.memoryStrength < 40 ? 'easy' : 
                    state.memoryStrength < 70 ? 'medium' : 'hard';
  
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'success' | 'failed'>('ready');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [newNodeText, setNewNodeText] = useState('');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per level
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [mode, setMode] = useState<'guided' | 'semi-guided' | 'free-form'>('guided');

  // Adaptive agent integration
  const {
    agentDecision,
    isVisible: agentVisible,
    showAgent,
    hideAgent,
    requestHint,
    updateGameProgress,
    recordGameCompletion
  } = useAdaptiveAgent({
    userId: user?.id || 'guest',
    gameId: 'legacy-link',
    difficulty,
    currentMemory
  });

  // Set mode based on memory strength (adaptation logic from PRD)
  useEffect(() => {
    if (state.memoryStrength < 40) {
      setMode('guided');
    } else if (state.memoryStrength < 70) {
      setMode('semi-guided');
    } else {
      setMode('free-form');
    }
  }, [state.memoryStrength]);

  // Generate initial nodes based on mode
  const generateInitialNodes = useCallback(() => {
    // Central memory node
    const centralNode: Node = {
      id: 'central',
      text: currentMemory?.prompt || 'Your Memory',
      type: 'memory',
      x: 50,
      y: 50,
      isCentral: true
    };

    const initialNodes: Node[] = [centralNode];
    
    // Add AI-suggested nodes based on mode
    if (mode === 'guided' || mode === 'semi-guided') {
      // For guided mode, suggest all nodes
      // For semi-guided, suggest 3 nodes
      const suggestedCount = mode === 'guided' ? 5 : 3;
      
      // Sample suggestions based on memory content
      const suggestions: Node[] = [
        { id: 'person-1', text: 'Family Member', type: 'person', x: 30, y: 30 },
        { id: 'place-1', text: 'Location', type: 'place', x: 70, y: 30 },
        { id: 'emotion-1', text: 'Feeling', type: 'emotion', x: 30, y: 70 },
        { id: 'event-1', text: 'Event', type: 'event', x: 70, y: 70 },
        { id: 'concept-1', text: 'Concept', type: 'concept', x: 50, y: 20 }
      ];
      
      // Add suggested nodes
      for (let i = 0; i < suggestedCount; i++) {
        if (suggestions[i]) {
          initialNodes.push({
            ...suggestions[i],
            x: suggestions[i].x + (Math.random() * 10 - 5), // Add some randomness
            y: suggestions[i].y + (Math.random() * 10 - 5)
          });
        }
      }
    }
    
    setNodes(initialNodes);
    
    // Set time based on difficulty
    const time = state.memoryStrength < 40 ? 180 : 
                state.memoryStrength < 70 ? 150 : 120;
    setTimeLeft(time);
  }, [currentMemory, mode, state.memoryStrength]);

  // Add a new node
  const addNode = () => {
    if (!newNodeText.trim()) return;
    
    const newNode: Node = {
      id: `node-${Date.now()}`,
      text: newNodeText,
      type: 'concept', // Default type, could be enhanced
      x: 20 + Math.random() * 60, // Random position
      y: 20 + Math.random() * 60
    };
    
    setNodes(prev => [...prev, newNode]);
    setNewNodeText('');
  };

  // Connect two nodes
  const connectNodes = (targetNodeId: string) => {
    if (!selectedNode || selectedNode === targetNodeId) return;
    
    // Check if connection already exists
    const connectionExists = connections.some(conn => 
      (conn.sourceId === selectedNode && conn.targetId === targetNodeId) ||
      (conn.sourceId === targetNodeId && conn.targetId === selectedNode)
    );
    
    if (connectionExists) return;
    
    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
      sourceId: selectedNode,
      targetId: targetNodeId,
      strength: 5 // Default strength
    };
    
    setConnections(prev => [...prev, newConnection]);
    setSelectedNode(null);
    
    // Award points for connection
    const points = 8;
    setScore(prev => prev + points);
    setStreak(prev => prev + 1);
    
    // Check for completion
    if (nodes.length + connections.length >= 7) {
      setGameState('success');
      setFeedbackMessage(`Great job! You've created a web of ${nodes.length} nodes and ${connections.length} connections!`);
      setShowFeedback(true);
      
      // Record success
      recordGameCompletion(true, (120 + level * 30) - timeLeft);
      
      // Update memory strength
      if (user?.id) {
        updateMemoryStrength(user.id, score + streak * 5);
      }
      
      setTimeout(() => {
        setShowFeedback(false);
        showAgent();
      }, 2000);
    }
  };

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('failed');
      setMistakes(prev => prev + 1);
      setStreak(0);
      setFeedbackMessage('Time\'s up! Try to create connections faster.');
      setShowFeedback(true);
      showAgent();
    }
    return () => clearTimeout(timer);
  }, [gameState, timeLeft]);

  // Update agent with game progress
  useEffect(() => {
    if (gameState === 'playing') {
      updateGameProgress(nodes.length, mistakes, streak, timeLeft);
    }
  }, [nodes.length, mistakes, streak, timeLeft, gameState, updateGameProgress]);

  // Start new game
  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setMistakes(0);
    setStreak(0);
    setConnections([]);
    setSelectedNode(null);
    setNewNodeText('');
    setShowFeedback(false);
    hideAgent();
    generateInitialNodes();
  };

  // Reset game
  const resetGame = () => {
    setGameState('ready');
    setScore(0);
    setLevel(1);
    setTimeLeft(120);
    setMistakes(0);
    setStreak(0);
    setNodes([]);
    setConnections([]);
    setSelectedNode(null);
    setNewNodeText('');
    setShowFeedback(false);
    hideAgent();
  };

  // Get node type color
  const getNodeTypeColor = (type: Node['type']) => {
    switch (type) {
      case 'memory': return 'bg-gradient-to-br from-purple-500 to-indigo-500';
      case 'person': return 'bg-gradient-to-br from-blue-500 to-cyan-500';
      case 'place': return 'bg-gradient-to-br from-green-500 to-emerald-500';
      case 'emotion': return 'bg-gradient-to-br from-red-500 to-orange-500';
      case 'event': return 'bg-gradient-to-br from-yellow-500 to-amber-500';
      case 'concept': return 'bg-gradient-to-br from-pink-500 to-rose-500';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-600';
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
        <h1 className="text-2xl font-bold text-gray-800">Legacy Link</h1>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-orange-100">
          <div className="flex items-center gap-1 mb-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-bold text-gray-800">Score</span>
          </div>
          <span className="text-lg font-bold text-gray-800">{score}</span>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-orange-100">
          <div className="flex items-center gap-1 mb-1">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-gray-800">Level</span>
          </div>
          <span className="text-lg font-bold text-gray-800">{level}</span>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-orange-100">
          <div className="flex items-center gap-1 mb-1">
            <RotateCcw className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-gray-800">Streak</span>
          </div>
          <span className="text-lg font-bold text-gray-800">{streak}</span>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-orange-100">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-gray-800">Time</span>
          </div>
          <span className="text-lg font-bold text-gray-800">{timeLeft}s</span>
        </div>
      </div>

      {/* Mode Indicator */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 shadow-lg border border-orange-100 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-gray-800">
              {mode === 'guided' ? 'Guided Mode' : 
               mode === 'semi-guided' ? 'Semi-Guided Mode' : 'Free-Form Mode'}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {mode === 'guided' ? 'AI suggests all nodes' : 
             mode === 'semi-guided' ? 'AI suggests some nodes' : 'Create your own nodes'}
          </span>
        </div>
      </div>

      {/* Game Board */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
            <Link className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Legacy Link</h2>
            <p className="text-sm text-gray-500">Connect related memories and concepts</p>
          </div>
        </div>

        <p className="mb-6 text-gray-600">
          Create a web of connections between your memories and related concepts. 
          {mode === 'guided' 
            ? ' AI has suggested nodes for you to connect.' 
            : mode === 'semi-guided' 
              ? ' AI has suggested some nodes, add your own connections.' 
              : ' Create your own nodes and connections.'}
        </p>

        {gameState === 'ready' && (
          <div className="text-center">
            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
            >
              <Link className="w-5 h-5" />
              Start Linking
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <>
            {/* Node Graph Visualization */}
            <div className="relative h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-dashed border-purple-200 mb-6 overflow-hidden">
              {/* Connections */}
              <svg className="absolute inset-0 w-full h-full">
                {connections.map(conn => {
                  const sourceNode = nodes.find(n => n.id === conn.sourceId);
                  const targetNode = nodes.find(n => n.id === conn.targetId);
                  
                  if (!sourceNode || !targetNode) return null;
                  
                  // Convert percentages to pixels (assuming 400px height)
                  const sourceX = (sourceNode.x / 100) * 400;
                  const sourceY = (sourceNode.y / 100) * 400;
                  const targetX = (targetNode.x / 100) * 400;
                  const targetY = (targetNode.y / 100) * 400;
                  
                  return (
                    <line
                      key={conn.id}
                      x1={sourceX}
                      y1={sourceY}
                      x2={targetX}
                      y2={targetY}
                      stroke="#9333ea"
                      strokeWidth="2"
                      strokeDasharray={conn.strength > 7 ? "none" : "5,5"}
                    />
                  );
                })}
              </svg>
              
              {/* Nodes */}
              {nodes.map(node => (
                <div
                  key={node.id}
                  onClick={() => {
                    if (selectedNode) {
                      connectNodes(node.id);
                    } else {
                      setSelectedNode(node.id);
                    }
                  }}
                  className={`absolute w-16 h-16 rounded-full flex items-center justify-center text-white text-xs font-bold text-center p-1 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                    getNodeTypeColor(node.type)
                  } ${selectedNode === node.id ? 'ring-4 ring-yellow-400 scale-110' : ''} ${
                    node.isCentral ? 'w-20 h-20' : ''
                  }`}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`
                  }}
                >
                  <span className="truncate">{node.text}</span>
                </div>
              ))}
              
              {/* Instructions */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white text-sm p-2 rounded-lg">
                {selectedNode 
                  ? 'Select another node to connect' 
                  : 'Select a node to start connecting'}
              </div>
            </div>

            {/* Add New Node (Free-form mode) */}
            {(mode === 'free-form' || mode === 'semi-guided') && (
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  value={newNodeText}
                  onChange={(e) => setNewNodeText(e.target.value)}
                  placeholder="Add a new concept..."
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={addNode}
                  disabled={!newNodeText.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Connection Info */}
            <div className="bg-purple-50 rounded-2xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-purple-800">Connections: {connections.length}</span>
                <span className="font-bold text-purple-800">Nodes: {nodes.length}</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (connections.length / 7) * 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-purple-700 mt-1">
                Complete 7 connections to finish the level
              </p>
            </div>
          </>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className={`mt-6 p-4 rounded-2xl text-center ${
            gameState === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              {gameState === 'success' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <X className="w-6 h-6 text-red-600" />
              )}
              <span className={`font-bold ${
                gameState === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {gameState === 'success' ? 'Excellent!' : 'Try Again'}
              </span>
            </div>
            <p className={gameState === 'success' ? 'text-green-700' : 'text-red-700'}>
              {feedbackMessage}
            </p>
          </div>
        )}

        {gameState === 'success' && (
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setLevel(prev => prev + 1);
                setShowFeedback(false);
                startGame();
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Next Level
            </button>
          </div>
        )}

        {gameState === 'failed' && (
          <div className="text-center mt-6">
            <button
              onClick={() => {
                setShowFeedback(false);
                setGameState('playing');
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="text-center mb-6">
        <button
          onClick={resetGame}
          className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-all"
        >
          Reset Game
        </button>
      </div>

      {/* Adaptive Agent Display */}
      {agentDecision && (
        <AdaptiveAgentDisplay
          hint={agentDecision.hint}
          scaffolding={agentDecision.scaffolding}
          agentMessage={agentDecision.agentMessage}
          agentType={agentDecision.agentType}
          isVisible={agentVisible}
          onDismiss={hideAgent}
          onRequestHint={requestHint}
        />
      )}

      {/* Instructions */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-orange-100">
        <h3 className="font-bold text-gray-800 mb-3">How to Play</h3>
        <ul className="text-gray-700 space-y-2 text-sm">
          <li>• Click on a node to select it, then click another node to create a connection</li>
          <li>• Create connections between related memories and concepts</li>
          <li>• Add your own concepts in free-form mode</li>
          <li>• Complete 7 connections to finish the level</li>
        </ul>
      </div>
    </div>
  );
};

export default memo(LegacyLink);