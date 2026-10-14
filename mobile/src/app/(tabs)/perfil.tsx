import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button, ErrorState, ListRow, Screen, SkeletonBlock } from '@/components';
import { useMe } from '@/features/profile/useMe';
import { colors, font, radius, spacing } from '@/theme/tokens';

// PF_01 Mi perfil: cabecera, métricas y accesos. Cerrar sesión está en Configuración (PF_02).
// Intereses, eventos, conexiones y pagos (PF_04–PF_06, PE_03) llegan en la Ola 3.
export default function Perfil() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useMe();
  const soon = (name: string) => () => router.push({ pathname: '/proximamente', params: { name } });
  const p = data?.profile;

  return (
    <Screen>
      <View style={styles.top}>
        <View style={{ flex: 1 }} />
        <Pressable accessibilityRole="button" accessibilityLabel="Configuración" onPress={() => router.push('/configuracion')} hitSlop={10} style={styles.gear}>
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      {isLoading ? (
        <><SkeletonBlock height={160} /><SkeletonBlock height={80} /><SkeletonBlock height={200} /></>
      ) : isError || !p ? (
        <ErrorState title="No pudimos cargar tu perfil" onRetry={() => refetch()} />
      ) : (
        <>
          <View style={styles.head}>
            <Avatar name={p.display_name} uri={null} size={96} />
            <View style={styles.nameRow}>
              <Text style={styles.name}>{p.display_name || 'Sin nombre'}</Text>
              {p.is_verified ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
            </View>
            {p.age || p.city ? <Text style={styles.muted}>{[p.age ? `${p.age} años` : null, p.city].filter(Boolean).join(' · ')}</Text> : null}
            <View style={{ alignSelf: 'stretch', paddingHorizontal: spacing.xxl }}>
              <Button label="Editar perfil" variant="secondary" onPress={() => router.push('/editar-perfil')} />
            </View>
          </View>

          <View style={styles.stats}>
            <Stat n={data!.summary.events_count} label="Eventos" />
            <View style={styles.sep} />
            <Stat n={data!.summary.groups_count} label="Grupos" />
            <View style={styles.sep} />
            <Stat n={data!.summary.connections_count} label="Conexiones" />
          </View>

          <View style={styles.list}>
            <ListRow icon="heart-outline" label="Mis intereses" onPress={() => router.push('/mis-intereses')} />
            <ListRow icon="calendar-outline" label="Mis eventos" onPress={() => router.push('/mis-eventos')} />
            <ListRow icon="people-outline" label="Mis grupos" onPress={() => router.push('/(tabs)/grupos')} />
            <ListRow icon="person-add-outline" label="Conexiones" onPress={soon('Conexiones')} />
            <ListRow icon="card-outline" label="Métodos de pago" onPress={() => router.push('/metodos-pago')} />
          </View>
        </>
      )}
    </Screen>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center' },
  gear: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  head: { alignItems: 'center', gap: spacing.sm },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  name: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  muted: { fontSize: font.sm, color: colors.textMuted },
  stats: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: spacing.lg },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statN: { fontSize: font.xl, fontWeight: '800', color: colors.primary },
  sep: { width: 1, height: 36, backgroundColor: colors.border },
  list: { gap: spacing.xs },
});
