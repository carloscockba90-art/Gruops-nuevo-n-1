import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useSession } from '@/lib/session';

// Punto de entrada: decide según haya sesión o no.
export default function Entry() {
  const { session, loading } = useSession();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <Redirect href={session ? '/(tabs)/inicio' : '/(auth)/bienvenida'} />;
}
