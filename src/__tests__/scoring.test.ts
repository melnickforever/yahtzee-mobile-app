import { upperTotal, lowerTotal, upperBonus, grandTotal, getFixedValue } from '../scoring';
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
