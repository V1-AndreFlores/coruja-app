import { getTmdbCredentials } from '@/shared/config/environment';
import { TMDB } from '@/shared/constants/tmdb';

import { TmdbError } from './TmdbErrors';

type QueryValue = string | number | boolean | undefined;
type QueryParams = Record<string, QueryValue>;

export type TmdbRequestOptions = {
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
};

function createAbortError(): Error {
  const error = new Error('Request aborted.');
  error.name = 'AbortError';
  return error;
}

function isRetryableError(error: unknown): boolean {
  if (!(error instanceof TmdbError)) {
    return false;
  }

  if (error.code === 'network') {
    return true;
  }

  return (
    error.code === 'unexpected' &&
    typeof error.status === 'number' &&
    error.status >= 500 &&
    error.status <= 599
  );
}

function waitForRetry(delayMs: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(createAbortError());
  }

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort);
      resolve();
    }, delayMs);

    const handleAbort = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', handleAbort);
      reject(createAbortError());
    };

    signal?.addEventListener('abort', handleAbort, { once: true });
  });
}

export class TmdbClient {
  async get<T>(
    path: string,
    params: QueryParams = {},
    externalSignal?: AbortSignal,
    options: TmdbRequestOptions = {},
  ): Promise<T> {
    const retryCount = Math.max(0, options.retryCount ?? 0);
    const retryDelayMs = Math.max(0, options.retryDelayMs ?? 0);

    for (let attempt = 0; attempt <= retryCount; attempt += 1) {
      try {
        return await this.executeGet<T>(
          path,
          params,
          externalSignal,
          options.timeoutMs ?? TMDB.requestTimeoutMs,
        );
      } catch (error) {
        const canRetry =
          attempt < retryCount &&
          !externalSignal?.aborted &&
          isRetryableError(error);

        if (!canRetry) {
          throw error;
        }

        await waitForRetry(retryDelayMs, externalSignal);
      }
    }

    throw new TmdbError('unexpected', 'TMDB request failed unexpectedly.');
  }

  private async executeGet<T>(
    path: string,
    params: QueryParams,
    externalSignal: AbortSignal | undefined,
    timeoutMs: number,
  ): Promise<T> {
    const credentials = getTmdbCredentials();

    if (!credentials.readToken && !credentials.apiKey) {
      throw new TmdbError(
        'configuration',
        'TMDB credentials were not configured.',
      );
    }

    if (externalSignal?.aborted) {
      throw createAbortError();
    }

    const url = new URL(`${TMDB.apiBaseUrl}${path}`);
    const queryParams: QueryParams = {
      ...params,
      ...(credentials.readToken ? {} : { api_key: credentials.apiKey }),
    };

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });

    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const abortFromExternalSignal = () => controller.abort();
    externalSignal?.addEventListener('abort', abortFromExternalSignal, {
      once: true,
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          accept: 'application/json',
          ...(credentials.readToken
            ? { Authorization: `Bearer ${credentials.readToken}` }
            : {}),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new TmdbError(
            'authentication',
            'TMDB rejected the configured credential.',
            response.status,
          );
        }

        if (response.status === 429) {
          throw new TmdbError(
            'rate-limit',
            'TMDB rate limit reached.',
            response.status,
          );
        }

        throw new TmdbError(
          'unexpected',
          `TMDB returned HTTP ${response.status}.`,
          response.status,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof TmdbError) {
        throw error;
      }

      if (timedOut) {
        throw new TmdbError('timeout', 'TMDB request timed out.');
      }

      if (externalSignal?.aborted) {
        throw createAbortError();
      }

      throw new TmdbError('network', 'TMDB request failed.');
    } finally {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener('abort', abortFromExternalSignal);
    }
  }
}
