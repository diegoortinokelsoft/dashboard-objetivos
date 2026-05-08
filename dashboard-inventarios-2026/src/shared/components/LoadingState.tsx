interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = 'Consultando inventarios' }: LoadingStateProps) {
  return (
    <div className="state state--loading" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
