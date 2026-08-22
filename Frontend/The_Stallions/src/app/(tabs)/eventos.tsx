import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
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
});
