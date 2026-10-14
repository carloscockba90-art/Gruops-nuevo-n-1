import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, ErrorState, Screen, SkeletonBlock } from '@/components';
import { INTEREST_ICONS, useInterests } from '@/features/auth/interests';
import { rpc } from '@/lib/api';
import { clearInviteToken, readInviteToken } from '@/lib/invite';
import { registerForPush } from '@/lib/push';
import { isDemo } from '@/lib/session';
import { categoryColors, colors, font, spacing } from '@/theme/tokens';

const TINTS = [categoryColors.Bienestar, categoryColors.Deporte, categoryColors.Aire, categoryColors.default];

// AU_05 Onboarding: grid de intereses (selección múltiple) → set_my_interests → accept_invite si hay token → IN_01.
export default function Intereses() {
  const router = useRouter();
  const { data: interests, isLoading, isError, refetch } = useInterests();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function finish() {
    setError(undefined);
    if (isDemo) return router.replace('/(tabs)/inicio');
    setSaving(true);
    try {
      await rpc('set_my_interests', { p_interest_ids: selected });
      const token = await readInviteToken();
      if (token) {
        await rpc('accept_invite', { p_token: token });
        await clearInviteToken();
      }
      registerForPush().catch(() => {}); // no bloquea el onboarding si falla
      router.replace('/(tabs)/inicio');
    } catch {
      setError('No pudimos guardar tus intereses. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <View style={styles.head}>
        <Text style={styles.title}>¿Qué te interesa?</Text>
        <Text style={styles.sub}>Selecciona tus intereses (puedes elegir varios)</Text>
      </View>
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <SkeletonBlock height={300} />
      ) : (
        <View style={styles.grid}>
          {interests?.map((i, idx) => {
            const on = selected.includes(i.id);
            const tint = TINTS[idx % TINTS.length];
            return (
              <Pressable key={i.id} onPress={() => toggle(i.id)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={styles.cell}>
                <View style={[styles.circle, { backgroundColor: tint.bg }, on && styles.circleOn]}>
                  <Ionicons name={INTEREST_ICONS[i.icon ?? ''] ?? 'sparkles-outline'} size={34} color={tint.fg} />
                  {on ? (
                    <View style={styles.tick}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.name, on && { color: colors.primary }]}>{i.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label="Continuar" onPress={finish} loading={saving} disabled={selected.length === 0 || isLoading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: spacing.xs },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  sub: { color: colors.textMuted, fontSize: font.md, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg },
  cell: { width: '33.33%', alignItems: 'center', gap: spacing.sm },
  circle: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
  circleOn: { borderColor: colors.primary },
  tick: { position: 'absolute', right: 0, bottom: 2, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  name: { fontSize: font.md, fontWeight: '600', color: colors.text, textAlign: 'center' },
  error: { textAlign: 'center', color: colors.danger, fontSize: font.sm },
});
