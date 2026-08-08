# Soluções — Capítulo 9: Estilização e Design Systems

## Exercício 1 — CSS Modules, CSS-in-JS e utility-first

- **CSS Modules**: escopo por arquivo, sem colisão de nomes. ✅ colisão zero ·
  ❌ repetição entre componentes;
- **CSS-in-JS** (styled-components, vanilla-extract): estilos co-localizados e
  dinâmicos. ✅ theming dinâmico · ❌ custo de runtime/JS no bundle;
- **Utility-first** (Tailwind): classes atômicas no markup. ✅ consistência e
  velocidade · ❌ HTML verboso se não houver extração de componentes.

## Exercício 2 — Diretiva `@theme`

```css
@import "tailwindcss";

@theme {
  --color-primaria: #1F4E79;
  --color-secundaria: #2E86AB;
  --color-acento: #C0392B;
  --radius-pequeno: 6px;
  --radius-grande: 16px;
}
```
Cada token vira uma utility: `bg-primaria`, `rounded-grande`.

## Exercício 3 — Botão responsivo com Tailwind

```tsx
<button className="mx-auto flex items-center gap-2 rounded-lg bg-primaria
                   px-4 py-2 text-white hover:bg-secundaria md:px-6 md:py-3">
  Confirmar
</button>
```
`mx-auto` centraliza (com `flex` no pai), `md:` aumenta o padding em telas
médias+, `hover:` troca a cor.

## Exercício 4 — `group-hover` e `focus-visible`

- **`group-hover`**: aplica estilo a um **filho** quando o **pai** (marcado com
  `group`) recebe hover — ex.: card inteiro clicável que revela o botão;
- **`focus-visible`**: estiliza só quando o foco vem do **teclado** (Tab), não
  do clique — essencial para anéis de foco acessíveis sem poluir o clique.

## Exercício 5 — Três camadas de um design system

1. **Tokens** — decisões primitivas: cores, espaçamento, raio, tipografia;
2. **Componentes** — primitivos de UI: `Button`, `Input`, `Card`, `Modal`
   (as variantes do OrçaUI);
3. **Padrões/composições** — combinações guiadas: um formulário de login, uma
   página de listagem com estados (vazio/carregando/erro).

## Exercício 6 — Por que extrair componentes com variantes?

Repetir utilitários em 20 lugares espalha a decisão de estilo e torna a
mudança um "caça ao Ctrl+F". Com um componente `Button` que centraliza
variantes (`primary`, `ghost`, `danger`, `loading`), uma alteração de design
acontece **em um só arquivo** — consistência garantida e refactor barato.
