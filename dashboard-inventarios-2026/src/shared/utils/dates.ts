export interface MonthOption {
  value: number;
  label: string;
}

export type DateFilterMode = 'month' | 'range';

export interface DateFilterValue {
  mode: DateFilterMode;
  month: number;
  from: string;
  to: string;
}

export const MONTH_OPTIONS: MonthOption[] = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' },
];

export function getCurrentMonthNumber(): number {
  return new Date().getMonth() + 1;
}

export function createDefaultDateFilter(): DateFilterValue {
  return {
    mode: 'month',
    month: getCurrentMonthNumber(),
    from: '',
    to: '',
  };
}

export function getDateFilterValidationMessage(value: DateFilterValue): string | null {
  if (value.mode !== 'range') {
    return null;
  }

  if (!value.from || !value.to) {
    return 'Completa desde y hasta para aplicar el rango.';
  }

  if (value.from > value.to) {
    return 'El rango no se aplica porque desde es mayor que hasta.';
  }

  return null;
}

export function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Sin consulta';
  }

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}
