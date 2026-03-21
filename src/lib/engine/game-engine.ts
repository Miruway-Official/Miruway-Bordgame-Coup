import { GameState, Player, Card, ActionType, CharacterName, GameLogEntry } from './types';
import { createDeck, drawCard, returnCard } from './deck';
import { buildPendingAction, getCost } from './actions';
import { resolveChallengeOutcome } from './challenges';
import { STARTING_COINS, STARTING_CARDS } from './constants';

function createLogEntry(text: string, type: GameLogEntry['type'], turnNumber: number): GameLogEntry {
  return { id: `log-${Date.now()}-${Math.random()}`, text, type, timestamp: Date.now(), turnNumber };
}

export function initGame(playerConfigs: { name: string; isHuman: boolean; personality?: Player['personality'] }[]): GameState {
  let deck = createDeck();
  const players: Player[] = playerConfigs.map((cfg, i) => {
    const cards: Card[] = [];
    for (let j = 0; j < STARTING_CARDS; j++) {
      const result = drawCard(deck);
      deck = result.remaining;
      cards.push(result.card);
    }
    return {
      id: `player-${i}`,
      name: cfg.name,
      coins: STARTING_COINS,
      cards,
      isHuman: cfg.isHuman,
      isEliminated: false,
      personality: cfg.personality,
    };
  });

  return {
    players,
    deck,
    currentPlayerIndex: 0,
    phase: 'ACTION_SELECT',
    log: [createLogEntry('เกมเริ่มแล้ว! โชคดี', 'system', 0)],
    turnNumber: 1,
    passedPlayerIds: [],
  };
}

export function getLivingPlayers(state: GameState): Player[] {
  return state.players.filter(p => !p.isEliminated);
}

export function getCurrentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

export function declareAction(state: GameState, actionType: ActionType, targetId?: string): GameState {
  const actor = getCurrentPlayer(state);
  const cost = getCost(actionType);
  const pending = buildPendingAction(actionType, actor.id, targetId);

  const updatedPlayers = state.players.map(p =>
    p.id === actor.id ? { ...p, coins: p.coins - cost } : p
  );

  let logText = '';
  const target = targetId ? state.players.find(p => p.id === targetId) : null;

  switch (actionType) {
    case 'income': logText = `${actor.name} รับรายได้ (+1 เหรียญ)`; break;
    case 'foreign_aid': logText = `${actor.name} ขอความช่วยเหลือต่างประเทศ (+2 เหรียญ)`; break;
    case 'tax': logText = `${actor.name} อ้างตัวเป็นเจ้าพยา เก็บภาษี (+3 เหรียญ)`; break;
    case 'steal': logText = `${actor.name} อ้างตัวเป็นจอมโจร ขโมยจาก ${target?.name}`; break;
    case 'assassinate': logText = `${actor.name} อ้างตัวเป็นนักฆ่า เล็งเป้า ${target?.name}`; break;
    case 'exchange': logText = `${actor.name} อ้างตัวเป็นทูต แลกไพ่`; break;
    case 'coup': logText = `${actor.name} รัฐประหาร ${target?.name}!`; break;
  }

  if (actionType === 'income') {
    const newPlayers = updatedPlayers.map(p =>
      p.id === actor.id ? { ...p, coins: p.coins + 1 } : p
    );
    return {
      ...state,
      players: newPlayers,
      phase: 'RESOLVE',
      log: [...state.log, createLogEntry(logText, 'action', state.turnNumber)],
      passedPlayerIds: [],
    };
  }

  if (actionType === 'coup') {
    return {
      ...state,
      players: updatedPlayers,
      phase: 'LOSE_INFLUENCE',
      pendingAction: pending,
      loseInfluenceContext: { playerId: targetId!, reason: 'coup' },
      log: [...state.log, createLogEntry(logText, 'action', state.turnNumber)],
      passedPlayerIds: [],
    };
  }

  return {
    ...state,
    players: updatedPlayers,
    phase: 'ACTION_DECLARED',
    pendingAction: pending,
    log: [...state.log, createLogEntry(logText, 'action', state.turnNumber)],
    passedPlayerIds: [],
  };
}

export function passChallenge(state: GameState, playerId: string): GameState {
  const newPassed = [...state.passedPlayerIds, playerId];
  const living = getLivingPlayers(state);
  const actor = state.pendingAction?.actorId;
  const nonActors = living.filter(p => p.id !== actor);

  if (newPassed.length >= nonActors.length) {
    return resolveAction({ ...state, passedPlayerIds: newPassed });
  }
  return { ...state, passedPlayerIds: newPassed };
}

export function challengeAction(state: GameState, challengerId: string): GameState {
  const { pendingAction } = state;
  if (!pendingAction?.claimedCharacter) return state;

  const claimer = state.players.find(p => p.id === pendingAction.actorId)!;
  const challenger = state.players.find(p => p.id === challengerId)!;
  const result = resolveChallengeOutcome(claimer, pendingAction.claimedCharacter);

  const logText = `${challenger.name} ท้าทายการอ้าง${pendingAction.claimedCharacter} ของ ${claimer.name}!`;

  if (result.challengerWins) {
    return {
      ...state,
      phase: 'LOSE_INFLUENCE',
      loseInfluenceContext: { playerId: claimer.id, reason: 'challenged' },
      log: [...state.log, createLogEntry(logText, 'challenge', state.turnNumber),
            createLogEntry(`${claimer.name} โกหก! ต้องเปิดไพ่`, 'challenge', state.turnNumber)],
    };
  } else {
    let deck = state.deck;
    const claimedCardIndex = claimer.cards.findIndex(c => c.character === pendingAction.claimedCharacter && !c.revealed);
    if (claimedCardIndex !== -1) {
      const claimedCard = claimer.cards[claimedCardIndex];
      deck = returnCard(deck, claimedCard);
      const { card: newCard, remaining } = drawCard(deck);
      deck = remaining;
      const newCards = [...claimer.cards];
      newCards[claimedCardIndex] = newCard;
      const updatedPlayers = state.players.map(p =>
        p.id === claimer.id ? { ...p, cards: newCards } : p
      );
      return {
        ...state,
        players: updatedPlayers,
        deck,
        phase: 'LOSE_INFLUENCE',
        loseInfluenceContext: { playerId: challenger.id, reason: 'challenged' },
        log: [...state.log,
              createLogEntry(logText, 'challenge', state.turnNumber),
              createLogEntry(`${claimer.name} เปิดไพ่ ${pendingAction.claimedCharacter}! ${challenger.name} ต้องเสียอิทธิพล`, 'challenge', state.turnNumber)],
      };
    }
    return state;
  }
}

export function declareBlock(state: GameState, blockerId: string, claimedCharacter: CharacterName): GameState {
  const blocker = state.players.find(p => p.id === blockerId)!;
  const logText = `${blocker.name} อ้างตัวเป็น ${claimedCharacter} เพื่อสกัดการกระทำ!`;
  return {
    ...state,
    phase: 'BLOCK_DECLARED',
    pendingBlock: { blockerId, claimedCharacter, againstAction: state.pendingAction!.type },
    log: [...state.log, createLogEntry(logText, 'block', state.turnNumber)],
    passedPlayerIds: [],
  };
}

export function challengeBlock(state: GameState, challengerId: string): GameState {
  const { pendingBlock } = state;
  if (!pendingBlock) return state;

  const blocker = state.players.find(p => p.id === pendingBlock.blockerId)!;
  const challenger = state.players.find(p => p.id === challengerId)!;
  const result = resolveChallengeOutcome(blocker, pendingBlock.claimedCharacter);

  const logText = `${challenger.name} ท้าทายการสกัดของ ${blocker.name}!`;

  if (result.challengerWins) {
    return {
      ...state,
      phase: 'LOSE_INFLUENCE',
      loseInfluenceContext: { playerId: blocker.id, reason: 'block_challenged' },
      log: [...state.log, createLogEntry(logText, 'challenge', state.turnNumber),
            createLogEntry(`${blocker.name} โกหก! การสกัดล้มเหลว การกระทำดำเนินต่อ`, 'challenge', state.turnNumber)],
    };
  } else {
    let deck = state.deck;
    const claimedCardIndex = blocker.cards.findIndex(c => c.character === pendingBlock.claimedCharacter && !c.revealed);
    if (claimedCardIndex !== -1) {
      const claimedCard = blocker.cards[claimedCardIndex];
      deck = returnCard(deck, claimedCard);
      const { card: newCard, remaining } = drawCard(deck);
      deck = remaining;
      const newCards = [...blocker.cards];
      newCards[claimedCardIndex] = newCard;
      const updatedPlayers = state.players.map(p =>
        p.id === blocker.id ? { ...p, cards: newCards } : p
      );
      return {
        ...state,
        players: updatedPlayers,
        deck,
        phase: 'LOSE_INFLUENCE',
        loseInfluenceContext: { playerId: challenger.id, reason: 'challenged' },
        log: [...state.log,
              createLogEntry(logText, 'challenge', state.turnNumber),
              createLogEntry(`การสกัดถูกต้อง! ${challenger.name} ต้องเสียอิทธิพล การสกัดสำเร็จ`, 'challenge', state.turnNumber)],
      };
    }
    return state;
  }
}

export function passBlock(state: GameState): GameState {
  const logText = `การสกัดสำเร็จ การกระทำถูกยกเลิก`;
  return {
    ...state,
    phase: 'RESOLVE',
    players: state.pendingAction?.type === 'assassinate'
      ? state.players.map(p => p.id === state.pendingAction!.actorId ? { ...p, coins: p.coins + 3 } : p)
      : state.players,
    log: [...state.log, createLogEntry(logText, 'block', state.turnNumber)],
  };
}

export function loseInfluence(state: GameState, cardId: string): GameState {
  if (!state.loseInfluenceContext) return state;
  const { playerId, reason } = state.loseInfluenceContext;

  const updatedPlayers = state.players.map(p => {
    if (p.id !== playerId) return p;
    const cardIndex = p.cards.findIndex(c => c.id === cardId && !c.revealed);
    if (cardIndex === -1) return p;
    const newCards = [...p.cards];
    newCards[cardIndex] = { ...newCards[cardIndex], revealed: true };
    const isEliminated = newCards.every(c => c.revealed);
    return { ...p, cards: newCards, isEliminated };
  });

  const player = state.players.find(p => p.id === playerId)!;
  const card = player.cards.find(c => c.id === cardId)!;
  const logText = `${player.name} เปิดไพ่ ${card.character}!`;

  let nextPhase: GameState['phase'] = 'RESOLVE';
  let pendingAction = state.pendingAction;

  if (reason === 'challenged') {
    if (playerId === state.pendingAction?.actorId) {
      nextPhase = 'RESOLVE';
      pendingAction = undefined;
    } else {
      if (state.pendingAction?.type === 'assassinate' && playerId !== state.pendingAction.targetId) {
        return {
          ...state,
          players: updatedPlayers,
          phase: 'LOSE_INFLUENCE',
          loseInfluenceContext: { playerId: state.pendingAction.targetId!, reason: 'assassinated' },
          log: [...state.log, createLogEntry(logText, 'reveal', state.turnNumber)],
        };
      }
    }
  } else if (reason === 'block_challenged') {
    if (state.pendingAction?.type === 'assassinate') {
      return {
        ...state,
        players: updatedPlayers,
        phase: 'LOSE_INFLUENCE',
        loseInfluenceContext: { playerId: state.pendingAction.targetId!, reason: 'assassinated' },
        log: [...state.log, createLogEntry(logText, 'reveal', state.turnNumber)],
      };
    }
  } else if (reason === 'assassinated' || reason === 'coup') {
    nextPhase = 'RESOLVE';
    pendingAction = undefined;
  }

  return {
    ...state,
    players: updatedPlayers,
    phase: nextPhase,
    pendingAction,
    loseInfluenceContext: undefined,
    log: [...state.log, createLogEntry(logText, 'reveal', state.turnNumber)],
  };
}

export function startExchange(state: GameState): GameState {
  const actor = state.players.find(p => p.id === state.pendingAction?.actorId)!;
  let deck = state.deck;
  const drawn: Card[] = [];
  for (let i = 0; i < 2; i++) {
    if (deck.length > 0) {
      const { card, remaining } = drawCard(deck);
      deck = remaining;
      drawn.push(card);
    }
  }
  const handCardIds = actor.cards.filter(c => !c.revealed).map(c => c.id);
  return {
    ...state,
    deck,
    phase: 'EXCHANGE_SELECT',
    exchangeCards: drawn,
    exchangeHandCardIds: handCardIds,
    log: [...state.log, createLogEntry(`${actor.name} อ้างตัวเป็นทูต เลือกไพ่แลกเปลี่ยน`, 'action', state.turnNumber)],
  };
}

export function completeExchange(state: GameState, keptCardId: string, offeredHandCardId: string): GameState {
  const actor = state.players.find(p => p.id === state.pendingAction?.actorId)!;
  const drawnCards = state.exchangeCards ?? [];

  // Pool = [offered hand card, ...drawn cards]
  const offeredHandCard = actor.cards.find(c => c.id === offeredHandCardId);
  const allPoolCards = [...(offeredHandCard ? [offeredHandCard] : []), ...drawnCards];
  const keptCard = allPoolCards.find(c => c.id === keptCardId);
  const returnedCards = allPoolCards.filter(c => c.id !== keptCardId);

  let deck = state.deck;
  for (const card of returnedCards) {
    deck = returnCard(deck, card);
  }

  // New hand = revealed cards + unrevealed cards NOT offered + 1 kept card from pool
  const revealedCards = actor.cards.filter(c => c.revealed);
  const keptHandCards = actor.cards.filter(c => !c.revealed && c.id !== offeredHandCardId);
  const newHand = [...revealedCards, ...keptHandCards, ...(keptCard ? [keptCard] : [])];

  const updatedPlayers = state.players.map(p =>
    p.id === actor.id ? { ...p, cards: newHand } : p
  );

  return {
    ...state,
    players: updatedPlayers,
    deck,
    phase: 'RESOLVE',
    exchangeCards: undefined,
    exchangeHandCardIds: undefined,
    pendingAction: undefined,
    log: [...state.log, createLogEntry(`${actor.name} แลกไพ่ทูตเสร็จสิ้น`, 'action', state.turnNumber)],
  };
}

export function resolveAction(state: GameState): GameState {
  const { pendingAction } = state;
  let updatedPlayers = [...state.players];
  let logText = '';

  if (pendingAction) {
    const actor = updatedPlayers.find(p => p.id === pendingAction.actorId)!;
    const target = pendingAction.targetId ? updatedPlayers.find(p => p.id === pendingAction.targetId) : null;

    switch (pendingAction.type) {
      case 'foreign_aid':
        updatedPlayers = updatedPlayers.map(p => p.id === actor.id ? { ...p, coins: p.coins + 2 } : p);
        logText = `${actor.name} ได้รับ 2 เหรียญจากความช่วยเหลือ`;
        break;
      case 'tax':
        updatedPlayers = updatedPlayers.map(p => p.id === actor.id ? { ...p, coins: p.coins + 3 } : p);
        logText = `${actor.name} รับภาษี 3 เหรียญ`;
        break;
      case 'steal':
        if (target) {
          const stolen = Math.min(2, target.coins);
          updatedPlayers = updatedPlayers.map(p => {
            if (p.id === actor.id) return { ...p, coins: p.coins + stolen };
            if (p.id === target.id) return { ...p, coins: p.coins - stolen };
            return p;
          });
          logText = `${actor.name} ขโมย ${stolen} เหรียญจาก ${target.name}`;
        }
        break;
      case 'exchange':
        return startExchange(state);
    }
  }

  const living = updatedPlayers.filter(p => !p.isEliminated);
  if (living.length === 1) {
    return {
      ...state,
      players: updatedPlayers,
      phase: 'GAME_OVER',
      winner: living[0].id,
      pendingAction: undefined,
      log: logText ? [...state.log, createLogEntry(logText, 'action', state.turnNumber)] : state.log,
    };
  }

  return advanceTurn({
    ...state,
    players: updatedPlayers,
    phase: 'RESOLVE',
    pendingAction: undefined,
    log: logText ? [...state.log, createLogEntry(logText, 'action', state.turnNumber)] : state.log,
  });
}

function advanceTurn(state: GameState): GameState {
  const living = state.players.filter(p => !p.isEliminated);
  if (living.length <= 1) {
    return { ...state, phase: 'GAME_OVER', winner: living[0]?.id };
  }

  let nextIndex = (state.currentPlayerIndex + 1) % state.players.length;
  while (state.players[nextIndex].isEliminated) {
    nextIndex = (nextIndex + 1) % state.players.length;
  }

  return {
    ...state,
    currentPlayerIndex: nextIndex,
    phase: 'ACTION_SELECT',
    passedPlayerIds: [],
    turnNumber: state.turnNumber + 1,
  };
}
