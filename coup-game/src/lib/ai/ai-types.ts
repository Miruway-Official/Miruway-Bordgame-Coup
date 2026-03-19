export interface AIPersonality {
  name: 'aggressive' | 'cautious' | 'random-bluffer';
  bluffChance: number;
  challengeChance: number;
  blockChance: number;
  coupAt: number;
  thinkingMs: [number, number];
}

export const AI_PERSONALITIES: Record<string, AIPersonality> = {
  aggressive: {
    name: 'aggressive',
    bluffChance: 0.6,
    challengeChance: 0.5,
    blockChance: 0.4,
    coupAt: 7,
    thinkingMs: [800, 1500],
  },
  cautious: {
    name: 'cautious',
    bluffChance: 0.15,
    challengeChance: 0.2,
    blockChance: 0.6,
    coupAt: 8,
    thinkingMs: [1500, 2500],
  },
  'random-bluffer': {
    name: 'random-bluffer',
    bluffChance: 0.7,
    challengeChance: 0.4,
    blockChance: 0.3,
    coupAt: 7,
    thinkingMs: [500, 2000],
  },
};
