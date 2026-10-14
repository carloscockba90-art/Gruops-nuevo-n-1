import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, ErrorState, Screen, ScreenHeader, SkeletonBlock } from '@/components';
import type { MyEvent } from '@/features/booking/types';
import { useMyEvents } from '@/features/booking/useBooking';
import { categoryIcon } from '@/features/explore/categoryIcon';
import { formatWhen } from '@/lib/format';
import { categoryColors, colors, font, radius, spacing } from '@/theme/tokens';

const STATUS: Record<MyEvent['status'], { label: string; bg: string; fg: string }> = {
  confirmed: { label: 'Confirmada', bg: colors.successSoft, fg: colors.success },
  waitlist: { label: 'Lista de espera', bg: colors.warningSoft, fg: colors.warning },
  pending_payment: { label: 'Pago pendiente', bg: colors.warningSoft, fg: colors.warning },
  cancelled: { label: 'Cancelada', bg: colors.surface, fg: colors.textMuted },
};

// PF_05 Mis eventos: pestañas Próximos / Pasados con el estado de cada reserva.
export default function MisEventos() {
  const router = useRouter();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const { data, isLoading, isError, refetch } = useMyEvents();
  const list = data?.[tab] ?? [];

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Mis eventos" />
      <View style={styles.tabs}>
        {([['upcoming', 'Próximos'], ['past', 'Pasados']] as const).map(([k, l]) => (
          <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: tab === k }} onPress={() => setTab(k)} style={[styles.tab, tab === k && styles.tabOn]}>
            <Text style={[styles.tabText, tab === k && styles.tabTextOn]}>{l}{data ? ` (${data[k].length})` : ''}</Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <><SkeletonBlock height={90} /><SkeletonBlock height={90} /><SkeletonBlock height={90} /></>
      ) : isError ? (
        <ErrorState title="No pudimos cargar tus eventos" onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={40} color={colors.primary} />
          <Text style={styles.h2}>{tab === 'upcoming' ? 'No tienes eventos próximos' : 'Aún no tienes eventos pasados'}</Text>
          <Text style={styles.muted}>{tab === 'upcoming' ? 'Reserva tu próxima experiencia desde Explorar.' : 'Aquí verás los eventos a los que asististe.'}</Text>
          {tab === 'upcoming' ? <Button label="Explorar experiencias" onPress={() => router.push('/(tabs)/explorar')} /> : null}
        </View>
      ) : (
        list.map((e) => {
          const c = categoryColors[e.category ?? ''] ?? categoryColors.default;
          const st = STATUS[e.status];
          return (
            <Pressable key={e.reservation_id} accessibilityRole="button" accessibilityLabel={e.title} onPress={() => router.push({ pathname: '/evento/[id]', params: { id: e.event_id } })} style={styles.card}>
              <View style={[styles.thumb, { backgroundColor: c.bg }]}><Ionicons name={categoryIcon(e.category)} size={28} color={c.fg} /></View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.title} numberOfLines={1}>{e.title}</Text>
                <Text style={styles.muted}>{formatWhen(e.starts_at)}</Text>
                {e.place ? <Text style={styles.muted} numberOfLines={1}>{e.place}</Text> : null}
                <View style={[styles.chip, { backgroundColor: st.bg }]}><Text style={[styles.chipText, { color: st.fg }]}>{st.label}</Text></View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.sm },
  tabOn: { backgroundColor: colors.bg },
  tabText: { fontSize: font.sm, color: colors.textMuted, fontWeight: '600' },
  tabTextOn: { color: colors.primary, fontWeight: '800' },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  thumb: { width: 72, height: 72, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.md, fontWeight: '700', color: colors.text },
  muted: { fontSize: font.sm, color: colors.textMuted },
  chip: { alignSelf: 'flex-start', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  chipText: { fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  h2: { fontSize: font.lg, fontWeight: '800', color: colors.text, textAlign: 'center' },
});
