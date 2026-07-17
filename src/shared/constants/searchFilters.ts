import type {
  SearchAvailability,
  SearchGenreKey,
  SearchMediaType,
} from '@/domain/models/SearchFilters';
import type { MediaType } from '@/domain/models/CatalogItemSummary';

export type SearchGenreOption = {
  key: SearchGenreKey;
  label: string;
  movieGenreIds: number[];
  tvGenreIds: number[];
};

export const SEARCH_MEDIA_TYPE_OPTIONS: Array<{
  value: SearchMediaType;
  label: string;
}> = [
  { value: 'all', label: 'Todos' },
  { value: 'movie', label: 'Filmes' },
  { value: 'tv', label: 'Séries' },
];

export const SEARCH_GENRE_OPTIONS: SearchGenreOption[] = [
  {
    key: 'action-adventure',
    label: 'Ação e aventura',
    movieGenreIds: [28, 12],
    tvGenreIds: [10759],
  },
  {
    key: 'animation',
    label: 'Animação',
    movieGenreIds: [16],
    tvGenreIds: [16],
  },
  {
    key: 'comedy',
    label: 'Comédia',
    movieGenreIds: [35],
    tvGenreIds: [35],
  },
  {
    key: 'crime',
    label: 'Crime',
    movieGenreIds: [80],
    tvGenreIds: [80],
  },
  {
    key: 'documentary',
    label: 'Documentário',
    movieGenreIds: [99],
    tvGenreIds: [99],
  },
  {
    key: 'drama',
    label: 'Drama',
    movieGenreIds: [18],
    tvGenreIds: [18],
  },
  {
    key: 'family',
    label: 'Família',
    movieGenreIds: [10751],
    tvGenreIds: [10751],
  },
  {
    key: 'fantasy-scifi',
    label: 'Fantasia e ficção científica',
    movieGenreIds: [14, 878],
    tvGenreIds: [10765],
  },
  {
    key: 'mystery',
    label: 'Mistério',
    movieGenreIds: [9648],
    tvGenreIds: [9648],
  },
  {
    key: 'horror',
    label: 'Terror',
    movieGenreIds: [27],
    tvGenreIds: [],
  },
  {
    key: 'romance',
    label: 'Romance',
    movieGenreIds: [10749],
    tvGenreIds: [],
  },
  {
    key: 'thriller',
    label: 'Suspense',
    movieGenreIds: [53],
    tvGenreIds: [],
  },
];

export const SEARCH_RATING_OPTIONS: Array<{
  value?: number;
  label: string;
}> = [
  { label: 'Qualquer' },
  { value: 6, label: '6 ou mais' },
  { value: 7, label: '7 ou mais' },
  { value: 8, label: '8 ou mais' },
];

export const SEARCH_AVAILABILITY_OPTIONS: Array<{
  value: SearchAvailability;
  label: string;
}> = [
  { value: 'any', label: 'Qualquer' },
  { value: 'flatrate', label: 'Assinatura' },
  { value: 'rent', label: 'Aluguel' },
  { value: 'buy', label: 'Compra' },
];

export function getSearchGenreLabel(key?: SearchGenreKey): string | undefined {
  return SEARCH_GENRE_OPTIONS.find((option) => option.key === key)?.label;
}

export function getGenreIdsForMediaType(
  key: SearchGenreKey,
  mediaType: MediaType,
): number[] {
  const option = SEARCH_GENRE_OPTIONS.find((item) => item.key === key);

  if (!option) {
    return [];
  }

  return mediaType === 'movie' ? option.movieGenreIds : option.tvGenreIds;
}

export function getAvailabilityLabel(
  availability: SearchAvailability,
): string | undefined {
  if (availability === 'any') {
    return undefined;
  }

  return SEARCH_AVAILABILITY_OPTIONS.find(
    (option) => option.value === availability,
  )?.label;
}
