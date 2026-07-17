import { StyleSheet, View } from 'react-native';

import type { CatalogItemSummary } from '@/domain/models/CatalogItemSummary';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppText } from './AppText';
import { CatalogPoster } from './CatalogPoster';

const POSTER_WIDTH = 88;
const POSTER_HEIGHT = 132;

type CatalogSearchResultCardProps = {
  item: CatalogItemSummary;
};

export function CatalogSearchResultCard({ item }: CatalogSearchResultCardProps) {
  const { colors } = useAppTheme();
  const metadata = [
    item.mediaType === 'movie' ? 'Filme' : 'Série',
    item.releaseYear,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.posterContainer}>
        <CatalogPoster
          height={POSTER_HEIGHT}
          posterPath={item.posterPath}
          width={POSTER_WIDTH}
        />
      </View>
      <View style={styles.content}>
        <AppText numberOfLines={2} style={styles.title}>
          {item.title}
        </AppText>
        <AppText secondary style={styles.metadata}>
          {metadata}
        </AppText>
        {typeof item.voteAverage === 'number' && item.voteAverage > 0 ? (
          <AppText style={[styles.rating, { color: colors.primary }]}>★ {item.voteAverage.toFixed(1)}</AppText>
        ) : null}
        <AppText numberOfLines={3} secondary style={styles.overview}>
          {item.overview || 'Sinopse ainda não disponível em português.'}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: POSTER_HEIGHT,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 16,
  },
  posterContainer: {
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    gap: 5,
    padding: 13,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  metadata: {
    fontSize: 12,
  },
  rating: {
    fontSize: 12,
    fontWeight: '800',
  },
  overview: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 18,
  },
});
