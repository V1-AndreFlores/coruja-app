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
│   │   ├── history.tsx
│   │   ├── about.tsx
│   │   ├── data-management.tsx
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
│   │   │   ├── useHistory.ts
│   │   │   ├── useLocalDataManagement.ts
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

- timeout de 15 segundos para catálogo, busca e opções de plataforma;
- timeout de 20 segundos para os detalhes de filmes e séries;
- uma repetição automática em todas as consultas somente para falhas de rede e respostas HTTP 5xx;
- cancelamento com `AbortController`;
- debounce de 500 ms na pesquisa;
- busca simultânea por título e por nome de profissional;
- filtros locais por tipo, gênero, período e avaliação mínima;
- consulta de plataformas disponíveis no Brasil somente quando o usuário seleciona esse filtro;
- etiquetas removíveis para filtros ativos e estado mantido durante a sessão;
- consulta dos créditos combinados da pessoa mais relevante;
- exclusão de resultados adultos;
- remoção de duplicidades entre resultados diretos e créditos;
- cache em memória para catálogo e busca;
- tratamento específico para HTTP 401 e 429;
- mensagens de erro adequadas para configuração, autenticação, rede, indisponibilidade temporária e timeout;
- película bloqueante reutilizável na primeira carga de Início, Busca e Detalhes, usando o mesmo indicador circular da Splash;
- na Busca, somente a região dos resultados é bloqueada, mantendo termo e filtros utilizáveis;
- dados já carregados permanecem visíveis durante atualizações, acompanhados por um indicador discreto;
- carregamento das plataformas no modal de filtros possui indicador local e cancelamento ao fechar a tela.

## Endpoints atuais

```text
GET /trending/all/day
GET /movie/popular
GET /tv/popular
GET /search/multi
GET /search/person
GET /person/{id}/combined_credits
GET /watch/providers/movie
GET /watch/providers/tv
GET /movie/{id}
GET /movie/{id}/videos
GET /movie/{id}/watch/providers
GET /tv/{id}
GET /tv/{id}/aggregate_credits
GET /tv/{id}/videos
GET /tv/{id}/watch/providers
```

Os detalhes de filme usam `append_to_response=credits,release_dates`; os detalhes de série usam `append_to_response=content_ratings`. Vídeos são consultados sem filtro de idioma para aumentar a chance de localizar um trailer oficial.

As consultas usam `pt-BR`; filmes populares usam também a região `BR`. Na busca, `/search/multi` fornece os resultados diretos por título e `/search/person` identifica a pessoa mais relevante. Quando encontrada, `/person/{id}/combined_credits` retorna os trabalhos de elenco e equipe técnica. A apresentação recebe somente filmes e séries.

Tipo, gênero, intervalo de lançamento e avaliação mínima são aplicados sobre os resultados mapeados. As opções de streaming são obtidas das listas de provedores de filmes e séries para a região `BR`. Quando uma plataforma é selecionada em uma busca por título, a disponibilidade é verificada nos endpoints de cada resultado e armazenada em cache. Esse filtro é desabilitado em buscas identificadas como nome de profissional para impedir uma multiplicação excessiva de requisições sobre os créditos combinados.

## Imagens

Os cards constroem as URLs de pôster usando:

```text
https://image.tmdb.org/t/p/w342{poster_path}
```

Quando não há pôster, capa, foto de integrante ou logotipo de provedor, a interface exibe um placeholder local ou omite o ativo.

## Tema

O tema escuro é o padrão inicial. A preferência é carregada antes da saída da Splash e persistida localmente. A Splash nativa e a tela de Splash do React Native utilizam `assets/images/splash-brand.png` com o mesmo fundo, dimensão e posicionamento; somente a segunda etapa acrescenta o indicador circular de carregamento.

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

### Fluxo do histórico

```text
SettingsScreen
        ↓
HistoryScreen
        ↓
useHistory
        ↓
LocalLibraryRepository
        ↓
AsyncStorageLocalLibraryRepository
```

O histórico é limitado aos 100 títulos mais recentes. A chave composta `mediaType:id` evita duplicidade; uma nova visualização atualiza o horário e move o título para o início. A tela recarrega ao receber foco, permite abertura dos detalhes, remoção individual e limpeza total com confirmação. Essas operações não afetam Favoritos nem Quero assistir.

### Fluxo de gerenciamento dos dados locais

```text
SettingsScreen
        ↓
DataManagementScreen
        ↓
useLocalDataManagement
        ↓
LocalLibraryRepository
        ↓
AsyncStorageLocalLibraryRepository
```

A tela consulta as quantidades de Favoritos, Quero assistir e histórico. Cada coleção pode ser limpa separadamente ou em conjunto. Todas as operações destrutivas exigem confirmação, atualizam os contadores imediatamente e preservam a preferência de tema.

## Sobre, créditos e privacidade

`AboutScreen` concentra versão, desenvolvedor, contato, links oficiais, aviso obrigatório do TMDB, atribuição à JustWatch e acesso à política de privacidade. A tela de Ajustes mantém apenas os atalhos principais, evitando duplicação de informações. O logotipo oficial aprovado do TMDB permanece como requisito antes da publicação final.

## Decisões técnicas

1. O pacote Android permanece `br.app.andreflores.coruja`.
2. A Splash permanece por no mínimo três segundos.
3. O tema padrão é escuro.
4. Não existe backend próprio nesta etapa.
5. A integração externa fica encapsulada em repositórios.
6. O cliente HTTP não expõe DTOs do TMDB à apresentação.
7. O cache é apenas em memória e não substitui persistência de biblioteca local. Detalhes possuem TTL de 30 minutos.
8. A pesquisa exige ao menos dois caracteres.
9. Pessoas não são exibidas como resultados e não possuem tela de perfil.
10. A busca considera a pessoa mais relevante retornada pelo TMDB e incorpora seus créditos combinados de elenco e equipe técnica.
11. Resultados diretos por título aparecem primeiro; títulos duplicados são removidos pela chave `mediaType:id`.
12. Os trabalhos associados à pessoa são ordenados por relevância e limitados aos 20 primeiros.
13. O logotipo oficial do TMDB deverá ser incluído antes da publicação.
14. O `versionCode` deve ser conferido na Play Console antes do AAB.
15. O elenco principal é limitado a 10 integrantes e séries usam créditos agregados.
16. Trailers e links de disponibilidade são abertos externamente.
17. Os dados de provedores exibem atribuição explícita à JustWatch.
18. Favoritos e Quero assistir usam uma tela genérica de biblioteca local, grade responsiva e confirmação antes da remoção.
19. O retorno da tela de detalhes recarrega automaticamente a coleção focada.
20. O histórico é acessado pelos Ajustes, limitado a 100 itens e não mantém duplicidades.
21. A remoção individual e a limpeza total do histórico exigem confirmação e não alteram outras listas locais.
22. O gerenciamento de dados permite limpeza seletiva ou completa de Favoritos, Quero assistir e histórico, preservando o tema.
23. Falhas de escrita e remoção no AsyncStorage são propagadas para que a interface possa informar o erro.
24. A área Sobre concentra créditos, contato e privacidade; a tela Ajustes funciona como índice de navegação.
25. Os filtros de busca priorizam simplicidade: um tipo, um gênero, um período, uma nota mínima e uma plataforma por vez.
26. Os filtros permanecem apenas durante a sessão e não são gravados no AsyncStorage.
27. A verificação por plataforma é feita somente em buscas por título e usa cache por `mediaType:id`.
28. Em buscas por profissional, plataforma e disponibilidade são removidas para limitar chamadas ao TMDB.
29. A primeira carga de Início, Busca e Detalhes permanece protegida por uma película até sucesso, timeout ou erro definitivo, evitando conteúdo parcial ou vazio.
30. Na Busca, a película cobre somente a região de resultados; o termo e os filtros continuam acessíveis.
31. Dados já carregados não são removidos durante uma atualização e exibem um indicador discreto de progresso.
32. Catálogo, busca e plataformas usam timeout de 15 segundos; detalhes usam 20 segundos. Todas as consultas realizam uma única repetição automática apenas para falhas de rede ou HTTP 5xx; autenticação, limite, timeout e demais erros não são repetidos automaticamente.

## Próximas etapas técnicas

1. adicionar o logotipo aprovado do TMDB;
2. implementar testes unitários dos mapeadores e repositórios;
3. validar responsividade e navegação em Android;
4. revisar acessibilidade, estados offline e desempenho;
5. revisar privacidade, EAS e publicação.
