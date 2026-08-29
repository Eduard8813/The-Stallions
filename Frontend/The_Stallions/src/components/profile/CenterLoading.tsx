import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function CenterLoading({ text = 'Cargando…' }: { text?: string }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    text: { color: colors.subtext, fontSize: 13, marginTop: 12 },
  });
