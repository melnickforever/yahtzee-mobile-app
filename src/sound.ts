import { useCallback } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { AudioSource } from 'expo-audio';

const logoSource = require('../assets/sounds/dice-roll.mp3');
const rollButtonSource = require('../assets/sounds/dice-roll-button.mp3');

function usePlaySound(source: AudioSource, enabled: boolean) {
  const player = useAudioPlayer(source);

  return useCallback(async () => {
    if (!enabled) return;
    await player.seekTo(0);
    player.play();
  }, [player, enabled]);
}

export function useDiceLogoSound(enabled: boolean = true) {
  return usePlaySound(logoSource, enabled);
}

export function useDiceRollSound(enabled: boolean = true) {
  return usePlaySound(rollButtonSource, enabled);
}
