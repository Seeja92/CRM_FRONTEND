"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FormatColorTextIcon from "@mui/icons-material/FormatColorText";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LinkIcon from "@mui/icons-material/Link";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

interface EmailFormProps {
  open: boolean;
  onClose: () => void;
  onSend: (email: {
    recipients: string;
    cc: string;
    bcc: string;
    subject: string;
    body: string;
  }) => void;
  defaultRecipient?: string;
}

export default function EmailForm({
  open,
  onClose,
  onSend,
  defaultRecipient = "",
}: EmailFormProps) {
  const [recipients, setRecipients] = useState(defaultRecipient);
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSend = () => {
    if (!recipients.trim() || !subject.trim()) return;
    onSend({ recipients, cc, bcc, subject, body });
    handleClose();
  };

  const handleClose = () => {
    setRecipients(defaultRecipient);
    setCc("");
    setBcc("");
    setShowCc(false);
    setShowBcc(false);
    setSubject("");
    setBody("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
    >
      {/* ── Header ── */}
      <DialogTitle
        sx={{
          bgcolor: "#6c63ff",
          color: "white",
          py: 1.2,
          px: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
          New Email
        </Typography>
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: "white", p: 0.3 }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* ── Recipients ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 1,
            borderBottom: "1px solid #eee",
          }}
        >
          <TextField
            variant="standard"
            placeholder="Recipients"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            fullWidth
            slotProps={{
              input: { disableUnderline: true, sx: { fontSize: 13 } },
            }}
          />
          <Box sx={{ display: "flex", gap: 1, ml: 1 }}>
            <Typography
              onClick={() => setShowCc(!showCc)}
              sx={{
                fontSize: 12,
                color: showCc ? "#6c63ff" : "#aaa",
                cursor: "pointer",
                "&:hover": { color: "#6c63ff" },
              }}
            >
              Cc
            </Typography>
            <Typography
              onClick={() => setShowBcc(!showBcc)}
              sx={{
                fontSize: 12,
                color: showBcc ? "#6c63ff" : "#aaa",
                cursor: "pointer",
                "&:hover": { color: "#6c63ff" },
              }}
            >
              Bcc
            </Typography>
          </Box>
        </Box>

        {/* ── Cc Field ── */}
        {showCc && (
          <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #eee" }}>
            <TextField
              variant="standard"
              placeholder="Cc"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              fullWidth
              slotProps={{
                input: { disableUnderline: true, sx: { fontSize: 13 } },
              }}
            />
          </Box>
        )}

        {/* ── Bcc Field ── */}
        {showBcc && (
          <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #eee" }}>
            <TextField
              variant="standard"
              placeholder="Bcc"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              fullWidth
              slotProps={{
                input: { disableUnderline: true, sx: { fontSize: 13 } },
              }}
            />
          </Box>
        )}

        {/* ── Subject ── */}
        <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #eee" }}>
          <TextField
            variant="standard"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            fullWidth
            slotProps={{
              input: { disableUnderline: true, sx: { fontSize: 13 } },
            }}
          />
        </Box>

        {/* ── Body ── */}
        <Box sx={{ px: 2, py: 1, minHeight: 220 }}>
          <TextField
            variant="standard"
            placeholder="Body Text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            fullWidth
            multiline
            minRows={10}
            slotProps={{
              input: { disableUnderline: true, sx: { fontSize: 13 } },
            }}
          />
        </Box>

        <Divider />

        {/* ── Footer Toolbar ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
          }}
        >
          {/* Send Button + Dropdown */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button
              variant="contained"
              onClick={handleSend}
              sx={{
                bgcolor: "#6c63ff",
                textTransform: "none",
                fontWeight: 600,
                fontSize: 13,
                borderRadius: "6px 0 0 6px",
                px: 2,
                py: 0.8,
                "&:hover": { bgcolor: "#5a52d5" },
              }}
            >
              Send
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#6c63ff",
                minWidth: "auto",
                px: 0.5,
                py: 0.8,
                borderRadius: "0 6px 6px 0",
                borderLeft: "1px solid rgba(255,255,255,0.3)",
                "&:hover": { bgcolor: "#5a52d5" },
              }}
            >
              <ArrowDropDownIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>

          {/* Toolbar Icons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              size="small"
              sx={{ color: "#888", "&:hover": { color: "#6c63ff" } }}
            >
              <FormatColorTextIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "#888", "&:hover": { color: "#6c63ff" } }}
            >
              <AttachFileIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "#888", "&:hover": { color: "#6c63ff" } }}
            >
              <LinkIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "#888", "&:hover": { color: "#6c63ff" } }}
            >
              <EmojiEmotionsOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: "#888", "&:hover": { color: "#6c63ff" } }}
            >
              <ImageOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleClose}
              sx={{ color: "#888", "&:hover": { color: "#e53935" } }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
