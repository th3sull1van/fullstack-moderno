# Soluções — Capítulo 20: Performance Web

## Exercício 1 — Core Web Vitals e alvos

- **LCP** (Largest Contentful Paint): quando o maior conteúdo visível carrega.
  Alvo: **≤ 2,5s**;
- **INP** (Interaction to Next Paint): latência das interações.
  Alvo: **≤ 200ms**;
- **CLS** (Cumulative Layout Shift): saltos de layout inesperados.
  Alvo: **≤ 0,1**.

São os três sinais que o Google usa como ranking e a régua do capítulo.

## Exercício 2 — `next/image` vs `<img>`

O `next/image` otimiza automaticamente: **formato moderno** (WebP/AVIF),
**tamanho certo** por viewport (`sizes`), **lazy loading** por padrão,
`width`/`height` **reservados** (evita CLS) e **cache/CDN**. Um `<img>` cru
envia a imagem original em tamanho cheio — bytes e layout desnecessários.

## Exercício 3 — Três causas de CLS e a correção

1. **Imagem sem dimensões** → reserve `width`/`height` (ou `aspect-ratio`);
2. **Injeção de conteúdo acima** (banner, anúncio, fonte tardia) → reserve o
   espaço ou use `font-display: swap` com espaço pré-reservado;
3. **Transições que mudam layout** (animar `margin`/`width`) → anime
   `transform`/`opacity`, que não deslocam o resto.

## Exercício 4 — N+1 e por que destrói APIs

N+1 = 1 query para listar N itens + 1 query por item para a relação: **N+1
round-trips ao banco**. Com 100 serviços e 3 relações, são centenas de
queries por requisição — latência que multiplica com o uso. Corrige com
**JOIN/eager loading** (`include` no Prisma, `JOIN` no SQL) e **paginação**.

## Exercício 5 — `font-display: swap`

Durante o carregamento da fonte, o navegador mostra o texto com a **fonte
fallback** e troca quando a custom chega — em vez de deixar o texto
**invisível** (FOIT, *flash of invisible text*). O custo é um leve FOIT/FOUT;
o benefício é o texto legível imediatamente (melhor LCP e percepção).
