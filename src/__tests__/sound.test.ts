import React from 'react';
import { act, create } from 'react-test-renderer';
import { useAudioPlayer } from 'expo-audio';
import { useDiceLogoSound, useDiceRollSound } from '../sound';

jest.mock('expo-audio', () => ({
  useAudioPlayer: jest.fn(),
}));

const mockUseAudioPlayer = useAudioPlayer as jest.Mock;

function renderHook<T>(hook: () => T): { current: T } {
  const result: { current: T | null } = { current: null };
  function TestComponent() {
    result.current = hook();
    return null;
  }
  act(() => {
    create(React.createElement(TestComponent));
  });
  return result as { current: T };
}

function makeMockPlayer() {
  return { seekTo: jest.fn().mockResolvedValue(undefined), play: jest.fn() };
}

beforeEach(() => {
  mockUseAudioPlayer.mockReset();
});

describe('useDiceLogoSound', () => {
  it('seeks to the start before playing', async () => {
    const mockPlayer = makeMockPlayer();
    mockUseAudioPlayer.mockReturnValue(mockPlayer);

    const play = renderHook(() => useDiceLogoSound()).current;
    await act(async () => {
      await play();
    });

    expect(mockPlayer.seekTo).toHaveBeenCalledWith(0);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
    expect(mockPlayer.seekTo.mock.invocationCallOrder[0]).toBeLessThan(
      mockPlayer.play.mock.invocationCallOrder[0]
    );
  });
});

describe('useDiceRollSound', () => {
  it('seeks to the start before playing', async () => {
    const mockPlayer = makeMockPlayer();
    mockUseAudioPlayer.mockReturnValue(mockPlayer);

    const play = renderHook(() => useDiceRollSound()).current;
    await act(async () => {
      await play();
    });

    expect(mockPlayer.seekTo).toHaveBeenCalledWith(0);
    expect(mockPlayer.play).toHaveBeenCalledTimes(1);
  });
});

describe('useDiceLogoSound and useDiceRollSound', () => {
  it('each load their own audio player instance', () => {
    mockUseAudioPlayer.mockReturnValue(makeMockPlayer());

    renderHook(() => useDiceLogoSound());
    renderHook(() => useDiceRollSound());

    expect(mockUseAudioPlayer).toHaveBeenCalledTimes(2);
  });
});
