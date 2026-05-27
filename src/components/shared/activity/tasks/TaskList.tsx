
"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TaskForm from "./TaskForm";

interface Task {
  id: number;
  task_name: string;
  due_date: string;
  time: string;
  task_type: string;
  priority: string;
  assigned_to_name: string;
  note: string;
  is_complete: boolean;
  created_at: string;
  expanded?: boolean;
}

interface TaskListProps {
  entity: any;
  entityType: "lead" | "deal" | "ticket" | "company";
  onTaskComplete?: () => void;
}

export default function TaskList({ entity, entityType,onTaskComplete  }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/tasks/?entity_type=${entityType}&entity_id=${entity.id}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setTasks(
          (data.results || data).map((t: Task) => ({ ...t, expanded: false }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [entity.id, entityType]);

  const toggleExpand = (id: number) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, expanded: !t.expanded } : t))
    );

  const handleSave = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/tasks/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            entity_type: entityType,
            entity_id: entity.id,
            task_name: data.taskName,
            due_date: data.dueDate,
            time: data.time,
            task_type: data.taskType,
            priority: data.priority,
            assigned_to: data.assignedTo,
            note: data.note,
          }),
        }
      );
      if (res.ok) {
        await fetchTasks();
      } else {
        const err = await res.json();
        console.error("Task save failed:", err);
      }
    } catch (err) {
      console.error("Failed to save task:", err);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/tasks/${task.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ is_complete: !task.is_complete }),
        }
      );
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, is_complete: !t.is_complete } : t
          )
        );
        onTaskComplete?.();
      }
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const isOverdue = (due_date: string) => new Date(due_date) < new Date();

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 15 }}>Tasks</Typography>
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
          Create Task
        </Button>
      </Box>

      {/* Loading */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress size={24} sx={{ color: "#6c63ff" }} />
        </Box>
      ) : tasks.length === 0 ? (
        <Typography
          sx={{ fontSize: 13, color: "#aaa", textAlign: "center", mt: 3 }}
        >
          No tasks yet. Create one!
        </Typography>
      ) : (
        tasks.map((task) => (
          <Box
            key={task.id}
            sx={{
              border: "1px solid #eee",
              borderRadius: 2,
              mb: 1.5,
              overflow: "hidden",
            }}
          >
            {/* Header Row */}
            <Box
              onClick={() => toggleExpand(task.id)}
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
                {task.expanded ? (
                  <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "#555" }} />
                ) : (
                  <KeyboardArrowRightIcon sx={{ fontSize: 16, color: "#555" }} />
                )}
                <Typography sx={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>Task</span> assigned to{" "}
                  {task.assigned_to_name}
                </Typography>
              </Box>

              {isOverdue(task.due_date) && !task.is_complete && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarTodayOutlinedIcon
                    sx={{ fontSize: 13, color: "#e53935" }}
                  />
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#e53935",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Overdue · {task.due_date}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Task Title Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1.5,
                pb: 1.5,
              }}
            >
              {/* Toggle Complete Button */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleComplete(task);
                }}
                sx={{ p: 0 }}
              >
                {task.is_complete ? (
                  <CheckCircleIcon sx={{ fontSize: 18, color: "#4caf50" }} />
                ) : (
                  <RadioButtonUncheckedIcon
                    sx={{ fontSize: 18, color: "#aaa" }}
                  />
                )}
              </IconButton>

              {/* Task Name with strike-through when complete */}
              {/* <Typography
                sx={{
                  fontSize: 13,
                  color: task.is_complete ? "#aaa" : "#555",
                  textDecoration: task.is_complete ? "line-through" : "none",
                }}
              >
                {task.task_name}
              </Typography> */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  {/* Task Name with strike-through when complete */}
  <Typography
    sx={{
      fontSize: 13,
      color: task.is_complete ? "#aaa" : "#555",
      textDecoration: task.is_complete ? "line-through" : "none",
    }}
  >
    {task.task_name}
  </Typography>

  {/* Show "Finished" label when complete */}
  {task.is_complete && (
    <Typography
      sx={{
        fontSize: 11,
        color: "#4caf50",
        fontWeight: 600,
        bgcolor: "#e8f5e9",
        px: 1,
        py: 0.2,
        borderRadius: 1,
      }}
    >
      Finished
    </Typography>
  )}
</Box>
            </Box>

            {/* Expanded Details */}
            {task.expanded && (
              <Box sx={{ borderTop: "1px solid #f0f0f0" }}>
                <Box
                  sx={{
                    display: "flex",
                    bgcolor: "#f9f9fb",
                    px: 2,
                    py: 1.5,
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 11, color: "#aaa", mb: 0.3 }}>
                      Due Date & Time
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                      {task.due_date} {task.time}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 11, color: "#aaa", mb: 0.3 }}>
                      Priority
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                      {task.priority}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 11, color: "#aaa", mb: 0.3 }}>
                      Type
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                      {task.task_type}
                    </Typography>
                  </Box>
                </Box>

                {task.note && (
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography
                      sx={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}
                    >
                      {task.note}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        ))
      )}

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
}