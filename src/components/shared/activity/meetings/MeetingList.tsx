
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  TextField,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import EditIcon from "@mui/icons-material/Edit";
import MeetingForm from "./MeetingForm";

interface Meeting {
  id: number;
  title: string;
  start_date: string;
  start_time: string;
  end_time: string;
  attendees: string;
  location: string;
  reminder: string;
  note: string;
  created_by_name: string;
  created_at: string;
  expanded?: boolean;
}

interface MeetingListProps {
  entity: any;
  entityType: "lead" | "deal" | "ticket" | "company";
}

export default function MeetingList({ entity, entityType }: MeetingListProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    start_date: "",
    start_time: "",
    end_time: "",
    attendees: "",
    location: "",
    reminder: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  // ── Fetch Meetings ──────────────────────────────────────────────────────────
  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/meetings/?entity_type=${entityType}&entity_id=${entity.id}`,
        { headers: { Authorization: `Token ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setMeetings(
          (data.results || data).map((m: Meeting) => ({
            ...m,
            expanded: false,
          })),
        );
      }
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [entity.id, entityType]);

  // ── Toggle Expand ───────────────────────────────────────────────────────────
  const toggleExpand = (id: number) =>
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, expanded: !m.expanded } : m)),
    );

  // ── Create Meeting ──────────────────────────────────────────────────────────
  const handleSave = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/meetings/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            entity_type: entityType,
            entity_id: entity.id,
            title: data.title,
            start_date: data.startDate,
            start_time: data.startTime,
            end_time: data.endTime,
            attendees: data.attendees.join(", "),
            location: data.location,
            reminder: data.reminder,
            note: data.note,
          }),
        },
      );
      if (res.ok) await fetchMeetings();
    } catch (err) {
      console.error("Failed to save meeting:", err);
    }
  };

  // ── Open Edit ───────────────────────────────────────────────────────────────
  const handleEditOpen = (e: React.MouseEvent, meeting: Meeting) => {
    e.stopPropagation(); // prevent row toggle
    setEditingMeetingId(meeting.id);
    setEditForm({
      title: meeting.title || "",
      start_date: meeting.start_date || "",
      start_time: meeting.start_time || "",
      end_time: meeting.end_time || "",
      attendees: meeting.attendees || "",
      location: meeting.location || "",
      reminder: meeting.reminder || "",
      note: meeting.note || "",
    });
    // ensure expanded so edit form is visible
    setMeetings((prev) =>
      prev.map((m) => (m.id === meeting.id ? { ...m, expanded: true } : m)),
    );
  };

  // ── Cancel Edit ─────────────────────────────────────────────────────────────
  const handleEditCancel = () => {
    setEditingMeetingId(null);
    setEditForm({
      title: "",
      start_date: "",
      start_time: "",
      end_time: "",
      attendees: "",
      location: "",
      reminder: "",
      note: "",
    });
  };

  // ── Save Edit (PATCH all fields) ────────────────────────────────────────────
  const handleUpdateMeeting = async (meetingId: number) => {
    if (!editForm.title.trim()) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/meetings/${meetingId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            title: editForm.title,
            start_date: editForm.start_date,
            start_time: editForm.start_time,
            end_time: editForm.end_time,
            attendees: editForm.attendees,
            location: editForm.location,
            reminder: editForm.reminder,
            note: editForm.note,
          }),
        },
      );
      if (res.ok) {
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === meetingId ? { ...m, ...editForm } : m,
          ),
        );
        handleEditCancel();
      } else {
        const err = await res.json();
        console.error("Failed to update meeting:", err);
      }
    } catch (err) {
      console.error("Failed to update meeting:", err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  // ── Field helper ────────────────────────────────────────────────────────────
  const fieldSx = {
    "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 13 },
  };

  const labelSx = { fontSize: 12, color: "#555", mb: 0.5, fontWeight: 500 };

  return (
    <Box>
      {/* ── Header ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 15 }}>Meetings</Typography>
        <Button
          variant="contained"
          onClick={() => setFormOpen(true)}
          sx={{
            bgcolor: "#6c63ff",
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
            "&:hover": { bgcolor: "#5a52d5" },
          }}
        >
          Create Meeting
        </Button>
      </Box>

      {/* ── Loading / Empty ── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress size={24} sx={{ color: "#6c63ff" }} />
        </Box>
      ) : meetings.length === 0 ? (
        <Typography
          sx={{ fontSize: 13, color: "#aaa", textAlign: "center", mt: 3 }}
        >
          No meetings yet. Schedule one!
        </Typography>
      ) : (
        meetings.map((meeting) => (
          <Box
            key={meeting.id}
            sx={{
              border: "1px solid #eee",
              borderRadius: 2,
              mb: 1.5,
              overflow: "hidden",
            }}
          >
            {/* ── Header Row ── */}
            <Box
              onClick={() => toggleExpand(meeting.id)}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.5,
                cursor: "pointer",
                "&:hover": { bgcolor: "#fafafa" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {meeting.expanded ? (
                  <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "#555" }} />
                ) : (
                  <KeyboardArrowRightIcon sx={{ fontSize: 16, color: "#555" }} />
                )}
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                  Meeting from {meeting.created_by_name}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* ── Edit Icon ── */}
                <IconButton
                  size="small"
                  onClick={(e) => handleEditOpen(e, meeting)}
                  sx={{ color: "#6c63ff", p: 0.5 }}
                >
                  <EditIcon sx={{ fontSize: 15 }} />
                </IconButton>
                <Typography
                  sx={{ fontSize: 12, color: "#aaa", whiteSpace: "nowrap" }}
                >
                  {formatDate(meeting.created_at)}
                </Typography>
              </Box>
            </Box>

            {/* ── Collapsed Preview ── */}
            {!meeting.expanded && (
              <Box sx={{ px: 2, pb: 1.5 }}>
                <Typography sx={{ fontSize: 13, color: "#777" }}>
                  {meeting.title}
                </Typography>
              </Box>
            )}

            {/* ── Expanded View ── */}
            {meeting.expanded && (
              <Box sx={{ borderTop: "1px solid #f5f5f5" }}>

                {/* ── Edit Mode ── */}
                {editingMeetingId === meeting.id ? (
                  <Box sx={{ px: 2, py: 2 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        mb: 2,
                        color: "#1a1a2e",
                      }}
                    >
                      Edit Meeting
                    </Typography>

                    {/* Title */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography sx={labelSx}>Title</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, title: e.target.value }))
                        }
                        sx={fieldSx}
                      />
                    </Box>

                    {/* Start Date + Start Time */}
                    <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={labelSx}>Start Date</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          value={editForm.start_date}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              start_date: e.target.value,
                            }))
                          }
                          sx={fieldSx}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={labelSx}>Start Time</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="time"
                          value={editForm.start_time}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              start_time: e.target.value,
                            }))
                          }
                          sx={fieldSx}
                        />
                      </Box>
                    </Box>

                    {/* End Time + Location */}
                    <Box sx={{ display: "flex", gap: 2, mb: 1.5 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={labelSx}>End Time</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          type="time"
                          value={editForm.end_time}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              end_time: e.target.value,
                            }))
                          }
                          sx={fieldSx}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={labelSx}>Location</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={editForm.location}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              location: e.target.value,
                            }))
                          }
                          sx={fieldSx}
                        />
                      </Box>
                    </Box>

                    {/* Attendees */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography sx={labelSx}>Attendees</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={editForm.attendees}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            attendees: e.target.value,
                          }))
                        }
                        placeholder="e.g. john@example.com, jane@example.com"
                        sx={fieldSx}
                      />
                    </Box>

                    {/* Reminder */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography sx={labelSx}>Reminder</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={editForm.reminder}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            reminder: e.target.value,
                          }))
                        }
                        sx={fieldSx}
                      />
                    </Box>

                    {/* Note */}
                    <Box sx={{ mb: 2 }}>
                      <Typography sx={labelSx}>Note</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={3}
                        value={editForm.note}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, note: e.target.value }))
                        }
                        sx={fieldSx}
                      />
                    </Box>

                    {/* Save / Cancel */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={saving}
                        onClick={() => handleUpdateMeeting(meeting.id)}
                        sx={{
                          bgcolor: "#6c63ff",
                          textTransform: "none",
                          borderRadius: 1.5,
                          fontWeight: 600,
                          "&:hover": { bgcolor: "#5a52d5" },
                        }}
                      >
                        {saving ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleEditCancel}
                        sx={{
                          textTransform: "none",
                          borderRadius: 1.5,
                          borderColor: "#ddd",
                          color: "#555",
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // ── Normal Expanded View ──
                  <Box>
                    <Box sx={{ px: 2, py: 1 }}>
                      <Typography sx={{ fontSize: 13, color: "#777" }}>
                        Organized by {meeting.created_by_name}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        bgcolor: "#f9f9fb",
                        px: 2,
                        py: 1.5,
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{ fontSize: 11, color: "#aaa", mb: 0.3 }}
                        >
                          Date & Time
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                          {meeting.start_date} {meeting.start_time}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{ fontSize: 11, color: "#aaa", mb: 0.3 }}
                        >
                          End Time
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                          {meeting.end_time}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{ fontSize: 11, color: "#aaa", mb: 0.3 }}
                        >
                          Attendees
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                          {meeting.attendees}
                        </Typography>
                      </Box>
                    </Box>
                    {meeting.location && (
                      <Box sx={{ px: 2, py: 1 }}>
                        <Typography
                          sx={{ fontSize: 11, color: "#aaa", mb: 0.3 }}
                        >
                          Location
                        </Typography>
                        <Typography sx={{ fontSize: 13 }}>
                          {meeting.location}
                        </Typography>
                      </Box>
                    )}
                    {meeting.reminder && (
                      <Box sx={{ px: 2, pb: 1 }}>
                        <Typography
                          sx={{ fontSize: 11, color: "#aaa", mb: 0.3 }}
                        >
                          Reminder
                        </Typography>
                        <Typography sx={{ fontSize: 13 }}>
                          {meeting.reminder}
                        </Typography>
                      </Box>
                    )}
                    {meeting.note && (
                      <Box sx={{ px: 2, pb: 1.5 }}>
                        <Typography
                          sx={{ fontSize: 11, color: "#aaa", mb: 0.3 }}
                        >
                          Note
                        </Typography>
                        <Typography
                          sx={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}
                        >
                          {meeting.note}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        ))
      )}

      <MeetingForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}