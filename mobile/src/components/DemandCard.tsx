import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '@/theme/tokens';
import type { DemandProgress } from '@/features/home/types';

// Tarjeta de demanda ("grupo en formación") en IN_01. Tocarla abre GR_03.
export function DemandCard({ demand, onPress }: { demand: DemandProgress; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.card}>
      <Ionicons name="person-add" size={34} color={colors.primary} />
      <View style={styles.info}>
        <View style={styles.title}>
          <Ionicons name="sparkles" size={14} color={colors.primary} />
          <Text style={styles.titleText}>{demand.title}</Text>
        </View>
        {demand.when_label || demand.place ? (
          <Text style={styles.meta}>{[demand.when_label, demand.place].filter(Boolean).join('  ·  ')}</Text>
        ) : (
          <Text style={styles.meta}>Faltan {demand.missing} para completar el grupo</Text>
        )}
        {demand.note ? <Text style={styles.note}>{demand.note}</Text> : null}
      </View>
      <View style={styles.cta}>
        <Text style={styles.ctaText}>Unirme</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.lucasTint, borderRadius: radius.lg, padding: spacing.md },
  info: { flex: 1, gap: 2 },
  title: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  titleText: { fontSize: font.md, fontWeight: '800', color: colors.text, flexShrink: 1 },
  meta: { fontSize: font.sm, color: colors.textMuted },
  note: { fontSize: 12, color: colors.textMuted },
  cta: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: 10 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: font.md },
});
