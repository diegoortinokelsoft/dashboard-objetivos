export interface InventarioApiResponse {
  ok: boolean;
  type: 'year';
  year: number;
  total: number;
  rows: InventarioRow[];
}

export interface InventarioRow {
  _sheet: string;
  _rowNumber: number;
  timestamp: string;
  correo: string;
  task_type: string;
  activity: string;
  bu: string;
  total_tareas: number;
  match: number;
  soft_match: number;
  no_match: number;
  not_found: number;
  found: number;
  status: string;
  task_id: string;
  processing_token: string;
  sync_note: string;
  team: string;
  origen: string;
  timestamp_iso: string;
  fecha: string;
  fecha_display: string;
  hora: string;
}
