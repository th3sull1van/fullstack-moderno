# Soluções — Capítulo 5: Git, GitHub e Colaboração

## Exercício 1 — Working directory, staging area e repositório

- **Working directory**: seus arquivos no disco, como estão agora (com edições);
- **Staging area** (index): a "área de preparação" — o que você *marcou* para
  entrar no próximo commit (`git add`);
- **Repositório**: o histórico de commits já gravado (`git commit`).

Fluxo mental: você edita → `git add` move para o staging → `git commit` grava
no repositório.

## Exercício 2 — `git status`

Mostra o estado do working tree: arquivos modificados, staged e untracked.
Usar com frequência responde a pergunta mais importante do dia: **"o que
mudou desde a última vez que eu olhei?"** — antes de qualquer commit, merge
ou rebase, um `git status` evita surpresas.

## Exercício 3 — Mensagem de commit (Conventional Commits)

```
fix(carrinho): corrige cálculo do total com frete grátis

O total era recalculado sem considerar o desconto aplicado
quando o frete era grátis. Adiciona teste de regressão.
```
Estrutura: `tipo(escopo): resumo` + corpo explicando o *porquê*.

## Exercício 4 — Conflito de merge

Quando duas branches alteram **as mesmas linhas**, o Git não sabe qual versão
prevalecer e marca o conflito no arquivo (`<<<<<<<`, `=======`, `>>>>>>>`).
Resolução:
1. `git status` para ver os arquivos em conflito;
2. abra o arquivo e decida: manter a sua versão, a da outra branch, ou combinar;
3. remova os marcadores de conflito;
4. `git add arquivo` e finalize o merge (`git commit` ou `git merge --continue`).
Regra: **entenda as duas versões antes de escolher** — não aceite cegamente.

## Exercício 5 — Fluxo completo até o GitHub

```bash
git init                    # 1. cria o repositório local
git add .                   # 2. marca os arquivos
git commit -m "feat: primeiro commit"  # 3. grava no histórico
git branch -M main          # 4. nomeia a branch principal
git remote add origin https://github.com/usuario/repo.git  # 5. aponta o remoto
git push -u origin main     # 6. envia e define o rastreamento
```
Nas próximas mudanças: edite → `git add` → `git commit` → `git push`.
