# Adaptive Agents for Game Scaffolding and Hints

## Overview

The adaptive agent system provides personalized scaffolding and hints to users based on their performance, memory strength, and gameplay patterns. The system uses AI-driven decision-making to offer appropriate support at the right time.

## Architecture

### Core Components

1. **AdaptiveAgentService** - Main service for agent logic
2. **AdaptiveAgentTypes** - Type definitions for agent system
3. **AdaptiveAgentDisplay** - UI component for showing agent feedback
4. **useAdaptiveAgent** - React hook for integrating agents into games

### Agent Types

- **Encourager** - Focuses on motivation and positive reinforcement (for users with lower memory strength)
- **Instructor** - Provides direct guidance and instruction (for moderate memory strength)
- **Coach** - Offers strategic advice and feedback (default type)
- **Mentor** - Gives minimal guidance for confident users (high memory strength)

### Decision Making Factors

The agent considers multiple factors when deciding what support to provide:

1. **Time Pressure** - Provides encouragement when games run long
2. **Mistake Threshold** - Offers hints after multiple errors
3. **Streak Breaks** - Provides encouragement after breaking a good streak
4. **Difficulty Spikes** - Offers scaffolding when games become challenging
5. **Memory Strength** - Adjusts support level based on user's overall performance

## Implementation

### Integration Steps

1. Import the `useAdaptiveAgent` hook in your game component
2. Initialize the agent with user and game context
3. Call `updateGameProgress` to track game state
4. Call `recordGameCompletion` when games finish
5. Use `agentDecision` to display hints and scaffolding

### Example Usage

```typescript
import { useAdaptiveAgent } from '../hooks/useAdaptiveAgent';

const MyGameComponent = ({ userId, difficulty, memory }) => {
  const {
    agentDecision,
    isVisible,
    showAgent,
    hideAgent,
    requestHint,
    updateGameProgress,
    recordGameCompletion
  } = useAdaptiveAgent({
    userId,
    gameId: 'my-game',
    difficulty,
    currentMemory: memory
  });

  // Track game progress
  useEffect(() => {
    updateGameProgress(moves, mistakes, streak, currentTime);
  }, [moves, mistakes, streak, currentTime]);

  // Record completion
  const handleGameComplete = (success, time) => {
    recordGameCompletion(success, time);
  };

  return (
    <div>
      {/* Game content */}
      
      {/* Agent display */}
      {agentDecision && (
        <AdaptiveAgentDisplay
          hint={agentDecision.hint}
          scaffolding={agentDecision.scaffolding}
          agentMessage={agentDecision.agentMessage}
          agentType={agentDecision.agentType}
          isVisible={isVisible}
          onDismiss={hideAgent}
          onRequestHint={requestHint}
        />
      )}
    </div>
  );
};
```

## Customization

### Adjusting Agent Behavior

The agent decision logic can be customized by modifying the `makeAgentDecision` function in `adaptiveAgentService.ts`. Parameters like mistake thresholds, time limits, and priority levels can be adjusted based on user feedback and testing.

### Adding New Agent Types

1. Add the new type to the `AgentType` union in `adaptiveAgentTypes.ts`
2. Update the `determineAgentType` function to include the new type
3. Add messages and behavior for the new type in `generateAgentMessage`
4. Update the UI component to handle the new agent type

## Testing

The system includes comprehensive unit tests for all core functions. Integration tests ensure proper behavior in game contexts.

## Future Enhancements

1. **Machine Learning** - Use user data to improve decision-making over time
2. **Voice Integration** - Add spoken agent feedback using Web Speech API
3. **Personalization** - Customize agent personality based on user preferences
4. **Multi-modal Support** - Provide visual, auditory, and tactile hints