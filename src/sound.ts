import { useCallback } from 'react';
import { useAudioPlayer } from 'expo-audio';
import { AudioSource } from 'expo-audio';

const logoSource = require('../assets/sounds/dice-roll.mp3');
const rollButtonSource = require('../assets/sounds/dice-roll-button.mp3');

function usePlaySound(source: AudioSource) {
  const player = useAudioPlayer(source);

  return useCallback(async () => {
    await player.seekTo(0);
    player.play();
  }, [player]);
}

export function useDiceLogoSound() {
  return usePlaySound(logoSource);
}

export function useDiceRollSound() {
  return usePlaySound(rollButtonSource);
}
