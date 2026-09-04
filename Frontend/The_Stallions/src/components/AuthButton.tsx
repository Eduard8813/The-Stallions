import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'outline';
}

export default function AuthButton({ title, onPress, loading, variant = 'primary' }: AuthButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <TouchableOpacity
      style={[styles.button, isPrimary ? styles.primary : styles.outline]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color={isPrimary ? '#fff' : '#69B6E6'} />
        : <Text style={[styles.text, !isPrimary && styles.textOutline]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { paddingVertical: '3%', paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', marginBottom: 8, width: '100%' },
  primary: { backgroundColor: '#69B6E6' },
  outline: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#69B6E6' },
  text: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
  textOutline: { color: '#69B6E6' },
});
