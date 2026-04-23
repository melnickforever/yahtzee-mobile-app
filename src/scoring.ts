import { CategoryKey, ScoresData } from './types';

const UPPER_CATEGORIES: CategoryKey[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
const LOWER_CATEGORIES: CategoryKey[] = ['threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee', 'chance'];

const FIXED_VALUES: Partial<Record<CategoryKey, number>> = {
  fullHouse: 25,
  smallStraight: 30,
  largeStraight: 40,
  yahtzee: 50,
};

export function upperTotal(scores: ScoresData): number {
  return UPPER_CATEGORIES.reduce((sum, cat) => sum + (scores[cat] ?? 0), 0);
}

export function lowerTotal(scores: ScoresData): number {
  return LOWER_CATEGORIES.reduce((sum, cat) => sum + (scores[cat] ?? 0), 0);
}

export function upperBonus(total: number): number {
  return total >= 63 ? 35 : 0;
}

export function grandTotal(scores: ScoresData, yahtzeeBonus: number): number {
  const ut = upperTotal(scores);
  return ut + upperBonus(ut) + lowerTotal(scores) + yahtzeeBonus;
}

export function getFixedValue(categoryKey: CategoryKey): number | null {
  return FIXED_VALUES[categoryKey] ?? null;
}
