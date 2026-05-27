import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ── Types ─────────────────────────────────────────────────────────────────────
export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  related_id: string | number | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// ── Async Thunks ──────────────────────────────────────────────────────────────

// 1. Fetch all notifications from database
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      if (!token) return rejectWithValue('No auth token found');

      const res = await fetch(`${BASE_URL}/notifications/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to download notifications');
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message || 'Something went wrong');
    }
  }
);

// 2. Mark all notifications as read in database
export const markNotificationsAsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      if (!token) return rejectWithValue('No auth token found');

      const res = await fetch(`${BASE_URL}/notifications/mark-read/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to update notifications read status');
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// 3. Clear all notifications from database
export const clearAllNotifications = createAsyncThunk(
  'notifications/clearAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { token: string | null } };
      const token = state.auth.token;

      if (!token) return rejectWithValue('No auth token found');

      const res = await fetch(`${BASE_URL}/notifications/clear/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to clear notifications');
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Optimistic UI update — clears badge instantly on bell click
    clearUnreadCountLocal: (state) => {
      state.unreadCount = 0;
      state.items = state.items.map((n) => ({ ...n, is_read: true }));
    },
    // Wipe data completely when logging out
    resetNotifications: () => initialState,
  },
  extraReducers: (builder) => {

    // ── fetchNotifications ──
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
      state.unreadCount = action.payload.filter((n: NotificationItem) => !n.is_read).length;
      state.error = null;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ── clearAllNotifications ──
    builder.addCase(clearAllNotifications.fulfilled, (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.error = null;
    });
    builder.addCase(clearAllNotifications.rejected, (state, action) => {
      state.error = action.payload as string;
    });

  },
});

export const { clearUnreadCountLocal, resetNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;