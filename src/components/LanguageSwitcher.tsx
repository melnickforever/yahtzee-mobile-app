import React from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { Language } from '../types';

interface Props {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export function LanguageSwitcher({ currentLanguage, onLanguageChange }: Props) {
  return (
    <View style={styles.wrapper}>
      {(['uk', 'en'] as Language[]).map((lang) => {
        const active = currentLanguage === lang;
        return (
          <Pressable
            key={lang}
            onPress={() => onLanguageChange(lang)}
            style={({ pressed }) => [
              styles.pill,
              active ? styles.pillActive : styles.pillInactive,
              pressed && !active && styles.pillPressed,
            ]}
          >
            <Text style={[styles.pillText, active ? styles.pillTextActive : styles.pillTextInactive]}>
              {lang === 'uk' ? 'Укр' : 'Eng'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    flexDirection: 'row',
    gap: 4,
  },
  pill: {
    borderRadius: 6,
    borderWidth: 2,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pillActive: {
    backgroundColor: '#8b4513',
    borderColor: '#6b3410',
  },
  pillInactive: {
    backgroundColor: 'transparent',
    borderColor: '#8b4513',
  },
  pillPressed: {
    backgroundColor: '#a0522d',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#fdf6e3',
  },
  pillTextInactive: {
    color: '#8b4513',
  },
});
