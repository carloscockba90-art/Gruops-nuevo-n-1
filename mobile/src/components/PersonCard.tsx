import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font } from '@/theme/tokens';
import type { SuggestedPerson } from '@/features/home/types';
import { Avatar } from './Avatar';

export function PersonCard({ person, onPress }: { person: SuggestedPerson; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.col} accessibilityRole="button">
      <Avatar name={person.name} size={72} />
      <Text style={styles.name}>{person.name}</Text>
      <Text style={styles.interest}>{person.interest}</Text>
      <View style={styles.mutual}>
        <Ionicons name="people-outline" size={14} color={colors.textMuted} />
        <Text style={styles.mutualText}>{person.mutual} en común</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  col: { alignItems: 'center', gap: 2, flex: 1 },
  name: { fontSize: font.md, fontWeight: '800', color: colors.text, marginTop: 6 },
  interest: { fontSize: font.sm, color: colors.textMuted },
  mutual: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mutualText: { fontSize: 12, color: colors.textMuted },
});
