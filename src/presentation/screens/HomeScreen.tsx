import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/presentation/components/AppHeader';
import { AppPageTitle } from '@/presentation/components/AppPageTitle';
import { AppScreen } from '@/presentation/components/AppScreen';
import { AppSearchButton } from '@/presentation/components/AppSearchButton';
import { AppSectionHeader } from '@/presentation/components/AppSectionHeader';
import { AppStateView } from '@/presentation/components/AppStateView';
import { CatalogSkeletonRow } from '@/presentation/components/CatalogSkeletonRow';
import { FeatureCard } from '@/presentation/components/FeatureCard';

export function HomeScreen() {
  return (
    <AppScreen contentStyle={styles.container} scroll>
      <AppHeader />
      <AppPageTitle
        description="Encontre informações completas e descubra onde assistir no Brasil."
        title="Sua próxima história começa aqui"
      />
      <AppSearchButton onPress={() => router.push('/(tabs)/buscar')} />

      <View style={styles.featureList}>
        <FeatureCard
          description="Filmes, séries, elenco, gêneros, duração e trailers em um só lugar."
          icon="movie"
          title="Catálogo completo"
        />
        <FeatureCard
          description="Disponibilidade no Brasil para assinatura, aluguel e compra."
          icon="streaming"
          title="Onde assistir"
        />
      </View>

      <View style={styles.section}>
        <AppSectionHeader title="Em alta" />
        <AppStateView
          description="A seção será preenchida quando a integração com o catálogo estiver disponível."
          title="Preparando recomendações"
          variant="loading"
        />
      </View>

      <View style={styles.section}>
        <AppSectionHeader
          actionLabel="Buscar"
          onActionPress={() => router.push('/(tabs)/buscar')}
          title="Filmes populares"
        />
        <CatalogSkeletonRow />
      </View>

      <View style={styles.section}>
        <AppSectionHeader title="Séries populares" />
        <CatalogSkeletonRow />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 22,
  },
  featureList: {
    gap: 12,
  },
  section: {
    gap: 12,
  },
});
