import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';
import { Avatar } from './Avatar';

type P = { people: { id: string; name: string | null; photo_path: string | null }[]; extra?: number; size?: number };

export function AvatarStack({ people, extra = 0, size = 28 }: P) {
  return (
    <View style={styles.row}>
      {people.map((p, i) => (
        <View key={p.id} style={[styles.ring, { marginLeft: i === 0 ? 0 : -size * 0.3, borderRadius: size }]}>
          <Avatar name={p.name} size={size} />
        </View>
      ))}
      {extra > 0 ? (
        <View style={[styles.more, { width: size, height: size, borderRadius: size / 2, marginLeft: -size * 0.3 }]}>
          <Text style={styles.moreText}>+{extra}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  ring: { borderWidth: 2, borderColor: colors.bg },
  more: { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bg },
  moreText: { fontSize: 11, color: colors.text, fontWeight: '700' },
});
