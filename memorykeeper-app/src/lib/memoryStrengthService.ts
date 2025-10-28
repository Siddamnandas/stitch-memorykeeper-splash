import { getMemoryStrength, updateMemoryStrength } from './dataService';
import { getProfile, saveProfile } from './indexedDBService';

export interface MemoryActivity {
  type: 'memory_added' | 'memory_imported' | 'game_completed' | 'memory_reviewed' | 'daily_login' | 'game_perfect_score' | 'memory_shared' | 'streak_maintained';
  timestamp: Date;
  value: number; // Value of the activity (e.g., points earned)
  metadata?: {
    gameType?: string;
    memoryId?: string;
    importSource?: string;
    streakDays?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

export interface MemoryStrengthFactors {
  consistency: number; // How regularly the user engages (0-100)
  activityCount: number; // Total number of activities (0-100)
  recentActivity: number; // Recency of last activity (0-100)
  engagementDepth: number; // Quality of engagement (0-100)
  activityDiversity: number; // Variety of different activity types (0-100)
  progressStreak: number; // Consecutive days of activity (0-100)
  challengeLevel: number; // Difficulty level of completed activities (0-100)
  socialEngagement: number; // Collaborative/memory sharing activities (0-100)
}

/**
 * Calculate memory strength based on user activities
 * @param userId - The user's ID
 * @param activities - Array of user activities
 * @returns The calculated memory strength (0-100)
 */
export const calculateMemoryStrength = async (
  userId: string, 
  activities: MemoryActivity[]
): Promise<number> => {
  // Get current strength from database
  let currentStrength = 0;
  try {
    const { data } = await getMemoryStrength(userId);
    currentStrength = data || 0;
  } catch (error) {
    console.warn('Could not fetch current memory strength:', error);
    // Try to get from IndexedDB as fallback
    try {
      const profile = await getProfile();
      currentStrength = profile?.memoryStrength || 0;
    } catch (error) {
      console.warn('Could not fetch memory strength from IndexedDB:', error);
    }
  }

  // Calculate factors
  const factors = calculateFactors(activities);
  
  // Calculate new strength based on factors
  const baseIncrease = calculateBaseIncrease(factors);
  const timeDecay = calculateTimeDecay(currentStrength, activities);
  
  // Apply modifiers
  const newStrength = Math.min(100, Math.max(0, currentStrength + baseIncrease - timeDecay));
  
  return Math.round(newStrength);
};

/**
 * Calculate the factors that contribute to memory strength
 * @param activities - Array of user activities
 * @returns MemoryStrengthFactors object
 */
const calculateFactors = (activities: MemoryActivity[]): MemoryStrengthFactors => {
  if (activities.length === 0) {
    return {
      consistency: 0,
      activityCount: 0,
      recentActivity: 0,
      engagementDepth: 0,
      activityDiversity: 0,
      progressStreak: 0,
      challengeLevel: 0,
      socialEngagement: 0
    };
  }

  // Calculate consistency (how regularly user engages)
  const sortedActivities = [...activities].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );
  
  const activityDates = sortedActivities.map(a => a.timestamp.toDateString());
  const uniqueDays = [...new Set(activityDates)].length;
  const totalDays = Math.ceil(
    (sortedActivities[sortedActivities.length - 1].timestamp.getTime() - 
     sortedActivities[0].timestamp.getTime()) / (1000 * 60 * 60 * 24)
  ) || 1;
  
  const consistency = Math.min(100, (uniqueDays / totalDays) * 100);
  
  // Activity count factor
  const activityCount = Math.min(100, activities.length * 2);
  
  // Recent activity factor (0-100 based on how recent the last activity was)
  const now = new Date();
  const lastActivity = sortedActivities[sortedActivities.length - 1].timestamp;
  const hoursSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
  const recentActivity = Math.max(0, 100 - hoursSinceLastActivity);
  
  // Engagement depth factor (based on activity values)
  const totalValue = activities.reduce((sum, activity) => sum + activity.value, 0);
  const avgValue = totalValue / activities.length;
  const engagementDepth = Math.min(100, avgValue * 10);

  // Activity diversity factor (variety of activity types)
  const uniqueActivityTypes = new Set(activities.map(a => a.type)).size;
  const activityDiversity = Math.min(100, (uniqueActivityTypes / 8) * 100); // 8 possible activity types

  // Progress streak factor (consecutive days)
  const progressStreak = calculateStreakFactor(activities);

  // Challenge level factor (based on difficulty metadata)
  const challengeLevel = calculateChallengeFactor(activities);

  // Social engagement factor (sharing and collaboration)
  const socialEngagement = calculateSocialFactor(activities);

  return {
    consistency,
    activityCount,
    recentActivity,
    engagementDepth,
    activityDiversity,
    progressStreak,
    challengeLevel,
    socialEngagement
  };
};

/**
 * Calculate streak factor based on consecutive days of activity
 * @param activities - Array of user activities
 * @returns Streak factor (0-100)
 */
const calculateStreakFactor = (activities: MemoryActivity[]): number => {
  if (activities.length === 0) return 0;

  // Group activities by date
  const activityDates = new Set(
    activities.map(a => a.timestamp.toDateString())
  );

  // Find longest streak
  const sortedDates = Array.from(activityDates).sort();
  let maxStreak = 0;
  let currentStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);

    // Check if dates are consecutive (within 24 hours)
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays <= 1) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }

  maxStreak = Math.max(maxStreak, currentStreak);

  // Convert streak to factor (7+ day streak = max factor)
  return Math.min(100, maxStreak * 14.28);
};

/**
 * Calculate challenge factor based on difficulty of activities
 * @param activities - Array of user activities
 * @returns Challenge factor (0-100)
 */
const calculateChallengeFactor = (activities: MemoryActivity[]): number => {
  const challengeActivities = activities.filter(a =>
    a.metadata?.difficulty ||
    a.type === 'game_completed' ||
    a.type === 'game_perfect_score'
  );

  if (challengeActivities.length === 0) return 0;

  let totalChallengeScore = 0;

  challengeActivities.forEach(activity => {
    let score = 0;

    // Base score from difficulty
    switch (activity.metadata?.difficulty) {
      case 'easy': score = 10; break;
      case 'medium': score = 25; break;
      case 'hard': score = 50; break;
      default: score = 15; break;
    }

    // Bonus for perfect scores
    if (activity.type === 'game_perfect_score') {
      score *= 2;
    }

    // Bonus for game completion
    if (activity.type === 'game_completed') {
      score += 10;
    }

    totalChallengeScore += score;
  });

  const avgChallengeScore = totalChallengeScore / challengeActivities.length;
  return Math.min(100, avgChallengeScore * 2);
};

/**
 * Calculate social engagement factor based on sharing activities
 * @param activities - Array of user activities
 * @returns Social engagement factor (0-100)
 */
const calculateSocialFactor = (activities: MemoryActivity[]): number => {
  const socialActivities = activities.filter(a =>
    a.type === 'memory_shared' ||
    a.metadata?.importSource === 'collaboration'
  );

  if (socialActivities.length === 0) return 0;

  // Base score per social activity
  const baseScore = socialActivities.length * 25;

  // Bonus for variety of social activities
  const uniqueSocialTypes = new Set(socialActivities.map(a => a.type)).size;
  const diversityBonus = uniqueSocialTypes * 10;

  return Math.min(100, baseScore + diversityBonus);
};

/**
 * Calculate base increase in memory strength based on factors
 * @param factors - MemoryStrengthFactors object
 * @returns The base increase value
 */
const calculateBaseIncrease = (factors: MemoryStrengthFactors): number => {
  // Weighted average of all factors
  const weightedScore = (
    factors.consistency * 0.15 +
    factors.activityCount * 0.10 +
    factors.recentActivity * 0.15 +
    factors.engagementDepth * 0.15 +
    factors.activityDiversity * 0.10 +
    factors.progressStreak * 0.15 +
    factors.challengeLevel * 0.10 +
    factors.socialEngagement * 0.10
  ) / 100;

  // Base increase between 0.5 and 4 points
  return 0.5 + (weightedScore * 3.5);
};

/**
 * Calculate time decay of memory strength
 * @param currentStrength - Current memory strength
 * @param activities - Array of user activities
 * @returns The decay value to subtract
 */
const calculateTimeDecay = (currentStrength: number, activities: MemoryActivity[]): number => {
  if (activities.length === 0) return 0;
  
  const sortedActivities = [...activities].sort((a, b) => 
    a.timestamp.getTime() - b.timestamp.getTime()
  );
  
  const lastActivity = sortedActivities[sortedActivities.length - 1].timestamp;
  const hoursSinceLastActivity = (new Date().getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
  
  // Decay starts after 24 hours of inactivity
  if (hoursSinceLastActivity < 24) return 0;
  
  // Linear decay based on inactivity period
  const daysInactive = hoursSinceLastActivity / 24;
  const decayRate = 0.1 + (currentStrength / 100) * 0.2; // Higher strength decays faster
  
  return daysInactive * decayRate;
};

/**
 * Update user's memory strength in both Supabase and IndexedDB
 * @param userId - The user's ID
 * @param newStrength - The new memory strength value
 */
export const updateMemoryStrengthForUser = async (userId: string, newStrength: number): Promise<void> => {
  try {
    // Update in Supabase
    await updateMemoryStrength(userId, newStrength);
    
    // Update in IndexedDB
    try {
      const profile = await getProfile();
      if (profile) {
        await saveProfile({
          ...profile,
          memoryStrength: newStrength,
          synced: false
        });
      }
    } catch (error) {
      console.warn('Could not update memory strength in IndexedDB:', error);
    }
  } catch (error) {
    console.error('Error updating memory strength:', error);
    throw error;
  }
};

/**
 * Add a new activity and recalculate memory strength
 * @param userId - The user's ID
 * @param activity - The new activity to add
 * @param existingActivities - Existing activities (optional, will fetch if not provided)
 * @returns The new memory strength value
 */
export const addActivityAndRecalculate = async (
  userId: string,
  activity: MemoryActivity,
  existingActivities: MemoryActivity[] = []
): Promise<number> => {
  // In a real implementation, we would store activities in a database
  // For now, we'll just use the provided activities array
  const activities = [...existingActivities, activity];
  
  const newStrength = await calculateMemoryStrength(userId, activities);
  await updateMemoryStrengthForUser(userId, newStrength);
  
  return newStrength;
};

export const getActivityPoints = (activityType: MemoryActivity['type'], metadata?: MemoryActivity['metadata']): number => {
  const basePoints: Record<MemoryActivity['type'], number> = {
    memory_added: 10,
    memory_imported: 3,
    game_completed: 15,
    memory_reviewed: 5,
    daily_login: 2,
    game_perfect_score: 25,
    memory_shared: 8,
    streak_maintained: 12
  };

  let points = basePoints[activityType] || 5;

  // Difficulty multiplier
  if (metadata?.difficulty) {
    const difficultyMultiplier = {
      easy: 1.0,
      medium: 1.5,
      hard: 2.0
    };
    points *= difficultyMultiplier[metadata.difficulty] || 1.0;
  }

  // Streak bonus
  if (metadata?.streakDays) {
    points += Math.min(metadata.streakDays, 10); // Max 10 extra points for streak
  }

  return Math.round(points);
};

export default {
  calculateMemoryStrength,
  updateMemoryStrengthForUser,
  addActivityAndRecalculate,
  getActivityPoints
};