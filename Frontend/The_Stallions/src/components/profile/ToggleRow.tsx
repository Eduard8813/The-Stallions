import React from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/ui';

interface ToggleRowProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  pending?: boolean;
  last?: boolean;
}

export default function ToggleRow({
  title,
  description,
  value,
  onValueChange,
  disabled,
  pending,
  last,
}: ToggleRowProps) {
  return (
    <View style={[styles.row, !last && styles.separator]}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {description ? <Text style={styles.description}>{description}</Text> : null}
      </View>
      {pending ? (
        <ActivityIndicator size="small" color={colors.accent} />
      ) : (
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{ true: colors.accent, false: colors.border }}
          thumbColor="#fff"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
    backgroundColor: colors.surfaceAlt,
  },
  separator: { borderBottomWidth: 1, borderBottomColor: colors.border },
  textWrap: { flex: 1, paddingRight: 8 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  description: { fontSize: 12, color: colors.subtext, marginTop: 2, lineHeight: 16 },
});
