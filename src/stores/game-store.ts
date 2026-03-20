import { create } from 'zustand';
import { GameState, Player, ActionType, CharacterName } from '@/lib/engine/types';
import {
  initGame, declareAction, challengeAction, declareBlock,
  challengeBlock, passBlock, loseInfluence, completeExchange, resolveAction, passChallenge, getLivingPlayers
} from '@/lib/engine/game-engine';
import {
  decideAction, decideChallengeAction, decideBlockAction,
  decideLoseInfluence, decideExchange
} from '@/lib/ai/ai-controller';

interface GameStore {
  gameState: GameState | null;
  isAIThinking: boolean;

  startGame: (configs: { name: string; isHuman: boolean; personality?: Player['personality'] }[]) => void;
  resetGame: () => void;

  humanDeclareAction: (actionType: ActionType, targetId?: string) => void;
  humanChallenge: () => void;
  humanPassChallenge: () => void;
  humanBlock: (character: CharacterName) => void;
  humanPassBlock: () => void;
  humanChallengeBlock: () => void;
  humanLoseInfluence: (cardId: string) => void;
  humanCompleteExchange: (keptCardIds: string[]) => void;

  // Internal - exposed for scheduling
  triggerAITurn?: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  isAIThinking: false,

  startGame: (configs) => {
    const state = initGame(configs);
    set({ gameState: state });
    const firstPlayer = state.players[state.currentPlayerIndex];
    if (!firstPlayer.isHuman) {
      scheduleAIResponses(state, set, get);
    }
  },

  resetGame: () => set({ gameState: null, isAIThinking: false }),

  humanDeclareAction: (actionType, targetId) => {
    const { gameState } = get();
    if (!gameState) return;
    const newState = declareAction(gameState, actionType, targetId);
    set({ gameState: newState });
    scheduleAIResponses(newState, set, get);
  },

  humanChallenge: () => {
    const { gameState } = get();
    if (!gameState) return;
    const humanPlayer = gameState.players.find(p => p.isHuman)!;
    const newState = challengeAction(gameState, humanPlayer.id);
    set({ gameState: newState });
    scheduleAIResponses(newState, set, get);
  },

  humanPassChallenge: () => {
    const { gameState } = get();
    if (!gameState) return;
    const humanPlayer = gameState.players.find(p => p.isHuman)!;
    const newState = passChallenge(gameState, humanPlayer.id);
    set({ gameState: newState });
    scheduleAIResponses(newState, set, get);
  },

  humanBlock: (character) => {
    const { gameState } = get();
    if (!gameState) return;
    const humanPlayer = gameState.players.find(p => p.isHuman)!;
    const newState = declareBlock(gameState, humanPlayer.id, character);
    set({ gameState: newState });
    scheduleAIResponses(newState, set, get);
  },

  humanPassBlock: () => {
    const { gameState } = get();
    if (!gameState) return;
    const newState = passBlock(gameState);
    set({ gameState: newState });
    scheduleAIResponses(newState, set, get);
  },

  humanChallengeBlock: () => {
    const { gameState } = get();
    if (!gameState) return;
    const humanPlayer = gameState.players.find(p => p.isHuman)!;
    const newState = challengeBlock(gameState, humanPlayer.id);
    set({ gameState: newState });
    scheduleAIResponses(newState, set, get);
  },

  humanLoseInfluence: (cardId) => {
    const { gameState } = get();
    if (!gameState) return;
    const newState = loseInfluence(gameState, cardId);
    set({ gameState: newState });
    scheduleAIResponses(newState, set, get);
  },

  humanCompleteExchange: (keptCardIds) => {
    const { gameState } = get();
    if (!gameState) return;
    const newState = completeExchange(gameState, keptCardIds);
    set({ gameState: newState });
    scheduleAIResponses(newState, set, get);
  },
}));

function scheduleAIResponses(
  state: GameState,
  set: (s: Partial<GameStore>) => void,
  get: () => GameStore
) {
  if (state.phase === 'GAME_OVER') return;

  if (state.phase === 'ACTION_DECLARED') {
    const aiResponders = getLivingPlayers(state).filter(p =>
      !p.isHuman &&
      p.id !== state.pendingAction?.actorId &&
      !state.passedPlayerIds.includes(p.id)
    );

    // Check if human still needs to respond
    const humanPlayer = state.players.find(p => p.isHuman);
    const humanNeedsToRespond = humanPlayer &&
      !humanPlayer.isEliminated &&
      humanPlayer.id !== state.pendingAction?.actorId &&
      !state.passedPlayerIds.includes(humanPlayer.id);

    if (humanNeedsToRespond) return; // wait for human

    if (aiResponders.length === 0) {
      // All have responded - resolve
      const resolved = resolveAction(state);
      set({ gameState: resolved });
      scheduleAIResponses(resolved, set, get);
      return;
    }

    const ai = aiResponders[0];
    const decision = decideChallengeAction(state, ai);

    set({ isAIThinking: true });
    setTimeout(() => {
      const { gameState } = get();
      if (!gameState || gameState.phase !== 'ACTION_DECLARED') {
        set({ isAIThinking: false });
        return;
      }

      let newState: GameState;
      if (decision.type === 'challenge') {
        newState = challengeAction(gameState, ai.id);
      } else {
        const blockDecision = decideBlockAction(gameState, ai);
        if (blockDecision.type === 'block' && blockDecision.claimedCharacter) {
          newState = declareBlock(gameState, ai.id, blockDecision.claimedCharacter);
        } else {
          newState = passChallenge(gameState, ai.id);
        }
      }

      set({ gameState: newState, isAIThinking: false });
      scheduleAIResponses(newState, set, get);
    }, decision.delayMs);
    return;
  }

  if (state.phase === 'BLOCK_DECLARED') {
    const actor = state.pendingAction?.actorId;
    const humanPlayer = state.players.find(p => p.isHuman);

    if (humanPlayer && humanPlayer.id === actor) return; // human actor decides on block challenge

    const decider = state.players.find(p => p.id === actor && !p.isHuman);
    if (decider) {
      set({ isAIThinking: true });
      setTimeout(() => {
        const { gameState } = get();
        if (!gameState || gameState.phase !== 'BLOCK_DECLARED') {
          set({ isAIThinking: false });
          return;
        }
        const decision = decideChallengeAction(gameState, decider);
        let newState: GameState;
        if (decision.type === 'challenge') {
          newState = challengeBlock(gameState, decider.id);
        } else {
          newState = passBlock(gameState);
        }
        set({ gameState: newState, isAIThinking: false });
        scheduleAIResponses(newState, set, get);
      }, 1200);
    } else {
      // No AI actor - pass block automatically after delay
      setTimeout(() => {
        const { gameState } = get();
        if (!gameState || gameState.phase !== 'BLOCK_DECLARED') return;
        const newState = passBlock(gameState);
        set({ gameState: newState });
        scheduleAIResponses(newState, set, get);
      }, 800);
    }
    return;
  }

  if (state.phase === 'LOSE_INFLUENCE') {
    const loser = state.players.find(p => p.id === state.loseInfluenceContext?.playerId);
    if (!loser || loser.isHuman) return;

    const decision = decideLoseInfluence(state, loser);
    set({ isAIThinking: true });
    setTimeout(() => {
      const { gameState } = get();
      if (!gameState || !decision.cardId) {
        set({ isAIThinking: false });
        return;
      }
      const newState = loseInfluence(gameState, decision.cardId);
      set({ gameState: newState, isAIThinking: false });
      scheduleAIResponses(newState, set, get);
    }, decision.delayMs);
    return;
  }

  if (state.phase === 'EXCHANGE_SELECT') {
    const actor = state.players.find(p => p.id === state.pendingAction?.actorId);
    if (!actor || actor.isHuman) return;

    const decision = decideExchange(state, actor);
    set({ isAIThinking: true });
    setTimeout(() => {
      const { gameState } = get();
      if (!gameState || !decision.keptCardIds) {
        set({ isAIThinking: false });
        return;
      }
      const newState = completeExchange(gameState, decision.keptCardIds);
      set({ gameState: newState, isAIThinking: false });
      scheduleAIResponses(newState, set, get);
    }, decision.delayMs);
    return;
  }

  if (state.phase === 'RESOLVE') {
    const newState = resolveAction(state);
    set({ gameState: newState });
    scheduleAIResponses(newState, set, get);
    return;
  }

  if (state.phase === 'ACTION_SELECT') {
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.isHuman) return;

    const decision = decideAction(state, currentPlayer);
    set({ isAIThinking: true });
    setTimeout(() => {
      const { gameState } = get();
      if (!gameState) {
        set({ isAIThinking: false });
        return;
      }
      const newState = declareAction(gameState, decision.actionType!, decision.targetId);
      set({ gameState: newState, isAIThinking: false });
      scheduleAIResponses(newState, set, get);
    }, decision.delayMs);
  }
}
