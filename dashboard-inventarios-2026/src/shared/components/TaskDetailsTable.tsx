import { formatNumber, formatPercent, type RowCompletion } from '../../utils/metrics';
import { Badge } from './Badge';

interface TaskDetailsTableProps {
  detalles: RowCompletion[];
}

export function TaskDetailsTable({ detalles }: TaskDetailsTableProps) {
  return (
    <div className="detail-table">
      <table className="detail-table__table">
        <thead>
          <tr>
            <th>Task type</th>
            <th>Activity</th>
            <th>BU</th>
            <th>Total tareas</th>
            <th>Objetivo esperado</th>
            <th>% fila</th>
            <th>Status</th>
            <th>Task ID</th>
            <th>Origen</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          {detalles.map((detail) => (
            <tr key={`${detail.row._sheet}-${detail.row._rowNumber}-${detail.row.task_id}`}>
              <td>{detail.row.task_type}</td>
              <td>{detail.row.activity}</td>
              <td>{detail.row.bu}</td>
              <td>{formatNumber(detail.row.total_tareas)}</td>
              <td>
                {detail.hasObjetivo ? (
                  formatNumber(detail.objetivo ?? 0)
                ) : (
                  <Badge variant="warning">Sin objetivo configurado</Badge>
                )}
              </td>
              <td>
                <Badge variant={detail.hasObjetivo ? 'neutral' : 'warning'}>{formatPercent(detail.porcentaje)}</Badge>
              </td>
              <td>{detail.row.status}</td>
              <td>{detail.row.task_id || '-'}</td>
              <td>{detail.row.origen || '-'}</td>
              <td>{detail.row.sync_note || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
