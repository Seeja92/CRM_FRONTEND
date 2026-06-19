

"use client";

import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; // <-- Added Redux hooks
import { fetchUsers } from "@/store/slices/usersSlice"; // <-- Update path to your slice file
import { RootState, AppDispatch } from "@/store/index"; // <-- Update path to your root store file
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
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
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
import { User } from "@/store/slices/usersSlice";

interface MeetingFormProps {
  open: boolean;
  entity?: any;
  entityType?: "lead" | "deal" | "ticket" | "company";
  onClose: () => void;
  onSave: (data: MeetingData) => void;
}

interface MeetingData {
  title: string;
  startDate: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  location: string;
  reminder: string;
  note: string;
}

const locationOptions = ["Office", "Zoom", "Google Meet", "Phone", "Other"];
const reminderOptions = [
  "5 minutes before",
  "10 minutes before",
  "15 minutes before",
  "30 minutes before",
  "1 hour before",
  "1 day before",
];


export default function MeetingForm({
  open,
  onClose,
  onSave,
  entity,
  entityType,
}: MeetingFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  // Consume users array straight from Redux state management
  const { users } = useSelector((state: RootState) => state.users);

  const startDateRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [reminder, setReminder] = useState("");
  const [note, setNote] = useState("");
  const [formats, setFormats] = useState<string[]>([]);

  const getEntityAttendeeName = () => {
  switch (entityType) {
    case "lead":
      return entity?.name || "";

    case "company":
      return entity?.company_name || "";

    case "deal":
      return (
        entity?.lead_name ||
        entity?.associated_lead?.name ||
        `${entity?.associated_lead?.first_name || ""} ${
          entity?.associated_lead?.last_name || ""
        }`.trim()
      );

    case "ticket":
      return (
        entity?.associated_deal?.associated_lead?.name ||
        `${entity?.associated_deal?.associated_lead?.first_name || ""} ${
          entity?.associated_deal?.associated_lead?.last_name || ""
        }`.trim()
      );

    default:
      return "";
  }
};


const attendeeOptions = [
  getEntityAttendeeName(),
  ...users.map((u) => u.name),
].filter(Boolean);

  // Only dispatch the action when the form is opened and state needs resolving
  useEffect(() => {
    if (open) {
      dispatch(fetchUsers());
    }
  }, [dispatch, open]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title,
      startDate,
      startTime,
      endTime,
      attendees,
      location,
      reminder,
      note,
    });
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setStartDate("");
    setStartTime("");
    setEndTime("");
    setAttendees([]);
    setLocation("");
    setReminder("");
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
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
          Schedule Meeting
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1 }}>
        {/* ── Title ── */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
            Title <span style={{ color: "red" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter"
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 13 },
            }}
          />
        </Box>

        {/* ── Start Date ── */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
            Start Date <span style={{ color: "red" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            inputRef={startDateRef}
            slotProps={{
              input: {
                endAdornment: (
                  <CalendarTodayOutlinedIcon
                    onClick={() => startDateRef.current?.showPicker()}
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

        {/* ── Start Time + End Time ── */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {/* Start Time */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
              Start Time <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              inputRef={startTimeRef}
              slotProps={{
                input: {
                  endAdornment: (
                    <AccessTimeOutlinedIcon
                      onClick={() => startTimeRef.current?.showPicker()}
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

          {/* End Time */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
              End Time <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              inputRef={endTimeRef}
              slotProps={{
                input: {
                  endAdornment: (
                    <AccessTimeOutlinedIcon
                      onClick={() => endTimeRef.current?.showPicker()}
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

        {/* ── Attendees ── */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
            Attendees <span style={{ color: "red" }}>*</span>
          </Typography>
          <Select
            fullWidth
            size="small"
            multiple
            displayEmpty
            value={attendees}
            onChange={(e) => setAttendees(e.target.value as string[])}
            input={<OutlinedInput />}
            IconComponent={KeyboardArrowDownIcon}
            renderValue={(selected) => {
              if ((selected as string[]).length === 0) {
                return <span style={{ color: "#9CA3AF" }}>Choose</span>;
              }
              return (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(selected as string[]).map((val) => (
                    <Chip
                      key={val}
                      label={val}
                      size="small"
                      onDelete={(e) => {
                        e.stopPropagation();
                        setAttendees(attendees.filter((a) => a !== val));
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      sx={{
                        fontSize: 11,
                        height: 22,
                        bgcolor: "#EDE9FE",
                        color: "#5B21B6",
                        "& .MuiChip-deleteIcon": {
                          color: "#7C3AED",
                          fontSize: 14,
                        },
                      }}
                    />
                  ))}
                </Box>
              );
            }}
            sx={{
              borderRadius: 1.5,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ddd" },
              "& .MuiSelect-select": { minHeight: "36px !important" },
            }}
            MenuProps={{ PaperProps: { sx: { maxHeight: 220 } } }}
          >

{attendeeOptions.map((name) => (
  <MenuItem key={name} value={name}>
    <Checkbox
      checked={attendees.includes(name)}
      size="small"
    />
    <ListItemText primary={name} />
  </MenuItem>
))}
          </Select>
        </Box>

        {/* ── Location ── */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
            Location
          </Typography>
          <Select
            fullWidth
            size="small"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
            {locationOptions.map((opt) => (
              <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* ── Reminder ── */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
            Reminder
          </Typography>
          <Select
            fullWidth
            size="small"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
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
            {reminderOptions.map((opt) => (
              <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* ── Note ── */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
            Note <span style={{ color: "red" }}>*</span>
          </Typography>

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
