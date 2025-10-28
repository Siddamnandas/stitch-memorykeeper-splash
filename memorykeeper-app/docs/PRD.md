# MemoryKeeper PWA
## Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** October 21, 2025  
**Document Owner:** Product Team  
**Status:** Draft for Development

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Product Vision & Strategy](#product-vision--strategy)
3. [Market Analysis & Target Audience](#market-analysis--target-audience)
4. [Success Metrics & KPIs](#success-metrics--kpis)
5. [Technical Architecture](#technical-architecture)
6. [Functional Requirements](#functional-requirements)
7. [Game Mechanics Specifications](#game-mechanics-specifications)
8. [User Interface & Experience Design](#user-interface--experience-design)
9. [Screen-by-Screen Specifications](#screen-by-screen-specifications)
10. [Business Model & Monetization](#business-model--monetization)
11. [Development Roadmap](#development-roadmap)
12. [Risk Assessment & Mitigation](#risk-assessment--mitigation)
13. [Appendices](#appendices)

---

## 1. Executive Summary

### 1.1 Product Overview
**MemoryKeeper PWA** is a mobile-first Progressive Web App designed to enhance cognitive function in seniors (65+) through reminiscence therapy-based brain games integrated with daily journaling. The app creates personalized, story-driven experiences using AI technology, combining therapy principles with engaging gameplay.

### 1.2 Core Value Proposition
- **5-minute daily ritual** combining journaling with 1-2 minute brain games
- **Personalized content** generated from users' own memories
- **Offline-first PWA** that works seamlessly across devices
- **AI-powered adaptation** adjusting difficulty and content to user performance
- **Legacy building** through digital scrapbook and family sharing

### 1.3 Key Differentiators
- **AI-Therapy Fusion:** Unlike generic puzzle apps (Lumosity, Peak), MemoryKeeper uses personal memories as game content
- **Reminiscence-Based:** Grounded in clinical research showing 15-30% recall improvements
- **Senior-Optimized:** Voice commands, large touch targets, simplified navigation
- **Emotional Connection:** Story-driven games that create joy, not just metric tracking

### 1.4 Launch Timeline
- **MVP Launch Target:** Q1 2026
- **Development Duration:** 18 weeks (3 phases)
- **Pilot Program:** 5 senior centers, targeting 1,000 users Month 1

---

## 2. Product Vision & Strategy

### 2.1 Vision Statement
*"To preserve cognitive vitality and cherished memories for seniors through joyful, personalized daily rituals that blend cutting-edge AI with proven therapeutic approaches."*

### 2.2 Mission
Transform memory care from clinical intervention to daily joy by making cognitive exercise personal, accessible, and emotionally meaningful.

### 2.3 Strategic Goals
1. **Cognitive Enhancement:** Achieve measurable 20% improvement in memory strength scores
2. **Engagement:** Maintain 60% daily active user retention
3. **Accessibility:** Ensure WCAG 2.1 AA compliance for inclusive design
4. **Monetization:** Convert 20% of free users to premium subscription
5. **Scale:** Reach 10,000 active users by Month 6 post-launch

### 2.4 Product Principles
- **Emotional First:** Prioritize joy and legacy over clinical metrics
- **Friction-Free:** Minimize technical barriers for seniors
- **Privacy-Centric:** Local-first data storage with user consent
- **Scientifically Grounded:** Based on reminiscence therapy research
- **Family-Inclusive:** Enable intergenerational connection

---

## 3. Market Analysis & Target Audience

### 3.1 Market Opportunity
- **Total Addressable Market:** $16B Brain Training Apps market (2025)
- **Target Segment:** Underserved personalization niche for seniors
- **Growth Drivers:** Aging population, smartphone adoption (75% in 65+ demographic)

### 3.2 Primary User Persona

**Name:** Margaret, 72  
**Tech Comfort:** Moderate (smartphone user, video calls)  
**Pain Points:**
- Concerned about memory decline
- Finds existing brain games generic and boring
- Wants to preserve family stories
- Struggles with complex app interfaces

**Goals:**
- Maintain cognitive sharpness
- Share life stories with grandchildren
- Feel accomplished and purposeful daily
- Low-friction (5-minute) engagement

### 3.3 Secondary User Persona

**Name:** Jennifer, 45 (Margaret's daughter)  
**Tech Comfort:** High  
**Pain Points:**
- Worried about parent's cognitive health
- Wants to stay connected to family history
- Seeks proactive health tools for parents

**Goals:**
- Monitor parent's engagement (respectfully)
- Contribute to family memory collection
- Find trustworthy cognitive health tools

### 3.4 Competitive Landscape

| Competitor | Strengths | Weaknesses | Our Advantage |
|------------|-----------|------------|---------------|
| Lumosity | Large library, research-backed | Generic, not personalized | Personal memory integration |
| Peak | Gamified, good UX | Not senior-focused | Senior-optimized design |
| Happify | Emotional wellness | Not memory-specific | Cognitive + emotional focus |
| Storii | Story preservation | No cognitive games | Combined games + preservation |

---

## 4. Success Metrics & KPIs

### 4.1 Engagement Metrics
- **Daily Active Users (DAU):** 60% retention target
- **Game Completion Rate:** 70% of started games finished
- **Session Duration:** Average 5-7 minutes
- **Streak Maintenance:** 50% users maintain 7-day streaks

### 4.2 Cognitive Impact Metrics
- **Memory Strength Score:** 20% improvement over 8 weeks
- **Game Performance:** Progressive difficulty advancement
- **Self-Reported Confidence:** NPS >8 from senior pilots

### 4.3 Business Metrics
- **User Acquisition:** 1,000 users Month 1; 10,000 by Month 6
- **Free-to-Paid Conversion:** 20% within 30 days
- **Monthly Recurring Revenue:** $5,000 target Month 3
- **Churn Rate:** <15% monthly

### 4.4 Technical Metrics
- **Lighthouse Performance Score:** >90
- **PWA Installability:** 80% install rate from engaged users
- **Offline Functionality:** 100% core features available offline
- **API Response Time:** <3s load on 3G networks
- **Crash-Free Sessions:** >99.5%

### 4.5 Accessibility Metrics
- **WCAG 2.1 AA Compliance:** 100%
- **VoiceOver Success Rate:** 95% task completion
- **Voice Command Accuracy:** >85%

---

## 5. Technical Architecture

### 5.1 Technology Stack

**Frontend:**
- **Framework:** React 19.0.x with TypeScript
- **Build Tool:** Vite 6.4.x
- **Styling:** Tailwind CSS 3.4.x
- **State Management:** React Context + Hooks (useState, useReducer)
- **PWA Tools:** Workbox for service workers

**Backend:**
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security)
- **AI Integration:** OpenAI API (via Supabase Edge Functions)
- **File Storage:** Supabase Storage for photos/audio

**Third-Party Services:**
- **Voice:** Web Speech API (SpeechRecognition, SpeechSynthesis)
- **Analytics:** Privacy-focused analytics (PostHog or similar)
- **Monitoring:** Sentry for error tracking

### 5.2 PWA Requirements

**Core PWA Features:**
- Web App Manifest (icons, theme colors, display mode)
- Service Worker for offline caching and background sync
- IndexedDB for local data persistence
- Push notifications for daily reminders
- Install prompts on first visit

**Offline Strategy:**
- **Immediate:** Journal entries, game play (cached logic)
- **Background Sync:** Syncs when connection restored
- **Cache-First:** Static assets, AI-generated content
- **Network-First:** Authentication, leaderboards

**Performance Targets:**
- First Contentful Paint: <1.5s
- Time to Interactive: <3s on 3G
- Offline load: <1s

### 5.3 Data Architecture

**Core Tables (Supabase):**
```
users
├── id (uuid)
├── name (text)
├── age (int)
├── theme_preference (enum)
├── memory_strength_score (int)
├── created_at (timestamp)

journal_entries
├── id (uuid)
├── user_id (fk)
├── prompt_text (text)
├── entry_content (jsonb) // text/audio/photo
├── created_at (timestamp)
├── synced (boolean)

game_sessions
├── id (uuid)
├── user_id (fk)
├── game_type (enum)
├── score (int)
├── difficulty (enum)
├── completed (boolean)
├── created_at (timestamp)

memories
├── id (uuid)
├── user_id (fk)
├── title (text)
├── content (text)
├── media_urls (text[])
├── tags (text[])
├── decade (int)
├── ai_generated (boolean)

family_connections
├── id (uuid)
├── user_id (fk)
├── family_member_id (fk)
├── relationship (text)
├── permissions (jsonb)
```

### 5.4 AI Integration Architecture

**AI Processing Flow:**
1. User inputs journal entry
2. Edge Function sends to OpenAI API
3. AI generates:
   - Personalized prompts
   - Game content (questions, images)
   - Knowledge graph connections
   - Adaptive difficulty adjustments
4. Results cached locally and synced to Supabase

**AI Mechanisms:**
- **Knowledge Graphs:** Map connections between memories (e.g., "Paris" → "Eiffel Tower" → "Honeymoon")
- **Generative AI:** Create images from descriptions (DALL-E integration)
- **Adaptive Agents:** Provide contextual hints and scaffolding
- **Multi-Sensory Triggers:** Audio playback from past entries

**Cost Optimization:**
- Cache AI-generated content locally
- Rate limiting for free tier users
- Batch processing where possible
- Efficient prompt engineering (<500 tokens)

### 5.5 Security & Privacy

**Authentication:**
- OAuth 2.0 (Google, Apple Sign-In)
- Session management with secure token refresh
- Passwordless magic links option

**Data Protection:**
- Row Level Security (RLS) on all Supabase tables
- End-to-end encryption for family shares
- Local-first architecture (data stored on device)
- GDPR-compliant data export/deletion

**Privacy Controls:**
- Opt-in for AI processing
- Granular family sharing permissions
- No AI training on user data without explicit consent
- Transparent data usage policies

---

## 6. Functional Requirements

### 6.1 Core Features (MVP - Phase 1)

#### 6.1.1 User Onboarding
**Priority:** P0  
**Description:** First-time user setup flow

**Requirements:**
- FR-1.1: Display animated splash screen with MemoryKeeper logo
- FR-1.2: Collect basic profile information (name, age 65+, avatar selection)
- FR-1.3: Present theme selection (Nostalgic, Fun, High Contrast, Dark Mode)
- FR-1.4: Obtain AI processing consent with clear explanations
- FR-1.5: Offer optional family member invitation
- FR-1.6: Provide interactive tutorial (3-step carousel):
  - How to journal (voice/text/photo)
  - How to play a sample game
  - How to view progress
- FR-1.7: Allow skip/complete options at any step
- FR-1.8: Store preferences locally and sync when online

**Acceptance Criteria:**
- Onboarding completes in <2 minutes
- 90% of users complete tutorial
- All consent flows comply with GDPR
- Works fully offline after initial load

#### 6.1.2 Daily Journaling Ritual
**Priority:** P0  
**Description:** Core daily engagement loop

**Requirements:**
- FR-2.1: Display personalized daily prompt on home screen
- FR-2.2: Support three input methods:
  - Voice recording (Web Speech API)
  - Text input (textarea with 500 char limit)
  - Photo upload (with optional caption)
- FR-2.3: Save entries locally with timestamp
- FR-2.4: Background sync entries when online
- FR-2.5: Show streak counter (consecutive days)
- FR-2.6: Display "Yesterday's Joy" (previous entry preview)
- FR-2.7: Trigger game suggestion post-entry
- FR-2.8: Update Memory Strength score based on engagement

**Acceptance Criteria:**
- Voice recording accuracy >85%
- Entries save in <1s locally
- Sync completes within 5s when online
- Streak persists across sessions

#### 6.1.3 Core Brain Games (3 for MVP)
**Priority:** P0  
**Games:** Memory Match-Up, Story Quiz Quest, Timeline Tango

**Requirements:**
- FR-3.1: Game lobby with card-based selection
- FR-3.2: Each game duration: 1-2 minutes
- FR-3.3: Adaptive difficulty based on Memory Strength score
- FR-3.4: Hint system (voice/text) available on demand
- FR-3.5: Real-time feedback (animations, sounds)
- FR-3.6: Score calculation (+10-20 points per game)
- FR-3.7: Post-game summary with quote replay
- FR-3.8: Voice commands for game actions ("Play Match-Up", "Hint please")
- FR-3.9: Works fully offline with cached content

**Acceptance Criteria:**
- 80% game completion rate
- <500ms response time for interactions
- Difficulty adjusts within 3 games
- Offline play with no degradation

#### 6.1.4 Progress Tracking
**Priority:** P0  
**Description:** Memory Strength visualization and statistics

**Requirements:**
- FR-4.1: Display Memory Strength score (0-100) as blooming flower
- FR-4.2: Show petal growth animation on score increases
- FR-4.3: Track daily/weekly/all-time statistics
- FR-4.4: Calculate and display:
  - Current streak (days)
  - Total games played
  - Average score trend
  - Recall improvement percentage
- FR-4.5: Weekly insight notifications ("Recall up 15%!")
- FR-4.6: Badge system for milestones (7-day streak, 50 games, etc.)

**Acceptance Criteria:**
- Flower animation completes in <300ms
- Statistics update in real-time
- Historical data persists locally

### 6.2 Advanced Features (Phase 2)

#### 6.2.1 Additional Brain Games
**Priority:** P1  
**Games:** Echo Echo, Legacy Link, Snapshot Solve

**Requirements:**
- FR-5.1: Implement three additional game types
- FR-5.2: AI-generated content for each game:
  - Echo Echo: Audio clips from past entries
  - Legacy Link: Knowledge graph visualization
  - Snapshot Solve: AI-generated/user photos as puzzles
- FR-5.3: Premium game variants with multimedia
- FR-5.4: Cross-game performance analytics

#### 6.2.2 Digital Scrapbook
**Priority:** P1  
**Description:** Organized timeline of memories

**Requirements:**
- FR-6.1: Chronological timeline view (grouped by decade)
- FR-6.2: Thumbnail grid with memories (entries + AI content)
- FR-6.3: Search and filter capabilities:
  - By decade/year
  - By person/tag
  - By content type (photo/audio/text)
- FR-6.4: Memory detail view with:
  - Full content display
  - Edit capability (long-press)
  - Share button
  - Audio playback for voice entries
- FR-6.5: AI-generated visual themes (sepia filters, vintage borders)
- FR-6.6: Export options (PDF, audio compilation)
- FR-6.7: Bulk actions (select multiple, delete, share)

**Acceptance Criteria:**
- Smooth scrolling (60fps) with 500+ memories
- Search returns results in <500ms
- Export generates in <10s for 50 memories

#### 6.2.3 Family Sharing & Collaboration
**Priority:** P1  
**Description:** Intergenerational memory connection

**Requirements:**
- FR-7.1: Invite family members via email/link
- FR-7.2: Granular permission settings:
  - View only
  - Comment
  - Contribute (add photos/captions)
  - Full collaboration (Premium)
- FR-7.3: Notification system for:
  - New shared memories
  - Comments/reactions
  - Contribution requests
- FR-7.4: Family feed view (shared memory timeline)
- FR-7.5: Approve/reject contribution workflow
- FR-7.6: Privacy controls per memory (share/hide toggle)
- FR-7.7: Family member can add photos/videos with captions (1-2 word tags)
- FR-7.8: Timestamp and attribution for all contributions

**Acceptance Criteria:**
- Invite email delivered within 1 minute
- Permissions enforce correctly (RLS)
- Real-time collaboration updates in <3s
- Family members can seamlessly add multimedia memories

#### 6.2.4 AI Studio
**Priority:** P1  
**Description:** Advanced AI customization tools

**Requirements:**
- FR-8.1: Custom prompt builder with templates
- FR-8.2: Visual generator:
  - Text-to-image from memory descriptions
  - Iterative refinement ("Make it redder")
  - Style presets (vintage, modern, abstract)
- FR-8.3: Conversational agent chat:
  - Ask questions about memories
  - Get hint suggestions for games
  - Memory exploration guidance
- FR-8.4: Preview/test generated content before saving
- FR-8.5: Save custom prompts to library
- FR-8.6: Voice interaction for all AI Studio features

**Acceptance Criteria:**
- Image generation completes in <15s
- Chat responses within <3s
- Custom prompts reusable across days

### 6.3 Expansion Features (Phase 3)

#### 6.3.1 Seasonal Content
**Priority:** P2  
**Requirements:**
- FR-9.1: Holiday-themed games (Thanksgiving memory match, etc.)
- FR-9.2: Seasonal prompts (summer vacations, winter holidays)
- FR-9.3: Limited-time badges and rewards

#### 6.3.2 Family Multiplayer
**Priority:** P2  
**Requirements:**
- FR-10.1: Co-op quizzes (grandparent + grandchild)
- FR-10.2: Shared game sessions with leaderboards
- FR-10.3: Turn-based memory games

#### 6.3.3 Health Integrations
**Priority:** P2  
**Requirements:**
- FR-11.1: Export cognitive data for healthcare providers
- FR-11.2: Apple Health / Google Fit integration (mindful minutes)
- FR-11.3: Medication reminder integration prompts

---

## 7. Game Mechanics Specifications

### 7.1 Memory Match-Up (Verbal Memory)

**Cognitive Domain:** Word Recall, Association  
**Duration:** 1-2 minutes  
**Difficulty Levels:** 3 (Easy: 3 pairs, Medium: 4-5 pairs, Hard: 6 pairs + timer)

**How It Works:**
1. AI extracts 3-6 key terms from recent journal entries
2. Creates matching pairs (e.g., "Apple" + "Cinnamon Pie")
3. Cards shuffle and display face-down in grid
4. User taps/voices to flip cards
5. Match found: Cards stay flipped, celebration animation
6. Mismatch: Cards flip back, hint provided
7. Game ends when all pairs matched

**Scoring:**
- Base: +10 points per pair
- Bonus: +5 for no misses
- Time bonus: +3 if under 60s (Hard mode)

**Adaptation Logic:**
```
If Memory Strength < 40:
  - 3 pairs, visual cues on cards
  - Unlimited time, hints every 2 misses
If Memory Strength 40-70:
  - 4-5 pairs, text-only cards
  - Hints every 3 misses
If Memory Strength > 70:
  - 6 pairs, gentle 90s timer
  - Hints only on request
```

**Premium Features:**
- Photo clues (user's images on cards)
- Audio hints (voice recordings from entries)

**Technical Implementation:**
- Component: `<MemoryMatchGame />`
- State: Card positions, flip status, match count
- Animations: Flip (CSS transform), Match burst (Lottie)
- Voice Commands: "Flip card 1", "Flip card 3", "Hint"

---

### 7.2 Story Quiz Quest (Episodic Recall)

**Cognitive Domain:** Memory Retrieval, Decision-Making  
**Duration:** 1.5-2 minutes  
**Difficulty Levels:** 3 (Easy: 4 questions MCQ, Medium: 5-6 + branching, Hard: 6+ open-ended voice)

**How It Works:**
1. AI generates 4-6 multiple-choice questions from user's memory (e.g., "Was the beach water calm or wavy?")
2. Presents narrative frame ("Relive your beach day!")
3. User selects answer (tap/voice: "Option B")
4. Correct: Unlocks deeper follow-up question (branching path)
5. Incorrect: Gentle hint ("You mentioned waves crashed!")
6. Ends with path recap as mini audiobook

**Scoring:**
- +15 per correct answer
- +10 for branching path completion
- Bonus: +5 for all correct

**Adaptation Logic:**
```
If Memory Strength < 40:
  - 4 questions, visual aids with each option
  - Multiple hints available
If Memory Strength 40-70:
  - 5-6 questions, text-only options
  - One hint per question
If Memory Strength > 70:
  - 6+ questions, some open-ended voice responses
  - Minimal hints
```

**Premium Features:**
- Multi-branch storylines (choose-your-own-adventure)
- Audio narration by AI (voice synthesis)

**Technical Implementation:**
- Component: `<StoryQuizGame />`
- State: Question index, selected answers, branch path
- AI: OpenAI generates questions from entries
- Voice: Speech recognition for answers

---

### 7.3 Timeline Tango (Sequencing/Visuospatial)

**Cognitive Domain:** Chronological Reasoning, Spatial Organization  
**Duration:** 1-2 minutes  
**Difficulty Levels:** 3 (Easy: 3-4 items, Medium: 5-6 items, Hard: 7+ with date gaps)

**How It Works:**
1. AI extracts 4-6 life events from knowledge graph (jobs, weddings, moves)
2. Displays icons/photos in random order
3. User drags items into chronological buckets/timeline
4. Incorrect placement: Gentle vibration + hint
5. Correct order: Time-machine fade animation sequence

**Scoring:**
- +12 per correct placement
- Bonus: +8 for perfect sequence

**Adaptation Logic:**
```
If Memory Strength < 40:
  - 3-4 items, decade buckets (1950s, 1960s)
  - Visual timeline with labeled eras
If Memory Strength 40-70:
  - 5-6 items, year-level precision
If Memory Strength > 70:
  - 7+ items, fill date gaps ("What year did you marry?")
```

**Premium Features:**
- Animated timeline with photos morphing
- Family tree integration (sequence relatives)

**Technical Implementation:**
- Component: `<TimelineTangoGame />`
- State: Item positions, correct order array
- Drag-and-drop: React DnD or native touch events
- Voice: "Move wedding after job"

---

### 7.4 Echo Echo (Auditory Fluency)

**Cognitive Domain:** Speech Clarity, Auditory Memory  
**Duration:** 1 minute  
**Difficulty Levels:** 3 (Easy: 5s clips, Medium: 10s clips, Hard: 15s + detail addition)

**How It Works:**
1. Plays 5-15s audio clip from user's past voice entry
2. User listens, then records echo/repetition
3. AI scores accuracy (pronunciation, key details recalled)
4. Feedback: Star rating + encouraging message
5. Completion unlocks compiled playlist of echoes

**Scoring:**
- +18 for 90%+ accuracy
- +12 for 70-89% accuracy
- +6 for 50-69% accuracy

**Adaptation Logic:**
```
If Memory Strength < 40:
  - 5s clips, single sentence
  - Multiple playback allowed
If Memory Strength 40-70:
  - 10s clips, 2-3 sentences
  - One replay allowed
If Memory Strength > 70:
  - 15s clips, add extra details from memory
```

**Premium Features:**
- Family duet mode (record with grandchild)
- AI-enhanced clarity (removes background noise)

**Technical Implementation:**
- Component: `<EchoEchoGame />`
- Audio: Web Audio API for playback, MediaRecorder for recording
- AI: Speech-to-text comparison via OpenAI Whisper
- State: Clip URL, recording blob, accuracy score

---

### 7.5 Legacy Link (Semantic Networks)

**Cognitive Domain:** Associations, Creativity  
**Duration:** 2 minutes  
**Difficulty Levels:** 3 (Easy: Guided nodes, Medium: Semi-guided, Hard: Free-form)

**How It Works:**
1. Displays central memory node (e.g., "Paris Trip")
2. User taps/voices to add 5-7 connected branches from knowledge graph
3. Connections can be: places, people, emotions, objects
4. AI suggests starter nodes, user can add custom
5. Completion: Blooming web animation + infographic export

**Scoring:**
- +8 per connection
- Bonus: +10 for completing full web (7 nodes)
- Creative bonus: +5 for unexpected connections

**Adaptation Logic:**
```
If Memory Strength < 40:
  - Guided mode: AI suggests all nodes, user confirms
If Memory Strength 40-70:
  - Semi-guided: 3 suggested + 4 user-created
If Memory Strength > 70:
  - Free-form: User creates all connections
```

**Premium Features:**
- Collaborative webs with family
- 3D mind map visualization

**Technical Implementation:**
- Component: `<LegacyLinkGame />`
- Visualization: D3.js or React Flow for node graph
- State: Nodes array, connections array
- AI: Knowledge graph API for suggestions

---

### 7.6 Snapshot Solve (Visual Recognition)

**Cognitive Domain:** Visual Processing, Attention to Detail  
**Duration:** 1.5-2 minutes  
**Difficulty Levels:** 3 (Easy: 9 pieces, Medium: 16 pieces, Hard: 25 pieces + spot differences)

**How It Works:**
1. Selects photo from user's entries or AI-generates from description
2. Presents as jigsaw (9-25 pieces) or spot-the-difference (5 changes)
3. User drags pieces to correct position or taps differences
4. Blurred preview available as hint
5. Completion: Full image reveal + quote overlay

**Scoring:**
- +10 per puzzle piece placed
- +5 per difference spotted
- Bonus: +8 for no hints used

**Adaptation Logic:**
```
If Memory Strength < 40:
  - 9-piece jigsaw, edge pieces highlighted
  - Preview always visible
If Memory Strength 40-70:
  - 16 pieces, preview on request
If Memory Strength > 70:
  - 25 pieces or spot-5-differences
  - Time challenge (optional)
```

**Premium Features:**
- 3D puzzle rotation
- AI-generated scene variations (wedding photo in different season)

**Technical Implementation:**
- Component: `<SnapshotSolveGame />`
- Canvas API for puzzle rendering
- State: Piece positions, solved status
- AI: DALL-E for image generation/variation

---

## 8. User Interface & Experience Design

### 8.1 Design Philosophy

**Core Principle:** "Digital Time Capsule" – Warm nostalgia meets gentle empowerment

**Emotional Goals:**
- Evoke comfort, not clinical intervention
- Celebrate memories, not track decline
- Enable joy, not obligation

**Design Tenets:**
1. **Frictionless First:** Remove technical barriers (no login until needed, auto-save everything)
2. **Emotional Connection:** Story-driven, not metric-driven
3. **Senior-Optimized:** Large text, high contrast, voice everywhere
4. **Offline-Ready:** Never block progress due to connectivity

### 8.2 Visual Design System

#### 8.2.1 Color Palette

**Nostalgic Theme (Default):**
- Background: Beige `#F5F5DC`
- Accent: Soft Blue `#87CEEB`
- Highlight: Sepia `#D2B48C`
- Progress: Green `#90EE90`
- CTA: Warm Orange `#FF8C00`

**Fun Theme:**
- Background: Soft Yellow `#FFF9E6`
- Accent: Vibrant Teal `#20B2AA`
- Highlight: Coral `#FF7F50`
- Progress: Lime `#32CD32`
- CTA: Hot Pink `#FF69B4`

**High Contrast Theme:**
- Background: White `#FFFFFF`
- Text: Black `#000000`
- Accent: Dark Green `#006400`
- Borders: 3px solid black
- Focus: Yellow outline `#FFD700`

**Dark Mode:**
- Background: Soft Black `#1A1A1A`
- Text: Off-White `#F5F5F5`
- Accent: Muted Orange `#CC7000`
- Cards: Dark Gray `#2D2D2D`
- Progress: Soft Green `#6B8E23`

**Accessibility Requirements:**
- All text: 4.5:1 contrast minimum
- Large text (24pt+): 3:1 contrast
- Focus indicators: 3px outline, distinct color
- Color never sole indicator (add shapes/icons)

#### 8.2.2 Typography

**Font Family:** Inter (Google Fonts, preloaded)

**Scale:**
- Headers (H1): 32pt, Bold
- Sub-headers (H2): 24pt, Semi-Bold
- Body: 18pt, Regular
- Small text: 16pt, Regular (buttons, labels)
- Voice prompts: 24pt, Italic

**Line Height:**
- Headers: 1.2
- Body: 1.6 (for readability)

**Letter Spacing:**
- Headers: -0.5px (tighter)
- Body: 0px (default)

**Usage:**
- Prompts: Bold
- User quotes: Italic, indented
- Buttons: Semi-Bold, uppercase for CTAs

#### 8.2.3 Iconography

**Icon Set:** Feather Icons (simple line art)

**Size:**
- Small: 20px (inline)
- Medium: 32px (cards)
- Large: 48px (main actions)

**Style:**
- Stroke width: 2px
- Rounded corners: Yes
- Colors: Inherit from theme accent

**Common Icons:**
- Microphone (voice input)
- Camera (photo upload)
- Calendar (streaks)
- Flower (Memory Strength score)
- Puzzle pieces (games)
- Heart (favorites)

#### 8.2.4 Spacing System

**Base Unit:** 8px

**Scale:**
- XXS: 4px (tight spacing)
- XS: 8px (component padding)
- S: 16px (card padding)
- M: 24px (section margins)
- L: 32px (screen edges)
- XL: 48px (major sections)

**Grid:**
- Mobile: 16px edge margins
- Tablet: 24px edge margins
- Content max-width: 600px (centered)

#### 8.2.5 Animations & Micro-interactions

**Duration:**
- Fast: 100ms (button press)
- Standard: 200ms (transitions)
- Slow: 300ms (blooms, fades)

**Easing:**
- Entry: Ease-out (starts fast)
- Exit: Ease-in (ends fast)
- Both: Ease-in-out (smooth)

**Key Animations:**
- Petal bloom (score increase): Scale + fade-in, 300ms
- Card flip (Match-Up): RotateY 180deg, 200ms
- Prompt fade-in: Opacity 0→1 + translateY -20px→0, 200ms
- Success burst: Confetti particles, 500ms

**Accessibility:**
- Respect `prefers-reduced-motion`
- Essential animations only
- No flashing (seizure risk)

### 8.3 Component Library

#### 8.3.1 Buttons

**Primary (CTA):**
- Size: 48px height, full-width on mobile
- Color: Warm Orange background, white text
- States: Default, Hover (darken 10%), Active (scale 0.98), Disabled (opacity 0.5)
- Radius: 8px
- Shadow: 0 2px 4px rgba(0,0,0,0.1)

**Secondary:**
- Size: 44px height
- Color: Transparent background, accent border (2px)
- States: Hover (background accent 10% opacity)

**Icon Button:**
- Size: 48px circle
- Color: Accent background
- Icon: 24px centered

**Voice Button:**
- Size: 56px circle
- Color: Gradient (soft blue to purple)
- Animation: Pulse on recording

#### 8.3.2 Cards

**Memory Card:**
- Padding: 16px
- Background: Sepia with vintage border
- Corner: Rounded 12px
- Shadow: 0 4px 8px rgba(0,0,0,0.08)
- Content: Thumbnail (left), text (right), date (bottom)

**Game Card:**
- Padding: 20px
- Background: Accent color 10% opacity
- Icon: 48px top-center
- Title: 20pt bold
- Description: 16pt, 2 lines max
- CTA: "Play" button bottom

**Stat Card:**
- Padding: 16px
- Background: White/Dark gray
- Icon: 32px left
- Number: 24pt bold
- Label: 16pt below

#### 8.3.3 Input Fields

**Text Input:**
- Height: 48px
- Padding: 16px
- Border: 2px solid accent (focus: thicker)
- Font: 18pt
- Max length indicator: Character count (optional)

**Voice Input:**
- Button: 56px microphone circle
- Recording indicator: Pulsing red dot
- Waveform: Animated bars during recording
- Transcript: Appears below in real-time

**Photo Upload:**
- Dropzone: Dashed border, 200px height
- Preview: Thumbnail with remove button (X)
- Camera button: Opens device camera
- Gallery button: Opens file picker

#### 8.3.4 Navigation

**Bottom Tab Bar:**
- Height: 64px
- Items: 4 (Home, Games, Scrapbook, Profile)
- Icon: 24px, label: 12pt
- Active: Accent color + bold
- Inactive: Gray
- Safe area: Accounts for iOS notch

**Header:**
- Height: 60px
- Logo: Left (32px)
- Score flower: Right (40px flower icon + number)
- Title: Center (20pt)

#### 8.3.5 Feedback Elements

**Toast Notifications:**
- Position: Top center
- Duration: 3s auto-dismiss
- Types: Success (green), Error (red), Info (blue)
- Dismiss: Tap or swipe up

**Loading States:**
- Spinner: 32px, accent color
- Skeleton screens: Gray animated pulse
- Progress bar: Thin, accent color

**Empty States:**
- Icon: 64px gray
- Message: 18pt, encouraging
- Action: CTA button below

### 8.4 Accessibility Guidelines

#### 8.4.1 WCAG 2.1 AA Compliance

**Perceivable:**
- All images have alt text
- Video captions (future)
- Color contrast >4.5:1
- Text resizable to 200%

**Operable:**
- Keyboard navigation (tab order)
- Touch targets >48px (ideally 56px)
- No time limits (or adjustable)
- Skip links for screen readers

**Understandable:**
- Simple language (6th-grade reading level)
- Consistent navigation
- Error messages with suggestions
- Labels for all form fields

**Robust:**
- Valid HTML5 semantic tags
- ARIA labels where needed
- Works with assistive tech (VoiceOver, TalkBack)

#### 8.4.2 Voice Command Support

**Core Commands:**
- Navigation: "Go to [screen name]"
- Actions: "Start journal", "Play [game name]", "Record"
- Input: "Type [text]", "Delete", "Send"
- Help: "What can I say?", "Help", "Hint"

**Feedback:**
- Visual confirmation (highlighted command)
- Audio response ("Playing Memory Match-Up")

**Error Handling:**
- Misheard: "Did you mean [X]?"
- Unsupported: "I can't do that yet. Try [suggestion]"

#### 8.4.3 Screen Reader Optimization

**Focus Management:**
- Logical tab order (top to bottom, left to right)
- Focus trap in modals
- Skip to main content link

**ARIA Labels:**
- Buttons: `aria-label="Record voice entry"`
- Landmarks: `<nav>`, `<main>`, `<aside>`
- Live regions: `aria-live="polite"` for score updates
- Expanded states: `aria-expanded` on accordions

**Announcements:**
- Page changes: "Now on Home screen"
- Actions: "Entry saved successfully"
- Errors: "Please select a theme"

### 8.5 Responsive Design

**Breakpoints:**
- Mobile: 320px - 767px (primary focus)
- Tablet: 768px - 1023px
- Desktop: 1024px+ (limited support, refer to mobile)

**Mobile Adaptations:**
- Single column layouts
- Full-width buttons
- Bottom navigation
- Swipe gestures enabled

**Tablet Adaptations:**
- Two-column layouts (scrapbook grid)
- Side navigation (optional)
- Larger cards (more content visible)

**Desktop:**
- Limited support (redirect to mobile/tablet)
- Responsive scaling (max 800px width)

---

## 9. Screen-by-Screen Specifications

### 9.1 Onboarding Screens

#### 9.1.1 Splash Screen
**Route:** `/` (initial load)  
**Duration:** 2-3 seconds or skippable

**Elements:**
- Animated MemoryKeeper logo (center, fade-in + scale)
- Tagline: "Your memories, your story" (below logo, 18pt)
- Loading indicator (subtle spinner at bottom)
- Skip button (top-right, text: "Skip")

**Interactions:**
- Auto-advances to Welcome after 3s
- Skip button: Navigate to Welcome immediately
- Background: Beige gradient (nostalgic theme)

**Technical:**
- Component: `<SplashScreen />`
- Animation: Framer Motion or CSS keyframes
- No API calls (static assets only)

---

#### 9.1.2 Welcome & Profile Setup
**Route:** `/onboarding/profile`

**Layout:**
```
[Header: MemoryKeeper Logo | Skip Tutorial →]

[Progress Dots: ●●○○○ (Step 2 of 5)]

"Welcome! Let's Get Started"

Name: [_______________]
      (Text input, 48px height)

Age: [●●●●●●●●●●] 65+ 
     (Slider, large thumb)

Choose Your Avatar:
[👤] [👵] [👨] [👩] (Grid of 4, 64px each)

Select Theme:
[ Nostalgic ] [ Fun ] [ High Contrast ] (Tabs)
Preview: [Card sample showing theme colors]

[Next: Invite Family →] (Primary button)

[Footer: Voice: "I'm ready!"]
```

**Validation:**
- Name: Required, 2-50 chars
- Age: Must be 65+
- Avatar: Optional (default selected)
- Theme: Default to Nostalgic

**Technical:**
- Component: `<ProfileSetup />`
- State: `name`, `age`, `avatar`, `theme`
- Storage: Save to IndexedDB immediately
- Voice: "My name is [X]", "I'm [age] years old"

---

#### 9.1.3 Family Invitation (Optional)
**Route:** `/onboarding/family`

**Layout:**
```
[Header: MemoryKeeper | Back | Skip]

[Progress Dots: ●●●○○ (Step 3 of 5)]

"Invite Family to Share Memories"
(Subtitle: You can always do this later)

Email: [_______________] 
       [+ Add Another]

Relationship: [Dropdown: Daughter, Son, Grandchild, Other]

[Send Invites] (Primary)
[Skip for Now] (Secondary)

[Footer: Voice: "Skip this"]
```

**Interactions:**
- Add up to 5 emails
- Validation: Valid email format
- Skip: Proceeds without invites
- Send: Triggers Supabase invite function

**Technical:**
- Component: `<FamilyInvite />`
- API: POST `/api/invites` (Supabase Edge Function)
- Success: Toast "Invites sent!"

---

#### 9.1.4 AI Consent
**Route:** `/onboarding/consent`

**Layout:**
```
[Header: MemoryKeeper | Back]

[Progress Dots: ●●●●○ (Step 4 of 5)]

"Help Us Personalize Your Experience"

We use AI to:
• Create daily prompts from your memories
• Generate visuals and game content
• Adapt difficulty to your progress

Your Choices:
[✓] Use my memories for personalized prompts
[✓] Generate images from my stories
[✓] Track progress for adaptive games

[ ] Share anonymized data to improve MemoryKeeper
    (Optional, helps research)

[Learn More About Privacy →]

[Accept & Continue] (Primary)

[Footer: We never share your personal stories 
         without permission. GDPR compliant.]
```

**Validation:**
- At least one checkbox must be checked
- Learn More: Opens modal with detailed privacy policy

**Technical:**
- Component: `<AIConsent />`
- Storage: Consent flags saved to user profile
- Legal: GDPR-compliant language

---

#### 9.1.5 Quick Tutorial
**Route:** `/onboarding/tutorial`

**Layout (Carousel, 3 steps):**

**Step 1 - Journaling:**
```
[Progress: 1/3]

"How to Journal"

[Animated GIF: Hand tapping microphone button]

Tap the mic to record,
type, or upload a photo.

[Try It: Record "Hello!"]

[Next →]
```

**Step 2 - Games:**
```
[Progress: 2/3]

"Play Brain Games"

[Animated GIF: Cards flipping in Match-Up]

After journaling, play a 
quick 1-2 minute game!

[Demo: Play Match-Up]

[Next →]
```

**Step 3 - Progress:**
```
[Progress: 3/3]

"Track Your Growth"

[Animated GIF: Flower petals blooming]

Watch your Memory Strength 
grow day by day!

[Start My Journey!] (Primary)
```

**Interactions:**
- Swipe left/right between steps
- Skip All (top-right) available
- "Try It" is interactive (records audio, plays mini-game)

**Technical:**
- Component: `<Tutorial />`
- Carousel: Swiper.js or custom
- Completion: Sets `onboarding_complete` flag

---

### 9.2 Core App Screens

#### 9.2.1 Home Dashboard
**Route:** `/home`  
**Purpose:** Daily ritual entry point

**Layout:**
```
[Header: 
  🌸 Memory Strength: 75/100 
  🔔 Notifications (badge if unread)
]

Good Morning, Margaret! ☀️
Today is Tuesday, October 21

━━━ Daily Prompt ━━━

[Card with vintage border:]
  "What did your childhood 
   kitchen smell like?"
  
  [🎤 Voice] [✏️ Text] [📷 Photo]

━━━ Yesterday's Joy ━━━

[Mini scrapbook thumbnail:]
  "Summer of '68" 🌊
  [Tap to view →]

━━━ Today's Streak ━━━

🔥 7 Days! Keep it going!

[Start Daily Ritual →] (Large CTA)

━━━━━━━━━━━━━━━━━━━━━

[Bottom Nav: Home (active) | Games | Scrapbook | Profile]
```

**Key Features:**
- **Personalized Greeting:** Time-based (morning/afternoon/evening)
- **Dynamic Prompt:** AI-generated from knowledge graph or curated library
- **Flexible Input:** Voice (primary), text, or photo with caption
- **Context:** Previous day's memory as emotional hook
- **Streak Motivation:** Fire emoji + count
- **Voice Command:** "Start journal" → Opens input modal

**States:**
- Empty (no entry today): Show prompt + CTA
- In Progress: Show "Continue Entry" button
- Complete: Show "View Today's Entry" + "Play Another Game"

**Technical:**
- Component: `<HomeDashboard />`
- Data: Fetches from `/api/prompts/daily` and `/api/entries/recent`
- Offline: Cached prompts, entries stored locally

---

#### 9.2.2 Journal Input Modal
**Route:** `/home` (modal overlay)  
**Triggered by:** "Start Daily Ritual" button

**Layout:**
```
[Modal with blur background]

━━━ Today's Prompt ━━━
"What did your childhood kitchen smell like?"

━━━ Your Response ━━━

[Tabs: 🎤 Voice | ✏️ Text | 📷 Photo]

━━━ Voice Tab (Default) ━━━

[Large Mic Button: 64px, gradient]
(Tap to start recording)

[Waveform animation when recording]

Transcript:
"I remember the smell of fresh bread
baking every Saturday morning..."

[Stop Recording] [Clear] [Done]

━━━ Text Tab ━━━

[Textarea: 500 char limit]
[Character count: 245/500]

[Save]

━━━ Photo Tab ━━━

[Dropzone: "Tap to upload or take photo"]
[Preview if uploaded]
[Caption: Optional text field]

[Save]

[× Close] (Top-right)
```

**Interactions:**
- **Voice:** 
  - Tap mic: Start recording (max 2 min)
  - Real-time transcript appears
  - Stop: Saves audio + transcript
  - Clear: Restart recording
- **Text:**
  - Type directly
  - Character limit indicator
  - Auto-save drafts every 10s
- **Photo:**
  - Opens device camera OR file picker
  - Optional caption (100 chars)
  - Preview before saving

**Validation:**
- At least one input method must have content
- Voice: Min 5 seconds recording
- Text: Min 10 characters
- Photo: Max 5MB

**Technical:**
- Component: `<JournalInputModal />`
- Voice: MediaRecorder API, Speech-to-Text via OpenAI Whisper
- Storage: Saves to IndexedDB, queues for Supabase sync
- Offline: Full functionality, syncs when online

---

#### 9.2.3 Game Lobby
**Route:** `/games`  
**Purpose:** Select and preview games

**Layout:**
```
[Header: Pick a Game! | Today's Suggestion: Quiz Quest]

━━━ Recommended ━━━

[Large Card: Story Quiz Quest]
  [Icon: 📖]
  "Answer questions about your beach day"
  Difficulty: ●●○ Medium
  Duration: 1-2 min
  [Play Now →] (Primary)

━━━ All Games ━━━

[Scrollable Carousel of Cards:]

[Card 1: Memory Match-Up]
  [Icon: 🎴]
  "Match word pairs from your story"
  Difficulty: ●○○ Easy
  [Play]

[Card 2: Timeline Tango]
  [Icon: 🕐]
  "Put life events in order"
  Difficulty: ●●○ Medium
  [Play]

[Card 3: Echo Echo]
  [Icon: 🎵]
  "Repeat your own words"
  Difficulty: ●●○ Medium
  [Locked: Premium]

[Card 4: Legacy Link]
  [Icon: 🌐]
  "Connect memory associations"
  Difficulty: ●●● Hard
  [Play]

[Card 5: Snapshot Solve]
  [Icon: 🧩]
  "Solve picture puzzles"
  Difficulty: ●○○ Easy
  [Play]

━━━━━━━━━━━━━━━━━━━━━

[Bottom Nav: Home | Games (active) | Scrapbook | Profile]
```

**Features:**
- **AI Recommendation:** Based on recent entry content and performance
- **Difficulty Indicator:** Visual dots (easy/medium/hard)
- **Duration:** Estimated time for each game
- **Lock Icons:** Premium games show upgrade prompt
- **Voice Command:** "Play Match-Up" → Launches game directly

**Interactions:**
- Tap card: Expands with full description + "Play" button
- Swipe: Navigate carousel
- Filter: (Future) By difficulty, by category

**Technical:**
- Component: `<GameLobby />`
- Data: Fetches game metadata + user's play history
- Recommendation: Simple rule-based (if entry contains "photo", suggest Snapshot Solve)

---

#### 9.2.4 Game: Memory Match-Up
**Route:** `/games/memory-match`  
**Duration:** 1-2 minutes

**Layout:**
```
[Header: Memory Match-Up | Score: +0 | ❓ Hint]

"Match word pairs from your story!"

[Grid: 4x3 cards, face-down]

🂠 🂠 🂠 🂠
🂠 🂠 🂠 🂠
🂠 🂠 🂠 🂠

Moves: 0 | Matches: 0/6

[Voice: "Flip card 1"]

[Pause | Quit]
```

**Game Flow:**
1. **Intro:** "Let's match words from your kitchen memory!" (3s)
2. **Shuffle:** Cards animate shuffle (1s)
3. **Gameplay:**
   - Tap card → Flips to reveal word
   - Tap second card → Check match
   - Match: Both stay flipped, +10 points, celebration animation
   - No match: Both flip back after 1s, hint appears
4. **Completion:** All matched → "Great job! +60 points!" → Summary screen

**Hint System:**
- After 2 misses: "Remember your kitchen smells!"
- After 4 misses: "Try matching 'Apple' with 'Cinnamon'"
- Voice: "Hint please" → Reveals one pair highlight

**Adaptation:**
- Easy (Score <40): 3 pairs, visual cues on edges
- Medium (Score 40-70): 4-5 pairs, text only
- Hard (Score >70): 6 pairs, 90s gentle timer

**Technical:**
- Component: `<MemoryMatchGame />`
- State: Card array, flipped indices, match count
- Animation: CSS transform rotateY for flip
- AI: Extracts keywords from entry via OpenAI

---

#### 9.2.5 Game: Story Quiz Quest
**Route:** `/games/story-quiz`  
**Duration:** 1.5-2 minutes

**Layout:**
```
[Header: Story Quiz Quest | Score: +0]

"Relive your beach day! 🏖️"

━━━ Question 1/5 ━━━

Was the ocean water calm or wavy?

[A. Calm like glass]
[B. Gentle waves]
[C. Crashing waves]
[D. I don't remember]

Progress: ●○○○○

[Voice: "Option C"]

[Hint] (After wrong answer)
```

**Game Flow:**
1. **Narrative Frame:** "Let's revisit your memory..." (5s)
2. **Questions:** 4-6 MCQ, one at a time
3. **Branching:**
   - Correct → Deeper question ("What color was the sunset?")
   - Incorrect → Hint + retry OR skip
4. **Ending:** Path recap as mini audiobook (30s audio)

**Question Types:**
- Factual: "What year was this?"
- Sensory: "What did you hear?"
- Emotional: "How did you feel?"
- Relational: "Who was with you?"

**Adaptation:**
- Easy: Visual aids with each option (icons/colors)
- Medium: Text-only, one hint per question
- Hard: Open-ended voice responses ("Tell me more...")

**Technical:**
- Component: `<StoryQuizGame />`
- AI: Generates questions from entry context
- Branching: Tree structure stored in state
- Audio: Text-to-speech for recap

---

#### 9.2.6 Game: Timeline Tango
**Route:** `/games/timeline-tango`  
**Duration:** 1-2 minutes

**Layout:**
```
[Header: Timeline Tango | Score: +0]

"Sort your life events in order"

━━━ Decade Buckets ━━━

[1950s] [1960s] [1970s] [1980s]

━━━ Events to Sort ━━━

[Draggable Cards:]
📍 First Job
💍 Wedding Day
🏠 Moved to New City
👶 First Grandchild
🎓 Graduation
🚗 First Car

(Drag cards into decade buckets above)

[Check Order] (When all placed)

[Voice: "Move wedding to 1970s"]
```

**Game Flow:**
1. **Intro:** "Let's organize your timeline!" (3s)
2. **Display:** 4-6 event cards randomly positioned
3. **Drag:** User drags to chronological buckets/timeline
4. **Feedback:**
   - Correct: Card locks with green check ✓
   - Incorrect: Gentle vibration + hint
5. **Completion:** Time-machine animation sequence through eras

**Adaptation:**
- Easy: 3-4 events, decade buckets with era images
- Medium: 5-6 events, year-level precision
- Hard: 7+ events, fill date gaps ("What year?")

**Technical:**
- Component: `<TimelineTangoGame />`
- Drag-and-drop: react-beautiful-dnd or native touch
- AI: Extracts events from knowledge graph with dates
- Animation: Morphing timeline visualization

---

#### 9.2.7 Digital Scrapbook
**Route:** `/scrapbook`  
**Purpose:** Browse organized memory timeline

**Layout:**
```
[Header: Your Life Story | 🔍 Search]

[Filter Bar:]
[All] [1950s] [1960s] [1970s] [1980s] [People] [Places]

━━━ 1950s: Childhood ━━━

[Memory Card 1:]
  [Sepia Photo: Kitchen scene]
  "The smell of fresh bread"
  📅 1955 · 🎤 Audio available
  [❤️ Favorite] [Share]

[Memory Card 2:]
  [AI-Generated: Blue bicycle]
  "Summer rides to the creek"
  📅 1958 · 🎨 AI Image
  [Edit] [Share]

━━━ 1970s: Young Adult ━━━

[Memory Card 3:]
  [User Photo: Wedding]
  "Best day of my life"
  📅 1972 · 👥 Family (3 tagged)
  [Comments (2)] [Share]

[Load More...]

━━━━━━━━━━━━━━━━━━━━━

[Floating Action Button: + Add Memory]

[Bottom Nav: Home | Games | Scrapbook (active) | Profile]
```

**Features:**
- **Chronological View:** Grouped by decade, reverse chronological
- **Filter/Search:**
  - By decade/year
  - By person (tagged faces/names)
  - By content type (photo/audio/AI-generated)
  - Full-text search in captions
- **Memory Cards:**
  - Thumbnail preview
  - Title/caption (user-editable)
  - Date/era
  - Media type indicators
  - Tags (auto + manual)
  - Interaction counts (favorites, shares, comments)
- **Actions:**
  - Tap card → Full detail view
  - Long-press → Quick actions menu
  - Swipe left → Delete (with confirmation)
  - Swipe right → Quick share
- **Export:** "Export Book" button (top-right) → PDF/Audio compilation

**Detail View (Modal):**
```
[Full-screen memory view]

[Large Image/Video Player]

"The smell of fresh bread"

📅 Summer 1955, Age 10
🏷️ Kitchen, Grandmother, Baking

━━━ Full Entry ━━━

"Every Saturday morning, my grandmother 
would wake up at 5am to start baking. 
The whole house would fill with the warm 
smell of yeast and cinnamon..."

[🎤 Play Audio (2:15)]

━━━ Connected Memories ━━━

• "Grandmother's Recipe" (1956)
• "Family Breakfasts" (1957)

━━━ Family Comments ━━━

Jennifer (Daughter): "I wish I could have 
tasted Grandma's bread! ❤️"
[Reply]

[Edit] [Share] [Delete] [Close ×]
```

**Technical:**
- Component: `<Scrapbook />`
- Virtualized scroll: React-window for performance (1000+ memories)
- Search: Local full-text with Fuse.js
- Storage: Thumbnails cached, full images lazy-loaded
- Export: Generates PDF via jsPDF + html2canvas

---

#### 9.2.8 Family Sharing & Collaboration
**Route:** `/family`  
**Purpose:** Invite family and manage shared memories

**Layout:**
```
[Header: Family Circle | + Invite]

━━━ Connected Family ━━━

[Avatar Grid:]
👤 Jennifer (Daughter)
   [View Shared (12)] [Message]

👤 Michael (Son)
   [Pending Invite]
   [Resend]

👤 Emma (Granddaughter)
   [View Shared (5)] [Message]

━━━ Recent Activity ━━━

[Activity Card 1:]
  👤 Jennifer added a photo
  "Mom's 75th Birthday Party"
  📷 [Thumbnail]
  🕐 2 hours ago
  [View] [Comment]

[Activity Card 2:]
  👤 Emma commented on
  "Summer of '68"
  💬 "I love this story, Grandma!"
  🕐 Yesterday
  [View Thread]

[Activity Card 3:]
  👤 You shared
  "Wedding Day 1972"
  ✅ Approved by Jennifer
  🕐 3 days ago

━━━ Shared Memories ━━━

[Grid of thumbnails: All memories shared with family]

━━━ Pending Approvals ━━━

[Card:]
  Jennifer wants to add a photo to
  "Family Reunion 1985"
  [Preview] [Approve] [Decline]

[Bottom Nav: Home | Games | Scrapbook | Family (active)]
```

**Key Features:**
- **Invite System:**
  - Send email/SMS invites
  - Generate shareable link
  - Set permissions: View Only, Comment, Contribute (add photos/captions)
- **Activity Feed:**
  - Real-time updates on family interactions
  - Comments, new memories, approvals
  - Notifications (push + in-app)
- **Contribution Flow:**
  - Family member uploads photo → User approves → Adds to scrapbook
  - Time-stamped and attributed
  - 1-2 word caption/tag required
- **Permissions:**
  - Granular per memory or global
  - Can revoke access anytime
- **Premium Feature:** Full collaboration (family can edit, not just view)

**Family Member Adding Memory:**
```
[Modal: Add to Margaret's Scrapbook]

Upload Photo/Video:
[Dropzone]

Caption/Tag: [_________] (Max 50 chars)

Date/Era: [Dropdown: 1950s, 1960s, ...]

Related People: [Tag: Margaret, John, ...]

[Submit for Approval]
```

**Technical:**
- Component: `<FamilyCircle />`
- Real-time: Supabase Realtime subscriptions
- Notifications: Web Push API + Supabase Edge Functions
- Permissions: RLS policies enforcing access control

---

#### 9.2.9 AI Studio
**Route:** `/ai-studio`  
**Purpose:** Advanced AI customization (Premium)

**Layout:**
```
[Header: AI Studio | Help]

[Tabs: 💬 Chat | 🎨 Visual Builder | 📝 Prompts]

━━━ Chat Tab (Active) ━━━

[Chat Thread:]

AI Agent: "Hi Margaret! Want to explore 
          a memory together?"

You: "Tell me about my bicycle"

AI Agent: "You mentioned a blue bicycle from 
          the 1950s. Would you like me to 
          generate an image of it?"

You: "Yes please"

AI Agent: [Generating... 10s]
          [Image Preview: Vintage blue bike]
          "How's this? I can adjust the 
          color or style."

You: "Make the wheels redder"

AI Agent: [Updated image]
          "Better? I've saved this to your 
          scrapbook!"

[Input: Type or 🎤 Voice]

━━━ Visual Builder Tab ━━━

Generate Image from Memory:

Memory: [Dropdown: Select entry or type description]

Style: [Radio buttons:]
• Realistic
• Vintage/Sepia
• Artistic/Painterly
• Sketch

Details: [Textarea: Add specific elements]

[Generate Preview] (Takes 10-15s)

[Canvas: Blurred preview while generating]

[Save to Scrapbook] [Regenerate] [Edit More]

━━━ Prompts Tab ━━━

Custom Daily Prompts:

[List of saved prompts:]
1. "What was your first pet like?"
2. "Describe your wedding day weather"
3. "What games did you play as a child?"

[+ Create New Prompt]

[Modal when creating:]
Prompt Text: [Textarea]
Category: [Dropdown: Childhood, Family, Career, ...]
Frequency: [Once, Weekly, Monthly]
[Save]

[Bottom Nav: Home | Games | Scrapbook | Profile]
```

**Features:**
- **Conversational AI:**
  - Chat with agent about memories
  - Ask questions: "What memories do I have from 1960s?"
  - Get suggestions: "What game should I play today?"
  - Memory exploration: "Tell me more about my father"
- **Visual Generator:**
  - Text-to-image from memory descriptions
  - Iterative refinement ("Make it darker", "Add trees")
  - Style presets (vintage, realistic, artistic)
  - Save to scrapbook or regenerate
- **Custom Prompts:**
  - Create personal prompt library
  - Schedule prompts (daily, weekly)
  - Share prompts with other users (future)
  - Template library provided

**Voice Interaction:**
- Voice command: "Generate image of my bicycle"
- Voice chat: Full conversation with AI agent
- Voice description: Speak image details instead of typing

**Technical:**
- Component: `<AIStudio />`
- Chat: OpenAI GPT-4 via Supabase Edge Function
- Image Gen: DALL-E 3 via OpenAI API
- Prompts: Stored in Supabase, user-specific
- Rate Limiting: Premium users get priority, higher limits

---

#### 9.2.10 Profile & Progress Tracker
**Route:** `/profile`  
**Purpose:** View stats, settings, upgrade

**Layout:**
```
[Header: Your Journey | ⚙️ Settings]

━━━ Memory Strength ━━━

[Blooming Flower Visualization:]
  🌸 75/100
  [Petals: 7/10 unlocked]

This Week: +15 points 📈
"You're doing great! Keep it up!"

━━━ Streaks & Badges ━━━

🔥 Current Streak: 7 days
⭐ Longest Streak: 14 days
🏆 Total Games: 42

[Badge Icons:]
🎖️ Week Warrior (7-day streak)
🧠 Memory Master (50 games played)
📚 Storyteller (25 entries)
🎨 Creative (10 AI images generated)

━━━ Weekly Insights ━━━

[Chart: Line graph of scores over 7 days]

Top Game: Memory Match-Up (12 plays)
Favorite Time: 9am ☀️
Recall Improvement: +20% vs. last week

━━━ Quick Stats ━━━

📝 Journal Entries: 28
🎮 Games Played: 42
📸 Memories Saved: 35
👥 Family Members: 3

━━━ Account ━━━

[Avatar | Margaret | Age 72]

Plan: Free
[⭐ Upgrade to Premium] (CTA)

Benefits:
• Unlimited journal entries
• All games unlocked
• Priority AI generation
• Advanced analytics
• Family collaboration

[Start Free Trial] (7 days)

━━━ Settings ━━━

🎨 Theme: Nostalgic [Change]
🔊 Voice Speed: Normal [Adjust]
🌙 Dark Mode: Auto [Toggle]
🔔 Notifications: Enabled [Manage]
🔒 Privacy: [View Policy]
📊 Data Export: [Download All]
❌ Delete Account: [Manage]

[Bottom Nav: Home | Games | Scrapbook | Profile (active)]
```

**Memory Strength Visualization:**
- Animated flower with 10 petals
- Each petal represents 10 points
- Petals "bloom" (grow + color) as score increases
- Smooth animations (CSS transitions)
- Tap flower → Detailed breakdown modal

**Statistics:**
- Real-time calculations from user data
- Charts: Line graph (scores), bar chart (game frequency)
- Insights: AI-generated weekly summaries
- Comparisons: Week-over-week, month-over-month

**Settings:**
- **Theme:** Preview and switch between 4 themes
- **Voice:** Adjust TTS speed (slow, normal, fast)
- **Dark Mode:** Auto (follows system), always on, always off
- **Notifications:** Toggle daily reminders, family activity
- **Privacy:** View policy, manage consents, data usage
- **Data Export:** GDPR-compliant download (JSON + PDFs)
- **Account Deletion:** Requires confirmation, 30-day grace period

**Technical:**
- Component: `<ProfileDashboard />`
- Charts: Recharts library
- Flower: SVG animation with React Spring
- Data: Aggregates from game_sessions, journal_entries tables

---

#### 9.2.11 Premium Features Detail
**Route:** `/premium`  
**Purpose:** Upgrade funnel

**Layout:**
```
[Header: Upgrade to Premium | × Close]

━━━ Unlock Your Full Story ━━━

[Hero Image: Blooming flower at 100%]

━━━ What You Get ━━━

[Icon Grid:]

📝 Unlimited Entries
   Journal as much as you want,
   no daily limits

🎮 All Games Unlocked
   Access Echo Echo, Legacy Link,
   and premium variants

🎨 Priority AI
   Faster image generation and
   advanced visual styles

📊 Advanced Analytics
   Detailed cognitive reports,
   shareable with doctors

👥 Family Collaboration
   Full editing permissions,
   real-time co-creation

🎵 Multimedia Games
   Audio-enhanced experiences,
   video integration

📦 Export Everything
   PDF books, audio compilations,
   legacy archives

⭐ Early Access
   New features before everyone else

━━━ Pricing ━━━

[Card: Highlighted]
  $4.99/month
  [Start 7-Day Free Trial]
  (Cancel anytime, no commitment)

$49.99/year (Save 17%)
[Choose Annual]

━━━ What Users Say ━━━

[Testimonial Carousel:]

"Since using Premium, my recall has
improved 25%! Worth every penny."
— Dorothy, 68

"The family collaboration feature
lets my grandkids add photos. Priceless!"
— Robert, 71

"AI visuals bring my memories to life.
I finally have my life story preserved."
— Helen, 74

━━━ Guarantee ━━━

❤️ 30-Day Money-Back Guarantee
🔒 Cancel Anytime (No Questions Asked)
🛡️ Your Data Stays Private (Always)

[Start Free Trial] (Primary CTA)

Already Premium? [Manage Subscription]

━━━ FAQ ━━━

▶ What happens after the trial?
▶ Can I cancel anytime?
▶ Is my data still private?
▶ What payment methods accepted?

[Bottom Nav: Visible but dimmed]
```

**Conversion Flow:**
1. **Trial Start:** Click CTA → Payment info (optional) → Immediate access
2. **Trial Active:** Banner on home: "6 days left in trial"
3. **Trial End:** Modal prompt: "Continue Premium?" → Subscribe or revert to free
4. **Upgrade Success:** Celebratory animation + badge unlock

**A/B Test Variants:**
- Emphasize cognitive benefits vs. family connection
- Monthly vs. annual pricing prominence
- Trial length (7 vs. 14 days)

**Technical:**
- Component: `<PremiumUpgrade />`
- Payments: Stripe Checkout or Paddle
- Subscription: Managed via Supabase with webhook
- Feature Flags: Check user.subscription_status for access

---

### 9.3 Error & Offline States

#### 9.3.1 Offline Mode
**Trigger:** Network disconnected

**UI Changes:**
- Banner at top: "Offline – Changes will sync later ☁️"
- Banner color: Soft yellow (not alarming red)
- All offline features remain functional
- Sync indicators on cards (⏳ queued for sync)

**Modal (if user tries online-only action):**
```
[Modal: Friendly illustration]

"You're Offline"

No worries! You can:
✓ Journal (saves locally)
✓ Play games (cached)
✓ Browse scrapbook

Can't do right now:
✗ Generate AI images
✗ Invite family
✗ Sync with cloud

We'll sync everything when you're back online.

[OK, Got It]
```

**Sync Resume:**
- Background sync when reconnected
- Progress indicator: "Syncing 3 entries..."
- Success toast: "All caught up! ✓"

---

#### 9.3.2 Error States

**Generic Error:**
```
[Illustration: Friendly character]

"Oops! Something went wrong"

Don't worry, your memories are safe.

Error Code: ERR_500

[Try Again] [Report Problem]

[Or: Continue Offline]
```

**AI Generation Failed:**
```
"We couldn't generate that image right now"

Possible reasons:
• Server busy (try in a minute)
• Content policy issue
• Network interruption

[Try Again] [Use Different Description] [Cancel]
```

**Voice Recognition Failed:**
```
"We didn't catch that"

Tips:
• Speak clearly and slowly
• Check microphone permissions
• Reduce background noise

[Try Again] [Type Instead]
```

**Technical:**
- Component: `<ErrorBoundary />` (React)
- Logging: Sentry for crash reports
- Graceful degradation: Never block user completely

---

## 10. Business Model & Monetization

### 10.1 Freemium Model

**Free Tier:**
- 1 journal entry per day
- 3 core games (Match-Up, Quiz, Tango)
- Basic prompts (curated library)
- 50 memories in scrapbook
- View-only family sharing
- Standard AI processing

**Premium Tier ($4.99/month or $49.99/year):**
- Unlimited journal entries
- All 6 games + premium variants
- Custom prompts + AI Studio access
- Unlimited scrapbook storage
- Full family collaboration (editing)
- Priority AI processing (faster, advanced)
- Export tools (PDF books, audio compilations)
- Advanced analytics
- Early access to new features

### 10.2 Revenue Projections

**Assumptions:**
- Month 1: 1,000 users (pilot programs)
- Month 6: 10,000 users (organic growth + marketing)
- Free-to-Paid Conversion: 20% within 30 days
- Monthly Churn: 10% (industry standard for health apps)
- Average Revenue Per User (ARPU): $4.99

**Projected MRR:**
- Month 1: $1,000 (200 paid users)
- Month 3: $5,000 (1,000 paid users)
- Month 6: $10,000 (2,000 paid users)
- Month 12: $25,000 (5,000 paid users)

**Year 1 ARR Target:** $150,000

### 10.3 Acquisition Strategy

**Pilot Programs (Month 0-3):**
- Partner with 5 senior centers
- Free Premium access for first 100 users
- In-person onboarding sessions
- Gather testimonials and case studies

**Content Marketing (Month 3-6):**
- Blog: "Memory care tips", "Reminiscence therapy benefits"
- Video: Success stories, tutorial series
- Social: Facebook groups (seniors, caregivers)
- PR: Health/tech publications

**Partnerships (Month 6-12):**
- Senior living facilities (bulk licensing)
- Healthcare providers (prescribe as "brain health app")
- AARP, Alzheimer's Association collaborations
- Insurance companies (wellness programs)

**Performance Marketing (Month 6+):**
- Facebook/Instagram ads (targeting adult children)
- Google Search (keywords: "memory games for seniors")
- Influencer partnerships (senior lifestyle bloggers)

### 10.4 Pricing Strategy

**Trial Optimization:**
- 7-day free trial (no credit card required)
- Full Premium access during trial
- Email nurture sequence (day 2, 5, 7)
- Conversion prompt on day 6

**Annual Discount:**
- 17% savings vs. monthly ($49.99 vs. $59.88)
- Reduce churn with annual commitment
- Offer upgrade prompt after 3 months

**Family Plans (Future):**
- $7.99/month for 2 users (one senior + one family admin)
- Shared scrapbook across accounts

**Enterprise/B2B (Future):**
- $99/month per senior living facility (10-20 users)
- Admin dashboard for staff
- Aggregate (anonymized) cognitive insights

---

## 11. Development Roadmap

### 11.1 Phase 1: MVP Core (Weeks 1-8)

**Week 1-2: Foundation**
- [ ] Project setup (Vite + React + TypeScript + Tailwind)
- [ ] Supabase project initialization (database, auth, storage)
- [ ] PWA configuration (manifest, service worker, icons)
- [ ] Design system implementation (tokens, components)
- [ ] Authentication flow (OAuth + magic links)

**Week 3-4: Journaling & Onboarding**
- [ ] Onboarding screens (splash, profile, tutorial)
- [ ] Home dashboard with daily prompt
- [ ] Journal input (voice, text, photo)
- [ ] Local storage with IndexedDB
- [ ] Basic AI prompt generation (OpenAI integration)

**Week 5-6: Core Games**
- [ ] Game lobby with selection
- [ ] Memory Match-Up (full implementation)
- [ ] Story Quiz Quest (full implementation)
- [ ] Timeline Tango (full implementation)
- [ ] Scoring system and difficulty adaptation
- [ ] Memory Strength tracker (flower visualization)

**Week 7-8: Offline & Polish**
- [ ] Service worker for offline caching
- [ ] Background sync implementation
- [ ] Error handling and fallbacks
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization (Lighthouse >90)
- [ ] Senior usability testing (5 participants)

**Deliverable:** Functional MVP with 3 games, journaling, offline support

---

### 11.2 Phase 2: Advanced Features (Weeks 9-18)

**Week 9-10: Additional Games**
- [ ] Echo Echo (auditory game)
- [ ] Legacy Link (association game)
- [ ] Snapshot Solve (visual puzzle game)
- [ ] Premium game variants

**Week 11-12: Digital Scrapbook**
- [ ] Timeline view with decade grouping
- [ ] Search and filter functionality
- [ ] Memory detail views
- [ ] Edit capabilities
- [ ] AI tagging and organization

**Week 13-14: Family Sharing**
- [ ] Invite system (email + links)
- [ ] Permission management
- [ ] Activity feed
- [ ] Comment threads
- [ ] Contribution approval workflow
- [ ] Real-time sync (Supabase Realtime)

**Week 15-16: AI Studio**
- [ ] Conversational AI chat
- [ ] Visual generator (DALL-E integration)
- [ ] Custom prompt builder
- [ ] Preview/test functionality
- [ ] Advanced AI mechanisms (knowledge graphs)

**Week 17-18: Premium & Analytics**
- [ ] Payment integration (Stripe)
- [ ] Subscription management
- [ ] Feature gating based on tier
- [ ] Advanced analytics dashboard
- [ ] Export tools (PDF, audio)
- [ ] Beta testing with pilot users

**Deliverable:** Feature-complete app ready for limited launch

---

### 11.3 Phase 3: Expansion & Scale (Ongoing)

**Month 6-9: Enhancements**
- [ ] Seasonal content and themes
- [ ] Family multiplayer games
- [ ] Health app integrations
- [ ] Medication reminders
- [ ] Accessibility improvements (more languages)

**Month 9-12: Growth**
- [ ] Marketing campaigns
- [ ] Partnership implementations
- [ ] Enterprise/B2B features
- [ ] Advanced AI models (GPT-5, etc.)
- [ ] Community features (user forums)

**Post-Launch: Continuous**
- [ ] A/B testing for conversions
- [ ] User feedback incorporation
- [ ] Performance monitoring
- [ ] Security audits
- [ ] Feature iterations

---

## 12. Risk Assessment & Mitigation

### 12.1 Technical Risks

**Risk:** AI API costs exceed budget  
**Impact:** High (affects profitability)  
**Mitigation:**
- Cache all AI-generated content aggressively
- Implement rate limiting for free tier users
- Use lower-cost models for simple tasSks (GPT-3.5 vs GPT-4)
- Batch processing where possible
- Monitor usage with alerts

**Risk:** PWA adoption resistance (seniors unfamiliar with "installing" apps)  
**Impact:** Medium (affects user acquisition)  
**Mitigation:**
- Clear onboarding with video tutorials
- Family member setup assistance mode
- Alternative web access (no install required)
- In-person demos at pilot centers

**Risk:** Voice recognition accuracy issues for older voices  
**Impact:** Medium (affects UX)  
**Mitigation:**
- Multiple voice engine fallbacks (Web Speech API + OpenAI Whisper)
- Always provide text alternative
- Training users on voice best practices
- Accent/dialect support

**Risk:** Offline sync conflicts (multiple devices)  
**Impact:** Low (edge case)
