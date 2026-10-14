import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthLogo, Button, Input, Screen, SocialButton } from '@/components';
import { supabase } from '@/lib/supabase';
import { isDemo } from '@/lib/session';
import { colors, font, spacing } from '@/theme/tokens';

// AU_02 Iniciar sesión. Éxito → IN_01. Estados: cargando y error en línea.
export default function Ingresar() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [info, setInfo] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(undefined);
    setInfo(undefined);
    if (isDemo) return router.replace('/(tabs)/inicio');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError(error.message === 'Failed to fetch' ? 'No hay conexión con el servidor. Inténtalo de nuevo.' : 'Correo o contraseña incorrectos');
    } else {
      router.replace('/');
    }
  }

  async function forgot() {
    setError(undefined);
    if (!email.trim()) return setError('Escribe tu correo para enviarte el enlace');
    if (isDemo) return setInfo('En modo demostración no se envían correos.');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) setError('No pudimos enviar el enlace. Inténtalo de nuevo.');
    else setInfo('Te enviamos un enlace para cambiar tu contraseña.');
  }

  const social = (n: string) => setInfo(`El acceso con ${n} se activa al configurar ese proveedor en Supabase.`);

  return (
    <Screen>
      <View style={styles.head}>
        <AuthLogo />
        <Text style={styles.welcome}>¡Bienvenido de nuevo!</Text>
      </View>
      <Input label="Correo electrónico" placeholder="ejemplo@correo.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Contraseña" value={password} onChangeText={setPassword} password error={error} />
      <Pressable onPress={forgot} hitSlop={8}>
        <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
      </Pressable>
      {info ? <Text style={styles.info}>{info}</Text> : null}
      <Button label="Iniciar sesión" onPress={submit} loading={loading} disabled={!isDemo && (!email || !password)} />
      <SocialButton label="Continuar con Google" icon="logo-google" onPress={() => social('Google')} />
      <SocialButton label="Continuar con Apple" icon="logo-apple" onPress={() => social('Apple')} />
      <Pressable onPress={() => router.replace('/(auth)/registro')} style={styles.foot}>
        <Text style={styles.footText}>
          ¿No tienes cuenta? <Text style={styles.footLink}>Regístrate</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  welcome: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  link: { textAlign: 'center', color: colors.primary, fontSize: font.sm },
  info: { textAlign: 'center', color: colors.textMuted, fontSize: font.sm },
  foot: { alignItems: 'center', marginTop: spacing.sm },
  footText: { color: colors.textMuted, fontSize: font.md },
  footLink: { color: colors.text, fontWeight: '800' },
});
