import type { NovoFilme } from "./filmes.js";

/**
 * Seed inicial da CineAPI: 20 filmes clássicos com dados reais
 * (títulos em pt-BR, diretores e anos de lançamento).
 */
export const FILMES_INICIAIS: NovoFilme[] = [
  { titulo: "O Poderoso Chefão", genero: "drama", ano: 1972, diretor: "Francis Ford Coppola", duracaoMin: 175 },
  { titulo: "O Poderoso Chefão: Parte II", genero: "drama", ano: 1974, diretor: "Francis Ford Coppola", duracaoMin: 202 },
  { titulo: "Pulp Fiction: Tempo de Violência", genero: "drama", ano: 1994, diretor: "Quentin Tarantino", duracaoMin: 154 },
  { titulo: "Matrix", genero: "ficcao-cientifica", ano: 1999, diretor: "Lana e Lilly Wachowski", duracaoMin: 136 },
  { titulo: "O Senhor dos Anéis: A Sociedade do Anel", genero: "aventura", ano: 2001, diretor: "Peter Jackson", duracaoMin: 178 },
  { titulo: "O Senhor dos Anéis: O Retorno do Rei", genero: "aventura", ano: 2003, diretor: "Peter Jackson", duracaoMin: 201 },
  { titulo: "Interestelar", genero: "ficcao-cientifica", ano: 2014, diretor: "Christopher Nolan", duracaoMin: 169 },
  { titulo: "A Origem", genero: "acao", ano: 2010, diretor: "Christopher Nolan", duracaoMin: 148 },
  { titulo: "Batman: O Cavaleiro das Trevas", genero: "acao", ano: 2008, diretor: "Christopher Nolan", duracaoMin: 152 },
  { titulo: "Cidade de Deus", genero: "drama", ano: 2002, diretor: "Fernando Meirelles", duracaoMin: 130 },
  { titulo: "Central do Brasil", genero: "drama", ano: 1998, diretor: "Walter Salles", duracaoMin: 113 },
  { titulo: "Clube da Luta", genero: "drama", ano: 1999, diretor: "David Fincher", duracaoMin: 139 },
  { titulo: "De Volta para o Futuro", genero: "ficcao-cientifica", ano: 1985, diretor: "Robert Zemeckis", duracaoMin: 116 },
  { titulo: "O Rei Leão", genero: "animacao", ano: 1994, diretor: "Roger Allers e Rob Minkoff", duracaoMin: 88 },
  { titulo: "Toy Story", genero: "animacao", ano: 1995, diretor: "John Lasseter", duracaoMin: 81 },
  { titulo: "A Viagem de Chihiro", genero: "animacao", ano: 2001, diretor: "Hayao Miyazaki", duracaoMin: 125 },
  { titulo: "Alien: O Oitavo Passageiro", genero: "terror", ano: 1979, diretor: "Ridley Scott", duracaoMin: 117 },
  { titulo: "Casablanca", genero: "romance", ano: 1942, diretor: "Michael Curtiz", duracaoMin: 102 },
  { titulo: "Tempos Modernos", genero: "comedia", ano: 1936, diretor: "Charles Chaplin", duracaoMin: 87 },
  { titulo: "2001: Uma Odisseia no Espaço", genero: "ficcao-cientifica", ano: 1968, diretor: "Stanley Kubrick", duracaoMin: 149 },
];
