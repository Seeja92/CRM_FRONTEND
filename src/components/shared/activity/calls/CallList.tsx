"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CallForm from "./CallForm";
import {
  fetchCalls,
  createCall,
  updateCall,
  toggleCallExpand,
  Call,
} from "../../../../store/slices/activitySlice";

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
  const dispatch = useDispatch<any>();

  const { calls, loading } = useSelector((state: any) => state.activities);
  const activeCallSidRef = useRef("");
  const [activeCallSid, setActiveCallSid] = useState("");
 
  const [callingOpen, setCallingOpen] = useState(false);

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editingCallId, setEditingCallId] = useState<number | null>(null);
  const [editDuration, setEditDuration] = useState("");
  const [editOutcome, setEditOutcome] = useState("");
  const [saving, setSaving] = useState(false);

  // Add state
  const [isCallActive, setIsCallActive] = useState(false);
  const [logCallOpen, setLogCallOpen] = useState(false);

  // ── Fetch Calls ─────────────────────────────────────────────────────────────

  useEffect(() => {
    dispatch(fetchCalls({ entityType, entityId: entity.id }));
  }, [entity.id, entityType, dispatch]);

  // ── Toggle Expand ───────────────────────────────────────────────────────────
 
  const toggleExpand = (id: number) => {
    dispatch(toggleCallExpand(id));
  };

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
    setSaving(true);
    await dispatch(
      updateCall({
        id: callId,
        payload: {
          duration: editDuration,
          call_outcome: editOutcome,
        },
      }),
    );
    setSaving(false);
    handleEditCancel();
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
        calls.map((call: Call) => (
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
              <Box
                sx={{
                  borderTop: "1px solid #f0f0f0",
                  px: 3,
                  pb: 2.5,
                  pt: 1.5,
                  bgcolor: "#fff",
                }}
              >
                {/* Description / Note Text */}
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#4a5568",
                    lineHeight: 1.6,
                    mb: 2,
                  }}
                >
                  {call.note ||
                    "Brought Jane through our latest product line. He's interested and is going to get back to me."}
                </Typography>

                {/* Form Selection Fields Row */}
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Outcome Select Field */}
                  <Box sx={{ flex: 1, minWidth: 200, maxWidth: 300 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#4a5568",
                        fontWeight: 500,
                        mb: 0.5,
                      }}
                    >
                      Outcome <span style={{ color: "#e53e3e" }}>*</span>
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
                            color: val ? "#2d3748" : "#a0aec0",
                          }}
                        >
                          {val || "Choose"}
                        </Typography>
                      )}
                      sx={{
                        borderRadius: 1.5,
                        bgcolor: "#fff",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#cbd5e0",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#6c63ff",
                        },
                      }}
                    >
                      {outcomeOptions.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>

                  {/* Duration Select Field */}
                  <Box sx={{ flex: 1, minWidth: 160, maxWidth: 220 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#4a5568",
                        fontWeight: 500,
                        mb: 0.5,
                      }}
                    >
                      Duration <span style={{ color: "#e53e3e" }}>*</span>
                    </Typography>
                    <Select
                      fullWidth
                      size="small"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      displayEmpty
                      // Replacing default arrow with a clock icon to match your design image
                      IconComponent={AccessTimeIcon}
                      renderValue={(val) => (
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: val ? "#2d3748" : "#a0aec0",
                          }}
                        >
                          {val || "Choose"}
                        </Typography>
                      )}
                      sx={{
                        borderRadius: 1.5,
                        bgcolor: "#fff",
                        // Pushes the clock icon slightly left to match normal styling if needed
                        "& .MuiSelect-icon": { right: 12, color: "#718096" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#cbd5e0",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#6c63ff",
                        },
                      }}
                    >
                      {durationOptions.map((opt) => (
                        <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                          {opt}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        ))
      )}

      <Dialog
        open={callingOpen}
        onClose={() => {
          // Only allow closing if there isn't an active call running
          if (!isCallActive) setCallingOpen(false);
        }}
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

          {/* ── Dynamically show status only when call is active ── */}
          {isCallActive && (
            <Typography
              sx={{ fontSize: 14, color: "#4caf50", fontWeight: 600, mb: 1 }}
            >
              Dialing...
            </Typography>
          )}

          <Typography
            sx={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", mb: 0.5 }}
          >
            {entity?.name}
          </Typography>
          <Typography sx={{ fontSize: 14, color: "#666", mb: 4 }}>
            {entity?.phone || entity?.phone_number || "No phone number"}
          </Typography>

          {/* Start Call Button */}
          <Button
            variant="contained"
            disabled={isCallActive} // Disable if already calling
            onClick={async () => {
              try {
                const token = localStorage.getItem("access");
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/make-call/`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
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
                  setIsCallActive(true); // ──> Set text to appear
                }
              } catch (err) {
                console.error(err);
              }
            }}
            sx={{
              mb: 1,
              bgcolor: "#4caf50",
              "&:hover": { bgcolor: "#43a047" },
              width: "100%",
              maxWidth: "200px",
            }}
          >
            Start Call
          </Button>

          {/* End Call Button */}
          <Button
            variant="contained"
            disabled={!isCallActive} // Disable if no call is running
            onClick={async () => {
              try {
                const sid = activeCallSidRef.current || activeCallSid;
                if (!sid) return;

                const token = localStorage.getItem("access");
                await fetch(
                  `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/end-call/`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ sid }),
                  },
                );

                // Clean up all local states on end
                setIsCallActive(false); // ──> Set text to disappear
                setCallingOpen(false);
                setActiveCallSid("");
                activeCallSidRef.current = "";
                dispatch(fetchCalls({ entityType, entityId: entity.id }));
              } catch (err) {
                console.error(err);
              }
            }}
            sx={{
              bgcolor: "#e53935",
              "&:hover": { bgcolor: "#d32f2f" },
              width: "100%",
              maxWidth: "200px",
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
          await dispatch(
            createCall({
              entity_type: entityType,
              entity_id: entity.id,
              connected: data.connected,
              call_outcome: data.callOutcome,
              date: data.date,
              time: data.time,
              note: data.note,
            }),
          );
          dispatch(fetchCalls({ entityType, entityId: entity.id }));
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
