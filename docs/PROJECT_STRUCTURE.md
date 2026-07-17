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
HomeScreen / SearchScreen
        ↓
useHomeCatalog / useCatalogSearch
        ↓
CatalogRepository
        ↓
TmdbCatalogRepository
        ↓
TmdbClient
        ↓
TMDB API
```

As telas não dependem dos DTOs do TMDB. O mapeamento para `CatalogItemSummary` acontece na infraestrutura.

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
│   │       └── CatalogItemSummary.ts
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
│   │   │   └── useHomeCatalog.ts
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
```

As consultas usam `pt-BR`; filmes populares usam também a região `BR`.

## Imagens

Os cards constroem as URLs de pôster usando:

```text
https://image.tmdb.org/t/p/w342{poster_path}
```

Quando não há pôster, a interface exibe um placeholder local.

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

## Decisões técnicas

1. O pacote Android permanece `br.app.andreflores.coruja`.
2. A Splash permanece por no mínimo três segundos.
3. O tema padrão é escuro.
4. Não existe backend próprio nesta etapa.
5. A integração externa fica encapsulada em repositórios.
6. O cliente HTTP não expõe DTOs do TMDB à apresentação.
7. O cache é apenas em memória e não substitui persistência de biblioteca local.
8. A pesquisa exige ao menos dois caracteres.
9. Resultados do tipo pessoa são descartados nesta etapa.
10. O logotipo oficial do TMDB deverá ser incluído antes da publicação.
11. O `versionCode` deve ser conferido na Play Console antes do AAB.

## Próximas etapas técnicas

1. criar rota e tela de detalhes;
2. integrar detalhes, créditos, vídeos e classificação indicativa;
3. integrar provedores de streaming do Brasil;
4. ativar favoritos, Quero assistir e histórico;
5. adicionar o logotipo aprovado do TMDB;
6. implementar testes unitários dos mapeadores e repositórios;
7. preparar privacidade, EAS e publicação.
