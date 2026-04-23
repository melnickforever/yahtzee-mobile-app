import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersistedState } from './types';

const KEY = 'yahtzee-game-state';
const EXPIRY_MS = 86_400_000;

export async function loadGameState(): Promise<PersistedState | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return null;
    const data: PersistedState = JSON.parse(raw);
    if (data.expiresAt <= Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function saveGameState(state: Omit<PersistedState, 'expiresAt'>): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify({
      ...state,
      expiresAt: Date.now() + EXPIRY_MS,
    }));
  } catch {
    // ignore storage full
  }
}
