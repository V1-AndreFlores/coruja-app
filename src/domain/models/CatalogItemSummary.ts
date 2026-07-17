export type MediaType = 'movie' | 'tv';

export type CatalogItemSummary = {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseYear?: number | null;
  overview?: string | null;
  voteAverage?: number | null;
};

export type HistoryEntry = CatalogItemSummary & {
  viewedAt: string;
};
