import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Chip, EmptyNote, ErrorState, Screen, SkeletonBlock } from '@/components';
import { useMyGroups } from '@/features/groups/useDemand';
import type { GroupRole } from '@/features/groups/types';
import { colors, font, radius, spacing } from '@/theme/tokens';

const TABS: [GroupRole, string][] = [[null, 'Todos'], ['owner', 'Organizo'], ['member', 'Participo']];
const TINTS = ['#DDEBFF', '#DFF5E6', '#FFE7D1', '#F1E4FF', '#FFE3EC'];

// GR_01 Mis grupos: tabs Todos / Organizo / Participo. Los grupos en formación (demandas) salen arriba y abren GR_03.
export default function Grupos() {
  const router = useRouter();
  const [role, setRole] = useState<GroupRole>(null);
  const { data, isLoading, isError, refetch } = useMyGroups(role);
  const empty = !!data && data.groups.length === 0 && data.forming.length === 0;

  return (
    <Screen title="Mis grupos">
      <View style={styles.tabs}>
        {TABS.map(([k, l]) => <Chip key={l} label={l} selected={role === k} onPress={() => setRole(k)} />)}
      </View>

      {isLoading ? (
        <><SkeletonBlock height={76} /><SkeletonBlock height={76} /><SkeletonBlock height={76} /></>
      ) : isError ? (
        <ErrorState title="No pudimos cargar tus grupos" onRetry={() => refetch()} />
      ) : empty ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={44} color={colors.primary} />
          <Text style={styles.emptyTitle}>{role === 'owner' ? 'Aún no organizas ningún grupo' : 'Aún no estás en ningún grupo'}</Text>
          <EmptyNote text="Explora experiencias o cuéntale a Lucas qué te gustaría hacer, y te ayudamos a armar un grupo." />
          <Button label="Explorar experiencias" onPress={() => router.push('/(tabs)/explorar')} />
          <Button label="Hablar con Lucas" variant="secondary" onPress={() => router.push('/lucas')} />
        </View>
      ) : (
        <>
          {data!.forming.length > 0 ? (
            <View style={styles.block}>
              <Text style={styles.h2}>En formación</Text>
              {data!.forming.map((d) => (
                <Pressable key={d.id} accessibilityRole="button" onPress={() => router.push({ pathname: '/grupo-formacion/[id]', params: { id: d.id } })} style={styles.row}>
                  <View style={[styles.thumb, { backgroundColor: colors.lucasTint }]}><Ionicons name="sparkles" size={24} color={colors.primary} /></View>
                  <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{d.title}</Text>
                    <Text style={styles.meta}>{d.status === 'expired' ? 'Venció la convocatoria' : d.missing > 0 ? `Faltan ${d.missing} personas` : 'Grupo completo · en preparación'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          ) : null}
          {data!.groups.length > 0 ? (
            <View style={styles.block}>
              {data!.forming.length > 0 ? <Text style={styles.h2}>Mis grupos</Text> : null}
              {data!.groups.map((g, i) => (
                <Pressable key={g.id} accessibilityRole="button" accessibilityLabel={g.name} onPress={() => router.push({ pathname: '/grupo/[id]', params: { id: g.id } })} style={styles.row}>
                  <View style={[styles.thumb, { backgroundColor: TINTS[i % TINTS.length] }]}><Ionicons name="people" size={24} color={colors.primary} /></View>
                  <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={1}>{g.name}</Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="people-outline" size={14} color={colors.textMuted} />
                      <Text style={styles.meta}>{g.members_count} miembros{g.role === 'owner' ? ' · Organizas' : ''}</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: spacing.sm },
  block: { gap: spacing.md },
  h2: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  thumb: { width: 64, height: 64, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 4 },
  name: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontSize: font.sm, color: colors.textMuted },
  empty: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  emptyTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text, textAlign: 'center' },
});
