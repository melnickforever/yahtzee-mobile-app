import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable, BackHandler } from 'react-native';
import { Text } from '../Text';
import Svg, { Rect, Circle } from 'react-native-svg';
import { Language, translations } from '../i18n';

interface Props {
  language: Language;
  onExit: () => void;
}

const DICE_SIZE = 46;
const GAP = 8;
const PADDING = 2;
const CORNER_RADIUS = 6;
const MAX_ROLLS = 3;
const SVG_SIZE = DICE_SIZE + PADDING * 2;
const PIP_R = DICE_SIZE * 0.08;

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

interface DieProps {
  face: number;
  body: string;
  border: string;
  pip: string;
  onPress: () => void;
}

function Die({ face, body, border, pip, onPress }: DieProps) {
  return (
    <Pressable onPress={onPress} hitSlop={4}>
      <Svg width={SVG_SIZE} height={SVG_SIZE}>
        <Rect
          x={PADDING} y={PADDING}
          width={DICE_SIZE} height={DICE_SIZE}
          rx={CORNER_RADIUS} ry={CORNER_RADIUS}
          fill={body} stroke={border} strokeWidth={1.5}
        />
        {pipPositions[face].map(([px, py], j) => (
          <Circle
            key={j}
            cx={PADDING + px * DICE_SIZE}
            cy={PADDING + py * DICE_SIZE}
            r={PIP_R}
            fill={pip}
          />
        ))}
      </Svg>
    </Pressable>
  );
}

export function DiceGame({ language, onExit }: Props) {
  const t = translations[language];

  const [gameDice, setGameDice] = useState<number[]>(() => Array.from({ length: 5 }, randomFace));
  const [kept, setKept] = useState<boolean[]>([false, false, false, false, false]);
  const [rollCount, setRollCount] = useState(1);
  const [rolling, setRolling] = useState(false);

  const rollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current !== null) clearInterval(rollIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      setGameDice(Array.from({ length: 5 }, randomFace));
      count++;
      if (count >= 8) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      onExit();
      return true;
    });
    return () => handler.remove();
  }, [onExit]);

  const handleRoll = useCallback(() => {
    if (rollCount >= MAX_ROLLS || rolling) return;
    if (kept.every(Boolean)) return;
    setRolling(true);
    setRollCount((c) => c + 1);
    let count = 0;
    const keptSnapshot = [...kept];
    rollIntervalRef.current = setInterval(() => {
      setGameDice((prev) => prev.map((val, i) => (keptSnapshot[i] ? val : randomFace())));
      count++;
      if (count >= 8) {
        clearInterval(rollIntervalRef.current!);
        rollIntervalRef.current = null;
        setRolling(false);
      }
    }, 80);
  }, [rollCount, rolling, kept]);

  const toggleKeep = useCallback((index: number) => {
    if (rolling) return;
    setKept((prev) => prev.map((v, i) => (i === index ? !v : v)));
  }, [rolling]);

  const handleNewTurn = useCallback(() => {
    if (rollIntervalRef.current !== null) clearInterval(rollIntervalRef.current);
    setKept([false, false, false, false, false]);
    setRollCount(1);
    setRolling(true);
    let count = 0;
    rollIntervalRef.current = setInterval(() => {
      setGameDice(Array.from({ length: 5 }, randomFace));
      count++;
      if (count >= 8) {
        clearInterval(rollIntervalRef.current!);
        rollIntervalRef.current = null;
        setRolling(false);
      }
    }, 80);
  }, []);

  const freeDice = gameDice.map((v, i) => ({ value: v, index: i })).filter((_, i) => !kept[i]);
  const keptDice = gameDice.map((v, i) => ({ value: v, index: i })).filter((_, i) => kept[i]);
  const canRoll = rollCount < MAX_ROLLS && !rolling && freeDice.length > 0;

  const rollBtnLabel = rolling || canRoll
    ? t.game.roll
    : freeDice.length === 0
      ? t.game.allKept
      : t.game.noRolls;

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <View style={styles.rollCounter}>
          <Text style={styles.rollCounterText}>
            {t.game.rollCount} {rollCount} {t.game.of} {MAX_ROLLS}
          </Text>
        </View>
        <View style={styles.buttons}>
          <Pressable
            onPress={handleRoll}
            disabled={!canRoll}
            style={({ pressed }) => [
              styles.btn, styles.btnRoll,
              !canRoll && styles.btnDisabled,
              pressed && canRoll && styles.btnRollPressed,
            ]}
          >
            <Text style={[styles.btnText, !canRoll && styles.btnTextDisabled]}>{rollBtnLabel}</Text>
          </Pressable>
          <Pressable
            onPress={handleNewTurn}
            style={({ pressed }) => [styles.btn, styles.btnNew, pressed && styles.btnNewPressed]}
          >
            <Text style={styles.btnText}>{t.game.newTurn}</Text>
          </Pressable>
          <Pressable
            onPress={onExit}
            style={({ pressed }) => [styles.btn, styles.btnExit, pressed && styles.btnExitPressed]}
          >
            <Text style={styles.btnExitText}>{t.game.exit}</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.diceArea, styles.diceAreaFree]}>
        {freeDice.length > 0 ? (
          <View style={styles.diceRow}>
            {freeDice.map((d) => (
              <Die
                key={d.index}
                face={d.value}
                body="#faf3e0"
                border="#8b4513"
                pip="#5a2d0c"
                onPress={() => toggleKeep(d.index)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>{t.game.allKept}</Text>
        )}
      </View>

      <View style={[styles.diceArea, styles.diceAreaKept]}>
        <Text style={styles.keptLabel}>{t.game.kept}</Text>
        {keptDice.length > 0 ? (
          <View style={styles.diceRow}>
            {keptDice.map((d) => (
              <Die
                key={d.index}
                face={d.value}
                body="#e8dcc6"
                border="#6b3410"
                pip="#5a2d0c"
                onPress={() => toggleKeep(d.index)}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>{t.game.empty}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fdf6e3',
    borderWidth: 2,
    borderColor: '#8b4513',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#3b2f1e',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  controls: {
    alignItems: 'stretch',
    gap: 8,
    marginBottom: 12,
  },
  rollCounter: {
    backgroundColor: '#e8dcc6',
    borderWidth: 1,
    borderColor: '#d4c5a0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  rollCounterText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c1810',
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRoll: {
    backgroundColor: '#2d6b3f',
    borderColor: '#1e5430',
  },
  btnRollPressed: {
    backgroundColor: '#367a4a',
    transform: [{ scale: 0.97 }],
  },
  btnNew: {
    backgroundColor: '#8b4513',
    borderColor: '#6b3410',
  },
  btnNewPressed: {
    backgroundColor: '#a0522d',
    transform: [{ scale: 0.97 }],
  },
  btnExit: {
    backgroundColor: 'transparent',
    borderColor: '#8b4513',
  },
  btnExitPressed: {
    backgroundColor: '#f0e8d4',
    transform: [{ scale: 0.97 }],
  },
  btnDisabled: {
    backgroundColor: '#b5a88a',
    borderColor: '#a09680',
    opacity: 0.7,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fdf6e3',
    textAlign: 'center',
  },
  btnTextDisabled: {
    color: '#fdf6e3',
  },
  btnExitText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8b4513',
    textAlign: 'center',
  },
  diceArea: {
    borderRadius: 10,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  diceAreaFree: {
    backgroundColor: '#fffef8',
    borderWidth: 2,
    borderColor: '#c4b590',
    borderStyle: 'dashed',
  },
  diceAreaKept: {
    backgroundColor: '#f0e8d4',
    borderWidth: 2,
    borderColor: '#c4b590',
  },
  diceRow: {
    flexDirection: 'row',
    gap: GAP,
    justifyContent: 'center',
  },
  keptLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8b4513',
    textTransform: 'uppercase',
    letterSpacing: 0.72,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#a09680',
    paddingVertical: 12,
  },
});
