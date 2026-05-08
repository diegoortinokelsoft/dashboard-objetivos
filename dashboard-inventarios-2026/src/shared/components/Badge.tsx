import type { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'error' | 'warning' | 'neutral';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

export function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}
