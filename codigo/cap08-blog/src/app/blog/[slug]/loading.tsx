export default function Carregando() {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Carregando post">
      <div className="skeleton__linha skeleton__linha--curta" />
      <div className="skeleton__linha skeleton__linha--curta" />
      <div className="skeleton__linha" />
      <div className="skeleton__linha" />
      <div className="skeleton__linha skeleton__linha--curta" />
    </div>
  );
}
