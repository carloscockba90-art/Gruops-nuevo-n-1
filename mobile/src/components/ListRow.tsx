import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '@/theme/tokens';

type P = { icon: keyof typeof Ionicons.glyphMap; label: string; onPress?: () => void; danger?: boolean; right?: ReactNode; value?: string };

// Fila de lista de ajustes: icono, texto y flecha (o interruptor / valor a la derecha).
export function ListRow({ icon, label, onPress, danger, right, value }: P) {
  const tint = danger ? colors.danger : colors.primary;
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={label} disabled={!onPress} onPress={onPress} style={styles.row}>
      <View style={[styles.icon, { backgroundColor: danger ? '#FDECEC' : colors.primarySoft }]}><Ionicons name={icon} size={20} color={tint} /></View>
      <Text style={[styles.label, danger && { color: colors.danger }]}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {right ?? (onPress ? <Ionicons name="chevron-forward" size={20} color={colors.textMuted} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 56, paddingHorizontal: spacing.md, backgroundColor: colors.bg, borderRadius: radius.md },
  icon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: font.md, color: colors.text, fontWeight: '500' },
  value: { fontSize: font.sm, color: colors.textMuted },
});
