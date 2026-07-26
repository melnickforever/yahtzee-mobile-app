import { upperTotal, lowerTotal, upperBonus, grandTotal, getFixedValue, getMaxValue, getStepValue, isValidEntry } from '../scoring';
import { CategoryKey } from '../types';
import { ScoresData } from '../types';

const empty: ScoresData = {
  ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
  threeOfAKind: null, fourOfAKind: null, fullHouse: null, smallStraight: null,
  largeStraight: null, yahtzee: null, chance: null,
};

describe('upperTotal', () => {
  it('returns 0 for all nulls', () => {
    expect(upperTotal(empty)).toBe(0);
  });

  it('sums upper categories ignoring nulls', () => {
    expect(upperTotal({ ...empty, ones: 3, twos: 6, sixes: 18 })).toBe(27);
  });

  it('ignores lower categories', () => {
    expect(upperTotal({ ...empty, threeOfAKind: 20, chance: 15 })).toBe(0);
  });

  it('returns 63 for max upper without bonus', () => {
    expect(upperTotal({ ...empty, ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18 })).toBe(63);
  });
});

describe('lowerTotal', () => {
  it('returns 0 for all nulls', () => {
    expect(lowerTotal(empty)).toBe(0);
  });

  it('sums lower categories ignoring nulls', () => {
    expect(lowerTotal({ ...empty, fullHouse: 25, largeStraight: 40, chance: 20 })).toBe(85);
  });

  it('ignores upper categories', () => {
    expect(lowerTotal({ ...empty, ones: 5, sixes: 18 })).toBe(0);
  });
});

describe('upperBonus', () => {
  it('returns 0 below threshold', () => {
    expect(upperBonus(62)).toBe(0);
    expect(upperBonus(0)).toBe(0);
  });

  it('returns 35 at exactly 63', () => {
    expect(upperBonus(63)).toBe(35);
  });

  it('returns 35 above 63', () => {
    expect(upperBonus(100)).toBe(35);
  });
});

describe('grandTotal', () => {
  it('returns 0 for empty scores and no bonus', () => {
    expect(grandTotal(empty, 0)).toBe(0);
  });

  it('includes upper bonus when threshold is met', () => {
    const scores = { ...empty, ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18 };
    expect(grandTotal(scores, 0)).toBe(63 + 35);
  });

  it('does not add upper bonus below threshold', () => {
    expect(grandTotal({ ...empty, ones: 3 }, 0)).toBe(3);
  });

  it('adds yahtzeeBonus to total', () => {
    expect(grandTotal(empty, 300)).toBe(300);
  });

  it('combines all parts correctly', () => {
    const scores = { ...empty, ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18, chance: 20 };
    expect(grandTotal(scores, 100)).toBe(63 + 35 + 20 + 100);
  });
});

describe('getFixedValue', () => {
  it('returns 25 for fullHouse', () => expect(getFixedValue('fullHouse')).toBe(25));
  it('returns 30 for smallStraight', () => expect(getFixedValue('smallStraight')).toBe(30));
  it('returns 40 for largeStraight', () => expect(getFixedValue('largeStraight')).toBe(40));
  it('returns 50 for yahtzee', () => expect(getFixedValue('yahtzee')).toBe(50));

  it('returns null for free-value categories', () => {
    expect(getFixedValue('ones')).toBeNull();
    expect(getFixedValue('threeOfAKind')).toBeNull();
    expect(getFixedValue('chance')).toBeNull();
  });
});

describe('getMaxValue', () => {
  it('returns 5x face value for upper categories', () => {
    expect(getMaxValue('ones')).toBe(5);
    expect(getMaxValue('twos')).toBe(10);
    expect(getMaxValue('threes')).toBe(15);
    expect(getMaxValue('fours')).toBe(20);
    expect(getMaxValue('fives')).toBe(25);
    expect(getMaxValue('sixes')).toBe(30);
  });

  it('returns 30 for free-value lower categories (5 dice x max face 6)', () => {
    expect(getMaxValue('threeOfAKind')).toBe(30);
    expect(getMaxValue('fourOfAKind')).toBe(30);
    expect(getMaxValue('chance')).toBe(30);
  });

  it('returns null for fixed-value categories', () => {
    expect(getMaxValue('fullHouse')).toBeNull();
    expect(getMaxValue('smallStraight')).toBeNull();
    expect(getMaxValue('largeStraight')).toBeNull();
    expect(getMaxValue('yahtzee')).toBeNull();
  });
});

describe('getStepValue', () => {
  it('returns the face value for upper categories', () => {
    expect(getStepValue('ones')).toBe(1);
    expect(getStepValue('twos')).toBe(2);
    expect(getStepValue('threes')).toBe(3);
    expect(getStepValue('fours')).toBe(4);
    expect(getStepValue('fives')).toBe(5);
    expect(getStepValue('sixes')).toBe(6);
  });

  it('returns null for free-value lower categories', () => {
    expect(getStepValue('threeOfAKind')).toBeNull();
    expect(getStepValue('fourOfAKind')).toBeNull();
    expect(getStepValue('chance')).toBeNull();
  });

  it('returns null for fixed-value categories', () => {
    expect(getStepValue('fullHouse')).toBeNull();
    expect(getStepValue('smallStraight')).toBeNull();
    expect(getStepValue('largeStraight')).toBeNull();
    expect(getStepValue('yahtzee')).toBeNull();
  });
});

describe('isValidEntry for upper section', () => {
  const upperCategories: CategoryKey[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];

  it.each(upperCategories)('accepts every multiple of the face value from 0 up to the max for %s', (category) => {
    const max = getMaxValue(category)!;
    const step = getStepValue(category)!;
    for (let value = 0; value <= max; value += step) {
      expect(isValidEntry(value, max, step)).toBe(true);
    }
  });

  it.each(upperCategories)('rejects values that are not a multiple of the face value for %s', (category) => {
    const max = getMaxValue(category)!;
    const step = getStepValue(category)!;
    for (let value = 1; value <= max; value++) {
      if (value % step === 0) continue;
      expect(isValidEntry(value, max, step)).toBe(false);
    }
  });

  it.each(upperCategories)('rejects values above the max for %s', (category) => {
    const max = getMaxValue(category)!;
    const step = getStepValue(category)!;
    expect(isValidEntry(max + step, max, step)).toBe(false);
  });

  it.each(upperCategories)('rejects negative values for %s', (category) => {
    const max = getMaxValue(category)!;
    const step = getStepValue(category)!;
    expect(isValidEntry(-step, max, step)).toBe(false);
  });
});
