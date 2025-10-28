import {
  AdaptiveAgentProfile,
  AgentDecisionContext,
  AgentDecision,
  AgentType,
  AgentHint,
  AgentScaffolding
} from './adaptiveAgentTypes';
import { getMemoryStrength } from './dataService';
import { getProfile } from './indexedDBService';
import { DifficultyLevel, GamePerformance } from './difficultyService';
import { Memory } from './dataService';

/**
 * Get or create an adaptive agent profile for a user
 * @param userId - The user's ID
 * @returns The adaptive agent profile
 */
export const getAdaptiveAgentProfile = async (userId: string): Promise<AdaptiveAgentProfile> => {
  try {
    // Try to get memory strength from Supabase
    const { data: memoryStrength } = await getMemoryStrength(userId);
    
    // If not available, try IndexedDB
    if (memoryStrength === null) {
      try {
        const profile = await getProfile();
        return {
          userId,
          currentAgentType: determineAgentType(profile?.memoryStrength || 50),
          performanceHistory: [],
          memoryStrength: profile?.memoryStrength || 50,
          lastInteraction: new Date()
        };
      } catch (error) {
        console.warn('Could not fetch profile from IndexedDB:', error);
      }
    }
    
    return {
      userId,
      currentAgentType: determineAgentType(memoryStrength || 50),
      performanceHistory: [],
      memoryStrength: memoryStrength || 50,
      lastInteraction: new Date()
    };
  } catch (error) {
    console.warn('Error getting adaptive agent profile:', error);
    // Return default profile
    return {
      userId,
      currentAgentType: 'coach',
      performanceHistory: [],
      memoryStrength: 50,
      lastInteraction: new Date()
    };
  }
};

/**
 * Determine the appropriate agent type based on memory strength
 * @param memoryStrength - The user's memory strength (0-100)
 * @returns The appropriate agent type
 */
const determineAgentType = (memoryStrength: number): AgentType => {
  if (memoryStrength >= 80) return 'mentor'; // High confidence, minimal guidance
  if (memoryStrength >= 60) return 'coach';  // Moderate confidence, balanced guidance
  if (memoryStrength >= 40) return 'instructor'; // Lower confidence, more guidance
  return 'encourager'; // Low confidence, maximum encouragement and support
};

/**
 * Update the adaptive agent profile with new performance data
 * @param profile - The current agent profile
 * @param performance - The new performance data
 * @returns Updated agent profile
 */
export const updateAgentProfile = (
  profile: AdaptiveAgentProfile,
  performance: GamePerformance
): AdaptiveAgentProfile => {
  // Keep only the last 20 performances to avoid memory issues
  const updatedHistory = [...profile.performanceHistory, performance].slice(-20);
  
  // Calculate new memory strength based on performance
  const newMemoryStrength = calculateMemoryStrengthFromPerformance(
    profile.memoryStrength,
    performance
  );
  
  return {
    ...profile,
    performanceHistory: updatedHistory,
    memoryStrength: newMemoryStrength,
    currentAgentType: determineAgentType(newMemoryStrength),
    lastInteraction: new Date()
  };
};

/**
 * Calculate updated memory strength based on game performance
 * @param currentStrength - Current memory strength
 * @param performance - New performance data
 * @returns Updated memory strength
 */
const calculateMemoryStrengthFromPerformance = (
  currentStrength: number,
  performance: GamePerformance
): number => {
  // Base adjustment based on success
  let adjustment = performance.success ? 2 : -1;
  
  // Adjust based on difficulty
  if (performance.difficulty === 'hard') {
    adjustment *= performance.success ? 1.5 : 0.5;
  } else if (performance.difficulty === 'easy') {
    adjustment *= performance.success ? 0.7 : 1.3;
  }
  
  // Adjust based on completion time (faster is better for successful games)
  if (performance.success && performance.completionTime < 60) {
    adjustment += 1;
  } else if (!performance.success && performance.completionTime > 180) {
    adjustment -= 1;
  }
  
  // Ensure the adjustment doesn't push strength outside 1-100 range
  const newStrength = Math.min(100, Math.max(1, currentStrength + adjustment));
  return Math.round(newStrength);
};

/**
 * Make a decision about what kind of support to provide based on context
 * @param context - The current game context
 * @returns Decision about hints and scaffolding
 */
export const makeAgentDecision = (context: AgentDecisionContext): AgentDecision => {
  // Initialize decision
  const decision: AgentDecision = {
    shouldProvideHint: false,
    shouldProvideScaffolding: false
  };
  
  // Check for time pressure
  if (context.difficulty !== 'easy' && context.currentTime > 60) {
    decision.shouldProvideHint = true;
    decision.hint = createTimePressureHint(context);
  }
  
  // Check for mistake threshold
  if (context.mistakes >= 3) {
    decision.shouldProvideHint = true;
    decision.hint = createMistakeThresholdHint(context);
  }
  
  // Check for streak break (if user was doing well but made a mistake)
  if (context.streak >= 3 && context.mistakes > 0) {
    decision.shouldProvideHint = true;
    decision.agentMessage = "Don't worry about that mistake! You were doing so well. Let's try another one.";
  }
  
  // Check for difficulty spike
  if (context.difficulty === 'hard' && context.moves > 5 && context.mistakes > 2) {
    decision.shouldProvideScaffolding = true;
    decision.scaffolding = createDifficultySpikeScaffolding(context);
  }
  
  // Adjust based on user's memory strength
  if (context.memoryStrength < 40) {
    // User needs more support
    decision.shouldProvideScaffolding = true;
    if (!decision.scaffolding) {
      decision.scaffolding = createMemorySupportScaffolding(context);
    }
  } else if (context.memoryStrength > 80) {
    // User is confident, provide minimal hints
    decision.shouldProvideHint = false;
    decision.shouldProvideScaffolding = false;
  }
  
  // Set agent type based on profile
  decision.agentType = context.agentProfile.currentAgentType;
  
  return decision;
};

/**
 * Create a time pressure hint
 * @param context - The current game context
 * @returns A time pressure hint
 */
const createTimePressureHint = (context: AgentDecisionContext): AgentHint => {
  const hints: Record<DifficultyLevel, string> = {
    easy: "Take your time! There's no rush to finish.",
    medium: "You're doing great! Just focus on matching the pairs correctly.",
    hard: "I see you're working hard! Remember the patterns you've seen."
  };
  
  return {
    id: `hint-${Date.now()}`,
    type: 'verbal',
    content: hints[context.difficulty],
    priority: 5,
    triggeredBy: 'time_pressure',
    gameId: context.gameId
  };
};

/**
 * Create a mistake threshold hint
 * @param context - The current game context
 * @returns A mistake threshold hint
 */
const createMistakeThresholdHint = (context: AgentDecisionContext): AgentHint => {
  const hints: Record<DifficultyLevel, string> = {
    easy: "That's okay! Try to remember where you saw similar words.",
    medium: "Don't worry about mistakes! They help us learn. Look for patterns.",
    hard: "Even experts make mistakes! Focus on one pair at a time."
  };
  
  return {
    id: `hint-${Date.now()}`,
    type: 'verbal',
    content: hints[context.difficulty],
    priority: 7,
    triggeredBy: 'mistake_threshold',
    gameId: context.gameId
  };
};

/**
 * Create scaffolding for difficulty spikes
 * @param context - The current game context
 * @returns Difficulty spike scaffolding
 */
const createDifficultySpikeScaffolding = (context: AgentDecisionContext): AgentScaffolding => {
  return {
    id: `scaffolding-${Date.now()}`,
    type: 'step_by_step',
    content: "Let's break this down:\n1. Focus on one section at a time\n2. Look for familiar patterns\n3. Take your time to think before clicking",
    level: 'substantial',
    gameId: context.gameId
  };
};

/**
 * Create scaffolding for memory support
 * @param context - The current game context
 * @returns Memory support scaffolding
 */
const createMemorySupportScaffolding = (context: AgentDecisionContext): AgentScaffolding => {
  let content = "Here are some tips to help you:\n";
  
  if (context.currentMemory) {
    content += `- Think about the story behind this memory: "${context.currentMemory.prompt}"\n`;
    content += `- Remember key details from your response\n`;
  }
  
  content += `- Take breaks when you need them\n`;
  content += `- Don't hesitate to ask for hints\n`;
  
  return {
    id: `scaffolding-${Date.now()}`,
    type: 'memory_cue',
    content,
    level: 'moderate',
    gameId: context.gameId
  };
};

/**
 * Generate a personalized agent message based on performance
 * @param context - The current game context
 * @returns A personalized message from the agent
 */
export const generateAgentMessage = (context: AgentDecisionContext): string => {
  const agentType = context.agentProfile.currentAgentType;
  
  // Positive reinforcement messages
  if (context.streak >= 3) {
    const streakMessages: Record<AgentType, string> = {
      encourager: "You're on fire! 🔥 Keep that streak going!",
      instructor: "Excellent work! Your pattern recognition is improving.",
      coach: "That's a great streak! You're really getting the hang of this.",
      mentor: "Impressive consistency! Your focus is paying off."
    };
    return streakMessages[agentType];
  }
  
  // Encouragement after mistakes
  if (context.mistakes > 2) {
    const mistakeMessages: Record<AgentType, string> = {
      encourager: "Mistakes are just learning opportunities! You've got this! 💪",
      instructor: "That's okay! Let's try a different approach.",
      coach: "Don't get discouraged! Even champions make mistakes.",
      mentor: "Errors are part of the learning process. Adjust and continue."
    };
    return mistakeMessages[agentType];
  }
  
  // General progress messages
  const progressMessages: Record<AgentType, string> = {
    encourager: "You're doing wonderfully! Keep up the great work! ✨",
    instructor: "Good progress! Let's keep building on what you've learned.",
    coach: "You're making solid progress. Stay focused!",
    mentor: "Your dedication is evident. Continue at your own pace."
  };
  
  return progressMessages[agentType];
};

export default {
  getAdaptiveAgentProfile,
  updateAgentProfile,
  makeAgentDecision,
  generateAgentMessage
};
