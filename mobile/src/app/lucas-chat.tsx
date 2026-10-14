import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AvatarStack, ChatInput, ScreenHeader } from '@/components';
import { createDemandFromLucas, joinFromCard, sendToLucas } from '@/features/lucas/api';
import type { ChatMessage, LucasAction, LucasCard } from '@/features/lucas/types';
import { colors, font, radius, spacing } from '@/theme/tokens';

let seq = 0;
const nid = () => `m${++seq}`;

// LU_01 Chat con Lucas. Lucas propone; la persona confirma antes de crear la convocatoria (create_demand_intent).
export default function LucasChat() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState<string | null>(null); // id de tarjeta / acción en curso
  const scroller = useRef<ScrollView>(null);
  const started = useRef(false);

  const ask = useCallback(async (text: string) => {
    setMessages((m) => [...m, { id: nid(), role: 'user', text }]);
    setTyping(true);
    try {
      const r = await sendToLucas(text);
      setMessages((m) => [...m, { id: nid(), role: 'lucas', ...r }]);
    } catch {
      setMessages((m) => [...m, { id: nid(), role: 'lucas', text: 'No pude responder ahora. Revisa tu conexión e inténtalo de nuevo.', failed: true }]);
    } finally {
      setTyping(false);
    }
  }, []);

  useEffect(() => {
    if (started.current || !q) return;
    started.current = true;
    ask(q);
  }, [q, ask]);

  const retry = (index: number) => {
    const prev = [...messages.slice(0, index)].reverse().find((x) => x.role === 'user');
    setMessages((m) => m.filter((_, i) => i !== index));
    if (prev) ask(prev.text);
  };

  const join = async (id: string) => {
    setBusy(id);
    try {
      await joinFromCard(id);
      router.push({ pathname: '/grupo-formacion/[id]', params: { id } });
    } catch {
      setMessages((m) => [...m, { id: nid(), role: 'lucas', text: 'No pude unirte ahora. Inténtalo otra vez en un momento.', failed: true }]);
    } finally {
      setBusy(null);
    }
  };

  const confirmCreate = async (a: LucasAction) => {
    setBusy('create');
    try {
      const id = await createDemandFromLucas(a.text, a.title);
      router.push({ pathname: '/grupo-formacion/[id]', params: { id } });
    } catch {
      setMessages((m) => [...m, { id: nid(), role: 'lucas', text: 'No pude crear la propuesta. Inténtalo de nuevo.', failed: true }]);
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.wrap}>
          <ScreenHeader title="Lucas IA" subtitle="Tu asistente" />
          <ScrollView ref={scroller} style={styles.flex} contentContainerStyle={styles.list} onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}>
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <View key={m.id} style={styles.userBubble}><Text style={styles.userText}>{m.text}</Text></View>
              ) : (
                <View key={m.id} style={styles.lucasBlock}>
                  <View style={styles.lucasBubble}>
                    <Text style={styles.lucasText}>{m.text}</Text>
                    {m.failed ? (
                      <Pressable onPress={() => retry(i)} accessibilityRole="button"><Text style={styles.retry}>Reintentar</Text></Pressable>
                    ) : null}
                  </View>
                  {m.cards?.map((c, k) => (
                    <CardView key={k} card={c} busy={busy} onJoin={join} onOpen={(id) => router.push({ pathname: '/grupo-formacion/[id]', params: { id } })} onOpenEvent={(id) => router.push({ pathname: '/evento/[id]', params: { id } })} />
                  ))}
                  {m.action ? (
                    <View style={styles.confirm}>
                      <Text style={styles.confirmTitle}>Propuesta de Lucas</Text>
                      <Text style={styles.confirmText}>“{m.action.title}”</Text>
                      <Text style={styles.note}>Se publicará como grupo en formación y te avisamos cuando se complete.</Text>
                      <Pressable
                        accessibilityRole="button"
                        disabled={busy === 'create'}
                        onPress={() => m.action && confirmCreate(m.action)}
                        style={[styles.primaryBtn, busy === 'create' && { opacity: 0.6 }]}
                      >
                        {busy === 'create' ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Crear una propuesta con Lucas</Text>}
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ),
            )}
            {typing ? (
              <View style={styles.lucasBubble}><Text style={styles.typing}>Lucas está escribiendo…</Text></View>
            ) : null}
          </ScrollView>
          <ChatInput onSend={ask} disabled={typing} placeholder="Escribe a Lucas…" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CardView({ card, busy, onJoin, onOpen, onOpenEvent }: { card: LucasCard; busy: string | null; onJoin: (id: string) => void; onOpen: (id: string) => void; onOpenEvent: (id: string) => void }) {
  if (card.kind === 'demand') {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardMeta}>{[card.when, card.place].filter(Boolean).join(' · ')}</Text>
        <View style={styles.cardRow}>
          <AvatarStack people={card.avatars} size={26} />
          <Text style={styles.cardMeta}>{card.people} personas · faltan {card.missing}</Text>
        </View>
        <View style={styles.cardRow}>
          <Pressable accessibilityRole="button" onPress={() => onJoin(card.id)} disabled={busy === card.id} style={[styles.smallBtn, styles.smallPrimary]}>
            {busy === card.id ? <ActivityIndicator color="#fff" /> : <Text style={styles.smallPrimaryText}>Unirme</Text>}
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => onOpen(card.id)} style={[styles.smallBtn, styles.smallSecondary]}>
            <Text style={styles.smallSecondaryText}>Ver grupo</Text>
          </Pressable>
        </View>
      </View>
    );
  }
  if (card.kind === 'event') {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardMeta}>{[card.when, card.place, card.price].filter(Boolean).join(' · ')}</Text>
        <Pressable accessibilityRole="button" onPress={() => onOpenEvent(card.id)} style={[styles.smallBtn, styles.smallSecondary, { alignSelf: 'flex-start' }]}>
          <Text style={styles.smallSecondaryText}>Me interesa</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{card.title}</Text>
      <Text style={styles.cardMeta}>{[card.when, card.place].filter(Boolean).join(' · ')}</Text>
      <View style={styles.waiting}><Ionicons name="time-outline" size={16} color={colors.primary} /><Text style={styles.waitingText}>{card.note}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { flex: 1, padding: spacing.lg, gap: spacing.md, width: '100%', maxWidth: 520, alignSelf: 'center' },
  list: { gap: spacing.md, paddingVertical: spacing.sm },
  userBubble: { alignSelf: 'flex-end', maxWidth: '82%', backgroundColor: colors.primary, borderRadius: radius.lg, borderBottomRightRadius: 6, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  userText: { color: '#fff', fontSize: font.md },
  lucasBlock: { gap: spacing.sm },
  lucasBubble: { alignSelf: 'flex-start', maxWidth: '88%', backgroundColor: colors.lucasTint, borderRadius: radius.lg, borderBottomLeftRadius: 6, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, gap: spacing.xs },
  lucasText: { color: colors.text, fontSize: font.md },
  typing: { color: colors.textMuted, fontSize: font.md, fontStyle: 'italic' },
  retry: { color: colors.primary, fontWeight: '700', fontSize: font.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm },
  cardTitle: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  cardMeta: { fontSize: font.sm, color: colors.textMuted },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  smallBtn: { minHeight: 38, minWidth: 96, borderRadius: radius.pill, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  smallPrimary: { backgroundColor: colors.primary },
  smallPrimaryText: { color: '#fff', fontWeight: '700', fontSize: font.sm },
  smallSecondary: { backgroundColor: colors.primarySoft },
  smallSecondaryText: { color: colors.primary, fontWeight: '700', fontSize: font.sm },
  waiting: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  waitingText: { color: colors.primary, fontSize: font.sm, fontWeight: '600' },
  confirm: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.primary, padding: spacing.lg, gap: spacing.sm },
  confirmTitle: { fontSize: font.sm, fontWeight: '700', color: colors.primary },
  confirmText: { fontSize: font.lg, fontWeight: '700', color: colors.text },
  note: { fontSize: font.sm, color: colors.textMuted },
  primaryBtn: { minHeight: 46, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: spacing.xs },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: font.md },
});
