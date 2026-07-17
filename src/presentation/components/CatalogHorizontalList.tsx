import { FlatList, StyleSheet } from 'react-native';

import type { CatalogItemSummary } from '@/domain/models/CatalogItemSummary';

import { CatalogPosterCard } from './CatalogPosterCard';

type CatalogHorizontalListProps = {
  items: CatalogItemSummary[];
};

export function CatalogHorizontalList({ items }: CatalogHorizontalListProps) {
  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={items}
      horizontal
      keyExtractor={(item) => `${item.mediaType}:${item.id}`}
      renderItem={({ item }) => <CatalogPosterCard item={item} />}
      showsHorizontalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingRight: 20,
  },
});
