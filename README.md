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

- Splash nativa com fundo escuro e tela de Splash com `splash.png` em tela cheia, círculo de carregamento e duração mínima de três segundos;
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
- exploração do catálogo somente pelos filtros, sem exigir título ou profissional;
- filtros simples por tipo, gênero, período de lançamento, avaliação mínima, disponibilidade e múltiplos streamings no Brasil;
- filtros ativos exibidos como etiquetas removíveis e mantidos durante a navegação da sessão;
- lista dinâmica de provedores disponíveis no Brasil, com seleção de vários serviços em lógica “qualquer um deles”;
- configuração local “Meus streamings”, incluindo Apple TV+, para reutilizar as assinaturas do usuário na busca;
- filtro de streaming ignorado em buscas identificadas como nome de profissional, evitando consultas excessivas;
- créditos de elenco e equipe técnica são unificados, sem duplicidade, e limitados aos 20 trabalhos mais relevantes;
- timeout, cancelamento, debounce de pesquisa e cache em memória;
- carregamento bloqueante padronizado na primeira carga de Início, Busca e Detalhes, usando o mesmo indicador circular da Splash;
- campo de busca e filtros permanecem utilizáveis enquanto somente a região de resultados fica bloqueada;
- conteúdos já carregados permanecem visíveis durante atualizações, com indicador discreto de progresso;
- timeout de 15 segundos para catálogo, busca e plataformas, e de 20 segundos para detalhes;
- uma repetição automática para falhas temporárias de rede ou respostas HTTP 5xx em todas as consultas ao TMDB;
- componentes reutilizáveis para catálogo, busca e estados de tela;
- persistência local preparada para favoritos, Quero assistir e histórico;
- área Sobre o Coruja com versão, desenvolvimento, créditos ao TMDB, atribuição à JustWatch, contato e política de privacidade;
- gerenciamento de dados locais com contadores e limpeza seletiva ou completa de Favoritos, Quero assistir e histórico;
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

A camada de apresentação não conhece os contratos HTTP do TMDB. Se um backend for necessário futuramente, a implementação do repositório poderá ser substituída sem reescrever as telas. Catálogo, busca e plataformas usam timeout de 15 segundos; detalhes usam 20 segundos. Todas as consultas possuem uma repetição automática somente para falhas temporárias de rede ou respostas HTTP 5xx. Na primeira carga, uma película com o indicador circular da Splash evita conteúdo incompleto; quando já existem dados, eles permanecem visíveis com uma indicação discreta de atualização.

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

O campo de texto não é obrigatório quando há filtros ativos. Nesse modo, o aplicativo usa os endpoints de descoberta do TMDB para explorar filmes e séries por tipo, gênero, período, avaliação e disponibilidade.

O painel permite selecionar vários streamings ao mesmo tempo. A lógica é inclusiva: o título pode estar disponível em qualquer um dos serviços marcados. A relação de provedores é carregada dinamicamente para o Brasil, e `Ajustes > Meus streamings` permite salvar as assinaturas do usuário no aparelho. Os filtros ativos aparecem abaixo do campo e podem ser removidos individualmente. Em buscas identificadas como nome de profissional, o filtro de streaming é mantido visualmente, mas não é aplicado para evitar uma consulta de disponibilidade para cada crédito associado.

Os cards de Início e Buscar abrem a rota dinâmica:

```text
/title/{movie|tv}/{id}
```

## Persistência local

As preferências de tema e a seleção de “Meus streamings” são persistidas com AsyncStorage. A biblioteca local armazena:

- favoritos;
- lista Quero assistir;
- histórico de visualizações, limitado aos 100 títulos mais recentes.

Favoritos e Quero assistir são coleções independentes. Os itens mais recentes ficam no início, as telas recarregam quando voltam ao foco e a remoção direta exige confirmação.

O histórico é acessado em `Ajustes > Histórico de visualizações`, mantém até 100 títulos e registra data e hora. Ao abrir novamente o mesmo título, o registro existente é atualizado e movido para o início, sem duplicidade. É possível remover um item ou limpar todo o histórico sem afetar Favoritos e Quero assistir.

A área `Ajustes > Gerenciar dados locais` apresenta as quantidades armazenadas e permite limpar Favoritos, Quero assistir, histórico ou as três coleções em uma única operação. As preferências de tema e de streamings são preservadas. Nenhum desses dados exige login e tudo permanece somente no aparelho.

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

## Sobre, créditos e privacidade

A área `Ajustes > Sobre o Coruja e créditos` reúne:

- versão instalada e identificação do aplicativo;
- identificação e contato do desenvolvedor;
- aviso obrigatório do TMDB;
- atribuição da disponibilidade de streaming à JustWatch;
- links oficiais das fontes de dados;
- acesso à política de privacidade e ao gerenciamento dos dados locais.

O logotipo oficial aprovado do TMDB ainda deverá ser incluído antes da publicação final.

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

1. incluir o logotipo oficial aprovado do TMDB na área de créditos;
2. implementar testes automatizados dos mapeadores e repositórios;
3. validar o fluxo completo em Android;
4. revisar acessibilidade, estados offline, tratamento de cache e desempenho;
5. revisar a política de privacidade publicada e preparar o AAB.

## Otimização Android de produção

O perfil `production` ativa otimização nativa somente nos builds Android de release:

- R8 para minificação, otimização e ofuscação;
- remoção de código Java/Kotlin não utilizado;
- remoção de recursos Android não utilizados;
- geração do `mapping.txt`;
- inclusão automática do mapeamento de desofuscação no Android App Bundle.

A configuração é aplicada por `app.config.js` somente quando o perfil EAS define:

```text
ENABLE_ANDROID_RELEASE_OPTIMIZATION=true
```

Os perfis `development` e `preview` permanecem sem R8 e sem redução de recursos para facilitar diagnóstico e testes.

Build de produção otimizado:

```bash
eas build -p android --profile production
```

Antes de publicar, instale e valide o artefato otimizado em dispositivo físico. Não devem ser adicionadas regras em `extraProguardRules` sem uma falha concreta de build ou execução que justifique a exceção.

## Referência permanente do projeto

Além da estrutura técnica, consulte [`docs/PROJECT_REFERENCE.md`](docs/PROJECT_REFERENCE.md) antes de novas alterações. Esse documento registra funcionalidades, integrações, invariantes, configuração de produção e checklist de atualização.
