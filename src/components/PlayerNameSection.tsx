import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, TextInput } from '../Text';
import { Language, translations } from '../i18n';

interface Props {
  language: Language;
  playerName: string;
  isPlayerNameSaved: boolean;
  onNameChange: (name: string) => void;
  onSave: () => void;
  onEdit: () => void;
}

export function PlayerNameSection({ language, playerName, isPlayerNameSaved, onNameChange, onSave, onEdit }: Props) {
  const t = translations[language];

  return (
    <View style={styles.container}>
      {isPlayerNameSaved ? (
        <View style={styles.savedRow}>
          <View style={styles.nameDisplay}>
            <Text style={styles.nameText}>{playerName}</Text>
          </View>
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [styles.editBtn, pressed && styles.editBtnPressed]}
          >
            <Text style={styles.editBtnText}>✎</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={playerName}
            onChangeText={onNameChange}
            placeholder={t.playerName}
            placeholderTextColor="#a09680"
            returnKeyType="done"
            onSubmitEditing={() => { if (playerName.trim()) onSave(); }}
          />
          <Pressable
            onPress={onSave}
            disabled={!playerName.trim()}
            style={({ pressed }) => [
              styles.saveBtn,
              !playerName.trim() && styles.saveBtnDisabled,
              pressed && playerName.trim() && styles.saveBtnPressed,
            ]}
          >
            <Text style={[styles.saveBtnText, !playerName.trim() && styles.saveBtnTextDisabled]}>
              {t.playerNameSave}
            </Text>
          </Pressable>
        </View>
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
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameDisplay: {
    flex: 1,
    backgroundColor: '#fffef8',
    borderWidth: 2,
    borderColor: '#c4b590',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c1810',
  },
  editBtn: {
    backgroundColor: '#8b4513',
    borderWidth: 2,
    borderColor: '#6b3410',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  editBtnPressed: {
    backgroundColor: '#a0522d',
  },
  editBtnText: {
    fontSize: 16,
    color: '#fdf6e3',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fffef8',
    borderWidth: 2,
    borderColor: '#c4b590',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#3b2f1e',
  },
  saveBtn: {
    backgroundColor: '#2d6b3f',
    borderWidth: 2,
    borderColor: '#1e5430',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveBtnPressed: {
    backgroundColor: '#367a4a',
  },
  saveBtnDisabled: {
    backgroundColor: '#b5a88a',
    borderColor: '#a09680',
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fdf6e3',
  },
  saveBtnTextDisabled: {
    color: '#fdf6e3',
  },
});
