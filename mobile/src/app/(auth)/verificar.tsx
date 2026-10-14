import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, OtpInput, Screen } from '@/components';
import { supabase } from '@/lib/supabase';
import { isDemo } from '@/lib/session';
import { colors, font, spacing } from '@/theme/tokens';

const WAIT = 30;

// AU_04 Verificación: código de 6 dígitos con autoavance, reenvío con cuenta regresiva y error visual.
// Éxito → AU_05. Código inválido o vencido: se queda aquí.
export default function Verificar() {
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [left, setLeft] = useState(WAIT);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  async function verify(token: string) {
    setError(undefined);
    setLoading(true);
    if (isDemo) {
      await new Promise((r) => setTimeout(r, 500));
      setLoading(false);
      if (token === '000000') return setError('Código inválido o vencido');
      return router.replace('/(auth)/intereses');
    }
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    setLoading(false);
    if (error) {
      setCode('');
      setError(error.message === 'Failed to fetch' ? 'No hay conexión. Inténtalo de nuevo.' : 'Código inválido o vencido');
    } else {
      router.replace('/(auth)/intereses');
    }
  }

  async function resend() {
    if (left > 0) return;
    setLeft(WAIT);
    setError(undefined);
    setCode('');
    if (!isDemo) await supabase.auth.resend({ type: 'signup', email });
  }

  const mm = `00:${String(left).padStart(2, '0')}`;

  return (
    <Screen>
      <View style={styles.head}>
        <View style={styles.icon}>
          <Ionicons name="mail" size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>Verifica tu cuenta</Text>
        <Text style={styles.sub}>Te enviamos un código a{'\n'}{email || 'tu correo'}</Text>
      </View>
      <OtpInput value={code} onChange={(v) => { setCode(v); setError(undefined); }} onComplete={verify} error={Boolean(error)} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable onPress={resend} disabled={left > 0} style={styles.resend}>
        <Text style={[styles.resendText, left === 0 && styles.resendOn]}>{left > 0 ? `Reenviar código (${mm})` : 'Reenviar código'}</Text>
      </Pressable>
      <Button label="Verificar" onPress={() => verify(code)} loading={loading} disabled={code.length < 6} />
      {isDemo ? <Text style={styles.hint}>Demostración: cualquier código sirve, menos 000000 (para ver el error).</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  icon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  sub: { textAlign: 'center', color: colors.textMuted, fontSize: font.md },
  error: { textAlign: 'center', color: colors.danger, fontSize: font.sm },
  resend: { alignItems: 'center' },
  resendText: { color: colors.textMuted, fontSize: font.md },
  resendOn: { color: colors.primary, fontWeight: '700' },
  hint: { textAlign: 'center', color: colors.textMuted, fontSize: 12 },
});
