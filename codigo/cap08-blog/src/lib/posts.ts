import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import matter from "gray-matter";

export type Post = {
  slug: string;
  titulo: string;
  data: string; // ISO yyyy-mm-dd
  resumo: string;
  conteudo: string; // markdown/mdx bruto (sem frontmatter)
};

const DIRETORIO_POSTS = join(process.cwd(), "content", "posts");

/** Slug a partir do nome do arquivo (ex.: "hello-world.mdx" → "hello-world"). */
export function slugDeArquivo(nome: string): string {
  return nome.replace(/\.mdx?$/, "");
}

function validarPost(slug: string, frontmatter: Record<string, unknown>): Post {
  const titulo = typeof frontmatter.titulo === "string" ? frontmatter.titulo : slug;
  const data = typeof frontmatter.data === "string" ? frontmatter.data : "1970-01-01";
  const resumo =
    typeof frontmatter.resumo === "string" ? frontmatter.resumo : "";
  return { slug, titulo, data, resumo, conteudo: "" };
}

/** Lê um arquivo MDX e devolve o post com frontmatter parseado. */
export async function lerPost(slug: string): Promise<Post | null> {
  // Aceita tanto .mdx (MDX com componentes) quanto .md (Markdown puro)
  for (const extensao of [".mdx", ".md"]) {
    try {
      const bruto = await readFile(join(DIRETORIO_POSTS, `${slug}${extensao}`), "utf8");
      const { data, content } = matter(bruto);
      return { ...validarPost(slug, data), conteudo: content };
    } catch {
      // tenta a próxima extensão
    }
  }
  return null; // arquivo não existe em nenhuma extensão
}

/** Lista todos os posts ordenados do mais recente para o mais antigo. */
export async function obterTodosPosts(): Promise<Post[]> {
  const arquivos = await readdir(DIRETORIO_POSTS);
  const slugs = arquivos
    .filter((a) => /\.mdx?$/.test(a))
    .map(slugDeArquivo)
    .sort();

  const posts = await Promise.all(slugs.map(lerPost));
  return posts
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (a.data < b.data ? 1 : -1));
}

/** Busca um post por slug (para a rota dinâmica). */
export async function obterPost(slug: string): Promise<Post | null> {
  return lerPost(slug);
}

export const DIRETORIO = DIRETORIO_POSTS;
