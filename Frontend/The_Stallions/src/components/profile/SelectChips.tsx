import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface SelectChipsProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export default function SelectChips<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: SelectChipsProps<T>) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.chip, selected && styles.chipSelected, disabled && styles.disabled]}
            onPress={() => onChange(option.value)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.inputBg,
    },
    chipSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
    disabled: { opacity: 0.5 },
    chipText: { fontSize: 13, fontWeight: '600', color: colors.subtext },
    chipTextSelected: { color: colors.text },
  });
