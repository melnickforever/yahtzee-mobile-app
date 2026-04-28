import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Language, translations } from './src/i18n';
import { CategoryKey, ScoresData } from './src/types';
import { loadGameState, saveGameState } from './src/storage';
import { LanguageSwitcher } from './src/components/LanguageSwitcher';
import { DiceLogo } from './src/components/DiceLogo';
import { DiceGame } from './src/components/DiceGame';
import { RulesReference } from './src/components/RulesReference';
import { ScoreTable } from './src/components/ScoreTable';
import { PlayerNameSection } from './src/components/PlayerNameSection';

const defaultScores: ScoresData = {
  ones: null, twos: null, threes: null, fours: null, fives: null, sixes: null,
  threeOfAKind: null, fourOfAKind: null, fullHouse: null,
  smallStraight: null, largeStraight: null, yahtzee: null, chance: null,
};


export default function App() {
  const [language, setLanguage] = useState<Language>('uk');
  const [playerName, setPlayerName] = useState('');
  const [isPlayerNameSaved, setIsPlayerNameSaved] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [scores, setScores] = useState<ScoresData>(defaultScores);
  const [yahtzeeBonus, setYahtzeeBonus] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const t = translations[language];
  const scrollRef = useRef<ScrollView>(null);
  const diceGameY = useRef<number>(0);

  useEffect(() => {
    loadGameState().then((data) => {
      if (data) {
        setScores(data.scores ?? defaultScores);
        setYahtzeeBonus(data.yahtzeeBonus ?? 0);
        setPlayerName(data.playerName ?? '');
        setLanguage(data.language ?? 'uk');
        if (data.playerName) setIsPlayerNameSaved(true);
      }
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    saveGameState({ scores, yahtzeeBonus, playerName, language });
  }, [isLoaded, scores, yahtzeeBonus, playerName, language]);

  const handleScoreChange = useCallback((category: CategoryKey, value: number | null) => {
    setScores((prev) => ({ ...prev, [category]: value }));
  }, []);

  const handleClearScores = useCallback(() => {
    setScores(defaultScores);
    setYahtzeeBonus(0);
  }, []);

  const handleLoadGame = useCallback((data: { scores: ScoresData; yahtzeeBonus: number; name?: string; language?: Language }) => {
    setScores(data.scores);
    setYahtzeeBonus(data.yahtzeeBonus);
    if (data.name !== undefined) {
      setPlayerName(data.name);
      setIsPlayerNameSaved(!!data.name);
    }
    if (data.language) setLanguage(data.language);
  }, []);

  const handleEnterGame = useCallback(() => {
    setGameActive(true);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: diceGameY.current - 20, animated: true });
    }, 100);
  }, []);

  const handleExitGame = useCallback(() => {
    setGameActive(false);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  // Loading screen — shown while AsyncStorage hydrates
  if (!isLoaded) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingScreen}>
          <StatusBar barStyle="dark-content" backgroundColor="#f4efe6" />
          <DiceLogo language="uk" onEnterGame={() => {}} gameActive={true} />
          <Text style={styles.loadingTitle}>Yahtzee</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f4efe6" />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
          <ScrollView
            ref={scrollRef}
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >

            <View style={styles.mainContainer}>
              <DiceLogo language={language} onEnterGame={handleEnterGame} gameActive={gameActive} />

              <PlayerNameSection
                language={language}
                playerName={playerName}
                isPlayerNameSaved={isPlayerNameSaved}
                onNameChange={setPlayerName}
                onSave={() => { if (playerName.trim()) setIsPlayerNameSaved(true); }}
                onEdit={() => setIsPlayerNameSaved(false)}
              />

              {gameActive && (
                <View onLayout={(e) => { diceGameY.current = e.nativeEvent.layout.y; }}>
                  <DiceGame language={language} onExit={handleExitGame} />
                </View>
              )}

              <RulesReference language={language} />

              <ScoreTable
                language={language}
                scores={scores}
                onScoreChange={handleScoreChange}
                yahtzeeBonus={yahtzeeBonus}
                onYahtzeeBonusChange={setYahtzeeBonus}
                onClearScores={handleClearScores}
                onLoadGame={handleLoadGame}
                playerName={playerName}
              />

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4efe6',
  },
  flex: {
    flex: 1,
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#f4efe6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2c1810',
    marginTop: 12,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  mainContainer: {
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c1810',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
});
