"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";

interface CallFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CallData) => void;
  defaultContact?: string;
  defaultPhone?: string;
}

interface CallData {
  connected: string;
  phone: string;
  callOutcome: string;
  date: string;
  time: string;
  note: string;
}

const outcomeOptions = [
  "Busy",
  "Connected",
  "Left live message",
  "Left voicemail",
  "No answer",
  "Wrong number",
];

export default function CallForm({
  open,
  onClose,
  onSave,
  defaultContact = "",
  defaultPhone = "",
}: CallFormProps) {
  console.log("CallForm received defaultPhone:", defaultPhone);
  const [connected, setConnected] = useState(defaultContact);
  const [phone, setPhone] = useState(defaultPhone);
  const [callOutcome, setCallOutcome] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [formats, setFormats] = useState<string[]>([]);
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConnected(defaultContact);
    setPhone(defaultPhone);
  }, [defaultContact, defaultPhone]);
  const handleSave = () => {
    if (!connected.trim() || !callOutcome) return;
    onSave({ connected, phone, callOutcome, date, time, note });
    handleClose();
  };

  const handleClose = () => {
    setConnected(defaultContact);
    setCallOutcome("");
    setPhone(defaultPhone);
    setDate("");
    setTime("");
    setNote("");
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
        paper: {
          sx: {
            borderRadius: 2,
            position: "fixed",
            right: 0,
            top: 0,
            bottom: 0,
            m: 0,
            maxHeight: "100vh",
            height: "100vh",
          },
        },
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
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Log Call</Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1 }}>
        {/* ── Connected ── */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
            Connected <span style={{ color: "red" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={connected}
            onChange={(e) => setConnected(e.target.value)}
            placeholder="Jane Cooper"
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 13 },
            }}
          />
        </Box>

        {/* ── Phone Number (only for deals with associated lead) ── */}
        {phone && (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
              Phone Number
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 13 },
              }}
            />
          </Box>
        )}

        {/* ── Call Outcome ── */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
            Call Outcome <span style={{ color: "red" }}>*</span>
          </Typography>
          <Select
            fullWidth
            size="small"
            value={callOutcome}
            onChange={(e) => setCallOutcome(e.target.value)}
            displayEmpty
            IconComponent={KeyboardArrowDownIcon}
            renderValue={(val) => (
              <Typography sx={{ fontSize: 13, color: val ? "#333" : "#aaa" }}>
                {val || "Choose"}
              </Typography>
            )}
            sx={{
              borderRadius: 1.5,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ddd" },
            }}
          >
            {outcomeOptions.map((opt) => (
              <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* ── Date + Time ── */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {/* Date */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
              Date <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              inputRef={dateRef}
              slotProps={{
                input: {
                  endAdornment: (
                    <CalendarTodayOutlinedIcon
                      onClick={() => dateRef.current?.showPicker()}
                      sx={{ fontSize: 16, color: "#aaa", cursor: "pointer" }}
                    />
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 13 },
                "& input[type='date']::-webkit-calendar-picker-indicator": {
                  display: "none",
                },
              }}
            />
          </Box>

          {/* Time */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
              Time <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              inputRef={timeRef}
              slotProps={{
                input: {
                  endAdornment: (
                    <AccessTimeOutlinedIcon
                      onClick={() => timeRef.current?.showPicker()}
                      sx={{ fontSize: 16, color: "#aaa", cursor: "pointer" }}
                    />
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 13 },
                "& input[type='time']::-webkit-calendar-picker-indicator": {
                  display: "none",
                },
              }}
            />
          </Box>
        </Box>

        {/* ── Note ── */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
            Note <span style={{ color: "red" }}>*</span>
          </Typography>

          {/* Rich Text Editor */}
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
              {/* Text style */}
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
                <KeyboardArrowDownIcon sx={{ fontSize: 14, color: "#888" }} />
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

              {/* Lists */}
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

            {/* Textarea */}
            <Box
              component="textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter"
              sx={{
                width: "100%",
                minHeight: 100,
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
        </Box>
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
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
