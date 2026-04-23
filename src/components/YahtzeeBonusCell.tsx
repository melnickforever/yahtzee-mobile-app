import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Modal, TouchableOpacity, ScrollView } from 'react-native';

interface Props {
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
}

const OPTIONS = Array.from({ length: 11 }, (_, i) => i * 100);

export function YahtzeeBonusCell({ value, onChange, disabled }: Props) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => { if (!disabled) setModalVisible(true); }}
        disabled={disabled}
        style={({ pressed }) => [
          styles.display,
          disabled && styles.displayLocked,
          pressed && !disabled && styles.displayPressed,
        ]}
      >
        <Text style={styles.displayText}>{value}</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)}>
          <View style={styles.box}>
            <ScrollView>
              {OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.option, opt === value && styles.optionSelected]}
                  onPress={() => { onChange(opt); setModalVisible(false); }}
                >
                  <Text style={[styles.optionText, opt === value && styles.optionTextSelected]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  display: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ede5d2',
    borderRadius: 6,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d4c5a0',
  },
  displayPressed: {
    backgroundColor: '#e0d5bc',
    transform: [{ scale: 1.03 }],
  },
  displayLocked: {
    opacity: 0.5,
  },
  displayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5c4a2e',
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    backgroundColor: '#fdf6e3',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8b4513',
    overflow: 'hidden',
    minWidth: 120,
    maxHeight: 320,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0d5bc',
  },
  optionSelected: {
    backgroundColor: '#ede5d2',
  },
  optionText: {
    fontSize: 16,
    color: '#3b2f1e',
    fontWeight: '500',
  },
  optionTextSelected: {
    fontWeight: '700',
    color: '#8b4513',
  },
});
