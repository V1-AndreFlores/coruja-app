export type TmdbErrorCode =
  | 'configuration'
  | 'authentication'
  | 'rate-limit'
  | 'timeout'
  | 'network'
  | 'unexpected';

export class TmdbError extends Error {
  constructor(
    public readonly code: TmdbErrorCode,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = 'TmdbError';
  }
}

export function toCatalogErrorMessage(error: unknown): string {
  if (error instanceof TmdbError) {
    switch (error.code) {
      case 'configuration':
        return 'Configure EXPO_PUBLIC_TMDB_READ_TOKEN ou EXPO_PUBLIC_TMDB_API_KEY no arquivo .env.local.';
      case 'authentication':
        return 'A credencial do TMDB foi recusada. Revise o token ou a chave configurada.';
      case 'rate-limit':
        return 'O limite temporário de consultas foi atingido. Aguarde alguns segundos e tente novamente.';
      case 'timeout':
        return 'O TMDB demorou mais que o esperado para responder. Tente novamente.';
      case 'network':
        return 'Não foi possível acessar o catálogo. Verifique sua conexão com a internet.';
      default:
        if (
          typeof error.status === 'number' &&
          error.status >= 500 &&
          error.status <= 599
        ) {
          return 'O TMDB está temporariamente indisponível. Tente novamente em alguns instantes.';
        }

        return 'Não foi possível carregar o catálogo neste momento.';
    }
  }

  return 'Não foi possível carregar o catálogo neste momento.';
}
