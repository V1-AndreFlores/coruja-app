# Coruja — Sobre filmes e séries

Aplicativo mobile para pesquisar filmes e séries, consultar informações detalhadas e descobrir em quais plataformas de streaming cada título está disponível no Brasil.

Este repositório representa a reconstrução do aplicativo Coruja. A nova versão será publicada como atualização do cadastro existente na Google Play, mantendo o identificador Android `br.app.andreflores.coruja`.

## Objetivos

- oferecer pesquisa de filmes e séries por parte do título ou pelo nome de profissionais;
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
- integração direta com o TMDB para tendências, filmes populares, séries populares e busca por título ou profissional;
- tela de detalhes para filmes e séries, aberta ao tocar nos cards;
- sinopse, duração, gêneros, classificação indicativa, equipe principal e elenco;
- trailer externo no YouTube e disponibilidade no Brasil por assinatura, aluguel e compra;
- temporadas e quantidade de episódios para séries;
- ações locais de Favorito e Quero assistir, além de compartilhamento;
- telas Favoritos e Quero assistir com grade responsiva, abertura dos detalhes e remoção confirmada;
- atualização automática das listas ao retornar da tela de detalhes;
- ordenação por inclusão mais recente e independência entre as duas listas;
- histórico de visualizações acessível pelos Ajustes, com data e hora, remoção individual e limpeza completa;
- limite de 100 títulos no histórico, sem duplicidade e com o mais recente no início;
- idioma `pt-BR` e região padrão `BR`;
- autenticação por API Read Access Token ou API Key;
- busca por título ou pelo nome de atores, atrizes, diretores e demais profissionais, retornando somente filmes e séries;
- resultados encontrados diretamente pelo título aparecem antes dos créditos da pessoa mais relevante;
- créditos de elenco e equipe técnica são unificados, sem duplicidade, e limitados aos 20 trabalhos mais relevantes;
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

A camada de apresentação não conhece os contratos HTTP do TMDB. Se um backend for necessário futuramente, a implementação do repositório poderá ser substituída sem reescrever as telas. Os detalhes usam cache em memória e cancelamento de requisições ao sair da rota.

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

Na Busca, o termo é consultado simultaneamente como título e como nome de profissional. A interface exibe somente filmes e séries; quando uma pessoa é localizada, seus créditos combinados de elenco e equipe técnica são incorporados após os resultados diretos de título.

Os cards de Início e Buscar abrem a rota dinâmica:

```text
/title/{movie|tv}/{id}
```

## Persistência local

As preferências de tema são persistidas com AsyncStorage. A biblioteca local armazena:

- favoritos;
- lista Quero assistir;
- histórico de visualizações, limitado aos 100 títulos mais recentes.

Favoritos e Quero assistir são coleções independentes. Os itens mais recentes ficam no início, as telas recarregam quando voltam ao foco e a remoção direta exige confirmação.

O histórico é acessado em `Ajustes > Histórico de visualizações`, mantém até 100 títulos e registra data e hora. Ao abrir novamente o mesmo título, o registro existente é atualizado e movido para o início, sem duplicidade. É possível remover um item ou limpar todo o histórico sem afetar Favoritos e Quero assistir. Nenhum desses dados exige login e tudo permanece somente no aparelho.

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

1. adicionar filtros avançados de pesquisa;
2. finalizar Sobre, Créditos e Política de Privacidade;
3. incluir o logotipo oficial aprovado do TMDB na área de créditos;
4. implementar testes automatizados dos mapeadores e repositórios;
5. validar o fluxo completo em Android e preparar a publicação.
