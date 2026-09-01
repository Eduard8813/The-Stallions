import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Option<T extends string> {
  label: string;
  value: T;
  icon?: string;
}

interface SelectDropdownProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function SelectDropdown<T extends string>({
  options,
  value,
  onChange,
  disabled,
  placeholder,
}: SelectDropdownProps<T>) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View>
      <TouchableOpacity
        style={[styles.trigger, disabled && styles.disabled]}
        onPress={() => setOpen(true)}
        disabled={disabled}
        activeOpacity={0.75}
      >
        <Text style={styles.triggerText}>{selected ? selected.label : placeholder ?? ''}</Text>
        <Text style={[styles.chevron, open && styles.chevronOpen]}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.panel, { borderColor: colors.border }]}>
            {options.map((option) => {
              const active = option.value === value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => {
                    setOpen(false);
                    onChange(option.value);
                  }}
                  activeOpacity={0.8}
                >
                  {option.icon ? <Text style={styles.optionIcon}>{option.icon}</Text> : null}
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>
                    {option.label}
                  </Text>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.inputBg,
    },
    disabled: { opacity: 0.5 },
    triggerText: { fontSize: 13, fontWeight: '700', color: colors.text },
    chevron: { fontSize: 16, color: colors.subtext },
    chevronOpen: { color: colors.accent },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    panel: {
      minWidth: 220,
      borderRadius: 16,
      borderWidth: 1,
      backgroundColor: colors.surface,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    optionActive: { backgroundColor: colors.accentSoft },
    optionIcon: { fontSize: 18 },
    optionText: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },
    optionTextActive: { color: colors.accent },
    check: { fontSize: 16, color: colors.accent, fontWeight: '800' },
  });
