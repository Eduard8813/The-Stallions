import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAsync } from '../../hooks/useAsync';
import { notificationsService } from '../../services/notificationsService';
import { colors } from '../../constants/ui';
import type {
  NotificationCategoryId,
  NotificationSettings,
  NotificationSettingsPatch,
} from '../../services/userTypes';
import CenterLoading from '../../components/profile/CenterLoading';
import ErrorState from '../../components/profile/ErrorState';
import Section from '../../components/profile/Section';
import ToggleRow from '../../components/profile/ToggleRow';
import Field from '../../components/profile/Field';
import CenteredBox from '../../components/profile/CenteredBox';

type ChannelKey = 'push' | 'email' | 'inApp';

const CATEGORY_META: { id: NotificationCategoryId; label: string }[] = [
  { id: 'tours', label: '🏞️ Recorridos y tours' },
  { id: 'messages', label: '💬 Mensajes' },
  { id: 'events', label: '📅 Eventos' },
  { id: 'promotions', label: '🏷️ Promociones' },
];

const CHANNELS: { key: ChannelKey; label: string }[] = [
  { key: 'push', label: 'Notificaciones push' },
  { key: 'email', label: 'Correo electrónico' },
  { key: 'inApp', label: 'Dentro de la app' },
];

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function mergeSettings(base: NotificationSettings, patch: NotificationSettingsPatch): NotificationSettings {
  const categories = { ...base.categories };
  (Object.keys(patch.categories ?? {}) as NotificationCategoryId[]).forEach((id) => {
    const p = patch.categories![id];
    if (!p) return;
    categories[id] = {
      ...categories[id],
      ...(p.enabled !== undefined ? { enabled: p.enabled } : {}),
      channels: { ...categories[id].channels, ...(p.channels ?? {}) },
    };
  });
  return {
    ...base,
    categories,
    quietHours: { ...base.quietHours, ...(patch.quietHours ?? {}) },
  };
}

export default function NotificationsScreen() {
  const { data, loading, error, refetch, setData } = useAsync(() => notificationsService.getSettings());
  const [banner, setBanner] = useState('');

  const update = (patch: NotificationSettingsPatch) => {
    setBanner('');
    setData((prev) => (prev ? mergeSettings(prev, patch) : prev));
    notificationsService.updateSettings(patch).catch(() => {
      setBanner('No se pudieron guardar los cambios. Se restauraron los anteriores.');
      refetch();
    });
  };

  if (loading) return <CenterLoading />;
  if (error || !data) return <ErrorState message={error ?? 'No se pudieron cargar las notificaciones.'} onRetry={refetch} />;

  const { categories, quietHours } = data;
  const quietStartInvalid = quietHours.enabled && quietHours.start.length > 0 && !TIME_REGEX.test(quietHours.start);
  const quietEndInvalid = quietHours.enabled && quietHours.end.length > 0 && !TIME_REGEX.test(quietHours.end);

  return (
    <CenteredBox>
      {banner ? <Text style={styles.errorText}>{banner}</Text> : null}

      <Section title="Categorías">
        {CATEGORY_META.map((meta, index) => {
          const category = categories[meta.id];
          const lastCategory = index === CATEGORY_META.length - 1;
          return (
            <View key={meta.id}>
              <ToggleRow
                title={meta.label}
                description={category.enabled ? 'Activadas' : 'Silenciadas'}
                value={category.enabled}
                onValueChange={(v) => update({ categories: { [meta.id]: { enabled: v } } })}
              />
              {category.enabled
                ? CHANNELS.map((channel) => (
                    <View key={channel.key} style={styles.channelRow}>
                      <ToggleRow
                        title={channel.label}
                        value={category.channels[channel.key]}
                        onValueChange={(v) =>
                          update({ categories: { [meta.id]: { channels: { [channel.key]: v } } } })
                        }
                      />
                    </View>
                  ))
                : null}
              {lastCategory ? null : <View style={styles.spacer} />}
            </View>
          );
        })}
      </Section>

      <Section title="No molestar">
        <ToggleRow
          title="No molestar"
          description="Silencia todas las notificaciones entre las horas indicadas"
          value={quietHours.enabled}
          onValueChange={(v) => update({ quietHours: { enabled: v } })}
          last={!quietHours.enabled}
        />
        {quietHours.enabled ? (
          <View style={styles.quietFields}>
            <Field
              label="Desde"
              value={quietHours.start}
              onChangeText={(v) => update({ quietHours: { start: v } })}
              placeholder="22:00"
              keyboardType="numbers-and-punctuation"
              error={quietStartInvalid ? 'Formato HH:MM (24 h).' : undefined}
              helper="Ej. 22:00"
            />
            <Field
              label="Hasta"
              value={quietHours.end}
              onChangeText={(v) => update({ quietHours: { end: v } })}
              placeholder="07:00"
              keyboardType="numbers-and-punctuation"
              error={quietEndInvalid ? 'Formato HH:MM (24 h).' : undefined}
              helper="Ej. 07:00"
            />
          </View>
        ) : null}
      </Section>

      <Text style={styles.note}>Los cambios se guardan automáticamente.</Text>
    </CenteredBox>
  );
}

const styles = StyleSheet.create({
  channelRow: { paddingLeft: 24 },
  spacer: { height: 1, backgroundColor: colors.border },
  quietFields: { padding: 14, borderTopWidth: 1, borderTopColor: colors.border },
  errorText: { color: colors.danger, fontSize: 13, marginBottom: 14 },
  note: { color: colors.subtext, fontSize: 12, textAlign: 'center', marginTop: 4 },
});
