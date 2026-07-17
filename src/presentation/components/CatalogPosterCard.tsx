import { StyleSheet, View } from 'react-native';

import type { CatalogItemSummary } from '@/domain/models/CatalogItemSummary';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppText } from './AppText';
import { CatalogPoster } from './CatalogPoster';

const POSTER_WIDTH = 132;
const POSTER_HEIGHT = 198;

type CatalogPosterCardProps = {
  item: CatalogItemSummary;
};

export function CatalogPosterCard({ item }: CatalogPosterCardProps) {
  const { colors } = useAppTheme();
  const metadata = [
    item.mediaType === 'movie' ? 'Filme' : 'Série',
    item.releaseYear,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.posterContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <CatalogPoster
          height={POSTER_HEIGHT}
          posterPath={item.posterPath}
          width={POSTER_WIDTH}
        />
      </View>
      <AppText numberOfLines={2} style={styles.title}>
        {item.title}
      </AppText>
      <View style={styles.metadataRow}>
        <AppText numberOfLines={1} secondary style={styles.metadata}>
          {metadata}
        </AppText>
        {typeof item.voteAverage === 'number' && item.voteAverage > 0 ? (
          <AppText style={[styles.rating, { color: colors.primary }]}>★ {item.voteAverage.toFixed(1)}</AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: POSTER_WIDTH,
    gap: 6,
  },
  posterContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 14,
  },
  title: {
    minHeight: 38,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  metadata: {
    flex: 1,
    fontSize: 11,
  },
  rating: {
    fontSize: 11,
    fontWeight: '800',
  },
});
