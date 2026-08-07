import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../../constants/ui';

interface ListRowProps {
  icon?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
  chevron?: boolean;
  disabled?: boolean;
  last?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function ListRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
  danger,
  chevron,
  disabled,
  last,
  style,
}: ListRowProps) {
  const content = (
    <>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <View style={styles.textWrap}>
        <Text style={[styles.title, danger && styles.titleDanger]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
      {chevron ? <Text style={styles.chevron}>›</Text> : null}
    </>
  );

  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.separator, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
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
  disabled: { opacity: 0.5 },
  icon: { fontSize: 18 },
  textWrap: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: colors.text },
  titleDanger: { color: colors.danger },
  subtitle: { fontSize: 12, color: colors.subtext, marginTop: 2 },
  chevron: { fontSize: 20, color: colors.subtext, marginLeft: 4 },
});
