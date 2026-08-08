import { PrismaClient } from "@prisma/client";
import { normalizar } from "../src/lib/normalizar.js";

const prisma = new PrismaClient();

/** Livros clássicos da computação e da literatura (títulos reais). */
const AUTORES = [
  {
    nome: "Donald Knuth",
    nacionalidade: "Estados Unidos",
    livros: [
      { titulo: "The Art of Computer Programming, Vol. 1", ano: 1968, isbn: "978-0201896831" },
      { titulo: "The Art of Computer Programming, Vol. 2", ano: 1969, isbn: "978-0201896848" },
      { titulo: "The Art of Computer Programming, Vol. 3", ano: 1973, isbn: "978-0201896855" },
    ],
  },
  {
    nome: "Martin Fowler",
    nacionalidade: "Inglaterra",
    livros: [
      { titulo: "Refactoring: Improving the Design of Existing Code", ano: 1999, isbn: "978-0134757599" },
      { titulo: "Patterns of Enterprise Application Architecture", ano: 2002, isbn: "978-0321127426" },
      { titulo: "UML Distilled", ano: 2003, isbn: "978-0321193681" },
    ],
  },
  {
    nome: "Robert C. Martin",
    nacionalidade: "Estados Unidos",
    livros: [
      { titulo: "Clean Code", ano: 2008, isbn: "978-0132350884" },
      { titulo: "Clean Architecture", ano: 2017, isbn: "978-0134494166" },
      { titulo: "Agile Software Development: Principles, Patterns, and Practices", ano: 2002, isbn: "978-0135974445" },
    ],
  },
  {
    nome: "Eric Evans",
    nacionalidade: "Estados Unidos",
    livros: [
      { titulo: "Domain-Driven Design", ano: 2003, isbn: "978-0321125217" },
      { titulo: "Implementing Domain-Driven Design", ano: 2013, isbn: "978-0321834577" },
      { titulo: "Domain-Driven Design Reference", ano: 2014, isbn: "978-0321984845" },
    ],
  },
  {
    nome: "Andrew Hunt",
    nacionalidade: "Estados Unidos",
    livros: [
      { titulo: "The Pragmatic Programmer", ano: 1999, isbn: "978-0201616224" },
      { titulo: "Pragmatic Thinking and Learning", ano: 2008, isbn: "978-1934356050" },
      { titulo: "Programming Ruby", ano: 2000, isbn: "978-0201710892" },
    ],
  },
  {
    nome: "Machado de Assis",
    nacionalidade: "Brasil",
    livros: [
      { titulo: "Dom Casmurro", ano: 1899, isbn: "978-8594318356" },
      { titulo: "Memórias Póstumas de Brás Cubas", ano: 1881, isbn: "978-8594318028" },
      { titulo: "Quincas Borba", ano: 1891, isbn: "978-8594318097" },
    ],
  },
  {
    nome: "Clarice Lispector",
    nacionalidade: "Brasil",
    livros: [
      { titulo: "A Hora da Estrela", ano: 1977, isbn: "978-8520923089" },
      { titulo: "Água Viva", ano: 1973, isbn: "978-8520931114" },
      { titulo: "Perto do Coração Selvagem", ano: 1943, isbn: "978-8520933866" },
    ],
  },
  {
    nome: "Jorge Amado",
    nacionalidade: "Brasil",
    livros: [
      { titulo: "Gabriela, Cravo e Canela", ano: 1958, isbn: "978-8535914287" },
      { titulo: "Dona Flor e Seus Dois Maridos", ano: 1966, isbn: "978-8535910159" },
      { titulo: "Capitães da Areia", ano: 1937, isbn: "978-8535910142" },
    ],
  },
  {
    nome: "Guimarães Rosa",
    nacionalidade: "Brasil",
    livros: [
      { titulo: "Grande Sertão: Veredas", ano: 1956, isbn: "978-8520923256" },
      { titulo: "Sagarana", ano: 1946, isbn: "978-8520918931" },
      { titulo: "Primeiras Estórias", ano: 1962, isbn: "978-8520922792" },
    ],
  },
  {
    nome: "Carlos Drummond de Andrade",
    nacionalidade: "Brasil",
    livros: [
      { titulo: "A Rosa do Povo", ano: 1945, isbn: "978-8535914805" },
      { titulo: "Sentimento do Mundo", ano: 1940, isbn: "978-8535911330" },
      { titulo: "Alguma Poesia", ano: 1930, isbn: "978-8535914300" },
    ],
  },
];

const LEITORES = [
  { nome: "Beatriz Lima", email: "beatriz@leitor.dev" },
  { nome: "Carlos Mendes", email: "carlos@leitor.dev" },
  { nome: "Diana Rocha", email: "diana@leitor.dev" },
  { nome: "Eduardo Prado", email: "eduardo@leitor.dev" },
];

// Seed idempotente: roda N vezes sem duplicar (upsert por ISBN/e-mail).
let autores = 0;
let livros = 0;

for (const autor of AUTORES) {
  await prisma.autor.upsert({
    where: { id: `autor-${normalizar(autor.nome)}` },
    update: {},
    create: {
      id: `autor-${normalizar(autor.nome)}`,
      nome: autor.nome,
      nomeNormalizado: normalizar(autor.nome),
      nacionalidade: autor.nacionalidade,
    },
  });
  autores += 1;

  for (const livro of autor.livros) {
    await prisma.livro.upsert({
      where: { isbn: livro.isbn },
      update: {},
      create: {
        titulo: livro.titulo,
        tituloNormalizado: normalizar(livro.titulo),
        anoPublicacao: livro.ano,
        isbn: livro.isbn,
        autorId: `autor-${normalizar(autor.nome)}`,
      },
    });
    livros += 1;
  }
}

for (const leitor of LEITORES) {
  await prisma.leitor.upsert({
    where: { email: leitor.email },
    update: {},
    create: leitor,
  });
}

console.log(`✔ seed: ${autores} autores, ${livros} livros, ${LEITORES.length} leitores`);
await prisma.$disconnect();
