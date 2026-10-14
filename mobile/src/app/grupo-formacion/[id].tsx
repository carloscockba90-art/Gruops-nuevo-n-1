import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AvatarStack, Button, ErrorState, Screen, ScreenHeader, SkeletonBlock } from '@/components';
import { createDemandLink, useDemand, useDemandAction } from '@/features/groups/useDemand';
import type { DemandDetail } from '@/features/groups/types';
import { shareText } from '@/lib/share';
import { colors, font, radius, spacing } from '@/theme/tokens';

// Pasos del ciclo (Excel GR_03). `done` = cuántos pasos están completos según el estado de la demanda.
const STEPS = ['Buscando profesionales', 'Recibiendo propuestas', 'Votación del grupo', 'Evento confirmado'];
const DONE: Record<string, number> = { open: 0, complete: 1, sourcing: 1, offers: 2, voting: 3, selected: 4 };

// GR_03 Grupo en formación. Estados: activo, completo, expirado, cancelado.
// Unirme / Salir / Compartir; expirado ofrece "Buscar alternativa con Lucas" y "Reintentar convocatoria".
export default function GrupoFormacion() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: d, isLoading, isError, refetch } = useDemand(id);
  const join = useDemandAction(id, 'join_demand');
  const leave = useDemandAction(id, 'leave_demand');
  const reopen = useDemandAction(id, 'reopen_demand');
  const [msg, setMsg] = useState<string>();

  async function share(d: DemandDetail) {
    setMsg(undefined);
    try {
      const url = await createDemandLink(d.id, 'whatsapp');
      const falta = d.missing > 0 ? `Faltan ${d.missing} personas. ` : '';
      const r = await shareText(`${d.title}. ${falta}Únete a mi grupo en Groups: ${url}`);
      if (r === 'copied') setMsg('Enlace copiado.');
    } catch {
      setMsg('No pudimos crear el enlace. Inténtalo de nuevo.');
    }
  }

  const closed = d && (d.status === 'expired' || d.status === 'cancelled');
  const done = d ? DONE[d.status] ?? 0 : 0;
  const progress = d ? Math.min(d.members_count / Math.max(d.min_members, 1), 1) : 0;

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Grupo en formación" />
      {isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading || !d ? (
        <><SkeletonBlock height={120} /><SkeletonBlock height={220} /></>
      ) : (
        <>
          <View style={styles.head}>
            <View style={styles.icon}><Ionicons name="people" size={26} color={colors.primary} /></View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.title}>{d.title}</Text>
              <Text style={styles.meta}>{[d.when_label, d.place ?? d.city].filter(Boolean).join('  ·  ')}</Text>
            </View>
          </View>

          <AvatarStack people={d.avatars} extra={Math.max(d.members_count - d.avatars.length, 0)} size={40} />

          {closed ? (
            <View style={styles.closed}>
              <Text style={styles.closedTitle}>{d.status === 'expired' ? 'Esta convocatoria venció' : 'Esta convocatoria se canceló'}</Text>
              <Text style={styles.meta}>Se juntaron {d.members_count} de {d.min_members} personas.</Text>
            </View>
          ) : (
            <View style={{ gap: spacing.sm }}>
              <View style={styles.bar}><View style={[styles.barFill, { width: `${progress * 100}%` }]} /></View>
              <Text style={styles.meta}>
                {d.missing > 0 ? `Faltan ${d.missing} personas para activar el grupo` : '¡Grupo completo! Estamos buscando propuestas.'}{'  '}
                ({d.members_count} de {d.min_members})
              </Text>
            </View>
          )}

          {!closed ? (
            <View style={styles.steps}>
              {STEPS.map((s, i) => {
                const ok = i < done;
                return (
                  <View key={s} style={styles.step}>
                    <View style={[styles.check, ok && styles.checkOn]}>{ok ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}</View>
                    <Text style={[styles.stepText, !ok && { color: colors.textMuted }]}>{s}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          {d.offers.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              <Text style={styles.section}>Propuestas recibidas</Text>
              {d.offers.map((o) => (
                <View key={o.id} style={styles.offer}>
                  <Text style={styles.offerName}>{o.provider_name}</Text>
                  {o.description ? <Text style={styles.meta}>{o.description}</Text> : null}
                  <Text style={styles.offerPrice}>
                    {o.price_cents != null ? `$${(o.price_cents / 100).toLocaleString('es-CL')} ${o.currency ?? ''}` : 'Precio por definir'}
                  </Text>
                </View>
              ))}
              <Text style={styles.meta}>La votación del grupo se habilita en una próxima versión.</Text>
            </View>
          ) : null}

          {msg ? <Text style={styles.msg}>{msg}</Text> : null}

          {closed ? (
            <View style={{ gap: spacing.sm }}>
              <Button label="Buscar alternativa con Lucas" onPress={() => router.push('/lucas')} />
              {d.is_creator ? <Button label="Reintentar convocatoria" variant="secondary" loading={reopen.isPending} onPress={() => reopen.mutate()} /> : null}
            </View>
          ) : d.is_member ? (
            <View style={{ gap: spacing.sm }}>
              <Button label="Compartir" onPress={() => share(d)} />
              <Pressable onPress={() => router.push({ pathname: '/invitar', params: { type: 'demand', id: d.id } })} style={styles.linkRow}>
                <Text style={styles.link}>Invitar a mis conexiones</Text>
              </Pressable>
              <Button label="Salir del grupo" variant="ghost" loading={leave.isPending} onPress={() => leave.mutate()} />
            </View>
          ) : (
            <Button label="Unirme" onPress={() => join.mutate()} loading={join.isPending} />
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  meta: { fontSize: font.sm, color: colors.textMuted },
  bar: { height: 10, borderRadius: 5, backgroundColor: colors.surface, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5, backgroundColor: colors.primary },
  closed: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: 4 },
  closedTitle: { fontWeight: '800', fontSize: font.lg, color: colors.text },
  steps: { gap: spacing.md, marginVertical: spacing.sm },
  step: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  stepText: { fontSize: font.md, fontWeight: '600', color: colors.text },
  section: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  offer: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: 4 },
  offerName: { fontWeight: '800', fontSize: font.md, color: colors.text },
  offerPrice: { fontWeight: '700', color: colors.primary },
  msg: { textAlign: 'center', color: colors.textMuted, fontSize: font.sm },
  linkRow: { alignItems: 'center', paddingVertical: spacing.sm },
  link: { color: colors.primary, fontWeight: '700', fontSize: font.md },
});
