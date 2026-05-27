"use client";

import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from "@mui/material";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";

interface NoteFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
}

export default function NoteForm({ open, onClose, onSave }: NoteFormProps) {
  const [noteText, setNoteText] = useState("");
  const [formats, setFormats] = useState<string[]>([]);

  const handleSave = () => {
    if (!noteText.trim()) return;
    onSave(noteText);
    handleClose();
  };

  const handleClose = () => {
    setNoteText("");
    setFormats([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { sx: { borderRadius: 3 } },
      }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
          Create Note
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* Label */}
        <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
          Note <span style={{ color: "red" }}>*</span>
        </Typography>

        {/* ── Rich Text Editor Box ── */}
        <Box
          sx={{
            border: "1px solid #ddd",
            borderRadius: 1.5,
            overflow: "hidden",
          }}
        >
          {/* Toolbar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.5,
              borderBottom: "1px solid #eee",
              bgcolor: "#fafafa",
            }}
          >
            {/* Text style selector */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.3,
                cursor: "pointer",
                px: 0.8,
                py: 0.3,
                borderRadius: 1,
                "&:hover": { bgcolor: "#f0f0f0" },
              }}
            >
              <Typography sx={{ fontSize: 12, color: "#555" }}>
                Normal text
              </Typography>
              <KeyboardArrowDownOutlinedIcon
                sx={{ fontSize: 14, color: "#888" }}
              />
            </Box>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Bold / Italic / Underline */}
            <ToggleButtonGroup
              size="small"
              value={formats}
              onChange={(_, val) => setFormats(val)}
              sx={{
                "& .MuiToggleButton-root": {
                  border: "none",
                  p: 0.4,
                  borderRadius: 1,
                },
              }}
            >
              <ToggleButton value="bold">
                <FormatBoldIcon sx={{ fontSize: 16 }} />
              </ToggleButton>
              <ToggleButton value="italic">
                <FormatItalicIcon sx={{ fontSize: 16 }} />
              </ToggleButton>
              <ToggleButton value="underline">
                <FormatUnderlinedIcon sx={{ fontSize: 16 }} />
              </ToggleButton>
            </ToggleButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Bullet / Numbered list */}
            <ToggleButtonGroup
              size="small"
              value={formats}
              onChange={(_, val) => setFormats(val)}
              sx={{
                "& .MuiToggleButton-root": {
                  border: "none",
                  p: 0.4,
                  borderRadius: 1,
                },
              }}
            >
              <ToggleButton value="bullet">
                <FormatListBulletedIcon sx={{ fontSize: 16 }} />
              </ToggleButton>
              <ToggleButton value="numbered">
                <FormatListNumberedIcon sx={{ fontSize: 16 }} />
              </ToggleButton>
            </ToggleButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {/* Image */}
            <IconButton size="small" sx={{ p: 0.4 }}>
              <ImageOutlinedIcon sx={{ fontSize: 16, color: "#555" }} />
            </IconButton>
          </Box>

          {/* ── Textarea ── */}
          <Box
            component="textarea"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Enter"
            sx={{
              width: "100%",
              minHeight: 120,
              p: 1.5,
              border: "none",
              outline: "none",
              resize: "none",
              fontSize: 13,
              fontFamily: "inherit",
              color: "#333",
              bgcolor: "transparent",
              boxSizing: "border-box",
              fontWeight: formats.includes("bold") ? 700 : 400,
              fontStyle: formats.includes("italic") ? "italic" : "normal",
              textDecoration: formats.includes("underline")
                ? "underline"
                : "none",
            }}
          />
        </Box>
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            borderColor: "#ddd",
            color: "black",
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            bgcolor: "#6c63ff",
            "&:hover": { bgcolor: "#5a52d5" },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
