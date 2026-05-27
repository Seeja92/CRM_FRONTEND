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
import EmailForm from "./EmailForm";

interface Email {
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

interface EmailListProps {
  entity: any;
  entityType: "lead" | "deal" | "ticket" | "company";
}

export default function EmailList({ entity, entityType }: EmailListProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editingEmailId, setEditingEmailId] = useState<number | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Fetch Emails ────────────────────────────────────────────────────────────
  const fetchEmails = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/emails/?entity_type=${entityType}&entity_id=${entity.id}`,
        { headers: { Authorization: `Token ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setEmails(
          (data.results || data).map((e: Email) => ({
            ...e,
            expanded: false,
          })),
        );
      }
    } catch (err) {
      console.error("Failed to fetch emails:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [entity.id, entityType]);

  // ── Toggle Expand ───────────────────────────────────────────────────────────
  const toggleExpand = (id: number) =>
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, expanded: !e.expanded } : e)),
    );

  // ── Send Email ──────────────────────────────────────────────────────────────
  const handleSend = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/emails/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            entity_type: entityType,
            entity_id: entity.id,
            recipients: data.recipients,
            cc: data.cc,
            bcc: data.bcc,
            subject: data.subject,
            body: data.body,
          }),
        },
      );
      if (res.ok) await fetchEmails();
    } catch (err) {
      console.error("Failed to send email:", err);
    }
  };

  // ── Open Edit ───────────────────────────────────────────────────────────────
  const handleEditOpen = (e: React.MouseEvent, email: Email) => {
    e.stopPropagation(); // prevent row toggle
    setEditingEmailId(email.id);
    setEditSubject(email.subject);
    setEditBody(email.body);
    // ensure expanded so edit form is visible
    setEmails((prev) =>
      prev.map((em) => (em.id === email.id ? { ...em, expanded: true } : em)),
    );
  };

  // ── Cancel Edit ─────────────────────────────────────────────────────────────
  const handleEditCancel = () => {
    setEditingEmailId(null);
    setEditSubject("");
    setEditBody("");
  };

  // ── Save Edit (PATCH subject + body) ────────────────────────────────────────
  const handleUpdateEmail = async (emailId: number) => {
    if (!editSubject.trim() || !editBody.trim()) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/emails/${emailId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            subject: editSubject,
            body: editBody,
          }),
        },
      );
      if (res.ok) {
        setEmails((prev) =>
          prev.map((em) =>
            em.id === emailId
              ? { ...em, subject: editSubject, body: editBody }
              : em,
          ),
        );
        handleEditCancel();
      } else {
        const err = await res.json();
        console.error("Failed to update email:", err);
      }
    } catch (err) {
      console.error("Failed to update email:", err);
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
        <Typography sx={{ fontWeight: 600, fontSize: 15 }}>Emails</Typography>
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
          Create Email
        </Button>
      </Box>

      {/* ── Loading / Empty ── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress size={24} sx={{ color: "#6c63ff" }} />
        </Box>
      ) : emails.length === 0 ? (
        <Typography
          sx={{ fontSize: 13, color: "#aaa", textAlign: "center", mt: 3 }}
        >
          No emails yet. Send one!
        </Typography>
      ) : (
        emails.map((email) => (
          <Box
            key={email.id}
            sx={{
              border: "1px solid #eee",
              borderRadius: 2,
              mb: 1.5,
              overflow: "hidden",
            }}
          >
            {/* ── Header Row ── */}
            <Box
              onClick={() => toggleExpand(email.id)}
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
                {email.expanded ? (
                  <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "#555" }} />
                ) : (
                  <KeyboardArrowRightIcon
                    sx={{ fontSize: 16, color: "#555" }}
                  />
                )}
                <Typography sx={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>
                    Logged Email - {email.subject}
                  </span>{" "}
                  by {email.created_by_name}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* ── Edit Icon ── */}
                <IconButton
                  size="small"
                  onClick={(e) => handleEditOpen(e, email)}
                  sx={{ color: "#6c63ff", p: 0.5 }}
                >
                  <EditIcon sx={{ fontSize: 15 }} />
                </IconButton>
                <Typography
                  sx={{ fontSize: 12, color: "#aaa", whiteSpace: "nowrap" }}
                >
                  {formatDate(email.created_at)}
                </Typography>
              </Box>
            </Box>

            {/* ── Collapsed Preview ── */}
            {!email.expanded && (
              <Box sx={{ px: 2, pb: 1.5 }}>
                <Typography sx={{ fontSize: 13, color: "#777" }}>
                  To {email.recipients}
                </Typography>
              </Box>
            )}

            {/* ── Expanded View ── */}
            {email.expanded && (
              <Box sx={{ px: 2, pb: 2, borderTop: "1px solid #f5f5f5" }}>
                {/* ── Edit Mode ── */}
                {editingEmailId === email.id ? (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        mb: 1.5,
                        color: "#1a1a2e",
                      }}
                    >
                      Edit Email
                    </Typography>

                    {/* Subject */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#555",
                          mb: 0.5,
                          fontWeight: 500,
                        }}
                      >
                        Subject
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={editSubject}
                        onChange={(e) => setEditSubject(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            fontSize: 13,
                          },
                        }}
                      />
                    </Box>

                    {/* Body */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#555",
                          mb: 0.5,
                          fontWeight: 500,
                        }}
                      >
                        Body
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        size="small"
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            fontSize: 13,
                          },
                        }}
                      />
                    </Box>

                    {/* Save / Cancel */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="contained"
                        disabled={saving}
                        onClick={() => handleUpdateEmail(email.id)}
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
                  <Box sx={{ mt: 1 }}>
                    <Typography sx={{ fontSize: 13, color: "#555", mb: 0.5 }}>
                      To: {email.recipients}
                    </Typography>
                    {email.cc && (
                      <Typography sx={{ fontSize: 13, color: "#555", mb: 0.5 }}>
                        Cc: {email.cc}
                      </Typography>
                    )}
                    {email.bcc && (
                      <Typography sx={{ fontSize: 13, color: "#555", mb: 0.5 }}>
                        Bcc: {email.bcc}
                      </Typography>
                    )}
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#333",
                        lineHeight: 1.7,
                        whiteSpace: "pre-line",
                        mt: 1,
                      }}
                    >
                      {email.body}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        ))
      )}

      <EmailForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSend={handleSend}
        defaultRecipient={entity.email}
      />
    </Box>
  );
}
