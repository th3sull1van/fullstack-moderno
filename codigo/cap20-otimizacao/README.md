# cap20-otimizacao — Orçamento de performance (referência)

Implementação de referência do projeto do capítulo 20: levar o SkillHub a
**LCP ≤ 2,0s, INP ≤ 200ms e CLS ≤ 0,05**, com orçamento aplicado no CI.

## O que existe aqui

| Arquivo | Função |
|---|---|
| `lighthouserc.json` | **Orçamentos** do Lighthouse CI: falha o build se LCP > 2s, INP > 200ms, CLS > 0,05 ou JS > 350 kB |
| `.github/workflows/lighthouse.yml` | Roda o app de produção e o Lighthouse CI em **todo PR** (3 rodadas, presets desktop) |
| `budgets.json` | Orçamentos de bundle (JS inicial ≤ 300 kB) para o `next.config` |
| `medir.sh` | Medição local **antes/depois** (`.lighthouse/*.json`) com resumo em texto |

## Metodologia (o que o capítulo ensina)

1. **Meça antes** — `./medir.sh http://localhost:3000 antes` (salve o JSON);
2. **Identifique o gargalo** — no relatório: LCP vem de imagem, fonte ou
   resposta? INP de um listener pesado? CLS de imagem sem dimensão?
3. **Otimize** — `next/image` + `sizes`; fontes com `font-display: swap`;
   Server Components para reduzir JS; lazy loading; evitar N+1;
4. **Meça depois** — `./medir.sh http://localhost:3000 depois` e compare;
5. **Trave no CI** — o `lighthouserc.json` impede a regressão: PR que estoura
   o orçamento **falha** (a régua do capítulo).

## Como rodar

```bash
# medição local (requer Node + Chrome):
./medir.sh http://localhost:3000 antes

# no CI (workflow pronto para o repo do SkillHub):
# codigo/cap20-otimizacao/.github/workflows/lighthouse.yml
```

## Decisões pedagógicas

- **3 rodadas** (`numberOfRuns: 3`): medição de performance é ruidosa — a
  mediana amortece o ruído;
- **Preset desktop + throttling simulate**: mede o cenário real de rede
  (4G lento) sem depender da máquina do CI;
- **Orçamento é erro, não aviso**: performance regride em silêncio — só
  "travar o build" muda o comportamento do time.
