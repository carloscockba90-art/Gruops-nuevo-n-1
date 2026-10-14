import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryColors, colors, font, radius, spacing } from '@/theme/tokens';
import { dateBlock, formatPrice, formatRange } from '@/lib/format';
import { categoryIcon } from '@/features/explore/categoryIcon';
import type { EventItem } from '@/features/explore/types';

type P = { event: EventItem; onPress: () => void; onToggleFavorite: () => void };

// Tarjeta de resultado de Explorar (EX_02). Sin foto aún: bloque de color por categoría.
export function ExperienceCard({ event: e, onPress, onToggleFavorite }: P) {
  const c = categoryColors[e.category ?? ''] ?? categoryColors.default;
  const d = dateBlock(e.next_session);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={e.title} style={styles.card}>
      <View style={[styles.cover, { backgroundColor: c.bg }]}>
        <Ionicons name={categoryIcon(e.category)} size={44} color={c.fg} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={e.is_favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          onPress={onToggleFavorite}
          hitSlop={10}
          style={styles.heart}
        >
          <Ionicons name={e.is_favorite ? 'heart' : 'heart-outline'} size={22} color={e.is_favorite ? colors.badge : colors.text} />
        </Pressable>
      </View>
      <View style={styles.body}>
        <View style={styles.date}>
          <Text style={styles.dow}>{d.dow}</Text>
          <Text style={styles.day}>{d.day}</Text>
          <Text style={styles.dow}>{d.mon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{e.title}</Text>
          {e.place || e.city ? <Row icon="location-outline" text={e.place ?? e.city ?? ''} /> : null}
          {e.next_session ? <Row icon="time-outline" text={formatRange(e.next_session)} /> : null}
          {e.attendees_count ? <Row icon="people-outline" text={`${e.attendees_count} participantes`} /> : null}
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.price}>{formatPrice(e.price_cents, e.currency)}</Text>
          {e.price_cents > 0 ? <Text style={styles.per}>por persona</Text> : null}
        </View>
      </View>
      <View style={styles.footer}>
        {e.category ? (
          <View style={[styles.tag, { backgroundColor: c.bg }]}><Text style={[styles.tagText, { color: c.fg }]}>{e.category}</Text></View>
        ) : null}
        {e.avg_rating ? (
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#F5A524" />
            <Text style={styles.ratingText}>{e.avg_rating.toFixed(1)} <Text style={styles.muted}>({e.review_count})</Text></Text>
          </View>
        ) : <Text style={styles.muted}>Nuevo</Text>}
      </View>
    </Pressable>
  );
}

function Row({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={styles.muted} numberOfLines={1}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.bg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cover: { height: 92, alignItems: 'center', justifyContent: 'center' },
  heart: { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFFCC', alignItems: 'center', justifyContent: 'center' },
  body: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, paddingBottom: spacing.sm },
  date: { width: 44, alignItems: 'center' },
  dow: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  day: { fontSize: font.xl, fontWeight: '800', color: colors.primary, lineHeight: 26 },
  info: { flex: 1, gap: 3 },
  title: { fontSize: font.md, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  muted: { fontSize: font.sm, color: colors.textMuted, flexShrink: 1 },
  priceCol: { alignItems: 'flex-end', justifyContent: 'flex-end' },
  price: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  per: { fontSize: 11, color: colors.textMuted },
  footer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  tag: { borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 4 },
  tagText: { fontSize: 12, fontWeight: '700' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: font.sm, fontWeight: '700', color: colors.text },
});
