import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ModalExemplo } from "@/components/ModalExemplo";

export const metadata: Metadata = {
  title: "Componentes · OrçaUI",
};

function Secao({ titulo, descricao, children }: { titulo: string; descricao: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">{titulo}</h2>
        <p className="text-sm text-neutro-500 dark:text-neutro-400">{descricao}</p>
      </div>
      {children}
    </section>
  );
}

function Vitrine({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-4 rounded-lg border border-dashed border-neutro-200 bg-neutro-50 p-6 dark:border-neutro-700 dark:bg-neutro-900/60 ${className}`}
    >
      {children}
    </div>
  );
}

export default function PaginaDesignSystem() {
  return (
    <main className="mx-auto max-w-4xl space-y-12 px-6 py-10">
      <header>
        <h1 className="font-mono text-3xl font-bold tracking-tight">
          orça<span className="text-brand-500">ui</span>
        </h1>
        <p className="mt-2 max-w-2xl text-neutro-500 dark:text-neutro-400">
          O storybook caseiro do OrçaFácil: tokens + componentes base com todos
          os estados. Alterne o tema no topo — todos os componentes respondem ao
          dark mode.
        </p>
      </header>

      <Secao titulo="Button" descricao="4 variantes + estados de hover, foco visível, desabilitado e carregando.">
        <Vitrine>
          <Button>Primário</Button>
          <Button variante="secundario">Secundário</Button>
          <Button variante="fantasma">Fantasma</Button>
          <Button variante="perigo">Perigo</Button>
          <Button disabled>Desabilitado</Button>
          <Button carregando>Enviar</Button>
        </Vitrine>
      </Secao>

      <Secao titulo="Input" descricao="Label sempre ligada (acessível), estados normal, erro e ajuda.">
        <Vitrine className="flex-col items-stretch gap-6">
          <Input label="E-mail" type="email" placeholder="voce@exemplo.com" />
          <Input
            label="CEP"
            placeholder="00000-000"
            ajuda="Formato 00000-000 — usado no formulário do OrçaFácil."
          />
          <Input label="CNPJ" placeholder="00.000.000/0000-00" erro="CNPJ inválido." />
        </Vitrine>
      </Secao>

      <Secao titulo="Badge" descricao="4 tons semânticos (info, sucesso, alerta, perigo).">
        <Vitrine>
          <Badge tom="info">Info</Badge>
          <Badge tom="sucesso">Sucesso</Badge>
          <Badge tom="alerta">Alerta</Badge>
          <Badge tom="perigo">Perigo</Badge>
        </Vitrine>
      </Secao>

      <Secao titulo="Card" descricao="Superfície padrão com sombra do token.">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card titulo="Orçamento pendente">
            <div className="space-y-2">
              <p className="text-sm text-neutro-500 dark:text-neutro-400">
                Orçamento #2041 · reforma de banheiro
              </p>
              <p className="text-2xl font-bold">R$ 8.450,00</p>
              <Badge tom="alerta">Aguardando resposta</Badge>
            </div>
          </Card>
          <Card titulo="Orçamento aprovado">
            <div className="space-y-2">
              <p className="text-sm text-neutro-500 dark:text-neutro-400">
                Orçamento #2038 · pintura externa
              </p>
              <p className="text-2xl font-bold">R$ 3.200,00</p>
              <Badge tom="sucesso">Aprovado</Badge>
            </div>
          </Card>
        </div>
      </Secao>

      <Secao titulo="Modal" descricao="role=dialog + aria-modal, fecha com Escape e devolve o foco.">
        <Vitrine>
          <ModalExemplo />
        </Vitrine>
      </Secao>

      <Secao titulo="Tokens" descricao="Definidos em @theme — cores, raios, sombras e tipografia.">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[
            ["brand-500", "bg-brand-500"],
            ["brand-600", "bg-brand-600"],
            ["neutro-100", "bg-neutro-100"],
            ["neutro-900", "bg-neutro-900"],
            ["sucesso", "bg-sucesso"],
            ["perigo", "bg-perigo"],
          ].map(([nome, classe]) => (
            <div key={nome} className="space-y-1">
              <div className={`h-10 rounded-md ${classe} border border-black/10`} />
              <p className="text-center font-mono text-xs text-neutro-500">{nome}</p>
            </div>
          ))}
        </div>
      </Secao>
    </main>
  );
}
