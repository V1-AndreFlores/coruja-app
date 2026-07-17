import { MemoryCache } from '@/infrastructure/cache/MemoryCache';

import { TmdbCatalogRepository } from './TmdbCatalogRepository';
import { TmdbClient } from './TmdbClient';

const tmdbClient = new TmdbClient();
const tmdbCache = new MemoryCache();

export const catalogRepository = new TmdbCatalogRepository(
  tmdbClient,
  tmdbCache,
);
