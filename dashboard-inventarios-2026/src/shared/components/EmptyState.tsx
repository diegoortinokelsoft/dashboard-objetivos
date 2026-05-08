interface EmptyStateProps {
  title?: string;
  message?: string;
}

export function EmptyState({
  title = 'Sin resultados',
  message = 'No hay filas para los filtros seleccionados.',
}: EmptyStateProps) {
  return (
    <div className="state state--empty">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}
