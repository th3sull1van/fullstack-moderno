# Checklist — Revisão de Fontes

Revisor de fontes: confere que **cada afirmação tem base verificável** e que
a documentação oficial é a referência primária.

## Dados de mercado
- [ ] Todo número de mercado (SO Survey, Octoverse, State of JS) tem fonte oficial citada;
- [ ] Percentuais/afirmações usam aproximação honesta quando o dado é agregado;
- [ ] Datas dos levantamentos citadas (ex.: "2025", "2024");
- [ ] Nenhuma "tendência" sem fonte (redes sociais não são fonte);
- [ ] Decisão de stack justificada por dados (não por opinião).

## Conteúdo técnico
- [ ] Afirmações sobre APIs/comportamento remetem à documentação oficial;
- [ ] URLs ao final de cada capítulo apontam para a documentação oficial (não para tutoriais aleatórios);
- [ ] Versões citadas batem com `MANUTENCAO.md` e com a documentação consultada;
- [ ] Padrões (OWASP, WCAG, HTTP, REST, JWT) citam as especificações oficiais.

## Rastreabilidade
- [ ] `pesquisa/` registra as rodadas de pesquisa com data e fontes;
- [ ] `referencias.bib` está completo e sem URLs quebradas;
- [ ] Apêndice E registra versões e datas de consulta;
- [ ] Mudanças futuras (versões novas) têm caminho de atualização documentado.

## Relatório
- [ ] Para cada achado: capítulo, seção, severidade, fonte correta indicada.
