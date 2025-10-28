import { DifficultyLevel, GamePerformance } from './difficultyService';
import { Memory } from './dataService';

export interface AdaptiveAgentProfile {
  userId: string;
  currentAgentType: AgentType;
  performanceHistory: GamePerformance[];
  memoryStrength: number;
  lastInteraction: Date;
}

export interface AgentHint {
  id: string;
  type: HintType;
  content: string;
  priority: number; // 1-10, higher is more important
  triggeredBy: HintTrigger;
  gameId: string;
}

export interface AgentScaffolding {
  id: string;
  type: ScaffoldingType;
  content: string;
  level: ScaffoldingLevel; // How much support to provide
  gameId: string;
}

export type AgentType = 'encourager' | 'instructor' | 'coach' | 'mentor';
export type HintType = 'visual' | 'verbal' | 'contextual' | 'strategic';
export type HintTrigger = 'time_pressure' | 'mistake_threshold' | 'streak_break' | 'difficulty_spike' | 'manual_request';
export type ScaffoldingType = 'memory_cue' | 'step_by_step' | 'pattern_recognition' | 'strategy_suggestion';
export type ScaffoldingLevel = 'minimal' | 'moderate' | 'substantial';

export interface AgentDecisionContext {
  userId: string;
  gameId: string;
  difficulty: DifficultyLevel;
  currentTime: number; // seconds elapsed
  moves: number;
  mistakes: number;
  streak: number; // consecutive correct answers
  memoryStrength: number;
  userPerformanceHistory: GamePerformance[];
  currentMemory?: Memory; // The memory being used in the game
  agentProfile: AdaptiveAgentProfile;
}

export interface AgentDecision {
  shouldProvideHint: boolean;
  shouldProvideScaffolding: boolean;
  hint?: AgentHint;
  scaffolding?: AgentScaffolding;
  agentMessage?: string; // Message from the agent to the user
  agentType?: AgentType; // Type of agent to display
}