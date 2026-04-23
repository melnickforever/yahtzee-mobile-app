import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { CategoryKey, Language, SavedGame, ScoresData } from './types';

const ALL_CATEGORY_KEYS: CategoryKey[] = [
  'ones', 'twos', 'threes', 'fours', 'fives', 'sixes',
  'threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee', 'chance',
];

export class InvalidGameFileError extends Error {
  constructor() {
    super('Invalid game file');
  }
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

export async function saveGame(state: SavedGame): Promise<void> {
  const now = new Date();
  const date = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  const time = `${pad2(now.getHours())}-${pad2(now.getMinutes())}-${pad2(now.getSeconds())}`;
  const filename = `yahtzee-${date}_${time}.json`;
  const uri = (FileSystem.cacheDirectory ?? '') + filename;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(state, null, 2));
  await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Save Yahtzee game' });
}

export async function openGame(): Promise<{ scores: ScoresData; yahtzeeBonus: number; name?: string; language?: Language } | null> {
  const res = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (res.canceled) return null;
  const text = await FileSystem.readAsStringAsync(res.assets[0].uri);
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new InvalidGameFileError();
  }
  if (!validateGameData(data)) throw new InvalidGameFileError();
  return data;
}
