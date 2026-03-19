import { ActionType, CharacterName } from './types';

export const ACTION_COSTS: Record<ActionType, number> = {
  income: 0,
  foreign_aid: 0,
  tax: 0,
  steal: 0,
  assassinate: 3,
  exchange: 0,
  coup: 7,
};

export const ACTION_REQUIRES_CHARACTER: Partial<Record<ActionType, CharacterName>> = {
  tax: 'Duke',
  steal: 'Captain',
  assassinate: 'Assassin',
  exchange: 'Ambassador',
};

export const ACTION_REQUIRES_TARGET: ActionType[] = ['steal', 'assassinate', 'coup'];

export const ACTION_BLOCKABLE_BY: Partial<Record<ActionType, CharacterName[]>> = {
  foreign_aid: ['Duke'],
  steal: ['Captain', 'Ambassador'],
  assassinate: ['Contessa'],
};

export const CHARACTER_DESCRIPTIONS: Record<CharacterName, string> = {
  Duke: 'รับ 3 เหรียญ (ภาษี) สกัดความช่วยเหลือต่างประเทศ',
  Assassin: 'จ่าย 3 เหรียญเพื่อลอบสังหารผู้เล่น',
  Captain: 'ขโมย 2 เหรียญจากผู้เล่นอื่น สกัดการขโมย',
  Ambassador: 'จั่ว 2 ใบ เก็บ 2 ใบ สกัดการขโมย',
  Contessa: 'สกัดการลอบสังหาร',
};

export const CHARACTER_COLORS: Record<CharacterName, string> = {
  Duke: '#7c3aed',
  Assassin: '#dc2626',
  Captain: '#2563eb',
  Ambassador: '#16a34a',
  Contessa: '#e11d48',
};

export const MUST_COUP_COINS = 10;
export const STARTING_COINS = 2;
export const STARTING_CARDS = 2;
export const CARDS_PER_CHARACTER = 3;
export const CHARACTERS: CharacterName[] = ['Duke', 'Assassin', 'Captain', 'Ambassador', 'Contessa'];
