import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyNote, ErrorState, Screen, ScreenHeader, SkeletonBlock } from '@/components';
import { useMarkAllRead, useMarkRead, useNotifications } from '@/features/notifications/useNotifications';
import type { AppNotification, NotificationType } from '@/features/notifications/types';
import { formatAgo, isSameDay } from '@/lib/format';
import { colors, font, spacing } from '@/theme/tokens';

const ICONS: Record<NotificationType, keyof typeof Ionicons.glyphMap> = {
  group_complete: 'people', offers_received: 'mail-open-outline', voting_closing: 'timer-outline', option_selected: 'checkmark-circle-outline',
  demand_expired: 'hourglass-outline', invite_received: 'person-add-outline', group_created: 'sparkles-outline', generic: 'notifications-outline',
};

// IN_02 Notificaciones: secciones Hoy / Anteriores, punto azul si no está leída, "Marcar todas como leídas".
// Tocar una notificación la marca como leída y abre GR_03 (demanda) o Grupos (invitación).
export default function Notificaciones() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  const now = new Date();
  const today = (data ?? []).filter((n) => isSameDay(new Date(n.created_at), now));
  const older = (data ?? []).filter((n) => !isSameDay(new Date(n.created_at), now));
  const hasUnread = (data ?? []).some((n) => !n.read_at);

  function open(n: AppNotification) {
    if (!n.read_at) markRead.mutate(n.id);
    if (n.payload.demand_id) router.push({ pathname: '/grupo-formacion/[id]', params: { id: n.payload.demand_id } });
    else if (n.payload.group_id) router.push('/(tabs)/grupos');
  }

  const Row = ({ n, chevron }: { n: AppNotification; chevron?: boolean }) => (
    <Pressable onPress={() => open(n)} style={styles.item} accessibilityRole="button">
      <View style={styles.icon}>
        <Ionicons name={ICONS[n.type]} size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.itemTitle}>{n.title}</Text>
        {n.body ? <Text style={styles.itemBody} numberOfLines={2}>{n.body}</Text> : null}
        <Text style={styles.ago}>{formatAgo(n.created_at)}</Text>
      </View>
      {!n.read_at ? <View style={styles.dot} /> : chevron ? <Ionicons name="chevron-forward" size={20} color={colors.textMuted} /> : null}
    </Pressable>
  );

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Notificaciones" />
      {hasUnread ? (
        <Pressable onPress={() => markAll.mutate()} style={{ alignSelf: 'flex-end' }}>
          <Text style={styles.markAll}>Marcar todas como leídas</Text>
        </Pressable>
      ) : null}
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <><SkeletonBlock /><SkeletonBlock /><SkeletonBlock /></>
      ) : (data ?? []).length === 0 ? (
        <EmptyNote text="Aún no tienes notificaciones. Te avisaremos cuando tu grupo avance." />
      ) : (
        <>
          {today.length > 0 ? <Text style={styles.section}>Hoy</Text> : null}
          {today.map((n) => <Row key={n.id} n={n} />)}
          {older.length > 0 ? <Text style={styles.section}>Anteriores</Text> : null}
          {older.map((n) => <Row key={n.id} n={n} chevron />)}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  markAll: { color: colors.primary, fontWeight: '600', fontSize: font.md },
  section: { fontSize: font.xl, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: font.md, fontWeight: '800', color: colors.text },
  itemBody: { fontSize: font.sm, color: colors.textMuted },
  ago: { fontSize: 12, color: colors.textMuted },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
});
