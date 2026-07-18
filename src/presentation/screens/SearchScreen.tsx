import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  DEFAULT_SEARCH_FILTERS,
  type SearchFilters,
} from '@/domain/models/SearchFilters';
import { ActiveSearchFilters } from '@/presentation/components/ActiveSearchFilters';
import { AppHeader } from '@/presentation/components/AppHeader';
import { AppLoadingOverlay } from '@/presentation/components/AppLoadingOverlay';
import { AppPageTitle } from '@/presentation/components/AppPageTitle';
import { AppScreen } from '@/presentation/components/AppScreen';
import { AppSearchInput } from '@/presentation/components/AppSearchInput';
import { AppStateView } from '@/presentation/components/AppStateView';
import { AppText } from '@/presentation/components/AppText';
import { AppUpdatingIndicator } from '@/presentation/components/AppUpdatingIndicator';
import { CatalogSearchResultCard } from '@/presentation/components/CatalogSearchResultCard';
import { SearchFiltersButton } from '@/presentation/components/SearchFiltersButton';
import { SearchFiltersModal } from '@/presentation/components/SearchFiltersModal';
import { useCatalogSearch } from '@/presentation/hooks/useCatalogSearch';
import { useWatchProviderOptions } from '@/presentation/hooks/useWatchProviderOptions';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

let sessionFilters: SearchFilters = DEFAULT_SEARCH_FILTERS;

function countActiveFilters(filters: SearchFilters): number {
  return [
    filters.mediaType !== 'all',
    Boolean(filters.genre),
    Boolean(filters.yearFrom || filters.yearTo),
    Boolean(filters.minimumRating),
    Boolean(filters.providerKey),
    filters.availability !== 'any',
  ].filter(Boolean).length;
}

export function SearchScreen() {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(() => sessionFilters);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const {
    items,
    matchedPersonName,
    status,
    errorMessage,
    hasValidQuery,
    isInitialLoading,
    isRefreshing,
    retry,
  } = useCatalogSearch(query, filters);
  const { options: providers, status: providersStatus } =
    useWatchProviderOptions(filtersVisible || Boolean(filters.providerKey));

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters],
  );

  useEffect(() => {
    sessionFilters = filters;
  }, [filters]);

  useEffect(() => {
    if (!matchedPersonName || !filters.providerKey) {
      return;
    }

    setFilters((current) => ({
      ...current,
      providerKey: undefined,
      availability: 'any',
    }));
  }, [filters.providerKey, matchedPersonName]);

  const applyFilters = (nextFilters: SearchFilters) => {
    setFilters(nextFilters);
    setFiltersVisible(false);
  };

  const removeFilter = (
    key:
      | 'mediaType'
      | 'genre'
      | 'yearFrom'
      | 'yearTo'
      | 'minimumRating'
      | 'providerKey'
      | 'availability',
  ) => {
    setFilters((current) => {
      switch (key) {
        case 'mediaType':
          return { ...current, mediaType: 'all' };
        case 'genre':
          return { ...current, genre: undefined };
        case 'yearFrom':
        case 'yearTo':
          return { ...current, yearFrom: undefined, yearTo: undefined };
        case 'minimumRating':
          return { ...current, minimumRating: undefined };
        case 'providerKey':
          return {
            ...current,
            providerKey: undefined,
            availability: 'any',
          };
        case 'availability':
          return { ...current, availability: 'any' };
        default:
          return current;
      }
    });
  };

  const renderResults = () => {
    if (!hasValidQuery) {
      return (
        <AppStateView
          description="Digite ao menos dois caracteres para buscar filmes e séries por título ou profissional."
          title="O que você quer assistir?"
          variant="empty"
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

    if (isInitialLoading) {
      return (
        <View
          style={[
            styles.loadingPlaceholder,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        />
      );
    }

    if (status === 'success' && items.length === 0) {
      return (
        <AppStateView
          description={
            activeFilterCount > 0
              ? `Nenhum resultado para “${query.trim()}” com os filtros selecionados.`
              : `Nenhum filme ou série foi encontrado para “${query.trim()}”.`
          }
          title="Nenhum resultado"
          variant="empty"
        />
      );
    }

    return (
      <View style={styles.resultsSection}>
        {isRefreshing ? (
          <AppUpdatingIndicator
            message={
              filters.providerKey
                ? 'Verificando disponibilidade no Brasil...'
                : 'Atualizando resultados...'
            }
          />
        ) : null}

        {matchedPersonName ? (
          <View
            style={[
              styles.professionalNotice,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <AppText secondary style={styles.professionalNoticeText}>
              Exibindo filmes e séries relacionados a {matchedPersonName}. O
              filtro de plataforma não é aplicado em buscas por profissional.
            </AppText>
          </View>
        ) : null}

        <AppText secondary style={styles.resultCount}>
          {items.length} {items.length === 1 ? 'resultado' : 'resultados'}
        </AppText>

        <View style={styles.results}>
          {items.map((item) => (
            <CatalogSearchResultCard
              item={item}
              key={`${item.mediaType}:${item.id}`}
            />
          ))}
        </View>
      </View>
    );
  };

  const loadingMessage = filters.providerKey
    ? 'Verificando disponibilidade no Brasil. Aguarde...'
    : 'Buscando filmes e séries. Aguarde...';

  return (
    <>
      <AppScreen bottomSpacing={96} contentStyle={styles.container} scroll>
        <AppHeader compact />
        <AppPageTitle
          description="Pesquise por parte do título ou pelo nome de profissionais do cinema e da televisão."
          title="Buscar"
        />
        <View style={styles.searchControls}>
          <AppSearchInput onChangeText={setQuery} value={query} />
          <SearchFiltersButton
            activeCount={activeFilterCount}
            onPress={() => setFiltersVisible(true)}
          />
          <ActiveSearchFilters
            filters={filters}
            onRemove={removeFilter}
            providers={providers}
          />
        </View>

        <View style={styles.resultsRegion}>
          {renderResults()}
          {isInitialLoading ? (
            <AppLoadingOverlay message={loadingMessage} />
          ) : null}
        </View>
      </AppScreen>

      <SearchFiltersModal
        onApply={applyFilters}
        onClose={() => setFiltersVisible(false)}
        platformDisabled={Boolean(matchedPersonName)}
        providers={providers}
        providersStatus={providersStatus}
        value={filters}
        visible={filtersVisible}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  searchControls: {
    gap: 12,
  },
  resultsRegion: {
    position: 'relative',
    minHeight: 260,
  },
  loadingPlaceholder: {
    minHeight: 260,
    borderWidth: 1,
    borderRadius: 20,
  },
  resultsSection: {
    gap: 12,
  },
  professionalNotice: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  professionalNoticeText: {
    fontSize: 12,
    lineHeight: 18,
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  results: {
    gap: 12,
  },
});
