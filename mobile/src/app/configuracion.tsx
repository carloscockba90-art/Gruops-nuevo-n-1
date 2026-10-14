import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ListRow, Screen, ScreenHeader, SkeletonBlock, ErrorState } from '@/components';
import { useMe, useUpdateSettings } from '@/features/profile/useMe';
import type { Settings } from '@/features/profile/types';
import { isDemo } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { colors, font, radius, spacing } from '@/theme/tokens';

const TOGGLES: { key: keyof Pick<Settings, 'push_enabled' | 'notif_group_updates' | 'notif_lucas' | 'notif_messages'>; label: string }[] = [
  { key: 'push_enabled', label: 'Notificaciones push' },
  { key: 'notif_group_updates', label: 'Novedades de mis grupos' },
  { key: 'notif_lucas', label: 'Avisos de Lucas' },
  { key: 'notif_messages', label: 'Mensajes' },
];

// PF_02 Configuración / cuenta. Los interruptores se guardan al instante (update_settings).
export default function Configuracion() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useMe();
  const save = useUpdateSettings();
  const [open, setOpen] = useState(false);

  async function salir() {
    if (!isDemo) await supabase.auth.signOut();
    router.replace('/(auth)/bienvenida');
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Configuración" />
      <Text style={styles.h2}>Cuenta</Text>
      {isLoading ? (
        <SkeletonBlock height={260} />
      ) : isError || !data ? (
        <ErrorState title="No pudimos cargar tus ajustes" onRetry={() => refetch()} />
      ) : (
        <View style={styles.list}>
          <ListRow icon="person-outline" label="Editar perfil" onPress={() => router.push('/editar-perfil')} />
          <ListRow icon="notifications-outline" label="Notificaciones" onPress={() => setOpen((o) => !o)} right={<Text style={styles.chev}>{open ? '⌃' : '⌄'}</Text>} />
          {open ? (
            <View style={styles.panel}>
              {TOGGLES.map((t) => (
                <View key={t.key} style={styles.toggle}>
                  <Text style={styles.toggleText}>{t.label}</Text>
                  <Switch
                    accessibilityLabel={t.label}
                    value={data.settings[t.key]}
                    onValueChange={(v) => save.mutate({ [t.key]: v })}
                    trackColor={{ true: colors.primary, false: colors.border }}
                  />
                </View>
              ))}
              {save.isError ? <Text style={styles.error}>No pudimos guardar el cambio. Inténtalo de nuevo.</Text> : null}
            </View>
          ) : null}
          <ListRow icon="lock-closed-outline" label="Privacidad" onPress={() => router.push('/editar-perfil')} value={data.profile.profile_visibility === 'private' ? 'Privado' : 'Público'} />
          <ListRow icon="globe-outline" label="Idioma" value="Español" />
          <ListRow icon="help-circle-outline" label="Ayuda" onPress={() => router.push({ pathname: '/proximamente', params: { name: 'Ayuda' } })} />
          <ListRow icon="trash-outline" label="Eliminar cuenta" onPress={() => router.push({ pathname: '/proximamente', params: { name: 'Eliminar cuenta' } })} />
          <ListRow icon="log-out-outline" label="Cerrar sesión" danger onPress={salir} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  h2: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  list: { gap: spacing.xs },
  chev: { color: colors.textMuted, fontSize: font.lg },
  panel: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm },
  toggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  toggleText: { fontSize: font.md, color: colors.text, flexShrink: 1 },
  error: { color: colors.danger, fontSize: font.sm },
});
