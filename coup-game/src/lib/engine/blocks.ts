import { ActionType, CharacterName } from './types';
import { ACTION_BLOCKABLE_BY } from './constants';

export function canBlock(action: ActionType, character: CharacterName): boolean {
  const blockers = ACTION_BLOCKABLE_BY[action] ?? [];
  return blockers.includes(character);
}

export function getBlockableCharacters(action: ActionType): CharacterName[] {
  return ACTION_BLOCKABLE_BY[action] ?? [];
}

export function isBlockable(action: ActionType): boolean {
  return (ACTION_BLOCKABLE_BY[action]?.length ?? 0) > 0;
}
