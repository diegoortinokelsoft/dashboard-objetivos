import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface SearchableSelectOption {
  value: string;
  label: string;
  searchText?: string;
}

interface SearchableSelectProps {
  ariaLabel: string;
  value: string;
  options: SearchableSelectOption[];
  onChange: (value: string) => void;
  emptyLabel?: string;
  searchPlaceholder?: string;
  noResultsMessage?: string;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function SearchableSelect({
  ariaLabel,
  value,
  options,
  onChange,
  emptyLabel,
  searchPlaceholder = 'Buscar...',
  noResultsMessage = 'Sin resultados',
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listId = useId();
  const selectedOption = options.find((option) => option.value === value);
  const selectedLabel = value ? selectedOption?.label ?? value : emptyLabel ?? 'Seleccionar';
  const canSelectEmpty = emptyLabel !== undefined;

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeSearchText(query.trim());

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const searchableValue = `${option.label} ${option.value} ${option.searchText ?? ''}`;
      return normalizeSearchText(searchableValue).includes(normalizedQuery);
    });
  }, [options, query]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    searchRef.current?.focus();

    function handlePointerDown(event: PointerEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  function handleSelect(nextValue: string): void {
    onChange(nextValue);
    setQuery('');
    setOpen(false);
  }

  return (
    <div className="searchable-select" ref={rootRef}>
      <button
        className="searchable-select__trigger"
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={listId}
        disabled={options.length === 0 && !canSelectEmpty}
        onClick={() => {
          setQuery('');
          setOpen((current) => !current);
        }}
      >
        <span className="searchable-select__value">{selectedLabel}</span>
        <span className="searchable-select__chevron" aria-hidden="true" />
      </button>

      {open ? (
        <div className="searchable-select__menu">
          <input
            className="searchable-select__search"
            ref={searchRef}
            type="search"
            value={query}
            placeholder={searchPlaceholder}
            aria-label={`Buscar ${ariaLabel.toLowerCase()}`}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setOpen(false);
              }
            }}
          />
          <div className="searchable-select__options" id={listId} role="listbox" aria-label={ariaLabel}>
            {canSelectEmpty && normalizeSearchText(emptyLabel).includes(normalizeSearchText(query.trim())) ? (
              <button
                className={`searchable-select__option${value === '' ? ' searchable-select__option--selected' : ''}`}
                type="button"
                role="option"
                aria-selected={value === ''}
                onClick={() => handleSelect('')}
              >
                {emptyLabel}
              </button>
            ) : null}

            {filteredOptions.map((option) => (
              <button
                className={`searchable-select__option${option.value === value ? ' searchable-select__option--selected' : ''}`}
                type="button"
                role="option"
                aria-selected={option.value === value}
                key={option.value}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </button>
            ))}

            {filteredOptions.length === 0 && !canSelectEmpty ? (
              <div className="searchable-select__empty">{noResultsMessage}</div>
            ) : null}
            {filteredOptions.length === 0 &&
            canSelectEmpty &&
            !normalizeSearchText(emptyLabel).includes(normalizeSearchText(query.trim())) ? (
              <div className="searchable-select__empty">{noResultsMessage}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
