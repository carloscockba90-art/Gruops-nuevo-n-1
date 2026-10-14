import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import {
  AppHeader, DemandCard, EmptyNote, ErrorState, EventCard, LucasBar, PersonCard, Screen,
  SectionHeader, SkeletonBlock, UpcomingEventCard,
} from '@/components';
import { useHome } from '@/features/home/useHome';
import { spacing } from '@/theme/tokens';

// IN_01 Inicio personalizado + Lucas IA.
// Flujo (Excel): avatar → PF_01 · campana → IN_02 · bloque Lucas → LU_00 · tarjeta de demanda → GR_03.
export default function Inicio() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { data, isLoading, isError, refetch } = useHome();
  const cardWidth = Math.min(width, 520) - spacing.lg * 2 - 24;

  const header = (
    <AppHeader
      name={data?.me.name}
      unread={data?.unread_notifications ?? 0}
      onBell={() => router.push('/notificaciones')}
      onAvatar={() => router.push('/(tabs)/perfil')}
    />
  );

  if (isError) {
    return (
      <Screen>
        {header}
        <ErrorState title="No pudimos cargar tu inicio" onRetry={() => refetch()} />
      </Screen>
    );
  }

  return (
    <Screen>
      {header}
      <LucasBar onPress={() => router.push('/lucas')} />

      <SectionHeader title="Recomendado para ti" onSeeAll={() => router.push('/(tabs)/explorar')} />
      {isLoading ? (
        <SkeletonBlock height={260} />
      ) : data && data.recommended_events.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={cardWidth + spacing.md} decelerationRate="fast" contentContainerStyle={styles.carousel}>
          {data.recommended_events.map((e) => (
            <EventCard key={e.id} event={e} width={cardWidth} onPress={() => router.push({ pathname: '/evento/[id]', params: { id: e.id } })} />
          ))}
        </ScrollView>
      ) : (
        <EmptyNote text="Aún no hay eventos recomendados. Cuéntale a Lucas qué quieres hacer." />
      )}

      <SectionHeader title="Tus próximos eventos" onSeeAll={() => router.push('/(tabs)/grupos')} />
      {isLoading ? (
        <SkeletonBlock />
      ) : data && data.upcoming_events.length > 0 ? (
        data.upcoming_events.map((e) => <UpcomingEventCard key={e.id} event={e} onPress={() => router.push({ pathname: '/evento/[id]', params: { id: e.id } })} />)
      ) : (
        <EmptyNote text="Todavía no tienes eventos próximos." />
      )}

      {data?.people && data.people.length > 0 ? (
        <>
          <SectionHeader title="Personas que podrías conocer" onSeeAll={() => router.push('/(tabs)/explorar')} />
          <View style={styles.people}>
            {data.people.map((p) => (
              <PersonCard key={p.id} person={p} />
            ))}
          </View>
        </>
      ) : null}

      {data?.open_demands.map((d) => (
        <DemandCard key={d.id} demand={d} onPress={() => router.push({ pathname: '/grupo-formacion/[id]', params: { id: d.id } })} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  carousel: { gap: spacing.md, paddingRight: spacing.lg },
  people: { flexDirection: 'row', gap: spacing.sm },
});
