# Referência permanente do projeto Coruja

## 1. Finalidade

Este documento registra o estado funcional e técnico do aplicativo **Coruja — Sobre filmes e séries** para reduzir risco em futuras atualizações. Ele complementa o `PROJECT_STRUCTURE.md` e deve ser revisado antes de qualquer alteração.

## 2. Identidade imutável para atualização no Google Play

```text
Nome: Coruja - Sobre filmes e séries
Package Android: br.app.andreflores.coruja
Slug Expo: coruja-app
Projeto EAS: 69ff5d81-b7cf-4b80-a90e-1b4f05e06431
Versão pública atual do projeto: 2.0.0
```

O package Android não pode ser alterado enquanto o objetivo for atualizar o aplicativo existente no Google Play.

## 3. Stack

- Expo SDK 57;
- React Native 0.86;
- React 19;
- TypeScript 6;
- Expo Router;
- AsyncStorage;
- Fetch API;
- integração direta com TMDB;
- EAS Build;
- Nova Arquitetura do React Native habilitada.

## 4. Arquitetura

O projeto usa Clean Architecture adaptada para mobile:

```text
presentation
    ↓
application contracts
    ↓
domain
    ↓
infrastructure
```

Responsabilidades:

- `src/domain`: modelos independentes de framework;
- `src/application`: contratos e portas;
- `src/infrastructure`: TMDB, HTTP, cache e persistência local;
- `src/presentation`: telas, componentes, hooks, tema e preferências;
- `src/app`: rotas e composição com Expo Router;
- `src/shared`: configuração, constantes e utilitários transversais.

As telas não devem depender de DTOs do TMDB. O mapeamento para os modelos de domínio permanece na infraestrutura.

## 5. Funcionalidades atuais

### Navegação principal

```text
Início | Buscar | Quero assistir | Favoritos | Ajustes
```

### Catálogo e descoberta

- tendências do dia;
- filmes populares;
- séries populares;
- busca por parte do título;
- busca por nome de ator, atriz, diretor ou outro profissional;
- apresentação somente de filmes e séries;
- exploração sem texto usando filtros;
- tipo, gênero, período, avaliação e disponibilidade;
- seleção de múltiplos streamings com lógica OR;
- configuração persistente “Meus streamings”;
- provedores consultados dinamicamente para o Brasil.

### Detalhes

- sinopse;
- duração;
- gêneros;
- classificação indicativa;
- elenco e equipe principal;
- temporadas e episódios de séries;
- trailer externo;
- disponibilidade para assinatura, aluguel e compra;
- ações Favorito, Quero assistir e Compartilhar.

### Dados locais

- tema claro ou escuro;
- serviços selecionados em Meus streamings;
- Favoritos;
- Quero assistir;
- histórico limitado aos 100 títulos mais recentes;
- gerenciamento e limpeza seletiva dos dados locais.

Não existe login, anúncio, compra no aplicativo ou backend próprio.

## 6. Integração com o TMDB

Variáveis aceitas:

```dotenv
EXPO_PUBLIC_TMDB_READ_TOKEN=
EXPO_PUBLIC_TMDB_API_KEY=
```

Somente uma credencial é necessária. O token Bearer tem prioridade.

### Ambientes EAS

A credencial deve existir separadamente nos ambientes usados:

```text
preview
production
```

Nunca enviar `.env.local`, `.env.preview` ou tokens reais ao GitHub.

### Resiliência

- timeout de 15 segundos para catálogo, busca e provedores;
- timeout de 20 segundos para detalhes;
- uma repetição automática apenas para rede e HTTP 5xx;
- cancelamento com `AbortController`;
- debounce de 500 ms;
- cache em memória;
- tratamento específico para 401, 429, indisponibilidade e timeout;
- película de carregamento na primeira carga;
- dados existentes preservados durante atualização.

## 7. Splash e identidade visual

- Splash nativa Android: fundo `#0B0F14` com recurso transparente mínimo;
- Splash React Native: `assets/images/splash.png` em tela cheia;
- indicador circular de carregamento;
- duração mínima de três segundos;
- tema escuro como padrão inicial;
- cores definidas em `src/presentation/theme`.

## 8. Perfis EAS

### Development

- Development Client;
- distribuição interna;
- sem R8;
- sem redução de recursos.

### Preview

- APK para instalação direta;
- distribuição interna;
- sem R8;
- sem redução de recursos.

### Production

- Android App Bundle (`.aab`);
- `autoIncrement: true`;
- versão Android controlada remotamente;
- ambiente EAS `production`;
- `ENABLE_ANDROID_RELEASE_OPTIMIZATION=true`;
- R8 e redução de recursos habilitados.

## 9. R8 e otimização Android

Arquivos envolvidos:

```text
app.config.js
app.json
eas.json
package.json
package-lock.json
```

Configuração aplicada em release:

```text
enableMinifyInReleaseBuilds = true
enableShrinkResourcesInReleaseBuilds = true
```

Efeitos esperados:

- otimização e ofuscação pelo R8;
- remoção de código Java/Kotlin não utilizado;
- remoção de recursos Android não utilizados;
- geração de `mapping.txt`;
- inclusão do mapeamento no AAB para desofuscação de crashes e ANRs no Google Play.

Não adicionar regras `-keep` ou `extraProguardRules` preventivamente. Uma exceção deve ser sustentada por erro reproduzível ou falha detectada no artefato otimizado.

## 10. Validação obrigatória do build otimizado

Antes do envio ao Google Play, testar em dispositivo Android físico:

- abertura e Splash;
- catálogo inicial;
- busca textual;
- exploração somente por filtros;
- seleção de múltiplos streamings;
- detalhes de filmes e séries;
- trailers e links externos;
- Favoritos;
- Quero assistir;
- histórico;
- limpeza de dados locais;
- temas claro e escuro;
- tratamento de rede lenta, timeout e indisponibilidade;
- botão e gesto de voltar;
- rolagem vertical e horizontal;
- inicialização sem conexão.

Depois do upload, revisar o relatório de pré-lançamento, crashes, ANRs e avisos de desofuscação no Google Play.

## 11. Comandos

### Dependências

```bash
npm ci
```

### TypeScript

```bash
npm run typecheck
```

### Expo

```bash
npx expo start -c
```

### Preview Android

```bash
eas build -p android --profile preview
```

### Produção Android otimizada

```bash
eas build -p android --profile production
```

### Consultar versão Android remota

```bash
eas build:version:get -p android -e production
```

### Atualizar GitHub

```bash
git add . && git commit -m "build: habilitar R8 no Android de producao" && git push origin main
```

## 12. Política permanente para novas atualizações

1. Trabalhar sempre sobre a versão mais recente do projeto.
2. Preservar `br.app.andreflores.coruja`.
3. Preservar o projeto EAS existente.
4. Atualizar este arquivo e o `PROJECT_STRUCTURE.md` quando houver mudança funcional, estrutural, nativa ou de publicação.
5. Entregar arquivos completos, não apenas trechos.
6. Gerar um único ZIP contendo somente arquivos novos ou modificados.
7. Preservar a estrutura relativa `coruja-app/...`.
8. Informar os comandos Expo, EAS e GitHub.
9. Executar `npm ci` e `npm run typecheck` antes da entrega.
10. Validar todo build com R8 em dispositivo físico antes da produção.
11. Não incluir credenciais, chaves, `.env.local` ou `.env.preview` no pacote ou no repositório.
12. Não adicionar novas dependências ou regras ProGuard sem justificativa técnica.
