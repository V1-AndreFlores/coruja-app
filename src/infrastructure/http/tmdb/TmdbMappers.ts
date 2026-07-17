import type {
  CatalogItemSummary,
  MediaType,
} from '@/domain/models/CatalogItemSummary';
import type {
  CastMember,
  KeyPerson,
  TitleDetails,
  TitleTrailer,
  WatchProvider,
  WatchProviders,
} from '@/domain/models/TitleDetails';
import { TMDB } from '@/shared/constants/tmdb';

import type {
  TmdbCatalogItemDto,
  TmdbCastDto,
  TmdbCreditsDto,
  TmdbCrewDto,
  TmdbMovieDetailsDto,
  TmdbMovieReleaseDatesDto,
  TmdbTvContentRatingsDto,
  TmdbTvDetailsDto,
  TmdbVideoDto,
  TmdbVideosDto,
  TmdbWatchProviderDto,
  TmdbWatchProvidersDto,
} from './TmdbDtos';

function getYear(value?: string): number | null {
  if (!value || value.length < 4) {
    return null;
  }

  const year = Number(value.slice(0, 4));
  return Number.isInteger(year) ? year : null;
}

function uniqueById<T extends { id: number }>(items: T[]): T[] {
  const ids = new Set<number>();
  return items.filter((item) => {
    if (ids.has(item.id)) {
      return false;
    }

    ids.add(item.id);
    return true;
  });
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

function mapCast(source: TmdbCastDto[]): CastMember[] {
  return uniqueById(
    [...source]
      .sort((left, right) => {
        const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;
        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        const leftEpisodes = left.total_episode_count ?? 0;
        const rightEpisodes = right.total_episode_count ?? 0;
        if (leftEpisodes !== rightEpisodes) {
          return rightEpisodes - leftEpisodes;
        }

        return (right.popularity ?? 0) - (left.popularity ?? 0);
      })
      .map((person) => ({
        id: person.id,
        name: person.name,
        character:
          person.character ??
          person.roles?.find((role) => role.character)?.character ??
          null,
        profilePath: person.profile_path ?? null,
      })),
  ).slice(0, 10);
}

function mapCrewPerson(person: TmdbCrewDto, role: string): KeyPerson {
  return {
    id: person.id,
    name: person.name,
    role,
    profilePath: person.profile_path ?? null,
  };
}

function mapMovieKeyPeople(credits?: TmdbCreditsDto): KeyPerson[] {
  if (!credits) {
    return [];
  }

  const directors = credits.crew
    .filter((person) => person.job === 'Director')
    .map((person) => mapCrewPerson(person, 'Direção'));

  const writers = credits.crew
    .filter((person) =>
      ['Screenplay', 'Writer', 'Story'].includes(person.job ?? ''),
    )
    .map((person) => mapCrewPerson(person, 'Roteiro'));

  return uniqueById([...directors, ...writers]).slice(0, 6);
}

function mapTvKeyPeople(
  source: TmdbTvDetailsDto,
  aggregateCredits?: TmdbCreditsDto,
): KeyPerson[] {
  const creators: KeyPerson[] = (source.created_by ?? []).map((person) => ({
    id: person.id,
    name: person.name,
    role: 'Criação',
    profilePath: person.profile_path ?? null,
  }));

  const executiveProducers = (aggregateCredits?.crew ?? [])
    .filter((person) =>
      person.jobs?.some((job) => job.job === 'Executive Producer'),
    )
    .map((person) => mapCrewPerson(person, 'Produção executiva'));

  return uniqueById([...creators, ...executiveProducers]).slice(0, 6);
}

function mapTrailer(videos?: TmdbVideosDto): TitleTrailer | null {
  const candidates = (videos?.results ?? []).filter(
    (video): video is TmdbVideoDto & { site: 'YouTube' } =>
      video.site === 'YouTube' && ['Trailer', 'Teaser'].includes(video.type),
  );

  const trailer = [...candidates].sort((left, right) => {
    const typeScore = (video: TmdbVideoDto) =>
      video.type === 'Trailer' ? 2 : 1;
    const officialScore = (video: TmdbVideoDto) => (video.official ? 1 : 0);
    const scoreDifference =
      typeScore(right) + officialScore(right) -
      (typeScore(left) + officialScore(left));

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return (right.published_at ?? '').localeCompare(left.published_at ?? '');
  })[0];

  return trailer
    ? {
        key: trailer.key,
        name: trailer.name,
        site: 'YouTube',
      }
    : null;
}

function mapMovieCertification(
  releaseDates?: TmdbMovieReleaseDatesDto,
): string | null {
  const brazil = releaseDates?.results.find(
    (result) => result.iso_3166_1 === TMDB.region,
  );

  const preferred = [...(brazil?.release_dates ?? [])]
    .filter((release) => release.certification?.trim())
    .sort((left, right) => {
      const order = [3, 2, 4, 6, 1, 5];
      const priority = (type?: number) => {
        const index = order.indexOf(type ?? 0);
        return index === -1 ? order.length : index;
      };
      return priority(left.type) - priority(right.type);
    })[0];

  return preferred?.certification?.trim() || null;
}

function mapTvCertification(
  ratings?: TmdbTvContentRatingsDto,
): string | null {
  return (
    ratings?.results.find((result) => result.iso_3166_1 === TMDB.region)
      ?.rating?.trim() || null
  );
}

function mapProvider(provider: TmdbWatchProviderDto): WatchProvider {
  return {
    id: provider.provider_id,
    name: provider.provider_name,
    logoPath: provider.logo_path ?? null,
  };
}

export function mapWatchProviders(
  source: TmdbWatchProvidersDto,
): WatchProviders {
  const brazil = source.results[TMDB.region];

  return {
    link: brazil?.link ?? null,
    subscription: (brazil?.flatrate ?? []).map(mapProvider),
    rent: (brazil?.rent ?? []).map(mapProvider),
    buy: (brazil?.buy ?? []).map(mapProvider),
  };
}

export function mapMovieDetails(
  source: TmdbMovieDetailsDto,
  providers: TmdbWatchProvidersDto,
): TitleDetails {
  return {
    id: source.id,
    mediaType: 'movie',
    title: source.title,
    originalTitle: source.original_title?.trim() || null,
    posterPath: source.poster_path ?? null,
    backdropPath: source.backdrop_path ?? null,
    releaseDate: source.release_date ?? null,
    releaseYear: getYear(source.release_date),
    overview: source.overview?.trim() || null,
    voteAverage:
      typeof source.vote_average === 'number' ? source.vote_average : null,
    runtimeMinutes:
      typeof source.runtime === 'number' && source.runtime > 0
        ? source.runtime
        : null,
    episodeRuntimeMinutes: null,
    genres: source.genres ?? [],
    certification: mapMovieCertification(source.release_dates),
    tagline: source.tagline?.trim() || null,
    status: source.status?.trim() || null,
    keyPeople: mapMovieKeyPeople(source.credits),
    cast: mapCast(source.credits?.cast ?? []),
    trailer: mapTrailer(source.videos),
    watchProviders: mapWatchProviders(providers),
    seasons: [],
    numberOfSeasons: null,
    numberOfEpisodes: null,
  };
}

export function mapTvDetails(
  source: TmdbTvDetailsDto,
  aggregateCredits: TmdbCreditsDto,
  providers: TmdbWatchProvidersDto,
): TitleDetails {
  return {
    id: source.id,
    mediaType: 'tv',
    title: source.name,
    originalTitle: source.original_name?.trim() || null,
    posterPath: source.poster_path ?? null,
    backdropPath: source.backdrop_path ?? null,
    releaseDate: source.first_air_date ?? null,
    releaseYear: getYear(source.first_air_date),
    overview: source.overview?.trim() || null,
    voteAverage:
      typeof source.vote_average === 'number' ? source.vote_average : null,
    runtimeMinutes: null,
    episodeRuntimeMinutes:
      source.episode_run_time?.find((runtime) => runtime > 0) ?? null,
    genres: source.genres ?? [],
    certification: mapTvCertification(source.content_ratings),
    tagline: source.tagline?.trim() || null,
    status: source.status?.trim() || null,
    keyPeople: mapTvKeyPeople(source, aggregateCredits),
    cast: mapCast(aggregateCredits.cast ?? []),
    trailer: mapTrailer(source.videos),
    watchProviders: mapWatchProviders(providers),
    seasons: (source.seasons ?? [])
      .filter((season) => season.season_number > 0)
      .map((season) => ({
        id: season.id,
        name: season.name,
        seasonNumber: season.season_number,
        episodeCount: season.episode_count,
        airDate: season.air_date ?? null,
        posterPath: season.poster_path ?? null,
      })),
    numberOfSeasons: source.number_of_seasons ?? null,
    numberOfEpisodes: source.number_of_episodes ?? null,
  };
}
