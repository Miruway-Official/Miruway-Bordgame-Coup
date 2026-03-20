import { Player, CharacterName } from './types';

export function playerHasCharacter(player: Player, character: CharacterName): boolean {
  return player.cards.some(c => c.character === character && !c.revealed);
}

export interface ChallengeResult {
  challengerWins: boolean;
  claimerMustRevealCardId?: string;
  challengerMustLoseInfluence: boolean;
  claimerMustShuffleAndDraw: boolean;
}

export function resolveChallengeOutcome(
  claimer: Player,
  claimedCharacter: CharacterName
): ChallengeResult {
  const hasIt = playerHasCharacter(claimer, claimedCharacter);
  if (hasIt) {
    return {
      challengerWins: false,
      challengerMustLoseInfluence: true,
      claimerMustShuffleAndDraw: true,
    };
  } else {
    return {
      challengerWins: true,
      challengerMustLoseInfluence: false,
      claimerMustShuffleAndDraw: false,
    };
  }
}
