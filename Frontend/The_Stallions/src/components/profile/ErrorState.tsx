import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { colors } from '../../constants/ui';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>😕</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button title="Reintentar" onPress={onRetry} style={styles.retry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  emoji: { fontSize: 34, marginBottom: 10 },
  message: { color: colors.subtext, fontSize: 14, textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  retry: { alignSelf: 'stretch', maxWidth: 240 },
});
