import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ── Types ─────────────────────────────────────────────────────────────────────
interface AuthState {
  token:      string | null;
  email:      string | null;
  firstName:  string | null;
  lastName:   string | null;
  loading:    boolean;
  error:      string | null;
}

interface CredentialsPayload {
  token:      string;
  email:      string;
  first_name: string;
  last_name:  string;
}

// ── Fix: all null initially — no localStorage on server ──────────────────────
const initialState: AuthState = {
  token:     null,
  email:     null,
  firstName: null,
  lastName:  null,
  loading:   false,
  error:     null,
};

// ── Async Thunks ──────────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    const res = await fetch(`${BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      return rejectWithValue(err.error || 'Login failed');
    }
    return res.json();
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const state = getState() as { auth: AuthState };
  const token = state.auth.token;
  await fetch(`${BASE_URL}/auth/logout/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
  });
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ── Hydrate Redux directly from already-fetched login data ────────────────
    setCredentials: (state, action: PayloadAction<CredentialsPayload>) => {
      state.token     = action.payload.token;
      state.email     = action.payload.email;
      state.firstName = action.payload.first_name;
      state.lastName  = action.payload.last_name;
    },
    clearAuth: (state) => {
      state.token     = null;
      state.email     = null;
      state.firstName = null;
      state.lastName  = null;
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
    },
    // ── Load persisted auth from localStorage on client mount ─────────────────
    loadAuthFromStorage: (state) => {
      state.token     = localStorage.getItem('token');
      state.email     = localStorage.getItem('email');
      state.firstName = localStorage.getItem('firstName');
      state.lastName  = localStorage.getItem('lastName');
    },
  },
  extraReducers: (builder) => {
    // ── Login ──
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error   = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading   = false;
      state.token     = action.payload.token;
      state.email     = action.payload.email;
      state.firstName = action.payload.first_name;
      state.lastName  = action.payload.last_name;
      localStorage.setItem('token',     action.payload.token);
      localStorage.setItem('email',     action.payload.email);
      localStorage.setItem('firstName', action.payload.first_name);
      localStorage.setItem('lastName',  action.payload.last_name);
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error   = action.payload as string;
    });

    // ── Logout ──
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.token     = null;
      state.email     = null;
      state.firstName = null;
      state.lastName  = null;
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
    });
  },
});

export const { clearAuth, loadAuthFromStorage, setCredentials } = authSlice.actions;
export default authSlice.reducer;