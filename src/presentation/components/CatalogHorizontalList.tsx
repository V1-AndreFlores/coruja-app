import { ScrollView, StyleSheet, View } from 'react-native';

import type { CatalogItemSummary } from '@/domain/models/CatalogItemSummary';

import { CatalogPosterCard } from './CatalogPosterCard';

type CatalogHorizontalListProps = {
  items: CatalogItemSummary[];
};

export function CatalogHorizontalList({ items }: CatalogHorizontalListProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      directionalLockEnabled={false}
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
    >
      {items.map((item) => (
        <View key={`${item.mediaType}:${item.id}`}>
          <CatalogPosterCard item={item} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  content: {
    gap: 12,
    paddingRight: 20,
  },
});
