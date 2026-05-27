import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dealsApi } from '@/lib/api/deals';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Deal {
  id: string;
  dealName: string;
  dealStage: string;
  closeDate: string;
  dealOwner: string;
  amount: number;
  associatedLead: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  } | null;
}

interface DealsState {
  deals:   Deal[];
  loading: boolean;
  error:   string | null;
}

const initialState: DealsState = {
  deals:   [],
  loading: false,
  error:   null,
};

// ── Async Thunks ──────────────────────────────────────────────────────────────
export const fetchDeals = createAsyncThunk('deals/fetchAll', async () => {
  const data = await dealsApi.getAll();
  return data.map((d: any) => ({
    id:        String(d.id),
    dealName:  d.deal_name,
    dealStage: d.deal_stage,
    closeDate: d.close_date,
    dealOwner: d.deal_owner,
    amount:    parseFloat(d.amount),
    associatedLead: d.associated_lead ?? null,
  }));
});

export const createDeal = createAsyncThunk('deals/create', async (payload: object) => {
  const data = await dealsApi.create(payload);
  return {
    id:        String(data.id),
    dealName:  data.deal_name,
    dealStage: data.deal_stage,
    closeDate: data.close_date,
    dealOwner: data.deal_owner,
    amount:    parseFloat(data.amount),
    associatedLead: data.associated_lead ?? null,
  };
});

export const updateDeal = createAsyncThunk('deals/update',
  async ({ id, payload }: { id: string; payload: object }) => {
    const data = await dealsApi.update(id, payload);
    return {
      id:        String(data.id),
      dealName:  data.deal_name,
      dealStage: data.deal_stage,
      closeDate: data.close_date,
      dealOwner: data.deal_owner,
      amount:    parseFloat(data.amount),
      associatedLead: data.associated_lead ?? null,
    };
  }
);

export const deleteDeal = createAsyncThunk('deals/delete', async (id: string) => {
  await dealsApi.delete(id);
  return id;
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ── Fetch All ──
    builder.addCase(fetchDeals.pending,   (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchDeals.fulfilled, (state, action) => { state.loading = false; state.deals = action.payload; });
    builder.addCase(fetchDeals.rejected,  (state, action) => { state.loading = false; state.error = action.error.message || 'Failed to fetch deals'; });

    // ── Create ──
    builder.addCase(createDeal.fulfilled, (state, action) => { state.deals.unshift(action.payload); });

    // ── Update ──
    builder.addCase(updateDeal.fulfilled, (state, action) => {
      const index = state.deals.findIndex((d) => d.id === action.payload.id);
      if (index !== -1) state.deals[index] = action.payload;
    });

    // ── Delete ──
    builder.addCase(deleteDeal.fulfilled, (state, action) => {
      state.deals = state.deals.filter((d) => d.id !== action.payload);
    });
  },
});

export default dealsSlice.reducer;