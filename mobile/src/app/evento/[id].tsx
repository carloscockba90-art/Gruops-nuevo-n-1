import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, AvatarStack, Button, ErrorState, SkeletonBlock } from '@/components';
import { categoryIcon } from '@/features/explore/categoryIcon';
import { useEvent, useToggleFavorite } from '@/features/explore/useExplore';
import { dateBlock, formatPrice, formatRange, formatWhen } from '@/lib/format';
import { categoryColors, colors, font, radius, spacing } from '@/theme/tokens';

// EX_03 Detalle de experiencia. Reservar (RS_01) llega en la Ola 3: por ahora abre una pantalla "Próximamente".
export default function EventoDetalle() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { data: e, isLoading, isError, refetch } = useEvent(id);
  const fav = useToggleFavorite();
  const [picked, setPicked] = useState<string>();

  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/explorar'));
  const cat = categoryColors[e?.category?.name ?? ''] ?? categoryColors.default;
  const session = e?.sessions.find((s) => s.id === picked) ?? e?.sessions[0];
  const finished = !!e && e.sessions.length === 0;
  const soldOut = !!session && session.spots_left === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={[styles.hero, { backgroundColor: cat.bg }]}>
          {e ? <Ionicons name={categoryIcon(e.category?.name)} size={72} color={cat.fg} /> : null}
          <Pressable accessibilityLabel="Volver" onPress={back} hitSlop={10} style={[styles.round, { left: spacing.lg }]}>
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
          {e ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={e.is_favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              onPress={() => fav.mutate(e.id)}
              hitSlop={10}
              style={[styles.round, { right: spacing.lg }]}
            >
              <Ionicons name={e.is_favorite ? 'heart' : 'heart-outline'} size={22} color={e.is_favorite ? colors.badge : colors.text} />
            </Pressable>
          ) : null}
        </View>

        {isLoading ? (
          <View style={styles.pad}><SkeletonBlock height={40} /><SkeletonBlock height={120} /><SkeletonBlock height={80} /></View>
        ) : isError || !e ? (
          <ErrorState title="No pudimos cargar esta experiencia" onRetry={() => refetch()} />
        ) : (
          <View style={styles.pad}>
            <Text style={styles.title}>{e.title}</Text>
            {finished ? <View style={styles.notice}><Ionicons name="time-outline" size={18} color={colors.textMuted} /><Text style={styles.noticeText}>Este evento ya se realizó.</Text></View> : null}

            <View style={styles.facts}>
              {session ? <Fact icon="calendar-outline" text={`${formatWhen(session.starts_at).split(' · ')[0]} · ${formatRange(session.starts_at, session.ends_at)}`} /> : null}
              <Fact icon="location-outline" text={[e.address, e.city].filter(Boolean).join(', ') || (e.modality === 'online' ? 'Online' : 'Lugar por confirmar')} />
              <Fact icon="people-outline" text={`${e.participants_count} ${e.participants_count === 1 ? 'asistente' : 'asistentes'}`} />
              <Fact icon="cash-outline" text={e.price_cents ? `${formatPrice(e.price_cents, e.currency)} por persona` : 'Gratis'} bold />
            </View>

            {e.participants.length ? (
              <View style={styles.row}>
                <AvatarStack people={e.participants} extra={Math.max(e.participants_count - e.participants.length, 0)} />
              </View>
            ) : null}

            {e.description ? <Text style={styles.desc}>{e.description}</Text> : null}

            <View style={styles.host}>
              <Avatar name={e.host.name} size={52} />
              <View style={{ flex: 1 }}>
                <Text style={styles.hostName}>{e.host.name}</Text>
                <View style={styles.row}>
                  <Text style={styles.muted}>{e.host.is_verified ? 'Anfitrión verificado' : 'Anfitrión'}</Text>
                  {e.host.is_verified ? <Ionicons name="checkmark-circle" size={16} color={colors.primary} /> : null}
                </View>
              </View>
            </View>

            {e.sessions.length > 1 ? (
              <View style={styles.block}>
                <Text style={styles.h2}>Elige una fecha</Text>
                {e.sessions.map((s) => {
                  const d = dateBlock(s.starts_at);
                  const on = s.id === session?.id;
                  return (
                    <Pressable key={s.id} accessibilityRole="radio" accessibilityState={{ selected: on }} onPress={() => setPicked(s.id)} style={[styles.sess, on && styles.sessOn]}>
                      <Text style={styles.sessDay}>{d.dow} {d.day} {d.mon}</Text>
                      <Text style={styles.muted}>{formatRange(s.starts_at, s.ends_at)}</Text>
                      <Text style={[styles.spots, s.spots_left === 0 && { color: colors.danger }]}>{s.spots_left === 0 ? 'Sin cupos' : s.spots_left != null ? `${s.spots_left} cupos` : ''}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            {e.rating.count > 0 ? (
              <View style={styles.block}>
                <View style={styles.row}>
                  <Ionicons name="star" size={18} color="#F5A524" />
                  <Text style={styles.h2}>{e.rating.avg?.toFixed(1)} <Text style={styles.muted}>({e.rating.count} reseñas)</Text></Text>
                </View>
                {e.reviews.map((r, i) => (
                  <View key={i} style={styles.review}>
                    <Avatar name={r.author.name} size={32} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.hostName}>{r.author.name}</Text>
                      {r.comment ? <Text style={styles.muted}>{r.comment}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {e.group_id ? (
              <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/grupo/[id]', params: { id: e.group_id! } })} style={styles.group}>
                <Ionicons name="people" size={20} color={colors.primary} />
                <Text style={styles.groupText}>Ver el grupo de este evento</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
              </Pressable>
            ) : null}
          </View>
        )}
      </ScrollView>
      {e ? (
        <View style={styles.footer}>
          <Button
            label={finished ? 'Evento finalizado' : soldOut ? 'Sin cupos' : 'Reservar'}
            disabled={finished || soldOut}
            onPress={() => router.push({ pathname: '/reservar/[id]', params: { id: e.id, sessionId: session?.id } })}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function Fact({ icon, text, bold }: { icon: keyof typeof Ionicons.glyphMap; text: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.factText, bold && { fontWeight: '800' }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingBottom: spacing.xl },
  hero: { height: 220, alignItems: 'center', justifyContent: 'center' },
  round: { position: 'absolute', top: spacing.lg, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFFE6', alignItems: 'center', justifyContent: 'center' },
  pad: { padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  notice: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  noticeText: { color: colors.textMuted, fontSize: font.md },
  facts: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  factText: { fontSize: font.md, color: colors.text },
  desc: { fontSize: font.md, color: colors.text, lineHeight: 22 },
  host: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
  hostName: { fontSize: font.md, fontWeight: '700', color: colors.text },
  muted: { fontSize: font.sm, color: colors.textMuted },
  block: { gap: spacing.md },
  h2: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  sess: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  sessOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  sessDay: { fontSize: font.md, fontWeight: '700', color: colors.text, flex: 1 },
  spots: { fontSize: font.sm, fontWeight: '700', color: colors.success },
  review: { flexDirection: 'row', gap: spacing.md },
  group: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md },
  groupText: { flex: 1, color: colors.primary, fontWeight: '700', fontSize: font.md },
  footer: { padding: spacing.lg, width: '100%', maxWidth: 520, alignSelf: 'center', borderTopWidth: 1, borderTopColor: colors.border },
});
