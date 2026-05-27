import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Token ${getToken()}`,
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface Company {
  id:            number;
  company_name:  string;
  domain_name:   string;
  industry:      string;
  type:          string;
  city:          string;
  country:       string;
  phone_number:  string;
  email:         string;
  created_at:    string;
  company_owner: any[];
}

interface CompaniesState {
  companies: Company[];
  loading:   boolean;
  error:     string | null;
  count:     number;
}

const initialState: CompaniesState = {
  companies: [],
  loading:   false,
  error:     null,
  count:     0,
};

// ── Async Thunks ──────────────────────────────────────────────────────────────
export const fetchCompanies = createAsyncThunk(
  'companies/fetchAll',
  async (filters: {
    search?: string;
    industry?: string;
    city?: string;
    country?: string;
    lead_status?: string;
  } = {}) => {
    const params = new URLSearchParams();
    if (filters.search)      params.append('search',      filters.search);
    if (filters.industry && filters.industry !== 'All')    params.append('industry',    filters.industry);
    if (filters.city && filters.city !== 'All')            params.append('city',        filters.city);
    if (filters.country && filters.country !== 'All')      params.append('country',     filters.country);
    if (filters.lead_status && filters.lead_status !== 'All') params.append('lead_status', filters.lead_status);

    const res  = await fetch(
      `${BASE_URL}/companies/${params.toString() ? `?${params.toString()}` : ''}`,
      { headers: headers() }
    );
    const data = await res.json();
    return { companies: data.results || [], count: data.count || 0 };
  }
);

export const createCompany = createAsyncThunk('companies/create', async (payload: object) => {
  const res  = await fetch(`${BASE_URL}/companies/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  });
  return res.json();
});

export const updateCompany = createAsyncThunk('companies/update',
  async ({ id, payload }: { id: number; payload: object }) => {
    const res = await fetch(`${BASE_URL}/companies/${id}/`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(payload),
    });
    return res.json();
  }
);

export const deleteCompany = createAsyncThunk('companies/delete', async (id: number) => {
  await fetch(`${BASE_URL}/companies/${id}/`, {
    method: 'DELETE',
    headers: headers(),
  });
  return id;
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // ── Fetch All ──
    builder.addCase(fetchCompanies.pending,   (state) => { state.loading = true; state.error = null; });
    builder.addCase(fetchCompanies.fulfilled, (state, action) => {
      state.loading   = false;
      state.companies = action.payload.companies;
      state.count     = action.payload.count;
    });
    builder.addCase(fetchCompanies.rejected,  (state, action) => {
      state.loading = false;
      state.error   = action.error.message || 'Failed to fetch companies';
    });

    // ── Create ──
    builder.addCase(createCompany.fulfilled, (state, action) => {
      state.companies.unshift(action.payload);
      state.count += 1;
    });

    // ── Update ──
    builder.addCase(updateCompany.fulfilled, (state, action) => {
      const index = state.companies.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) state.companies[index] = action.payload;
    });

    // ── Delete ──
    builder.addCase(deleteCompany.fulfilled, (state, action) => {
      state.companies = state.companies.filter((c) => c.id !== action.payload);
      state.count    -= 1;
    });
  },
});

export default companiesSlice.reducer;