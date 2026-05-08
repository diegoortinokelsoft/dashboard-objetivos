import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Badge } from '../../shared/components/Badge';
import { DataTable, type DataTableColumn } from '../../shared/components/DataTable';
import { DateFilterModeSelector } from '../../shared/components/DateFilterModeSelector';
import { EmptyState } from '../../shared/components/EmptyState';
import { FiltersBar } from '../../shared/components/FiltersBar';
import { KpiCard } from '../../shared/components/KpiCard';
import { LoadingState } from '../../shared/components/LoadingState';
import { SearchableSelect } from '../../shared/components/SearchableSelect';
import { TaskDetailsTable } from '../../shared/components/TaskDetailsTable';
import type { InventariosDataState } from '../../shared/hooks/useInventariosData';
import { copyToClipboard } from '../../shared/utils/clipboard';
import { downloadCsv, recordsToTsv } from '../../shared/utils/csv';
import { createDefaultDateFilter } from '../../shared/utils/dates';
import {
  filterRowsByDate,
  formatNumber,
  formatPercent,
  getAvailableTeams,
  getAvailableUsers,
  groupByUserDay,
  type UserDayMetric,
} from '../../utils/metrics';

function getMetricKey(metric: UserDayMetric): string {
  return `${metric.fecha}|${metric.correo}|${metric.team}`;
}

function buildSummaryRecords(metrics: UserDayMetric[]): Record<string, unknown>[] {
  return metrics.map((metric) => ({
    Fecha: metric.fecha_display,
    Usuario: metric.correo,
    Team: metric.team || 'Sin team',
    'Porcentaje dia': formatPercent(metric.porcentajeDia),
    'Total tareas': metric.totalTareas,
    Llego: metric.cumplio ? 'Si' : 'No',
    Registros: metric.registros,
    'Tareas sin objetivo': metric.tareasSinObjetivo,
  }));
}

function buildDetailRecords(metrics: UserDayMetric[]): Record<string, unknown>[] {
  return metrics.flatMap((metric) =>
    metric.detalles.map((detail) => ({
      Fecha: metric.fecha_display,
      Usuario: metric.correo,
      Team: metric.team || 'Sin team',
      'Task type': detail.row.task_type,
      Activity: detail.row.activity,
      BU: detail.row.bu,
      'Total tareas': detail.row.total_tareas,
      'Objetivo esperado': detail.objetivo ?? 'Sin objetivo configurado',
      '% fila': detail.porcentaje === null ? 'Sin objetivo' : formatPercent(detail.porcentaje),
      Status: detail.row.status,
      'Task ID': detail.row.task_id,
      Origen: detail.row.origen,
      Nota: detail.row.sync_note,
    })),
  );
}

export function UsuarioPage() {
  const { rows, loading } = useOutletContext<InventariosDataState>();
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [dateFilter, setDateFilter] = useState(() => createDefaultDateFilter());
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set());
  const [copyStatus, setCopyStatus] = useState('');

  const allUsers = useMemo(() => getAvailableUsers(rows), [rows]);
  const dateRows = useMemo(() => filterRowsByDate(rows, dateFilter), [dateFilter, rows]);
  const teams = useMemo(() => getAvailableTeams(dateRows), [dateRows]);
  const users = useMemo(
    () => getAvailableUsers(dateRows.filter((row) => (selectedTeam ? row.team.trim() === selectedTeam : true))),
    [dateRows, selectedTeam],
  );
  const userOptions = useMemo(() => users.map((user) => ({ value: user, label: user })), [users]);

  useEffect(() => {
    if (selectedUser && !users.includes(selectedUser)) {
      setSelectedUser('');
    }
  }, [selectedUser, users]);

  useEffect(() => {
    if (selectedTeam && !teams.includes(selectedTeam)) {
      setSelectedTeam('');
    }
  }, [selectedTeam, teams]);

  const tableRows = useMemo(() => {
    return groupByUserDay(
      dateRows.filter((row) => {
        const matchesUser = selectedUser ? row.correo.trim() === selectedUser : true;
        const matchesTeam = selectedTeam ? row.team.trim() === selectedTeam : true;
        return matchesUser && matchesTeam;
      }),
    );
  }, [dateRows, selectedTeam, selectedUser]);

  const summaryRecords = useMemo(() => buildSummaryRecords(tableRows), [tableRows]);
  const detailRecords = useMemo(() => buildDetailRecords(tableRows), [tableRows]);

  const columns = useMemo<DataTableColumn<UserDayMetric>[]>(
    () => [
      {
        key: 'fecha',
        header: 'Fecha',
        accessor: (metric) => metric.fecha,
        render: (metric) => metric.fecha_display,
      },
      {
        key: 'porcentajeDia',
        header: '% dia',
        accessor: (metric) => metric.porcentajeDia,
        render: (metric) => (
          <Badge variant={metric.cumplio ? 'success' : 'error'}>{formatPercent(metric.porcentajeDia)}</Badge>
        ),
      },
      {
        key: 'totalTareas',
        header: 'Total tareas',
        accessor: (metric) => metric.totalTareas,
        render: (metric) => formatNumber(metric.totalTareas),
      },
      {
        key: 'team',
        header: 'Team',
        accessor: (metric) => metric.team,
        render: (metric) => metric.team || 'Sin team',
      },
      {
        key: 'cumplio',
        header: 'Llego/no llego',
        accessor: (metric) => metric.cumplio,
        render: (metric) => <Badge variant={metric.cumplio ? 'success' : 'error'}>{metric.cumplio ? 'Llego' : 'No llego'}</Badge>,
      },
      {
        key: 'registros',
        header: 'Registros',
        accessor: (metric) => metric.registros,
        render: (metric) => formatNumber(metric.registros),
      },
      {
        key: 'tareasSinObjetivo',
        header: 'Tareas sin objetivo',
        accessor: (metric) => metric.tareasSinObjetivo,
        render: (metric) =>
          metric.tareasSinObjetivo > 0 ? (
            <Badge variant="warning">{formatNumber(metric.tareasSinObjetivo)}</Badge>
          ) : (
            formatNumber(metric.tareasSinObjetivo)
          ),
      },
      {
        key: 'acciones',
        header: 'Acciones',
        sortable: false,
        render: (metric) => {
          const key = getMetricKey(metric);
          const expanded = expandedRows.has(key);

          return (
            <button
              className="button button--small"
              type="button"
              aria-expanded={expanded}
              onClick={() =>
                setExpandedRows((current) => {
                  const next = new Set(current);
                  if (next.has(key)) {
                    next.delete(key);
                  } else {
                    next.add(key);
                  }

                  return next;
                })
              }
            >
              {expanded ? 'Ocultar' : 'Expandir'}
            </button>
          );
        },
      },
    ],
    [expandedRows],
  );

  async function handleCopySummary(): Promise<void> {
    await copyToClipboard(recordsToTsv(summaryRecords));
    setCopyStatus('Resumen copiado');
  }

  async function handleCopyDetails(): Promise<void> {
    await copyToClipboard(recordsToTsv(detailRecords));
    setCopyStatus('Detalle copiado');
  }

  function handleResetFilters(): void {
    setSelectedUser('');
    setSelectedTeam('');
    setDateFilter(createDefaultDateFilter());
    setExpandedRows(new Set());
    setCopyStatus('');
  }

  if (loading && rows.length === 0) {
    return <LoadingState />;
  }

  if (allUsers.length === 0) {
    return <EmptyState title="Sin usuarios" message="No hay correos disponibles en las filas validas." />;
  }

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <span className="page__eyebrow">Vista individual</span>
          <h2 className="page__title">Detalle por usuario</h2>
        </div>
      </div>

      <FiltersBar
        actions={
          <>
            <button className="button button--secondary" type="button" onClick={handleResetFilters}>
              Resetear filtros
            </button>
            <button className="button button--secondary" type="button" disabled={summaryRecords.length === 0} onClick={() => void handleCopySummary()}>
              Copiar resumen
            </button>
            <button className="button button--secondary" type="button" disabled={summaryRecords.length === 0} onClick={() => downloadCsv('resumen-usuario.csv', summaryRecords)}>
              CSV resumen
            </button>
            <button className="button button--secondary" type="button" disabled={detailRecords.length === 0} onClick={() => void handleCopyDetails()}>
              Copiar detalle
            </button>
            <button className="button button--secondary" type="button" disabled={detailRecords.length === 0} onClick={() => downloadCsv('detalle-usuario.csv', detailRecords)}>
              CSV detalle
            </button>
          </>
        }
      >
        <div className="field">
          <span className="field__label">Usuario</span>
          <SearchableSelect
            ariaLabel="Usuario"
            value={selectedUser}
            options={userOptions}
            onChange={setSelectedUser}
            emptyLabel="Todos los usuarios"
            searchPlaceholder="Buscar usuario"
          />
        </div>

        <label className="field">
          <span className="field__label">Team</span>
          <select className="select-control" value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)}>
            <option value="">Todos los teams</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </label>

        <DateFilterModeSelector value={dateFilter} onChange={setDateFilter} />
      </FiltersBar>

      {copyStatus ? <div className="copy-status">{copyStatus}</div> : null}

      <div className="kpi-grid">
        <KpiCard label="Dias registrados" value={formatNumber(tableRows.length)} />
        <KpiCard label="Dias cumplidos" value={formatNumber(tableRows.filter((metric) => metric.cumplio).length)} />
        <KpiCard label="Total tareas" value={formatNumber(tableRows.reduce((total, metric) => total + metric.totalTareas, 0))} />
        <KpiCard label="Sin objetivo" value={formatNumber(tableRows.reduce((total, metric) => total + metric.tareasSinObjetivo, 0))} />
      </div>

      <DataTable
        columns={columns}
        data={tableRows}
        getRowKey={getMetricKey}
        getRowClassName={(metric) => (metric.cumplio ? 'data-table__row--success' : 'data-table__row--error')}
        isRowExpanded={(metric) => expandedRows.has(getMetricKey(metric))}
        renderExpandedRow={(metric) => <TaskDetailsTable detalles={metric.detalles} />}
        emptyMessage="No hay dias registrados para los filtros seleccionados."
      />
    </section>
  );
}
