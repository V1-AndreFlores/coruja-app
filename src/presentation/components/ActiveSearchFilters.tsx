import { Pressable, StyleSheet, View } from 'react-native';

import type {
  SearchFilters,
  WatchProviderOption,
} from '@/domain/models/SearchFilters';
import {
  getAvailabilityLabel,
  getSearchGenreLabel,
} from '@/shared/constants/searchFilters';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppText } from './AppText';

export type ActiveFilterKey =
  | 'mediaType'
  | 'genre'
  | 'period'
  | 'minimumRating'
  | 'providerKey'
  | 'availability';

type ActiveSearchFiltersProps = {
  filters: SearchFilters;
  providers: WatchProviderOption[];
  onRemove: (key: ActiveFilterKey, value?: string) => void;
};

type ActiveFilter = {
  key: ActiveFilterKey;
  value?: string;
  label: string;
};

export function ActiveSearchFilters({
  filters,
  providers,
  onRemove,
}: ActiveSearchFiltersProps) {
  const { colors } = useAppTheme();
  const items: ActiveFilter[] = [];

  if (filters.mediaType !== 'all') {
    items.push({
      key: 'mediaType',
      label: filters.mediaType === 'movie' ? 'Filmes' : 'Séries',
    });
  }

  const genreLabel = getSearchGenreLabel(filters.genre);
  if (genreLabel) {
    items.push({ key: 'genre', label: genreLabel });
  }

  if (filters.yearFrom || filters.yearTo) {
    const period =
      filters.yearFrom && filters.yearTo
        ? `${filters.yearFrom}–${filters.yearTo}`
        : filters.yearFrom
          ? `Desde ${filters.yearFrom}`
          : `Até ${filters.yearTo}`;
    items.push({ key: 'period', label: period });
  }

  if (filters.minimumRating) {
    items.push({
      key: 'minimumRating',
      label: `Nota ${filters.minimumRating}+`,
    });
  }

  filters.providerKeys.forEach((providerKey) => {
    const provider = providers.find((option) => option.key === providerKey);
    items.push({
      key: 'providerKey',
      value: providerKey,
      label: provider?.name ?? 'Streaming',
    });
  });

  const availabilityLabel = getAvailabilityLabel(filters.availability);
  if (availabilityLabel) {
    items.push({ key: 'availability', label: availabilityLabel });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <View accessibilityLabel="Filtros ativos" style={styles.container}>
      {items.map((item) => (
        <Pressable
          accessibilityLabel={`Remover filtro ${item.label}`}
          accessibilityRole="button"
          key={`${item.key}:${item.value ?? item.label}`}
          onPress={() => onRemove(item.key, item.value)}
          style={({ pressed }) => [
            styles.chip,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <AppText style={styles.label}>{item.label}</AppText>
          <AppText secondary style={styles.removeMark}>
            ×
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 17,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  removeMark: {
    fontSize: 17,
    lineHeight: 18,
  },
});
