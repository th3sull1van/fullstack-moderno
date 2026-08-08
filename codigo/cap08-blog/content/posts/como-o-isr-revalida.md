---
titulo: "O que acontece quando o ISR revalida (por baixo dos panos)"
data: "2026-06-01"
resumo: "Cache stale-while-revalidate na prática: o que o servidor faz quando você define revalidate e por que o usuário nunca vê o build rodando."
---

`export const revalidate = 3600` parece mágica — mas é o padrão
**stale-while-revalidate** aplicado a páginas inteiras.

## O ciclo

1. **Build**: a página é gerada e armazenada em cache (SSG);
2. **Request dentro do TTL**: o Next serve o HTML do cache, instantâneo;
3. **Primeiro request após o TTL**: serve o HTML antigo **e** dispara a
   regeneração em segundo plano;
4. **Próximo request**: já encontra o HTML novo no cache.

O usuário nunca espera: ele recebe a versão anterior enquanto a nova é
gerada. É o mesmo princípio do cache `stale-while-revalidate` do HTTP.

<Dica>
Cuidado com o dado "quente": se o conteúdo muda a cada minuto, ISR de 1h
entrega dado velho. Para esses casos, SSR ou `revalidateTag` após mutações
(capítulo 15) são as ferramentas certas.
</Dica>

## Quando usar ISR vs `revalidateTag`

- **ISR por tempo**: conteúdo que muda em intervalos previsíveis (blog);
- **`revalidateTag`**: conteúdo que muda por ação do usuário — você avisa o
  Next *na hora* que o dado foi atualizado (produto editado no painel).

No capítulo 15 (full stack) você usa `revalidatePath` depois de cada Server
Action — o mesmo mecanismo, acionado por evento em vez de relógio.
