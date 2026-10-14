import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarStack, Button, ErrorState, Screen, ScreenHeader, SkeletonBlock } from '@/components';
import { createLink, inviteConnections, listConnections, type InviteTarget } from '@/features/groups/invites';
import { copyText, shareText } from '@/lib/share';
import { colors, font, radius, spacing } from '@/theme/tokens';

// GR_04 Invitar al grupo. Arriba: Compartir y Copiar enlace. Abajo: conexiones con casillas.
// Grupo en formación (demanda): solo enlace, porque el backend aún no invita conexiones a una demanda.
export default function Invitar() {
  const { type = 'group', id = '' } = useLocalSearchParams<{ type?: InviteTarget; id?: string }>();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['connections'], queryFn: listConnections });
  const [q, setQ] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string }>();

  const list = useMemo(() => (data ?? []).filter((c) => (c.name ?? '').toLowerCase().includes(q.trim().toLowerCase())), [data, q]);
  const chosen = (data ?? []).filter((c) => sel.includes(c.id));

  const toggle = (cid: string) => setSel((s) => (s.includes(cid) ? s.filter((x) => x !== cid) : [...s, cid]));

  async function share() {
    try {
      const url = await createLink(type, id, 'whatsapp');
      const r = await shareText(`Únete a mi grupo en Groups: ${url}`);
      if (r === 'copied') setMsg({ ok: true, text: 'Enlace copiado.' });
    } catch {
      setMsg({ ok: false, text: 'No pudimos crear el enlace.' });
    }
  }
  async function copy() {
    try {
      await copyText(await createLink(type, id, 'copy'));
      setMsg({ ok: true, text: 'Enlace copiado.' });
    } catch {
      setMsg({ ok: false, text: 'No pudimos copiar el enlace.' });
    }
  }
  async function invite() {
    setSending(true);
    setMsg(undefined);
    try {
      const n = await inviteConnections(id, sel);
      setMsg({ ok: true, text: `¡Invitaciones enviadas! Se notificó a ${n} ${n === 1 ? 'persona' : 'personas'}.` });
      setSel([]);
    } catch {
      setMsg({ ok: false, text: 'No pudimos enviar las invitaciones. Inténtalo de nuevo.' });
    } finally {
      setSending(false);
    }
  }

  const canInviteConnections = type === 'group';

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Invitar al grupo" subtitle="Selecciona personas para invitar" />
      <View style={styles.row}>
        <View style={{ flex: 1 }}><Button label="Compartir enlace" onPress={share} /></View>
        <View style={{ flex: 1 }}><Button label="Copiar enlace" variant="secondary" onPress={copy} /></View>
      </View>
      {msg ? (
        <View style={[styles.banner, msg.ok ? styles.ok : styles.bad]}>
          <Ionicons name={msg.ok ? 'checkmark-circle' : 'alert-circle'} size={22} color={msg.ok ? colors.success : colors.danger} />
          <Text style={styles.bannerText}>{msg.text}</Text>
        </View>
      ) : null}

      {type === 'demand' ? (
        <Text style={styles.empty}>Por ahora este grupo en formación se comparte con el enlace. La invitación directa a conexiones llega con el grupo ya creado.</Text>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : isLoading ? (
        <><SkeletonBlock height={56} /><SkeletonBlock height={56} /><SkeletonBlock height={56} /></>
      ) : (data ?? []).length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Aún no tienes conexiones</Text>
          <Text style={styles.empty}>Comparte el enlace para invitar a tus amigos.</Text>
          <Button label="Compartir enlace" onPress={share} />
        </View>
      ) : (
        <>
          <View style={styles.search}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput value={q} onChangeText={setQ} placeholder="Buscar conexiones…" placeholderTextColor={colors.textMuted} style={styles.searchInput} accessibilityLabel="Buscar conexiones" />
          </View>
          {list.map((c) => {
            const on = sel.includes(c.id);
            return (
              <Pressable key={c.id} onPress={() => toggle(c.id)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={styles.person}>
                <View style={[styles.box, on && styles.boxOn]}>{on ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}</View>
                <Avatar name={c.name} size={48} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{c.name}</Text>
                  <Text style={styles.interests}>{c.interests}</Text>
                </View>
              </Pressable>
            );
          })}
          {canInviteConnections ? (
            <View style={styles.footer}>
              {chosen.length > 0 ? (
                <View style={styles.count}>
                  <AvatarStack people={chosen.slice(0, 3)} size={28} />
                  <Text style={styles.name}>{chosen.length} {chosen.length === 1 ? 'seleccionado' : 'seleccionados'}</Text>
                </View>
              ) : null}
              <Button label={sel.length > 0 ? `Invitar (${sel.length})` : 'Invitar'} onPress={invite} loading={sending} disabled={sel.length === 0} />
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, minHeight: 48 },
  searchInput: { flex: 1, fontSize: font.md, color: colors.text },
  person: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  box: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  name: { fontSize: font.md, fontWeight: '800', color: colors.text },
  interests: { fontSize: font.sm, color: colors.textMuted },
  footer: { gap: spacing.md, marginTop: spacing.sm },
  count: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  banner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: radius.md, padding: spacing.md },
  ok: { backgroundColor: colors.successSoft },
  bad: { backgroundColor: '#FBE3E3' },
  bannerText: { flex: 1, color: colors.text, fontSize: font.md },
  emptyBox: { gap: spacing.md, alignItems: 'center', padding: spacing.lg },
  emptyTitle: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  empty: { color: colors.textMuted, fontSize: font.sm, textAlign: 'center' },
});
