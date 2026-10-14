import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthLogo, Button } from '@/components';
import { readInviteToken } from '@/lib/invite';
import { rpc } from '@/lib/api';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isDemo } from '@/lib/session';
import { colors, font, radius, spacing } from '@/theme/tokens';

type Preview = { valid: boolean; title?: string; inviter?: { first_name?: string }; members_count?: number; min_members?: number };

// AU_01 Bienvenida. Variante "te invitó…" si hay un token de invitación guardado.
export default function Bienvenida() {
  const router = useRouter();
  const [invite, setInvite] = useState<Preview | null>(null);
  const [note, setNote] = useState<string>();

  useEffect(() => {
    (async () => {
      const token = await readInviteToken();
      if (!token || !isSupabaseConfigured) return;
      try {
        const p = await rpc<Preview>('get_invite_preview', { p_token: token });
        if (p?.valid && p.title) setInvite(p);
      } catch {
        /* enlace inválido o sin red: seguimos con la bienvenida normal */
      }
    })();
  }, []);

  const social = (name: string) => setNote(`El acceso con ${name} se activa al configurar ese proveedor en Supabase.`);

  return (
    <View style={styles.root}>
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.top}>
            <AuthLogo light size={72} />
          </View>
          <View style={styles.bottom}>
            {invite ? (
              <View style={styles.invite}>
                <Ionicons name="people" size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.inviteTitle}>
                    Te invitó {invite.inviter?.first_name || 'alguien'} a: {invite.title}
                  </Text>
                  {invite.min_members ? (
                    <Text style={styles.inviteMeta}>
                      {invite.members_count ?? 0} de {invite.min_members} personas
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}
            <Text style={styles.tagline}>Conecta, comparte{'\n'}y vive experiencias juntos</Text>
            <Button label="Crear cuenta" onPress={() => router.push('/(auth)/registro')} />
            <Pressable accessibilityRole="button" onPress={() => router.push('/(auth)/ingresar')} style={styles.white}>
              <Text style={styles.whiteText}>Iniciar sesión</Text>
            </Pressable>
            <Text style={styles.or}>o continúa con</Text>
            <View style={styles.socials}>
              <Pressable accessibilityLabel="Continuar con Apple" style={styles.round} onPress={() => social('Apple')}>
                <Ionicons name="logo-apple" size={24} color={colors.text} />
              </Pressable>
              <Pressable accessibilityLabel="Continuar con Google" style={styles.round} onPress={() => social('Google')}>
                <Ionicons name="logo-google" size={22} color={colors.text} />
              </Pressable>
              <Pressable accessibilityLabel="Continuar con correo" style={styles.round} onPress={() => router.push('/(auth)/ingresar')}>
                <Ionicons name="mail-outline" size={24} color={colors.text} />
              </Pressable>
            </View>
            {note ? <Text style={styles.note}>{note}</Text> : null}
            {!isSupabaseConfigured && !isDemo ? <Text style={styles.note}>Falta configurar Supabase: copia .env.example a .env y reinicia.</Text> : null}
            {isDemo ? <Button label="Entrar al modo demostración" variant="secondary" onPress={() => router.replace('/(tabs)/inicio')} /> : null}
            <Text style={styles.legal}>Al continuar, aceptas nuestros Términos y Política de Privacidad.</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B1033', overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: colors.primary },
  blobA: { width: 420, height: 420, top: -120, right: -140, opacity: 0.35 },
  blobB: { width: 320, height: 320, top: 120, left: -160, opacity: 0.2 },
  safe: { flex: 1 },
  content: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center', padding: spacing.lg, justifyContent: 'space-between' },
  top: { alignItems: 'center', marginTop: spacing.xxl * 2 },
  bottom: { gap: spacing.md },
  tagline: { color: '#fff', fontSize: font.xxl, fontWeight: '800', textAlign: 'center', marginBottom: spacing.md },
  invite: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: '#fff', borderRadius: radius.lg, padding: spacing.md },
  inviteTitle: { color: colors.text, fontWeight: '800', fontSize: font.md },
  inviteMeta: { color: colors.textMuted, fontSize: font.sm },
  white: { minHeight: 48, borderRadius: radius.pill, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  whiteText: { color: colors.text, fontSize: font.md, fontWeight: '600' },
  or: { color: '#C9CCE8', textAlign: 'center', fontSize: font.sm, marginTop: spacing.sm },
  socials: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg },
  round: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  note: { color: '#C9CCE8', textAlign: 'center', fontSize: font.sm },
  legal: { color: '#C9CCE8', textAlign: 'center', fontSize: 12, marginTop: spacing.sm },
});
