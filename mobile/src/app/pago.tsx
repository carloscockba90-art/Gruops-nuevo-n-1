import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, ErrorState, Input, Screen, ScreenHeader, SkeletonBlock } from '@/components';
import { BRAND_LABEL, detectBrand, digits, formatExpiry, formatNumber, validateCard, type CardErrors } from '@/features/booking/card';
import type { PayChoice } from '@/features/booking/types';
import { useConfirmReservation, usePaymentMethods, useReservation } from '@/features/booking/useBooking';
import { dateBlock, formatPrice, formatRange } from '@/lib/format';
import { colors, font, radius, spacing } from '@/theme/tokens';

type Option = { key: string; label: string; icon: keyof typeof Ionicons.glyphMap; sub?: string };

const secondsLeft = (iso: string | null) => (iso ? Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000)) : 0);

// RS_02 Checkout. Pago SIMULADO en la demostración: el número de tarjeta no se guarda ni se envía a ningún lado.
// Una tarjeta que termina en 0002 simula un pago rechazado para ver el estado de error y reintento.
export default function Pago() {
  const { id = '' } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { data: r, isLoading, isError, refetch } = useReservation(id);
  const saved = usePaymentMethods();
  const confirm = useConfirmReservation();
  const [choice, setChoice] = useState<string>();
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<CardErrors>({});
  const [payError, setPayError] = useState<string>();
  const [, setTick] = useState(0);

  // Cuenta regresiva del cupo apartado.
  useEffect(() => {
    if (!r?.hold_expires_at) return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [r?.hold_expires_at]);
  const holdLeft = secondsLeft(r?.hold_expires_at ?? null);

  const savedList = saved.data ?? [];
  const options: Option[] = [
    ...savedList.map((m) => ({ key: `saved:${m.id}`, label: `${BRAND_LABEL[m.brand]} •••• ${m.last4}`, icon: 'card' as const, sub: m.is_default ? 'Predeterminada' : undefined })),
    { key: 'credit', label: 'Tarjeta de crédito', icon: 'card-outline' },
    { key: 'debit', label: 'Tarjeta de débito', icon: 'card-outline' },
    { key: 'transfer', label: 'Transferencia', icon: 'swap-horizontal-outline' },
  ];
  const current = choice ?? options[0]?.key;
  const isNewCard = current === 'credit' || current === 'debit';
  const expired = r?.status === 'expired' || (!!r?.hold_expires_at && holdLeft === 0);
  const mm = String(Math.floor(holdLeft / 60)).padStart(2, '0');
  const ss = String(holdLeft % 60).padStart(2, '0');

  async function pay() {
    if (!r) return;
    setPayError(undefined);
    let pc: PayChoice;
    if (current.startsWith('saved:')) {
      pc = { kind: 'saved', paymentMethodId: current.slice(6) };
    } else if (isNewCard) {
      const e = validateCard(number, expiry, cvv);
      setErrors(e);
      if (Object.keys(e).length) return;
      pc = { kind: 'card', brand: detectBrand(number), last4: digits(number).slice(-4), type: current === 'credit' ? 'credit' : 'debit' };
    } else {
      pc = { kind: 'transfer' };
    }
    try {
      const done = await confirm.mutateAsync({ reservationId: r.id, choice: pc });
      router.replace({ pathname: '/reserva-confirmada', params: { id: done.id } });
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      setPayError(code === 'card_declined' ? 'Tu banco rechazó el pago. Prueba con otra tarjeta o inténtalo de nuevo.' : code === 'hold_expired' ? 'Tu cupo expiró.' : 'No pudimos procesar el pago. Inténtalo de nuevo.');
      if (code === 'hold_expired') refetch();
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Método de pago" />
      {isLoading ? (
        <><SkeletonBlock height={90} /><SkeletonBlock height={220} /></>
      ) : isError || !r ? (
        <ErrorState title="No pudimos cargar tu reserva" onRetry={() => refetch()} />
      ) : expired ? (
        <View style={styles.center}>
          <Ionicons name="timer-outline" size={44} color={colors.warning} />
          <Text style={styles.h2}>Tu cupo expiró</Text>
          <Text style={styles.muted}>Apartamos tu lugar por 10 minutos. Elige la sesión otra vez para continuar.</Text>
          <Button label="Elegir sesión" onPress={() => router.replace({ pathname: '/reservar/[id]', params: { id: r.event.id } })} />
        </View>
      ) : (
        <>
          <View style={styles.hold}>
            <Ionicons name="timer-outline" size={18} color={colors.warning} />
            <Text style={styles.holdText}>Tu cupo está apartado por {mm}:{ss}</Text>
          </View>

          <View style={styles.summary}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{r.event.title}</Text>
              <Text style={styles.muted}>{dateBlock(r.session.starts_at).dow} {dateBlock(r.session.starts_at).day} {dateBlock(r.session.starts_at).mon} · {formatRange(r.session.starts_at, r.session.ends_at)}</Text>
            </View>
            <Text style={styles.price}>{formatPrice(r.amount_cents)}</Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.h2}>Método de pago</Text>
            <Pressable accessibilityRole="button" onPress={() => router.push('/metodos-pago')}><Text style={styles.link}>Gestionar</Text></Pressable>
          </View>
          {options.map((o) => {
            const on = o.key === current;
            return (
              <Pressable key={o.key} accessibilityRole="radio" accessibilityLabel={o.label} accessibilityState={{ selected: on }} onPress={() => { setChoice(o.key); setPayError(undefined); }} style={[styles.opt, on && styles.optOn]}>
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}</View>
                <Ionicons name={o.icon} size={22} color={colors.textMuted} />
                <Text style={styles.optText}>{o.label}</Text>
                {o.sub ? <Text style={styles.sub}>{o.sub}</Text> : null}
              </Pressable>
            );
          })}

          {isNewCard ? (
            <View style={{ gap: spacing.md }}>
              <Input label="Número de tarjeta" value={number} onChangeText={(t) => setNumber(formatNumber(t))} placeholder="1234 5678 9012 3456" keyboardType="number-pad" error={errors.number} autoComplete="off" />
              <View style={styles.pair}>
                <View style={{ flex: 1 }}><Input label="MM/AA" value={expiry} onChangeText={(t) => setExpiry(formatExpiry(t))} placeholder="12/28" keyboardType="number-pad" error={errors.expiry} autoComplete="off" /></View>
                <View style={{ flex: 1 }}><Input label="CVV" value={cvv} onChangeText={(t) => setCvv(digits(t).slice(0, 4))} placeholder="123" keyboardType="number-pad" secureTextEntry error={errors.cvv} autoComplete="off" /></View>
              </View>
              <Text style={styles.note}>Demostración: no se cobra ni se guarda ningún dato. En la versión real, este formulario lo muestra el proveedor de pagos.</Text>
            </View>
          ) : null}
          {current === 'transfer' ? <Text style={styles.note}>Reservaremos tu cupo y te mostraremos los datos para transferir. La reserva queda “pago pendiente” hasta confirmarlo.</Text> : null}

          {payError ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={colors.danger} />
              <Text style={styles.errorText}>{payError}</Text>
            </View>
          ) : null}
          <Button label={payError ? 'Reintentar pago' : current === 'transfer' ? 'Reservar' : `Pagar ${formatPrice(r.amount_cents)}`} onPress={pay} loading={confirm.isPending} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hold: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.warningSoft, borderRadius: radius.md, padding: spacing.md },
  holdText: { color: colors.warning, fontWeight: '700', fontSize: font.sm },
  summary: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
  title: { fontSize: font.md, fontWeight: '800', color: colors.text },
  price: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  muted: { fontSize: font.sm, color: colors.textMuted },
  h2: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { color: colors.primary, fontWeight: '700', fontSize: font.md },
  opt: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.lg },
  optOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optText: { flex: 1, fontSize: font.md, color: colors.text, fontWeight: '500' },
  sub: { fontSize: 12, color: colors.success, fontWeight: '700' },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  pair: { flexDirection: 'row', gap: spacing.md },
  note: { fontSize: font.sm, color: colors.textMuted },
  errorBox: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', backgroundColor: '#FDECEC', borderRadius: radius.md, padding: spacing.md },
  errorText: { flex: 1, color: colors.danger, fontSize: font.sm },
  center: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
});
