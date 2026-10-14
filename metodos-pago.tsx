import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, ErrorState, Screen, ScreenHeader, SkeletonBlock } from '@/components';
import { BRAND_LABEL } from '@/features/booking/card';
import type { PaymentMethod } from '@/features/booking/types';
import { usePaymentMethodActions, usePaymentMethods } from '@/features/booking/useBooking';
import { colors, font, radius, spacing } from '@/theme/tokens';

const BRAND_STYLE: Record<PaymentMethod['brand'], { bg: string; text: string }> = {
  visa: { bg: '#1A3FBF', text: 'VISA' }, mastercard: { bg: '#1F1F24', text: 'MC' }, amex: { bg: '#1B7FBF', text: 'AMEX' }, other: { bg: colors.textMuted, text: 'CARD' },
};

// PF_06 Métodos de pago: lista, predeterminada, eliminar con confirmación y agregar. Solo se guarda marca, últimos 4 y vencimiento.
export default function MetodosPago() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = usePaymentMethods();
  const { remove, makeDefault } = usePaymentMethodActions();
  const [open, setOpen] = useState<string>();
  const [confirming, setConfirming] = useState<string>();
  const failed = remove.isError || makeDefault.isError;

  return (
    <View style={styles.flex}>
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Métodos de pago" />
        <View style={styles.info}>
          <View style={styles.infoIcon}><Ionicons name="wallet-outline" size={22} color={colors.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Tus métodos de pago se usan para reservas y beneficios</Text>
            <Text style={styles.muted}>Puedes agregar, editar o eliminar tus tarjetas en cualquier momento.</Text>
          </View>
        </View>

        <Text style={styles.h2}>Mis métodos de pago</Text>
        {isLoading ? (
          <><SkeletonBlock height={84} /><SkeletonBlock height={84} /></>
        ) : isError ? (
          <ErrorState title="No pudimos cargar tus tarjetas" onRetry={() => refetch()} />
        ) : (
          <>
            {data?.length === 0 ? <Text style={styles.muted}>Aún no tienes tarjetas guardadas.</Text> : null}
            {data?.map((m) => {
              const b = BRAND_STYLE[m.brand];
              const expanded = open === m.id;
              return (
                <View key={m.id} style={styles.card}>
                  <Pressable accessibilityRole="button" accessibilityLabel={`${BRAND_LABEL[m.brand]} terminada en ${m.last4}`} onPress={() => { setOpen(expanded ? undefined : m.id); setConfirming(undefined); }} style={styles.row}>
                    <View style={[styles.brand, { backgroundColor: b.bg }]}><Text style={styles.brandText}>{b.text}</Text></View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={styles.name}>{BRAND_LABEL[m.brand]} terminada en {m.last4}</Text>
                      <Text style={styles.muted}>Vence {String(m.exp_month).padStart(2, '0')}/{m.exp_year}</Text>
                      {m.is_default ? <View style={styles.def}><Ionicons name="checkmark-circle" size={14} color={colors.success} /><Text style={styles.defText}>Predeterminada</Text></View> : null}
                    </View>
                    <Ionicons name={expanded ? 'chevron-down' : 'chevron-forward'} size={20} color={colors.textMuted} />
                  </Pressable>
                  {expanded ? (
                    confirming === m.id ? (
                      <View style={styles.actions}>
                        <Text style={styles.name}>¿Eliminar esta tarjeta?</Text>
                        <View style={styles.pair}>
                          <View style={{ flex: 1 }}><Button label="Cancelar" variant="secondary" onPress={() => setConfirming(undefined)} /></View>
                          <View style={{ flex: 1 }}><Pressable accessibilityRole="button" onPress={() => remove.mutate(m.id, { onSuccess: () => { setOpen(undefined); setConfirming(undefined); } })} style={styles.danger}><Text style={styles.dangerText}>{remove.isPending ? 'Eliminando…' : 'Eliminar'}</Text></Pressable></View>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.actions}>
                        {!m.is_default ? <Button label="Hacer predeterminada" variant="secondary" loading={makeDefault.isPending} onPress={() => makeDefault.mutate(m.id)} /> : null}
                        <Pressable accessibilityRole="button" accessibilityLabel="Eliminar tarjeta" onPress={() => setConfirming(m.id)} style={styles.linkBtn}><Text style={styles.dangerLink}>Eliminar tarjeta</Text></Pressable>
                      </View>
                    )
                  ) : null}
                </View>
              );
            })}
            {failed ? <Text style={styles.error}>No pudimos guardar el cambio. Inténtalo de nuevo.</Text> : null}
            <Pressable accessibilityRole="button" accessibilityLabel="Agregar tarjeta" onPress={() => router.push('/agregar-tarjeta')} style={styles.add}>
              <View style={styles.addIcon}><Ionicons name="add" size={26} color={colors.primary} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.addTitle}>Agregar tarjeta</Text>
                <Text style={styles.muted}>Guarda una nueva tarjeta de crédito o débito.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          </>
        )}
      </Screen>
      <View style={styles.footer}><Button label="Agregar nuevo método" onPress={() => router.push('/agregar-tarjeta')} /></View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  info: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
  infoIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  infoTitle: { fontSize: font.md, fontWeight: '700', color: colors.text },
  muted: { fontSize: font.sm, color: colors.textMuted },
  h2: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  card: { backgroundColor: colors.bg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  brand: { width: 64, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  brandText: { color: '#fff', fontWeight: '800', fontSize: font.sm, fontStyle: 'italic' },
  name: { fontSize: font.md, fontWeight: '700', color: colors.text },
  def: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.successSoft, alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  defText: { fontSize: 12, fontWeight: '700', color: colors.success },
  actions: { padding: spacing.md, paddingTop: 0, gap: spacing.sm },
  pair: { flexDirection: 'row', gap: spacing.sm },
  danger: { minHeight: 48, borderRadius: radius.pill, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  dangerText: { color: '#fff', fontWeight: '700', fontSize: font.md },
  linkBtn: { alignItems: 'center', padding: spacing.sm },
  dangerLink: { color: colors.danger, fontWeight: '700', fontSize: font.md },
  error: { color: colors.danger, fontSize: font.sm },
  add: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primary, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: spacing.md },
  addIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  addTitle: { fontSize: font.md, fontWeight: '700', color: colors.primary },
  footer: { padding: spacing.lg, width: '100%', maxWidth: 520, alignSelf: 'center', borderTopWidth: 1, borderTopColor: colors.border },
});
