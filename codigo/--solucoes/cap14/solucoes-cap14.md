# Soluções — Capítulo 14: Autenticação e Autorização

## Exercício 1 — Autenticação vs autorização

- **Autenticação**: *quem é você?* — provar identidade (login com e-mail +
  senha, token);
- **Autorização**: *o que você pode fazer?* — decidir permissões do usuário
  autenticado (ex.: só `admin` pode apagar).

Exemplo: fazer login é autenticação; o botão "apagar usuário" só aparecer (e
só funcionar) para `admin` é autorização.

## Exercício 2 — Hash + salt, não "criptografia" de senha

- **Criptografia** é **reversível** (com a chave, você recupera o texto) —
  se a chave vazar, todas as senhas vazam;
- **Hash** (argon2/bcrypt) é **unidirecional** — não existe "decifrar";
- **Salt** (valor aleatório por usuário) impede ataques de tabela
  pré-computada (rainbow tables) e faz senhas iguais gerarem hashes diferentes.

Portanto: nunca armazene senha "criptografada" — guarde **hash + salt**.

## Exercício 3 — Sessão vs JWT

- **Sessão**: o servidor guarda o estado (cookie com id + dados no servidor/Redis).
  ✅ revogação imediata (logout/cancelar) · ❌ estado no servidor (escala);
- **JWT**: token **autocontido e assinado** (claims embutidas), validado sem
  consultar o servidor.
  ✅ stateless (escala horizontal fácil) · ❌ revogação difícil (só por
  expiração/blacklist).

## Exercício 4 — `401` e `403` no contexto de auth

- **401**: credenciais ausentes/inválidas — o cliente precisa **se autenticar**
  (refazer login, renovar token);
- **403**: autenticado, mas **sem permissão** para aquela ação/recurso
  (ex.: usuário comum tentando acessar rota de admin).

## Exercício 5 — Por que refresh token rotativo

Cada uso do refresh token gera um **novo** refresh (e revoga o anterior).
Se um atacante rouba o refresh, o uso legítimo seguinte (ou o do atacante)
detecta a **reutilização** — e a família inteira de tokens é revogada. Isso
limita a janela de exploração: um token vazado deixa de funcionar no primeiro
uso concorrente (é o comportamento testado no AuthHub).

## Exercício 6 — Cookie `HttpOnly`

Impede que o **JavaScript do navegador** leia o cookie (`document.cookie` não
o enxerga). É a defesa principal contra **XSS roubando tokens**: mesmo que um
script malicioso rode na página, o access/refresh token no cookie HttpOnly
fica fora do alcance dele.
