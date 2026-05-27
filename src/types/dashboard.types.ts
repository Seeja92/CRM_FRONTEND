// ─────────────────────────────────────────────────────────────
// CRM Dashboard — TypeScript Types
// ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_leads: number;
  active_deals: number;
  closed_deals: number;
  monthly_revenue: number;
  total_companies: number;
}

export interface ConversionStage {
  label: string;
  value: number;   // 0–100 percentage
  color: string;   // hex
}

export interface SalesDataPoint {
  month: string;   // "Jan" … "Dec" or "2024"
  value: number;
}

export interface TeamMember {
  name: string;
  active_deals: number;
  closed_deals: number;
  revenue: string;   // pre-formatted, e.g. "$12,000"
  change: string;    // e.g. "+3.4%" or "-0.1%"
  positive: boolean;
}

export type SalesPeriod = 'Monthly' | 'Yearly';

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}