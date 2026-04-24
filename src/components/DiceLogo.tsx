import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Animated } from 'react-native';
import Svg, { Rect, Circle, G } from 'react-native-svg';
import { Language, translations } from '../i18n';

interface Props {
  language: Language;
  onEnterGame: () => void;
  gameActive: boolean;
}

const DICE_SIZE = 36;
const GAP = 6;
const PADDING = 4;
const CORNER_RADIUS = 5;

const pipPositions: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
};

function randomFace(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function DiceLogo({ language, onEnterGame, gameActive }: Props) {
  const [faces, setFaces] = useState([1, 2, 3, 4, 5]);
  const [rolling, setRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);

  const bounceAnim = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(1)).current;
  const hintArrow = useRef(new Animated.Value(0)).current;
  const pressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pressIntervalRef.current !== null) clearInterval(pressIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!gameActive) setHasRolled(false);
  }, [gameActive]);

  useEffect(() => {
    if (hasRolled || gameActive) return;

    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -2, duration: 1250, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1250, useNativeDriver: true }),
      ])
    );
    bounce.start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(hintOpacity, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(hintOpacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();

    const arrow = Animated.loop(
      Animated.sequence([
        Animated.timing(hintArrow, { toValue: -3, duration: 500, useNativeDriver: true }),
        Animated.timing(hintArrow, { toValue: 0, duration: 500, useNativeDriver: true }),
      ])
    );
    arrow.start();

    return () => {
      bounce.stop();
      pulse.stop();
      arrow.stop();
    };
  }, [hasRolled, gameActive, bounceAnim, hintOpacity, hintArrow]);

  const handlePress = useCallback(() => {
    if (rolling || gameActive) return;
    setRolling(true);
    setHasRolled(true);
    let count = 0;
    pressIntervalRef.current = setInterval(() => {
      setFaces(Array.from({ length: 5 }, randomFace));
      count++;
      if (count >= 8) {
        clearInterval(pressIntervalRef.current!);
        pressIntervalRef.current = null;
        setRolling(false);
        onEnterGame();
      }
    }, 80);
  }, [rolling, gameActive, onEnterGame]);

  const totalWidth = DICE_SIZE * 5 + GAP * 4;
  const svgWidth = totalWidth + PADDING * 2;
  const svgHeight = DICE_SIZE + PADDING * 2;
  const pipRadius = DICE_SIZE * 0.08;

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={handlePress} disabled={gameActive}>
        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <Svg width={svgWidth} height={svgHeight}>
            {faces.map((face, i) => {
              const x = PADDING + i * (DICE_SIZE + GAP);
              const y = PADDING;
              const rotation = (i - 2) * 4;
              const cx = x + DICE_SIZE / 2;
              const cy = y + DICE_SIZE / 2;
              return (
                <G key={i} rotation={rotation} origin={`${cx}, ${cy}`}>
                  <Rect
                    x={x} y={y} width={DICE_SIZE} height={DICE_SIZE}
                    rx={CORNER_RADIUS} ry={CORNER_RADIUS}
                    fill="#faf3e0" stroke="#8b4513" strokeWidth={1.5}
                  />
                  {pipPositions[face].map(([px, py], j) => (
                    <Circle key={j} cx={x + px * DICE_SIZE} cy={y + py * DICE_SIZE} r={pipRadius} fill="#5a2d0c" />
                  ))}
                </G>
              );
            })}
          </Svg>
        </Animated.View>
      </Pressable>

      {!hasRolled && !gameActive && (
        <Animated.View style={[styles.hint, { opacity: hintOpacity }]}>
          <Animated.Text style={[styles.hintArrow, { transform: [{ translateY: hintArrow }] }]}>↑</Animated.Text>
          <Text style={styles.hintText}> {translations[language].tapToRoll}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  hintArrow: {
    fontSize: 12,
    color: '#8b4513',
  },
  hintText: {
    fontSize: 12,
    color: '#8b4513',
    opacity: 0.7,
  },
});
