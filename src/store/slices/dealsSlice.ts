

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dealsApi, usersApi } from '@/lib/api/deals';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('access') : null;

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Deal {
  id:             string;
  dealName:       string;
  dealStage:      string;
  closeDate:      string;
  dealOwner:      string;
  amount:         number;
  priority:       string;
  associatedLead: any;
  created_at?:    string;
}

interface DealsState {
  deals:        Deal[];
  selectedDeal: Deal | null;
  users:        { id: number; name: string }[];
  leads:        { id: string; name: string; phone: string; city: string }[];
  loading:      boolean;
  error:        string | null;
}

const initialState: DealsState = {
  deals:        [],
  selectedDeal: null,
  users:        [],
  leads:        [],
  loading:      false,
  error:        null,
};

// ── Async Thunks ──────────────────────────────────────────────────────────────
export const fetchDeals = createAsyncThunk('deals/fetchAll', async () => {
  const data = await dealsApi.getAll();
  return data.map((d: any) => ({
    id:             String(d.id),
    dealName:       d.deal_name,
    dealStage:      d.deal_stage,
    closeDate:      d.close_date,
    dealOwner:      d.deal_owner,
    amount:         parseFloat(d.amount),
    priority:       d.priority || 'Medium',
    associatedLead: d.associated_lead ?? null,
    created_at:     d.created_at ?? null,
  }));
});

export const fetchDealById = createAsyncThunk('deals/fetchById', async (id: string) => {
  const data = await dealsApi.getById(id);
  return {
    id:             String(data.id),
    dealName:       data.deal_name,
    dealStage:      data.deal_stage,
    closeDate:      data.close_date,
    dealOwner:      data.deal_owner,
    amount:         parseFloat(data.amount),
    priority:       data.priority || 'Medium',
    associatedLead: data.associated_lead ?? null,
    created_at:     data.created_at ?? null,
  };
});

export const fetchDealUsers = createAsyncThunk('deals/fetchUsers', async () => {
  const data = await usersApi.getAll();
  return data.filter((u: any) => u.name.trim() !== '');
});

export const fetchDealLeads = createAsyncThunk('deals/fetchLeads', async () => {
  const res = await fetch(`${BASE_URL}/leads/`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error('Failed to fetch leads');
  const data  = await res.json();
  const leads = data.results || data;
  return leads.map((l: any) => ({
    id:    String(l.id),
    name:  `${l.first_name} ${l.last_name}`.trim(),
    phone: l.phone || '',
    city:  l.city  || '',
  }));
});

export const createDeal = createAsyncThunk('deals/create', async (payload: object) => {
  const data = await dealsApi.create(payload);
  return {
    id:             String(data.id),
    dealName:       data.deal_name,
    dealStage:      data.deal_stage,
    closeDate:      data.close_date,
    dealOwner:      data.deal_owner,
    amount:         parseFloat(data.amount),
    priority:       data.priority || 'Medium',
    associatedLead: data.associated_lead ?? null,
    created_at:     data.created_at ?? null,
  };
});

export const updateDeal = createAsyncThunk('deals/update',
  async ({ id, payload }: { id: string; payload: object }) => {
    const data = await dealsApi.update(id, payload);
    return {
      id:             String(data.id),
      dealName:       data.deal_name,
      dealStage:      data.deal_stage,
      closeDate:      data.close_date,
      dealOwner:      data.deal_owner,
      amount:         parseFloat(data.amount),
      priority:       data.priority || 'Medium',
      associatedLead: data.associated_lead ?? null,
      created_at:     data.created_at ?? null,
    };
  }
);

export const deleteDeal = createAsyncThunk('deals/delete', async (id: string) => {
  await dealsApi.delete(id);
  return id;
});

export const importDeals = createAsyncThunk('deals/import', async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/deals/import/`, {
    method: 'POST',
    body:   formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Import failed');
  return data;
});

export const convertLeadStatus = createAsyncThunk(
  'deals/convertLead',
  async (leadId: number) => {
    const res = await fetch(`${BASE_URL}/leads/${leadId}/`, {
      method:  'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status: 'Converted' }),
    });
    if (!res.ok) throw new Error('Failed to convert lead');
    return res.json();
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    clearSelectedDeal: (state) => {
      state.selectedDeal = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch All ──
    builder.addCase(fetchDeals.pending,   (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchDeals.fulfilled, (state, action) => { state.loading = false; state.deals = action.payload; });
    builder.addCase(fetchDeals.rejected,  (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to fetch deals'; });

    // ── Fetch By ID ──
    builder.addCase(fetchDealById.pending,   (state) => { state.loading = true; });
    builder.addCase(fetchDealById.fulfilled, (state, action) => { state.loading = false; state.selectedDeal = action.payload; });
    builder.addCase(fetchDealById.rejected,  (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to fetch deal'; });

    // ── Fetch Users ──
    builder.addCase(fetchDealUsers.fulfilled, (state, action) => { state.users = action.payload; });

    // ── Fetch Leads ──
    builder.addCase(fetchDealLeads.fulfilled, (state, action) => { state.leads = action.payload; });

    // ── Create ──
    builder.addCase(createDeal.fulfilled, (state, action) => { state.deals.unshift(action.payload); });

    // ── Update ──
    builder.addCase(updateDeal.fulfilled, (state, action) => {
      const index = state.deals.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) state.deals[index] = action.payload;
      if (state.selectedDeal?.id === action.payload.id) {
        state.selectedDeal = action.payload;
      }
    });

    // ── Delete ──
    builder.addCase(deleteDeal.fulfilled, (state, action) => {
      state.deals = state.deals.filter((d) => d.id !== action.payload);
      if (state.selectedDeal?.id === action.payload) {
        state.selectedDeal = null;
      }
    });

    // ── Import ──
    builder.addCase(importDeals.pending,   (state) => { state.loading = true; });
    builder.addCase(importDeals.fulfilled, (state) => { state.loading = false; });
    builder.addCase(importDeals.rejected,  (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Import failed';
    });
  },
});

export const { clearSelectedDeal } = dealsSlice.actions;
export default dealsSlice.reducer;