import { StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Screen, ScreenHeader } from '@/components';
import { colors, font, spacing } from '@/theme/tokens';

// Destino provisional de pantallas que se construyen en la Ola 3 (reservas, mis eventos, intereses, pagos…).
export default function Proximamente() {
  const { name = 'Esta sección' } = useLocalSearchParams<{ name?: string }>();
  const router = useRouter();
  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="" />
      <View style={styles.box}>
        <View style={styles.icon}><Ionicons name="construct-outline" size={34} color={colors.primary} /></View>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.text}>Esta pantalla se construye en la siguiente etapa del proyecto.</Text>
        <Button label="Volver" variant="secondary" onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)/inicio'))} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl },
  icon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.xl, fontWeight: '800', color: colors.text },
  text: { color: colors.textMuted, textAlign: 'center', fontSize: font.md },
});
