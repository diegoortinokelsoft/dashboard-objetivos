import { Fragment, useMemo, useState, type ReactNode } from 'react';
import { compareSortValues, type SortValue } from '../utils/sorting';
import { EmptyState } from './EmptyState';

type SortDirection = 'asc' | 'desc';

interface SortState {
  columnKey: string;
  direction: SortDirection;
}

export interface DataTableColumn<T> {
  key: string;
  header: string;
  accessor?: (row: T) => SortValue;
  render?: (row: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
  getRowClassName?: (row: T) => string;
  isRowExpanded?: (row: T) => boolean;
  renderExpandedRow?: (row: T) => ReactNode;
}

function getNextSortState(current: SortState | null, columnKey: string): SortState | null {
  if (!current || current.columnKey !== columnKey) {
    return {
      columnKey,
      direction: 'asc',
    };
  }

  if (current.direction === 'asc') {
    return {
      columnKey,
      direction: 'desc',
    };
  }

  return null;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyMessage,
  getRowClassName,
  isRowExpanded,
  renderExpandedRow,
}: DataTableProps<T>) {
  const [sortState, setSortState] = useState<SortState | null>(null);

  const sortedData = useMemo(() => {
    if (!sortState) {
      return data;
    }

    const column = columns.find((item) => item.key === sortState.columnKey);
    if (!column) {
      return data;
    }

    return data
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const aValue = column.accessor ? column.accessor(a.row) : undefined;
        const bValue = column.accessor ? column.accessor(b.row) : undefined;
        const result = compareSortValues(aValue, bValue);
        const stableResult = result === 0 ? a.index - b.index : result;
        return sortState.direction === 'asc' ? stableResult : stableResult * -1;
      })
      .map((item) => item.row);
  }, [columns, data, sortState]);

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="data-table" role="region" aria-label="Tabla de datos" tabIndex={0}>
      <table className="data-table__table">
        <thead className="data-table__head">
          <tr>
            {columns.map((column) => {
              const isSortable = column.sortable !== false;
              const isSorted = sortState?.columnKey === column.key;
              const ariaSort = isSorted
                ? sortState.direction === 'asc'
                  ? 'ascending'
                  : 'descending'
                : undefined;

              return (
                <th
                  className={column.className}
                  key={column.key}
                  scope="col"
                  aria-sort={ariaSort}
                >
                  {isSortable ? (
                    <button
                      className="data-table__sort-button"
                      type="button"
                      onClick={() => setSortState((current) => getNextSortState(current, column.key))}
                    >
                      <span>{column.header}</span>
                      <span className="data-table__sort-indicator" aria-hidden="true">
                        {isSorted ? (sortState.direction === 'asc' ? 'Asc' : 'Desc') : null}
                      </span>
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => {
            const key = getRowKey(row);
            const expanded = Boolean(isRowExpanded?.(row));
            const rowClassName = getRowClassName?.(row) ?? '';

            return (
              <Fragment key={key}>
                <tr className={rowClassName}>
                  {columns.map((column) => (
                    <td className={column.className} key={column.key}>
                      {column.render ? column.render(row) : String(column.accessor?.(row) ?? '')}
                    </td>
                  ))}
                </tr>
                {expanded && renderExpandedRow ? (
                  <tr className="data-table__expanded-row">
                    <td colSpan={columns.length}>{renderExpandedRow(row)}</td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
