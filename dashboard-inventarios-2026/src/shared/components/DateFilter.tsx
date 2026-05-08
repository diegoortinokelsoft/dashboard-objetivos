import { useEffect, useId, useRef, useState } from 'react';
import {
  getCurrentMonthNumber,
  getDateFilterValidationMessage,
  MONTH_OPTIONS,
  type DateFilterMode,
  type DateFilterValue,
} from '../utils/dates';

interface DateFilterProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
}

const MONTH_SHORT_LABELS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const CURRENT_YEAR = new Date().getFullYear();

function formatIsoDateForDisplay(value: string): string {
  const [year, month, day] = value.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
}

function formatDateFilterLabel(value: DateFilterValue): string {
  if (value.mode === 'month') {
    return `${MONTH_SHORT_LABELS[value.month - 1] ?? 'Mes'} ${CURRENT_YEAR}`;
  }

  if (value.from && value.to) {
    return `${formatIsoDateForDisplay(value.from)}\u2013${formatIsoDateForDisplay(value.to)}`;
  }

  return 'Seleccionar rango';
}

function isValidRange(from: string, to: string): boolean {
  return Boolean(from && to && from <= to);
}

export function DateFilter({ value, onChange }: DateFilterProps) {
  const [open, setOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<DateFilterMode>(value.mode);
  const [draftMonth, setDraftMonth] = useState(value.month || getCurrentMonthNumber());
  const [draftFrom, setDraftFrom] = useState(value.from);
  const [draftTo, setDraftTo] = useState(value.to);
  const [panelAlign, setPanelAlign] = useState<'left' | 'right'>('left');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();
  const label = formatDateFilterLabel(value);
  const draftValidationMessage = getDateFilterValidationMessage({
    mode: 'range',
    month: draftMonth,
    from: draftFrom,
    to: draftTo,
  });

  useEffect(() => {
    if (open) {
      return undefined;
    }

    setActiveMode(value.mode);
    setDraftMonth(value.month || getCurrentMonthNumber());
    setDraftFrom(value.from);
    setDraftTo(value.to);

    return undefined;
  }, [open, value.from, value.mode, value.month, value.to]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function updatePanelAlign(): void {
      const rootRect = rootRef.current?.getBoundingClientRect();
      const panelWidth = panelRef.current?.offsetWidth ?? 420;

      if (!rootRect) {
        return;
      }

      setPanelAlign(rootRect.left + panelWidth > window.innerWidth - 16 ? 'right' : 'left');
    }

    updatePanelAlign();
    window.addEventListener('resize', updatePanelAlign);
    return () => window.removeEventListener('resize', updatePanelAlign);
  }, [open]);

  function openPanel(): void {
    setActiveMode(value.mode);
    setDraftMonth(value.month || getCurrentMonthNumber());
    setDraftFrom(value.from);
    setDraftTo(value.to);
    setOpen((current) => !current);
  }

  function handleModeChange(mode: DateFilterMode): void {
    if (activeMode === mode) {
      return;
    }

    const nextMonth = mode === 'month' ? draftMonth || value.month || getCurrentMonthNumber() : getCurrentMonthNumber();

    setActiveMode(mode);
    setDraftMonth(nextMonth);
    setDraftFrom('');
    setDraftTo('');
    onChange({
      mode,
      month: nextMonth,
      from: '',
      to: '',
    });
  }

  function handleMonthChange(nextMonth: number): void {
    setDraftMonth(nextMonth);
    onChange({
      mode: 'month',
      month: nextMonth,
      from: '',
      to: '',
    });
    setOpen(false);
  }

  function handleRangeConfirm(): void {
    if (!isValidRange(draftFrom, draftTo)) {
      return;
    }

    onChange({
      mode: 'range',
      month: getCurrentMonthNumber(),
      from: draftFrom,
      to: draftTo,
    });
    setOpen(false);
  }

  return (
    <div className="date-filter" ref={rootRef}>
      <span className="field__label">Fecha</span>
      <button
        className="date-filter__trigger"
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={openPanel}
      >
        <span className="date-filter__value">{label}</span>
        <span className="date-filter__chevron" aria-hidden="true" />
      </button>

      {open ? (
        <div
          className={`date-filter__panel date-filter__panel--${panelAlign}`}
          id={panelId}
          ref={panelRef}
        >
          <div className="date-filter__tabs" role="tablist" aria-label="Modo de fecha">
            <button
              className={`date-filter__tab${activeMode === 'month' ? ' date-filter__tab--active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeMode === 'month'}
              onClick={() => handleModeChange('month')}
            >
              Por mes
            </button>
            <button
              className={`date-filter__tab${activeMode === 'range' ? ' date-filter__tab--active' : ''}`}
              type="button"
              role="tab"
              aria-selected={activeMode === 'range'}
              onClick={() => handleModeChange('range')}
            >
              Por rango
            </button>
          </div>

          <div className="date-filter__body">
            {activeMode === 'month' ? (
              <label className="field date-filter__field">
                <span className="field__label">Mes</span>
                <select
                  className="select-control"
                  value={draftMonth}
                  onChange={(event) => handleMonthChange(Number(event.target.value))}
                >
                  {MONTH_OPTIONS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <>
                <div className="date-filter__range">
                  <label className="field date-filter__field">
                    <span className="field__label">Desde</span>
                    <input
                      className="input-control"
                      type="date"
                      value={draftFrom}
                      max={draftTo || undefined}
                      onChange={(event) => setDraftFrom(event.target.value)}
                    />
                  </label>

                  <label className="field date-filter__field">
                    <span className="field__label">Hasta</span>
                    <input
                      className="input-control"
                      type="date"
                      value={draftTo}
                      min={draftFrom || undefined}
                      onChange={(event) => setDraftTo(event.target.value)}
                    />
                  </label>
                </div>

                {draftValidationMessage ? (
                  <div className="date-filter__message" role="status">
                    {draftValidationMessage}
                  </div>
                ) : null}

                <div className="date-filter__actions">
                  <button
                    className="button button--primary button--small"
                    type="button"
                    disabled={!isValidRange(draftFrom, draftTo)}
                    onClick={handleRangeConfirm}
                  >
                    Confirmar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
