import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Modal, TouchableOpacity } from 'react-native';

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
  fixedValue?: number | null;
}

export function ScoreCell({ value, onChange, disabled, fixedValue }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value?.toString() ?? '');
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    if (disabled) return;
    if (fixedValue !== null && fixedValue !== undefined) {
      setModalVisible(true);
    } else {
      setIsEditing(true);
      setTempValue(value?.toString() ?? '');
    }
  };

  const handleSave = () => {
    const parsed = tempValue === '' ? null : parseInt(tempValue, 10);
    if (parsed !== null && isNaN(parsed)) {
      setTempValue(value?.toString() ?? '');
    } else {
      onChange(parsed);
    }
    setIsEditing(false);
  };

  const handleFixedSelect = (selected: number | null) => {
    onChange(selected);
    setModalVisible(false);
  };

  if (isEditing) {
    return (
      <TextInput
        style={styles.input}
        value={tempValue}
        onChangeText={setTempValue}
        onBlur={handleSave}
        onSubmitEditing={handleSave}
        keyboardType="number-pad"
        autoFocus
      />
    );
  }

  return (
    <>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.display,
          disabled && styles.displayLocked,
          pressed && !disabled && styles.displayPressed,
        ]}
        disabled={disabled}
      >
        <Text style={styles.displayText}>{value !== null ? value : '—'}</Text>
      </Pressable>

      {fixedValue !== null && fixedValue !== undefined && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
            <View style={styles.modalBox}>
              {([null, 0, fixedValue] as (number | null)[]).map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.modalOption, opt === value && styles.modalOptionSelected]}
                  onPress={() => handleFixedSelect(opt)}
                >
                  <Text style={[styles.modalOptionText, opt === value && styles.modalOptionTextSelected]}>
                    {opt === null ? '—' : opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      )}
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
  input: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#8b4513',
    borderRadius: 6,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    backgroundColor: '#fffef8',
    color: '#3b2f1e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#fdf6e3',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8b4513',
    overflow: 'hidden',
    minWidth: 120,
  },
  modalOption: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0d5bc',
  },
  modalOptionSelected: {
    backgroundColor: '#ede5d2',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#3b2f1e',
    fontWeight: '500',
  },
  modalOptionTextSelected: {
    fontWeight: '700',
    color: '#8b4513',
  },
});
