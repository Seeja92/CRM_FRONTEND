"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogContent,
  Avatar,
  CircularProgress,
  IconButton,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import EditIcon from "@mui/icons-material/Edit";
import CallForm from "./CallForm";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Call {
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

interface CallListProps {
  entity: any;
  entityType: "lead" | "deal" | "ticket" | "company";
}

// ── Constants ─────────────────────────────────────────────────────────────────
const outcomeOptions = [
  "Busy",
  "Connected",
  "Left live message",
  "Left voicemail",
  "No answer",
  "Wrong number",
];

const durationOptions = [
  "1 min",
  "2 min",
  "5 min",
  "10 min",
  "15 min",
  "30 min",
  "45 min",
  "1 hour",
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function CallList({ entity, entityType }: CallListProps) {
  const activeCallSidRef = useRef("");
  const [activeCallSid, setActiveCallSid] = useState("");
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [callingOpen, setCallingOpen] = useState(false);

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editingCallId, setEditingCallId] = useState<number | null>(null);
  const [editDuration, setEditDuration] = useState("");
  const [editOutcome, setEditOutcome] = useState("");
  const [saving, setSaving] = useState(false);

  // Add state
  const [logCallOpen, setLogCallOpen] = useState(false);

  // ── Fetch Calls ─────────────────────────────────────────────────────────────
  const fetchCalls = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/calls/?entity_type=${entityType}&entity_id=${entity.id}`,
        { headers: { Authorization: `Token ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setCalls(
          (data.results || data).map((c: Call) => ({ ...c, expanded: false })),
        );
      }
    } catch (err) {
      console.error("Failed to fetch calls:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [entity.id, entityType]);

  // ── Toggle Expand ───────────────────────────────────────────────────────────
  const toggleExpand = (id: number) =>
    setCalls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, expanded: !c.expanded } : c)),
    );

  // ── Open Edit Mode ──────────────────────────────────────────────────────────
  const handleEditOpen = (e: React.MouseEvent, call: Call) => {
    e.stopPropagation(); // prevent row toggle
    setEditingCallId(call.id);
    setEditDuration(call.duration || "");
    setEditOutcome(call.call_outcome || "");
  };

  // ── Cancel Edit ─────────────────────────────────────────────────────────────
  const handleEditCancel = () => {
    setEditingCallId(null);
    setEditDuration("");
    setEditOutcome("");
  };

  // ── Save Edit (PATCH duration + outcome) ────────────────────────────────────
  const handleUpdateCall = async (callId: number) => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/calls/${callId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            duration: editDuration,
            call_outcome: editOutcome, // ── matches backend field name
          }),
        },
      );
      if (res.ok) {
        setCalls((prev) =>
          prev.map((c) =>
            c.id === callId
              ? { ...c, duration: editDuration, call_outcome: editOutcome }
              : c,
          ),
        );
        handleEditCancel();
      } else {
        const err = await res.json();
        console.error("Failed to update call:", err);
      }
    } catch (err) {
      console.error("Failed to update call:", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Format Date ─────────────────────────────────────────────────────────────
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  // ── Render ──────────────────────────────────────────────────────────────────
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
        <Typography sx={{ fontWeight: 600, fontSize: 15 }}>Calls</Typography>

        <Button
          variant="contained"
          onClick={() => setCallingOpen(true)}
          sx={{
            bgcolor: "#6c63ff",
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
            "&:hover": { bgcolor: "#5a52d5" },
          }}
        >
          Make a Phone Call
        </Button>
      </Box>

      {/* ── Loading / Empty ── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress size={24} sx={{ color: "#6c63ff" }} />
        </Box>
      ) : calls.length === 0 ? (
        <Typography
          sx={{ fontSize: 13, color: "#aaa", textAlign: "center", mt: 3 }}
        >
          No calls logged yet.
        </Typography>
      ) : (
        calls.map((call) => (
          <Box
            key={call.id}
            sx={{
              border: "1px solid #eee",
              borderRadius: 2,
              mb: 1.5,
              overflow: "hidden",
            }}
          >
            {/* ── Header Row ── */}
            <Box
              onClick={() => toggleExpand(call.id)}
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
                {call.expanded ? (
                  <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "#555" }} />
                ) : (
                  <KeyboardArrowRightIcon
                    sx={{ fontSize: 16, color: "#555" }}
                  />
                )}
                <Typography sx={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>Call</span> from{" "}
                  {call.created_by_name}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* ── Edit Button ── */}
                <IconButton
                  size="small"
                  onClick={(e) => handleEditOpen(e, call)}
                  sx={{ color: "#6c63ff", p: 0.5 }}
                >
                  <EditIcon sx={{ fontSize: 15 }} />
                </IconButton>
                <Typography
                  sx={{ fontSize: 12, color: "#aaa", whiteSpace: "nowrap" }}
                >
                  {formatDate(call.created_at)}
                </Typography>
              </Box>
            </Box>

            {/* ── Collapsed Preview ── */}
            {!call.expanded && (
              <Box sx={{ px: 2, pb: 1.5 }}>
                <Typography sx={{ fontSize: 13, color: "#777" }}>
                  {call.note}
                </Typography>
              </Box>
            )}

            {/* ── Expanded View ── */}
            {call.expanded && (
              <Box sx={{ borderTop: "1px solid #f5f5f5" }}>
                {/* ── Edit Mode ── */}
                {editingCallId === call.id ? (
                  <Box sx={{ px: 2, py: 2 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        mb: 1.5,
                        color: "#1a1a2e",
                      }}
                    >
                      Edit Call Details
                    </Typography>
                    <Box
                      sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}
                    >
                      {/* Duration */}
                      <Box sx={{ flex: 1, minWidth: 140 }}>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "#555",
                            mb: 0.5,
                            fontWeight: 500,
                          }}
                        >
                          Duration
                        </Typography>
                        <Select
                          fullWidth
                          size="small"
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                          displayEmpty
                          IconComponent={KeyboardArrowDownIcon}
                          renderValue={(val) => (
                            <Typography
                              sx={{
                                fontSize: 13,
                                color: val ? "#333" : "#aaa",
                              }}
                            >
                              {val || "Select duration"}
                            </Typography>
                          )}
                          sx={{
                            borderRadius: 1.5,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#ddd",
                            },
                          }}
                        >
                          {durationOptions.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>

                      {/* Outcome */}
                      <Box sx={{ flex: 1, minWidth: 160 }}>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "#555",
                            mb: 0.5,
                            fontWeight: 500,
                          }}
                        >
                          Outcome
                        </Typography>
                        <Select
                          fullWidth
                          size="small"
                          value={editOutcome}
                          onChange={(e) => setEditOutcome(e.target.value)}
                          displayEmpty
                          IconComponent={KeyboardArrowDownIcon}
                          renderValue={(val) => (
                            <Typography
                              sx={{
                                fontSize: 13,
                                color: val ? "#333" : "#aaa",
                              }}
                            >
                              {val || "Select outcome"}
                            </Typography>
                          )}
                          sx={{
                            borderRadius: 1.5,
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: "#ddd",
                            },
                          }}
                        >
                          {outcomeOptions.map((opt) => (
                            <MenuItem
                              key={opt}
                              value={opt}
                              sx={{ fontSize: 13 }}
                            >
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>
                    </Box>

                    {/* Save / Cancel */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={saving}
                        onClick={() => handleUpdateCall(call.id)}
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
                  <Box sx={{ px: 2, pb: 2, pt: 1.5 }}>
                    <Typography sx={{ fontSize: 13, color: "#555", mb: 1.5 }}>
                      {call.note}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{ fontSize: 11, color: "#aaa", mb: 0.3 }}
                        >
                          Outcome
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                          {call.call_outcome || "—"}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{ fontSize: 11, color: "#aaa", mb: 0.3 }}
                        >
                          Duration
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                          {call.duration || "—"}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          sx={{ fontSize: 11, color: "#aaa", mb: 0.3 }}
                        >
                          Date & Time
                        </Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                          {call.date} {call.time}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        ))
      )}

      {/* ── Calling Dialog ── */}
      <Dialog
        open={callingOpen}
        onClose={() => setCallingOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent
          sx={{
            py: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Avatar
            sx={{
              width: 70,
              height: 70,
              mb: 2,
              bgcolor: "#6c63ff",
              fontSize: 28,
            }}
          >
            {(
              entity?.name ||
              entity?.company_name ||
              entity?.deal_name
            )?.charAt(0)}
          </Avatar>
          <Typography sx={{ fontSize: 14, color: "#888", mb: 1 }}>
            Calling...
          </Typography>
          <Typography
            sx={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", mb: 0.5 }}
          >
            {entity?.name}
          </Typography>

          <Typography sx={{ fontSize: 14, color: "#666", mb: 4 }}>
            {entity?.phone || entity?.phone_number || "No phone number"}
          </Typography>

          <Button
            variant="contained"
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");

                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/make-call/`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({
                      to_phone: entity?.phone || entity?.phone_number,
                      entity_type: entityType,
                      entity_id: entity.id,
                      connected:
                        entity?.name ||
                        entity?.company_name ||
                        entity?.deal_name ||
                        "",
                    }),
                  },
                );

                const data = await res.json();

                if (res.ok) {
                  setActiveCallSid(data.sid);
                  activeCallSidRef.current = data.sid;
                } else {
                }
              } catch (err) {
                console.error(err);
              }
            }}
            sx={{
              mb: 1,
              bgcolor: "#4caf50",
              "&:hover": { bgcolor: "#43a047" },
            }}
          >
            Start Call
          </Button>

          <Button
            variant="contained"
            onClick={async () => {
              try {
                const sid = activeCallSidRef.current || activeCallSid;
               
                if (!sid) {
                  return;
                }

                const token = localStorage.getItem("token");
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/end-call/`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({ sid }),
                  },
                );

                // close regardless of response
                setCallingOpen(false);
                setActiveCallSid("");
                activeCallSidRef.current = "";
                await fetchCalls();
              } catch (err) {
                console.error(err);
              }
            }}
            sx={{
              bgcolor: "#e53935",
              "&:hover": { bgcolor: "#d32f2f" },
            }}
          >
            End Call
          </Button>
        </DialogContent>
      </Dialog>
      {/* ── Log Call Form ── */}
      <CallForm
        open={logCallOpen}
        onClose={() => setLogCallOpen(false)}
        onSave={async (data) => {
          try {
            const token = localStorage.getItem("token");
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/calls/`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Token ${token}`,
                },
                body: JSON.stringify({
                  entity_type: entityType,
                  entity_id: entity.id,
                  connected: data.connected,
                  call_outcome: data.callOutcome,
                  date: data.date,
                  time: data.time,
                  note: data.note,
                }),
              },
            );
            if (res.ok) {
              await fetchCalls();
            } else {
              const err = await res.json();
              console.error("Failed to save call:", err);
            }
          } catch (err) {
            console.error("Failed to save call:", err);
          }
          setLogCallOpen(false);
        }}
        defaultContact={
          entity?.name || entity?.company_name || entity?.deal_name || ""
        }
        defaultPhone={entity?.phone_number || entity?.phone || ""}
      />
    </Box>
  );
}
