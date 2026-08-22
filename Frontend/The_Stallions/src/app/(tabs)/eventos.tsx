import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAsync } from '../../hooks/useAsync';
import { obtenerEventos } from '../../services/eventosService';
import { colors } from '../../constants/ui';
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
  const router = useRouter();
  const hoy = new Date();
  const [mesVisible, setMesVisible] = useState({ anio: hoy.getFullYear(), mes: hoy.getMonth() });
  const { data, loading, refetch } = useAsync(() => obtenerEventos(), []);

  const eventos = useMemo(() => data ?? [], [data]);
  const eventosDelMes = useMemo(
    () =>
      eventos.filter((e) => {
        const [y, m] = e.fecha.split('-').map(Number);
        return y === mesVisible.anio && m - 1 === mesVisible.mes;
      }),
    [eventos, mesVisible]
  );

  const mesesConEventos = useMemo<MesConEventos[]>(() => {
    const mapa = new Map<string, MesConEventos>();
    for (const e of eventos) {
      const [y, m] = e.fecha.split('-').map(Number);
      const key = `${y}-${m}`;
      const actual = mapa.get(key);
      mapa.set(key, { anio: y, mes: m - 1, count: (actual?.count ?? 0) + 1 });
    }
    return [...mapa.values()].sort((a, b) => a.anio - b.anio || a.mes - b.mes);
  }, [eventos]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Eventos</Text>
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
              mes={mesVisible.mes}
              anio={mesVisible.anio}
              onMesChange={(anio, mes) => setMesVisible({ anio, mes })}
            />
            {eventosDelMes.length > 0 && (
              <Text style={styles.tituloMes}>Eventos de {MESES[mesVisible.mes]}</Text>
            )}
            {eventosDelMes.length === 0 && mesesConEventos.length > 0 && (
              <View style={styles.sinEventosBox}>
                <Text style={styles.sinEventosTexto}>
                  No hay eventos en {MESES[mesVisible.mes]} de {mesVisible.anio}.
                </Text>
                <Text style={styles.hayEnTexto}>Hay eventos en:</Text>
                <View style={styles.chipsRow}>
                  {mesesConEventos.map((m) => (
                    <TouchableOpacity
                      key={`${m.anio}-${m.mes}`}
                      style={[
                        styles.mesChip,
                        m.anio === mesVisible.anio && m.mes === mesVisible.mes && styles.mesChipActivo,
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 16, paddingTop: 8 },
  titulo: { color: colors.text, fontSize: 26, fontWeight: '800' },
  lista: { paddingBottom: 24 },
  itemWrap: { paddingHorizontal: 16 },
  tituloMes: {
    color: colors.subtext,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 16,
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
