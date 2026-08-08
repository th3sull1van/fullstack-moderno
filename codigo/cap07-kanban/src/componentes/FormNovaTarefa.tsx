import { useState, type FormEvent } from "react";

type Props = {
  aoCriar: (titulo: string) => void;
};

const MINIMO = 3;

export function FormNovaTarefa({ aoCriar }: Props) {
  const [titulo, setTitulo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function enviar(evento: FormEvent) {
    evento.preventDefault();
    const limpo = titulo.trim();
    if (limpo.length < MINIMO) {
      setErro(`A tarefa precisa de pelo menos ${MINIMO} caracteres.`);
      return;
    }
    aoCriar(limpo);
    setTitulo("");
    setErro(null);
  }

  return (
    <form className="form" onSubmit={enviar} noValidate>
      <label className="form__rotulo" htmlFor="nova-tarefa">
        Nova tarefa
      </label>
      <div className="form__linha">
        <input
          id="nova-tarefa"
          className="form__campo"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ex.: Revisar pull request"
          aria-describedby={erro ? "erro-nova-tarefa" : undefined}
          aria-invalid={erro !== null}
        />
        <button type="submit" className="form__botao">
          Adicionar
        </button>
      </div>
      {erro && (
        <p id="erro-nova-tarefa" className="form__erro" role="alert">
          {erro}
        </p>
      )}
    </form>
  );
}
