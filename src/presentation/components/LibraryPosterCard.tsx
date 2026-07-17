import { Pressable, StyleSheet, View } from 'react-native';

import type { CatalogItemSummary } from '@/domain/models/CatalogItemSummary';
import { openTitleDetails } from '@/presentation/navigation/titleRoutes';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { CatalogPoster } from './CatalogPoster';

type LibraryPosterCardProps = {
  item: CatalogItemSummary;
  width: number;
  isRemoving?: boolean;
  onRemovePress: (item: CatalogItemSummary) => void;
};

export function LibraryPosterCard({
  item,
  width,
  isRemoving = false,
  onRemovePress,
}: LibraryPosterCardProps) {
  const { colors } = useAppTheme();
  const posterHeight = Math.round(width * 1.5);
  const metadata = [
    item.mediaType === 'movie' ? 'Filme' : 'Série',
    item.releaseYear,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={[styles.container, { width }]}>
      <Pressable
        accessibilityLabel={`Abrir detalhes de ${item.title}`}
        accessibilityRole="button"
        onPress={() => openTitleDetails(item)}
        style={({ pressed }) => [
          styles.content,
          { opacity: pressed ? 0.72 : 1 },
        ]}
      >
        <View
          style={[
            styles.posterContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <CatalogPoster
            height={posterHeight}
            posterPath={item.posterPath}
            width={width}
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
            <AppText style={[styles.rating, { color: colors.primary }]}>
              ★ {item.voteAverage.toFixed(1)}
            </AppText>
          ) : null}
        </View>
      </Pressable>
      <Pressable
        accessibilityLabel={`Remover ${item.title}`}
        accessibilityRole="button"
        disabled={isRemoving}
        hitSlop={8}
        onPress={() => onRemovePress(item)}
        style={({ pressed }) => [
          styles.removeButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed || isRemoving ? 0.62 : 1,
          },
        ]}
      >
        <AppIcon color={colors.primary} name="remove" size={19} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  content: {
    gap: 6,
  },
  posterContainer: {
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 14,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    zIndex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 18,
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
