import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

export default function EventosLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
