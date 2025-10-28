# Memory Strength System

The Memory Strength System is a core feature of the MemoryKeeper application that visually represents and tracks a user's cognitive engagement through a dynamic flower visualization.

## Overview

The system combines visual feedback with algorithmic tracking to provide users with an engaging representation of their memory engagement. The flower visualization grows and changes color based on the user's memory strength score, which is calculated based on various activities within the app.

## Components

### 1. MemoryStrengthFlower Component

A React component that renders a dynamic flower visualization based on the user's memory strength score.

**Props:**
- `strength` (number): The memory strength percentage (0-100)
- `size` (number, optional): The size of the flower in pixels (default: 200)

**Features:**
- Dynamic petal count based on strength (5-10 petals)
- Color changes based on strength levels:
  - High strength (80-100): Amber/Yellow
  - Medium strength (60-79): Green
  - Moderate strength (40-59): Blue
  - Lower strength (0-39): Purple
- Animated glow effect for high strength scores
- Smooth transitions when strength changes

### 2. MemoryStrengthService

A service that calculates and manages memory strength based on user activities.

**Functions:**
- `calculateMemoryStrength(userId, activities)`: Calculates memory strength based on user activities
- `updateMemoryStrengthForUser(userId, newStrength)`: Updates memory strength in both Supabase and IndexedDB
- `addActivityAndRecalculate(userId, activity, existingActivities)`: Adds a new activity and recalculates strength

**Activity Types:**
- `memory_added`: Points for adding new memories
- `game_completed`: Points for completing games
- `memory_reviewed`: Points for reviewing existing memories
- `daily_login`: Points for daily app usage

### 3. Calculation Factors

The memory strength is calculated based on four key factors:

1. **Consistency**: How regularly the user engages with the app
2. **Activity Count**: Total number of activities performed
3. **Recent Activity**: Recency of the last activity
4. **Engagement Depth**: Quality of engagement based on activity values

### 4. Time Decay

The system implements a time decay mechanism to encourage regular engagement:
- No decay for the first 24 hours of inactivity
- Linear decay after 24 hours based on inactivity period
- Higher strength scores decay faster to encourage continued engagement

## Implementation

The system is integrated throughout the application:

1. **Onboarding**: Shows the flower visualization during the progress preview step
2. **Home View**: Displays the flower in the stats cards section
3. **Profile View**: Shows the flower in the user profile section
4. **Header**: Displays a small flower icon in the top navigation
5. **Game Completion**: Updates strength when games are completed
6. **Memory Addition**: Updates strength when new memories are added

## Visual Design

The flower visualization uses:
- Smooth animations for petal growth and color transitions
- Subtle glow effects for high strength scores
- Responsive sizing for different display contexts
- Accessible color palette with proper contrast ratios
- Meaningful visual feedback that correlates with user actions

## Data Persistence

Memory strength is stored in:
1. **Supabase**: Primary storage for authenticated users
2. **IndexedDB**: Local storage for offline access and synchronization

The system automatically synchronizes between both storage mechanisms when connectivity is available.

## Future Enhancements

Planned improvements to the memory strength system include:
- Personalized strength calculation algorithms
- Social comparison features
- Achievement badges tied to strength milestones
- Adaptive difficulty in games based on strength
- Detailed analytics dashboard