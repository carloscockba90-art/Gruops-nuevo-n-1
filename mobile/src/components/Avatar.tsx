import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';

type Props = { name?: string | null; uri?: string | null; size?: number };

const TINTS = ['#E4E2FF', '#FFE7D1', '#DFF5E6', '#DDEBFF', '#FCE4EC'];

export function Avatar({ name, uri, size = 40 }: Props) {
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (uri) return <Image source={{ uri }} style={box} />;
  const label = (name ?? '?').trim();
  const initial = label.charAt(0).toUpperCase() || '?';
  const tint = TINTS[(label.charCodeAt(0) || 0) % TINTS.length];
  return (
    <View style={[styles.fallback, box, { backgroundColor: tint }]}>
      <Text style={{ color: colors.primary, fontWeight: '700', fontSize: size * 0.42 }}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
