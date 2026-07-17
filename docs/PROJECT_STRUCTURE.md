# Estrutura e arquitetura do projeto

## Objetivo

Este documento registra a estrutura inicial, as fronteiras arquiteturais e as decisões técnicas do aplicativo **Coruja — Sobre filmes e séries**.

## Arquitetura

O projeto utiliza uma **Clean Architecture adaptada para React Native**, sem introduzir abstrações antes de existir uma necessidade concreta. As dependências devem apontar para dentro:

- `domain`: tipos, entidades e regras de negócio independentes de framework;
- `application`: casos de uso e contratos de portas;
- `infrastructure`: implementações de armazenamento, HTTP, cache e integrações;
- `presentation`: telas, componentes e gerenciamento de estado da interface;
- `app`: composição e roteamento com Expo Router;
- `shared`: constantes e utilitários realmente transversais.

## Estrutura atual

```text
coruja-app/
├── assets/
│   └── images/
│       ├── android-icon-background.png
│       ├── android-icon-foreground.png
│       ├── android-icon-monochrome.png
│       ├── favicon.png
│       ├── icon.png
│       ├── logo-dark.png
│       ├── logo-light.png
│       ├── splash-icon.png
│       └── splash.png
├── docs/
│   └── PROJECT_STRUCTURE.md
├── src/
│   ├── app/
│   │   ├── _layout.tsx
│   │   ├── +not-found.tsx
│   │   ├── home.tsx
│   │   └── index.tsx
│   ├── application/
│   ├── domain/
│   │   └── models/
│   │       └── AppThemeMode.ts
│   ├── infrastructure/
│   ├── presentation/
│   │   ├── components/
│   │   ├── screens/
│   │   └── theme/
│   └── shared/
│       └── constants/
├── .editorconfig
├── .gitignore
├── app.json
├── eas.json
├── package.json
├── README.md
└── tsconfig.json
```

## Identidade visual

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

## Decisões iniciais

1. O pacote Android permanece `br.app.andreflores.coruja` para permitir atualização do app existente na Google Play.
2. O projeto inicia em Expo SDK 57, React Native 0.86 e TypeScript 6.
3. A Nova Arquitetura do React Native permanece habilitada.
4. A Splash nativa e a Splash controlada pela aplicação usam a mesma identidade para evitar transição visual abrupta.
5. O tema segue o sistema inicialmente e pode ser alternado na sessão. A persistência será incluída junto da camada de armazenamento local.
6. O `versionCode` inicial foi reservado como `100`, mas deve ser conferido contra o maior código já publicado antes do primeiro AAB de produção.
7. O backend ASP.NET Core será introduzido em uma etapa posterior para proteger credenciais e centralizar cache, limites e integrações externas.

## Próximas etapas técnicas

1. Definir navegação principal e mapa de telas.
2. Criar contratos de consulta de filmes e séries.
3. Definir integração com TMDB e provedores de streaming.
4. Criar camada de persistência local para favoritos, histórico e preferências.
5. Implementar política de privacidade específica.
6. Configurar EAS, nova chave de upload e redefinição na Play Console.
7. Validar target API e compatibilidade com páginas de memória de 16 KB no AAB.
