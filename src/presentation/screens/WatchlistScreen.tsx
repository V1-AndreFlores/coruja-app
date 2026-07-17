import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { AppHeader } from '@/presentation/components/AppHeader';
import { AppPageTitle } from '@/presentation/components/AppPageTitle';
import { AppScreen } from '@/presentation/components/AppScreen';
import { AppStateView } from '@/presentation/components/AppStateView';

export function WatchlistScreen() {
  return (
    <AppScreen contentStyle={styles.container}>
      <AppHeader compact />
      <AppPageTitle
        description="Guarde títulos para decidir o que assistir depois."
        title="Quero assistir"
      />
      <AppStateView
        actionLabel="Explorar catálogo"
        description="Os títulos adicionados à sua lista ficarão armazenados neste aparelho."
        onActionPress={() => router.push('/(tabs)/buscar')}
        title="Sua lista está vazia"
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
