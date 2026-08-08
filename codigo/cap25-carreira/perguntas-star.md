# Perguntas STAR — [Seu nome]

> Método: **S**ituação (contexto) → **T**arefa (seu papel) → **A**ção (o que
> você fez) → **R**esultado (métrica/impacto). Escreva 5 respostas, treine
> em voz alta e cronometre (1–2 min cada).

## 1. Conte sobre um problema difícil que você resolveu

- **S:** No projeto SkillHub, a listagem de serviços demorava ~3s porque
  buscava avaliações uma a uma (N+1).
- **T:** Deixar a página com < 1s sem reescrever o banco.
- **A:** Reescrevi a query com `include` único no Prisma (1 consulta com
  JOIN), adicionei paginação com `X-Total-Count` e um teste de regressão no CI.
- **R:** Listagem caiu para ~300ms (Lighthouse antes/depois); o orçamento de
  performance no CI impede a regressão.

## 2. Conte sobre um conflito ou divergência técnica

- **S:** Divergência sobre usar sessão ou JWT na autenticação.
- **T:** Decidir com critério, não por preferência.
- **A:** Comparei revogação, escala e custo; documentei a decisão (JWT
  rotativo + blacklist curta) e os trade-offs no README.
- **R:** Decisão aceita pelo time; virou o AuthHub testado contra reuso de
  token (16 testes).

## 3. Conte sobre um erro seu e o que aprendeu

- **S:** Publiquei código sem testar o caminho de erro da API.
- **T:** Corrigir e evitar recorrência.
- **A:** Adicionei testes dos status 4xx/5xx, revisei o checklist de merge e
  passei a rodar a suíte localmente antes de qualquer PR.
- **R:** Zero regressões de erro desde então; o hábito virou padrão do meu fluxo.

## 4. Conte como você lida com prazo apertado

- **S:** Entrega de um projeto com escopo maior que o previsto.
- **T:** Entregar valor real no prazo.
- **A:** Priorizei o caminho crítico (core funcionando + testes), negociei o
  restante em fases e documentei o que ficou de fora.
- **R:** Entrega no prazo com o essencial sólido; o extra entrou na fase 2.

## 5. Conte sobre quando você ensinou ou ajudou alguém

- **S:** Colega iniciante travado no fluxo de uma requisição HTTP.
- **T:** Explicar de forma que fixasse.
- **A:** Fiz um diagrama da jornada (DNS → servidor → banco → render) e
  revisamos o código juntos, com perguntas em vez de respostas prontas.
- **R:** Ele passou a resolver sozinho; percebi que ensinar é o melhor teste
  de domínio — e comecei a escrever artigos técnicos.

---

## Template em branco

**S:** *contexto (1-2 frases)*
**T:** *sua responsabilidade (1 frase)*
**A:** *o que você fez, em ordem (2-3 frases, com ferramenta)*
**R:** *resultado com número (1 frase)*
