# Estrutura e arquitetura do projeto

## Objetivo

Este documento registra a estrutura, as fronteiras arquiteturais e as decisões técnicas do aplicativo **Coruja — Sobre filmes e séries**.

## Arquitetura

O projeto utiliza uma **Clean Architecture adaptada para React Native**, evitando abstrações sem necessidade concreta. As dependências apontam para dentro:

- `domain`: tipos, entidades e regras independentes de framework;
- `application`: contratos e futuros casos de uso;
- `infrastructure`: implementações de armazenamento, HTTP, cache e integrações;
- `presentation`: telas, componentes e gerenciamento de estado da interface;
- `app`: composição e roteamento com Expo Router;
- `shared`: constantes e utilitários transversais.

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
│   │   │   ├── _layout.tsx
│   │   │   ├── ajustes.tsx
│   │   │   ├── buscar.tsx
│   │   │   ├── favoritos.tsx
│   │   │   ├── inicio.tsx
│   │   │   └── quero-assistir.tsx
│   │   ├── _layout.tsx
│   │   ├── +not-found.tsx
│   │   ├── home.tsx
│   │   └── index.tsx
│   ├── application/
│   │   └── contracts/
│   │       ├── AppPreferencesRepository.ts
│   │       └── LocalLibraryRepository.ts
│   ├── domain/
│   │   └── models/
│   │       ├── AppThemeMode.ts
│   │       └── CatalogItemSummary.ts
│   ├── infrastructure/
│   │   └── storage/
│   │       ├── AsyncStorageAppPreferencesRepository.ts
│   │       ├── AsyncStorageJsonStore.ts
│   │       ├── AsyncStorageLocalLibraryRepository.ts
│   │       └── repositories.ts
│   ├── presentation/
│   │   ├── components/
│   │   ├── screens/
│   │   └── theme/
│   └── shared/
│       └── constants/
│           ├── app.ts
│           ├── storage.ts
│           └── timing.ts
├── .editorconfig
├── .gitignore
├── .npmrc
├── app.json
├── eas.json
├── package.json
├── README.md
└── tsconfig.json
```

## Navegação

A navegação principal utiliza Expo Router com abas JavaScript:

```text
/(tabs)/inicio
/(tabs)/buscar
/(tabs)/quero-assistir
/(tabs)/favoritos
/(tabs)/ajustes
```

A rota `/` mantém a Splash. A rota legada `/home` redireciona para a aba Início, evitando quebra de links usados durante a estrutura inicial.

## Tema

O tema escuro é o padrão inicial. A preferência selecionada é carregada antes da saída da Splash e persistida localmente.

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

A implementação inicial usa uma porta por responsabilidade:

- `AppPreferencesRepository`: preferências do aplicativo, começando pelo tema;
- `LocalLibraryRepository`: favoritos, lista Quero assistir e histórico;
- `AsyncStorageJsonStore`: serialização JSON e tratamento centralizado de falhas;
- implementações `AsyncStorage*`: adaptadores concretos de infraestrutura.

A interface não depende diretamente do AsyncStorage. Isso permite substituir o mecanismo por SQLite sem alterar as telas ou os contratos de aplicação.

## Componentes de apresentação

Os principais componentes reutilizáveis são:

- `AppScreen`: Safe Area e rolagem padronizadas;
- `AppHeader`: marca em temas claro e escuro;
- `AppPageTitle` e `AppSectionHeader`: hierarquia textual consistente;
- `AppSearchButton` e `AppSearchInput`: entrada de busca;
- `AppStateView`: estados de carregamento, vazio e erro;
- `FeatureCard` e `CatalogSkeletonRow`: composição da tela inicial;
- `ThemeSelector`, `SettingsCard` e `SettingsLinkRow`: estrutura dos Ajustes;
- `AppIcon`: abstração de símbolos entre Android, iOS e Web.

## Decisões técnicas

1. O pacote Android permanece `br.app.andreflores.coruja`.
2. A Splash permanece por no mínimo três segundos e também aguarda a hidratação das preferências.
3. O tema padrão é escuro, sem depender do tema do sistema.
4. As abas usam rotas explícitas para evitar conflito entre a Splash em `/` e a tela Início.
5. A persistência é encapsulada por repositórios e não é acessada diretamente pelas telas.
6. A camada visual não depende do futuro fornecedor de catálogo.
7. O `versionCode` deve ser conferido na Play Console antes do primeiro AAB de produção.

## Próximas etapas técnicas

1. definir DTOs e contratos do backend;
2. criar cliente HTTP com timeout, cancelamento e tratamento de falhas;
3. implementar consultas de tendências, populares e pesquisa;
4. criar detalhes de filmes e séries;
5. integrar favoritos, Quero assistir e histórico às telas;
6. adicionar testes unitários e de componentes;
7. preparar privacidade, EAS e publicação.
