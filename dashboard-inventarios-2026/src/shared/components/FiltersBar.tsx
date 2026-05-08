import type { ReactNode } from 'react';

interface FiltersBarProps {
  children: ReactNode;
  actions?: ReactNode;
}

export function FiltersBar({ children, actions }: FiltersBarProps) {
  return (
    <section className="filters-bar" aria-label="Filtros">
      <div className="filters-bar__controls">{children}</div>
      {actions ? <div className="filters-bar__actions">{actions}</div> : null}
    </section>
  );
}
