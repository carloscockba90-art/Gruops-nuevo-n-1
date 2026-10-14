import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Chip } from '@/components';
import { categoryIcon } from '@/features/explore/categoryIcon';
import {
  applyFilters, ORDER_LABELS, resetFilters, setFilters, useFilters,
  type DateFilter, type Modality, type OrderBy, type PriceRange, type Slot,
} from '@/features/explore/filters';
import { useCategories, useEvents } from '@/features/explore/useExplore';
import { colors, font, radius, spacing } from '@/theme/tokens';

const DATES: [DateFilter, string][] = [['any', 'Cualquier fecha'], ['today', 'Hoy'], ['week', 'Esta semana'], ['month', 'Este mes']];
const SLOTS: [Slot, string, string][] = [['morning', 'Mañana', '6:00 – 12:00'], ['afternoon', 'Tarde', '12:00 – 18:00'], ['night', 'Noche', '18:00 – 24:00']];
const PRICES: [PriceRange, string][] = [['any', 'Cualquiera'], ['free', 'Gratis'], ['low', '$1.000 – $10.000'], ['mid', '$10.000 – $30.000'], ['high', '$30.000+']];
const MODES: [Modality, string][] = [['all', 'Todas'], ['presencial', 'Presencial'], ['online', 'Online']];

// EX_02a + EX_02b: Filtros. Los cambios se aplican al instante; "Ver N resultados" solo cierra el modal.
// Nivel, duración, tamaño del grupo y "personas" aparecen como en el diseño pero todavía no filtran (el backend no tiene esos datos).
export default function Filtros() {
  const router = useRouter();
  const f = useFilters();
  const cats = useCategories();
  const { data } = useEvents(f.query, f.categoryId);
  const count = applyFilters(data?.items ?? [], f).length;

  const toggleSlot = (s: Slot) => setFilters({ slots: f.slots.includes(s) ? f.slots.filter((x) => x !== s) : [...f.slots, s] });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
      <View style={styles.head}>
        <Pressable accessibilityLabel="Cerrar" onPress={() => router.back()} hitSlop={10}><Ionicons name="close" size={26} color={colors.text} /></Pressable>
        <Text style={styles.title}>Filtros</Text>
        <Pressable accessibilityRole="button" onPress={() => resetFilters()}><Text style={styles.clear}>Limpiar todo</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        <Section title="Fecha">
          <View style={styles.wrap}>
            {DATES.map(([k, l]) => <Chip key={k} label={l} selected={f.date === k} onPress={() => setFilters({ date: k })} />)}
            <Chip label="Personalizar" disabled />
          </View>
        </Section>

        <Section title="Horario">
          <View style={styles.wrap}>
            {SLOTS.map(([k, l, h]) => <Chip key={k} label={`${l} (${h})`} selected={f.slots.includes(k)} onPress={() => toggleSlot(k)} />)}
          </View>
        </Section>

        <Section title="Precio (por persona)">
          <View style={styles.wrap}>
            {PRICES.map(([k, l]) => <Chip key={k} label={l} selected={f.price === k} onPress={() => setFilters({ price: k })} />)}
          </View>
        </Section>

        <Section title="Categorías">
          <View style={styles.grid}>
            {[{ id: null as string | null, name: 'Todas' }, ...(cats.data ?? [])].map((c) => {
              const on = f.categoryId === c.id;
              return (
                <Pressable key={c.id ?? 'all'} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setFilters({ categoryId: c.id })} style={[styles.cat, on && styles.catOn]}>
                  <Ionicons name={c.id ? categoryIcon(c.name) : 'apps'} size={24} color={on ? '#fff' : colors.textMuted} />
                  <Text style={[styles.catText, on && { color: '#fff', fontWeight: '700' }]}>{c.name}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Tipo de actividad">
          <View style={styles.wrap}>
            {MODES.map(([k, l]) => <Chip key={k} label={l} selected={f.modality === k} onPress={() => setFilters({ modality: k })} />)}
          </View>
        </Section>

        <Section title="Nivel de dificultad" soon>
          <View style={styles.wrap}>{['Todos', 'Principiante', 'Intermedio', 'Avanzado'].map((l, i) => <Chip key={l} label={l} selected={i === 0} disabled />)}</View>
        </Section>
        <Section title="Duración" soon>
          <Text style={styles.muted}>Cualquier duración</Text>
        </Section>
        <Section title="Tamaño del grupo" soon>
          <View style={styles.wrap}>{['Todos', '1–5', '6–15', '16–30', '30+'].map((l, i) => <Chip key={l} label={l} selected={i === 0} disabled />)}</View>
        </Section>
        <Section title="Personas" soon>
          <View style={styles.wrap}>{['Solo con cupos disponibles', 'Solo verificados', 'Solo mis amigos'].map((l) => <Chip key={l} label={l} disabled />)}</View>
        </Section>

        <Section title="Ordenar por">
          {(Object.keys(ORDER_LABELS) as OrderBy[]).map((k) => (
            <Pressable key={k} accessibilityRole="radio" accessibilityState={{ selected: f.order === k }} onPress={() => setFilters({ order: k })} style={styles.radioRow}>
              <View style={[styles.radio, f.order === k && styles.radioOn]}>{f.order === k ? <View style={styles.radioDot} /> : null}</View>
              <Text style={styles.radioText}>{ORDER_LABELS[k]}</Text>
            </Pressable>
          ))}
        </Section>
      </ScrollView>
      <View style={styles.footer}>
        <Button label={`Ver ${count} ${count === 1 ? 'resultado' : 'resultados'}`} onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

function Section({ title, soon, children }: { title: string; soon?: boolean; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {soon ? <View style={styles.soon}><Text style={styles.soonText}>Pronto</Text></View> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, width: '100%', maxWidth: 520, alignSelf: 'center' },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  clear: { color: colors.primary, fontSize: font.md, fontWeight: '600' },
  body: { padding: spacing.lg, paddingTop: 0, gap: spacing.xl, width: '100%', maxWidth: 520, alignSelf: 'center' },
  section: { gap: spacing.md },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  soon: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  soonText: { fontSize: 11, color: colors.textMuted, fontWeight: '700' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  muted: { color: colors.textMuted, fontSize: font.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cat: { width: '23%', minWidth: 74, aspectRatio: 1, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 4 },
  catOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  catText: { fontSize: 11, color: colors.text, textAlign: 'center' },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  radioText: { fontSize: font.md, color: colors.text },
  footer: { padding: spacing.lg, width: '100%', maxWidth: 520, alignSelf: 'center', borderTopWidth: 1, borderTopColor: colors.border },
});
