import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, ErrorState, Screen, ScreenHeader, SkeletonBlock } from '@/components';
import { INTEREST_ICONS, useInterests, type Interest } from '@/features/auth/interests';
import { useMe, useSaveInterests } from '@/features/profile/useMe';
import { colors, font, radius, spacing } from '@/theme/tokens';

const POPULAR = 6; // hasta tener métricas reales, "Más populares" = los primeros del catálogo

// PF_04 Mis intereses: buscador + chips; Guardar intereses (n) → set_my_interests → vuelve a PF_01.
export default function MisIntereses() {
  const router = useRouter();
  const all = useInterests();
  const me = useMe();
  const loading = all.isLoading || me.isLoading;
  const failed = all.isError || me.isError;

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Mis intereses" subtitle="Selecciona los temas que te interesan" />
      {loading ? (
        <SkeletonBlock height={300} />
      ) : failed || !all.data || !me.data ? (
        <ErrorState title="No pudimos cargar tus intereses" onRetry={() => { all.refetch(); me.refetch(); }} />
      ) : (
        <Picker interests={all.data} initial={me.data.interests} onDone={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/perfil'))} />
      )}
    </Screen>
  );
}

function Picker({ interests, initial, onDone }: { interests: Interest[]; initial: string[]; onDone: () => void }) {
  const save = useSaveInterests();
  const [sel, setSel] = useState<string[]>(initial);
  const [q, setQ] = useState('');
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 20 ? s : [...s, id]));
  const match = (i: Interest) => i.name.toLowerCase().includes(q.trim().toLowerCase());
  const popular = interests.slice(0, POPULAR).filter(match);
  const rest = interests.slice(POPULAR).filter(match);

  const chips = (list: Interest[]) => (
    <View style={styles.wrap}>
      {list.map((i) => {
        const on = sel.includes(i.id);
        return (
          <Pressable key={i.id} accessibilityRole="checkbox" accessibilityLabel={i.name} accessibilityState={{ checked: on }} onPress={() => toggle(i.id)} style={[styles.chip, on && styles.chipOn]}>
            <Ionicons name={INTEREST_ICONS[i.icon ?? ''] ?? 'sparkles-outline'} size={16} color={on ? '#fff' : colors.primary} />
            <Text style={[styles.chipText, on && { color: '#fff' }]}>{i.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <>
      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput value={q} onChangeText={setQ} placeholder="Buscar intereses…" placeholderTextColor={colors.textMuted} accessibilityLabel="Buscar intereses" style={styles.input} />
      </View>
      {popular.length ? <><Text style={styles.h2}>Más populares</Text>{chips(popular)}</> : null}
      {rest.length ? <><Text style={styles.h2}>Todos los intereses</Text>{chips(rest)}</> : null}
      {!popular.length && !rest.length ? <Text style={styles.muted}>No encontramos intereses con “{q}”.</Text> : null}
      {save.isError ? <Text style={styles.error}>No pudimos guardar tus intereses. Inténtalo de nuevo.</Text> : null}
      <Button label={`Guardar intereses (${sel.length})`} disabled={sel.length === 0} loading={save.isPending} onPress={() => save.mutate(sel, { onSuccess: onDone })} />
    </>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, minHeight: 46 },
  input: { flex: 1, fontSize: font.md, color: colors.text, ...(typeof document !== 'undefined' ? ({ outlineStyle: 'none' } as object) : {}) },
  h2: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: font.sm, fontWeight: '600', color: colors.text },
  muted: { color: colors.textMuted, fontSize: font.sm },
  error: { color: colors.danger, fontSize: font.sm },
});
