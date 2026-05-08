import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Badge } from '../../shared/components/Badge';
import { DataTable, type DataTableColumn } from '../../shared/components/DataTable';
import { DateFilterModeSelector } from '../../shared/components/DateFilterModeSelector';
import { FiltersBar } from '../../shared/components/FiltersBar';
import { KpiCard } from '../../shared/components/KpiCard';
import { LoadingState } from '../../shared/components/LoadingState';
import { SearchableSelect } from '../../shared/components/SearchableSelect';
import { TaskDetailsTable } from '../../shared/components/TaskDetailsTable';
import type { InventariosDataState } from '../../shared/hooks/useInventariosData';
import { createDefaultDateFilter } from '../../shared/utils/dates';
import type { InventarioRow } from '../../types/inventarios';
import {
  filterRowsByDate,
  formatNumber,
  formatPercent,
  getAvailableTeams,
  getAvailableUsers,
  getMonthlyReachedStats,
  getUserTeamMetricKey,
  groupByUserDay,
  type UserDayMetric,
} from '../../utils/metrics';

type CumplimientoFilter = 'todos' | 'llego' | 'no-llego';

interface DayOption {
  value: string;
  label: string;
}

function getMetricKey(metric: UserDayMetric): string {
  return `${metric.fecha}|${metric.correo}|${metric.team}`;
}

function getDayOptions(rows: InventarioRow[]): DayOption[] {
  const dates = new Map<string, string>();

  for (const row of rows) {
    dates.set(row.fecha, row.fecha_display || row.fecha);
  }

  return Array.from(dates.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([value, label]) => ({
      value,
      label,
    }));
}

export function ResumenPage() {
  const { rows, loading } = useOutletContext<InventariosDataState>();
  const [dateFilter, setDateFilter] = useState(() => createDefaultDateFilter());
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [cumplimiento, setCumplimiento] = useState<CumplimientoFilter>('todos');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set());

  const dateRows = useMemo(() => filterRowsByDate(rows, dateFilter), [dateFilter, rows]);
  const users = useMemo(() => getAvailableUsers(dateRows), [dateRows]);
  const userOptions = useMemo(() => users.map((user) => ({ value: user, label: user })), [users]);
  const teams = useMemo(() => getAvailableTeams(dateRows), [dateRows]);

  const filteredRows = useMemo(
    () =>
      dateRows.filter((row) => {
        const matchesTeam = selectedTeam ? row.team.trim() === selectedTeam : true;
        const matchesUser = selectedUser ? row.correo.trim() === selectedUser : true;
        return matchesTeam && matchesUser;
      }),
    [dateRows, selectedTeam, selectedUser],
  );

  const dayOptions = useMemo(() => getDayOptions(filteredRows), [filteredRows]);

  useEffect(() => {
    if (selectedTeam && !teams.includes(selectedTeam)) {
      setSelectedTeam('');
    }
  }, [selectedTeam, teams]);

  useEffect(() => {
    if (selectedUser && !users.includes(selectedUser)) {
      setSelectedUser('');
    }
  }, [selectedUser, users]);

  useEffect(() => {
    if (selectedDay && !dayOptions.some((day) => day.value === selectedDay)) {
      setSelectedDay('');
    }
  }, [dayOptions, selectedDay]);

  const monthlyStats = useMemo(() => getMonthlyReachedStats(groupByUserDay(filteredRows)), [filteredRows]);

  const tableRows = useMemo(() => {
    const dayRows = selectedDay ? filteredRows.filter((row) => row.fecha === selectedDay) : filteredRows;
    const metrics = groupByUserDay(dayRows);

    if (cumplimiento === 'llego') {
      return metrics.filter((metric) => metric.cumplio);
    }

    if (cumplimiento === 'no-llego') {
      return metrics.filter((metric) => !metric.cumplio);
    }

    return metrics;
  }, [cumplimiento, filteredRows, selectedDay]);

  const columns = useMemo<DataTableColumn<UserDayMetric>[]>(
    () => [
      {
        key: 'fecha',
        header: 'Fecha',
        accessor: (metric) => metric.fecha,
        render: (metric) => metric.fecha_display,
      },
      {
        key: 'correo',
        header: 'Usuario',
        accessor: (metric) => metric.correo,
      },
      {
        key: 'team',
        header: 'Team',
        accessor: (metric) => metric.team,
        render: (metric) => metric.team || 'Sin team',
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
        key: 'estadoDia',
        header: 'Dia',
        accessor: (metric) => metric.cumplio,
        render: (metric) => <Badge variant={metric.cumplio ? 'success' : 'error'}>{metric.cumplio ? 'Llego' : 'No llego'}</Badge>,
      },
      {
        key: 'totalTareas',
        header: 'Total tareas',
        accessor: (metric) => metric.totalTareas,
        render: (metric) => formatNumber(metric.totalTareas),
      },
      {
        key: 'reachedStats',
        header: 'Llego/no llego',
        sortable: false,
        render: (metric) => {
          const stat = monthlyStats[getUserTeamMetricKey(metric.correo, metric.team)];

          return (
            <span className="reached-split">
              <Badge variant="success">{stat?.reachedDays ?? 0}</Badge>
              <span>/</span>
              <Badge variant="error">{stat?.notReachedDays ?? 0}</Badge>
            </span>
          );
        },
      },
      {
        key: 'registros',
        header: 'Registros',
        accessor: (metric) => metric.registros,
        render: (metric) => formatNumber(metric.registros),
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
    [expandedRows, monthlyStats],
  );

  if (loading && rows.length === 0) {
    return <LoadingState />;
  }

  function handleResetFilters(): void {
    setDateFilter(createDefaultDateFilter());
    setSelectedDay('');
    setSelectedTeam('');
    setSelectedUser('');
    setCumplimiento('todos');
    setExpandedRows(new Set());
  }

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <span className="page__eyebrow">Vista general</span>
          <h2 className="page__title">Resumen diario por usuario y team</h2>
        </div>
      </div>

      <FiltersBar
        actions={
          <button className="button button--secondary" type="button" onClick={handleResetFilters}>
            Resetear filtros
          </button>
        }
      >
        <DateFilterModeSelector
          value={dateFilter}
          onChange={(nextDateFilter) => {
            setDateFilter(nextDateFilter);
            setSelectedDay('');
          }}
        />

        <label className="field">
          <span className="field__label">Dia</span>
          <select className="select-control" value={selectedDay} onChange={(event) => setSelectedDay(event.target.value)}>
            <option value="">Todos los dias</option>
            {dayOptions.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </label>

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
          <span className="field__label">Cumplimiento diario</span>
          <select
            className="select-control"
            value={cumplimiento}
            onChange={(event) => setCumplimiento(event.target.value as CumplimientoFilter)}
          >
            <option value="todos">Todos</option>
            <option value="llego">Llego</option>
            <option value="no-llego">No llego</option>
          </select>
        </label>
      </FiltersBar>

      <div className="kpi-grid">
        <KpiCard label="Filas diarias" value={formatNumber(tableRows.length)} />
        <KpiCard label="Dias cumplidos" value={formatNumber(tableRows.filter((metric) => metric.cumplio).length)} />
        <KpiCard label="Total tareas" value={formatNumber(tableRows.reduce((total, metric) => total + metric.totalTareas, 0))} />
        <KpiCard
          label="Promedio diario"
          value={formatPercent(
            tableRows.length
              ? tableRows.reduce((total, metric) => total + metric.porcentajeDia, 0) / tableRows.length
              : 0,
          )}
        />
      </div>

      <DataTable
        columns={columns}
        data={tableRows}
        getRowKey={getMetricKey}
        getRowClassName={(metric) => (metric.cumplio ? 'data-table__row--success' : 'data-table__row--error')}
        isRowExpanded={(metric) => expandedRows.has(getMetricKey(metric))}
        renderExpandedRow={(metric) => <TaskDetailsTable detalles={metric.detalles} />}
        emptyMessage="No hay metricas diarias para los filtros seleccionados."
      />
    </section>
  );
}
