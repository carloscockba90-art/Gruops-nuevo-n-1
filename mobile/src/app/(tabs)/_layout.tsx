import { StyleSheet, Text, View } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/lib/session';
import { colors } from '@/theme/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Barra inferior. Excel v30: Inicio / Explorar / Crear / Grupos / Chats (Crear destacado en el centro).
// Se añadió además un acceso directo a Perfil (pedido del dueño; el Excel lo abre desde el avatar).
const TABS: { name: string; title: string; icon: IconName; raised?: boolean }[] = [
  { name: 'inicio', title: 'Inicio', icon: 'home' },
  { name: 'explorar', title: 'Explorar', icon: 'search-outline' },
  { name: 'crear', title: 'Crear', icon: 'add', raised: true },
  { name: 'grupos', title: 'Grupos', icon: 'people-outline' },
  { name: 'chats', title: 'Chats', icon: 'chatbubble-outline' },
  { name: 'perfil', title: 'Perfil', icon: 'person-circle-outline' },
];

export default function TabsLayout() {
  const { session, loading } = useSession();
  if (!loading && !session) return <Redirect href="/(auth)/bienvenida" />;
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textMuted }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, size }) =>
              t.raised ? (
                <View style={styles.fab}>
                  <Ionicons name={t.icon} color="#fff" size={30} />
                </View>
              ) : (
                <Ionicons name={t.icon} color={color} size={size} />
              ),
            tabBarLabel: ({ color }) => <Text style={{ color, fontSize: 11 }}>{t.title}</Text>,
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fab: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: -22, borderWidth: 3, borderColor: colors.bg },
});
