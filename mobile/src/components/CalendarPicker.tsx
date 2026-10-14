import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { parseISODate, toISODate } from '@/lib/dates';
import { colors, font, radius, spacing } from '@/theme/tokens';

type P = {
  /** Día elegido (modo simple). */
  value?: string;
  /** Días resaltados (vista previa de sesiones o selección múltiple). */
  marked?: string[];
  /** Primer día elegible ("AAAA-MM-DD"). */
  min?: string;
  onSelect?: (iso: string) => void;
};

const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

// Calendario mensual (semana desde el lunes). Sin dependencias: sirve para elegir fechas y para previsualizar sesiones.
export function CalendarPicker({ value, marked = [], min, onSelect }: P) {
  const seed = parseISODate(value || marked[0] || toISODate(new Date()));
  const [cursor, setCursor] = useState(() => new Date(seed.getFullYear(), seed.getMonth(), 1));
  const first = (cursor.getDay() + 6) % 7;
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => toISODate(new Date(cursor.getFullYear(), cursor.getMonth(), i + 1)))];
  const title = cursor.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  const move = (n: number) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
  const set = new Set(marked);

  return (
    <View style={styles.box}>
      <View style={styles.nav}>
        <Pressable accessibilityLabel="Mes anterior" onPress={() => move(-1)} hitSlop={10}><Ionicons name="chevron-back" size={20} color={colors.text} /></Pressable>
        <Text style={styles.month}>{title.charAt(0).toUpperCase() + title.slice(1)}</Text>
        <Pressable accessibilityLabel="Mes siguiente" onPress={() => move(1)} hitSlop={10}><Ionicons name="chevron-forward" size={20} color={colors.text} /></Pressable>
      </View>
      <View style={styles.row}>{DOW.map((d, i) => <Text key={i} style={styles.dow}>{d}</Text>)}</View>
      <View style={styles.grid}>
        {cells.map((iso, i) => {
          if (!iso) return <View key={`e${i}`} style={styles.cell} />;
          const disabled = !!min && iso < min;
          const on = iso === value || set.has(iso);
          return (
            <Pressable key={iso} accessibilityRole="button" accessibilityLabel={iso} accessibilityState={{ selected: on, disabled }} disabled={disabled || !onSelect} onPress={() => onSelect?.(iso)} style={styles.cell}>
              <View style={[styles.day, on && styles.dayOn]}>
                <Text style={[styles.dayText, on && { color: '#fff', fontWeight: '800' }, disabled && { color: colors.border }]}>{Number(iso.slice(8))}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  box: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm, backgroundColor: colors.bg },
  nav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  month: { fontSize: font.md, fontWeight: '700', color: colors.text },
  row: { flexDirection: 'row' },
  dow: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  day: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayOn: { backgroundColor: colors.primary },
  dayText: { fontSize: font.sm, color: colors.text },
});
