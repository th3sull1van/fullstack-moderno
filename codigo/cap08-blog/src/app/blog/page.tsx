import type { Metadata } from "next";
import Link from "next/link";
import { obterTodosPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Posts",
  description: "Todos os artigos do Diário Full Stack.",
};

export const revalidate = 3600; // ISR: revalida a cada 1h sem rebuild

export default async function PaginaBlog() {
  const posts = await obterTodosPosts();

  return (
    <main className="blog__lista">
      <h1 className="blog__titulo">Posts</h1>
      <ul className="lista-posts">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>
              <span className="data">{post.data}</span>
              <h2>{post.titulo}</h2>
              <p>{post.resumo}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
