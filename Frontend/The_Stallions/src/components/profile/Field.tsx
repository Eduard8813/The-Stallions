import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helper?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  maxLength?: number;
}

export default function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helper,
  multiline,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  maxLength,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const showError = !!error;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          focused && styles.inputFocused,
          showError && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#5B6472"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        maxLength={maxLength}
      />
      {showError ? <Text style={styles.error}>{error}</Text> : null}
      {!showError && helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    wrapper: { marginBottom: 14 },
    label: { fontSize: 12, fontWeight: '600', color: colors.subtext, marginBottom: 6 },
    labelFocused: { color: colors.accent },
    input: {
      backgroundColor: colors.inputBg,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 11,
      fontSize: 15,
      color: colors.text,
    },
    inputMultiline: { minHeight: 96, textAlignVertical: 'top' },
    inputFocused: { borderColor: colors.accent },
    inputError: { borderColor: colors.danger },
    error: { color: colors.danger, fontSize: 12, marginTop: 5 },
    helper: { color: colors.subtext, fontSize: 11, marginTop: 5 },
  });
