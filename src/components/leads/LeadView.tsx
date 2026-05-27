"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import LeadForm, { LeadFormData } from "./LeadForm";
// import {
//   CalendarTodayOutlined,
// } from "@mui/icons-material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import {
  ArrowBack,
  Search,
  Edit,
  NoteAdd,
  Email,
  Call,
  Task,
  Event,
  CalendarTodayOutlined,
} from "@mui/icons-material";
import CallForm from "../shared/activity/calls/CallForm";
import { useRouter } from "next/navigation";
import { Lead } from "@/types/lead.types";
import ActivityPanel from "../shared/activity/ActivityPanel";
import Attachments from "@/components/shared/Attachments";

interface LeadViewProps {
  lead: Lead;
  onBack: () => void;
  onConverted?: () => void;
  onLeadUpdated?: (updatedLead: Lead) => void;
}

const actionButtons = [
  { icon: <NoteAdd sx={{ fontSize: 18 }} />, label: "Note", tabIndex: 1 },
  { icon: <Email sx={{ fontSize: 18 }} />, label: "Email", tabIndex: 2 },
  { icon: <Call sx={{ fontSize: 18 }} />, label: "Call", tabIndex: 3 },
  { icon: <Task sx={{ fontSize: 18 }} />, label: "Task", tabIndex: 4 },
  { icon: <Event sx={{ fontSize: 18 }} />, label: "Meet...", tabIndex: 5 },
];

export default function LeadView({
  lead,
  onBack,
  onConverted,
  onLeadUpdated,
}: LeadViewProps) {
  const router = useRouter();
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [leadData, setLeadData] = useState(lead);
  const [activeTab, setActiveTab] = useState(0);
  const [openCallForm, setOpenCallForm] = useState(false);
  const [activitySearch, setActivitySearch] = useState("");
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });
  const firstName = leadData.firstName || leadData.name.split(" ")[0];
  const lastName = leadData.lastName || leadData.name.split(" ")[1] || "";
  const isQualified = lead.status === "Qualified";

  const activityColors: Record<string, string> = {
    Task: "#6c63ff",
    Call: "#4caf50",
    Meeting: "#2196f3",
    Email: "#ff9800",
    Note: "#9c27b0",
  };

  // ── Fetch all activities ──
  const fetchAllActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Token ${token}` };
      const base = `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities`;
      const params = `?entity_type=lead&entity_id=${lead.id}`;

      const [notes, calls, tasks, meetings, emails] = await Promise.all([
        fetch(`${base}/notes/${params}`, { headers }).then((r) => r.json()),
        fetch(`${base}/calls/${params}`, { headers }).then((r) => r.json()),
        fetch(`${base}/tasks/${params}`, { headers }).then((r) => r.json()),
        fetch(`${base}/meetings/${params}`, { headers }).then((r) => r.json()),
        fetch(`${base}/emails/${params}`, { headers }).then((r) => r.json()),
      ]);

      const mapped = [
        ...(notes.results || notes).map((n: any) => ({
          id: `note-${n.id}`,
          type: "Note",
          title: n.content,
          assignee: n.created_by_name,
          date: n.created_at,
          isOverdue: false,
          is_complete: false,
        })),
        ...(calls.results || calls).map((c: any) => ({
          id: `call-${c.id}`,
          type: "Call",
          title: c.note || c.call_outcome,
          assignee: c.created_by_name,
          date: c.created_at,
          isOverdue: false,
          is_complete: false,
        })),
        ...(tasks.results || tasks).map((t: any) => ({
          id: `task-${t.id}`,
          type: "Task",
          title: t.task_name,
          assignee: t.assigned_to_name,
          date: t.created_at,
          dueDate: t.due_date,
          isOverdue: new Date(t.due_date) < new Date() && !t.is_complete,
          is_complete: t.is_complete, // ✅ key field
        })),
        ...(meetings.results || meetings).map((m: any) => ({
          id: `meeting-${m.id}`,
          type: "Meeting",
          title: m.title,
          assignee: m.created_by_name,
          date: m.created_at,
          isOverdue: false,
          is_complete: false,
        })),
        ...(emails.results || emails).map((e: any) => ({
          id: `email-${e.id}`,
          type: "Email",
          title: e.subject,
          assignee: e.created_by_name,
          date: e.created_at,
          isOverdue: false,
          is_complete: false,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setAllActivities(mapped);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  };

  useEffect(() => {
    fetchAllActivities();
  }, [lead.id]);

  // ── Group by month ──
  const groupByMonth = (activities: any[]) => {
    const groups: Record<string, any[]> = {};
    activities
      .filter((a) => !a.isOverdue)
      .forEach((a) => {
        const month = new Date(a.date).toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        });
        if (!groups[month]) groups[month] = [];
        groups[month].push(a);
      });
    return groups;
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

  // ── activityContent as useMemo so it re-renders when allActivities changes ──
  const activityContent = useMemo(() => {
    const upcomingActivities = allActivities.filter((a) => a.isOverdue);
    const groupedActivities = groupByMonth(allActivities);

    const filteredUpcoming = upcomingActivities.filter(
      (a) =>
        a.title?.toLowerCase().includes(activitySearch.toLowerCase()) ||
        a.assignee?.toLowerCase().includes(activitySearch.toLowerCase()) ||
        a.type?.toLowerCase().includes(activitySearch.toLowerCase()),
    );

    return (
      <Box>
        {/* ── Upcoming ── */}
        <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>
          Upcoming
        </Typography>

        {filteredUpcoming.length === 0 && allActivities.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "#aaa", mb: 1.5 }}>
            No upcoming activities.
          </Typography>
        ) : (
          filteredUpcoming.map((activity) => (
            <Box
              key={activity.id}
              sx={{
                border: "1px solid #eee",
                borderRadius: 2,
                p: 1.5,
                mb: 1.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography sx={{ fontSize: 13, color: "#555" }}>
                  <span style={{ fontWeight: 600 }}>{activity.type}</span>{" "}
                  assigned to {activity.assignee}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarTodayOutlined
                    sx={{ fontSize: 13, color: "#e53935" }}
                  />
                  <Typography sx={{ fontSize: 12, color: "#e53935" }}>
                    Overdue · {activity.dueDate}
                  </Typography>
                </Box>
              </Box>

              {/* Task row with complete state */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {activity.is_complete ? (
                  <CheckCircleIcon sx={{ fontSize: 18, color: "#4caf50" }} />
                ) : (
                  <RadioButtonUncheckedIcon
                    sx={{ fontSize: 18, color: "#aaa" }}
                  />
                )}
                <Typography
                  sx={{
                    fontSize: 13,
                    color: activity.is_complete ? "#aaa" : "#555",
                    textDecoration: activity.is_complete
                      ? "line-through"
                      : "none",
                  }}
                >
                  {activity.title}
                </Typography>
                {activity.is_complete && (
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
          ))
        )}

        {/* ── Grouped by Month ── */}
        {Object.entries(groupedActivities).map(([month, activities]) => {
          const filtered = activities.filter(
            (a) =>
              a.title?.toLowerCase().includes(activitySearch.toLowerCase()) ||
              a.assignee
                ?.toLowerCase()
                .includes(activitySearch.toLowerCase()) ||
              a.type?.toLowerCase().includes(activitySearch.toLowerCase()),
          );
          if (filtered.length === 0) return null;

          return (
            <Box key={month}>
              <Typography
                sx={{ fontSize: 13, fontWeight: 600, mt: 2, mb: 1.5 }}
              >
                {month}
              </Typography>

              {filtered.map((activity) => (
                <Box
                  key={activity.id}
                  sx={{
                    border: "1px solid #eee",
                    borderRadius: 2,
                    p: 1.5,
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: activityColors[activity.type],
                          mb: 0.5,
                        }}
                      >
                        {activity.type}{" "}
                        {activity.assignee
                          ? `from ${activity.assignee}`
                          : "tracking"}
                      </Typography>

                      {/* Task: show icon + strikethrough + Finished badge */}
                      {activity.type === "Task" ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {activity.is_complete ? (
                            <CheckCircleIcon
                              sx={{ fontSize: 18, color: "#4caf50" }}
                            />
                          ) : (
                            <RadioButtonUncheckedIcon
                              sx={{ fontSize: 18, color: "#aaa" }}
                            />
                          )}
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: activity.is_complete ? "#aaa" : "#555",
                              textDecoration: activity.is_complete
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {activity.title}
                          </Typography>
                          {activity.is_complete && (
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
                      ) : (
                        // Non-task activities: plain title
                        <Typography sx={{ fontSize: 13, color: "#555" }}>
                          {activity.title}
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "#aaa",
                        whiteSpace: "nowrap",
                        ml: 2,
                      }}
                    >
                      {formatDate(activity.date)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          );
        })}

        {allActivities.length === 0 && (
          <Typography
            sx={{ fontSize: 13, color: "#aaa", textAlign: "center", mt: 3 }}
          >
            No activities yet. Start by adding a note, call, task, or meeting!
          </Typography>
        )}
      </Box>
    );
  }, [allActivities, activitySearch]);

  const handleConvertConfirm = () => {
    setConvertDialogOpen(false);
    setSnackbar({
      open: true,
      message: "Redirecting to Create Deal....!",
      severity: "info",
    });
    setTimeout(() => {
      onBack();
      onConverted?.();
      router.push(
        `/deals?openCreate=true&leadName=${encodeURIComponent(lead.name)}&leadEmail=${encodeURIComponent(lead.email)}`,
      );
    }, 1200);
  };

  const handleEditSave = async (data: LeadFormData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/${lead.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.phone,
            job_title: data.jobTitle,
            company_name: data.companyName,
            contact_owner: data.contactOwners.join(", "),
            status: data.leadStatus,
          }),
        },
      );
      if (res.ok) {
        const updated = await res.json();
        setLeadData({
          ...leadData,
          ...updated,
          firstName: updated.first_name,
          lastName: updated.last_name,
          companyName: updated.company_name,
          jobTitle: updated.job_title,
          createdDate: updated.created_date,
        });
        onLeadUpdated?.(updated);
        setSnackbar({
          open: true,
          message: "Lead updated successfully!",
          severity: "success",
        });
        setEditOpen(false);
      } else {
        setSnackbar({
          open: true,
          message: "Failed to update lead.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Something went wrong.",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        p: 3,
        minHeight: "100vh",
        backgroundColor: "#ffffff",
      }}
    >
      {/* ── Left Panel ── */}
      <Box sx={{ width: 220, flexShrink: 0 }}>
        <Button
          startIcon={<ArrowBack sx={{ fontSize: 14 }} />}
          onClick={onBack}
          sx={{
            textTransform: "none",
            color: "#6c63ff",
            fontWeight: 500,
            fontSize: 13,
            mb: 2,
            p: 0,
            "&:hover": { backgroundColor: "transparent" },
          }}
        >
          Leads
        </Button>

        {/* Lead Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              mb: 1,
              backgroundColor: "#e8e8e8",
              color: "#888",
              fontSize: 20,
            }}
          >
            {firstName[0]}
          </Avatar>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>
            {lead.name}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#888" }}>
            {lead.jobTitle || "Salesperson"}
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
          >
            <Typography sx={{ fontSize: 12, color: "#6c63ff" }}>
              {lead.email}
            </Typography>
          </Box>
        </Box>

        {/* Quick-action Buttons */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {actionButtons.map((btn) => (
            <Box
              key={btn.label}
              onClick={() => {
                setActiveTab(btn.tabIndex);
                if (btn.label === "Call") setOpenCallForm(true);
              }}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                cursor: "pointer",
                "&:hover": { opacity: 0.8 },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6c63ff",
                }}
              >
                {btn.icon}
              </Box>
              <Typography sx={{ fontSize: 10, color: "#888" }}>
                {btn.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* About section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>
            About this Lead
          </Typography>
          <IconButton
            size="small"
            sx={{ color: "#6c63ff" }}
            onClick={() => setEditOpen(true)}
          >
            <Edit sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        {[
          { label: "First Name", value: firstName },
          { label: "Last Name", value: lastName },
          { label: "Email", value: leadData.email },
          { label: "Phone Number", value: leadData.phone },
          { label: "Lead Status", value: leadData.status },
          { label: "Job Title", value: leadData.jobTitle || "Salesperson" },
          { label: "Company Name", value: leadData.companyName || "-" },
          { label: "Created Date", value: leadData.createdDate },
        ].map((item) => (
          <Box key={item.label} sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: 11, color: "#999", mb: 0.25 }}>
              {item.label}
            </Typography>
            <Typography
              sx={{ fontSize: 13, color: "#1a1a2e", fontWeight: 500 }}
            >
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Middle Panel – Activity ── */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search activities"
            size="small"
            value={activitySearch}
            onChange={(e) => setActivitySearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: "#b0b0b0" }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#fff",
                "& fieldset": { borderColor: "#e0e0e0" },
                "&:hover fieldset": { borderColor: "#b0b0b0" },
                "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
              },
            }}
          />
          <Tooltip
            title={
              isQualified
                ? "Convert this lead to a Deal"
                : "Only Qualified leads can be converted"
            }
          >
            <span>
              <Button
                variant="contained"
                disabled={!isQualified}
                onClick={() => setConvertDialogOpen(true)}
                sx={{
                  bgcolor: "#6c63ff",
                  textTransform: "none",
                  borderRadius: 2,
                  fontWeight: 600,
                  px: 3,
                  whiteSpace: "nowrap",
                  "&:hover": { bgcolor: "#5a52d5" },
                  "&.Mui-disabled": { bgcolor: "#e0e0e0", color: "#aaa" },
                }}
              >
                Convert
              </Button>
            </span>
          </Tooltip>
        </Box>

        <ActivityPanel
          entityId={lead.id}
          entityType="lead"
          entity={lead}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activityContent={activityContent}
          onTaskComplete={fetchAllActivities}
          onLogCall={() => setOpenCallForm(true)}
        />

        <CallForm
          open={openCallForm}
          onClose={() => setOpenCallForm(false)}
          defaultContact={lead.name}
          defaultPhone={lead.phone}
          onSave={async (data) => {
            const token = localStorage.getItem("token");
            await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/calls/`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Token ${token}`,
                },
                body: JSON.stringify({
                  entity_type: "lead",
                  entity_id: lead.id,
                  connected: data.connected,
                  call_outcome: data.callOutcome,
                  date: data.date,
                  time: data.time,
                  note: data.note,
                }),
              },
            );
            setOpenCallForm(false);
            fetchAllActivities();
          }}
        />
      </Box>

      {/* ── Right Panel – AI Summary + Attachments ── */}
      <Box sx={{ width: 220, flexShrink: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            border: "1px solid #e8e8e8",
            backgroundColor: "#fff",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                backgroundColor: "#f0effe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography sx={{ fontSize: 12 }}>✨</Typography>
            </Box>
            <Typography
              sx={{ fontWeight: 600, fontSize: 13, color: "#6c63ff" }}
            >
              AI Lead Summary
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
            There are no activities associated with this lead and further
            details are needed to provide a comprehensive summary.
          </Typography>
        </Paper>

        <Attachments entityType="lead" entityId={Number(lead.id)} />
      </Box>

      {/* ── Convert Confirmation Dialog ── */}
      <Dialog
        open={convertDialogOpen}
        onClose={() => setConvertDialogOpen(false)}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Convert Lead?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to convert <strong>{lead.name}</strong> to a
            Deal? Their status will be changed to <strong>Converted</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setConvertDialogOpen(false)}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConvertConfirm}
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: 2,
              bgcolor: "#6c63ff",
              "&:hover": { bgcolor: "#5a52d5" },
            }}
          >
            Convert
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* ── Edit Lead Form ── */}
      <LeadForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
        initialData={{
          email: leadData.email,
          firstName: leadData.firstName || leadData.name.split(" ")[0],
          lastName: leadData.lastName || leadData.name.split(" ")[1] || "",
          phone: leadData.phone,
          jobTitle: leadData.jobTitle || "",
          companyName: leadData.companyName || "",
          contactOwners: leadData.contactOwner
            ? leadData.contactOwner.split(", ")
            : [],
          leadStatus: leadData.status || "",
        }}
      />
    </Box>
  );
}
