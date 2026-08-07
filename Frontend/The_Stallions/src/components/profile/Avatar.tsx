import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { colors } from '../../constants/ui';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
  onEditPress?: () => void;
}

function getInitials(name?: string): string {
  if (!name) return '';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Avatar({ uri, name, size = 96, onEditPress }: AvatarProps) {
  const initials = getInitials(name);
  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} contentFit="cover" />
      ) : (
        <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
          {initials ? <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text> : null}
        </View>
      )}
      {onEditPress ? (
        <TouchableOpacity style={styles.editBadge} onPress={onEditPress} activeOpacity={0.8}>
          <Text style={styles.editIcon}>📷</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.surfaceAlt },
  fallback: {
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  initials: { fontWeight: '800', color: colors.accent },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  editIcon: { fontSize: 14 },
});
