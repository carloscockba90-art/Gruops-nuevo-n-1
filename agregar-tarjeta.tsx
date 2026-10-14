import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Screen, ScreenHeader } from '@/components';
import { detectBrand, digits, formatExpiry, formatNumber, validateCard, type CardErrors } from '@/features/booking/card';
import { usePaymentMethodActions } from '@/features/booking/useBooking';
import { colors, font, radius, spacing } from '@/theme/tokens';

// Agregar tarjeta (desde PF_06). DEMOSTRACIÓN: en la versión real este formulario lo muestra el proveedor de pagos
// y a la app solo vuelve un identificador; el número completo y el CVV nunca pasan por Groups.
export default function AgregarTarjeta() {
  const router = useRouter();
  const { add } = usePaymentMethodActions();
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [errors, setErrors] = useState<CardErrors>({});
  const [failure, setFailure] = useState<string>();

  function submit() {
    setFailure(undefined);
    const e = validateCard(number, expiry, cvv);
    setErrors(e);
    if (Object.keys(e).length) return;
    const [mm, yy] = expiry.split('/');
    add.mutate(
      { brand: detectBrand(number), last4: digits(number).slice(-4), exp_month: Number(mm), exp_year: 2000 + Number(yy) },
      {
        onSuccess: () => router.back(),
        onError: (err) => setFailure(err.message === 'card_declined' ? 'La tarjeta fue rechazada. Prueba con otra.' : err.message === 'too_many_methods' ? 'Puedes guardar hasta 5 tarjetas.' : 'No pudimos guardar la tarjeta. Inténtalo de nuevo.'),
      },
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Agregar tarjeta" />
      <Input label="Número de tarjeta" value={number} onChangeText={(t) => setNumber(formatNumber(t))} placeholder="1234 5678 9012 3456" keyboardType="number-pad" error={errors.number} autoComplete="off" />
      <View style={styles.pair}>
        <View style={{ flex: 1 }}><Input label="MM/AA" value={expiry} onChangeText={(t) => setExpiry(formatExpiry(t))} placeholder="12/28" keyboardType="number-pad" error={errors.expiry} autoComplete="off" /></View>
        <View style={{ flex: 1 }}><Input label="CVV" value={cvv} onChangeText={(t) => setCvv(digits(t).slice(0, 4))} placeholder="123" keyboardType="number-pad" secureTextEntry error={errors.cvv} autoComplete="off" /></View>
      </View>
      <View style={styles.note}>
        <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
        <Text style={styles.noteText}>Demostración: solo se guardan la marca, los últimos 4 dígitos y el vencimiento. La versión real usa el formulario seguro del proveedor de pagos.</Text>
      </View>
      {failure ? <Text style={styles.error}>{failure}</Text> : null}
      <Button label="Guardar tarjeta" onPress={submit} loading={add.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pair: { flexDirection: 'row', gap: spacing.md },
  note: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  noteText: { flex: 1, fontSize: font.sm, color: colors.textMuted },
  error: { color: colors.danger, fontSize: font.sm },
});
