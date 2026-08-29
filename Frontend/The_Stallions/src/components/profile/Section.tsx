import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export default function Section({ title, children }: SectionProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    section: { marginBottom: 22 },
    title: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.subtext,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 8,
      marginLeft: 4,
    },
    card: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
  });
