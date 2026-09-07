import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import type { Evento } from '../../types/evento';
import { fechasDelEvento } from '../../services/eventosService';

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
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [pickerAbierto, setPickerAbierto] = useState(false);
  // Días (del mes visible) que están cubiertos por el rango de algún evento.
  const diasConEvento = new Set<number>();
  const mesesPorAnio = new Map<number, Set<number>>();
  for (const e of eventos) {
    for (const fechaISO of fechasDelEvento(e)) {
      const [y, m, d] = fechaISO.split('-').map(Number);
      if (y === anio && m - 1 === mes) diasConEvento.add(d);
      const meses = mesesPorAnio.get(y) ?? new Set<number>();
      meses.add(m - 1);
      mesesPorAnio.set(y, meses);
    }
  }
  const anioHoy = new Date().getFullYear();
  const aniosLista = [...new Set([...mesesPorAnio.keys(), anioHoy])].sort((a, b) => a - b);
  // Año en curso: meses que faltan para terminar el año. Otros años: todos los meses.
  const opcionesMes =
    anio === anioHoy ? MESES.filter((_, i) => i >= new Date().getMonth()) : MESES;

  const primerDia = (new Date(anio, mes, 1).getDay() + 6) % 7;
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  const celdas: (number | null)[] = [
    ...Array.from({ length: primerDia }, () => null),
    ...Array.from({ length: diasDelMes }, (_, i) => i + 1),
  ];
  while (celdas.length % 7 !== 0) celdas.push(null);

  const hoy = new Date();
  const esMesActual = hoy.getFullYear() === anio && hoy.getMonth() === mes;

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={() => setPickerAbierto(true)} activeOpacity={0.7}>
        <Text style={styles.mesTitulo}>{MESES[mes]} {anio}</Text>
        <MaterialCommunityIcons name="chevron-down" size={18} color="#1562A2" />
      </TouchableOpacity>

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

      <Modal
        visible={pickerAbierto}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerAbierto(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>Escoge el mes</Text>
            <ScrollView style={styles.modalLista}>
              {opcionesMes.map((m, i) => {
                const idx = MESES.indexOf(m);
                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.opcion,
                      idx === mes && styles.opcionActiva,
                    ]}
                    onPress={() => {
                      onMesChange(anio, idx);
                      setPickerAbierto(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.opcionTexto, idx === mes && styles.opcionTextoActivo]}>{m}</Text>
                    {idx === mes && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalLinea} />
            <Text style={styles.modalTitulo}>Escoge el año</Text>
            <View style={styles.aniosRow}>
              {aniosLista.map((a) => (
                <TouchableOpacity
                  key={a}
                  style={[styles.opcionAnio, a === anio && styles.opcionActiva]}
                  onPress={() => {
                    onMesChange(a, mes);
                    setPickerAbierto(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.opcionTexto, a === anio && styles.opcionTextoActivo]}>{a}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalCerrar}
              onPress={() => setPickerAbierto(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCerrarTexto}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  card: {
    alignSelf: 'center',
    width: '78%',
    minWidth: 250,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  mesTitulo: { color: '#1562A2', fontSize: 16, fontWeight: '800', fontFamily: 'Gilroy-Bold' },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  celda: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 1,
  } as const,
  diaSemana: { color: colors.subtext, fontSize: 10, fontWeight: '700' },
  diaBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diaHoy: { backgroundColor: '#1562A2' },
  diaTexto: { color: colors.text, fontSize: 12, fontWeight: '600' },
  diaTextoHoy: { color: '#fff', fontWeight: '800' },
  punto: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F3961C',
    marginTop: -2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '82%',
    maxHeight: '78%',
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 16,
  },
  modalTitulo: { color: colors.subtext, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  modalLista: { maxHeight: 240 },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  opcionActiva: { backgroundColor: '#1562A2' },
  opcionTexto: { color: colors.text, fontSize: 15, fontWeight: '600' },
  opcionTextoActivo: { color: '#fff', fontWeight: '800' },
  modalLinea: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  aniosRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcionAnio: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCerrar: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCerrarTexto: { color: colors.subtext, fontSize: 13, fontWeight: '700' },
});