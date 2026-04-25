import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Language, translations } from '../i18n';
import { CategoryKey, ScoresData } from '../types';
import { upperTotal, lowerTotal, upperBonus, grandTotal, getFixedValue } from '../scoring';
import { saveGame, openGame, InvalidGameFileError } from '../fileIO';
import { ScoreCell } from './ScoreCell';
import { YahtzeeBonusCell } from './YahtzeeBonusCell';

interface Props {
  language: Language;
  scores: ScoresData;
  onScoreChange: (category: CategoryKey, value: number | null) => void;
  yahtzeeBonus: number;
  onYahtzeeBonusChange: (value: number) => void;
  onClearScores: () => void;
  onLoadGame: (data: { scores: ScoresData; yahtzeeBonus: number; name?: string; language?: Language }) => void;
  playerName: string;
}

export function ScoreTable({
  language, scores, onScoreChange, yahtzeeBonus, onYahtzeeBonusChange, onClearScores, onLoadGame, playerName,
}: Props) {
  const t = translations[language];
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current !== null) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const isYahtzeeBonusLocked = scores.yahtzee === 0;

  useEffect(() => {
    if (isYahtzeeBonusLocked) {
      onYahtzeeBonusChange(0);
    }
  }, [isYahtzeeBonusLocked, onYahtzeeBonusChange]);

  const handleClearScores = () => {
    onClearScores();
    setShowClearConfirm(false);
  };

  const showFileError = (message: string) => {
    setFileError(message);
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    errorTimerRef.current = setTimeout(() => setFileError(null), 5000);
  };

  const handleSaveGame = async () => {
    try {
      await saveGame({
        version: 1,
        name: playerName,
        language,
        scores,
        yahtzeeBonus,
        savedAt: new Date().toISOString(),
      });
    } catch {
      showFileError(t.invalidFile);
    }
  };

  const handleOpenGame = async () => {
    try {
      const data = await openGame();
      if (data) onLoadGame(data);
    } catch (e) {
      if (e instanceof InvalidGameFileError) {
        showFileError(t.invalidFile);
      }
    }
  };

  const ut = upperTotal(scores);
  const lt = lowerTotal(scores);
  const ub = upperBonus(ut);
  const gt = grandTotal(scores, yahtzeeBonus);

  const upperCategories: CategoryKey[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
  const lowerCategories: CategoryKey[] = ['threeOfAKind', 'fourOfAKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee', 'chance'];

  const renderRow = (categoryKey: CategoryKey, categoryName: string, isEven: boolean) => (
    <View key={categoryKey} style={[styles.row, isEven ? styles.rowEven : styles.rowOdd]}>
      <View style={styles.categoryCell}>
        <Text style={styles.categoryText}>{categoryName}</Text>
      </View>
      <View style={styles.scoreCell}>
        <ScoreCell
          value={scores[categoryKey]}
          onChange={(value) => onScoreChange(categoryKey, value)}
          fixedValue={getFixedValue(categoryKey)}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableTitle}>{t.tableTitle}</Text>
        <Pressable
          onPress={() => setShowClearConfirm((v) => !v)}
          style={({ pressed }) => [styles.broomBtn, pressed && styles.broomBtnPressed]}
        >
          <Text style={styles.broomText}>🧹</Text>
        </Pressable>
      </View>

      {showClearConfirm && (
        <View style={styles.clearConfirm}>
          <Text style={styles.clearConfirmLabel}>{t.clearScore}</Text>
          <Pressable
            onPress={handleClearScores}
            style={({ pressed }) => [styles.confirmYes, pressed && styles.confirmYesPressed]}
          >
            <Text style={styles.confirmYesText}>{t.yes}</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowClearConfirm(false)}
            style={({ pressed }) => [styles.confirmNo, pressed && styles.confirmNoPressed]}
          >
            <Text style={styles.confirmNoText}>{t.no}</Text>
          </Pressable>
        </View>
      )}

      {/* Upper Section */}
      <View style={styles.grid}>
        <View style={styles.gridHeader}>
          <Text style={[styles.gridHeaderText, { flex: 1 }]}>{t.categories.upper.title}</Text>
          <Text style={[styles.gridHeaderText, styles.gridHeaderScore]}>{t.score}</Text>
        </View>
        {upperCategories.map((key, i) => renderRow(key, t.categories.upper[key as keyof typeof t.categories.upper] as string, i % 2 === 0))}
        <View style={styles.subtotalRow}>
          <Text style={[styles.subtotalText, { flex: 1 }]}>{t.categories.upper.subtotal}</Text>
          <Text style={[styles.subtotalValue, styles.scoreColWidth]}>{ut}</Text>
        </View>
        <View style={styles.bonusRow}>
          <Text style={[styles.bonusText, { flex: 1 }]}>{t.bonuses.upperBonus}</Text>
          <Text style={[styles.bonusValue, styles.scoreColWidth]}>{ub}</Text>
        </View>
      </View>

      {/* Lower Section */}
      <View style={[styles.grid, { marginTop: 16 }]}>
        <View style={styles.gridHeader}>
          <Text style={[styles.gridHeaderText, { flex: 1 }]}>{t.categories.lower.title}</Text>
          <Text style={[styles.gridHeaderText, styles.gridHeaderScore]}>{t.score}</Text>
        </View>
        {lowerCategories.map((key, i) => renderRow(key, t.categories.lower[key as keyof typeof t.categories.lower] as string, i % 2 === 0))}
        <View style={styles.subtotalRow}>
          <Text style={[styles.subtotalText, { flex: 1 }]}>{t.categories.lower.subtotal}</Text>
          <Text style={[styles.subtotalValue, styles.scoreColWidth]}>{lt}</Text>
        </View>
        <View style={styles.bonusRow}>
          <Text style={[styles.bonusText, { flex: 1 }]}>{t.bonuses.yahtzeeBonus}</Text>
          <View style={styles.scoreColWidth}>
            <YahtzeeBonusCell
              value={yahtzeeBonus}
              onChange={onYahtzeeBonusChange}
              disabled={isYahtzeeBonusLocked}
            />
          </View>
        </View>
      </View>

      <View style={styles.grandTotal}>
        <Text style={styles.grandTotalText}>{t.grandTotal}: {gt}</Text>
      </View>

      <View style={styles.gameActions}>
        <Pressable
          onPress={handleOpenGame}
          style={({ pressed }) => [styles.openBtn, pressed && styles.openBtnPressed]}
        >
          <Text style={styles.actionBtnText}>{t.openGame}</Text>
        </Pressable>
        <Pressable
          onPress={handleSaveGame}
          style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
        >
          <Text style={styles.actionBtnText}>{t.saveGame}</Text>
        </Pressable>
      </View>

      {fileError && (
        <View style={styles.fileError}>
          <Text style={styles.fileErrorText}>{fileError}</Text>
        </View>
      )}
    </View>
  );
}

const scoreColWidth = 100;

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c1810',
  },
  broomBtn: {
    borderRadius: 6,
    padding: 4,
  },
  broomBtnPressed: {
    backgroundColor: '#f0e8d4',
  },
  broomText: {
    fontSize: 20,
  },
  clearConfirm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    marginBottom: 4,
  },
  clearConfirmLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5c4a2e',
    flex: 1,
  },
  confirmYes: {
    backgroundColor: '#2d6b3f',
    borderWidth: 2,
    borderColor: '#1e5430',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  confirmYesPressed: {
    backgroundColor: '#367a4a',
  },
  confirmYesText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fdf6e3',
  },
  confirmNo: {
    backgroundColor: '#8b4513',
    borderWidth: 2,
    borderColor: '#6b3410',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  confirmNoPressed: {
    backgroundColor: '#a0522d',
  },
  confirmNoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fdf6e3',
  },
  grid: {
    backgroundColor: '#fffef8',
    borderWidth: 2,
    borderColor: '#8b4513',
    borderRadius: 10,
    marginTop: 16,
    overflow: 'hidden',
    shadowColor: '#3b2f1e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  gridHeader: {
    flexDirection: 'row',
    backgroundColor: '#2d6b3f',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  gridHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fdf6e3',
    textTransform: 'uppercase',
    letterSpacing: 0.28,
  },
  gridHeaderScore: {
    width: scoreColWidth,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0d5bc',
    alignItems: 'center',
  },
  rowEven: {
    backgroundColor: '#fffef8',
  },
  rowOdd: {
    backgroundColor: '#f8f1e1',
  },
  categoryCell: {
    flex: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b2f1e',
  },
  scoreCell: {
    width: scoreColWidth,
  },
  scoreColWidth: {
    width: scoreColWidth,
    textAlign: 'center',
  },
  subtotalRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#dce8d4',
    borderBottomWidth: 2,
    borderBottomColor: '#b5cfaa',
    alignItems: 'center',
  },
  subtotalText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e5430',
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e5430',
    textAlign: 'center',
  },
  bonusRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f5e6d0',
    alignItems: 'center',
  },
  bonusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b4513',
  },
  bonusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b4513',
    textAlign: 'center',
  },
  grandTotal: {
    backgroundColor: '#8b4513',
    borderWidth: 2,
    borderColor: '#6b3410',
    borderRadius: 10,
    padding: 18,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#6b3410',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  grandTotalText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fdf6e3',
    letterSpacing: 0.4,
  },
  gameActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  openBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#2d6b3f',
    borderWidth: 2,
    borderColor: '#1e5430',
    alignItems: 'center',
    shadowColor: '#1e5430',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  openBtnPressed: {
    backgroundColor: '#367a4a',
  },
  saveBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#8b4513',
    borderWidth: 2,
    borderColor: '#6b3410',
    alignItems: 'center',
    shadowColor: '#6b3410',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  saveBtnPressed: {
    backgroundColor: '#a0521a',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdf6e3',
  },
  fileError: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fde8e8',
    borderWidth: 1,
    borderColor: '#e0b0b0',
    borderRadius: 8,
  },
  fileErrorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#a02020',
    textAlign: 'center',
  },
});
