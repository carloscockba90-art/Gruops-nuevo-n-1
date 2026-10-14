import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, ErrorState, Screen, ScreenHeader, SkeletonBlock } from '@/components';
import { useConfirmReservation, useCreateHold } from '@/features/booking/useBooking';
import { categoryIcon } from '@/features/explore/categoryIcon';
import { useEvent } from '@/features/explore/useExplore';
import { dateBlock, formatPrice, formatRange } from '@/lib/format';
import { categoryColors, colors, font, radius, spacing } from '@/theme/tokens';

// RS_01 Reserva: resumen del evento + sesiones con cupos. Continuar aparta el cupo 10 minutos.
// Evento gratis: se confirma directo. Evento de pago: sigue a RS_02.
export default function Reservar() {
  const { id = '', sessionId } = useLocalSearchParams<{ id?: string; sessionId?: string }>();
  const router = useRouter();
  const { data: e, isLoading, isError, refetch } = useEvent(id);
  const hold = useCreateHold();
  const confirm = useConfirmReservation();
  const [picked, setPicked] = useState<string | undefined>(sessionId);
  const [error, setError] = useState<string>();

  const session = e?.sessions.find((s) => s.id === picked) ?? e?.sessions.find((s) => s.spots_left !== 0);
  const cat = categoryColors[e?.category?.name ?? ''] ?? categoryColors.default;
  const free = !!e && e.price_cents === 0;
  const busy = hold.isPending || confirm.isPending;

  async function next() {
    if (!e || !session) return;
    setError(undefined);
    try {
      const r = await hold.mutateAsync({ eventId: e.id, sessionId: session.id });
      if (free) {
        const done = await confirm.mutateAsync({ reservationId: r.id, choice: null });
        router.replace({ pathname: '/reserva-confirmada', params: { id: done.id } });
      } else {
        router.push({ pathname: '/pago', params: { id: r.id } });
      }
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      setError(code === 'session_full' ? 'Alguien tomó el último cupo de esa sesión. Elige otra.' : 'No pudimos apartar tu cupo. Inténtalo de nuevo.');
      refetch();
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Reservar" />
      {isLoading ? (
        <><SkeletonBlock height={110} /><SkeletonBlock height={220} /></>
      ) : isError || !e ? (
        <ErrorState title="No pudimos cargar esta experiencia" onRetry={() => refetch()} />
      ) : e.sessions.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="time-outline" size={40} color={colors.textMuted} />
          <Text style={styles.h2}>No hay fechas disponibles</Text>
          <Text style={styles.muted}>Este evento ya se realizó o no tiene sesiones próximas.</Text>
          <Button label="Volver" variant="secondary" onPress={() => router.back()} />
        </View>
      ) : (
        <>
          <View style={styles.summary}>
            <View style={[styles.thumb, { backgroundColor: cat.bg }]}><Ionicons name={categoryIcon(e.category?.name)} size={34} color={cat.fg} /></View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.title}>{e.title}</Text>
              {session ? <Text style={styles.muted}>{dateBlock(session.starts_at).dow} {dateBlock(session.starts_at).day} {dateBlock(session.starts_at).mon} · {formatRange(session.starts_at, session.ends_at)}</Text> : null}
              <View style={styles.row}><Ionicons name="location-outline" size={14} color={colors.textMuted} /><Text style={styles.muted}>{e.address ?? e.city ?? 'Online'}</Text></View>
            </View>
          </View>

          <Text style={styles.h2}>Selecciona una sesión</Text>
          {e.sessions.map((s) => {
            const d = dateBlock(s.starts_at);
            const out = s.spots_left === 0;
            const on = s.id === session?.id;
            return (
              <Pressable key={s.id} accessibilityRole="radio" accessibilityLabel={`${d.dow} ${d.day} ${d.mon}`} accessibilityState={{ selected: on, disabled: out }} disabled={out} onPress={() => setPicked(s.id)} style={[styles.sess, on && styles.sessOn, out && { opacity: 0.55 }]}>
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessDay}>{d.dow} {d.day} {d.mon}</Text>
                  <Text style={styles.muted}>{formatRange(s.starts_at, s.ends_at)}</Text>
                </View>
                <Text style={[styles.spots, out && { color: colors.danger }]}>{out ? 'Sin cupos' : s.spots_left != null ? `${s.spots_left} cupos` : 'Con cupos'}</Text>
              </Pressable>
            );
          })}

          {session ? (
            <View style={styles.total}>
              <Text style={styles.muted}>Total</Text>
              <Text style={styles.price}>{free ? 'Gratis' : formatPrice(e.price_cents, e.currency)}</Text>
            </View>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label={free ? 'Confirmar reserva' : 'Continuar'} onPress={next} loading={busy} disabled={!session} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  thumb: { width: 84, height: 84, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  muted: { fontSize: font.sm, color: colors.textMuted },
  h2: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  sess: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.lg },
  sessOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  sessDay: { fontSize: font.md, fontWeight: '700', color: colors.text },
  spots: { fontSize: font.sm, fontWeight: '700', color: colors.success },
  total: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  error: { color: colors.danger, fontSize: font.sm },
  center: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
});
