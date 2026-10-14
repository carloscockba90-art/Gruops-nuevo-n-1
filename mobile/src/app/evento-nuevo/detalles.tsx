import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, CalendarPicker, Input, Screen, Segmented, SelectField, WizardHeader } from '@/components';
import { patchDraft, useDraftOrEmpty } from '@/features/create/draft';
import { combine, formatLongDate, todayISO, weekdayMon0 } from '@/lib/dates';
import { colors, font, radius, spacing } from '@/theme/tokens';

const TIMES = Array.from({ length: 36 }, (_, i) => {
  const mins = 6 * 60 + i * 30;
  const v = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  return { value: v, label: v };
});
const durLabel = (m: number) => (m < 60 ? `${m} min` : m === 60 ? '1 hora' : `${String(m / 60).replace('.', ',')} horas`);
const DURATIONS = [30, 60, 90, 120, 150, 180, 240, 360, 480].map((m) => ({ value: m, label: durLabel(m) }));

// EV_03 Detalles: fecha, hora, duración, ubicación, cupos e instructor. Siempre sigue EV_04, donde se elige si se repite.
export default function Detalles() {
  const router = useRouter();
  const d = useDraftOrEmpty();
  const [calOpen, setCalOpen] = useState(false);
  const [instructorNote, setInstructorNote] = useState(false);
  const [errors, setErrors] = useState<{ date?: string; time?: string; address?: string; capacity?: string }>({});

  const edit = (patch: Parameters<typeof patchDraft>[0]) => { setErrors({}); patchDraft(patch); };
  const setDate = (iso: string) => {
    edit({ date: iso, weekdays: d.weekdays.length ? d.weekdays : [weekdayMon0(iso)] });
    setCalOpen(false);
  };
  const setCapacity = (n: number) => edit({ capacity: Math.max(0, Math.min(500, n)) });

  function next() {
    const e: typeof errors = {};
    if (!d.date) e.date = 'Elige la fecha.';
    else if (d.date < todayISO()) e.date = 'La fecha no puede ser pasada.';
    else if (new Date(combine(d.date, d.time)).getTime() <= Date.now()) e.time = 'Elige una hora que aún no haya pasado.';
    if (d.modality === 'presencial' && d.address.trim().length < 3) e.address = 'Escribe dónde será el evento.';
    if (!Number.isInteger(d.capacity) || d.capacity < 1 || d.capacity > 500) e.capacity = 'Los cupos deben estar entre 1 y 500.';
    setErrors(e);
    if (Object.keys(e).length) return;
    patchDraft({ address: d.address.trim(), step: 'periodicidad', weekdays: d.weekdays.length ? d.weekdays : [weekdayMon0(d.date)] });
    router.push('/evento-nuevo/periodicidad');
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <WizardHeader step={2} label="Detalles" />

      <View style={{ gap: spacing.xs }}>
        <Text style={styles.label}>Fecha</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Fecha: ${d.date ? formatLongDate(d.date) : 'sin elegir'}`} onPress={() => setCalOpen((o) => !o)} style={[styles.field, errors.date && { borderColor: colors.danger }]}>
          <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
          <Text style={[styles.fieldText, !d.date && { color: colors.textMuted }]}>{d.date ? formatLongDate(d.date) : 'Elige una fecha'}</Text>
          <Ionicons name={calOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
        </Pressable>
        {calOpen ? <CalendarPicker value={d.date} min={todayISO()} onSelect={setDate} /> : null}
        {errors.date ? <Text style={styles.error}>{errors.date}</Text> : null}
      </View>

      <SelectField label="Hora de inicio" icon="time-outline" value={d.time} options={TIMES} onChange={(v) => edit({ time: v })} error={errors.time} />
      <SelectField label="Duración" icon="hourglass-outline" value={d.durationMin} options={DURATIONS} onChange={(v) => edit({ durationMin: v })} />

      <View style={{ gap: spacing.sm }}>
        <Text style={styles.label}>Ubicación</Text>
        <Segmented options={[{ value: 'presencial', label: 'Presencial' }, { value: 'online', label: 'Online' }]} value={d.modality} onChange={(v) => edit({ modality: v })} />
        {d.modality === 'presencial' ? (
          <Input value={d.address} onChangeText={(t) => edit({ address: t })} placeholder="Ej. Parque Central, Santiago" error={errors.address} accessibilityLabel="Dirección" />
        ) : (
          <Text style={styles.note}>Las personas recibirán el enlace de la sesión al reservar.</Text>
        )}
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text style={styles.label}>Cupos disponibles</Text>
        <View style={[styles.stepper, errors.capacity && { borderColor: colors.danger }]}>
          <Ionicons name="people-outline" size={18} color={colors.textMuted} />
          <Pressable accessibilityRole="button" accessibilityLabel="Menos cupos" onPress={() => setCapacity(d.capacity - 1)} style={styles.stepBtn}><Ionicons name="remove" size={20} color={colors.primary} /></Pressable>
          <Text style={styles.stepValue} accessibilityLabel={`Cupos: ${d.capacity}`}>{d.capacity}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Más cupos" onPress={() => setCapacity(d.capacity + 1)} style={styles.stepBtn}><Ionicons name="add" size={20} color={colors.primary} /></Pressable>
        </View>
        {errors.capacity ? <Text style={styles.error}>{errors.capacity}</Text> : null}
      </View>

      <View style={{ gap: spacing.xs }}>
        <Text style={styles.label}>Instructor o profesional</Text>
        <Text style={styles.note}>Selecciona si aplica</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Elegir instructor" onPress={() => setInstructorNote(true)} style={styles.field}>
          <Ionicons name="person-circle-outline" size={22} color={colors.textMuted} />
          <Text style={[styles.fieldText, { color: colors.textMuted }]}>Sin instructor</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
        {instructorNote ? <Text style={styles.note}>Los perfiles de profesionales certificados llegan junto con Lucas para profesionales.</Text> : null}
      </View>

      <Button label="Siguiente" onPress={next} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: font.md, color: colors.text },
  field: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg, backgroundColor: colors.bg },
  fieldText: { flex: 1, fontSize: font.md, color: colors.text },
  stepper: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg },
  stepBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stepValue: { flex: 1, textAlign: 'center', fontSize: font.lg, fontWeight: '800', color: colors.text },
  note: { fontSize: font.sm, color: colors.textMuted },
  error: { fontSize: font.sm, color: colors.danger },
});
