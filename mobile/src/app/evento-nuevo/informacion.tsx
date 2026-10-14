import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Screen, SelectField, WizardHeader } from '@/components';
import { patchDraft, useDraftOrEmpty } from '@/features/create/draft';
import { useCategories } from '@/features/explore/useExplore';
import { colors, font, radius, spacing } from '@/theme/tokens';

// EV_02 Información básica. Validaciones: título 3–80 caracteres, descripción hasta 1000, categoría obligatoria.
// La foto necesita Storage (como PF_03): por ahora el botón avisa que llegará.
export default function Informacion() {
  const router = useRouter();
  const d = useDraftOrEmpty();
  const cats = useCategories();
  const [errors, setErrors] = useState<{ title?: string; description?: string; category?: string }>({});
  const [photoNote, setPhotoNote] = useState(false);

  const edit = (patch: Parameters<typeof patchDraft>[0]) => { setErrors({}); patchDraft(patch); };

  function next() {
    const e: typeof errors = {};
    const t = d.title.trim();
    if (t.length < 3) e.title = 'Escribe un título de al menos 3 caracteres.';
    if (t.length > 80) e.title = 'El título puede tener hasta 80 caracteres.';
    if (d.description.length > 1000) e.description = 'La descripción puede tener hasta 1000 caracteres.';
    if (!d.categoryId) e.category = 'Elige una categoría.';
    setErrors(e);
    if (Object.keys(e).length) return;
    patchDraft({ title: t, step: 'detalles' });
    router.push('/evento-nuevo/detalles');
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <WizardHeader step={1} label="Información básica" />
      <Pressable accessibilityRole="button" accessibilityLabel="Agregar foto" onPress={() => setPhotoNote(true)} style={styles.photo}>
        <View style={styles.photoIcon}><Ionicons name="camera-outline" size={26} color={colors.primary} /></View>
        <Text style={styles.photoText}>Agregar foto</Text>
      </Pressable>
      {photoNote ? <Text style={styles.note}>Subir la foto estará disponible cuando conectemos el almacenamiento de archivos.</Text> : null}

      <Input label="Título del evento" value={d.title} onChangeText={(t) => edit({ title: t })} placeholder="Ej. Clase de pádel nivel inicial" error={errors.title} maxLength={90} />
      <View>
        <Input label="Descripción" value={d.description} onChangeText={(t) => edit({ description: t })} placeholder="Cuéntanos más sobre tu evento…" multiline numberOfLines={5} style={styles.desc} error={errors.description} />
        <Text style={styles.counter}>{d.description.length}/1000</Text>
      </View>
      <SelectField
        label="Categoría"
        value={d.categoryId ?? ''}
        options={[{ value: '', label: 'Selecciona una categoría' }, ...(cats.data ?? []).map((c) => ({ value: c.id, label: c.name }))]}
        onChange={(v) => edit({ categoryId: v || null })}
        error={errors.category}
      />
      <Button label="Continuar" onPress={next} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  photo: { height: 150, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.primary, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  photoIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  photoText: { color: colors.primary, fontWeight: '700', fontSize: font.md },
  note: { fontSize: font.sm, color: colors.textMuted },
  desc: { minHeight: 120, textAlignVertical: 'top', paddingTop: spacing.md },
  counter: { alignSelf: 'flex-end', fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
