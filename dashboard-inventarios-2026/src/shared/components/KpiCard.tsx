import type { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  helpText?: string;
}

export function KpiCard({ label, value, helpText }: KpiCardProps) {
  return (
    <article className="kpi-card">
      <span className="kpi-card__label">{label}</span>
      <strong className="kpi-card__value">{value}</strong>
      {helpText ? <span className="kpi-card__help">{helpText}</span> : null}
    </article>
  );
}
