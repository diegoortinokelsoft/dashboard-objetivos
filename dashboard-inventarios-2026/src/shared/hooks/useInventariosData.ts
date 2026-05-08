import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchInventariosYear } from '../../services/inventariosApi';
import type { InventarioApiResponse, InventarioRow } from '../../types/inventarios';
import { getValidRows } from '../../utils/metrics';

const CACHE_KEY = 'inventarios-year-cache';
const CACHE_TIME_KEY = 'inventarios-year-cache-time';
const CACHE_TTL_MS = 1000 * 60 * 60 * 2;

interface CacheSnapshot {
  response: InventarioApiResponse;
  cachedAt: number;
}

export interface InventariosDataState {
  rows: InventarioRow[];
  rawRows: InventarioRow[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
  retry: () => Promise<void>;
}

function toTechnicalError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }

  return String(error);
}

function readCache(): CacheSnapshot | null {
  try {
    const rawCache = window.localStorage.getItem(CACHE_KEY);
    const rawTime = window.localStorage.getItem(CACHE_TIME_KEY);

    if (!rawCache || !rawTime) {
      return null;
    }

    const response = JSON.parse(rawCache) as InventarioApiResponse;
    const cachedAt = Number(rawTime);

    if (!Number.isFinite(cachedAt) || !Array.isArray(response.rows)) {
      return null;
    }

    return {
      response,
      cachedAt,
    };
  } catch {
    return null;
  }
}

function writeCache(response: InventarioApiResponse, cachedAt: number): void {
  window.localStorage.setItem(CACHE_KEY, JSON.stringify(response));
  window.localStorage.setItem(CACHE_TIME_KEY, String(cachedAt));
}

export function useInventariosData(): InventariosDataState {
  const [snapshot, setSnapshot] = useState<CacheSnapshot | null>(() => readCache());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rawRows = snapshot?.response.rows ?? [];
  const rows = useMemo(() => getValidRows(rawRows), [rawRows]);
  const lastUpdated = snapshot ? new Date(snapshot.cachedAt).toISOString() : null;

  const loadYear = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchInventariosYear();
      const cachedAt = Date.now();
      writeCache(response, cachedAt);
      setSnapshot({
        response,
        cachedAt,
      });
    } catch (requestError) {
      setError(toTechnicalError(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const age = snapshot ? Date.now() - snapshot.cachedAt : Number.POSITIVE_INFINITY;

    if (age >= CACHE_TTL_MS) {
      void loadYear();
      return undefined;
    }

    const remainingTtl = Math.max(CACHE_TTL_MS - age, 0);
    const timeoutId = window.setTimeout(() => {
      void loadYear();
    }, remainingTtl);

    return () => window.clearTimeout(timeoutId);
  }, [loadYear, snapshot]);

  return {
    rows,
    rawRows,
    loading,
    error,
    lastUpdated,
    refresh: loadYear,
    retry: loadYear,
  };
}
