import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import type { Evento } from '../../types/evento';

interface Props {
  evento: Evento;
  onPress: () => void;
}

const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
const ROJO = '#C0392B';
const AZUL = '#1B6CE0';

export default function EventoListItem({ evento, onPress }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [y, m, d] = evento.fecha.split('-').map(Number);
  const mes = MESES_CORTOS[m - 1];
  const dia = String(d).padStart(2, '0');
  const tieneImagen = !!evento.fotoUrl;

  return (
    <TouchableOpacity style={styles.caja} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.mapa} pointerEvents="none">
        <View style={styles.lineaMapa1} />
        <View style={styles.lineaMapa2} />
        <View style={styles.lineaMapa3} />
      </View>

      <View style={styles.izq}>
        <Text style={styles.mes}>{mes}</Text>
        <View style={styles.cajaFecha}>
          <Text style={styles.dia}>{dia}</Text>
          <View style={styles.iconoCal}>
            <MaterialCommunityIcons name="calendar-blank-outline" size={10} color={ROJO} />
          </View>
        </View>
      </View>

      <View style={styles.medio}>
        <Text style={styles.titulo} numberOfLines={2}>{evento.titulo}</Text>
        <View style={styles.foto}>
          {tieneImagen ? (
            <Image source={{ uri: evento.fotoUrl! }} style={styles.fotoImg} resizeMode="cover" />
          ) : (
            <MaterialCommunityIcons name="image-outline" size={20} color={ROJO} />
          )}
        </View>
      </View>

      <View style={styles.boton}>
        <Text style={styles.flecha}>→</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  caja: {
    width: '100%',
    minHeight: 112,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#D9C6A5',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: 'transparent',
  },
  mapa: {
    ...(StyleSheet.absoluteFill as object),
    opacity: 0.16,
    overflow: 'hidden',
  },
  lineaMapa1: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#8A6F4D',
    transform: [{ rotate: '-8deg' }],
  },
  lineaMapa2: {
    position: 'absolute',
    top: 40,
    left: 0,
    width: '70%',
    height: 1,
    backgroundColor: '#8A6F4D',
    transform: [{ rotate: '4deg' }],
  },
  lineaMapa3: {
    position: 'absolute',
    top: 70,
    left: '30%',
    width: '60%',
    height: 1,
    backgroundColor: '#8A6F4D',
    transform: [{ rotate: '-3deg' }],
  },
  izq: {
    width: 56,
    alignItems: 'flex-start',
    gap: 5,
  },
  mes: {
    color: ROJO,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  cajaFecha: {
    width: 52,
    height: 46,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: ROJO,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  dia: { color: ROJO, fontSize: 20, fontWeight: '900', lineHeight: 22 },
  iconoCal: {
    position: 'absolute',
    right: 3,
    bottom: 2,
  },
  medio: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titulo: {
    flex: 1,
    color: ROJO,
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Gilroy-Bold',
  },
  foto: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#D9C6A5',
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fotoImg: { width: '100%', height: '100%' },
  boton: {
    justifyContent: 'center',
    paddingLeft: 2,
    paddingRight: 4,
  },
  flecha: { color: AZUL, fontSize: 30, fontWeight: '900', marginTop: -1 },
});