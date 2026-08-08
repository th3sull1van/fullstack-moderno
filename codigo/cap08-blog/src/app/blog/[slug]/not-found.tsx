import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <main className="artigo">
      <h1>404 — Post não encontrado</h1>
      <p>O endereço pode ter mudado ou o post ainda não foi publicado.</p>
      <p>
        <Link href="/blog">← Voltar para todos os posts</Link>
      </p>
    </main>
  );
}
