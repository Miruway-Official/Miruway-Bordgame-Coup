# Project Summary

## Project: Coup Board Game (Digital)
**Status:** Complete - build passing

## Tech Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Zustand (state), Framer Motion (animations), Lucide React (icons)

## Architecture

### Game Engine (src/lib/engine/)
- types.ts - All TypeScript types
- constants.ts - Action costs, character colors, blockable-by mapping
- deck.ts - Card creation, shuffle, draw/return
- actions.ts - Available actions, pending action builder
- challenges.ts - Challenge resolution logic
- blocks.ts - Block checking
- game-engine.ts - Core game state machine (initGame, declareAction, challengeAction, declareBlock, challengeBlock, passBlock, loseInfluence, startExchange, completeExchange, resolveAction)

### AI (src/lib/ai/)
- ai-types.ts - AIPersonality interface, 3 personalities
- ai-controller.ts - Decision functions for each game phase

### Stores (src/stores/)
- game-store.ts - Main game state + AI orchestration via scheduleAIResponses
- ui-store.ts - UI state (log visibility, selections)

### Components (src/components/game/)
- GameBoard - Main orchestrator, shows correct dialog per phase
- PlayerArea - Per-player display with cards and coins
- ActionPanel - Human action buttons
- TargetSelector - Modal for picking a target
- ChallengeDialog - Challenge/pass on ACTION_DECLARED
- BlockDialog - Block options for targeted player
- RevealDialog - Choose card to lose influence
- ExchangeDialog - Pick 2 cards to keep
- GameLog - Scrollable color-coded event log
- TurnIndicator - Current turn + phase display
- GameOverScreen - Winner display

### Pages
- / - Landing page with character preview
- /setup - Player name + AI count + AI personalities
- /game - Reads localStorage config, initializes game
- /rules - Full rules reference

## Completed Features
- Full Coup rules implementation
- Challenge/block/counter-challenge chains
- 3 AI personalities with timing delays
- Complete game flow from setup to game over
