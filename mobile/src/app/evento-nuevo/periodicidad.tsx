import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, CalendarPicker, Screen, WizardHeader } from '@/components';
import { patchDraft, useDraftOrEmpty, type EndRule, type Frequency } from '@/features/create/draft';
import { FREQUENCY_LABEL, MAX_SESSIONS, sessionDates } from '@/features/create/sessions';
import { formatLongDate, todayISO, weekdayMon0 } from '@/lib/dates';
import { colors, font, radius, spacing } from '@/theme/tokens';

const FREQS: { key: Frequency; sub: string }[] = [
  { key: 'weekly', sub: 'Se repite cada semana' },
  { key: 'biweekly', sub: 'Se repite cada dos semanas' },
  { key: 'monthly', sub: 'El mismo día de cada mes' },
  { key: 'custom', sub: 'Elige las fechas una por una' },
];
const DOW = ['L', 'M', 'Mi', 'J', 'V', 'S', 'D'];
const DOW_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// EV_04 Periodicidad: ¿se repite? frecuencia, días, fecha de inicio, final y calendario con las sesiones resultantes.
export default function Periodicidad() {
  const router = useRouter();
  const d = useDraftOrEmpty();
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [error, setError] = useState<string>();

  const dates = sessionDates(d);
  if (!d.date) return <Redirect href="/(tabs)/crear" />;
  const weekly = d.frequency === 'weekly' || d.frequency === 'biweekly';
  const toggleDay = (i: number) => {
    const has = d.weekdays.includes(i);
    if (has && d.weekdays.length === 1) return; // al menos un día
    patchDraft({ weekdays: has ? d.weekdays.filter((x) => x !== i) : [...d.weekdays, i] });
  };
  const setEnd = (end: EndRule) => patchDraft({ end });
  const toggleCustom = (iso: string) => {
    if (iso === d.date) return;
    patchDraft({ customDates: d.customDates.includes(iso) ? d.customDates.filter((x) => x !== iso) : [...d.customDates, iso] });
  };
  const count = d.end.kind === 'count' ? d.end.n : 8;
  const endDate = d.end.kind === 'date' ? d.end.date : undefined;
  const truncated = d.repeat && d.end.kind === 'count' && d.end.n > MAX_SESSIONS;

  function next() {
    setError(undefined);
    if (d.repeat) {
      if (d.end.kind === 'date' && d.end.date < d.date) return setError('La fecha de fin debe ser posterior al inicio.');
      if (d.end.kind === 'count' && (d.end.n < 1 || d.end.n > MAX_SESSIONS)) return setError(`El número de sesiones debe estar entre 1 y ${MAX_SESSIONS}.`);
      if (dates.length < 1) return setError('Con estos datos no hay ninguna sesión. Revisa las fechas.');
    }
    patchDraft({ step: 'precio' });
    router.push('/evento-nuevo/precio');
  }

  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <WizardHeader step={2} label="Periodicidad" />
      <Text style={styles.h2}>¿Se repite esta clase?</Text>
      <View style={styles.pair}>
        {([[false, 'Evento único', 'calendar-outline'], [true, 'Clase recurrente', 'repeat-outline']] as const).map(([v, label, icon]) => {
          const on = d.repeat === v;
          return (
            <Pressable key={label} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ selected: on }} onPress={() => patchDraft({ repeat: v, weekdays: d.weekdays.length ? d.weekdays : d.date ? [weekdayMon0(d.date)] : [] })} style={[styles.choice, on && styles.choiceOn]}>
              <Ionicons name={icon} size={26} color={on ? colors.primary : colors.textMuted} />
              <Text style={[styles.choiceText, on && { color: colors.primary }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {d.repeat ? (
        <>
          <Text style={styles.h3}>Frecuencia</Text>
          {FREQS.map((f) => {
            const on = d.frequency === f.key;
            return (
              <Pressable key={f.key} accessibilityRole="radio" accessibilityLabel={FREQUENCY_LABEL[f.key]} accessibilityState={{ selected: on }} onPress={() => patchDraft({ frequency: f.key })} style={[styles.opt, on && styles.optOn]}>
                <View style={[styles.radio, on && styles.radioOn]}>{on ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}</View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optTitle}>{FREQUENCY_LABEL[f.key]}</Text>
                  <Text style={styles.muted}>{f.sub}</Text>
                </View>
              </Pressable>
            );
          })}

          {weekly ? (
            <>
              <Text style={styles.h3}>Días de la semana</Text>
              <View style={styles.days}>
                {DOW.map((l, i) => {
                  const on = d.weekdays.includes(i);
                  return (
                    <Pressable key={i} accessibilityRole="checkbox" accessibilityLabel={DOW_FULL[i]} accessibilityState={{ checked: on }} onPress={() => toggleDay(i)} style={[styles.day, on && styles.dayOn]}>
                      <Text style={[styles.dayText, on && { color: '#fff' }]}>{l}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          <Text style={styles.h3}>Fecha de inicio</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`Fecha de inicio: ${formatLongDate(d.date)}`} onPress={() => setStartOpen((o) => !o)} style={styles.field}>
            <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
            <Text style={styles.fieldText}>{formatLongDate(d.date)}</Text>
            <Ionicons name={startOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </Pressable>
          {startOpen ? <CalendarPicker value={d.date} min={todayISO()} onSelect={(iso) => { patchDraft({ date: iso }); setStartOpen(false); }} /> : null}

          {d.frequency === 'custom' ? (
            <>
              <Text style={styles.h3}>Elige las fechas</Text>
              <CalendarPicker marked={dates} min={d.date} onSelect={toggleCustom} />
            </>
          ) : (
            <>
              <Text style={styles.h3}>Termina</Text>
              {([
                ['open', 'Sin fecha de fin (continua)'],
                ['date', 'Hasta una fecha'],
                ['count', 'Número de sesiones'],
              ] as const).map(([k, label]) => {
                const on = d.end.kind === k;
                return (
                  <Pressable key={k} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ selected: on }} onPress={() => setEnd(k === 'open' ? { kind: 'open' } : k === 'date' ? { kind: 'date', date: endDate ?? d.date } : { kind: 'count', n: count })} style={styles.endRow}>
                    <View style={[styles.radioSm, on && styles.radioSmOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
                    <Text style={styles.endText}>{label}</Text>
                    {k === 'date' && on ? (
                      <Pressable accessibilityRole="button" accessibilityLabel="Elegir fecha de fin" onPress={() => setEndOpen((o) => !o)}><Text style={styles.endValue}>{formatLongDate(endDate ?? d.date)}</Text></Pressable>
                    ) : null}
                    {k === 'count' && on ? (
                      <View style={styles.count}>
                        <Pressable accessibilityRole="button" accessibilityLabel="Menos sesiones" onPress={() => setEnd({ kind: 'count', n: Math.max(1, count - 1) })} style={styles.stepBtn}><Ionicons name="remove" size={16} color={colors.primary} /></Pressable>
                        <Text style={styles.endValue} accessibilityLabel={`${count} sesiones`}>{count} sesiones</Text>
                        <Pressable accessibilityRole="button" accessibilityLabel="Más sesiones" onPress={() => setEnd({ kind: 'count', n: Math.min(MAX_SESSIONS, count + 1) })} style={styles.stepBtn}><Ionicons name="add" size={16} color={colors.primary} /></Pressable>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
              {endOpen && d.end.kind === 'date' ? <CalendarPicker value={d.end.date} min={d.date} onSelect={(iso) => { setEnd({ kind: 'date', date: iso }); setEndOpen(false); }} /> : null}
            </>
          )}
        </>
      ) : null}

      <Text style={styles.h3}>Resumen de sesiones</Text>
      {dates.length ? (
        <>
          <CalendarPicker key={dates.join()} marked={dates} />
          <View style={styles.summary}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
            <Text style={styles.summaryText}>
              {dates.length} {dates.length === 1 ? 'sesión' : 'sesiones'} · primera {formatLongDate(dates[0])}
              {dates.length > 1 ? ` · última ${formatLongDate(dates[dates.length - 1])}` : ''}
              {d.repeat && d.end.kind === 'open' ? ' (se muestran las primeras 12)' : ''}
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.muted}>Aún no hay sesiones: revisa las fechas.</Text>
      )}
      {truncated ? <Text style={styles.muted}>El máximo es {MAX_SESSIONS} sesiones por evento.</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label="Siguiente" onPress={next} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  h2: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  h3: { fontSize: font.lg, fontWeight: '800', color: colors.text },
  pair: { flexDirection: 'row', gap: spacing.md },
  choice: { flex: 1, alignItems: 'center', gap: spacing.sm, borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg },
  choiceOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  choiceText: { fontSize: font.md, fontWeight: '700', color: colors.text },
  opt: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  optOn: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optTitle: { fontSize: font.md, fontWeight: '700', color: colors.text },
  muted: { fontSize: font.sm, color: colors.textMuted },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  days: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayText: { fontSize: font.sm, fontWeight: '700', color: colors.text },
  field: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.lg },
  fieldText: { flex: 1, fontSize: font.md, color: colors.text },
  endRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 44 },
  radioSm: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioSmOn: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  endText: { flex: 1, fontSize: font.md, color: colors.text },
  endValue: { fontSize: font.md, fontWeight: '700', color: colors.primary },
  count: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  summary: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: spacing.md },
  summaryText: { flex: 1, fontSize: font.sm, color: colors.text },
  error: { color: colors.danger, fontSize: font.sm },
});
