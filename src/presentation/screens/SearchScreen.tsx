import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AppHeader } from '@/presentation/components/AppHeader';
import { AppPageTitle } from '@/presentation/components/AppPageTitle';
import { AppScreen } from '@/presentation/components/AppScreen';
import { AppSearchInput } from '@/presentation/components/AppSearchInput';
import { AppStateView } from '@/presentation/components/AppStateView';

export function SearchScreen() {
  const [query, setQuery] = useState('');
  const hasQuery = query.trim().length > 0;

  return (
    <AppScreen contentStyle={styles.container}>
      <AppHeader compact />
      <AppPageTitle
        description="Pesquise por título, elenco ou gênero."
        title="Buscar"
      />
      <AppSearchInput onChangeText={setQuery} value={query} />
      <AppStateView
        description={
          hasQuery
            ? `A consulta por “${query.trim()}” será executada após a integração com o catálogo.`
            : 'Digite um termo para pesquisar filmes e séries no catálogo.'
        }
        title={hasQuery ? 'Busca preparada' : 'O que você quer assistir?'}
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
