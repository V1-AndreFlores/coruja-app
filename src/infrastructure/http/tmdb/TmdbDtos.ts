export type TmdbMediaType = 'movie' | 'tv' | 'person';

export type TmdbCatalogItemDto = {
  id: number;
  media_type?: TmdbMediaType;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string | null;
  vote_average?: number | null;
  adult?: boolean;
};

export type TmdbPagedResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};
