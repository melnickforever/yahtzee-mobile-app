import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable, Animated } from 'react-native';
import Svg, { Rect, Circle, G } from 'react-native-svg';
import { Language, translations } from '../i18n';
import { Text, AnimatedText } from '../Text';

interface Props {
  language: Language;
  onEnterGame: () => void;
  gameActive: boolean;
}

const DICE_SIZE = 36;
const GAP = 6;
const PADDING = 6;
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

const DOTS = Array.from({ length: 13 });

export function DiceLogoV2({ language, onEnterGame, gameActive }: Props) {
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
      <Pressable onPress={handlePress} disabled={gameActive} style={styles.pressable}>

        {/* Top dot border */}
        <View style={styles.dotRow}>
          {DOTS.map((_, i) => <View key={i} style={styles.dot} />)}
        </View>

        {/* Upper ornamental rule */}
        <View style={styles.ruleRow}>
          <Text style={styles.ruleStar}>★</Text>
          <View style={styles.ruleLine} />
          <Text style={styles.ruleStar}>★</Text>
        </View>

        {/* Title */}
        <Text style={styles.titleText}>
          {translations[language].title.toUpperCase()}
        </Text>

        {/* Lower ornamental rule */}
        <View style={styles.ruleRow}>
          <Text style={styles.ruleStar}>★</Text>
          <View style={styles.ruleLine} />
          <Text style={styles.ruleStar}>★</Text>
        </View>

        {/* Dice */}
        <View style={styles.diceArea}>
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
        </View>

        {/* Bottom dot border */}
        <View style={styles.dotRow}>
          {DOTS.map((_, i) => <View key={i} style={styles.dot} />)}
        </View>

      </Pressable>

      {!hasRolled && !gameActive && (
        <Animated.View style={[styles.hint, { opacity: hintOpacity }]}>
          <AnimatedText style={[styles.hintArrow, { transform: [{ translateY: hintArrow }] }]}>↑</AnimatedText>
          <Text style={styles.hintText}>{' '}{translations[language].tapToRoll}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  pressable: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  dotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginVertical: 6,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#b5651d',
    opacity: 0.6,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 8,
    marginBottom: 6,
  },
  ruleLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#b5651d',
    opacity: 0.5,
  },
  ruleStar: {
    fontSize: 14,
    color: '#b5651d',
  },
  titleText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#4a1500',
    letterSpacing: 6,
    marginBottom: 6,
  },
  diceArea: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  hintArrow: {
    fontSize: 14,
    color: '#8b4513',
  },
  hintText: {
    fontSize: 13,
    color: '#8b4513',
    opacity: 0.7,
  },
});
