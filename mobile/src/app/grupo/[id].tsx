import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, AvatarStack, Button, EmptyNote, ErrorState, SkeletonBlock } from '@/components';
import { useGroup } from '@/features/groups/useDemand';
import { dateBlock, formatRange, formatWhen } from '@/lib/format';
import { colors, font, radius, spacing } from '@/theme/tokens';

type Tab = 'events' | 'chat' | 'members' | 'info';
const TABS: [Tab, string][] = [['events', 'Eventos'], ['chat', 'Chat'], ['members', 'Miembros'], ['info', 'Info']];

// GR_02 Detalle del grupo: cabecera + tabs Eventos / Chat / Miembros / Info + botón Invitar.
// El chat (CH_03) y el perfil de un miembro (PE_02) llegan en la Ola 3.
export default function GrupoDetalle() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('events');
  const { data: g, isLoading, isError, refetch } = useGroup(id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/grupos'));
  const invite = () => router.push({ pathname: '/invitar', params: { type: 'group', id } });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <Pressable accessibilityLabel="Volver" onPress={back} hitSlop={10} style={styles.round}><Ionicons name="chevron-back" size={22} color={colors.text} /></Pressable>
          <Ionicons name="people" size={64} color={colors.primary} />
        </View>
        {isLoading ? (
          <View style={styles.pad}><SkeletonBlock height={50} /><SkeletonBlock height={160} /></View>
        ) : isError || !g ? (
          <ErrorState title="No pudimos cargar el grupo" onRetry={() => refetch()} />
        ) : (
          <View style={styles.pad}>
            <View>
              <Text style={styles.title}>{g.name}</Text>
              <Text style={styles.muted}>Grupo · {g.members.length} miembros{g.status === 'closed' ? ' · Cerrado' : ''}</Text>
            </View>
            <View style={styles.tabs}>
              {TABS.map(([k, l]) => (
                <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: tab === k }} onPress={() => setTab(k)} style={[styles.tab, tab === k && styles.tabOn]}>
                  <Text style={[styles.tabText, tab === k && styles.tabTextOn]}>{l}</Text>
                </Pressable>
              ))}
            </View>

            {tab === 'events' ? (
              <View style={styles.block}>
                <Text style={styles.h2}>Tus próximos eventos</Text>
                {g.event && g.event.next_session ? (
                  <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: '/evento/[id]', params: { id: g.event!.id } })} style={styles.event}>
                    <View style={styles.date}>
                      <Text style={styles.dow}>{dateBlock(g.event.next_session).dow}</Text>
                      <Text style={styles.day}>{dateBlock(g.event.next_session).day}</Text>
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={styles.evTitle}>{g.event.title}</Text>
                      <Text style={styles.muted}>{formatWhen(g.event.next_session).split(' · ')[0]} · {formatRange(g.event.next_session)}{g.event.address ? ` · ${g.event.address}` : ''}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </Pressable>
                ) : (
                  <EmptyNote text="Este grupo aún no tiene eventos próximos." />
                )}
              </View>
            ) : null}

            {tab === 'chat' ? (
              <View style={styles.chat}>
                <Ionicons name="chatbubbles-outline" size={40} color={colors.primary} />
                <Text style={styles.h2}>Chat del grupo</Text>
                <Text style={styles.centered}>El chat se construye en la siguiente etapa del proyecto.</Text>
              </View>
            ) : null}

            {tab === 'members' ? (
              <View style={styles.block}>
                {g.members.map((m) => (
                  <View key={m.id} style={styles.member}>
                    <Avatar name={m.name} size={44} />
                    <Text style={styles.evTitle}>{m.name}</Text>
                    {m.role === 'owner' ? <View style={styles.badge}><Text style={styles.badgeText}>Organizador</Text></View> : null}
                  </View>
                ))}
              </View>
            ) : null}

            {tab === 'info' ? (
              <View style={styles.block}>
                <Info label="Nombre" value={g.name} />
                <Info label="Estado" value={g.status === 'active' ? 'Activo' : 'Cerrado'} />
                <Info label="Miembros" value={String(g.members.length)} />
                <Info label="Tu rol" value={g.my_role === 'owner' ? 'Organizador' : g.my_role === 'member' ? 'Miembro' : 'Equipo Groups'} />
              </View>
            ) : null}

            <View style={styles.footerRow}>
              <AvatarStack people={g.members.slice(0, 3)} extra={Math.max(g.members.length - 3, 0)} size={40} />
              <View style={{ flex: 1 }}>
                <Button label="Invitar" variant="secondary" onPress={invite} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.evTitle}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { width: '100%', maxWidth: 520, alignSelf: 'center', paddingBottom: spacing.xxl },
  hero: { height: 160, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  round: { position: 'absolute', top: spacing.lg, left: spacing.lg, width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFFE6', alignItems: 'center', justifyContent: 'center' },
  pad: { padding: spacing.lg, gap: spacing.lg },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  muted: { fontSize: font.sm, color: colors.textMuted },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: colors.primary },
  tabText: { fontSize: font.md, color: colors.textMuted, fontWeight: '600' },
  tabTextOn: { color: colors.primary, fontWeight: '800' },
  block: { gap: spacing.md },
  h2: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  event: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
  date: { width: 48, height: 56, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  dow: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  day: { fontSize: font.xl, fontWeight: '800', color: colors.primary },
  evTitle: { fontSize: font.md, fontWeight: '700', color: colors.text, flexShrink: 1 },
  chat: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  centered: { color: colors.textMuted, textAlign: 'center', fontSize: font.md },
  member: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  badge: { backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  badgeText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  info: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
});
