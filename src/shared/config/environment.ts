export type TmdbCredentials = {
  readToken?: string;
  apiKey?: string;
};

function normalize(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function getTmdbCredentials(): TmdbCredentials {
  return {
    readToken: normalize(process.env.EXPO_PUBLIC_TMDB_READ_TOKEN),
    apiKey: normalize(process.env.EXPO_PUBLIC_TMDB_API_KEY),
  };
}

