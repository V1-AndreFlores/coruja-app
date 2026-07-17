import type {
  CatalogItemSummary,
  MediaType,
} from '@/domain/models/CatalogItemSummary';

import type { TmdbCatalogItemDto } from './TmdbDtos';

function getYear(value?: string): number | null {
  if (!value || value.length < 4) {
    return null;
  }

  const year = Number(value.slice(0, 4));
  return Number.isInteger(year) ? year : null;
}

export function mapTmdbCatalogItem(
  source: TmdbCatalogItemDto,
  fallbackMediaType?: MediaType,
): CatalogItemSummary | null {
  const mediaType = source.media_type ?? fallbackMediaType;

  if (mediaType !== 'movie' && mediaType !== 'tv') {
    return null;
  }

  const title = mediaType === 'movie' ? source.title : source.name;

  if (!title?.trim()) {
    return null;
  }

  return {
    id: source.id,
    mediaType,
    title: title.trim(),
    posterPath: source.poster_path ?? null,
    backdropPath: source.backdrop_path ?? null,
    releaseYear: getYear(
      mediaType === 'movie' ? source.release_date : source.first_air_date,
    ),
    overview: source.overview?.trim() || null,
    voteAverage:
      typeof source.vote_average === 'number' ? source.vote_average : null,
  };
}
