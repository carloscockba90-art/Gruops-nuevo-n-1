import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryColors, colors, font, radius, spacing } from '@/theme/tokens';
import { formatWhen } from '@/lib/format';
import type { RecommendedEvent } from '@/features/home/types';
import { AvatarStack } from './AvatarStack';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Bienestar: 'leaf-outline',
  Aire: 'trail-sign-outline',
  Deporte: 'tennisball-outline',
};

// Tarjeta de "Recomendado para ti". Sin foto aún: bloque de color por categoría.
export function EventCard({ event, width, onPress }: { event: RecommendedEvent; width: number; onPress: () => void }) {
  const cat = categoryColors[event.category ?? ''] ?? categoryColors.default;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.card, { width }]}>
      <View style={[styles.cover, { backgroundColor: cat.bg }]}>
        <Ionicons name={ICONS[event.category ?? ''] ?? 'calendar-outline'} size={56} color={cat.fg} />
        <Ionicons name="heart-outline" size={26} color="#fff" style={styles.heart} />
        <Text style={styles.coverTitle}>{event.title}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.meta}>
          <View style={styles.metaCol}>
            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
              <Text style={styles.metaText}>{formatWhen(event.next_session)}</Text>
            </View>
            {event.place ? (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={16} color={colors.textMuted} />
                <Text style={styles.metaText}>{event.place}</Text>
              </View>
            ) : null}
          </View>
          {event.category ? (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{event.category}</Text>
            </View>
          ) : null}
        </View>
        {event.attendees ? (
          <View style={styles.people}>
            <AvatarStack people={event.attendees.avatars} extra={Math.max(event.attendees.count - event.attendees.avatars.length, 0)} />
            <Text style={styles.peopleText}>{event.attendees.names}{'\n'}que podrías conocer asistirán</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.bg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cover: { height: 150, alignItems: 'center', justifyContent: 'center' },
  heart: { position: 'absolute', top: spacing.md, right: spacing.md },
  coverTitle: { position: 'absolute', left: spacing.lg, bottom: spacing.md, fontSize: font.xl, fontWeight: '800', color: colors.text },
  body: { padding: spacing.md, gap: spacing.md },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  metaCol: { gap: 4, flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: colors.textMuted, fontSize: font.md },
  tag: { backgroundColor: colors.successSoft, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 6 },
  tagText: { color: colors.success, fontWeight: '600', fontSize: font.sm },
  people: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  peopleText: { color: colors.textMuted, fontSize: font.sm, flexShrink: 1 },
});
