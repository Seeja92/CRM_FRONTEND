import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/api/leads';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Lead {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_date: string;
  status: string;
  company_name: string;
  job_title?: string;
  contact_owner?: string;
}

interface LeadsState {
  leads:   Lead[];
  loading: boolean;
  error:   string | null;
}

const initialState: LeadsState = {
  leads:   [],
  loading: false,
  error:   null,
};

// ── Async Thunks ──────────────────────────────────────────────────────────────
export const fetchLeads = createAsyncThunk(
  'leads/fetchAll',
  async ({ search, status }: { search?: string; status?: string } = {}) => {
    let url = '/leads/';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (params.toString()) url += `?${params.toString()}`;
    const res  = await apiRequest(url);
    const data = await res.json();
    return data.results || data;
  }
);

export const createLead = createAsyncThunk('leads/create', async (payload: object) => {
  const res  = await apiRequest('/leads/', 'POST', payload);
  const data = await res.json();
  return data;
});

export const updateLead = createAsyncThunk('leads/update',
  async ({ id, payload }: { id: number; payload: object }) => {
    const res  = await apiRequest(`/leads/${id}/`, 'PATCH', payload);
    const data = await res.json();
    return data;
  }
);

export const deleteLead = createAsyncThunk('leads/delete', async (id: number) => {
  await apiRequest(`/leads/${id}/`, 'DELETE');
  return id;
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ── Fetch All ──
    builder.addCase(fetchLeads.pending,   (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchLeads.fulfilled, (state, action) => { state.loading = false; state.leads = action.payload; });
    builder.addCase(fetchLeads.rejected,  (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to fetch leads'; });

    // ── Create ──
    builder.addCase(createLead.fulfilled, (state, action) => { state.leads.unshift(action.payload); });

    // ── Update ──
    builder.addCase(updateLead.fulfilled, (state, action) => {
      const index = state.leads.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) state.leads[index] = action.payload;
    });

    // ── Delete ──
    builder.addCase(deleteLead.fulfilled, (state, action) => {
      state.leads = state.leads.filter((l) => l.id !== action.payload);
    });
  },
});

export default leadsSlice.reducer;