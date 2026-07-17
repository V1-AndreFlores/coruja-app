import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppHeader } from '@/presentation/components/AppHeader';
import { AppPageTitle } from '@/presentation/components/AppPageTitle';
import { AppScreen } from '@/presentation/components/AppScreen';
import { AppStateView } from '@/presentation/components/AppStateView';

export function FavoritesScreen() {
  return (
    <AppScreen contentStyle={styles.container}>
      <AppHeader compact />
      <AppPageTitle
        description="Seus filmes e séries preferidos, disponíveis mesmo sem login."
        title="Favoritos"
      />
      <AppStateView
        actionLabel="Encontrar títulos"
        description="Marque filmes e séries como favoritos para encontrá-los rapidamente."
        onActionPress={() => router.push('/(tabs)/buscar')}
        title="Nenhum favorito ainda"
        variant="empty"
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
});
