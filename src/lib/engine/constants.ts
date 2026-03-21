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
  tax: 'เจ้าพยา',
  steal: 'จอมโจร',
  assassinate: 'นักฆ่า',
  exchange: 'ทูต',
};

export const ACTION_REQUIRES_TARGET: ActionType[] = ['steal', 'assassinate', 'coup'];

export const ACTION_BLOCKABLE_BY: Partial<Record<ActionType, CharacterName[]>> = {
  foreign_aid: ['เจ้าพยา'],
  steal: ['จอมโจร', 'ทูต'],
  assassinate: ['รัชทายาท'],
};

export const CHARACTER_DESCRIPTIONS: Record<CharacterName, string> = {
  'เจ้าพยา': 'รับ 3 เหรียญ (ภาษี) สกัดความช่วยเหลือต่างประเทศ',
  'นักฆ่า': 'จ่าย 3 เหรียญเพื่อลอบสังหารผู้เล่น',
  'จอมโจร': 'ขโมย 2 เหรียญจากผู้เล่นอื่น สกัดการขโมย',
  'ทูต': 'เลือก 1 ใบจากมือ + จั่ว 2 ใบ → เก็บ 1 ใบ คืนที่เหลือ สกัดการขโมย',
  'รัชทายาท': 'สกัดการลอบสังหาร',
};

export const CHARACTER_COLORS: Record<CharacterName, string> = {
  'เจ้าพยา': '#7c3aed',
  'นักฆ่า': '#dc2626',
  'จอมโจร': '#2563eb',
  'ทูต': '#16a34a',
  'รัชทายาท': '#e11d48',
};

export const MUST_COUP_COINS = 10;
export const STARTING_COINS = 2;
export const STARTING_CARDS = 2;
export const CARDS_PER_CHARACTER = 3;
export const CHARACTERS: CharacterName[] = ['เจ้าพยา', 'นักฆ่า', 'จอมโจร', 'ทูต', 'รัชทายาท'];
