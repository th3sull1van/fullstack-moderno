# Soluções — Capítulo 1: O Universo Full Stack e o Mercado

> Tente resolver antes de conferir. Estas respostas são um *gabarito comentado*:
> o valor está na explicação, não só na resposta final.

## Exercício 1 — Frontend, backend e full stack

- **Frontend**: tudo que roda no navegador e com o qual o usuário interage — HTML
  (estrutura), CSS (aparência) e JavaScript (comportamento). Responsável por
  *apresentar* dados e capturar ações do usuário.
- **Backend**: tudo que roda no servidor — lógica de negócio, acesso a banco de
  dados, autenticação, integrações. Responsável por *processar* e *persistir*.
- **Full stack**: quem transita pelos dois mundos e, no sentido moderno, também
  por infraestrutura (banco, deploy, CI/CD). Não é "saber 100% de tudo", é
  **entender o sistema inteiro** e entregar ponta a ponta.

## Exercício 2 — Três tecnologias mais usadas (Stack Overflow 2025)

Conforme a pesquisa oficial (pesquisa/00-mercado-fonte-primaria.md):
1. **JavaScript** — linguagem mais usada (fonte: Stack Overflow Developer Survey 2025);
2. **React** — framework/tecnologia web mais usada (mesma pesquisa);
3. **PostgreSQL** — banco de dados nº 1, superando o MySQL (mesma pesquisa).

Regra de ouro ao citar dados de mercado: **sempre acompanhe a fonte oficial e a
data** — números de pesquisa envelhecem rápido.

## Exercício 3 — Caminho de uma requisição HTTP

1. **DNS**: o navegador resolve o domínio (`exemplo.com`) em um IP;
2. **TCP/TLS**: abre conexão segura com o servidor (handshake);
3. **Requisição**: envia `GET /` com headers (cookies, user-agent...);
4. **Servidor**: processa — roteia, consulta banco, monta a resposta;
5. **Resposta**: volta com status (`200`), headers (`Content-Type`) e corpo (HTML);
6. **Renderização**: o navegador faz *parse* do HTML, baixa CSS/JS/imagens,
   monta a árvore DOM e pinta a página (é por isso que ordem e tamanho dos
   assets importam — tema do capítulo 20).

## Exercício 4 — Aba Rede do DevTools

Mostra **cada requisição** feita pela página: URL, método, status HTTP, tipo,
tamanho e tempo. É útil para:
- ver se algo falhou (status 4xx/5xx) ou demorou demais (timing);
- conferir o que o servidor realmente devolveu (response);
- diagnosticar "por que a página não carrega?" em segundos.
É a primeira ferramenta de debugging de qualquer full stack.

## Exercício 5 — Marco do Octoverse 2025

O relatório do GitHub registrou, pela primeira vez, o **TypeScript como a
linguagem mais popular do GitHub**, ultrapassando Python e JavaScript. Isso
importa para a sua escolha porque indica para onde o mercado caminha: código
tipado, com segurança em escala — exatamente a stack escolhida por este livro.

## Exercício 6 — Página HTML mínima

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Minha primeira página</title>
  </head>
  <body>
    <h1>Olá, mundo!</h1>
    <p>Este é meu primeiro parágrafo validado.</p>
    <img src="foto.jpg" alt="Uma foto minha" width="200" height="150" />
  </body>
</html>
```

Salve como `index.html`, abra no navegador e cole o conteúdo em
https://validator.w3.org — o objetivo é **zero erros**. Se o validador reclamar
de `alt` ou `lang`, você já sabe o motivo: são os mesmos atributos do capítulo 2.
