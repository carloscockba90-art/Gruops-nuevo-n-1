import { StyleSheet, Text, View } from 'react-native';
import { colors, font, spacing } from '@/theme/tokens';

// Marca de las pantallas de acceso (círculo oscuro con G + nombre).
export function AuthLogo({ light = false, size = 64 }: { light?: boolean; size?: number }) {
  return (
    <View style={styles.col}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: light ? '#fff' : colors.text }]}>
        <Text style={[styles.g, { fontSize: size * 0.56, color: light ? colors.text : '#fff' }]}>G</Text>
      </View>
      <Text style={[styles.name, { color: light ? '#fff' : colors.text }]}>Groups</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  col: { alignItems: 'center', gap: spacing.sm },
  circle: { alignItems: 'center', justifyContent: 'center' },
  g: { fontWeight: '800' },
  name: { fontSize: font.xxl, fontWeight: '800' },
});
