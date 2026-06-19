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
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TaskForm from "./TaskForm";
import {
  fetchTasks,
  createTask,
  toggleTaskComplete,
  toggleTaskExpand,
  Task,
} from "@/store/slices/activitySlice";

interface TaskListProps {
  entity: any;
  entityType: "lead" | "deal" | "ticket" | "company";
  onTaskComplete?: () => void;
}

export default function TaskList({
  entity,
  entityType,
  onTaskComplete,
}: TaskListProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { tasks, loading } = useSelector(
    (state: RootState) => state.activities,
  );

  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
  
    dispatch(fetchTasks({ entityType, entityId: entity.id }));
  }, [entity.id, entityType, dispatch]);
  console.log("Fetching tasks for:", entityType, entity.id);

  const handleSave = async (data: any) => {
    const payload = {
      entity_type: entityType,
      entity_id: entity.id,
      task_name: data.taskName,
      due_date: data.dueDate,
      time: data.time,
      task_type: data.taskType,
      priority: data.priority,
      assigned_to: data.assignedTo,
      note: data.note,
    };

    // Dispatch the action, then re-fetch updated data on success
    const result = await dispatch(createTask(payload));
    console.log("CREATE TASK RESULT:", result);
    if (createTask.fulfilled.match(result)) {
      dispatch(fetchTasks({ entityType, entityId: entity.id }));
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const result = await dispatch(
      toggleTaskComplete({ id: task.id, isComplete: !task.is_complete }),
    );
    if (toggleTaskComplete.fulfilled.match(result)) {
      // Re-fetch to guarantee sync with database state changes
      dispatch(fetchTasks({ entityType, entityId: entity.id }));
      onTaskComplete?.();
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
              onClick={() => dispatch(toggleTaskExpand(task.id))}
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
                  <KeyboardArrowRightIcon
                    sx={{ fontSize: 16, color: "#555" }}
                  />
                )}
                <Typography sx={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>Task</span> assigned to{" "}
                  {task.assigned_to_names?.join(", ") || "Unassigned"}
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

            {task.expanded && (
              <Box sx={{ borderTop: "1px solid #f0f0f0", pt: 0.5 }}>
                {/* ── Metadata Details Box ── */}
                <Box
                  sx={{
                    display: "flex",
                    bgcolor: "#edf2f7",
                    mx: 2,
                    my: 1,
                    px: 2.5,
                    py: 2,
                    borderRadius: 1.5,
                    gap: 2,
                  }}
                >
                  {/* Due Date & Time */}
                  <Box sx={{ flex: 1.5 }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#64748b",
                        fontWeight: 500,
                        mb: 0.8,
                      }}
                    >
                      Due Date & Time
                    </Typography>
                    <Typography
                      sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}
                    >
                      {task.due_date} {task.time ? `at ${task.time}` : ""}
                    </Typography>
                  </Box>

                  {/* Priority */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#64748b",
                        fontWeight: 500,
                        mb: 0.8,
                      }}
                    >
                      Priority
                    </Typography>
                    <Typography
                      sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}
                    >
                      {task.priority || "None"}
                    </Typography>
                  </Box>

                  {/* Type */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: "#64748b",
                        fontWeight: 500,
                        mb: 0.8,
                      }}
                    >
                      Type
                    </Typography>
                    <Typography
                      sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}
                    >
                      {task.task_type || "To-Do"}
                    </Typography>
                  </Box>
                </Box>

                {/* ── Description Note Section ── */}
                {task.note && (
                  <Box sx={{ px: 2, pt: 1, pb: 2 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#475569", // Subdued slate text for easy reading
                        lineHeight: 1.6,
                        fontWeight: 400,
                      }}
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
