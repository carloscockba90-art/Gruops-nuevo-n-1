import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ChatInput, Screen, ScreenHeader } from '@/components';
import { colors, font, radius, spacing } from '@/theme/tokens';

// Sugerencias de la pantalla (Excel LU_00). Tocar una la envía como primer mensaje a LU_01.
const SUGGESTIONS = ['Buscar eventos cerca de mí', 'Crear un evento', 'Ideas para el fin de semana', 'Recomendaciones personalizadas'];

// LU_00 Apertura de Lucas IA.
export default function LucasApertura() {
  const router = useRouter();
  const go = (q: string) => router.push({ pathname: '/lucas-chat', params: { q } });
  return (
    <Screen>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="" />
      <View style={styles.head}>
        <View style={styles.logo}><Ionicons name="sparkles" size={34} color="#fff" /></View>
        <Text style={styles.title}>Lucas IA</Text>
        <Text style={styles.sub}>Tu asistente para descubrir, crear y disfrutar experiencias</Text>
      </View>
      <View style={styles.list}>
        {SUGGESTIONS.map((s) => (
          <Pressable key={s} onPress={() => go(s)} accessibilityRole="button" style={styles.pill}>
            <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
            <Text style={styles.pillText}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <ChatInput onSend={go} autoFocus />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { alignItems: 'center', gap: spacing.sm, marginVertical: spacing.md },
  logo: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: font.xxl, fontWeight: '800', color: colors.text },
  sub: { textAlign: 'center', color: colors.textMuted, fontSize: font.md },
  list: { gap: spacing.md, alignItems: 'flex-start' },
  pill: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.lucasTint, borderRadius: radius.pill, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  pillText: { color: colors.text, fontSize: font.md, fontWeight: '600' },
});
