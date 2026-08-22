import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/ui';
import type { Evento } from '../../types/evento';

interface Props {
  evento: Evento;
  onPress: () => void;
}

export default function EventoListItem({ evento, onPress }: Props) {
  const fecha = new Date(`${evento.fecha}T12:00:00`).toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.fechaBox}>
        <Text style={styles.fechaDia}>{fecha.split(',')[0]}</Text>
        <Text style={styles.fechaNumero}>{evento.fecha.slice(8)}</Text>
        <Text style={styles.fechaMes}>{fecha.split(' ')[1]}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.titulo} numberOfLines={1}>
          {evento.titulo}
        </Text>
        <Text style={[styles.categoria, styles[evento.categoria]]}>{evento.categoria}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 12,
  },
  fechaBox: {
    width: 52,
    height: 60,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fechaDia: { color: colors.subtext, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  fechaNumero: { color: colors.text, fontSize: 20, fontWeight: '800', lineHeight: 24 },
  fechaMes: { color: colors.subtext, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  info: { flex: 1, gap: 4 },
  titulo: { color: colors.text, fontSize: 15, fontWeight: '700' },
  categoria: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  FERIADO: { color: colors.danger },
  CONMEMORACION: { color: '#F59E0B' },
  CELEBRACION: { color: colors.success },
  chevron: { color: colors.subtext, fontSize: 22, fontWeight: '600' },
});
