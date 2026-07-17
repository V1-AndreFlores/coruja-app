# Coruja — Sobre filmes e séries

Aplicativo mobile para pesquisar filmes e séries, consultar informações detalhadas e descobrir em quais plataformas de streaming cada título está disponível no Brasil.

Este repositório representa a reconstrução do aplicativo Coruja. A nova versão será publicada como atualização do cadastro existente na Google Play, mantendo o identificador Android `br.app.andreflores.coruja`.

## Objetivos

- oferecer pesquisa unificada de filmes e séries;
- exibir sinopse, duração, gêneros, elenco, equipe e trailers;
- informar onde assistir no Brasil, diferenciando assinatura, aluguel e compra;
- manter favoritos, lista “Quero assistir” e histórico local;
- disponibilizar temas claro e escuro;
- operar sem backend próprio e sem custo de hospedagem;
- adotar arquitetura sustentável, tipagem estrita e dependências atualizadas.

## Estado atual

A aplicação contém:

- Splash nativa e tela de Splash com duração mínima de três segundos;
- navegação por abas: Início, Buscar, Quero assistir, Favoritos e Ajustes;
- tema escuro como padrão e persistência da seleção de tema;
- integração direta com o TMDB para tendências, filmes populares, séries populares e busca;
- idioma `pt-BR` e região padrão `BR`;
- autenticação por API Read Access Token ou API Key;
- timeout, cancelamento, debounce de pesquisa e cache em memória;
- componentes reutilizáveis para catálogo, busca e estados de tela;
- persistência local preparada para favoritos, Quero assistir e histórico;
- atribuições textuais iniciais ao TMDB e à JustWatch;
- configuração inicial do EAS Build;
- documentação de arquitetura e estrutura de pastas.

## Stack

- Expo SDK 57;
- React Native 0.86;
- React 19;
- TypeScript 6;
- Expo Router;
- Expo Symbols;
- AsyncStorage;
- Fetch API;
- TMDB API;
- EAS Build.

## Arquitetura sem backend

```text
Presentation
    ↓
Application contracts
    ↓
Domain
    ↓
Infrastructure
    ├── TmdbClient
    ├── TmdbCatalogRepository
    ├── MemoryCache
    └── AsyncStorage repositories
```

A camada de apresentação não conhece os contratos HTTP do TMDB. Se um backend for necessário futuramente, a implementação do repositório poderá ser substituída sem reescrever as telas.

## Pré-requisitos

- Node.js LTS compatível com o Expo SDK adotado;
- npm;
- Expo Go para testes iniciais ou Development Build;
- conta gratuita no TMDB;
- conta Expo para builds EAS.

## Credencial do TMDB

Copie o arquivo de exemplo:

```bash
cp .env.example .env.local
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Preencha uma das opções:

```dotenv
EXPO_PUBLIC_TMDB_READ_TOKEN=seu_token_de_leitura
EXPO_PUBLIC_TMDB_API_KEY=
```

ou:

```dotenv
EXPO_PUBLIC_TMDB_READ_TOKEN=
EXPO_PUBLIC_TMDB_API_KEY=sua_api_key
```

O arquivo `.env.local` é ignorado pelo Git. Entretanto, como a chamada é feita diretamente pelo aplicativo, a credencial é incorporada ao bundle e pode ser extraída do APK/AAB. Ela deve ser exclusiva para leitura e poderá ser rotacionada no TMDB.

## Instalação

Após uma entrega que altera dependências:

```bash
npm install
```

Com `package.json` e `package-lock.json` sincronizados:

```bash
npm ci
```

## Execução

```bash
npx expo start -c
```

Também estão disponíveis:

```bash
npm run android
npm run ios
npm run web
```

## Navegação

```text
Início | Buscar | Quero assistir | Favoritos | Ajustes
```

## Persistência local

As preferências de tema são persistidas com AsyncStorage. A mesma infraestrutura contém contratos para:

- favoritos;
- lista Quero assistir;
- histórico de visualizações.

Nenhum desses dados exige login e permanece somente no aparelho.

## Builds EAS

Para builds remotos, configure a mesma variável no ambiente EAS usado pelo perfil de build.

### APK de validação

```bash
npx eas build -p android --profile preview
```

### AAB de produção

```bash
npx eas build -p android --profile production
```

Antes do primeiro AAB, deve ser confirmado o maior `versionCode` da Play Console e concluída a redefinição da chave de upload.

## Atribuições

O aplicativo deverá manter, na seção Sobre/Créditos, o aviso obrigatório do TMDB e um logotipo oficial aprovado. Os dados de onde assistir exigem atribuição à JustWatch.

## Estrutura e decisões técnicas

Consulte [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md).

## Política de privacidade

URL planejada:

```text
https://v1-andreflores.github.io/politica-de-privacidade/coruja/
```

## Repositório GitHub

```text
https://github.com/V1-AndreFlores/coruja-app
```

## Próximas etapas

1. criar a tela de detalhes de filmes e séries;
2. integrar elenco, duração, gêneros, trailers e classificação indicativa;
3. integrar onde assistir no Brasil;
4. ativar favoritos, Quero assistir e histórico nas telas;
5. incluir o logotipo oficial aprovado do TMDB na área de créditos;
6. implementar testes automatizados;
7. preparar política de privacidade e publicação.
