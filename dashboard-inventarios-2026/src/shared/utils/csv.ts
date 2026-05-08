function escapeCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function recordsToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((header) => escapeCell(row[header])).join(','));
  return [headers.join(','), ...body].join('\n');
}

export function recordsToTsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) {
    return '';
  }

  const headers = Object.keys(rows[0]);
  const body = rows.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        return value === null || value === undefined ? '' : String(value).replaceAll('\t', ' ');
      })
      .join('\t'),
  );

  return [headers.join('\t'), ...body].join('\n');
}

export function downloadCsv(filename: string, rows: Record<string, unknown>[]): void {
  const csv = recordsToCsv(rows);
  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
