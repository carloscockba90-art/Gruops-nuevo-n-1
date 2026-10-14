import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Screen } from '@/components';
import { supabase } from '@/lib/supabase';
import { isDemo } from '@/lib/session';
import { colors, font, radius, spacing } from '@/theme/tokens';

// AU_03 Registro: nombre, correo, contraseña y aceptación de términos → AU_04 (código por correo).
export default function Registro() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const valid = name.trim().length > 0 && emailOk && password.length >= 8 && accepted;

  async function submit() {
    setError(undefined);
    const mail = email.trim();
    if (isDemo) return router.push({ pathname: '/(auth)/verificar', params: { email: mail } });
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: mail,
      password,
      options: { data: { full_name: name.trim() } }, // el perfil toma este nombre (handle_new_user)
    });
    setLoading(false);
    if (error) setError(error.message === 'Failed to fetch' ? 'No hay conexión con el servidor. Inténtalo de nuevo.' : error.message);
    else if (data.session) router.replace('/(auth)/intereses'); // proyecto sin confirmación de correo
    else router.push({ pathname: '/(auth)/verificar', params: { email: mail } });
  }

  return (
    <Screen>
      <View style={styles.head}>
        <View style={styles.icon}>
          <Ionicons name="person-add" size={30} color="#fff" />
        </View>
        <Text style={styles.title}>Crea tu cuenta</Text>
      </View>
      <Input label="Nombre" value={name} onChangeText={setName} autoCapitalize="words" textContentType="name" />
      <Input label="Correo electrónico" placeholder="ejemplo@correo.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" textContentType="emailAddress" />
      <Input label="Contraseña (mínimo 8 caracteres)" value={password} onChangeText={setPassword} password error={error} />
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: accepted }} onPress={() => setAccepted((a) => !a)} style={styles.check}>
        <View style={[styles.box, accepted && styles.boxOn]}>{accepted ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}</View>
        <Text style={styles.checkText}>
          Acepto los <Text style={styles.linkText}>Términos y Condiciones</Text>
        </Text>
      </Pressable>
      <Button label="Crear cuenta" onPress={submit} loading={loading} disabled={!valid} />
      <Pressable onPress={() => router.replace('/(auth)/ingresar')} style={styles.foot}>
        <Text style={styles.footText}>
          ¿Ya tienes cuenta? <Text style={styles.footLink}>Inicia sesión</Text>
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  icon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  check: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkText: { color: colors.text, fontSize: font.md, flexShrink: 1 },
  linkText: { color: colors.primary, fontWeight: '600' },
  foot: { alignItems: 'center', marginTop: spacing.sm },
  footText: { color: colors.textMuted, fontSize: font.md },
  footLink: { color: colors.text, fontWeight: '800', borderRadius: radius.sm },
});
