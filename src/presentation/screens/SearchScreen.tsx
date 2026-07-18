import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  DEFAULT_SEARCH_FILTERS,
  type SearchFilters,
} from '@/domain/models/SearchFilters';
import {
  ActiveSearchFilters,
  type ActiveFilterKey,
} from '@/presentation/components/ActiveSearchFilters';
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
import { useStreamingPreferences } from '@/presentation/preferences/StreamingPreferencesProvider';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

let sessionFilters: SearchFilters = DEFAULT_SEARCH_FILTERS;
let sessionUsesMyStreamings = true;

function countActiveFilters(filters: SearchFilters): number {
  return [
    filters.mediaType !== 'all',
    Boolean(filters.genre),
    Boolean(filters.yearFrom || filters.yearTo),
    Boolean(filters.minimumRating),
    filters.providerKeys.length > 0,
    filters.availability !== 'any',
  ].filter(Boolean).length;
}

export function SearchScreen() {
  const { colors } = useAppTheme();
  const {
    providerKeys: myStreamingProviderKeys,
    isHydrated: streamingPreferencesHydrated,
  } = useStreamingPreferences();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(() => sessionFilters);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const {
    items,
    matchedPersonName,
    status,
    errorMessage,
    hasSearchCriteria,
    isExploration,
    isInitialLoading,
    isRefreshing,
    retry,
  } = useCatalogSearch(query, filters);
  const { options: providers, status: providersStatus } =
    useWatchProviderOptions(
      filtersVisible ||
        filters.providerKeys.length > 0 ||
        myStreamingProviderKeys.length > 0,
    );

  const activeFilterCount = useMemo(
    () => countActiveFilters(filters),
    [filters],
  );

  useEffect(() => {
    if (!streamingPreferencesHydrated || !sessionUsesMyStreamings) {
      return;
    }

    const nextFilters: SearchFilters = {
      ...filters,
      providerKeys: myStreamingProviderKeys,
      availability:
        myStreamingProviderKeys.length > 0 ? 'flatrate' : 'any',
    };

    sessionFilters = nextFilters;
    setFilters(nextFilters);
    // A sincronização deve reagir somente às preferências persistidas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myStreamingProviderKeys, streamingPreferencesHydrated]);

  const updateFilters = (nextFilters: SearchFilters) => {
    sessionUsesMyStreamings = false;
    sessionFilters = nextFilters;
    setFilters(nextFilters);
  };

  const applyFilters = (nextFilters: SearchFilters) => {
    updateFilters(nextFilters);
    setFiltersVisible(false);
  };

  const removeFilter = (key: ActiveFilterKey, value?: string) => {
    const nextFilters = (() => {
      switch (key) {
        case 'mediaType':
          return { ...filters, mediaType: 'all' as const };
        case 'genre':
          return { ...filters, genre: undefined };
        case 'period':
          return { ...filters, yearFrom: undefined, yearTo: undefined };
        case 'minimumRating':
          return { ...filters, minimumRating: undefined };
        case 'providerKey': {
          const providerKeys = value
            ? filters.providerKeys.filter((providerKey) => providerKey !== value)
            : [];
          return {
            ...filters,
            providerKeys,
            availability:
              providerKeys.length === 0 ? ('any' as const) : filters.availability,
          };
        }
        case 'availability':
          return { ...filters, availability: 'any' as const };
        default:
          return filters;
      }
    })();

    updateFilters(nextFilters);
  };

  const renderResults = () => {
    if (!hasSearchCriteria) {
      return (
        <AppStateView
          description={
            query.trim().length === 1
              ? 'Digite ao menos dois caracteres ou limpe o campo para explorar somente pelos filtros.'
              : 'Digite um título ou profissional, ou use os filtros para explorar por gênero, período e streamings.'
          }
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
          title={isExploration ? 'Catálogo indisponível' : 'Falha na pesquisa'}
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
            query.trim()
              ? activeFilterCount > 0
                ? `Nenhum resultado para “${query.trim()}” com os filtros selecionados.`
                : `Nenhum filme ou série foi encontrado para “${query.trim()}”.`
              : 'Nenhum filme ou série corresponde aos filtros selecionados.'
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
              filters.providerKeys.length > 0
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
              filtro de streaming não é aplicado em buscas por profissional.
            </AppText>
          </View>
        ) : null}

        <AppText secondary style={styles.resultCount}>
          {items.length} {items.length === 1 ? 'resultado' : 'resultados'}
          {isExploration ? ' encontrados pelos filtros' : ''}
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

  const loadingMessage = filters.providerKeys.length > 0
    ? 'Verificando disponibilidade no Brasil. Aguarde...'
    : isExploration
      ? 'Explorando o catálogo. Aguarde...'
      : 'Buscando filmes e séries. Aguarde...';

  return (
    <>
      <AppScreen bottomSpacing={96} contentStyle={styles.container} scroll>
        <AppHeader compact />
        <AppPageTitle
          description="Pesquise por título ou profissional, ou use os filtros para explorar o catálogo."
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
        myStreamingProviderKeys={myStreamingProviderKeys}
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
