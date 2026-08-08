# Soluções — Capítulo 2: HTML Semântico e Acessibilidade

## Exercício 1 — `<div>` vs `<section>`

- **`<div>`** é um contêiner genérico, sem significado. Use quando nenhuma tag
  semântica se encaixa — por exemplo, um wrapper puramente visual.
- **`<section>`** representa uma **seção temática** do documento, normalmente
  com um título próprio (`h1`–`h6`). Use para agrupar conteúdo relacionado que
  faz sentido sozinho.

Exemplo: dentro de um `<article>` de um blog, cada bloco "Destaques" /
"Histórico" é uma `<section>`; o invólucro que alinha a barra lateral via CSS
pode ser um `<div>`.

## Exercício 2 — Por que um único `<main>` e um único `<h1>`?

- **`<main>`**: marca o conteúdo principal da página. Leitores de tela oferecem
  atalho "pular para o conteúdo"; ter mais de um quebra essa navegação.
- **`<h1>`**: é o título de nível mais alto da hierarquia. Uma página com um só
  `<h1>` comunica claramente o assunto; múltiplos `<h1>` confundem leitores de
  tela e mecanismos de busca sobre a estrutura.

## Exercício 3 — Formulário de login acessível

```html
<form action="/entrar" method="post">
  <div>
    <label for="email">E-mail</label>
    <input type="email" id="email" name="email" required
           autocomplete="email" />
  </div>

  <div>
    <label for="senha">Senha</label>
    <input type="password" id="senha" name="senha" required
           autocomplete="current-password" />
  </div>

  <button type="submit">Entrar</button>
</form>
```

Pontos-chave: `label` associado via `for`/`id` em todo campo; `type="email"`
dá validação nativa; `autocomplete` correto poupa o usuário; `type="password"`
esconde a digitação; `type="submit"` explícito no botão.

## Exercício 4 — Atributo obrigatório em imagens

**`alt`** — texto alternativo. É obrigatório porque: leitores de tela anunciam
a descrição; se a imagem quebrar, o texto aparece no lugar; e o Google indexa o
conteúdo. Imagem decorativa deve ter `alt=""` (vazio), nunca `alt` ausente.

## Exercício 5 — `<fieldset>` e `<legend>`

Agrupam opções relacionadas de um formulário: `<fieldset>` cria o grupo e
`<legend>` dá o nome do grupo. Use para `radio` buttons e checkboxes
(perguntas "escolha uma/mais de uma"), porque o leitor de tela anuncia o grupo
antes de cada opção.

## Exercício 6 — Três práticas de SEO no `<head>`

1. `<title>` descritivo e único por página;
2. `<meta name="description">` com resumo atraente (até ~155 caracteres);
3. `<meta property="og:title">` e `og:description` (Open Graph) para
   compartilhamento em redes sociais — além do `lang="pt-BR"` e do charset.
