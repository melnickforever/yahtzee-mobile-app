import * as FileSystem from 'expo-file-system/legacy';
import { CategoryKey, Language, SavedGame, ScoresData } from './types';

const ALL_CATEGORY_KEYS: CategoryKey[] = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee', 'chance',
];

const SAVES_DIR = `${FileSystem.documentDirectory ?? ''}saves/`;

export class InvalidGameFileError extends Error {
  constructor() {
    super('Invalid game file');
  }
}

export interface SaveSlot {
  filename: string;
  label: string;
}

export function validateGameData(data: unknown): data is { scores: ScoresData; yahtzeeBonus: number; name?: string; language?: Language } {
  if (typeof data !== 'object' || data === null) return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.scores !== 'object' || obj.scores === null) return false;
  const s = obj.scores as Record<string, unknown>;
  for (const key of ALL_CATEGORY_KEYS) {
    if (!(key in s)) return false;
    if (s[key] !== null && typeof s[key] !== 'number') return false;
  }

  if (typeof obj.yahtzeeBonus !== 'number') return false;
  if (obj.yahtzeeBonus < 0 || obj.yahtzeeBonus > 1000 || obj.yahtzeeBonus % 100 !== 0) return false;

  if ('language' in obj && obj.language !== 'uk' && obj.language !== 'en') return false;
  if ('name' in obj && typeof obj.name !== 'string') return false;

  return true;
}

function pad2(n: number): string {
  return n.toString().padStart(2, '0');
}

function sanitizeForFilename(name: string): string {
  return name.trim().replace(/[\\/:*?"<>|]+/g, '_');
}

async function ensureSavesDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(SAVES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(SAVES_DIR, { intermediates: true });
  }
}

export function generateSlotFilename(playerName: string, now: Date = new Date()): string {
  const namePart = sanitizeForFilename(playerName) || 'Save';
  const date = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  const time = `${pad2(now.getHours())}-${pad2(now.getMinutes())}-${pad2(now.getSeconds())}`;
  return `${namePart}-${date}.${time}.json`;
}

export async function listSaveSlots(): Promise<SaveSlot[]> {
  await ensureSavesDir();
  const files = (await FileSystem.readDirectoryAsync(SAVES_DIR)).filter((f) => f.endsWith('.json'));
  const withInfo = await Promise.all(files.map(async (filename) => {
    const info = await FileSystem.getInfoAsync(SAVES_DIR + filename);
    const modificationTime = info.exists && !info.isDirectory ? (info as unknown as { modificationTime?: number }).modificationTime ?? 0 : 0;
    return { filename, modificationTime };
  }));
  withInfo.sort((a, b) => b.modificationTime - a.modificationTime);
  return withInfo.map(({ filename }) => ({ filename, label: filename.replace(/\.json$/, '') }));
}

export async function writeSaveSlot(filename: string, state: SavedGame): Promise<void> {
  await ensureSavesDir();
  await FileSystem.writeAsStringAsync(SAVES_DIR + filename, JSON.stringify(state, null, 2));
}

export async function loadSaveSlot(filename: string): Promise<{ scores: ScoresData; yahtzeeBonus: number; name?: string; language?: Language }> {
  const text = await FileSystem.readAsStringAsync(SAVES_DIR + filename);
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new InvalidGameFileError();
  }
  if (!validateGameData(data)) throw new InvalidGameFileError();
  return data;
}

export async function deleteSaveSlot(filename: string): Promise<void> {
  await FileSystem.deleteAsync(SAVES_DIR + filename, { idempotent: true });
}
