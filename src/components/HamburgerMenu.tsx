import React, { useState } from 'react';
import { StyleSheet, View, Pressable, Modal, Switch } from 'react-native';
import { Text } from '../Text';
import { Language, translations } from '../i18n';

interface Props {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  soundEnabled: boolean;
  onSoundEnabledChange: (enabled: boolean) => void;
}

type MenuView = 'closed' | 'menu' | 'settings' | 'about';

const LANGUAGE_LABELS: Record<Language, string> = { uk: 'Українська', en: 'English' };
const LANGUAGES = Object.keys(translations) as Language[];

export function HamburgerMenu({ currentLanguage, onLanguageChange, soundEnabled, onSoundEnabledChange }: Props) {
  const [view, setView] = useState<MenuView>('closed');
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const t = translations[currentLanguage];

  const close = () => {
    setView('closed');
    setLanguageDropdownOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => setView('menu')}
        style={({ pressed }) => [styles.hamburgerBtn, pressed && styles.hamburgerBtnPressed]}
        hitSlop={8}
      >
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </Pressable>

      <Modal visible={view !== 'closed'} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.overlay} onPress={close}>
          <Pressable style={styles.box} onPress={() => {}}>
            {view === 'menu' && (
              <>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => setView('settings')}
                >
                  <Text style={styles.menuItemText}>{t.menu.settings}</Text>
                </Pressable>
                <Pressable
                  style={[styles.menuItem, styles.menuItemLast]}
                  onPress={() => setView('about')}
                >
                  <Text style={styles.menuItemText}>{t.menu.about}</Text>
                </Pressable>
              </>
            )}

            {view === 'settings' && (
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{t.menu.settings}</Text>

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{t.menu.language}</Text>
                  <Pressable
                    style={styles.dropdownTrigger}
                    onPress={() => setLanguageDropdownOpen((v) => !v)}
                  >
                    <Text style={styles.dropdownTriggerText}>{LANGUAGE_LABELS[currentLanguage]}</Text>
                  </Pressable>
                </View>
                {languageDropdownOpen && (
                  <View style={styles.dropdownList}>
                    {LANGUAGES.map((lang) => {
                      const selected = lang === currentLanguage;
                      return (
                        <Pressable
                          key={lang}
                          style={[styles.dropdownOption, selected && styles.dropdownOptionSelected]}
                          onPress={() => {
                            onLanguageChange(lang);
                            setLanguageDropdownOpen(false);
                          }}
                        >
                          <Text style={[styles.dropdownOptionText, selected && styles.dropdownOptionTextSelected]}>
                            {LANGUAGE_LABELS[lang]}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                <View style={styles.row}>
                  <Text style={styles.rowLabel}>{t.menu.sound}</Text>
                  <View style={styles.soundControl}>
                    <Text style={styles.soundStateText}>
                      {soundEnabled ? t.menu.soundOn : t.menu.soundOff}
                    </Text>
                    <Switch
                      value={soundEnabled}
                      onValueChange={onSoundEnabledChange}
                      trackColor={{ false: '#d4c5a0', true: '#8b4513' }}
                      thumbColor="#fdf6e3"
                    />
                  </View>
                </View>

                <Pressable
                  style={styles.backBtn}
                  onPress={() => {
                    setView('menu');
                    setLanguageDropdownOpen(false);
                  }}
                >
                  <Text style={styles.backBtnText}>{t.menu.back}</Text>
                </Pressable>
              </View>
            )}

            {view === 'about' && (
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{t.menu.about}</Text>
                <Text style={styles.aboutText}>{t.menu.aboutText}</Text>
                <Pressable style={styles.backBtn} onPress={() => setView('menu')}>
                  <Text style={styles.backBtnText}>{t.menu.back}</Text>
                </Pressable>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  hamburgerBtn: {
    width: 40,
    height: 40,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#8b4513',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  hamburgerBtnPressed: {
    backgroundColor: '#f0e8d4',
  },
  hamburgerLine: {
    width: 18,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#8b4513',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 12,
  },
  box: {
    backgroundColor: '#fdf6e3',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8b4513',
    overflow: 'hidden',
    minWidth: 220,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0d5bc',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b2f1e',
  },
  panel: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8b4513',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#3b2f1e',
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderColor: '#d4c5a0',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ede5d2',
  },
  dropdownTriggerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5c4a2e',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#e0d5bc',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 4,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e0d5bc',
  },
  dropdownOptionSelected: {
    backgroundColor: '#ede5d2',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#3b2f1e',
    fontWeight: '500',
  },
  dropdownOptionTextSelected: {
    fontWeight: '700',
    color: '#8b4513',
  },
  soundControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  soundStateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5c4a2e',
  },
  backBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8b4513',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b4513',
  },
  aboutText: {
    fontSize: 15,
    color: '#3b2f1e',
    marginBottom: 8,
  },
});
