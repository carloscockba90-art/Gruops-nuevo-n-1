import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, ErrorState, Screen, ScreenHeader, SkeletonBlock } from '@/components';
import { useFavorites } from '@/features/booking/useBooking';
import { categoryIcon } from '@/features/explore/categoryIcon';
import { useToggleFavorite } from '@/features/explore/useExplore';
import { formatPrice, formatWhen } from '@/lib/format';
import { categoryColors, colors, font, radius, spacing } from '@/theme/tokens';

// EX_04 Mis favoritos: se llega desde el corazón de EX_02. Quitar el corazón saca el evento de la lista.
export default function Favoritos() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useFavorites();
  const toggle = useToggleFavorite();

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Mis favoritos" />
      {isLoading ? (
        <><SkeletonBlock height={190} /><SkeletonBlock height={190} /></>
      ) : isError ? (
        <ErrorState title="No pudimos cargar tus favoritos" onRetry={() => refetch()} />
      ) : data && data.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}><Ionicons name="heart-outline" size={34} color={colors.primary} /></View>
          <Text style={styles.h2}>Aún no tienes favoritos</Text>
          <Text style={styles.mutedC}>Guarda eventos que te interesen para verlos aquí.</Text>
          <Button label="Explorar experiencias" variant="secondary" onPress={() => router.replace('/(tabs)/explorar')} />
        </View>
      ) : (
        data?.map((f) => {
          const c = categoryColors[f.category ?? ''] ?? categoryColors.default;
          return (
            <Pressable key={f.id} accessibilityRole="button" accessibilityLabel={f.title} onPress={() => router.push({ pathname: '/evento/[id]', params: { id: f.id } })} style={styles.card}>
              <View style={[styles.cover, { backgroundColor: c.bg }]}>
                <Ionicons name={categoryIcon(f.category)} size={40} color={c.fg} />
                <Pressable accessibilityRole="button" accessibilityLabel="Quitar de favoritos" onPress={() => toggle.mutate(f.id)} hitSlop={10} style={styles.heart}>
                  <Ionicons name="heart" size={20} color={colors.badge} />
                </Pressable>
              </View>
              <View style={styles.body}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.title}>{f.title}</Text>
                  <Text style={styles.muted}>{f.next_session ? formatWhen(f.next_session) : 'Fecha por definir'}</Text>
                  <Text style={styles.price}>{formatPrice(f.price_cents, f.currency)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
            </Pressable>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.bg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cover: { height: 96, alignItems: 'center', justifyContent: 'center' },
  heart: { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFFFFFE6', alignItems: 'center', justifyContent: 'center' },
  body: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md },
  title: { fontSize: font.md, fontWeight: '700', color: colors.text },
  muted: { fontSize: font.sm, color: colors.textMuted },
  mutedC: { fontSize: font.sm, color: colors.textMuted, textAlign: 'center' },
  price: { fontSize: font.md, fontWeight: '800', color: colors.text },
  empty: { alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  h2: { fontSize: font.lg, fontWeight: '800', color: colors.text },
});
