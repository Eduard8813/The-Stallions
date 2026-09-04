import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';

interface AuthInputProps extends TextInputProps {
  label: string;
}

export default function AuthInput({ label, ...props }: AuthInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
      <TextInput
        style={[styles.input, focused && styles.inputFocused]}
        placeholderTextColor="#94a3b8"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 10 },
  label: { fontSize: 11, fontWeight: '500', color: '#64748b', marginBottom: 4 },
  labelFocused: { color: '#69B6E6' },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    color: '#0f172a',
  },
  inputFocused: { borderColor: '#69B6E6', backgroundColor: '#fff' },
});
