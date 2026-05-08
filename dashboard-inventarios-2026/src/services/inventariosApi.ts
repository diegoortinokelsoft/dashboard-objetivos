import type { InventarioApiResponse } from '../types/inventarios';

export function getInventariosYearUrl(): string {
  const baseUrl = import.meta.env.VITE_INVENTARIOS_API_URL as string | undefined;

  if (!baseUrl) {
    throw new Error('Falta configurar VITE_INVENTARIOS_API_URL.');
  }

  return `${baseUrl}?type=year`;
}

export async function fetchInventariosYear(): Promise<InventarioApiResponse> {
  const url = getInventariosYearUrl();
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Error HTTP ${response.status} al consultar inventarios.\n${responseText}`);
  }

  const payload = (await response.json()) as InventarioApiResponse;

  if (!payload.ok || payload.type !== 'year' || !Array.isArray(payload.rows)) {
    throw new Error(`Respuesta inesperada del endpoint anual: ${JSON.stringify(payload)}`);
  }

  return payload;
}
