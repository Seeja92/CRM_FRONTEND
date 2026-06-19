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
  deal_name:    string;
  lead_city?:   string;
  created_at:   string;
}

interface TicketsState {
  tickets:        Ticket[];
  selectedTicket: any | null;
  loading:        boolean;
  error:          string | null;
}

const initialState: TicketsState = {
  tickets:        [],
  selectedTicket: null,
  loading:        false,
  error:          null,
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
  deal_name:    t.associated_deal?.deal_name ?? t.deal_name ?? '',
  lead_city: t.lead_city || '',
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
    owner?: number;
    date_from?: string;
    date_to?: string;
    city?: string;
  }) => {
    const data = await ticketsApi.getAll(filters);
    const list = data.results || data;
    return list.map((t: any) => mapTicket(t));
  }
);

export const fetchTicketById = createAsyncThunk(
  'tickets/fetchById',
  async (id: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/${id}/`,
      { headers: { Authorization: `Token ${token}` } }
    );
    return res.json();
  }
);

export const createTicket = createAsyncThunk(
  'tickets/create',
  async (payload: object) => {
    const data = await ticketsApi.create(payload);
    return mapTicket(data);
  }
);

export const updateTicket = createAsyncThunk(
  'tickets/update',
  async ({ id, payload }: { id: string; payload: object }) => {
    const data = await ticketsApi.update(id, payload);
    return mapTicket(data);
  }
);

export const deleteTicket = createAsyncThunk(
  'tickets/delete',
  async (id: string) => {
    await ticketsApi.delete(id);
    return id;
  }
);

export const importTickets = createAsyncThunk(
  'tickets/import',
  async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/import/`,
      {
        method: 'POST',
        headers: { Authorization: `Token ${token}` },
        body: formData,
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Import failed');
    return data;
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
    },
  },
  extraReducers: (builder) => {
    // ── Fetch All ──
    builder.addCase(fetchTickets.pending,   (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchTickets.fulfilled, (state, action) => { state.loading = false; state.tickets = action.payload; });
    builder.addCase(fetchTickets.rejected,  (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to fetch tickets'; });

    // ── Fetch By Id ──
    builder.addCase(fetchTicketById.pending,   (state) => { state.loading = true; });
    builder.addCase(fetchTicketById.fulfilled, (state, action) => { state.loading = false; state.selectedTicket = action.payload; });
    builder.addCase(fetchTicketById.rejected,  (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to fetch ticket'; });

    // ── Create ──
    builder.addCase(createTicket.fulfilled, (state, action) => { state.tickets.unshift(action.payload); });

    // ── Update ──
    builder.addCase(updateTicket.fulfilled, (state, action) => {
      const index = state.tickets.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) state.tickets[index] = action.payload;
      if (state.selectedTicket?.id === action.payload.id) {
        state.selectedTicket = action.payload;
      }
    });

    // ── Delete ──
    builder.addCase(deleteTicket.fulfilled, (state, action) => {
      state.tickets = state.tickets.filter((t) => String(t.id) !== action.payload);
      if (String(state.selectedTicket?.id) === action.payload) {
        state.selectedTicket = null;
      }
    });

    // ── Import ──
    builder.addCase(importTickets.pending,   (state) => { state.loading = true; });
    builder.addCase(importTickets.fulfilled, (state) => { state.loading = false; });
    builder.addCase(importTickets.rejected,  (state, action) => { state.loading = false; state.error = action.error.message || 'Import failed'; });
  },
});

export const { clearSelectedTicket } = ticketsSlice.actions;
export default ticketsSlice.reducer;