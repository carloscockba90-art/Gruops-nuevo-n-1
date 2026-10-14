import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Screen, Segmented, WizardHeader } from '@/components';
import { patchDraft, useDraftOrEmpty } from '@/features/create/draft';
import { earnings, FEES } from '@/features/create/fees';
import { sessionDates } from '@/features/create/sessions';
import { colors, font, radius, spacing } from '@/theme/tokens';

const money = (n: number) => `$${n.toLocaleString('es-CL')}`;
const MAX_PRICE = 5_000_000;

// EV_04b (gratis) y EV_05 (pagado): una sola pantalla con el conmutador Gratis | Pagado.
// Al terminar sigue la vista previa (EV_06, próxima tanda).
export default function Precio() {
  const router = useRouter();
  const d = useDraftOrEmpty();
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string>();
  const [text, setText] = useState(d.priceUnits ? String(d.priceUnits) : '');
  if (!d.date) return <Redirect href="/(tabs)/crear" />;

  const sessions = sessionDates(d).length || 1;
  const price = Number(text.replace(/\D/g, '')) || 0;
  const e = earnings(price, d.capacity, sessions);

  function next() {
    setError(undefined);
    if (!d.free) {
      if (price < 1000) return setError('El precio mínimo es $1.000. Si no quieres cobrar, elige “Gratis”.');
      if (price > MAX_PRICE) return setError(`El precio máximo es ${money(MAX_PRICE)}.`);
    }
    if (!Number.isInteger(d.capacity) || d.capacity < 1) return setError('Indica cuántas personas pueden asistir.');
    patchDraft({ priceUnits: d.free ? 0 : price, step: 'precio' });
    router.push({ pathname: '/proximamente', params: { name: 'Vista previa del evento' } });
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <WizardHeader step={3} label="Precio" />
      <Segmented options={[{ value: 'free', label: 'Gratis' }, { value: 'paid', label: 'Pagado' }]} value={d.free ? 'free' : 'paid'} onChange={(v) => { patchDraft({ free: v === 'free' }); setError(undefined); }} />

      {d.free ? (
        <>
          <View style={styles.freeCard}>
            <Ionicons name="gift-outline" size={30} color={colors.primary} />
            <Text style={styles.h2}>Evento gratuito</Text>
            <Text style={styles.centered}>Tu evento será sin costo para todos los asistentes.</Text>
          </View>
          <View style={{ gap: spacing.xs }}>
            <Text style={styles.label}>Precio</Text>
            <View style={[styles.field, { backgroundColor: colors.surface }]}><Text style={styles.fieldText}>$0</Text></View>
            <Text style={styles.muted}>No se cobrará a los asistentes.</Text>
          </View>
          <View style={styles.info}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={styles.infoText}>Los eventos gratuitos ayudan a crear comunidad y atraer más personas.</Text>
          </View>
        </>
      ) : (
        <>
          <Input label="Precio por sesión" value={text ? money(price) : ''} onChangeText={(t) => setText(t.replace(/\D/g, '').slice(0, 8))} placeholder="$10.000" keyboardType="number-pad" />
          {d.repeat ? <Text style={styles.muted}>Este precio se cobrará por cada sesión de la serie.</Text> : <Text style={styles.muted}>Es el precio que paga cada persona (moneda: CLP).</Text>}

          <View style={{ gap: spacing.xs }}>
            <Text style={styles.label}>Capacidad por sesión</Text>
            <View style={styles.stepper}>
              <Ionicons name="people-outline" size={18} color={colors.textMuted} />
              <Pressable accessibilityRole="button" accessibilityLabel="Menos personas" onPress={() => patchDraft({ capacity: Math.max(1, d.capacity - 1) })} style={styles.stepBtn}><Ionicons name="remove" size={20} color={colors.primary} /></Pressable>
              <Text style={styles.stepValue} accessibilityLabel={`Capacidad: ${d.capacity} personas`}>{d.capacity} personas</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Más personas" onPress={() => patchDraft({ capacity: Math.min(500, d.capacity + 1) })} style={styles.stepBtn}><Ionicons name="add" size={20} color={colors.primary} /></Pressable>
            </View>
          </View>

          <Text style={styles.h2}>Ganancias estimadas</Text>
          <View style={styles.box}>
            <Text style={styles.muted}>Por sesión ({d.capacity} personas)</Text>
            <Text style={styles.big}>{money(e.perSession)} <Text style={styles.muted}>CLP</Text></Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Ver desglose" accessibilityState={{ expanded: open }} onPress={() => setOpen((o) => !o)} style={styles.toggle}>
              <Text style={styles.link}>{open ? 'Ocultar desglose' : 'Ver desglose'}</Text>
              <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
            </Pressable>
            {open ? (
              <View style={{ gap: spacing.sm }}>
                <Row dot={colors.success} label={`Tu ganancia (${Math.round(FEES.hostShare * 100)}%)`} value={money(e.host)} />
                <Row dot={colors.warning} label={`Comisión Groups (${Math.round(FEES.platform * 100)}%)`} value={money(e.platform)} />
                <Row dot={colors.danger} label={`Gastos (${Math.round(FEES.expenses * 100)}%)`} value={money(e.expenses)} />
              </View>
            ) : null}
          </View>
          <View style={styles.box}>
            <Text style={styles.muted}>Ganancia total {sessions > 1 ? `serie (${sessions} sesiones)` : '(1 sesión)'}</Text>
            <Text style={styles.big}>{money(e.series)} <Text style={styles.muted}>CLP</Text></Text>
          </View>
          <Text style={styles.muted}>Estimación con el reparto actual y todos los cupos vendidos. Los porcentajes pueden cambiar.</Text>
        </>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={d.free ? 'Continuar a vista previa' : 'Siguiente'} onPress={next} />
    </Screen>
  );
}

function Row({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  h2: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  label: { fontSize: font.md, color: colors.text },
  muted: { fontSize: font.sm, color: colors.textMuted },
  centered: { fontSize: font.md, color: colors.textMuted, textAlign: 'center' },
  freeCard: { alignItems: 'center', gap: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.xl },
  field: { minHeight: 52, justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg },
  fieldText: { fontSize: font.lg, color: colors.text, fontWeight: '700' },
  info: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md },
  infoText: { flex: 1, fontSize: font.sm, color: colors.text },
  stepper: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg },
  stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stepValue: { flex: 1, textAlign: 'center', fontSize: font.md, fontWeight: '800', color: colors.text },
  box: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  big: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  link: { color: colors.primary, fontWeight: '700', fontSize: font.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6 },
  rowLabel: { flex: 1, fontSize: font.md, color: colors.text },
  rowValue: { fontSize: font.md, fontWeight: '800', color: colors.text },
  error: { color: colors.danger, fontSize: font.sm },
});
