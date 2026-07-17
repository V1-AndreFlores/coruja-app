import { Pressable, StyleSheet, View } from 'react-native';

import type { HistoryEntry } from '@/domain/models/CatalogItemSummary';
import { openTitleDetails } from '@/presentation/navigation/titleRoutes';
import { useAppTheme } from '@/presentation/theme/AppThemeProvider';

import { AppIcon } from './AppIcon';
import { AppText } from './AppText';
import { CatalogPoster } from './CatalogPoster';

type HistoryListItemProps = {
  item: HistoryEntry;
  isRemoving?: boolean;
  onRemovePress: (item: HistoryEntry) => void;
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatViewedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data da visualização indisponível';
  }

  return `Visto em ${pad(date.getDate())}/${pad(
    date.getMonth() + 1,
  )}/${date.getFullYear()} às ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}`;
}

export function HistoryListItem({
  item,
  isRemoving = false,
  onRemovePress,
}: HistoryListItemProps) {
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
            styles.poster,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <CatalogPoster
            height={126}
            posterPath={item.posterPath}
            width={84}
          />
        </View>

        <View style={styles.details}>
          <AppText numberOfLines={2} style={styles.title}>
            {item.title}
          </AppText>
          <AppText secondary style={styles.metadata}>
            {metadata}
          </AppText>
          <View style={styles.viewedAtRow}>
            <AppIcon color={colors.textSecondary} name="clock" size={15} />
            <AppText secondary style={styles.viewedAt}>
              {formatViewedAt(item.viewedAt)}
            </AppText>
          </View>
          {item.overview ? (
            <AppText numberOfLines={2} secondary style={styles.overview}>
              {item.overview}
            </AppText>
          ) : null}
        </View>
      </Pressable>

      <Pressable
        accessibilityLabel={`Remover ${item.title} do histórico`}
        accessibilityRole="button"
        disabled={isRemoving}
        hitSlop={8}
        onPress={() => onRemovePress(item)}
        style={({ pressed }) => [
          styles.removeButton,
          {
            backgroundColor: colors.card,
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
    overflow: 'hidden',
    borderWidth: 1,
    borderRadius: 18,
  },
  content: {
    minHeight: 126,
    flexDirection: 'row',
    gap: 14,
    paddingRight: 54,
  },
  poster: {
    width: 84,
    height: 126,
    overflow: 'hidden',
    flexShrink: 0,
    borderRightWidth: 1,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  metadata: {
    fontSize: 12,
    fontWeight: '600',
  },
  viewedAtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  viewedAt: {
    fontSize: 12,
    fontWeight: '700',
  },
  overview: {
    fontSize: 12,
    lineHeight: 17,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 18,
  },
});
