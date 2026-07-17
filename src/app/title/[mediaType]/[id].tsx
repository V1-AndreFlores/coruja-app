import { useLocalSearchParams } from 'expo-router';

import type { MediaType } from '@/domain/models/CatalogItemSummary';
import { NotFoundScreen } from '@/presentation/screens/NotFoundScreen';
import { TitleDetailsScreen } from '@/presentation/screens/TitleDetailsScreen';

export default function TitleDetailsRoute() {
  const params = useLocalSearchParams<{
    mediaType?: string | string[];
    id?: string | string[];
  }>();
  const mediaTypeValue = Array.isArray(params.mediaType)
    ? params.mediaType[0]
    : params.mediaType;
  const idValue = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(idValue);

  if (
    (mediaTypeValue !== 'movie' && mediaTypeValue !== 'tv') ||
    !Number.isInteger(id) ||
    id <= 0
  ) {
    return <NotFoundScreen />;
  }

  return (
    <TitleDetailsScreen mediaType={mediaTypeValue as MediaType} id={id} />
  );
}
