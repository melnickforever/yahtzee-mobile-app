import {
  validateGameData,
  generateSlotFilename,
  listSaveSlots,
  writeSaveSlot,
  loadSaveSlot,
  deleteSaveSlot,
  InvalidGameFileError,
} from '../fileIO';
import { SavedGame } from '../types';
import * as FileSystemMock from 'expo-file-system/legacy';

const mockFs = FileSystemMock as unknown as {
  documentDirectory: string;
  writeAsStringAsync: (uri: string, content: string) => Promise<void>;
  __reset: () => void;
};

const SAVES_DIR = `${mockFs.documentDirectory}saves/`;

const validScores = {
  ones: 3, twos: null, threes: 9, fours: null, fives: null, sixes: null,
  threeOfAKind: null, fourOfAKind: null, fullHouse: 25, smallStraight: null,
  largeStraight: null, yahtzee: null, chance: null,
};

function makeSavedGame(overrides: Partial<SavedGame> = {}): SavedGame {
  return {
    version: 1,
    name: 'Alice',
    language: 'en',
    scores: validScores,
    yahtzeeBonus: 0,
    savedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

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

describe('generateSlotFilename', () => {
  it('combines the player name and score', () => {
    expect(generateSlotFilename('Alice', 152)).toBe('Alice-152.json');
  });

  it('falls back to "Save" when the player name is blank', () => {
    expect(generateSlotFilename('', 0)).toBe('Save-0.json');
    expect(generateSlotFilename('   ', 30)).toBe('Save-30.json');
  });

  it('sanitizes filesystem-unsafe characters in the name', () => {
    expect(generateSlotFilename('Bob/Slash:Colon', 10)).toBe('Bob_Slash_Colon-10.json');
  });

  it('returns the base name when there is no collision', () => {
    expect(generateSlotFilename('Alice', 152, ['Someone-1.json'])).toBe('Alice-152.json');
  });

  it('appends a numeric suffix when the name/score combination already exists', () => {
    expect(generateSlotFilename('Alice', 152, ['Alice-152.json'])).toBe('Alice-152 (2).json');
  });

  it('keeps incrementing the suffix past the first collision', () => {
    expect(generateSlotFilename('Alice', 152, ['Alice-152.json', 'Alice-152 (2).json'])).toBe('Alice-152 (3).json');
  });
});

describe('save slot file operations', () => {
  beforeEach(() => {
    mockFs.__reset();
  });

  it('writes and lists a save slot', async () => {
    await writeSaveSlot('Alice-100.json', makeSavedGame({ name: 'Alice', yahtzeeBonus: 100 }));
    const slots = await listSaveSlots();
    expect(slots).toEqual([{ filename: 'Alice-100.json', label: 'Alice-100' }]);
  });

  it('returns an empty list when no slots exist', async () => {
    expect(await listSaveSlots()).toEqual([]);
  });

  it('sorts slots by most recently written first', async () => {
    await writeSaveSlot('First-10.json', makeSavedGame());
    await writeSaveSlot('Second-20.json', makeSavedGame());
    const slots = await listSaveSlots();
    expect(slots.map((s) => s.filename)).toEqual(['Second-20.json', 'First-10.json']);
  });

  it('loads a previously written slot back exactly', async () => {
    const game = makeSavedGame({ name: 'Bob', yahtzeeBonus: 200 });
    await writeSaveSlot('Bob-88.json', game);
    const loaded = await loadSaveSlot('Bob-88.json');
    expect(loaded).toEqual(game);
  });

  it('overwrites a slot when writing the same filename twice', async () => {
    await writeSaveSlot('Alice-0.json', makeSavedGame({ yahtzeeBonus: 0 }));
    await writeSaveSlot('Alice-0.json', makeSavedGame({ yahtzeeBonus: 300 }));
    const loaded = await loadSaveSlot('Alice-0.json');
    expect(loaded.yahtzeeBonus).toBe(300);
    expect(await listSaveSlots()).toHaveLength(1);
  });

  it('throws InvalidGameFileError for corrupt JSON', async () => {
    await mockFs.writeAsStringAsync(`${SAVES_DIR}bad.json`, 'not valid json');
    await expect(loadSaveSlot('bad.json')).rejects.toBeInstanceOf(InvalidGameFileError);
  });

  it('throws InvalidGameFileError for structurally invalid data', async () => {
    await mockFs.writeAsStringAsync(`${SAVES_DIR}invalid.json`, JSON.stringify({ foo: 'bar' }));
    await expect(loadSaveSlot('invalid.json')).rejects.toBeInstanceOf(InvalidGameFileError);
  });

  it('deletes a slot', async () => {
    await writeSaveSlot('ToDelete-5.json', makeSavedGame());
    await deleteSaveSlot('ToDelete-5.json');
    expect(await listSaveSlots()).toEqual([]);
  });

  it('is idempotent when deleting a non-existent slot', async () => {
    await expect(deleteSaveSlot('does-not-exist.json')).resolves.toBeUndefined();
  });
});
