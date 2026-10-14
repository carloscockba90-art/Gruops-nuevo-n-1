import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '@/theme/tokens';

// Bloque "Lucas IA" de IN_01. Tocarlo abre LU_00 (apertura de Lucas).
export function LucasBar({ onPress }: { onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Hablar con Lucas IA" onPress={onPress} style={styles.card}>
      <View style={styles.title}>
        <Ionicons name="sparkles" size={18} color={colors.primary} />
        <Text style={styles.titleText}>Lucas IA</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.input}>
          <Text style={styles.placeholder}>¿Qué quieres hacer?</Text>
          <Ionicons name="keypad-outline" size={20} color={colors.textMuted} />
        </View>
        <View style={styles.mic}>
          <Ionicons name="mic" size={24} color="#fff" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.lucasTint, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  title: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titleText: { color: colors.primary, fontWeight: '700', fontSize: font.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.bg, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.lg },
  placeholder: { color: colors.textMuted, fontSize: font.md },
  mic: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
});
