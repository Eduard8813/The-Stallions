import React, { useMemo, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAsync } from '../../hooks/useAsync';
import { fechasDelEvento, obtenerEventos } from '../../services/eventosService';
import { useTheme } from '../../context/ThemeContext';
import CalendarioEventos from '../../components/eventos/CalendarioEventos';
import EventoListItem from '../../components/eventos/EventoListItem';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

interface MesConEventos {
  anio: number;
  mes: number;
  count: number;
}

export default function EventosScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const hoy = new Date();
  const [mesVisible, setMesVisible] = useState({ anio: hoy.getFullYear(), mes: hoy.getMonth() });
  const [mesElegido, setMesElegido] = useState(false);
  const { data, loading, refetch } = useAsync(() => obtenerEventos(), []);

  const eventos = useMemo(() => data ?? [], [data]);

  const mesesConEventos = useMemo<MesConEventos[]>(() => {
    const mapa = new Map<string, MesConEventos>();
    for (const e of eventos) {
      for (const fechaISO of fechasDelEvento(e)) {
        const [y, m] = fechaISO.split('-').map(Number);
        const key = `${y}-${m}`;
        const actual = mapa.get(key);
        mapa.set(key, { anio: y, mes: m - 1, count: (actual?.count ?? 0) + 1 });
      }
    }
    return [...mapa.values()].sort((a, b) => a.anio - b.anio || a.mes - b.mes);
  }, [eventos]);

  const mesMostrado = useMemo(() => {
    if (mesElegido || !data || !mesesConEventos.length) return mesVisible;
    const tiene = (anio: number, mes: number) =>
      mesesConEventos.some((m) => m.anio === anio && m.mes === mes);
    if (tiene(mesVisible.anio, mesVisible.mes)) return mesVisible;
    const ahora = new Date();
    const proximos = mesesConEventos.filter(
      (m) => m.anio > ahora.getFullYear() || (m.anio === ahora.getFullYear() && m.mes >= ahora.getMonth())
    );
    const objetivo = (proximos.length ? proximos : [mesesConEventos[mesesConEventos.length - 1]])[0];
    return { anio: objetivo.anio, mes: objetivo.mes };
  }, [data, mesesConEventos, mesElegido, mesVisible]);

  const eventosDelMes = useMemo(
    () =>
      eventos.filter((e) =>
        fechasDelEvento(e).some((f) => {
          const [y, m] = f.split('-').map(Number);
          return y === mesMostrado.anio && m - 1 === mesMostrado.mes;
        })
      ),
    [eventos, mesMostrado]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.fondoWrap}>
        <Image source={require('../../../assets/images/Evento.jpg')} style={styles.fondo} resizeMode="cover" />
      </View>
      <FlatList
        data={eventosDelMes}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => (
          <View style={styles.itemWrap}>
            <EventoListItem
              evento={item}
              onPress={() => router.push({ pathname: '/eventos/[id]', params: { id: item.id } })}
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          <>
            <CalendarioEventos
              eventos={eventos}
              mes={mesMostrado.mes}
              anio={mesMostrado.anio}
              onMesChange={(anio, mes) => {
                setMesElegido(true);
                setMesVisible({ anio, mes });
              }}
            />
            <View style={styles.tituloEventoBloque}>
              <Text style={styles.tituloEvento}>Evento</Text>
              <Text style={styles.tituloMes}>
                {MESES[mesMostrado.mes]} {mesMostrado.anio}
              </Text>
            </View>
            {eventosDelMes.length === 0 && mesesConEventos.length > 0 && (
              <View style={styles.sinEventosBox}>
                <Text style={styles.sinEventosTexto}>
                  No hay eventos en {MESES[mesMostrado.mes]} de {mesMostrado.anio}.
                </Text>
                <Text style={styles.hayEnTexto}>Hay eventos en:</Text>
                <View style={styles.chipsRow}>
                  {mesesConEventos.map((m) => (
                    <TouchableOpacity
                      key={`${m.anio}-${m.mes}`}
                      style={[
                        styles.mesChip,
                        m.anio === mesMostrado.anio && m.mes === mesMostrado.mes && styles.mesChipActivo,
                      ]}
                      onPress={() => setMesVisible({ anio: m.anio, mes: m.mes })}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.mesChipTexto}>
                        {MESES[m.mes]} {m.anio} ({m.count})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.lista}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#fff" />
        }
        ListEmptyComponent={null}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  fondoWrap: {
    ...(StyleSheet.absoluteFill as object),
    opacity: 0.22,
  },
  fondo: { width: '100%', height: '100%' },
  lista: { paddingBottom: 24 },
  itemWrap: { paddingHorizontal: 16 },
  tituloEventoBloque: {
    marginTop: 14,
    marginBottom: 12,
    alignItems: 'center',
    gap: 2,
  },
  tituloEvento: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Gilroy-Bold',
    textAlign: 'center',
  },
  tituloMes: {
    color: '#1562A2',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Gilroy-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sinEventosBox: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sinEventosTexto: { color: colors.subtext, fontSize: 13 },
  hayEnTexto: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 8,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mesChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  mesChipActivo: { backgroundColor: colors.accent },
  mesChipTexto: { color: colors.accent, fontSize: 12, fontWeight: '700' },
});
