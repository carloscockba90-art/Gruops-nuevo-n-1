import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, ErrorState, Screen, SkeletonBlock, WizardHeader } from '@/components';
import { clearDraft, patchDraft, ROUTE_FOR_STEP, useDraft, useDraftOrEmpty, type EventDraft } from '@/features/create/draft';
import { categoryIcon } from '@/features/explore/categoryIcon';
import { useCategories } from '@/features/explore/useExplore';
import { categoryColors, colors, font, radius, spacing } from '@/theme/tokens';

const MODES: { key: EventDraft['modality']; title: string; text: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'presencial', title: 'Presencial', text: 'Encuentro en un lugar físico', icon: 'people-outline' },
  { key: 'online', title: 'Online', text: 'Clase o reunión virtual', icon: 'desktop-outline' },
];

// EV_01 Crear evento: modalidad + categoría. Es la pantalla de la pestaña Crear; el borrador se guarda en el dispositivo.
export default function Crear() {
  const router = useRouter();
  const draft = useDraft();
  const d = useDraftOrEmpty();
  const cats = useCategories();
  const hasWork = !!draft && (draft.step !== 'modalidad' || !!draft.title);

  return (
    <Screen>
      {hasWork && draft ? (
        <View style={styles.draft}>
          <Ionicons name="document-text-outline" size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.draftTitle}>Tienes un borrador{draft.title ? `: ${draft.title}` : ''}</Text>
            <View style={styles.draftActions}>
              <Pressable accessibilityRole="button" onPress={() => router.push(ROUTE_FOR_STEP[draft.step] as '/evento-nuevo/informacion')}><Text style={styles.link}>Continuar</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={clearDraft}><Text style={styles.linkMuted}>Empezar de nuevo</Text></Pressable>
            </View>
          </View>
        </View>
      ) : null}

      <WizardHeader step={1} label="Tipo y categoría" onBack={() => router.replace('/(tabs)/inicio')} />
      <Text style={styles.h2}>¿Qué tipo de evento?</Text>
      <View style={styles.pair}>
        {MODES.map((m) => {
          const on = d.modality === m.key;
          return (
            <Pressable key={m.key} accessibilityRole="radio" accessibilityLabel={m.title} accessibilityState={{ selected: on }} onPress={() => patchDraft({ modality: m.key, step: draft?.step ?? 'modalidad' })} style={[styles.mode, on && styles.modeOn]}>
              <Ionicons name={m.icon} size={32} color={on ? colors.primary : colors.text} />
              <Text style={[styles.modeTitle, on && { color: colors.primary }]}>{m.title}</Text>
              <Text style={styles.modeText}>{m.text}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.h2}>Categoría</Text>
      {cats.isLoading ? (
        <SkeletonBlock height={200} />
      ) : cats.isError ? (
        <ErrorState title="No pudimos cargar las categorías" onRetry={() => cats.refetch()} />
      ) : (
        <View style={styles.grid}>
          {cats.data?.map((c) => {
            const on = d.categoryId === c.id;
            const tint = categoryColors[c.name] ?? categoryColors.default;
            return (
              <Pressable key={c.id} accessibilityRole="radio" accessibilityLabel={c.name} accessibilityState={{ selected: on }} onPress={() => patchDraft({ categoryId: c.id, step: draft?.step ?? 'modalidad' })} style={[styles.cat, on && { backgroundColor: tint.bg, borderColor: tint.fg }]}>
                <Ionicons name={categoryIcon(c.name)} size={26} color={on ? tint.fg : colors.text} />
                <Text style={[styles.catText, on && { color: tint.fg, fontWeight: '700' }]}>{c.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
      <Button label="Siguiente" disabled={!d.categoryId} onPress={() => { patchDraft({ step: 'informacion' }); router.push('/evento-nuevo/informacion'); }} />
      <Pressable accessibilityRole="button" onPress={() => router.push('/lucas')} style={styles.lucas}>
        <Ionicons name="sparkles" size={18} color={colors.primary} />
        <Text style={styles.link}>¿Prefieres que Lucas te ayude? Hablar con Lucas</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  draft: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.md },
  draftTitle: { fontSize: font.md, fontWeight: '700', color: colors.text },
  draftActions: { flexDirection: 'row', gap: spacing.lg, marginTop: 4 },
  link: { color: colors.primary, fontWeight: '700', fontSize: font.md },
  linkMuted: { color: colors.textMuted, fontWeight: '600', fontSize: font.md },
  h2: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  pair: { flexDirection: 'row', gap: spacing.md },
  mode: { flex: 1, alignItems: 'center', gap: spacing.xs, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg },
  modeOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  modeTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  modeText: { fontSize: font.sm, color: colors.textMuted, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cat: { width: '31%', flexGrow: 1, minHeight: 88, alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm },
  catText: { fontSize: font.sm, color: colors.text, textAlign: 'center' },
  lucas: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.sm },
});
