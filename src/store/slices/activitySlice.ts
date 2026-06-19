import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface Task {
  id: number;
  task_name: string;
  due_date: string;
  time: string;
  task_type: string;
  priority: string;
  assigned_to_names: string[];
  note: string;
  is_complete: boolean;
  created_at: string;
  expanded?: boolean;
}
export interface Note {
  id: number;
  content: string;
  created_by_name: string;
  created_at: string;
}
export interface Email {
  id: number;
  subject: string;
  recipients: string;
  cc: string;
  bcc: string;
  body: string;
  created_by_name: string;
  created_at: string;
  expanded?: boolean;
}
export interface Call {
  id: number;
  connected: string;
  call_outcome: string;
  duration: string;
  date: string;
  time: string;
  note: string;
  created_by_name: string;
  created_at: string;
  expanded?: boolean;
}

interface ActivityState {
  meetings: any[];
  notes: Note[];
  tasks: Task[];
  calls: Call[];
  emails: Email[];
  loading: boolean;
}

export const fetchNotes = createAsyncThunk(
  "activities/fetchNotes",
  async ({
    entityType,
    entityId,
  }: {
    entityType: string;
    entityId: number;
  }) => {
    const token = localStorage.getItem("access");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/notes/?entity_type=${entityType}&entity_id=${entityId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return await res.json();
  },
);

export const createNote = createAsyncThunk(
  "activities/createNote",
  async (payload: {
    entity_type: string;
    entity_id: number;
    content: string;
  }) => {
    const token = localStorage.getItem("access");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/notes/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    return await res.json();
  },
);

export const updateNote = createAsyncThunk(
  "activities/updateNote",
  async ({ id, content }: { id: number; content: string }) => {
    const token = localStorage.getItem("access");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/notes/${id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      },
    );
    return await res.json();
  },
);

export const fetchEmails = createAsyncThunk(
  "activities/fetchEmails",
  async ({
    entityType,
    entityId,
  }: {
    entityType: string;
    entityId: number;
  }) => {
    const token = localStorage.getItem("access");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/emails/?entity_type=${entityType}&entity_id=${entityId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return await res.json();
  },
);
export const sendEmail = createAsyncThunk(
  "activities/sendEmail",
  async (payload: {
    entity_type: string;
    entity_id: number;
    recipients: string;
    cc: string;
    bcc: string;
    subject: string;
    body: string;
  }) => {
    const token = localStorage.getItem("access");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/emails/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    return await res.json();
  },
);
export const updateEmail = createAsyncThunk(
  "activities/updateEmail",
  async ({
    id,
    subject,
    body,
  }: {
    id: number;
    subject: string;
    body: string;
  }) => {
    const token = localStorage.getItem("access");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/emails/${id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, body }),
      },
    );
    return await res.json();
  },
);

export const fetchMeetings = createAsyncThunk(
  "activities/fetchMeetings",
  async ({
    entityType,
    entityId,
  }: {
    entityType: string;
    entityId: number;
  }) => {
    const token = localStorage.getItem("access");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/meetings/?entity_type=${entityType}&entity_id=${entityId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return await res.json();
  },
);
export const createMeeting = createAsyncThunk(
  "activities/createMeeting",
  async (payload: any) => {
    const token = localStorage.getItem("access");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/meetings/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    return await res.json();
  },
);
export const updateMeeting = createAsyncThunk(
  "activities/updateMeeting",
  async ({ id, payload }: { id: number; payload: any }) => {
    const token = localStorage.getItem("access");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/meetings/${id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    return await res.json();
  },
);
export const fetchTasks = createAsyncThunk(
  "activities/fetchTasks",
  async ({
    entityType,
    entityId,
  }: {
    entityType: string;
    entityId: number;
  }) => {
    const token = localStorage.getItem("access");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/tasks/?entity_type=${entityType}&entity_id=${entityId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return await res.json();
  },
);

export const createTask = createAsyncThunk(
  "activities/createTask",
  async (payload: any, { rejectWithValue }) => {
    const token = localStorage.getItem("access");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/tasks/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      console.log("TASK CREATE ERROR:", data);
      return rejectWithValue(data);
    }

    return data;
  },
);

export const toggleTaskComplete = createAsyncThunk(
  "activities/toggleTaskComplete",
  async ({ id, isComplete }: { id: number; isComplete: boolean }) => {
    const token = localStorage.getItem("access");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/tasks/${id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_complete: isComplete }),
      },
    );
    return await res.json();
  },
);
export const fetchCalls = createAsyncThunk(
  "activities/fetchCalls",
  async ({
    entityType,
    entityId,
  }: {
    entityType: string;
    entityId: number;
  }) => {
    const token = localStorage.getItem("access");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/calls/?entity_type=${entityType}&entity_id=${entityId}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return await res.json();
  },
);
// export const createCall = createAsyncThunk(
//   "activities/createCall",
//   async (payload: any) => {
//     const token = localStorage.getItem("token");
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/calls/`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Token ${token}`,
//         },
//         body: JSON.stringify(payload),
//       },
//     );
//     return await res.json();
//   },
  
// );
export const createCall = createAsyncThunk(
  "activities/createCall",
  async (payload: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/calls/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await res.json();

      console.log("Call Save Status:", res.status);
      console.log("Call Save Result:", result);

      if (!res.ok) {
        return rejectWithValue(result);
      }

      return result;
    } catch (error) {
      console.error("Create Call Error:", error);
      return rejectWithValue(error);
    }
  }
);

export const updateCall = createAsyncThunk(
  "activities/updateCall",
  async ({
    id,
    payload,
  }: {
    id: number;
    payload: { duration: string; call_outcome: string };
  }) => {
    const token = localStorage.getItem("access");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/calls/${id}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );
    return await res.json();
  },
);

const initialState: ActivityState = {
  meetings: [],
  tasks: [],
  calls: [],
  emails: [],
  notes: [],
  loading: false,
};

const activitySlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    toggleTaskExpand: (state, action: { payload: number }) => {
      state.tasks = state.tasks.map((t) =>
        t.id === action.payload ? { ...t, expanded: !t.expanded } : t,
      );
    },
    toggleCallExpand: (state, action: PayloadAction<number>) => {
      state.calls = state.calls.map((c) =>
        c.id === action.payload ? { ...c, expanded: !c.expanded } : c,
      );
    },
    toggleEmailExpand: (state, action: PayloadAction<number>) => {
      state.emails = state.emails.map((e) =>
        e.id === action.payload ? { ...e, expanded: !e.expanded } : e,
      );
    },
    setEmailExpandedTrue: (state, action: PayloadAction<number>) => {
      state.emails = state.emails.map((e) =>
        e.id === action.payload ? { ...e, expanded: true } : e,
      );
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload.results || action.payload || [];
      })
      .addCase(fetchNotes.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        const updatedNote = action.payload;
        state.notes = state.notes.map((n) =>
          n.id === updatedNote.id ? { ...n, content: updatedNote.content } : n,
        );
      })

      .addCase(fetchEmails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmails.fulfilled, (state, action) => {
        state.loading = false;
        const rawEmails = action.payload.results || action.payload || [];
        state.emails = rawEmails.map((e: Email) => ({ ...e, expanded: false }));
      })
      .addCase(fetchEmails.rejected, (state) => {
        state.loading = false;
      })

      // ── Update Email Handlers ──
      .addCase(updateEmail.fulfilled, (state, action) => {
        const updatedEmail = action.payload;
        state.emails = state.emails.map((em) =>
          em.id === updatedEmail.id
            ? { ...em, subject: updatedEmail.subject, body: updatedEmail.body }
            : em,
        );
      })

      .addCase(fetchMeetings.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings = action.payload.results || action.payload;
      })

      .addCase(fetchMeetings.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        const rawTasks = action.payload.results || action.payload || [];
        // Map over raw backend response to securely append local layout states
        state.tasks = rawTasks.map((t: Task) => ({ ...t, expanded: false }));
      })
      .addCase(fetchTasks.rejected, (state) => {
        state.loading = false;
      })
      .addCase(fetchCalls.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCalls.fulfilled, (state, action) => {
        state.loading = false;
        const rawCalls = action.payload.results || action.payload || [];
        state.calls = rawCalls.map((c: Call) => ({ ...c, expanded: false }));
      })
      .addCase(fetchCalls.rejected, (state) => {
        state.loading = false;
      })

      // Inline updates to call items to mirror modifications immediately
      .addCase(updateCall.fulfilled, (state, action) => {
        const updatedCall = action.payload;
        state.calls = state.calls.map((c) =>
          c.id === updatedCall.id
            ? {
                ...c,
                duration: updatedCall.duration,
                call_outcome: updatedCall.call_outcome,
              }
            : c,
        );
      });
  },
});

export const {
  toggleTaskExpand,
  toggleCallExpand,
  toggleEmailExpand,
  setEmailExpandedTrue,
} = activitySlice.actions;
export default activitySlice.reducer;
