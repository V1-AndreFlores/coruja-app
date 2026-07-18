import type { CatalogItemSummary, MediaType } from './CatalogItemSummary';

export type SearchMediaType = 'all' | MediaType;

export type SearchGenreKey =
  | 'action-adventure'
  | 'animation'
  | 'comedy'
  | 'crime'
  | 'documentary'
  | 'drama'
  | 'family'
  | 'fantasy-scifi'
  | 'mystery'
  | 'horror'
  | 'romance'
  | 'thriller';

export type SearchAvailability = 'any' | 'flatrate' | 'rent' | 'buy';

export type SearchFilters = {
  mediaType: SearchMediaType;
  genre?: SearchGenreKey;
  yearFrom?: number;
  yearTo?: number;
  minimumRating?: number;
  providerKeys: string[];
  availability: SearchAvailability;
};

export type WatchProviderOption = {
  key: string;
  name: string;
  logoPath?: string | null;
  displayPriority: number;
  movieProviderId?: number;
  tvProviderId?: number;
};

export type CatalogSearchResponse = {
  items: CatalogItemSummary[];
  matchedPersonName?: string;
};

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  mediaType: 'all',
  providerKeys: [],
  availability: 'any',
};
