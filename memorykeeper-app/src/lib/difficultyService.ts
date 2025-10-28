import { getMemoryStrength } from './dataService';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface GamePerformance {
  gameId: string;
  difficulty: DifficultyLevel;
  completionTime: number; // in seconds
  moves: number;
  success: boolean;
  timestamp: Date;
}

export interface UserDifficultyProfile {
  userId: string;
  currentDifficulty: DifficultyLevel;
  performanceHistory: GamePerformance[];
  strengthBasedDifficulty: DifficultyLevel;
}

/**
 * Calculate the appropriate difficulty level based on user's memory strength
 * @param memoryStrength - The user's current memory strength (0-100)
 * @returns The recommended difficulty level
 */
export const calculateStrengthBasedDifficulty = (memoryStrength: number): DifficultyLevel => {
  if (memoryStrength >= 80) return 'hard';
  if (memoryStrength >= 60) return 'medium';
  return 'easy';
};

/**
 * Calculate difficulty based on recent performance history
 * @param performanceHistory - Array of recent game performances
 * @returns The performance-based difficulty level
 */
export const calculatePerformanceBasedDifficulty = (performanceHistory: GamePerformance[]): DifficultyLevel => {
  if (performanceHistory.length < 3) {
    // Not enough data, return medium as default
    return 'medium';
  }

  // Look at the last 5 performances
  const recentPerformances = performanceHistory.slice(-5);
  
  // Calculate success rate
  const successCount = recentPerformances.filter(p => p.success).length;
  const successRate = successCount / recentPerformances.length;
  
  // Calculate average completion time relative to optimal time
  const avgTime = recentPerformances.reduce((sum, p) => sum + p.completionTime, 0) / recentPerformances.length;
  
  // Adjust difficulty based on success rate and time
  if (successRate >= 0.8 && avgTime < 60) {
    // High success rate and fast completion - increase difficulty
    return 'hard';
  } else if (successRate >= 0.6) {
    // Moderate success rate - maintain current difficulty
    return 'medium';
  } else {
    // Low success rate - decrease difficulty
    return 'easy';
  }
};

/**
 * Get the recommended difficulty for a user based on both strength and performance
 * @param userId - The user's ID
 * @param performanceHistory - Array of recent game performances
 * @returns The recommended difficulty level
 */
export const getRecommendedDifficulty = async (
  userId: string,
  performanceHistory: GamePerformance[]
): Promise<DifficultyLevel> => {
  try {
    // Get user's current memory strength
    const { data: memoryStrength } = await getMemoryStrength(userId);
    const strengthBased = calculateStrengthBasedDifficulty(memoryStrength || 50);
    
    // Get performance-based difficulty
    const performanceBased = calculatePerformanceBasedDifficulty(performanceHistory);
    
    // Combine both factors (strength weighted 60%, performance 40%)
    if (strengthBased === 'hard' && performanceBased === 'hard') return 'hard';
    if (strengthBased === 'easy' && performanceBased === 'easy') return 'easy';
    return 'medium';
  } catch (error) {
    console.warn('Error calculating recommended difficulty:', error);
    // Fallback to medium difficulty
    return 'medium';
  }
};

/**
 * Adjust game parameters based on difficulty level
 * @param difficulty - The difficulty level
 * @param gameType - The type of game
 * @returns Game parameters adjusted for the difficulty level
 */
export const getDifficultySettings = (
  difficulty: DifficultyLevel,
  gameType: string
): Record<string, any> => {
  switch (gameType) {
    case 'memory-match':
      switch (difficulty) {
        case 'easy':
          return {
            pairs: 4, // 4 pairs (8 cards)
            timeLimit: null, // No time limit
            hintFrequency: 2, // Hint every 2 mismatches
            memoryWords: 4 // Use 4 words from memories
          };
        case 'medium':
          return {
            pairs: 6, // 6 pairs (12 cards)
            timeLimit: 180, // 3 minutes
            hintFrequency: 3, // Hint every 3 mismatches
            memoryWords: 6 // Use 6 words from memories
          };
        case 'hard':
          return {
            pairs: 8, // 8 pairs (16 cards)
            timeLimit: 120, // 2 minutes
            hintFrequency: 5, // Hint every 5 mismatches
            memoryWords: 8 // Use 8 words from memories
          };
        default:
          return {
            pairs: 6,
            timeLimit: null,
            hintFrequency: 3,
            memoryWords: 6
          };
      }
    default:
      // Default settings for other games
      switch (difficulty) {
        case 'easy':
          return { timeLimit: null, hintFrequency: 1 };
        case 'medium':
          return { timeLimit: 180, hintFrequency: 2 };
        case 'hard':
          return { timeLimit: 120, hintFrequency: 4 };
        default:
          return { timeLimit: null, hintFrequency: 2 };
      }
  }
};

/**
 * Update user's performance history
 * @param profile - The user's current difficulty profile
 * @param performance - The new performance data
 * @returns Updated difficulty profile
 */
export const updatePerformanceHistory = (
  profile: UserDifficultyProfile,
  performance: GamePerformance
): UserDifficultyProfile => {
  // Keep only the last 20 performances to avoid memory issues
  const updatedHistory = [...profile.performanceHistory, performance].slice(-20);
  
  return {
    ...profile,
    performanceHistory: updatedHistory
  };
};

export default {
  calculateStrengthBasedDifficulty,
  calculatePerformanceBasedDifficulty,
  getRecommendedDifficulty,
  getDifficultySettings,
  updatePerformanceHistory
};