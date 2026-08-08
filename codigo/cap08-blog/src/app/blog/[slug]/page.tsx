import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { obterPost, obterTodosPosts } from "@/lib/posts";
import { Dica } from "@/components/Dica";

export const revalidate = 3600; // ISR: revalida a cada 1h

/** Pré-renderiza todos os slugs no build (SSG) — posts novos entram on-demand. */
export async function generateStaticParams() {
  const posts = await obterTodosPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

/** Metadata dinâmica por post (SEO). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await obterPost(slug);
  return {
    title: post?.titulo ?? "Post não encontrado",
    description: post?.resumo,
  };
}

/** Componentes customizados disponíveis dentro dos artigos MDX. */
const componentesMdx = { Dica };

export default async function PaginaDoPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await obterPost(slug);
  if (!post) notFound();

  return (
    <article className="artigo">
      <h1>{post.titulo}</h1>
      <p className="artigo__data">{post.data}</p>
      <div className="artigo__corpo">
        <MDXRemote source={post.conteudo} components={componentesMdx} />
      </div>
    </article>
  );
}
