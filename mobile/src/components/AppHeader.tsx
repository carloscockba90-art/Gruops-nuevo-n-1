import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, spacing } from '@/theme/tokens';
import { Avatar } from './Avatar';

type P = { name?: string | null; unread?: number; onBell: () => void; onAvatar: () => void };

// Encabezado de IN_01: marca a la izquierda; campana con punto y avatar (abre Perfil) a la derecha.
export function AppHeader({ name, unread = 0, onBell, onAvatar }: P) {
  return (
    <View style={styles.row}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>G</Text>
        </View>
        <Text style={styles.brandText}>Groups</Text>
      </View>
      <View style={styles.right}>
        <Pressable accessibilityLabel="Notificaciones" onPress={onBell} hitSlop={8}>
          <Ionicons name="notifications-outline" size={26} color={colors.text} />
          {unread > 0 ? <View style={styles.dot} /> : null}
        </Pressable>
        <Pressable accessibilityLabel="Mi perfil" onPress={onAvatar} hitSlop={8}>
          <Avatar name={name} size={40} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logo: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontWeight: '800', fontSize: 20 },
  brandText: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  dot: { position: 'absolute', top: 1, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: colors.badge, borderWidth: 1.5, borderColor: colors.bg },
});
