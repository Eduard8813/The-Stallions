import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../constants/ui';
import type { Evento } from '../../types/evento';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

interface Props {
  /** Todos los eventos conocidos (para marcar días con punto). */
  eventos: Evento[];
  mes: number;
  anio: number;
  onMesChange: (anio: number, mes: number) => void;
}

export default function CalendarioEventos({ eventos, mes, anio, onMesChange }: Props) {
  const diasConEvento = new Set(
    eventos
      .filter((e) => {
        const [y, m] = e.fecha.split('-').map(Number);
        return y === anio && m - 1 === mes;
      })
      .map((e) => Number(e.fecha.slice(8)))
  );

  const primerDia = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  const celdas: (number | null)[] = [
    ...Array.from({ length: primerDia }, () => null),
    ...Array.from({ length: diasDelMes }, (_, i) => i + 1),
  ];
  while (celdas.length % 7 !== 0) celdas.push(null);

  const hoy = new Date();
  const esMesActual = hoy.getFullYear() === anio && hoy.getMonth() === mes;

  const mover = (delta: number) => {
    const nuevo = new Date(anio, mes + delta, 1);
    onMesChange(nuevo.getFullYear(), nuevo.getMonth());
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => mover(-1)} hitSlop={12}>
          <Text style={styles.flecha}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.mesTitulo}>{MESES[mes]} {anio}</Text>
        <TouchableOpacity onPress={() => mover(1)} hitSlop={12}>
          <Text style={styles.flecha}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grilla}>
        {DIAS_SEMANA.map((d, i) => (
          <View key={`h${i}`} style={styles.celda}>
            <Text style={styles.diaSemana}>{d}</Text>
          </View>
        ))}
        {celdas.map((dia, i) => {
          if (dia === null) return <View key={`v${i}`} style={styles.celda} />;
          const tieneEvento = diasConEvento.has(dia);
          const esHoy = esMesActual && dia === hoy.getDate();
          return (
            <View key={`d${i}`} style={styles.celda}>
              <View style={[styles.diaBox, esHoy && styles.diaHoy]}>
                <Text style={[styles.diaTexto, esHoy && styles.diaTextoHoy]}>{dia}</Text>
              </View>
              {tieneEvento && <View style={styles.punto} />}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  mesTitulo: { color: colors.text, fontSize: 16, fontWeight: '800' },
  flecha: { color: colors.accent, fontSize: 26, fontWeight: '700', paddingHorizontal: 8 },
  grilla: { flexDirection: 'row', flexWrap: 'wrap' },
  celda: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 2 } as const,
  diaSemana: { color: colors.subtext, fontSize: 11, fontWeight: '700' },
  diaBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaHoy: { backgroundColor: colors.accent },
  diaTexto: { color: colors.text, fontSize: 13, fontWeight: '600' },
  diaTextoHoy: { color: '#fff', fontWeight: '800' },
  punto: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 2,
  },
});
