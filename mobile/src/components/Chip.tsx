import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, font, radius, spacing } from '@/theme/tokens';

type P = { label: string; selected?: boolean; onPress?: () => void; disabled?: boolean; accessibilityLabel?: string };

// Botón-etiqueta redondeado (categorías, filtros). Seleccionado = fondo azul suave y borde azul.
export function Chip({ label, selected, onPress, disabled, accessibilityLabel }: P) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected: !!selected, disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={[styles.chip, selected && styles.on, disabled && { opacity: 0.45 }]}
    >
      <Text style={[styles.text, selected && styles.textOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { minHeight: 38, paddingHorizontal: spacing.lg, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  on: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  text: { fontSize: font.sm, color: colors.text, fontWeight: '500' },
  textOn: { color: colors.primary, fontWeight: '700' },
});
