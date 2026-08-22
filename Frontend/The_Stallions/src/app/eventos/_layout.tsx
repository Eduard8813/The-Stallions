import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../constants/ui';

export default function EventosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    />
  );
}
