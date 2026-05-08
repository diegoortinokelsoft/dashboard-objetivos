import { getObjetivoForRow } from '../config/objetivos';
import type { DateFilterValue } from '../shared/utils/dates';
import type { InventarioRow } from '../types/inventarios';

export interface RowCompletion {
  row: InventarioRow;
  objetivo: number | null;
  porcentaje: number | null;
  hasObjetivo: boolean;
}

export interface UserDayMetric {
  fecha: string;
  fecha_display: string;
  correo: string;
  team: string;
  porcentajeDia: number;
  totalTareas: number;
  registros: number;
  cumplio: boolean;
  tareasSinObjetivo: number;
  detalles: RowCompletion[];
}

export interface MonthlyReachedStats {
  correo: string;
  team: string;
  reachedDays: number;
  notReachedDays: number;
}

export interface ActivityBuMetric {
  bu: string;
  activity: string;
  task_type: string;
  objetivo: number | null;
  totalTareas: number;
  registros: number;
  usuariosUnicos: number;
  diasUnicos: number;
  match: number;
  soft_match: number;
  no_match: number;
  not_found: number;
  found: number;
}

const numberFormatter = new Intl.NumberFormat('es-AR');

export function normalizeText(value: string | null | undefined): string {
  return String(value ?? '').trim().toLowerCase();
}

export function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return 'Sin objetivo';
  }

  return `${value.toFixed(1)}%`;
}

export function getMonthFromFecha(fecha: string): number {
  const month = Number(fecha.split('-')[1]);
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : 0;
}

export function matchesDateFilter(row: InventarioRow, dateFilter: DateFilterValue): boolean {
  if (dateFilter.mode === 'month') {
    return getMonthFromFecha(row.fecha) === dateFilter.month;
  }

  if (!dateFilter.from || !dateFilter.to || dateFilter.from > dateFilter.to) {
    return true;
  }

  return row.fecha >= dateFilter.from && row.fecha <= dateFilter.to;
}

export function filterRowsByDate(rows: InventarioRow[], dateFilter: DateFilterValue): InventarioRow[] {
  return rows.filter((row) => matchesDateFilter(row, dateFilter));
}

function getDedupKey(row: InventarioRow): string {
  const taskId = String(row.task_id ?? '').trim();
  return taskId ? `task:${taskId}` : `row:${row._sheet}-${row._rowNumber}`;
}

export function dedupeRows(rows: InventarioRow[]): InventarioRow[] {
  const seen = new Set<string>();
  const deduped: InventarioRow[] = [];

  for (const row of rows) {
    const key = getDedupKey(row);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(row);
  }

  return deduped;
}

export function getValidRows(rows: InventarioRow[]): InventarioRow[] {
  return dedupeRows(
    rows.filter((row) => {
      return (
        normalizeText(row.status) === 'enviada' &&
        Boolean(String(row.correo ?? '').trim()) &&
        Boolean(String(row.fecha ?? '').trim()) &&
        toNumber(row.total_tareas) > 0
      );
    }),
  );
}

export function getAvailableUsers(rows: InventarioRow[]): string[] {
  return Array.from(new Set(rows.map((row) => row.correo.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getAvailableTeams(rows: InventarioRow[]): string[] {
  return Array.from(new Set(rows.map((row) => row.team.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getAvailableBus(rows: InventarioRow[]): string[] {
  return Array.from(new Set(rows.map((row) => row.bu.trim() || 'Sin BU'))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getAvailableActivities(rows: InventarioRow[]): string[] {
  return Array.from(new Set(rows.map((row) => row.activity.trim() || 'Sin activity'))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function getAvailableTaskTypes(rows: InventarioRow[]): string[] {
  return Array.from(new Set(rows.map((row) => row.task_type.trim() || 'Sin task type'))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function calculateRowCompletion(row: InventarioRow): RowCompletion {
  const objetivo = getObjetivoForRow(row);

  if (!objetivo || objetivo.objetivo <= 0) {
    return {
      row,
      objetivo: null,
      porcentaje: null,
      hasObjetivo: false,
    };
  }

  return {
    row,
    objetivo: objetivo.objetivo,
    porcentaje: (toNumber(row.total_tareas) / objetivo.objetivo) * 100,
    hasObjetivo: true,
  };
}

export function getUserTeamMetricKey(correo: string, team: string): string {
  return `${normalizeText(correo)}|${normalizeText(team)}`;
}

function buildUserDayMetric(rows: InventarioRow[]): UserDayMetric[] {
  const grouped = new Map<string, UserDayMetric>();

  for (const row of rows) {
    const correo = row.correo.trim();
    const team = row.team.trim();
    const key = `${row.fecha}|${normalizeText(correo)}|${normalizeText(team)}`;
    const completion = calculateRowCompletion(row);
    const existing =
      grouped.get(key) ??
      ({
        fecha: row.fecha,
        fecha_display: row.fecha_display || row.fecha,
        correo,
        team,
        porcentajeDia: 0,
        totalTareas: 0,
        registros: 0,
        cumplio: false,
        tareasSinObjetivo: 0,
        detalles: [],
      } satisfies UserDayMetric);

    existing.totalTareas += toNumber(row.total_tareas);
    existing.registros += 1;
    existing.detalles.push(completion);

    if (completion.hasObjetivo && completion.porcentaje !== null) {
      existing.porcentajeDia += completion.porcentaje;
    } else {
      existing.tareasSinObjetivo += 1;
    }

    existing.cumplio = existing.porcentajeDia >= 90;
    grouped.set(key, existing);
  }

  return Array.from(grouped.values()).sort((a, b) => {
    const byDate = a.fecha.localeCompare(b.fecha);
    if (byDate !== 0) {
      return byDate;
    }

    const byUser = a.correo.localeCompare(b.correo);
    return byUser !== 0 ? byUser : a.team.localeCompare(b.team);
  });
}

export function groupByUserDay(rows: InventarioRow[]): UserDayMetric[] {
  return buildUserDayMetric(rows);
}

export function groupByTeamUserDay(rows: InventarioRow[]): UserDayMetric[] {
  return buildUserDayMetric(rows);
}

export function getMonthlyReachedStats(metrics: UserDayMetric[]): Record<string, MonthlyReachedStats> {
  const stats: Record<string, MonthlyReachedStats> = {};

  for (const metric of metrics) {
    const key = getUserTeamMetricKey(metric.correo, metric.team);
    const existing =
      stats[key] ??
      ({
        correo: metric.correo,
        team: metric.team,
        reachedDays: 0,
        notReachedDays: 0,
      } satisfies MonthlyReachedStats);

    if (metric.cumplio) {
      existing.reachedDays += 1;
    } else {
      existing.notReachedDays += 1;
    }

    stats[key] = existing;
  }

  return stats;
}

export function groupActivityMetricsByBu(rows: InventarioRow[]): ActivityBuMetric[] {
  const grouped = new Map<
    string,
    ActivityBuMetric & {
      userKeys: Set<string>;
      dayKeys: Set<string>;
    }
  >();

  for (const row of rows) {
    const bu = row.bu.trim() || 'Sin BU';
    const activity = row.activity.trim() || 'Sin activity';
    const taskType = row.task_type.trim() || 'Sin task type';
    const key = `${normalizeText(bu)}|${normalizeText(activity)}|${normalizeText(taskType)}`;
    const objetivo = getObjetivoForRow(row)?.objetivo ?? null;
    const existing =
      grouped.get(key) ??
      ({
        bu,
        activity,
        task_type: taskType,
        objetivo,
        totalTareas: 0,
        registros: 0,
        usuariosUnicos: 0,
        diasUnicos: 0,
        match: 0,
        soft_match: 0,
        no_match: 0,
        not_found: 0,
        found: 0,
        userKeys: new Set<string>(),
        dayKeys: new Set<string>(),
      } satisfies ActivityBuMetric & {
        userKeys: Set<string>;
        dayKeys: Set<string>;
      });

    existing.totalTareas += toNumber(row.total_tareas);
    existing.registros += 1;
    existing.match += toNumber(row.match);
    existing.soft_match += toNumber(row.soft_match);
    existing.no_match += toNumber(row.no_match);
    existing.not_found += toNumber(row.not_found);
    existing.found += toNumber(row.found);
    existing.userKeys.add(normalizeText(row.correo));
    existing.dayKeys.add(row.fecha);
    existing.usuariosUnicos = existing.userKeys.size;
    existing.diasUnicos = existing.dayKeys.size;
    grouped.set(key, existing);
  }

  return Array.from(grouped.values())
    .map(({ userKeys: _userKeys, dayKeys: _dayKeys, ...metric }) => metric)
    .sort((a, b) => {
      const byBu = a.bu.localeCompare(b.bu);
      if (byBu !== 0) {
        return byBu;
      }

      const byActivity = a.activity.localeCompare(b.activity);
      return byActivity !== 0 ? byActivity : a.task_type.localeCompare(b.task_type);
    });
}
