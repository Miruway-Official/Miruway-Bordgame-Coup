import { Card } from './types';
import { CHARACTERS, CARDS_PER_CHARACTER } from './constants';

export function createDeck(): Card[] {
  const cards: Card[] = [];
  let id = 0;
  for (const character of CHARACTERS) {
    for (let i = 0; i < CARDS_PER_CHARACTER; i++) {
      cards.push({ id: `card-${id++}`, character, revealed: false });
    }
  }
  return shuffle(cards);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function drawCard(deck: Card[]): { card: Card; remaining: Card[] } {
  if (deck.length === 0) throw new Error('Deck is empty');
  const [card, ...remaining] = deck;
  return { card, remaining };
}

export function returnCard(deck: Card[], card: Card): Card[] {
  const resetCard = { ...card, revealed: false };
  return shuffle([...deck, resetCard]);
}
