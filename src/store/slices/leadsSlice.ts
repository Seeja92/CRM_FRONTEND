

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '@/lib/api/leads';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Lead {
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
  contact_owner?: number;
  city?:string;
}

interface LeadsState {
  leads: Lead[];
  selectedLead: Lead | null;
  loading: boolean;
  error: string | null;
}

const initialState: LeadsState = {
  leads: [],
  selectedLead: null,
  loading: false,
  error: null,
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
    const res = await apiRequest(url);
    const data = await res.json();
    console.log("LEADS API RESPONSE:", data);
    return data.results || data;
  }
);

export const fetchLeadById = createAsyncThunk(
  'leads/fetchById',
  async (id: number) => {
    const res = await apiRequest(`/leads/${id}/`);
    return res.json();
  }
);

export const createLead = createAsyncThunk(
  'leads/create',
  async (payload: object) => {
    const res = await apiRequest('/leads/', 'POST', payload);
    return res.json();
  }
);

export const updateLead = createAsyncThunk(
  'leads/update',
  async ({ id, payload }: { id: number; payload: object }) => {
    const res = await apiRequest(`/leads/${id}/`, 'PATCH', payload);
    return res.json();
  }
);

export const deleteLead = createAsyncThunk(
  'leads/delete',
  async (id: number) => {
    await apiRequest(`/leads/${id}/`, 'DELETE');
    return id;
  }
);

export const importLeads = createAsyncThunk(
  'leads/import',
  async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('access');
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/import/`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Import failed');
    return data;
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const leadsSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    clearSelectedLead: (state) => {
      state.selectedLead = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch All ──
    builder.addCase(fetchLeads.pending, (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchLeads.fulfilled, (state, action) => {
      state.loading = false;
      state.leads = action.payload;
    });
    builder.addCase(fetchLeads.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch leads';
    });

    // ── Fetch By Id ──
    builder.addCase(fetchLeadById.pending, (state) => { state.loading = true; });
    builder.addCase(fetchLeadById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedLead = action.payload;
    });
    builder.addCase(fetchLeadById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch lead';
    });

    // ── Create ──
    builder.addCase(createLead.fulfilled, (state, action) => {
      state.leads.unshift(action.payload);
    });

    // ── Update ──
    builder.addCase(updateLead.fulfilled, (state, action) => {
      const index = state.leads.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) state.leads[index] = action.payload;
      if (state.selectedLead?.id === action.payload.id) {
        state.selectedLead = action.payload;
      }
    });

    // ── Delete ──
    builder.addCase(deleteLead.fulfilled, (state, action) => {
      state.leads = state.leads.filter((l) => l.id !== action.payload);
      if (state.selectedLead?.id === action.payload) {
        state.selectedLead = null;
      }
    });

    // ── Import ──
    builder.addCase(importLeads.pending, (state) => { state.loading = true; });
    builder.addCase(importLeads.fulfilled, (state) => { state.loading = false; });
    builder.addCase(importLeads.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Import failed';
    });
  },
});

// ── Exports ──────────────────────────────────────────────────────────────────
export const { clearSelectedLead } = leadsSlice.actions;
export default leadsSlice.reducer;