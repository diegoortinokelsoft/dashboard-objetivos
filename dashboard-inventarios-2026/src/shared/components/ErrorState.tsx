interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <section className="state state--error" role="alert">
      <div className="state__content">
        <strong>Error al consultar el endpoint</strong>
        <pre className="state__details">{error}</pre>
      </div>
      <button className="button button--secondary" type="button" onClick={onRetry}>
        Reintentar
      </button>
    </section>
  );
}
