import { StyleSheet, View } from 'react-native';

import type { SeasonSummary } from '@/domain/models/TitleDetails';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppText } from './AppText';
import { CatalogPoster } from './CatalogPoster';

type SeasonCardProps = {
  season: SeasonSummary;
};

export function SeasonCard({ season }: SeasonCardProps) {
  const { colors } = useAppTheme();
  const year = season.airDate?.slice(0, 4);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.poster}>
        <CatalogPoster
          height={108}
          posterPath={season.posterPath}
          width={72}
        />
      </View>
      <View style={styles.content}>
        <AppText numberOfLines={2} style={styles.title}>
          {season.name}
        </AppText>
        <AppText secondary style={styles.metadata}>
          {season.episodeCount} {season.episodeCount === 1 ? 'episódio' : 'episódios'}
          {year ? ` · ${year}` : ''}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 230,
    minHeight: 108,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 16,
  },
  poster: {
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 7,
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
  },
  metadata: {
    fontSize: 11,
    lineHeight: 15,
  },
});
