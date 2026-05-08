import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Badge } from '../../shared/components/Badge';
import { DataTable, type DataTableColumn } from '../../shared/components/DataTable';
import { DateFilter } from '../../shared/components/DateFilter';
import { FiltersBar } from '../../shared/components/FiltersBar';
import { KpiCard } from '../../shared/components/KpiCard';
import { LoadingState } from '../../shared/components/LoadingState';
import type { InventariosDataState } from '../../shared/hooks/useInventariosData';
import { createDefaultDateFilter } from '../../shared/utils/dates';
import {
  filterRowsByDate,
  formatNumber,
  formatPercent,
  getAvailableActivities,
  getAvailableBus,
  getAvailableTaskTypes,
  groupActivityMetricsByBu,
  type ActivityBuMetric,
} from '../../utils/metrics';

type MetricsValueKey = 'match' | 'soft_match' | 'no_match' | 'not_found' | 'found';

interface MetricDetailItem {
  key: MetricsValueKey;
  label: string;
  value: number;
  percent: number;
  color: string;
}

const METRIC_VALUE_FIELDS: {
  key: MetricsValueKey;
  label: string;
  color: string;
}[] = [
  { key: 'match', label: 'Match', color: '#3ECF8E' },
  { key: 'soft_match', label: 'Soft match', color: '#F59E0B' },
  { key: 'no_match', label: 'No match', color: '#FFB3B3' },
  { key: 'not_found', label: 'Not found', color: '#6B6B6B' },
  { key: 'found', label: 'Found', color: '#F4D04E' },
];

function getMetricKey(metric: ActivityBuMetric): string {
  return `${metric.bu}|${metric.activity}|${metric.task_type}`;
}

function getRowBu(value: string): string {
  return value.trim() || 'Sin BU';
}

function getRowActivity(value: string): string {
  return value.trim() || 'Sin activity';
}

function getRowTaskType(value: string): string {
  return value.trim() || 'Sin task type';
}

function getMetricDetailItems(metric: ActivityBuMetric): MetricDetailItem[] {
  if (metric.totalTareas <= 0) {
    return [];
  }

  return METRIC_VALUE_FIELDS.flatMap((field) => {
    const value = metric[field.key];

    if (!Number.isFinite(value) || value <= 0) {
      return [];
    }

    return [
      {
        ...field,
        value,
        percent: (value / metric.totalTareas) * 100,
      },
    ];
  });
}

function MetricsPieChart({ items }: { items: MetricDetailItem[] }) {
  const size = 132;
  const radius = 48;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;
  let consumedPercent = 0;

  return (
    <svg className="metrics-pie" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribucion porcentual">
      <circle
        className="metrics-pie__track"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
      />
      {items.map((item) => {
        const visiblePercent = Math.max(0, Math.min(item.percent, 100 - consumedPercent));
        const dashLength = (visiblePercent / 100) * circumference;
        const dashOffset = -(consumedPercent / 100) * circumference;
        consumedPercent += visiblePercent;

        return (
          <circle
            key={item.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={item.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
      })}
    </svg>
  );
}

function MetricsExpandedDetail({ metric }: { metric: ActivityBuMetric }) {
  const detailItems = getMetricDetailItems(metric);

  return (
    <div className="metrics-detail">
      <div className="metrics-detail__summary" aria-label="Valores de la fila">
        <div>
          <span>BU</span>
          <strong>{metric.bu}</strong>
        </div>
        <div>
          <span>Activity</span>
          <strong>{metric.activity}</strong>
        </div>
        <div>
          <span>Task type</span>
          <strong>{metric.task_type}</strong>
        </div>
        <div>
          <span>Total tareas</span>
          <strong>{formatNumber(metric.totalTareas)}</strong>
        </div>
        <div>
          <span>Objetivo esperado</span>
          <strong>{metric.objetivo === null ? 'Sin objetivo' : formatNumber(metric.objetivo)}</strong>
        </div>
      </div>

      {detailItems.length > 0 ? (
        <div className="metrics-detail__body">
          <MetricsPieChart items={detailItems} />
          <div className="metrics-detail__items">
            {detailItems.map((item) => (
              <div className="metrics-detail__item" key={item.key}>
                <span className="metrics-detail__marker" style={{ backgroundColor: item.color }} aria-hidden="true" />
                <span className="metrics-detail__label">{item.label}</span>
                <strong>{formatNumber(item.value)}</strong>
                <Badge variant="neutral">{formatPercent(item.percent)}</Badge>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="metrics-detail__empty">No hay valores porcentuales para esta fila.</div>
      )}
    </div>
  );
}

export function MetricasPage() {
  const { rows, loading } = useOutletContext<InventariosDataState>();
  const [dateFilter, setDateFilter] = useState(() => createDefaultDateFilter());
  const [selectedBu, setSelectedBu] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(() => new Set());

  const dateRows = useMemo(() => filterRowsByDate(rows, dateFilter), [dateFilter, rows]);
  const buOptions = useMemo(() => getAvailableBus(dateRows), [dateRows]);
  const activityRows = useMemo(
    () => dateRows.filter((row) => (selectedBu ? getRowBu(row.bu) === selectedBu : true)),
    [dateRows, selectedBu],
  );
  const activityOptions = useMemo(() => getAvailableActivities(activityRows), [activityRows]);
  const taskTypeRows = useMemo(
    () =>
      activityRows.filter((row) =>
        selectedActivity ? getRowActivity(row.activity) === selectedActivity : true,
      ),
    [activityRows, selectedActivity],
  );
  const taskTypeOptions = useMemo(() => getAvailableTaskTypes(taskTypeRows), [taskTypeRows]);

  useEffect(() => {
    if (selectedBu && !buOptions.includes(selectedBu)) {
      setSelectedBu('');
    }
  }, [buOptions, selectedBu]);

  useEffect(() => {
    if (selectedActivity && !activityOptions.includes(selectedActivity)) {
      setSelectedActivity('');
    }
  }, [activityOptions, selectedActivity]);

  useEffect(() => {
    if (selectedTaskType && !taskTypeOptions.includes(selectedTaskType)) {
      setSelectedTaskType('');
    }
  }, [selectedTaskType, taskTypeOptions]);

  const filteredRows = useMemo(
    () =>
      dateRows.filter((row) => {
        const matchesBu = selectedBu ? getRowBu(row.bu) === selectedBu : true;
        const matchesActivity = selectedActivity ? getRowActivity(row.activity) === selectedActivity : true;
        const matchesTaskType = selectedTaskType ? getRowTaskType(row.task_type) === selectedTaskType : true;
        return matchesBu && matchesActivity && matchesTaskType;
      }),
    [dateRows, selectedActivity, selectedBu, selectedTaskType],
  );

  const metrics = useMemo(() => groupActivityMetricsByBu(filteredRows), [filteredRows]);

  const columns = useMemo<DataTableColumn<ActivityBuMetric>[]>(
    () => [
      {
        key: 'bu',
        header: 'BU',
        accessor: (metric) => metric.bu,
      },
      {
        key: 'activity',
        header: 'Activity',
        accessor: (metric) => metric.activity,
      },
      {
        key: 'task_type',
        header: 'Task type',
        accessor: (metric) => metric.task_type,
      },
      {
        key: 'objetivo',
        header: 'Objetivo esperado',
        accessor: (metric) => metric.objetivo,
        render: (metric) =>
          metric.objetivo === null ? (
            <Badge variant="warning">Sin objetivo configurado</Badge>
          ) : (
            formatNumber(metric.objetivo)
          ),
      },
      {
        key: 'totalTareas',
        header: 'Total tareas',
        accessor: (metric) => metric.totalTareas,
        render: (metric) => formatNumber(metric.totalTareas),
      },
      {
        key: 'match',
        header: 'Match',
        accessor: (metric) => metric.match,
        render: (metric) => formatNumber(metric.match),
      },
      {
        key: 'soft_match',
        header: 'Soft match',
        accessor: (metric) => metric.soft_match,
        render: (metric) => formatNumber(metric.soft_match),
      },
      {
        key: 'no_match',
        header: 'No match',
        accessor: (metric) => metric.no_match,
        render: (metric) => formatNumber(metric.no_match),
      },
      {
        key: 'not_found',
        header: 'Not found',
        accessor: (metric) => metric.not_found,
        render: (metric) => formatNumber(metric.not_found),
      },
      {
        key: 'found',
        header: 'Found',
        accessor: (metric) => metric.found,
        render: (metric) => formatNumber(metric.found),
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

  if (loading && rows.length === 0) {
    return <LoadingState />;
  }

  function handleResetFilters(): void {
    setDateFilter(createDefaultDateFilter());
    setSelectedBu('');
    setSelectedActivity('');
    setSelectedTaskType('');
    setExpandedRows(new Set());
  }

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <span className="page__eyebrow">Numeros y estadisticas</span>
          <h2 className="page__title">Metricas por BU, activity y task type</h2>
        </div>
      </div>

      <FiltersBar
        actions={
          <button className="button button--secondary" type="button" onClick={handleResetFilters}>
            Resetear filtros
          </button>
        }
      >
        <DateFilter value={dateFilter} onChange={setDateFilter} />

        <label className="field">
          <span className="field__label">BU</span>
          <select
            className="select-control"
            value={selectedBu}
            onChange={(event) => {
              setSelectedBu(event.target.value);
              setSelectedActivity('');
              setSelectedTaskType('');
            }}
          >
            <option value="">Todas las BU</option>
            {buOptions.map((bu) => (
              <option key={bu} value={bu}>
                {bu}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Activity</span>
          <select
            className="select-control"
            value={selectedActivity}
            onChange={(event) => {
              setSelectedActivity(event.target.value);
              setSelectedTaskType('');
            }}
          >
            <option value="">Todas las activity</option>
            {activityOptions.map((activity) => (
              <option key={activity} value={activity}>
                {activity}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="field__label">Task type</span>
          <select className="select-control" value={selectedTaskType} onChange={(event) => setSelectedTaskType(event.target.value)}>
            <option value="">Todos los task type</option>
            {taskTypeOptions.map((taskType) => (
              <option key={taskType} value={taskType}>
                {taskType}
              </option>
            ))}
          </select>
        </label>
      </FiltersBar>

      <div className="kpi-grid">
        <KpiCard label="Total tareas" value={formatNumber(metrics.reduce((total, metric) => total + metric.totalTareas, 0))} />
        <KpiCard label="Usuarios unicos" value={formatNumber(new Set(filteredRows.map((row) => row.correo)).size)} />
      </div>

      <DataTable
        columns={columns}
        data={metrics}
        getRowKey={getMetricKey}
        isRowExpanded={(metric) => expandedRows.has(getMetricKey(metric))}
        renderExpandedRow={(metric) => <MetricsExpandedDetail metric={metric} />}
        emptyMessage="No hay estadisticas para los filtros seleccionados."
      />
    </section>
  );
}
