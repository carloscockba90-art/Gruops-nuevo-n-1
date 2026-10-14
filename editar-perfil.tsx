import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Avatar, Button, ErrorState, Input, Screen, ScreenHeader, SkeletonBlock } from '@/components';
import { useMe, useUpdateMe } from '@/features/profile/useMe';
import type { Me } from '@/features/profile/types';
import { colors, font, spacing } from '@/theme/tokens';

// PF_03 Editar perfil. Validaciones: nombre obligatorio, edad 13–120 (opcional), bio hasta 500 caracteres.
// La foto (botón de cámara) necesita Storage: queda como aviso hasta conectar Supabase.
export default function EditarPerfil() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useMe();
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)/perfil'));

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Editar perfil" onBack={leave} />
      {isLoading ? (
        <><SkeletonBlock height={120} /><SkeletonBlock height={260} /></>
      ) : isError || !data ? (
        <ErrorState title="No pudimos cargar tu perfil" onRetry={() => refetch()} />
      ) : (
        <Form profile={data.profile} onDone={leave} />
      )}
    </Screen>
  );
}

function Form({ profile: p, onDone }: { profile: Me['profile']; onDone: () => void }) {
  const save = useUpdateMe();
  const [name, setName] = useState(p.display_name ?? '');
  const [age, setAge] = useState(p.age ? String(p.age) : '');
  const [city, setCity] = useState(p.city ?? '');
  const [bio, setBio] = useState(p.bio ?? '');
  const [priv, setPriv] = useState(p.profile_visibility === 'private');
  const [errors, setErrors] = useState<{ name?: string; age?: string; bio?: string }>({});
  const [photoNote, setPhotoNote] = useState(false);

  function submit() {
    const e: typeof errors = {};
    if (name.trim().length < 2) e.name = 'Escribe tu nombre.';
    const n = age.trim() ? Number(age) : null;
    if (n !== null && (!Number.isInteger(n) || n < 13 || n > 120)) e.age = 'Ingresa una edad entre 13 y 120.';
    if (bio.length > 500) e.bio = 'La bio puede tener hasta 500 caracteres.';
    setErrors(e);
    if (Object.keys(e).length) return;
    save.mutate(
      { display_name: name.trim(), age: n, city: city.trim() || null, bio: bio.trim() || null, profile_visibility: priv ? 'private' : 'public' },
      { onSuccess: onDone },
    );
  }

  return (
    <>
      <View style={styles.photo}>
        <Avatar name={name} size={96} />
        <Pressable accessibilityRole="button" accessibilityLabel="Cambiar foto" onPress={() => setPhotoNote(true)} style={styles.camera}>
          <Ionicons name="camera" size={16} color="#fff" />
        </Pressable>
      </View>
      {photoNote ? <Text style={styles.note}>Cambiar la foto estará disponible cuando conectemos el almacenamiento de archivos.</Text> : null}

      <Input label="Nombre" value={name} onChangeText={setName} error={errors.name} autoCapitalize="words" />
      <Input label="Edad" value={age} onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" error={errors.age} />
      <Input label="Ciudad" value={city} onChangeText={setCity} autoCapitalize="words" />
      <View>
        <Input label="Bio" value={bio} onChangeText={setBio} multiline numberOfLines={4} style={styles.bio} error={errors.bio} />
        <Text style={styles.counter}>{bio.length}/500</Text>
      </View>

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchTitle}>Perfil privado</Text>
          <Text style={styles.note}>{priv ? 'Otras personas solo ven tu nombre y foto.' : 'Tu perfil es visible para otras personas.'}</Text>
        </View>
        <Switch accessibilityLabel="Perfil privado" value={priv} onValueChange={setPriv} trackColor={{ true: colors.primary, false: colors.border }} />
      </View>

      {save.isError ? <Text style={styles.error}>No pudimos guardar los cambios. Inténtalo de nuevo.</Text> : null}
      <Button label="Guardar cambios" onPress={submit} loading={save.isPending} />
      <Button label="Cancelar" variant="ghost" onPress={onDone} />
    </>
  );
}

const styles = StyleSheet.create({
  photo: { alignSelf: 'center' },
  camera: { position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  note: { fontSize: font.sm, color: colors.textMuted },
  bio: { minHeight: 110, textAlignVertical: 'top', paddingTop: spacing.md },
  counter: { alignSelf: 'flex-end', fontSize: 12, color: colors.textMuted, marginTop: 2 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  switchTitle: { fontSize: font.md, fontWeight: '700', color: colors.text },
  error: { color: colors.danger, fontSize: font.sm },
});
