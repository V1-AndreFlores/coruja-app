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

export type TmdbGenreDto = {
  id: number;
  name: string;
};

export type TmdbCastDto = {
  id: number;
  name: string;
  character?: string | null;
  profile_path?: string | null;
  order?: number;
  popularity?: number;
  roles?: Array<{
    character?: string | null;
    episode_count?: number;
  }>;
  total_episode_count?: number;
};

export type TmdbCrewDto = {
  id: number;
  name: string;
  job?: string;
  department?: string;
  known_for_department?: string;
  profile_path?: string | null;
  jobs?: Array<{
    job?: string;
    episode_count?: number;
  }>;
};

export type TmdbCreditsDto = {
  cast: TmdbCastDto[];
  crew: TmdbCrewDto[];
};

export type TmdbVideoDto = {
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
  published_at?: string;
};

export type TmdbVideosDto = {
  results: TmdbVideoDto[];
};

export type TmdbMovieReleaseDatesDto = {
  results: Array<{
    iso_3166_1: string;
    release_dates: Array<{
      certification?: string;
      type?: number;
      release_date?: string;
    }>;
  }>;
};

export type TmdbTvContentRatingsDto = {
  results: Array<{
    iso_3166_1: string;
    rating?: string;
  }>;
};

export type TmdbWatchProviderDto = {
  provider_id: number;
  provider_name: string;
  logo_path?: string | null;
  display_priority?: number;
};

export type TmdbWatchProvidersDto = {
  id: number;
  results: Record<
    string,
    {
      link?: string;
      flatrate?: TmdbWatchProviderDto[];
      rent?: TmdbWatchProviderDto[];
      buy?: TmdbWatchProviderDto[];
    }
  >;
};

export type TmdbSeasonDto = {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date?: string | null;
  poster_path?: string | null;
};

export type TmdbMovieDetailsDto = TmdbCatalogItemDto & {
  title: string;
  original_title?: string;
  release_date?: string;
  runtime?: number | null;
  genres?: TmdbGenreDto[];
  tagline?: string | null;
  status?: string | null;
  credits?: TmdbCreditsDto;
  videos?: TmdbVideosDto;
  release_dates?: TmdbMovieReleaseDatesDto;
};

export type TmdbTvDetailsDto = TmdbCatalogItemDto & {
  name: string;
  original_name?: string;
  first_air_date?: string;
  episode_run_time?: number[];
  genres?: TmdbGenreDto[];
  tagline?: string | null;
  status?: string | null;
  created_by?: Array<{
    id: number;
    name: string;
    profile_path?: string | null;
  }>;
  videos?: TmdbVideosDto;
  content_ratings?: TmdbTvContentRatingsDto;
  number_of_seasons?: number | null;
  number_of_episodes?: number | null;
  seasons?: TmdbSeasonDto[];
};
