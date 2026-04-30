jest.mock('expo-sharing');
jest.mock('expo-document-picker');

import { validateGameData } from '../fileIO';

const validScores = {
  ones: 3, twos: null, threes: 9, fours: null, fives: null, sixes: null,
  threeOfAKind: null, fourOfAKind: null, fullHouse: 25, smallStraight: null,
  largeStraight: null, yahtzee: null, chance: null,
};

describe('validateGameData', () => {
  it('accepts valid data', () => {
    expect(validateGameData({ scores: validScores, yahtzeeBonus: 0 })).toBe(true);
  });

  it('accepts optional name and language', () => {
    expect(validateGameData({ scores: validScores, yahtzeeBonus: 200, name: 'Test', language: 'en' })).toBe(true);
    expect(validateGameData({ scores: validScores, yahtzeeBonus: 200, language: 'uk' })).toBe(true);
  });

  it('accepts yahtzeeBonus in multiples of 100 up to 1000', () => {
    for (let b = 0; b <= 1000; b += 100) {
      expect(validateGameData({ scores: validScores, yahtzeeBonus: b })).toBe(true);
    }
  });

  it('rejects null and non-objects', () => {
    expect(validateGameData(null)).toBe(false);
    expect(validateGameData('string')).toBe(false);
    expect(validateGameData(42)).toBe(false);
  });

  it('rejects missing scores field', () => {
    expect(validateGameData({ yahtzeeBonus: 0 })).toBe(false);
  });

  it('rejects missing score category', () => {
    const { ones, ...rest } = validScores;
    expect(validateGameData({ scores: rest, yahtzeeBonus: 0 })).toBe(false);
  });

  it('rejects score value that is not number or null', () => {
    expect(validateGameData({ scores: { ...validScores, ones: 'bad' }, yahtzeeBonus: 0 })).toBe(false);
  });

  it('rejects yahtzeeBonus out of range', () => {
    expect(validateGameData({ scores: validScores, yahtzeeBonus: -100 })).toBe(false);
    expect(validateGameData({ scores: validScores, yahtzeeBonus: 1100 })).toBe(false);
  });

  it('rejects yahtzeeBonus not a multiple of 100', () => {
    expect(validateGameData({ scores: validScores, yahtzeeBonus: 150 })).toBe(false);
    expect(validateGameData({ scores: validScores, yahtzeeBonus: 1 })).toBe(false);
  });

  it('rejects invalid language value', () => {
    expect(validateGameData({ scores: validScores, yahtzeeBonus: 0, language: 'fr' })).toBe(false);
  });

  it('rejects non-string name', () => {
    expect(validateGameData({ scores: validScores, yahtzeeBonus: 0, name: 123 })).toBe(false);
  });
});
