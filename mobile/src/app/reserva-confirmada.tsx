import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button, ErrorState, Screen, SkeletonBlock } from '@/components';
import { useReservation } from '@/features/booking/useBooking';
import { categoryIcon } from '@/features/explore/categoryIcon';
import { useEvent } from '@/features/explore/useExplore';
import { formatPrice, formatRange, formatWhen } from '@/lib/format';
import { inviteUrl, shareText } from '@/lib/share';
import { categoryColors, colors, font, radius, spacing } from '@/theme/tokens';

const stamp = (iso: string) => iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// RS_03 Confirmación. Calendario y mapa abren enlaces de Google (sin dependencias nativas); el chat espera CH_03.
export default function ReservaConfirmada() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { data: r, isLoading, isError, refetch } = useReservation(id);
  const { data: e } = useEvent(r?.event.id ?? '');
  const pending = r?.status === 'pending_payment';
  const cat = categoryColors[r?.event.category ?? ''] ?? categoryColors.default;
  const place = e?.address ?? e?.city ?? r?.event.place;

  const calendar = () => {
    if (!r) return;
    const end = r.session.ends_at ?? new Date(new Date(r.session.starts_at).getTime() + 3_600_000).toISOString();
    const q = `action=TEMPLATE&text=${encodeURIComponent(r.event.title)}&dates=${stamp(r.session.starts_at)}/${stamp(end)}&location=${encodeURIComponent(place ?? '')}`;
    Linking.openURL(`https://calendar.google.com/calendar/render?${q}`);
  };
  const map = () => place && Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`);

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      {isLoading ? (
        <><SkeletonBlock height={140} /><SkeletonBlock height={220} /></>
      ) : isError || !r ? (
        <ErrorState title="No pudimos cargar tu reserva" onRetry={() => refetch()} />
      ) : (
        <>
          <View style={styles.head}>
            <View style={[styles.check, pending && { backgroundColor: colors.warningSoft }]}>
              <View style={[styles.checkIn, pending && { backgroundColor: 'transparent' }]}>
                <Ionicons name={pending ? 'time' : 'checkmark'} size={pending ? 44 : 34} color={pending ? colors.warning : '#fff'} />
              </View>
            </View>
            <Text style={styles.title}>{pending ? '¡Reserva recibida!' : '¡Reserva confirmada!'}</Text>
            <Text style={styles.sub}>{pending ? 'Tu cupo está apartado. Falta confirmar tu transferencia.' : 'Tu cupo está listo. Te avisaremos cualquier actualización del grupo.'}</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.cover, { backgroundColor: cat.bg }]}><Ionicons name={categoryIcon(r.event.category)} size={48} color={cat.fg} /></View>
            <View style={styles.cardBody}>
              <Text style={styles.evTitle}>{r.event.title}</Text>
              <Line icon="calendar-outline" text={`${formatWhen(r.session.starts_at).split(' · ')[0]} · ${formatRange(r.session.starts_at, r.session.ends_at)}`} />
              {place ? <Line icon="location-outline" text={place} /> : null}
              {e ? <Line icon="people-outline" text={`${e.participants_count} asistentes`} /> : null}
              <Line icon="cash-outline" text={r.amount_cents ? `${formatPrice(r.amount_cents, r.currency)} por persona` : 'Gratis'} />
              {e ? (
                <View style={styles.host}>
                  <Avatar name={e.host.name} size={44} />
                  <View>
                    <Text style={styles.hostName}>{e.host.name}</Text>
                    <Text style={styles.sub}>{e.host.is_verified ? 'Anfitrión verificado' : 'Anfitrión'}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>

          <Action icon="calendar-outline" label="Agregar al calendario" onPress={calendar} />
          {place ? <Action icon="location-outline" label="Ver ubicación" onPress={map} /> : null}
          <Action icon="chatbubble-outline" label="Ir al chat del grupo" onPress={() => router.push({ pathname: '/proximamente', params: { name: 'Chat del grupo' } })} />
          <Action icon="share-social-outline" label="Compartir evento" onPress={() => shareText(`Mira esta experiencia en Groups: ${r.event.title} ${inviteUrl(`/evento/${r.event.id}`)}`)} />

          <Button label="Ver mis reservas" onPress={() => router.replace('/mis-eventos')} />
          <Button label="Volver al inicio" variant="ghost" onPress={() => router.replace('/(tabs)/inicio')} />
        </>
      )}
    </Screen>
  );
}

function Line({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.line}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <Text style={styles.lineText}>{text}</Text>
    </View>
  );
}

function Action({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.action}>
      <View style={styles.actionIcon}><Ionicons name={icon} size={20} color={colors.primary} /></View>
      <Text style={styles.actionText}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: spacing.sm },
  check: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.successSoft, alignItems: 'center', justifyContent: 'center' },
  checkIn: { backgroundColor: colors.success, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  sub: { fontSize: font.sm, color: colors.textMuted, textAlign: 'center' },
  card: { backgroundColor: colors.bg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cover: { height: 110, alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: spacing.lg, gap: spacing.sm },
  evTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  line: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  lineText: { fontSize: font.md, color: colors.text, flexShrink: 1 },
  host: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md, marginTop: spacing.xs },
  hostName: { fontSize: font.md, fontWeight: '700', color: colors.text },
  action: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  actionIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  actionText: { flex: 1, fontSize: font.md, fontWeight: '600', color: colors.text },
});
