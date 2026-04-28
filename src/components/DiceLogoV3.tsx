import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Animated } from 'react-native';
import Svg, { Rect, Circle, G } from 'react-native-svg';
import { Language, translations } from '../i18n';
import { useFonts, Lexend_800ExtraBold, Lexend_400Regular } from '@expo-google-fonts/lexend';

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

export function DiceLogoV3({ language, onEnterGame, gameActive }: Props) {
  const [faces, setFaces] = useState([1, 2, 3, 4, 5]);
  const [rolling, setRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);

  const [fontsLoaded] = useFonts({ Lexend_800ExtraBold, Lexend_400Regular });

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
      <View style={styles.outerFrame}>
        {/* Inner gold rule on outer frame top */}
        <View style={styles.goldAccentTop} />

        <Pressable onPress={handlePress} disabled={gameActive} style={styles.innerFrame}>
          {/* Title banner */}
          <View style={styles.titleBanner}>
            <Text style={styles.diamond}>◆</Text>
            <Text style={[
              styles.titleText,
              fontsLoaded ? { fontFamily: 'Lexend_800ExtraBold' } : { fontWeight: '900' },
            ]}>
              {translations[language].title.toUpperCase()}
            </Text>
            <Text style={styles.diamond}>◆</Text>
          </View>

          {/* Double-rule separator */}
          <View style={styles.doubleRuleWrap}>
            <View style={styles.ruleThick} />
            <View style={styles.ruleGap} />
            <View style={styles.ruleThin} />
          </View>

          {/* Dice area */}
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
                        fill="#f0f4ff" stroke="#1e3a5f" strokeWidth={1.5}
                      />
                      {pipPositions[face].map(([px, py], j) => (
                        <Circle key={j} cx={x + px * DICE_SIZE} cy={y + py * DICE_SIZE} r={pipRadius} fill="#0d2240" />
                      ))}
                    </G>
                  );
                })}
              </Svg>
            </Animated.View>
          </View>

          {/* Bottom double-rule */}
          <View style={styles.doubleRuleWrap}>
            <View style={styles.ruleThin} />
            <View style={styles.ruleGap} />
            <View style={styles.ruleThick} />
          </View>
          <View style={styles.bottomPad} />
        </Pressable>

        {/* Inner gold rule on outer frame bottom */}
        <View style={styles.goldAccentBottom} />
      </View>

      {!hasRolled && !gameActive && (
        <Animated.View style={[styles.hint, { opacity: hintOpacity }]}>
          <Animated.Text style={[styles.hintArrow, { transform: [{ translateY: hintArrow }] }]}>↑</Animated.Text>
          <Text style={[
            styles.hintText,
            fontsLoaded ? { fontFamily: 'Lexend_400Regular' } : {},
          ]}>
            {' '}{translations[language].tapToRoll}
          </Text>
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
  outerFrame: {
    backgroundColor: '#1e3a5f',
    borderRadius: 14,
    padding: 3,
    shadowColor: '#0a1a30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  goldAccentTop: {
    height: 3,
    backgroundColor: '#c8a84b',
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    marginBottom: 1,
  },
  goldAccentBottom: {
    height: 3,
    backgroundColor: '#c8a84b',
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
    marginTop: 1,
  },
  innerFrame: {
    backgroundColor: '#f7f4ee',
    alignItems: 'center',
  },
  titleBanner: {
    backgroundColor: '#0d2240',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    paddingVertical: 10,
    paddingHorizontal: 22,
    gap: 12,
  },
  diamond: {
    fontSize: 12,
    color: '#c8a84b',
  },
  titleText: {
    fontSize: 28,
    color: '#c8a84b',
    letterSpacing: 5,
  },
  doubleRuleWrap: {
    alignSelf: 'stretch',
    marginHorizontal: 14,
    marginVertical: 6,
    gap: 2,
  },
  ruleThick: {
    height: 2,
    backgroundColor: '#1e3a5f',
    opacity: 0.35,
  },
  ruleGap: {
    height: 2,
  },
  ruleThin: {
    height: 1,
    backgroundColor: '#1e3a5f',
    opacity: 0.2,
  },
  diceArea: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  bottomPad: {
    height: 4,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  hintArrow: {
    fontSize: 14,
    color: '#1e3a5f',
  },
  hintText: {
    fontSize: 13,
    color: '#1e3a5f',
    opacity: 0.6,
  },
});
