# Adaptive Difficulty System

The Adaptive Difficulty System is a core feature of the MemoryKeeper application that automatically adjusts game challenges based on user performance and memory strength.

## Overview

The system provides a personalized gaming experience by dynamically adjusting difficulty levels to match each user's skill level and progress. This ensures that games remain challenging but not frustrating, promoting continued engagement and cognitive development.

## Components

### 1. DifficultyService

A service that manages difficulty calculations and settings.

**Functions:**
- `calculateStrengthBasedDifficulty(memoryStrength)`: Calculates difficulty based on user's memory strength
- `calculatePerformanceBasedDifficulty(performanceHistory)`: Calculates difficulty based on recent performance
- `getRecommendedDifficulty(userId, performanceHistory)`: Combines strength and performance to recommend difficulty
- `getDifficultySettings(difficulty, gameType)`: Returns game parameters for a specific difficulty level
- `updatePerformanceHistory(profile, performance)`: Updates user's performance history

**Difficulty Levels:**
- **Easy**: For beginners or users with lower memory strength
- **Medium**: For intermediate users with moderate memory strength
- **Hard**: For advanced users with high memory strength

### 2. GameSelection Component

The game selection screen now automatically recommends difficulty based on the user's memory strength rather than requiring manual selection.

**Features:**
- Visual indicator showing recommended difficulty level
- Color-coded difficulty display (green for easy, orange for medium, red for hard)
- Memory strength progress bar
- Automatic difficulty selection based on user profile

### 3. MemoryMatchUpGame Component

The Memory Match-Up game implements adaptive difficulty through several mechanisms:

**Difficulty-Based Parameters:**
- **Card Count**: Easy (8 cards), Medium (12 cards), Hard (16 cards)
- **Time Limits**: Easy (no limit), Medium (3 minutes), Hard (2 minutes)
- **Hint Frequency**: Easy (every 2 mismatches), Medium (every 3), Hard (every 5)
- **Memory Words**: Easy (4 words), Medium (6 words), Hard (8 words)

**Performance Tracking:**
- Move efficiency metrics
- Time per pair calculations
- Performance analysis feedback
- Adaptive scoring based on difficulty

## Implementation Details

### Difficulty Calculation

The system uses two primary factors to determine difficulty:

1. **Memory Strength Based**: 
   - 80-100 strength → Hard
   - 60-79 strength → Medium
   - 0-59 strength → Easy

2. **Performance Based**:
   - Success rate and completion time from recent games
   - Adjusts difficulty up or down based on performance trends

### Game Parameter Adjustment

Each game type can define its own difficulty parameters:

```typescript
// Example for Memory Match game
switch (difficulty) {
  case 'easy':
    return {
      pairs: 4, // 8 cards total
      timeLimit: null, // No time limit
      hintFrequency: 2 // Hint every 2 mismatches
    };
  case 'medium':
    return {
      pairs: 6, // 12 cards total
      timeLimit: 180, // 3 minutes
      hintFrequency: 3
    };
  case 'hard':
    return {
      pairs: 8, // 16 cards total
      timeLimit: 120, // 2 minutes
      hintFrequency: 5
    };
}
```

## Benefits

1. **Personalized Experience**: Each user gets challenges appropriate for their skill level
2. **Progressive Challenge**: Difficulty increases as users improve
3. **Reduced Frustration**: Prevents users from being overwhelmed by overly difficult games
4. **Increased Engagement**: Maintains optimal challenge level to keep users engaged
5. **Cognitive Development**: Promotes steady improvement through appropriately challenging tasks

## Future Enhancements

Planned improvements to the adaptive difficulty system include:
- Machine learning algorithms for more sophisticated difficulty prediction
- Cross-game performance analysis
- User preference settings for difficulty adjustment sensitivity
- Social comparison features for competitive motivation
- Detailed analytics dashboard showing difficulty progression