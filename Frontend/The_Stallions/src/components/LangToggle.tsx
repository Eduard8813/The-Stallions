import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLang } from '../context/LangContext';

export default function LangToggle({ style }: { style?: object }) {
  const { lang, toggleLang } = useLang();
  const isEs = lang === 'es';

  return (
    <TouchableOpacity style={[styles.btn, style]} onPress={toggleLang} activeOpacity={0.75}>
      <Text style={styles.flag}>{isEs ? '🇺🇸' : '🇪🇸'}</Text>
      <Text style={styles.icon}>🌐</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(99,102,241,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  flag: { fontSize: 18 },
  icon: { fontSize: 16 },
});
