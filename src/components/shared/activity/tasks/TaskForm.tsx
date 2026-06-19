"use client";

import { useState, useEffect, useRef } from "react";
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
  Checkbox,
  ListItemText,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchUsers } from "@/store/slices/usersSlice";
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

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: TaskData) => void;
}

interface TaskData {
  taskName: string;
  dueDate: string;
  time: string;
  taskType: string;
  priority: string;
  assignedTo: number[];
  note: string;
}

const taskTypeOptions = ["To-Do", "Call", "Email", "Meeting", "Follow Up"];
const priorityOptions = ["Low", "Medium", "High", "Urgent"];

export default function TaskForm({ open, onClose, onSave }: TaskFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const dueDateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const { users } = useSelector((state: RootState) => state.users);
  const [taskName, setTaskName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [time, setTime] = useState("");
  const [taskType, setTaskType] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [formats, setFormats] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      dispatch(fetchUsers());
    }
  }, [open, dispatch]);

  const handleSave = () => {
    if (!taskName.trim()) return;
    onSave({ taskName, dueDate, time, taskType, priority, assignedTo, note });
    handleClose();
  };

  const handleClose = () => {
    setTaskName("");
    setDueDate("");
    setTime("");
    setTaskType("");
    setPriority("");
    setAssignedTo([]);
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
          Create Task
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 1 }}>
        {/* ── Task Name ── */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
            Task Name <span style={{ color: "red" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            placeholder="Enter"
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: 13 },
            }}
          />
        </Box>

        {/* ── Due Date + Time ── */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {/* Due Date */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
              Due Date <span style={{ color: "red" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              inputRef={dueDateRef}
              slotProps={{
                input: {
                  endAdornment: (
                    <CalendarTodayOutlinedIcon
                      onClick={() => dueDateRef.current?.showPicker()}
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

        {/* ── Task Type + Priority ── */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          {/* Task Type */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
              Task Type <span style={{ color: "red" }}>*</span>
            </Typography>
            <Select
              fullWidth
              size="small"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
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
              {taskTypeOptions.map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Priority */}
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
              Priority <span style={{ color: "red" }}>*</span>
            </Typography>
            <Select
              fullWidth
              size="small"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
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
              {priorityOptions.map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: 13 }}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        {/* ── Assigned To ── */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.8 }}>
            Assigned to <span style={{ color: "red" }}>*</span>
          </Typography>
          <Select
            fullWidth
            size="small"
            multiple
            value={assignedTo}
            
            onChange={(e) => {
              const value = e.target.value;
              // Material-UI handles value assignment array changes automatically
              setAssignedTo(Array.isArray(value) ? value : []);
            }}
            displayEmpty
            IconComponent={KeyboardArrowDownIcon}
            renderValue={(selectedIds) => {
              if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
                return (
                  <Typography sx={{ fontSize: 13, color: "#aaa" }}>
                    Choose
                  </Typography>
                );
              }
              const selectedNames = selectedIds
                .map((id) => users.find((u) => u.id === id)?.name)
                .filter(Boolean);
              return (
                <Typography sx={{ fontSize: 13, color: "#333" }}>
                  {selectedNames.join(", ")}
                </Typography>
              );
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 250, // Limits container height so it scrolls cleanly
                },
              },
            }}
            sx={{
              borderRadius: 1.5,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ddd" },
              fontSize: 13,
            }}
          >
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id} sx={{ fontSize: 13 }}>
                {/* {" "} */}
                {/* ── value is ID */}
                {/* {u.name} */}
                <Checkbox
                  size="small"
                  checked={
                    Array.isArray(assignedTo)
                      ? assignedTo.includes(u.id)
                      : assignedTo === u.id
                  }
                  sx={{
                    color: "#6c63ff",
                    "&.Mui-checked": { color: "#6c63ff" },
                  }}
                />

                <ListItemText
                  primary={u.name}
                  primaryTypographyProps={{ fontSize: 13 }}
                />
              </MenuItem>
            ))}
          </Select>
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
