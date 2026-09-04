import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { useLang } from '../context/LangContext';

interface GoogleButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export default function GoogleButton({ onPress, disabled }: GoogleButtonProps) {
  const { t } = useLang();
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      <Image source={require('../../assets/images/google-logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.text}>{t.continueWithGoogle}</Text>
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
  logo: { width: 18, height: 18 },
  text: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
});
