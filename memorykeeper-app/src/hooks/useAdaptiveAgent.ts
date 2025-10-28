
import { useState, useEffect, useCallback } from 'react';
import { 
  getAdaptiveAgentProfile, 
  updateAgentProfile, 
  makeAgentDecision,
  generateAgentMessage
} from '../lib/adaptiveAgentService';
import { 
  AdaptiveAgentProfile, 
  AgentDecisionContext, 
  AgentDecision 
} from '../lib/adaptiveAgentTypes';
import { DifficultyLevel, GamePerformance } from '../lib/difficultyService';
import { Memory } from '../lib/dataService';

interface UseAdaptiveAgentProps {
  userId: string;
  gameId: string;
  difficulty: DifficultyLevel;
  currentMemory?: Memory;
}

interface AdaptiveAgentState {
  agentProfile: AdaptiveAgentProfile | null;
  agentDecision: AgentDecision | null;
  isVisible: boolean;
  showAgent: () => void;
  hideAgent: () => void;
  requestHint: () => void;
  updateGameProgress: (moves: number, mistakes: number, streak: number, currentTime: number) => void;
  recordGameCompletion: (success: boolean, completionTime: number) => void;
}

export const useAdaptiveAgent = ({
  userId,
  gameId,
  difficulty,
  currentMemory
}: UseAdaptiveAgentProps): AdaptiveAgentState => {
  const [agentProfile, setAgentProfile] = useState<AdaptiveAgentProfile | null>(null);
  const [agentDecision, setAgentDecision] = useState<AgentDecision | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [gameContext, setGameContext] = useState<Omit<AgentDecisionContext, 'agentProfile' | 'userPerformanceHistory' | 'memoryStrength'>>({
    userId,
    gameId,
    difficulty,
    currentTime: 0,
    moves: 0,
    mistakes: 0,
    streak: 0,
    currentMemory
  });

  // Initialize agent profile
  useEffect(() => {
    const initializeAgent = async () => {
      try {
        const profile = await getAdaptiveAgentProfile(userId);
        setAgentProfile(profile);
      } catch (error) {
        console.error('Error initializing adaptive agent:', error);
      }
    };

    initializeAgent();
  }, [userId]);

  // Make decisions based on game context
  useEffect(() => {
    if (!agentProfile) return;

    const context: AgentDecisionContext = {
      ...gameContext,
      agentProfile,
      userPerformanceHistory: agentProfile.performanceHistory,
      memoryStrength: agentProfile.memoryStrength
    };

    const decision = makeAgentDecision(context);
    setAgentDecision(decision);

    // Auto-show agent if there's important feedback
    if ((decision.shouldProvideHint || decision.shouldProvideScaffolding || decision.agentMessage) && 
        decision.hint?.priority && decision.hint.priority >= 7) {
      setIsVisible(true);
    }
  }, [agentProfile, gameContext]);

  const showAgent = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideAgent = useCallback(() => {
    setIsVisible(false);
  }, []);

  const requestHint = useCallback(() => {
    if (!agentProfile) return;

    const context: AgentDecisionContext = {
      ...gameContext,
      agentProfile,
      userPerformanceHistory: agentProfile.performanceHistory,
      memoryStrength: agentProfile.memoryStrength
    };

    // For manual requests, always provide some form of support
    const decision: AgentDecision = {
      shouldProvideHint: true,
      shouldProvideScaffolding: false,
      agentMessage: generateAgentMessage(context),
      agentType: agentProfile.currentAgentType
    };

    setAgentDecision(decision);
    setIsVisible(true);
  }, [agentProfile, gameContext]);

  const updateGameProgress = useCallback((
    moves: number, 
    mistakes: number, 
    streak: number, 
    currentTime: number
  ) => {
    setGameContext(prev => ({
      ...prev,
      moves,
      mistakes,
      streak,
      currentTime
    }));
  }, []);

  const recordGameCompletion = useCallback(async (
    success: boolean, 
    completionTime: number
  ) => {
    if (!agentProfile) return;

    const performance: GamePerformance = {
      gameId,
      difficulty,
      completionTime,
      moves: gameContext.moves,
      success,
      timestamp: new Date()
    };

    try {
      const updatedProfile = updateAgentProfile(agentProfile, performance);
      setAgentProfile(updatedProfile);
    } catch (error) {
      console.error('Error updating agent profile:', error);
    }
  }, [agentProfile, gameId, difficulty, gameContext.moves]);

  return {
    agentProfile,
    agentDecision,
    isVisible,
    showAgent,
    hideAgent,
    requestHint,
    updateGameProgress,
    recordGameCompletion
  };
};

export default useAdaptiveAgent;