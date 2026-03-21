export type CharacterName = 'เจ้าพยา' | 'นักฆ่า' | 'จอมโจร' | 'ทูต' | 'รัชทายาท';
export type ActionType = 'income' | 'foreign_aid' | 'tax' | 'steal' | 'assassinate' | 'exchange' | 'coup';
export type GamePhase =
  | 'ACTION_SELECT'
  | 'TARGET_SELECT'
  | 'ACTION_DECLARED'
  | 'BLOCK_DECLARED'
  | 'CHALLENGE_RESOLVE'
  | 'BLOCK_CHALLENGE_RESOLVE'
  | 'LOSE_INFLUENCE'
  | 'EXCHANGE_SELECT'
  | 'RESOLVE'
  | 'GAME_OVER';

export interface Card {
  id: string;
  character: CharacterName;
  revealed: boolean;
}

export interface Player {
  id: string;
  name: string;
  coins: number;
  cards: Card[];
  isHuman: boolean;
  isEliminated: boolean;
  personality?: 'aggressive' | 'cautious' | 'random-bluffer';
}

export interface PendingAction {
  type: ActionType;
  actorId: string;
  targetId?: string;
  claimedCharacter?: CharacterName;
  blockableBy?: CharacterName[];
  canBeCountered: boolean;
}

export interface PendingBlock {
  blockerId: string;
  claimedCharacter: CharacterName;
  againstAction: ActionType;
}

export interface LoseInfluenceContext {
  playerId: string;
  reason: 'challenged' | 'assassinated' | 'coup' | 'block_challenged';
  onComplete?: () => void;
}

export interface GameState {
  players: Player[];
  deck: Card[];
  currentPlayerIndex: number;
  phase: GamePhase;
  pendingAction?: PendingAction;
  pendingBlock?: PendingBlock;
  loseInfluenceContext?: LoseInfluenceContext;
  exchangeCards?: Card[];
  exchangeHandCardIds?: string[];
  winner?: string;
  log: GameLogEntry[];
  turnNumber: number;
  passedPlayerIds: string[];
}

export interface GameLogEntry {
  id: string;
  turnNumber: number;
  text: string;
  type: 'action' | 'challenge' | 'block' | 'reveal' | 'system';
  timestamp: number;
}
