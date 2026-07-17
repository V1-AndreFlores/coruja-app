# Coruja — Sobre filmes e séries

Aplicativo mobile para pesquisar filmes e séries, consultar informações detalhadas e descobrir em quais plataformas de streaming cada título está disponível no Brasil.

Este repositório representa a reconstrução do aplicativo Coruja. A nova versão será publicada como atualização do cadastro existente na Google Play, mantendo o identificador Android `br.app.andreflores.coruja`.

## Objetivos

- oferecer pesquisa unificada de filmes e séries;
- exibir sinopse, duração, gêneros, elenco, equipe e trailers;
- informar onde assistir no Brasil, diferenciando assinatura, aluguel e compra;
- manter favoritos, lista “Quero assistir” e histórico local;
- disponibilizar temas claro e escuro;
- adotar arquitetura sustentável, tipagem estrita e dependências atualizadas.

## Escopo inicial

A primeira entrega contém:

- projeto Expo com TypeScript e Expo Router;
- identidade visual inicial;
- ativos para ícone Android, ícone adaptativo, favicon e Splash;
- Splash nativa e tela de Splash animada;
- tokens de cores para temas claro e escuro;
- tela inicial de validação da estrutura;
- configuração inicial do EAS Build;
- documentação da arquitetura e da estrutura de pastas.

## Stack

- Expo SDK 57;
- React Native 0.86;
- React 19;
- TypeScript 6;
- Expo Router;
- EAS Build.

O backend previsto será desenvolvido em ASP.NET Core Web API para proteger chaves externas, centralizar cache, resiliência, rate limiting e observabilidade.

## Pré-requisitos

- Node.js LTS compatível com o Expo SDK adotado;
- npm;
- Expo Go para testes iniciais ou Development Build quando houver módulos nativos específicos;
- conta Expo para builds EAS;
- Android Studio apenas quando houver necessidade de emulador ou build local.

## Instalação

Para uma instalação reproduzível a partir do `package-lock.json`:

```bash
npm ci
```

O projeto fixa o registro público do npm no arquivo `.npmrc` para impedir que URLs de registros internos ou temporários sejam reutilizadas.

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

## Builds EAS

### APK de validação

```bash
npx eas build -p android --profile preview
```

### AAB de produção

```bash
npx eas build -p android --profile production
```

Antes do primeiro build de produção, deve ser confirmado o maior `versionCode` já utilizado na Google Play e concluída a redefinição da chave de upload.

## Estrutura e decisões técnicas

A documentação detalhada está em [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md).

## Política de privacidade

URL planejada:

```text
https://v1-andreflores.github.io/politica-de-privacidade/coruja/
```

O conteúdo final será produzido após a definição das integrações e SDKs, garantindo consistência com a seção “Segurança dos dados” da Google Play.

## Repositório GitHub

Repositório planejado:

```text
https://github.com/V1-AndreFlores/coruja-app
```

## Status

Estrutura inicial concluída. As próximas etapas são o mapa de telas, a navegação principal e os contratos de integração.
