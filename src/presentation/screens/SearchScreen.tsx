import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/presentation/components/AppHeader';
import { AppPageTitle } from '@/presentation/components/AppPageTitle';
import { AppScreen } from '@/presentation/components/AppScreen';
import { AppSearchInput } from '@/presentation/components/AppSearchInput';
import { AppStateView } from '@/presentation/components/AppStateView';
import { CatalogSearchResultCard } from '@/presentation/components/CatalogSearchResultCard';
import { useCatalogSearch } from '@/presentation/hooks/useCatalogSearch';

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const { items, status, errorMessage, hasValidQuery, retry } =
    useCatalogSearch(query);

  const renderContent = () => {
    if (!hasValidQuery) {
      return (
        <AppStateView
          description="Digite ao menos dois caracteres para pesquisar filmes e séries."
          title="O que você quer assistir?"
          variant="empty"
        />
      );
    }

    if (status === 'loading') {
      return (
        <AppStateView
          description={`Procurando resultados para “${query.trim()}”.`}
          title="Consultando catálogo"
          variant="loading"
        />
      );
    }

    if (status === 'error') {
      return (
        <AppStateView
          actionLabel="Tentar novamente"
          description={errorMessage ?? 'Não foi possível executar a busca.'}
          onActionPress={retry}
          title="Falha na pesquisa"
          variant="error"
        />
      );
    }

    if (status === 'success' && items.length === 0) {
      return (
        <AppStateView
          description={`Nenhum filme ou série foi encontrado para “${query.trim()}”.`}
          title="Nenhum resultado"
          variant="empty"
        />
      );
    }

    return (
      <View style={styles.results}>
        {items.map((item) => (
          <CatalogSearchResultCard
            item={item}
            key={`${item.mediaType}:${item.id}`}
          />
        ))}
      </View>
    );
  };

  return (
    <AppScreen contentStyle={styles.container} scroll>
      <AppHeader compact />
      <AppPageTitle
        description="Pesquise por títulos de filmes e séries."
        title="Buscar"
      />
      <AppSearchInput onChangeText={setQuery} value={query} />
      {renderContent()}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingBottom: 96,
  },
  results: {
    gap: 12,
  },
});
