import { GameState, Player, ActionType, CharacterName } from '../engine/types';
import { getAvailableActions } from '../engine/actions';
import { getBlockableCharacters } from '../engine/blocks';
import { playerHasCharacter } from '../engine/challenges';
import { AI_PERSONALITIES, AIPersonality } from './ai-types';
import { getLivingPlayers } from '../engine/game-engine';

function getPersonality(player: Player): AIPersonality {
  return AI_PERSONALITIES[player.personality ?? 'cautious'];
}

function rand(): number {
  return Math.random();
}

function thinkingDelay(personality: AIPersonality): number {
  const [min, max] = personality.thinkingMs;
  return Math.floor(min + rand() * (max - min));
}

export interface AIDecision {
  type: 'action' | 'challenge' | 'block' | 'pass' | 'lose_influence' | 'exchange_select';
  actionType?: ActionType;
  targetId?: string;
  claimedCharacter?: CharacterName;
  cardId?: string;
  keptCardIds?: string[];
  offeredHandCardId?: string;
  delayMs: number;
}

export function decideAction(state: GameState, aiPlayer: Player): AIDecision {
  const personality = getPersonality(aiPlayer);
  const living = getLivingPlayers(state);
  const targets = living.filter(p => p.id !== aiPlayer.id);
  const available = getAvailableActions(aiPlayer, living);

  if (aiPlayer.coins >= personality.coupAt && available.includes('coup')) {
    const target = targets.reduce((a, b) => a.coins > b.coins ? a : b);
    return { type: 'action', actionType: 'coup', targetId: target.id, delayMs: thinkingDelay(personality) };
  }

  const myChars = aiPlayer.cards.filter(c => !c.revealed).map(c => c.character);

  if (myChars.includes('เจ้าพยา') && available.includes('tax')) {
    return { type: 'action', actionType: 'tax', delayMs: thinkingDelay(personality) };
  }
  if (myChars.includes('จอมโจร') && available.includes('steal') && targets.length > 0) {
    const richest = targets.reduce((a, b) => a.coins > b.coins ? a : b);
    if (richest.coins > 0) {
      return { type: 'action', actionType: 'steal', targetId: richest.id, delayMs: thinkingDelay(personality) };
    }
  }
  if (myChars.includes('นักฆ่า') && aiPlayer.coins >= 3 && available.includes('assassinate')) {
    const target = targets[Math.floor(rand() * targets.length)];
    return { type: 'action', actionType: 'assassinate', targetId: target.id, delayMs: thinkingDelay(personality) };
  }

  if (rand() < personality.bluffChance) {
    const bluffActions: ActionType[] = (['tax', 'steal', 'assassinate'] as ActionType[]).filter(a => available.includes(a));
    if (bluffActions.length > 0) {
      const action = bluffActions[Math.floor(rand() * bluffActions.length)];
      const target = targets.length > 0 ? targets[Math.floor(rand() * targets.length)] : undefined;
      if (action === 'steal' || action === 'assassinate') {
        if (target && (action !== 'assassinate' || aiPlayer.coins >= 3)) {
          return { type: 'action', actionType: action, targetId: target.id, delayMs: thinkingDelay(personality) };
        }
      } else {
        return { type: 'action', actionType: action, delayMs: thinkingDelay(personality) };
      }
    }
  }

  if (available.includes('foreign_aid')) {
    return { type: 'action', actionType: 'foreign_aid', delayMs: thinkingDelay(personality) };
  }
  return { type: 'action', actionType: 'income', delayMs: thinkingDelay(personality) };
}

export function decideChallengeAction(state: GameState, aiPlayer: Player): AIDecision {
  const personality = getPersonality(aiPlayer);
  const { pendingAction } = state;
  if (!pendingAction?.claimedCharacter) {
    return { type: 'pass', delayMs: thinkingDelay(personality) };
  }

  const allRevealedChars = state.players
    .flatMap(p => p.cards.filter(c => c.revealed).map(c => c.character));

  const claimedChar = pendingAction.claimedCharacter;
  const revealedCount = allRevealedChars.filter(c => c === claimedChar).length;

  const weHaveIt = playerHasCharacter(aiPlayer, claimedChar);

  let challengeChance = personality.challengeChance;
  if (weHaveIt) challengeChance *= 1.5;
  if (revealedCount >= 2) challengeChance *= 1.5;

  if (rand() < Math.min(challengeChance, 0.85)) {
    return { type: 'challenge', delayMs: thinkingDelay(personality) };
  }
  return { type: 'pass', delayMs: thinkingDelay(personality) };
}

export function decideBlockAction(state: GameState, aiPlayer: Player): AIDecision {
  const personality = getPersonality(aiPlayer);
  const { pendingAction } = state;
  if (!pendingAction) return { type: 'pass', delayMs: thinkingDelay(personality) };

  const blockChars = getBlockableCharacters(pendingAction.type);
  if (blockChars.length === 0) return { type: 'pass', delayMs: thinkingDelay(personality) };

  const isTarget = pendingAction.targetId === aiPlayer.id;
  const myChars = aiPlayer.cards.filter(c => !c.revealed).map(c => c.character);

  for (const blockChar of blockChars) {
    if (myChars.includes(blockChar)) {
      if (isTarget || rand() < personality.blockChance * 0.5) {
        return { type: 'block', claimedCharacter: blockChar, delayMs: thinkingDelay(personality) };
      }
    }
  }

  if (isTarget && rand() < personality.bluffChance * personality.blockChance) {
    const blockChar = blockChars[Math.floor(rand() * blockChars.length)];
    return { type: 'block', claimedCharacter: blockChar, delayMs: thinkingDelay(personality) };
  }

  return { type: 'pass', delayMs: thinkingDelay(personality) };
}

export function decideLoseInfluence(state: GameState, aiPlayer: Player): AIDecision {
  const personality = getPersonality(aiPlayer);
  const unrevealed = aiPlayer.cards.filter(c => !c.revealed);
  if (unrevealed.length === 0) return { type: 'lose_influence', cardId: aiPlayer.cards[0]?.id, delayMs: thinkingDelay(personality) };

  const nonContessa = unrevealed.filter(c => c.character !== 'รัชทายาท');
  const card = nonContessa.length > 0 ? nonContessa[0] : unrevealed[0];
  return { type: 'lose_influence', cardId: card.id, delayMs: thinkingDelay(personality) };
}

export function decideExchange(state: GameState, aiPlayer: Player): AIDecision {
  const personality = getPersonality(aiPlayer);
  const priority: CharacterName[] = ['เจ้าพยา', 'นักฆ่า', 'จอมโจร', 'ทูต', 'รัชทายาท'];
  const drawnCards = state.exchangeCards ?? [];
  const handCardIds = state.exchangeHandCardIds ?? [];
  const handCards = aiPlayer.cards.filter(c => handCardIds.includes(c.id));

  // Offer the least valuable hand card
  const sortedHand = [...handCards].sort(
    (a, b) => priority.indexOf(b.character) - priority.indexOf(a.character)
  );
  const offeredHandCard = sortedHand[0];

  // Pool = offered hand card + drawn cards
  const pool = offeredHandCard ? [offeredHandCard, ...drawnCards] : drawnCards;
  const sortedPool = [...pool].sort(
    (a, b) => priority.indexOf(a.character) - priority.indexOf(b.character)
  );
  const keptCard = sortedPool[0];

  return {
    type: 'exchange_select',
    keptCardIds: keptCard ? [keptCard.id] : [],
    offeredHandCardId: offeredHandCard?.id,
    delayMs: thinkingDelay(personality),
  };
}
