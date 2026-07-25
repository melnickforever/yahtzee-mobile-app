import React from 'react';
import { StyleSheet, View, Pressable, Modal, ScrollView } from 'react-native';
import { Text } from '../Text';
import { Language, translations } from '../i18n';
import { SaveSlot } from '../fileIO';

interface Props {
  visible: boolean;
  mode: 'save' | 'open';
  language: Language;
  slots: SaveSlot[];
  onClose: () => void;
  onNewSave?: () => void;
  onSelectSlot: (slot: SaveSlot) => void;
  onDeleteSlot: (slot: SaveSlot) => void;
}

export function SaveSlotsModal({ visible, mode, language, slots, onClose, onNewSave, onSelectSlot, onDeleteSlot }: Props) {
  const t = translations[language];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.box} onPress={() => {}}>
          <Text style={styles.title}>{mode === 'save' ? t.saveGame : t.openGame}</Text>

          <ScrollView style={styles.list}>
            {mode === 'save' && onNewSave && (
              <Pressable
                onPress={onNewSave}
                style={({ pressed }) => [styles.newSaveRow, pressed && styles.newSaveRowPressed]}
              >
                <Text style={styles.newSaveText}>+ {t.newSave}</Text>
              </Pressable>
            )}

            {slots.length === 0 && (
              <Text style={styles.emptyText}>{t.noSavedGames}</Text>
            )}

            {slots.map((slot) => (
              <View key={slot.filename} style={styles.slotRow}>
                <Pressable
                  onPress={() => onSelectSlot(slot)}
                  style={({ pressed }) => [styles.slotLabelBtn, pressed && styles.slotLabelBtnPressed]}
                >
                  <Text style={styles.slotLabelText} numberOfLines={1}>{slot.label}</Text>
                </Pressable>
                <Pressable
                  onPress={() => onDeleteSlot(slot)}
                  style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
                  hitSlop={8}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </Pressable>
              </View>
            ))}
          </ScrollView>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.closeBtnPressed]}
          >
            <Text style={styles.closeText}>{t.close}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: '#fdf6e3',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8b4513',
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c1810',
    marginBottom: 12,
    textAlign: 'center',
  },
  list: {
    maxHeight: 360,
  },
  newSaveRow: {
    backgroundColor: '#2d6b3f',
    borderWidth: 2,
    borderColor: '#1e5430',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  newSaveRowPressed: {
    backgroundColor: '#367a4a',
  },
  newSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fdf6e3',
  },
  emptyText: {
    fontSize: 14,
    color: '#8b7355',
    textAlign: 'center',
    paddingVertical: 20,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  slotLabelBtn: {
    flex: 1,
    backgroundColor: '#fffef8',
    borderWidth: 1,
    borderColor: '#e0d5bc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  slotLabelBtnPressed: {
    backgroundColor: '#f0e8d4',
  },
  slotLabelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b2f1e',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0b0b0',
    backgroundColor: '#fde8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnPressed: {
    backgroundColor: '#f8d0d0',
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#a02020',
  },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#8b4513',
    borderWidth: 2,
    borderColor: '#6b3410',
    alignItems: 'center',
  },
  closeBtnPressed: {
    backgroundColor: '#a0521a',
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fdf6e3',
  },
});
