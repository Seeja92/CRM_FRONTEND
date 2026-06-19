import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const getToken = () => localStorage.getItem("access");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

export interface Company {
  id: number;
  company_name: string;
  domain_name: string;
  industry: string;
  type: string;
  city: string;
  country: string;
  phone_number: string;
  email: string;
  created_at: string;
  company_owner: any[];
  no_of_employees?: string; // ← add
  annual_revenue?: string; // ← add
}

interface CompaniesState {
  companies: Company[];
  selectedCompany: Company | null; // ← add this
  users: any[]; // ← add this
  activities: any[]; // ← add this
  activityLoading: boolean; // ← add this
  loading: boolean;
  error: string | null;
  count: number;
}

const initialState: CompaniesState = {
  companies: [],
  selectedCompany: null,
  users: [],
  activities: [],
  activityLoading: false,
  loading: false,
  error: null,
  count: 0,
};

// ── Existing Thunks ────────────────────────────────────────────────────────────
export const fetchCompanies = createAsyncThunk(
  "companies/fetchAll",
  async (
    filters: {
      search?: string;
      industry?: string;
      city?: string;
      country?: string;
      lead_status?: string;
      date_from?: string; // ← add
      date_to?: string; // ← add
    } = {},
  ) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.industry && filters.industry !== "All")
      params.append("industry", filters.industry);
    if (filters.city && filters.city !== "All")
      params.append("city", filters.city);
    if (filters.country && filters.country !== "All")
      params.append("country", filters.country);
    if (filters.lead_status && filters.lead_status !== "All")
      params.append("lead_status", filters.lead_status);
    if (filters.date_from) params.append("date_from", filters.date_from); // ← add
    if (filters.date_to) params.append("date_to", filters.date_to);

    const res = await fetch(
      `${BASE_URL}/companies/${params.toString() ? `?${params.toString()}` : ""}`,
      { headers: headers() },
    );
    const data = await res.json();
    return { companies: data.results || [], count: data.count || 0 };
  },
);

export const createCompany = createAsyncThunk(
  "companies/create",
  async (payload: object) => {
    const res = await fetch(`${BASE_URL}/companies/`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },
);

export const updateCompany = createAsyncThunk(
  "companies/update",
  async ({ id, payload }: { id: number; payload: object }) => {
    const res = await fetch(`${BASE_URL}/companies/${id}/`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },
);

// export const deleteCompany = createAsyncThunk(
//   "companies/delete",
//   async (id: number) => {
//     await fetch(`${BASE_URL}/companies/${id}/`, {
//       method: "DELETE",
//       headers: headers(),
//     });
//     return id;
//   },
// );

export const deleteCompany = createAsyncThunk(
  "companies/delete",
  async (id: number, { rejectWithValue }) => {
    const res = await fetch(
      `${BASE_URL}/companies/${id}/`,
      {
        method: "DELETE",
        headers: headers(),
      }
    );

    if (!res.ok) {
      const error = await res.json();
      return rejectWithValue(
        error.detail || "Failed to delete company"
      );
    }

    return id;
  }
);

// ── NEW Thunks ─────────────────────────────────────────────────────────────────

// Fetch single company by ID (for view page + edit drawer)
export const fetchCompanyById = createAsyncThunk(
  "companies/fetchById",
  async (id: number) => {
    const res = await fetch(`${BASE_URL}/companies/${id}/`, {
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch company");
    return data;
  },
);

// Fetch users (for owner dropdown)
export const fetchUsers = createAsyncThunk("companies/fetchUsers", async () => {
  const res = await fetch(`${BASE_URL}/auth/users/`, {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("Failed to fetch users");
  return Array.isArray(data) ? data : data.results || [];
});

// Import companies via CSV
export const importCompanies = createAsyncThunk(
  "companies/import",
  async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/companies/import/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` }, // No Content-Type for FormData
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Import failed");
    return data; // { imported_count: number }
  },
);

// Fetch all activities for a company
export const fetchCompanyActivities = createAsyncThunk(
  "companies/fetchActivities",
  async (companyId: number) => {
    const token = localStorage.getItem("access");
    const authHeaders = { Authorization: `Bearer ${token}` };
    const base = `${BASE_URL}/activities`;
    const params = `?entity_type=company&entity_id=${companyId}`;

    const [notes, calls, tasks, meetings, emails] = await Promise.all([
      fetch(`${base}/notes/${params}`, { headers: authHeaders }).then((r) =>
        r.json(),
      ),
      fetch(`${base}/calls/${params}`, { headers: authHeaders }).then((r) =>
        r.json(),
      ),
      fetch(`${base}/tasks/${params}`, { headers: authHeaders }).then((r) =>
        r.json(),
      ),
      fetch(`${base}/meetings/${params}`, { headers: authHeaders }).then((r) =>
        r.json(),
      ),
      fetch(`${base}/emails/${params}`, { headers: authHeaders }).then((r) =>
        r.json(),
      ),
    ]);

    const ticketsRes = await fetch(
      `${BASE_URL}/tickets/?company_id=${companyId}`,
      { headers: authHeaders },
    );
    const ticketsData = ticketsRes.ok ? await ticketsRes.json() : [];
    const ticketsList = ticketsData.results || ticketsData || [];

    const mapped = [
      ...(notes.results || notes || []).map((n: any) => ({
        id: `note-${n.id}`,
        type: "Note",
        title: n.content || "Note",
        description: n.content || "",
        assignee: n.created_by_name,
        date: n.created_at,
        isOverdue: false,
        is_complete: false,
      })),
      ...(calls.results || calls || []).map((c: any) => ({
        id: `call-${c.id}`,
        type: "Call",
        title: c.note || c.call_outcome || "Call",
        description: c.call_outcome || "",
        assignee: c.created_by_name,
        date: c.created_at,
        isOverdue: false,
        is_complete: false,
      })),
      ...(tasks.results || tasks || []).map((t: any) => ({
        id: `task-${t.id}`,
        type: "Task",
        title: t.task_name || "Task",
        description: t.description || "",
        assignee: t.assigned_to_name,
        date: t.created_at,
        dueDate: t.due_date,
        is_complete: t.is_complete,
        isOverdue: new Date(t.due_date) < new Date() && !t.is_complete,
      })),
      ...(meetings.results || meetings || []).map((m: any) => ({
        id: `meeting-${m.id}`,
        type: "Meeting",
        title: m.title || "Meeting",
        description: m.description || "",
        assignee: m.created_by_name,
        date: m.created_at,
        isOverdue: false,
        is_complete: false,
      })),
      ...(emails.results || emails || []).map((e: any) => ({
        id: `email-${e.id}`,
        type: "Email",
        title: e.subject || "Email",
        description: e.body || "",
        assignee: e.created_by_name,
        date: e.created_at,
        isOverdue: false,
        is_complete: false,
      })),
      ...ticketsList.map((t: any) => ({
        id: `ticket-${t.id}`,
        type: "Ticket",
        title: `${t.ticket_name} — ${t.status}`,
        assignee: t.associated_deal?.associated_lead
          ? `${t.associated_deal.associated_lead.first_name || ""} ${t.associated_deal.associated_lead.last_name || ""}`.trim()
          : t.owner_name || "—",
        date: t.created_at,
        isOverdue: false,
        is_complete: t.status === "Closed" || t.status === "Resolved",
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return mapped;
  },
);

// ── Slice ──────────────────────────────────────────────────────────────────────
const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    clearSelectedCompany(state) {
      // ← call this when leaving view page
      state.selectedCompany = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder.addCase(fetchCompanies.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCompanies.fulfilled, (state, action) => {
      state.loading = false;
      state.companies = action.payload.companies;
      state.count = action.payload.count;
    });
    builder.addCase(fetchCompanies.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to fetch companies";
    });

    // Fetch By ID
    builder.addCase(fetchCompanyById.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchCompanyById.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedCompany = action.payload;
    });
    builder.addCase(fetchCompanyById.rejected, (state) => {
      state.loading = false;
    });

    // Fetch Users
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.users = action.payload;
    });

    // Import
    builder.addCase(importCompanies.fulfilled, (state) => {
      // Refetch will happen in the page after dispatch
    });

    // Fetch Activities
    builder.addCase(fetchCompanyActivities.pending, (state) => {
      state.activityLoading = true;
    });
    builder.addCase(fetchCompanyActivities.fulfilled, (state, action) => {
      state.activityLoading = false;
      state.activities = action.payload;
    });
    builder.addCase(fetchCompanyActivities.rejected, (state) => {
      state.activityLoading = false;
    });

    // Create
    builder.addCase(createCompany.fulfilled, (state, action) => {
      state.companies.unshift(action.payload);
      state.count += 1;
    });

    // Update
    builder.addCase(updateCompany.fulfilled, (state, action) => {
      const index = state.companies.findIndex(
        (c) => c.id === action.payload.id,
      );
      if (index !== -1) state.companies[index] = action.payload;
      if (state.selectedCompany?.id === action.payload.id) {
        state.selectedCompany = action.payload;
      }
    });

    // Delete
    builder.addCase(deleteCompany.fulfilled, (state, action) => {
      state.companies = state.companies.filter((c) => c.id !== action.payload);
      state.count -= 1;
    });
  },
});

export const { clearSelectedCompany } = companiesSlice.actions;
export default companiesSlice.reducer;
