import { Language } from './i18n';

export type { Language };

export type CategoryKey =
  | 'ones'
  | 'twos'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes'
  | 'threeOfAKind'
  | 'fourOfAKind'
  | 'fullHouse'
  | 'smallStraight'
  | 'largeStraight'
  | 'yahtzee'
  | 'chance';

export type ScoresData = Record<CategoryKey, number | null>;

export interface SavedGame {
  version: number;
  name: string;
  language: Language;
  scores: ScoresData;
  yahtzeeBonus: number;
  savedAt: string;
}

export interface PersistedState {
  scores: ScoresData;
  yahtzeeBonus: number;
  playerName: string;
  language: Language;
  expiresAt: number;
}
