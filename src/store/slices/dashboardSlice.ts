import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 1. Typescript Interfaces
interface DashboardStats {
  total_leads: number;
  active_deals: number;
  closed_deals: number;
  monthly_revenue: number;
  total_companies: number;
}

interface ConversionStage {
  label: string;
  value: number;
  color: string;
}

interface SalesDataPoint {
  month: string;
  value: number;
}

interface TeamMember {
  name: string;
  active_deals: number;
  closed_deals: number;
  revenue: string;
  change: string;
  positive: boolean;
}

interface DashboardState {
  stats: DashboardStats | null;
  conversion: ConversionStage[];
  sales: SalesDataPoint[];
  teamPerformance: TeamMember[];
  loading: {
    stats: boolean;
    conversion: boolean;
    sales: boolean;
    team: boolean;
  };
  errors: {
    stats: string | null;
    conversion: string | null;
    sales: string | null;
    team: string | null;
  };
}

const initialState: DashboardState = {
  stats: null,
  conversion: [],
  sales: [],
  teamPerformance: [],
  loading: { stats: true, conversion: true, sales: true, team: true },
  errors: { stats: null, conversion: null, sales: null, team: null },
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper to configure request options matching your previous custom useFetch hook setup
const getFetchOptions = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
  };
};

// 2. Thunks rewritten with native fetch
export const fetchStats = createAsyncThunk("dashboard/fetchStats", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/dashboard/stats/`, getFetchOptions());
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to load stats");
  }
});

export const fetchConversion = createAsyncThunk("dashboard/fetchConversion", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/dashboard/conversion/`, getFetchOptions());
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to load conversions");
  }
});

export const fetchSales = createAsyncThunk("dashboard/fetchSales", async (period: "Monthly" | "Yearly", { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/dashboard/sales/?period=${period.toLowerCase()}`, getFetchOptions());
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to load sales analytics");
  }
});

export const fetchTeamPerformance = createAsyncThunk("dashboard/fetchTeamPerformance", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API_BASE}/dashboard/team-performance/`, getFetchOptions());
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to load team trackers");
  }
});

// 3. Redux Reducer Slice Layout
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchStats.pending, (state) => { state.loading.stats = true; state.errors.stats = null; })
      .addCase(fetchStats.fulfilled, (state, action) => { state.loading.stats = false; state.stats = action.payload; })
      .addCase(fetchStats.rejected, (state, action) => { state.loading.stats = false; state.errors.stats = action.payload as string; })
      // Conversion
      .addCase(fetchConversion.pending, (state) => { state.loading.conversion = true; state.errors.conversion = null; })
      .addCase(fetchConversion.fulfilled, (state, action) => { state.loading.conversion = false; state.conversion = action.payload; })
      .addCase(fetchConversion.rejected, (state, action) => { state.loading.conversion = false; state.errors.conversion = action.payload as string; })
      // Sales
      .addCase(fetchSales.pending, (state) => { state.loading.sales = true; state.errors.sales = null; })
      .addCase(fetchSales.fulfilled, (state, action) => { state.loading.sales = false; state.sales = action.payload; })
      .addCase(fetchSales.rejected, (state, action) => { state.loading.sales = false; state.errors.sales = action.payload as string; })
      // Team Performance Tracking
      .addCase(fetchTeamPerformance.pending, (state) => { state.loading.team = true; state.errors.team = null; })
      .addCase(fetchTeamPerformance.fulfilled, (state, action) => { state.loading.team = false; state.teamPerformance = action.payload; })
      .addCase(fetchTeamPerformance.rejected, (state, action) => { state.loading.team = false; state.errors.team = action.payload as string; });
  },
});

export default dashboardSlice.reducer;