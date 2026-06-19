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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchMeetings,
  createMeeting,
  updateMeeting,
} from "@/store/slices/activitySlice";

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
  lead_name?: string;
}

interface MeetingListProps {
  entity: any;
  entityType: "lead" | "deal" | "ticket" | "company";
  lead?: any;
}

export default function MeetingList({
  entity,
  entityType,
  lead,
}: MeetingListProps) {
  const dispatch = useAppDispatch();

  // Select state directly from Redux
  const meetings = useAppSelector(
    (state) => state.activities.meetings,
  ) as Meeting[];
  const loading = useAppSelector((state) => state.activities.loading);

  const [formOpen, setFormOpen] = useState(false);
  

  // Keep track of expanded meeting rows locally by ID
  const [expandedMeetingIds, setExpandedMeetingIds] = useState<number[]>([]);


  
  const getEntityDisplayName = () => {
  switch (entityType) {
    case "lead":
      return entity?.name || "Guest";

    case "company":
      return entity?.company_name || "Guest";

    case "deal":
      return (
        entity?.lead_name ||
        entity?.associated_lead?.name ||
        `${entity?.associated_lead?.first_name || ""} ${
          entity?.associated_lead?.last_name || ""
        }`.trim()
      ) || "Guest";

    case "ticket":
      return (
        `${entity?.associated_deal?.associated_lead?.first_name || ""} ${
          entity?.associated_deal?.associated_lead?.last_name || ""
        }`.trim()
      ) || "Guest";

    default:
      return "Guest";
  }
};
  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editingMeetingId, setEditingMeetingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    start_date: "",
    start_time: "",
    end_time: "",
    attendees: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  // ── Fetch Meetings ──────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(
      fetchMeetings({
        entityType,
        entityId: entity.id,
      }),
    );
  }, [dispatch, entity.id, entityType]);

  // ── Toggle Expand ───────────────────────────────────────────────────────────
  const toggleExpand = (id: number) => {
    setExpandedMeetingIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id],
    );
  };

  // ── Create Meeting ──────────────────────────────────────────────────────────
  const handleSave = async (data: any) => {
    const payload = {
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
    };

    await dispatch(createMeeting(payload));
    // Re-fetch to pull updated list
    dispatch(fetchMeetings({ entityType, entityId: entity.id }));
    setFormOpen(false);
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
      note: meeting.note || "",
    });

    // Ensure row is expanded when editing
    if (!expandedMeetingIds.includes(meeting.id)) {
      setExpandedMeetingIds((prev) => [...prev, meeting.id]);
    }
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
      note: "",
    });
  };

  // ── Save Edit ────────────────────────────────────────────────────────────
  const handleUpdateMeetingSubmit = async (meetingId: number) => {
    if (!editForm.title.trim()) return;
    try {
      setSaving(true);
      await dispatch(
        updateMeeting({
          id: meetingId,
          payload: editForm,
        }),
      );
      handleEditCancel();
      // Refresh list from server to capture updates safely
      dispatch(fetchMeetings({ entityType, entityId: entity.id }));
    } catch (err) {
      console.error("Failed to update meeting:", err);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
console.log("Meeting entity:", entity);
  const getDuration = (start: string, end: string) => {
    if (!start || !end) return "-";
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes <= 0) return "-";

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours > 0 && minutes > 0) return `${hours} hr ${minutes} min`;
    if (hours > 0) return `${hours} hr`;
    return `${minutes} min`;
  };

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
        meetings.map((meeting) => {
          const isExpanded = expandedMeetingIds.includes(meeting.id);
          const isEditing = editingMeetingId === meeting.id;

          return (
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
                  {isExpanded ? (
                    <KeyboardArrowDownIcon
                      sx={{ fontSize: 16, color: "#555" }}
                    />
                  ) : (
                    <KeyboardArrowRightIcon
                      sx={{ fontSize: 16, color: "#555" }}
                    />
                  )}
                 
<Typography sx={{ fontSize: 13, fontWeight: 500 }}>
  Meeting {meeting.created_by_name || "Unknown"} and {getEntityDisplayName()}
</Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
              {!isExpanded && (
                <Box sx={{ px: 2, pb: 1.5 }}>
                  <Typography sx={{ fontSize: 13, color: "#777" }}>
                    {meeting.title}
                  </Typography>
                </Box>
              )}

              {/* ── Expanded Content Box ── */}
              {isExpanded && (
                <Box
                  sx={{ borderTop: "1px solid #f5f5f5", p: isEditing ? 2 : 0 }}
                >
                  {isEditing ? (
                    /* ── EDIT MODE VIEW ── */
                    <Box>
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

                      <Box sx={{ mb: 1.5 }}>
                        <Typography sx={labelSx}>Title</Typography>
                        <TextField
                          fullWidth
                          size="small"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm((p) => ({
                              ...p,
                              title: e.target.value,
                            }))
                          }
                          sx={fieldSx}
                        />
                      </Box>

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
                            InputLabelProps={{ shrink: true }}
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
                            InputLabelProps={{ shrink: true }}
                          />
                        </Box>
                      </Box>

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
                            InputLabelProps={{ shrink: true }}
                          />
                        </Box>
                        <Box sx={{ flex: 1 }}>
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
                            sx={fieldSx}
                          />
                        </Box>
                      </Box>

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

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          disabled={saving}
                          onClick={() => handleUpdateMeetingSubmit(meeting.id)}
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
                    /* ── READ ONLY EXPANDED VIEW ── */
                    <Box>
                      <Box sx={{ px: 2, py: 1 }}>
                        <Typography sx={{ fontSize: 13, color: "#777" }}>
                          Organized by {meeting.created_by_name || "Unknown"}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          mx: 2,
                          mb: 1.5,
                          borderRadius: 2,
                          bgcolor: "#f3f5f8",
                          px: 2,
                          py: 1.5,
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 3,
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{ fontSize: 11, color: "#888", mb: 0.5 }}
                          >
                            Date & Time
                          </Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                            {meeting.start_date} at {meeting.start_time}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            sx={{ fontSize: 11, color: "#888", mb: 0.5 }}
                          >
                            Duration
                          </Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                            {getDuration(meeting.start_time, meeting.end_time)}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography
                            sx={{ fontSize: 11, color: "#888", mb: 0.5 }}
                          >
                            Attendees
                          </Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                            {meeting.attendees
                              ? meeting.attendees.split(",").length
                              : 0}
                          </Typography>
                        </Box>
                      </Box>

                      {meeting.note && (
                        <Box sx={{ px: 2, pb: 1.5 }}>
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: "#555",
                              lineHeight: 1.6,
                            }}
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
          );
        })
      )}

      <MeetingForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        entity={entity}
        entityType={entityType}
      />
    </Box>
  );
}

