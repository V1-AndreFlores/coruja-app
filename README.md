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

## Estado atual

A base visual e estrutural contém:

- Splash nativa e tela de Splash com duração mínima de três segundos;
- navegação principal por abas: Início, Buscar, Quero assistir, Favoritos e Ajustes;
- tema escuro como padrão inicial;
- seleção e persistência dos temas claro e escuro;
- componentes reutilizáveis para cabeçalho, títulos, cartões, busca e estados de tela;
- telas iniciais sem dependência de API externa;
- estados reutilizáveis de carregamento, vazio e erro;
- contratos e repositórios locais preparados para favoritos, lista Quero assistir e histórico;
- configuração inicial do EAS Build;
- documentação da arquitetura e da estrutura de pastas.

## Stack

- Expo SDK 57;
- React Native 0.86;
- React 19;
- TypeScript 6;
- Expo Router;
- Expo Symbols;
- AsyncStorage;
- EAS Build.

O backend previsto será desenvolvido em ASP.NET Core Web API para proteger chaves externas, centralizar cache, resiliência, rate limiting e observabilidade.

## Pré-requisitos

- Node.js LTS compatível com o Expo SDK adotado;
- npm;
- Expo Go para testes iniciais ou Development Build quando houver módulos nativos específicos;
- conta Expo para builds EAS;
- Android Studio apenas quando houver necessidade de emulador ou build local.

## Instalação

Após receber uma entrega que altera dependências, execute:

```bash
npm install
```

O projeto fixa o registro público do npm no arquivo `.npmrc`.

Nas execuções seguintes, quando `package.json` e `package-lock.json` já estiverem sincronizados, também pode ser usado:

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

A Splash é a rota inicial e direciona para `/(tabs)/inicio` somente depois da hidratação das preferências locais e da duração mínima configurada.

## Persistência local

As preferências de tema são persistidas com AsyncStorage. A mesma infraestrutura contém os contratos iniciais para:

- favoritos;
- lista Quero assistir;
- histórico de visualizações.

Nenhum desses dados exige login e, nesta etapa, permanece somente no aparelho.

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

```text
https://github.com/V1-AndreFlores/coruja-app
```

## Próximas etapas

1. definir contratos HTTP do catálogo;
2. criar o backend ASP.NET Core;
3. integrar tendências, pesquisa e detalhes;
4. ativar favoritos, lista Quero assistir e histórico nas telas;
5. implementar testes automatizados;
6. preparar política de privacidade e publicação.
