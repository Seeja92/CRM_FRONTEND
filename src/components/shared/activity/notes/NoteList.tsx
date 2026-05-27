
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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import NoteForm from "./NoteForm";

interface Note {
  id: number;
  content: string;
  created_by_name: string;
  created_at: string;
}

interface NoteListProps {
  entity: any;
  entityType: "lead" | "deal" | "ticket" | "company";
}

export default function NoteList({ entity, entityType }: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Fetch Notes ─────────────────────────────────────────────────────────────
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/notes/?entity_type=${entityType}&entity_id=${entity.id}`,
        { headers: { Authorization: `Token ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setNotes(data.results || data);
      }
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [entity.id, entityType]);

  // ── Create Note ─────────────────────────────────────────────────────────────
  const handleSave = async (content: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/notes/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            entity_type: entityType,
            entity_id: entity.id,
            content,
          }),
        },
      );
      if (res.ok) await fetchNotes();
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  // ── Open Edit ───────────────────────────────────────────────────────────────
  const handleEditOpen = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  // ── Cancel Edit ─────────────────────────────────────────────────────────────
  const handleEditCancel = () => {
    setEditingNoteId(null);
    setEditContent("");
  };

  // ── Save Edit (PATCH) ───────────────────────────────────────────────────────
  const handleUpdateNote = async (noteId: number) => {
    if (!editContent.trim()) return;
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/notes/${noteId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ content: editContent }),
        },
      );
      if (res.ok) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId ? { ...n, content: editContent } : n,
          ),
        );
        handleEditCancel();
      } else {
        const err = await res.json();
        console.error("Failed to update note:", err);
      }
    } catch (err) {
      console.error("Failed to update note:", err);
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
        <Typography sx={{ fontWeight: 600, fontSize: 15 }}>Notes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{
            bgcolor: "#6c63ff",
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
            "&:hover": { bgcolor: "#5a52d5" },
          }}
        >
          Create Note
        </Button>
      </Box>

      {/* ── Loading / Empty ── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress size={24} sx={{ color: "#6c63ff" }} />
        </Box>
      ) : notes.length === 0 ? (
        <Typography
          sx={{ fontSize: 13, color: "#aaa", textAlign: "center", mt: 3 }}
        >
          No notes yet. Create one!
        </Typography>
      ) : (
        notes.map((note) => (
          <Box
            key={note.id}
            sx={{
              border: "1px solid #eee",
              borderRadius: 2,
              p: 1.5,
              mb: 1.5,
            }}
          >
            {/* ── Note Header ── */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "#555" }} />
                <Typography sx={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>Note</span> by{" "}
                  {note.created_by_name}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* ── Edit Icon ── */}
                <IconButton
                  size="small"
                  onClick={(e) => handleEditOpen(e, note)}
                  sx={{ color: "#6c63ff", p: 0.5 }}
                >
                  <EditIcon sx={{ fontSize: 15 }} />
                </IconButton>
                <Typography sx={{ fontSize: 12, color: "#aaa" }}>
                  {formatDate(note.created_at)}
                </Typography>
              </Box>
            </Box>

            {/* ── Edit Mode ── */}
            {editingNoteId === note.id ? (
              <Box sx={{ mt: 1, ml: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  size="small"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  sx={{
                    mb: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      fontSize: 13,
                    },
                  }}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={saving}
                    onClick={() => handleUpdateNote(note.id)}
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
              // ── Normal View ──
              <Typography
                sx={{ fontSize: 13, color: "#555", mt: 0.5, ml: 3 }}
              >
                {note.content}
              </Typography>
            )}
          </Box>
        ))
      )}

      <NoteForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}