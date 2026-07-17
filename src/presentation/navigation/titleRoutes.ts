import { router } from 'expo-router';

import type { CatalogItemSummary } from '@/domain/models/CatalogItemSummary';

export function openTitleDetails(item: CatalogItemSummary): void {
  router.push({
    pathname: '/title/[mediaType]/[id]',
    params: {
      mediaType: item.mediaType,
      id: String(item.id),
    },
  });
}
