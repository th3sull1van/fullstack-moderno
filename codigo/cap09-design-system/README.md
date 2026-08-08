# cap09-design-system — OrçaUI

Design system do produto fictício **OrçaFácil** (cap. 3): tokens, componentes
base e uma página de documentação ("storybook caseiro") com exemplos vivos.
Construído com **Tailwind v4** — projeto do capítulo 9 (Estilização moderna e
Design Systems) do livro *Full Stack Moderno*.

## O que há dentro

**Tokens (`@theme` no `globals.css`)** — a fonte única da verdade:
- Cores de marca (`brand-*`), neutros (`neutro-*`) e semânticas
  (`sucesso`, `alerta`, `perigo`, `info`);
- Raios (`radius-sm/md/lg`), sombras (`painel`, `flutuante`), tipografia
  (`font-sans`, `font-mono`).

**Componentes (TypeScript)**:
| Componente | Variantes / estados |
|------------|---------------------|
| `Button` | 4 variantes (primário, secundário, fantasma, perigo) + hover, foco visível, `disabled`, `carregando` (spinner + `aria-busy`) |
| `Input` | Label ligada (acessível), estados normal / erro (`role=alert` + `aria-invalid`) / ajuda |
| `Card` | Superfície com sombra do token |
| `Badge` | 4 tons (info, sucesso, alerta, perigo) com contraste WCAG |
| `Modal` | `role=dialog` + `aria-modal`, fecha com `Escape`, devolve o foco ao gatilho |

**Dark mode**: classe `.dark` no `<html>` via `@custom-variant`, alternância
com persistência em `localStorage` e script inline anti-**FOUC** (sem flash de
tema errado — o desafio sênior do capítulo).

**Documentação**: página `/design-system` com cada componente em todos os
estados + vitrine de tokens.

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000/design-system
```

## Testes

```bash
npm test           # 9 testes de componente (Variantes, estados, modal)
npm run typecheck  # tsc --noEmit
npm run build      # build de produção

# Testes visuais (screenshot) — requer instalar o Chromium uma vez
npx playwright install chromium
npm run test:e2e   # screenshots claro/escuro + interação do modal
```

## Decisões de design

- **Utility-first com tokens**: nada de cor fixa fora do `@theme` — dark mode
  funciona porque as classes usam os tokens;
- **`@custom-variant dark`**: dark mode por classe (não só por
  `prefers-color-scheme`), com script inline antes da hidratação para evitar
  FOUC;
- **Componentes com variantes** em vez de repetir utilitários: `<Button
  variante="perigo">` substitui 8 classes repetidas em cada tela;
- **Acessibilidade desde o token**: `:focus-visible` global com outline de 2px
  — o teclado nunca fica invisível.

## Critérios de aceite (cap. 9)

| Critério | Status |
|----------|--------|
| Tokens completos em `@theme` (cores, tipografia, espaçamentos, raios, sombras) | ✅ |
| Button (4 variantes), Input, Card, Badge, Modal — com TS | ✅ |
| Estados: hover, foco visível, desabilitado, carregando | ✅ testado |
| Dark mode em todos os componentes | ✅ + anti-FOUC |
| Página `/design-system` com exemplos vivos | ✅ |
| Testes visuais básicos configurados (Playwright) | ✅ `e2e/visual.spec.ts` |
