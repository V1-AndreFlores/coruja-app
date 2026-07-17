export type MediaType = 'movie' | 'tv';

export type CatalogItemSummary = {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath?: string | null;
  releaseYear?: number | null;
  overview?: string | null;
};

export type HistoryEntry = CatalogItemSummary & {
  viewedAt: string;
};
