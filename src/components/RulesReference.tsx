import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { Language, translations } from '../i18n';

interface Props {
  language: Language;
}

export function RulesReference({ language }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const t = translations[language];
  const s = t.rules_summary;
  const rt = t.rules_table;

  const rulesData = [
    { combination: rt.ones, description: rt.onesDesc, points: rt.varies },
    { combination: rt.twos, description: rt.twosDesc, points: rt.varies },
    { combination: rt.threes, description: rt.threesDesc, points: rt.varies },
    { combination: rt.fours, description: rt.foursDesc, points: rt.varies },
    { combination: rt.fives, description: rt.fivesDesc, points: rt.varies },
    { combination: rt.sixes, description: rt.sixesDesc, points: rt.varies },
    { combination: rt.threeOfAKind, description: rt.threeOfAKindDesc, points: rt.sumOfAll },
    { combination: rt.fourOfAKind, description: rt.fourOfAKindDesc, points: rt.sumOfAll },
    { combination: rt.fullHouse, description: rt.fullHouseDesc, points: rt.fullHousePoints },
    { combination: rt.smallStraight, description: rt.smallStraightDesc, points: rt.smallStraightPoints },
    { combination: rt.largeStraight, description: rt.largeStraightDesc, points: rt.largeStraightPoints },
    { combination: rt.yahtzee, description: rt.yahtzeeDesc, points: rt.yahtzeePoints },
    { combination: rt.chance, description: rt.chanceDesc, points: rt.sumOfAll },
    { combination: rt.upperBonus, description: rt.upperBonusDesc, points: rt.upperBonusPoints },
    { combination: rt.yahtzeeBonus, description: rt.yatzheeBonusDesc, points: rt.yatzheeBonusPoints },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.rules}</Text>
        <Pressable
          onPress={() => setIsVisible((v) => !v)}
          style={({ pressed }) => [styles.toggleBtn, pressed && styles.toggleBtnPressed]}
        >
          <Text style={styles.toggleBtnText}>{isVisible ? t.hideRules : t.showRules}</Text>
        </Pressable>
      </View>

      {isVisible && (
        <>
          <View style={styles.summary}>
            <Text style={styles.h3}>{s.objectiveTitle}</Text>
            <Text style={styles.body}>{s.objective}</Text>

            <Text style={styles.h3}>{s.gameplayTitle}</Text>
            <Text style={styles.body}>• {s.gameplay1}</Text>
            <Text style={styles.body}>• {s.gameplay2}</Text>
            <Text style={styles.body}>• {s.gameplay3}</Text>

            <Text style={styles.h3}>{s.specialTitle}</Text>
            <Text style={styles.body}>• {s.yahtzeeBonus}</Text>
            <Text style={styles.body}>• {s.jokerRule}</Text>
            <Text style={styles.body}>• {s.zeroRule}</Text>

            <Text style={styles.h3}>{s.keyPointTitle}</Text>
            <Text style={styles.body}>{s.keyPoint}</Text>

            <Text style={styles.h3}>{s.gameEndTitle}</Text>
            <Text style={styles.body}>{s.gameEnd}</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator style={styles.gridScroll}>
            <View style={styles.grid}>
              <View style={styles.gridHeaderRow}>
                <Text style={[styles.gridHeaderCell, styles.col1]}>{rt.combination}</Text>
                <Text style={[styles.gridHeaderCell, styles.col2]}>{rt.description}</Text>
                <Text style={[styles.gridHeaderCell, styles.col3]}>{rt.points}</Text>
              </View>
              {rulesData.map((row, index) => (
                <View
                  key={index}
                  style={[styles.gridRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
                >
                  <Text style={[styles.gridCell, styles.col1]}>{row.combination}</Text>
                  <Text style={[styles.gridCell, styles.col2]}>{row.description}</Text>
                  <Text style={[styles.gridCell, styles.col3]}>{row.points}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fdf6e3',
    borderWidth: 2,
    borderColor: '#d4c5a0',
    borderRadius: 10,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#3b2f1e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c1810',
  },
  toggleBtn: {
    backgroundColor: '#8b4513',
    borderWidth: 2,
    borderColor: '#6b3410',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  toggleBtnPressed: {
    backgroundColor: '#a0522d',
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fdf6e3',
  },
  summary: {
    marginTop: 16,
  },
  h3: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c1810',
    textTransform: 'uppercase',
    letterSpacing: 0.42,
    marginTop: 16,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 24,
    color: '#5c4a2e',
  },
  gridScroll: {
    marginTop: 16,
  },
  grid: {
    backgroundColor: '#fffef8',
    borderWidth: 2,
    borderColor: '#8b4513',
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: 500,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#2d6b3f',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  gridHeaderCell: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fdf6e3',
    textTransform: 'uppercase',
    letterSpacing: 0.52,
  },
  gridRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e0d5bc',
  },
  rowEven: {
    backgroundColor: '#fffef8',
  },
  rowOdd: {
    backgroundColor: '#f8f1e1',
  },
  gridCell: {
    fontSize: 14,
    color: '#5c4a2e',
  },
  col1: {
    flex: 1,
  },
  col2: {
    flex: 2,
  },
  col3: {
    flex: 1,
  },
});
