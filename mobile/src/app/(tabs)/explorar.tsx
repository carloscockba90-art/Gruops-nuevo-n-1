import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Chip, ErrorState, ExperienceCard, Screen, SkeletonBlock } from '@/components';
import { applyFilters, activeCount, ORDER_LABELS, resetFilters, setFilters, useFilters, type OrderBy } from '@/features/explore/filters';
import { notifyMeFor, useCategories, useEvents, useToggleFavorite } from '@/features/explore/useExplore';
import { useMe } from '@/features/profile/useMe';
import { colors, font, radius, spacing } from '@/theme/tokens';

// EX_02 Resultados / filtros. El texto y la categoría los resuelve el backend; fecha, horario, precio, modalidad y orden, el dispositivo.
export default function Explorar() {
  const router = useRouter();
  const f = useFilters();
  const [text, setText] = useState(f.query);
  const [orderOpen, setOrderOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifyError, setNotifyError] = useState(false);
  const { data: me } = useMe();
  const cats = useCategories();
  const { data, isLoading, isError, refetch } = useEvents(f.query, f.categoryId);
  const fav = useToggleFavorite();

  // Búsqueda con pausa de medio segundo al escribir.
  useEffect(() => {
    const t = setTimeout(() => setFilters({ query: text }), 450);
    return () => clearTimeout(t);
  }, [text]);

  const results = useMemo(() => applyFilters(data?.items ?? [], f), [data, f]);
  const active = activeCount(f);
  const city = me?.profile.city;
  const more = (data?.total ?? 0) > (data?.items.length ?? 0) && active === 0;

  async function avisame() {
    setNotifying(true);
    setNotifyError(false);
    try {
      const id = await notifyMeFor(f.query.trim() || 'Quiero encontrar una experiencia');
      router.push({ pathname: '/grupo-formacion/[id]', params: { id } });
    } catch {
      setNotifyError(true);
    } finally {
      setNotifying(false);
    }
  }

  return (
    <Screen>
      {city ? (
        <View style={styles.city}><Ionicons name="location" size={20} color={colors.primary} /><Text style={styles.cityText}>{city}</Text></View>
      ) : null}
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} />
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="¿Qué te gustaría hacer?"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Buscar experiencias"
            returnKeyType="search"
            style={styles.input}
          />
          {text ? <Pressable accessibilityLabel="Borrar búsqueda" onPress={() => setText('')} hitSlop={8}><Ionicons name="close-circle" size={18} color={colors.textMuted} /></Pressable> : null}
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Favoritos" onPress={() => router.push('/favoritos')} style={styles.favBtn}>
          <Ionicons name="heart-outline" size={22} color={colors.primary} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Filtros" onPress={() => router.push('/filtros')} style={styles.filterBtn}>
          <Ionicons name="options-outline" size={22} color={colors.primary} />
          {active > 0 ? <View style={styles.dot}><Text style={styles.dotText}>{active}</Text></View> : null}
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Todos" selected={!f.categoryId} onPress={() => setFilters({ categoryId: null })} />
        {(cats.data ?? []).map((c) => (
          <Chip key={c.id} label={c.name} selected={f.categoryId === c.id} onPress={() => setFilters({ categoryId: f.categoryId === c.id ? null : c.id })} />
        ))}
      </ScrollView>

      <View style={styles.countRow}>
        <Text style={styles.count}>{isLoading ? 'Buscando…' : `${results.length}${more ? '+' : ''} ${results.length === 1 ? 'resultado' : 'resultados'}`}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Ordenar" onPress={() => setOrderOpen((o) => !o)} style={styles.order}>
          <Text style={styles.orderText}>{ORDER_LABELS[f.order]}</Text>
          <Ionicons name={orderOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
        </Pressable>
      </View>
      {orderOpen ? (
        <View style={styles.menu}>
          {(Object.keys(ORDER_LABELS) as OrderBy[]).map((k) => (
            <Pressable key={k} accessibilityRole="button" onPress={() => { setFilters({ order: k }); setOrderOpen(false); }} style={styles.menuItem}>
              <Text style={[styles.menuText, f.order === k && { color: colors.primary, fontWeight: '700' }]}>{ORDER_LABELS[k]}</Text>
              {f.order === k ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {isLoading ? (
        <>
          <SkeletonBlock height={230} />
          <SkeletonBlock height={230} />
        </>
      ) : isError ? (
        <ErrorState title="No pudimos cargar las experiencias" onRetry={() => refetch()} />
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search" size={40} color={colors.primary} />
          <Text style={styles.emptyTitle}>No encontré algo que calce</Text>
          <Text style={styles.emptyText}>
            {active > 0 ? 'Prueba con menos filtros, o deja que Lucas te ayude.' : 'Pregúntale a Lucas o deja una convocatoria abierta y te avisamos.'}
          </Text>
          {active > 0 ? <Button label="Limpiar filtros" variant="secondary" onPress={() => resetFilters()} /> : null}
          <Button label="Preguntar a Lucas" onPress={() => router.push(f.query.trim() ? { pathname: '/lucas-chat', params: { q: f.query.trim() } } : '/lucas')} />
          <Button label="Avísame" variant="secondary" loading={notifying} onPress={avisame} />
          {notifyError ? <Text style={styles.error}>No pudimos dejar tu aviso. Inténtalo de nuevo.</Text> : null}
        </View>
      ) : (
        results.map((e) => (
          <ExperienceCard
            key={e.id}
            event={e}
            onPress={() => router.push({ pathname: '/evento/[id]', params: { id: e.id } })}
            onToggleFavorite={() => fav.mutate(e.id)}
          />
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  city: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cityText: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  searchRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  search: { flex: 1, minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.lg },
  input: { flex: 1, fontSize: font.md, color: colors.text, ...(typeof document !== 'undefined' ? ({ outlineStyle: 'none' } as object) : {}) },
  favBtn: { width: 50, height: 50, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  filterBtn: { width: 50, height: 50, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: -6, right: -6, minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  dotText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  chips: { gap: spacing.sm, paddingRight: spacing.lg },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { color: colors.textMuted, fontSize: font.sm },
  order: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  orderText: { color: colors.textMuted, fontSize: font.sm, fontWeight: '600' },
  menu: { backgroundColor: colors.bg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  menuText: { color: colors.text, fontSize: font.md },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  emptyTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  emptyText: { color: colors.textMuted, textAlign: 'center', fontSize: font.md },
  error: { color: colors.danger, fontSize: font.sm },
});
