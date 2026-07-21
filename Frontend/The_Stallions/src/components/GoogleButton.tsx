import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

interface GoogleButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function GoogleButton({ onPress, disabled }: GoogleButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <View style={styles.logo}>
        <Text style={styles.logoText}>G</Text>
      </View>
      <Text style={styles.text}>Continuar con Google</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
    gap: 8,
  },
  disabled: { opacity: 0.4 },
  logo: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontSize: 13, fontWeight: '800', color: '#4285F4' },
  text: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
});
