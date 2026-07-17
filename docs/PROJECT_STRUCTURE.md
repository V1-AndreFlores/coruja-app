# Estrutura e arquitetura do projeto

## Objetivo

Este documento registra a estrutura, as fronteiras arquiteturais e as decisões técnicas do aplicativo **Coruja — Sobre filmes e séries**.

## Arquitetura

O projeto utiliza Clean Architecture adaptada para React Native. As dependências apontam para dentro:

- `domain`: modelos independentes de framework;
- `application`: portas e contratos da aplicação;
- `infrastructure`: HTTP, TMDB, cache e armazenamento;
- `presentation`: telas, componentes, hooks e estado da interface;
- `app`: composição e roteamento com Expo Router;
- `shared`: configuração, constantes e utilitários transversais.

## Fluxo do catálogo

```text
HomeScreen / SearchScreen / TitleDetailsScreen
        ↓
useHomeCatalog / useCatalogSearch / useTitleDetails
        ↓
CatalogRepository
        ↓
TmdbCatalogRepository
        ↓
TmdbClient
        ↓
TMDB API
```

As telas não dependem dos DTOs do TMDB. O mapeamento para `CatalogItemSummary` e `TitleDetails` acontece na infraestrutura.

## Estrutura atual

```text
coruja-app/
├── assets/
│   └── images/
├── docs/
│   └── PROJECT_STRUCTURE.md
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   ├── title/[mediaType]/[id].tsx
│   │   ├── _layout.tsx
│   │   ├── +not-found.tsx
│   │   ├── home.tsx
│   │   └── index.tsx
│   ├── application/
│   │   └── contracts/
│   │       ├── AppPreferencesRepository.ts
│   │       ├── CatalogRepository.ts
│   │       └── LocalLibraryRepository.ts
│   ├── domain/
│   │   └── models/
│   │       ├── AppThemeMode.ts
│   │       ├── CatalogItemSummary.ts
│   │       └── TitleDetails.ts
│   ├── infrastructure/
│   │   ├── cache/
│   │   │   └── MemoryCache.ts
│   │   ├── http/
│   │   │   └── tmdb/
│   │   │       ├── repositories.ts
│   │   │       ├── TmdbCatalogRepository.ts
│   │   │       ├── TmdbClient.ts
│   │   │       ├── TmdbDtos.ts
│   │   │       ├── TmdbErrors.ts
│   │   │       └── TmdbMappers.ts
│   │   └── storage/
│   ├── presentation/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   ├── useCatalogSearch.ts
│   │   │   ├── useHomeCatalog.ts
│   │   │   ├── useLocalLibraryList.ts
│   │   │   └── useTitleDetails.ts
│   │   ├── screens/
│   │   └── theme/
│   └── shared/
│       ├── config/
│       │   └── environment.ts
│       └── constants/
│           ├── app.ts
│           ├── storage.ts
│           ├── timing.ts
│           └── tmdb.ts
├── .env.example
├── .gitignore
├── .npmrc
├── app.json
├── eas.json
├── package.json
├── README.md
└── tsconfig.json
```

## Integração direta com o TMDB

A decisão atual elimina backend e hospedagem. A aplicação aceita:

```dotenv
EXPO_PUBLIC_TMDB_READ_TOKEN=
EXPO_PUBLIC_TMDB_API_KEY=
```

Apenas uma credencial é necessária. O token Bearer tem prioridade quando ambos são informados.

### Riscos aceitos

- credenciais `EXPO_PUBLIC_*` ficam incorporadas ao bundle;
- terceiros podem extrair e reutilizar a credencial;
- a mitigação é limitar o uso a leitura, reduzir chamadas e permitir rotação rápida;
- o repositório não contém a credencial real.

### Proteções implementadas

- timeout de 12 segundos;
- cancelamento com `AbortController`;
- debounce de 500 ms na pesquisa;
- exclusão de resultados adultos;
- cache em memória para catálogo e busca;
- tratamento específico para HTTP 401 e 429;
- mensagens de erro adequadas para configuração, autenticação, rede e timeout.

## Endpoints atuais

```text
GET /trending/all/day
GET /movie/popular
GET /tv/popular
GET /search/multi
GET /movie/{id}
GET /movie/{id}/videos
GET /movie/{id}/watch/providers
GET /tv/{id}
GET /tv/{id}/aggregate_credits
GET /tv/{id}/videos
GET /tv/{id}/watch/providers
```

Os detalhes de filme usam `append_to_response=credits,release_dates`; os detalhes de série usam `append_to_response=content_ratings`. Vídeos são consultados sem filtro de idioma para aumentar a chance de localizar um trailer oficial.

As consultas usam `pt-BR`; filmes populares usam também a região `BR`.

## Imagens

Os cards constroem as URLs de pôster usando:

```text
https://image.tmdb.org/t/p/w342{poster_path}
```

Quando não há pôster, capa, foto de integrante ou logotipo de provedor, a interface exibe um placeholder local ou omite o ativo.

## Tema

O tema escuro é o padrão inicial. A preferência é carregada antes da saída da Splash e persistida localmente.

### Tema escuro

| Token | Valor |
|---|---|
| Background | `#0B0F14` |
| Surface | `#161D26` |
| Card | `#1E2630` |
| Primária | `#FF4B4B` |
| Secundária | `#4DA3FF` |
| Texto principal | `#F5F7FA` |
| Texto secundário | `#B5C0CC` |
| Borda | `#2B3642` |

### Tema claro

| Token | Valor |
|---|---|
| Background | `#F7F9FC` |
| Surface | `#FFFFFF` |
| Card | `#EEF2F7` |
| Primária | `#FF4B4B` |
| Secundária | `#2E77D0` |
| Texto principal | `#131A22` |
| Texto secundário | `#5F6B7A` |
| Borda | `#D6DEE8` |

## Persistência local

- `AppPreferencesRepository`: preferências do aplicativo;
- `LocalLibraryRepository`: favoritos, Quero assistir e histórico;
- `AsyncStorageJsonStore`: serialização JSON e tratamento centralizado;
- implementações `AsyncStorage*`: adaptadores concretos.

### Fluxo das listas locais

```text
FavoritesScreen / WatchlistScreen
        ↓
LocalLibraryScreen
        ↓
useLocalLibraryList
        ↓
LocalLibraryRepository
        ↓
AsyncStorageLocalLibraryRepository
```

As listas são carregadas novamente sempre que a aba recebe foco. Cada coleção mantém sua própria chave de armazenamento; remover de Favoritos não altera Quero assistir e vice-versa. Novas inclusões são inseridas no início, preservando a ordem mais recente primeiro.

## Decisões técnicas

1. O pacote Android permanece `br.app.andreflores.coruja`.
2. A Splash permanece por no mínimo três segundos.
3. O tema padrão é escuro.
4. Não existe backend próprio nesta etapa.
5. A integração externa fica encapsulada em repositórios.
6. O cliente HTTP não expõe DTOs do TMDB à apresentação.
7. O cache é apenas em memória e não substitui persistência de biblioteca local. Detalhes possuem TTL de 30 minutos.
8. A pesquisa exige ao menos dois caracteres.
9. Resultados do tipo pessoa são descartados nesta etapa.
10. O logotipo oficial do TMDB deverá ser incluído antes da publicação.
11. O `versionCode` deve ser conferido na Play Console antes do AAB.
12. O elenco principal é limitado a 10 integrantes e séries usam créditos agregados.
13. Trailers e links de disponibilidade são abertos externamente.
14. Os dados de provedores exibem atribuição explícita à JustWatch.
15. Favoritos e Quero assistir usam uma tela genérica de biblioteca local, grade responsiva e confirmação antes da remoção.
16. O retorno da tela de detalhes recarrega automaticamente a coleção focada.

## Próximas etapas técnicas

1. expor e limpar o histórico local;
2. adicionar filtros de pesquisa;
3. adicionar o logotipo aprovado do TMDB;
4. implementar testes unitários dos mapeadores e repositórios;
5. validar responsividade e navegação em Android;
6. preparar privacidade, EAS e publicação.
