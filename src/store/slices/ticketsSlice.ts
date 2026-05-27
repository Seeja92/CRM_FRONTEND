

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ticketsApi } from '@/lib/api/tickets';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Ticket {
  id:           number;
  ticket_name:  string;
  status:       string;
  priority:     string;
  source:       string;
  owner_name:   string;
  company_name: string;
  deal_name:    string;   // ← extracted from associated_deal.deal_name
  created_at:   string;
}

interface TicketsState {
  tickets: Ticket[];
  loading: boolean;
  error:   string | null;
}

const initialState: TicketsState = {
  tickets: [],
  loading: false,
  error:   null,
};

// ── Mapper ────────────────────────────────────────────────────────────────────
const mapTicket = (t: any): Ticket => ({
  id:           t.id,
  ticket_name:  t.ticket_name,
  status:       t.status,
  priority:     t.priority,
  source:       t.source,
  owner_name:   t.owner_name   || '—',
  company_name: t.company_name || '—',
  deal_name:    t.associated_deal?.deal_name  // ← nested object from backend
                ?? t.deal_name                 // ← fallback if already flat
                ?? '',
  created_at:   t.created_at,
});

// ── Async Thunks ──────────────────────────────────────────────────────────────
export const fetchTickets = createAsyncThunk(
  'tickets/fetchAll',
  async (filters?: {
    search?: string;
    status?: string;
    priority?: string;
    source?: string;
    owner?: string;
  }) => {
    const data = await ticketsApi.getAll(filters);
    const list = data.results || data;
    return list.map((t: any) => mapTicket(t));  // ← map here
  }
);

export const createTicket = createAsyncThunk('tickets/create', async (payload: object) => {
  const data = await ticketsApi.create(payload);
  return mapTicket(data);  // ← map here
});

export const updateTicket = createAsyncThunk('tickets/update',
  async ({ id, payload }: { id: string; payload: object }) => {
    const data = await ticketsApi.update(id, payload);
    return mapTicket(data);  // ← map here
  }
);

export const deleteTicket = createAsyncThunk('tickets/delete', async (id: string) => {
  await ticketsApi.delete(id);
  return id;
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTickets.pending,   (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchTickets.fulfilled, (state, action) => { state.loading = false; state.tickets = action.payload; });
    builder.addCase(fetchTickets.rejected,  (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to fetch tickets'; });

    builder.addCase(createTicket.fulfilled, (state, action) => { state.tickets.unshift(action.payload); });

    builder.addCase(updateTicket.fulfilled, (state, action) => {
      const index = state.tickets.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) state.tickets[index] = action.payload;
    });

    builder.addCase(deleteTicket.fulfilled, (state, action) => {
      state.tickets = state.tickets.filter((t) => String(t.id) !== action.payload);
    });
  },
});

export default ticketsSlice.reducer;