import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { saveInviteToken } from '@/lib/invite';

// Llega desde https://TU_DOMINIO/i/<token> (App Link) o groups://invite/<token>.
// Guarda el token y sigue al flujo normal; accept_invite se llama en AU_05.
export default function InviteLanding() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  useEffect(() => {
    (async () => {
      if (token) await saveInviteToken(token);
      router.replace('/(auth)/bienvenida');
    })();
  }, [token, router]);
  return null;
}
