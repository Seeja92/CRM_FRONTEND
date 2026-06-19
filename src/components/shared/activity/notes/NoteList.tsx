"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  TextField,
} from "@mui/material";
import {
  fetchNotes,
  createNote,
  updateNote,
  Note,
} from "@/store/slices/activitySlice"; // Adjust path setup
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import NoteForm from "./NoteForm";

interface NoteListProps {
  entity: any;
  entityType: "lead" | "deal" | "ticket" | "company";
}

export default function NoteList({ entity, entityType }: NoteListProps) {
  const dispatch = useDispatch<AppDispatch>();

  const notes = useSelector((state: RootState) => state.activities.notes);
  const loading = useSelector((state: RootState) => state.activities.loading);
  const [createOpen, setCreateOpen] = useState(false);

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  // ── Fetch Notes ─────────────────────────────────────────────────────────────

  useEffect(() => {
    dispatch(fetchNotes({ entityType, entityId: entity.id }));
  }, [entity.id, entityType, dispatch]);

  // ── Create Note ─────────────────────────────────────────────────────────────

  const handleSave = async (content: string) => {
    const resultAction = await dispatch(
      createNote({
        entity_type: entityType,
        entity_id: entity.id,
        content,
      }),
    );
    if (createNote.fulfilled.match(resultAction)) {
      dispatch(fetchNotes({ entityType, entityId: entity.id }));
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
    setSaving(true);

    const resultAction = await dispatch(
      updateNote({ id: noteId, content: editContent }),
    );

    setSaving(false);
    if (updateNote.fulfilled.match(resultAction)) {
      handleEditCancel();
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
              <Typography sx={{ fontSize: 13, color: "#555", mt: 0.5, ml: 3 }}>
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
