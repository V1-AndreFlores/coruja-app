import type { CatalogItemSummary, MediaType } from './CatalogItemSummary';

export type TitleGenre = {
  id: number;
  name: string;
};

export type CastMember = {
  id: number;
  name: string;
  character?: string | null;
  profilePath?: string | null;
};

export type KeyPerson = {
  id: number;
  name: string;
  role: string;
  profilePath?: string | null;
};

export type TitleTrailer = {
  key: string;
  name: string;
  site: 'YouTube';
};

export type WatchProvider = {
  id: number;
  name: string;
  logoPath?: string | null;
};

export type WatchProviders = {
  link?: string | null;
  subscription: WatchProvider[];
  rent: WatchProvider[];
  buy: WatchProvider[];
};

export type SeasonSummary = {
  id: number;
  name: string;
  seasonNumber: number;
  episodeCount: number;
  airDate?: string | null;
  posterPath?: string | null;
};

export type TitleDetails = CatalogItemSummary & {
  mediaType: MediaType;
  originalTitle?: string | null;
  releaseDate?: string | null;
  runtimeMinutes?: number | null;
  episodeRuntimeMinutes?: number | null;
  genres: TitleGenre[];
  certification?: string | null;
  tagline?: string | null;
  status?: string | null;
  keyPeople: KeyPerson[];
  cast: CastMember[];
  trailer?: TitleTrailer | null;
  watchProviders: WatchProviders;
  seasons: SeasonSummary[];
  numberOfSeasons?: number | null;
  numberOfEpisodes?: number | null;
};
