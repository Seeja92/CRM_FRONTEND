// ─────────────────────────────────────────────────────────────
// CRM Dashboard — API Configuration & useFetch Hook
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { FetchState, SalesPeriod } from '../../types/dashboard.types';

// Set NEXT_PUBLIC_API_BASE_URL in your .env.local
// e.g. NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL 

export const ENDPOINTS = {
  stats:           `${API_BASE}/dashboard/stats/`,
  conversion:      `${API_BASE}/dashboard/conversion/`,
  sales:           (period: SalesPeriod) =>
    `${API_BASE}/api/dashboard/sales/?period=${period.toLowerCase()}`,
  teamPerformance: `${API_BASE}/dashboard/team-performance/`,
} as const;

// ── Generic typed fetch hook ──────────────────────────────────
export function useFetch<T>(url: string | null): FetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!url) return;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          // Uncomment when you add auth:
          // Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body || res.statusText}`);
      }
      const data: T = await res.json();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...state, refetch: fetchData };
}