"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  TextField,
  InputAdornment,
  Divider,
  Avatar,
  CircularProgress,
  Drawer,
  FormHelperText,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Attachments from "@/components/shared/Attachments";
import {
  ArrowBack,
  Edit,
  NoteAdd,
  Email,
  Call,
  Task,
  Event,
  Search,
} from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import { useRouter, useParams } from "next/navigation";
import ActivityPanel from "@/components/shared/activity/ActivityPanel";
import CallForm from "@/components/shared/activity/calls/CallForm";
import { dealsApi, usersApi, dealActivitiesApi } from "@/lib/api/deals";
import ToastNotification from "@/components/shared/ToastNotification";
import { CalendarTodayOutlined } from "@mui/icons-material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

// ── Constants ─────────────────────────────────────────────────────────────────
const dealStages = [
  "Appointment Scheduled",
  "Qualified to Buy",
  "Presentation Scheduled",
  "Decision Maker Bought In",
  "Contract Sent",
  "Closed Won",
  "Closed Lost",
  "Proposal Sent",
  "Negotiation",
];

const priorities = ["High", "Medium", "Low"];

const actionButtons = [
  { icon: <NoteAdd sx={{ fontSize: 18 }} />, label: "Note", tabIndex: 1 },
  { icon: <Email sx={{ fontSize: 18 }} />, label: "Email", tabIndex: 2 },
  { icon: <Call sx={{ fontSize: 18 }} />, label: "Call", tabIndex: 3 },
  { icon: <Task sx={{ fontSize: 18 }} />, label: "Task", tabIndex: 4 },
  { icon: <Event sx={{ fontSize: 18 }} />, label: "Meet...", tabIndex: 5 },
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    backgroundColor: "#fff",
    fontSize: 13,
    "& fieldset": { borderColor: "#e0e0e0" },
    "&:hover fieldset": { borderColor: "#b0b0b0" },
    "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
  },
};

const labelSx = { fontSize: 13, fontWeight: 500, color: "#1a1a2e", mb: 0.5 };

// ── Component ─────────────────────────────────────────────────────────────────
const DealViewPage = () => {
  const router = useRouter();
  const params = useParams();
  const dealId = params?.id as string;

  const [dealData, setDealData] = useState<any>(null);
  const [associatedLeadPhone, setAssociatedLeadPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState("");
  const [owners, setOwners] = useState<{ id: number; name: string }[]>([]);
  const [leads, setLeads] = useState<
    { id: number; name: string; phone: string }[]
  >([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [searchActivity, setSearchActivity] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [openCallForm, setOpenCallForm] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [editForm, setEditForm] = useState({
    dealName: "",
    dealStage: "",
    amount: "",
    dealOwner: "",
    closeDate: "",
    priority: "",
    associatedLead: "",
  });
  const [editErrors, setEditErrors] = useState<any>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // ── Fetch Deal ────────────────────────────────────────────────────────────
  const fetchDeal = async () => {
    try {
      setLoading(true);
      const data = await dealsApi.getById(dealId);

      setDealData(data);
      setStage(data.deal_stage);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch Users ───────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const data = await usersApi.getAll();
      const filtered = data.filter((u: any) => u.name.trim() !== "");
      setOwners(filtered);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  // ── Fetch Leads ───────────────────────────────────────────────────────────
  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        const list = data.results || data;
        setLeads(
          list.map((l: any) => ({
            id: l.id,
            name: `${l.first_name} ${l.last_name}`.trim(),
            phone: l.phone || "",
          })),
        );
      }
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    }
  };

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Token ${token}`,
      };

      const base = `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities`;
      const params = `?entity_type=deal&entity_id=${dealId}`;

      const [notes, calls, tasks, meetings, emails, dealActivities] =
        await Promise.all([
          fetch(`${base}/notes/${params}`, { headers }).then((r) => r.json()),
          fetch(`${base}/calls/${params}`, { headers }).then((r) => r.json()),
          fetch(`${base}/tasks/${params}`, { headers }).then((r) => r.json()),
          fetch(`${base}/meetings/${params}`, { headers }).then((r) =>
            r.json(),
          ),
          fetch(`${base}/emails/${params}`, { headers }).then((r) => r.json()),
          fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/deals/${dealId}/activities/`,
            { headers },
          ).then((r) => r.json()),
        ]);

      const mapped = [
        ...(notes.results || notes).map((n: any) => ({
          id: `note-${n.id}`,
          type: "Note",
          title: n.content,
          assignee: n.created_by_name || "Unknown",
          date: n.created_at,
          isOverdue: false,
          is_complete: false,
        })),

        ...(calls.results || calls).map((c: any) => ({
          id: `call-${c.id}`,
          type: "Call",
          title: c.note || c.call_outcome || "Call activity",
          assignee: c.created_by_name || "Unknown",
          date: c.created_at,
          isOverdue: false,
          is_complete: false,
        })),

        ...(tasks.results || tasks).map((t: any) => ({
          id: `task-${t.id}`,
          type: "Task",
          title: t.task_name,
          assignee: t.assigned_to_name || "Unknown",
          date: t.created_at,
          dueDate: t.due_date,
          isOverdue:
            t.due_date && new Date(t.due_date) < new Date() && !t.is_complete,
          is_complete: t.is_complete,
        })),

        ...(meetings.results || meetings).map((m: any) => ({
          id: `meeting-${m.id}`,
          type: "Meeting",
          title: m.title,
          assignee: m.created_by_name || "Unknown",
          date: m.created_at,
          isOverdue: false,
          is_complete: false,
        })),

        ...(emails.results || emails).map((e: any) => ({
          id: `email-${e.id}`,
          type: "Email",
          title: e.subject,
          assignee: e.created_by_name || "Unknown",
          date: e.created_at,
          isOverdue: false,
          is_complete: false,
        })),
        ...(dealActivities.results || dealActivities).map((a: any) => ({
          id: `deal-activity-${a.id}`,
          type: "Deal activity",
          title: a.message,
          assignee: a.created_by_name || "Unknown",
          date: a.created_at,
          isOverdue: false,
          is_complete: false,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setActivities(mapped);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  };

  useEffect(() => {
    if (dealId) {
      fetchDeal();
      fetchUsers();
      fetchLeads();
      fetchActivities();
    }
  }, [dealId]);

  useEffect(() => {
    if (!dealData?.associated_lead || leads.length === 0) return;
    const raw = dealData.associated_lead;
    if (typeof raw === "object" && raw !== null) {
      // ── First try phone directly from the nested object ──
      const directPhone = raw.phone || raw.phone_number || "";
      if (directPhone) {
        setAssociatedLeadPhone(directPhone);
        return;
      }
      // associated_lead is now a nested object { id, first_name, last_name, ... }
      // if (typeof raw === "object" && raw !== null) {
      const foundLead = leads.find((lead) => lead.id === raw.id);
      setAssociatedLeadPhone(foundLead?.phone || raw.phone || "");
    } else {
      // fallback: raw is a string name (old behavior)
      const foundLead = leads.find(
        (lead) =>
          lead.name?.trim().toLowerCase() === String(raw).trim().toLowerCase(),
      );
      setAssociatedLeadPhone(foundLead?.phone || "");
    }
  }, [dealData, leads]);

  // ── Open Edit Drawer ──────────────────────────────────────────────────────
  const handleEditOpen = () => {
    const rawLead = dealData.associated_lead;
    let leadId = "";
    if (rawLead) {
      if (typeof rawLead === "object") {
        leadId = String(rawLead.id);
      } else {
        leadId = String(rawLead);
      }
    }
    setEditForm({
      dealName: dealData.deal_name,
      dealStage: dealData.deal_stage,
      amount: String(parseFloat(dealData.amount)),
      dealOwner: dealData.deal_owner,
      closeDate: dealData.close_date,
      priority: dealData.priority,
      associatedLead: leadId,
    });
    setEditErrors({});
    setOpenEditDrawer(true);
  };

  // ── Save Edit ─────────────────────────────────────────────────────────────
  const handleEditSave = async () => {
    const errors: any = {};
    if (!editForm.dealName.trim()) errors.dealName = "Deal name is required.";
    if (!editForm.dealStage) errors.dealStage = "Deal stage is required.";
    if (!editForm.amount.trim()) errors.amount = "Amount is required.";
    if (!editForm.dealOwner) errors.dealOwner = "Deal owner is required.";
    if (!editForm.closeDate) errors.closeDate = "Close date is required.";
    if (!editForm.priority) errors.priority = "Priority is required.";
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await dealsApi.update(dealId, {
        deal_name: editForm.dealName,
        deal_stage: editForm.dealStage,
        amount: parseFloat(editForm.amount),
        deal_owner: editForm.dealOwner,
        close_date: editForm.closeDate,
        priority: editForm.priority,
        associated_lead_id: editForm.associatedLead
          ? parseInt(editForm.associatedLead, 10)
          : null,
      });
      await fetchDeal();
      setOpenEditDrawer(false);
      setSnackbar({
        open: true,
        message: "Deal updated successfully!",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to update deal!",
        severity: "error",
      });
    }
  };

  // ── Stage Change ──────────────────────────────────────────────────────────

  const handleStageChange = async (newStage: string) => {
    const oldStage = stage;

    // instant UI update
    setStage(newStage);

    try {
      // update deal stage
      await dealsApi.update(dealId, {
        deal_stage: newStage,
      });

      // create timeline activity
      await dealActivitiesApi.create(
        dealId,
        `Stage changed from "${oldStage}" to "${newStage}".`,
        "stage_change",
      );

      // refresh activities
      await fetchActivities();
    } catch (err) {
      console.error("Stage update failed:", err);

      // rollback UI if failed
      setStage(oldStage);
    }
  };

  const activityColors: Record<string, string> = {
    Task: "#6c63ff",
    Call: "#4caf50",
    Meeting: "#2196f3",
    Email: "#ff9800",
    Note: "#9c27b0",
    "Deal activity": "#0f0612",
  };

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
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const dealActivityContent = useMemo(() => {
    const upcomingActivities = activities.filter((a) => a.isOverdue);

    const groupedActivities = groupByMonth(activities);

    const filteredUpcoming = upcomingActivities.filter(
      (a) =>
        a.title?.toLowerCase().includes(searchActivity.toLowerCase()) ||
        a.assignee?.toLowerCase().includes(searchActivity.toLowerCase()) ||
        a.type?.toLowerCase().includes(searchActivity.toLowerCase()),
    );

    return (
      <Box>
        {/* Upcoming */}

        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 700,
            color: "#1a1a2e",
            mb: 2,
          }}
        >
          Upcoming
        </Typography>

        {filteredUpcoming.length === 0 && activities.length === 0 ? (
          <Typography
            sx={{
              fontSize: 13,
              color: "#999",
              mb: 3,
            }}
          >
            No upcoming activities.
          </Typography>
        ) : (
          filteredUpcoming.map((activity) => (
            <Paper
              key={activity.id}
              elevation={0}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 3,
                border: "1px solid #ececec",
                backgroundColor: "#fff",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1.2,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#444",
                    fontWeight: 500,
                  }}
                >
                  {activity.type} assigned to {activity.assignee}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#e53935",
                    fontWeight: 600,
                  }}
                >
                  Overdue
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {activity.is_complete ? (
                  <CheckCircleIcon
                    sx={{
                      fontSize: 18,
                      color: "#4caf50",
                    }}
                  />
                ) : (
                  <RadioButtonUncheckedIcon
                    sx={{
                      fontSize: 18,
                      color: "#b0b0b0",
                    }}
                  />
                )}

                <Typography
                  sx={{
                    fontSize: 13,
                    color: activity.is_complete ? "#999" : "#1a1a2e",
                    textDecoration: activity.is_complete
                      ? "line-through"
                      : "none",
                  }}
                >
                  {activity.title}
                </Typography>
              </Box>
            </Paper>
          ))
        )}

        {/* Timeline */}
        {Object.entries(groupedActivities).map(([month, items]) => (
          <Box key={month} sx={{ mb: 4 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: "#1a1a2e",
                mb: 2,
              }}
            >
              {month}
            </Typography>

            {(items as any[]).map((activity: any) => (
              <Paper
                key={activity.id}
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 3,
                  border: "1px solid #ececec",
                  backgroundColor: "#fff",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 2,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: activityColors[activity.type] || "#6c63ff",
                        mb: 0.5,
                      }}
                    >
                      {activity.type}
                      {activity.assignee ? ` from ${activity.assignee}` : ""}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 14,
                        color: "#333",
                        mb: 1,
                      }}
                    >
                      {activity.title}
                    </Typography>

                    {activity.is_complete && (
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          px: 1,
                          py: 0.3,
                          borderRadius: 1,
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        Finished
                      </Box>
                    )}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "#999",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDate(activity.date)}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        ))}
      </Box>
    );
  }, [activities, searchActivity]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress sx={{ color: "#6c63ff" }} />
      </Box>
    );
  }

  // ── Not Found ─────────────────────────────────────────────────────────────
  if (!dealData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ color: "#888" }}>Deal not found.</Typography>
        <Button
          onClick={() => router.push("/deals")}
          sx={{ color: "#6c63ff", mt: 1 }}
        >
          Back to Deals
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", gap: 2, p: 3 }}>
      {/* ── Left Panel ── */}
      <Box sx={{ width: 220, flexShrink: 0 }}>
        <Button
          startIcon={<ArrowBack sx={{ fontSize: 14 }} />}
          onClick={() => router.push("/deals")}
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
          Deals
        </Button>

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
            {dealData.deal_name?.[0]}
          </Avatar>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>
            {dealData.deal_name}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#888" }}>
            Amount: ${parseFloat(dealData.amount).toLocaleString()}
          </Typography>
        </Box>

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <Select
            value={stage}
            onChange={(e) => handleStageChange(e.target.value)}
            sx={{ borderRadius: 2, fontSize: 13, backgroundColor: "#fff" }}
          >
            {dealStages.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>
            About this Deal
          </Typography>
          <IconButton
            size="small"
            onClick={handleEditOpen}
            sx={{ color: "#6c63ff" }}
          >
            <Edit sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        {[
          { label: "Deal Owner", value: dealData.deal_owner },
          { label: "Priority", value: dealData.priority },
          { label: "Close Date", value: dealData.close_date },
          {
            label: "Associated Lead",
            value: dealData.associated_lead
              ? typeof dealData.associated_lead === "object"
                ? `${dealData.associated_lead.first_name || ""} ${dealData.associated_lead.last_name || ""}`.trim()
                : dealData.associated_lead
              : "—",
          },
          {
            label: "Created Date",
            value: new Date(dealData.created_at).toLocaleString(),
          },
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

      {/* ── Middle Panel ── */}
      <Box sx={{ flex: 1 }}>
        <TextField
          fullWidth
          placeholder="Search activities"
          size="small"
          value={searchActivity}
          onChange={(e) => setSearchActivity(e.target.value)}
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
            mb: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#fff",
              "& fieldset": { borderColor: "#e0e0e0" },
              "&:hover fieldset": { borderColor: "#b0b0b0" },
              "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
            },
          }}
        />
        <ActivityPanel
          entityId={Number(dealId)}
          entityType="deal"
          entity={{
            ...dealData,
            phone: associatedLeadPhone, // 👈 inject phone
            name: dealData.deal_name, // 👈 for avatar initial
            lead_name: dealData.associated_lead
              ? typeof dealData.associated_lead === "object"
                ? `${dealData.associated_lead.first_name || ""} ${dealData.associated_lead.last_name || ""}`.trim()
                : dealData.associated_lead
              : "",
          }}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activityContent={dealActivityContent}
          onLogCall={() => setOpenCallForm(true)}
        />
      </Box>

      {/* ── Right Panel ── */}
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
              AI Deal Summary
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
            There are no activities associated with this deal and further
            details are needed to provide a comprehensive summary.
          </Typography>
        </Paper>
        <Attachments entityType="deal" entityId={Number(dealId)} />
      </Box>

      {/* ── Edit Drawer ── */}
      <Drawer
        anchor="right"
        open={openEditDrawer}
        onClose={() => setOpenEditDrawer(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, p: 0 } }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>
            Edit Deal
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpenEditDrawer(false)}
            sx={{ color: "#888" }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ px: 3, py: 2, overflowY: "auto", flex: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Deal Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={editForm.dealName}
                onChange={(e) => {
                  setEditForm((p) => ({ ...p, dealName: e.target.value }));
                  setEditErrors((p: any) => ({ ...p, dealName: "" }));
                }}
                error={!!editErrors.dealName}
                helperText={editErrors.dealName}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Deal Stage <span style={{ color: "red" }}>*</span>
              </Typography>
              <FormControl
                fullWidth
                size="small"
                error={!!editErrors.dealStage}
              >
                <Select
                  value={editForm.dealStage}
                  onChange={(e) => {
                    setEditForm((p) => ({ ...p, dealStage: e.target.value }));
                    setEditErrors((p: any) => ({ ...p, dealStage: "" }));
                  }}
                  displayEmpty
                  sx={{
                    borderRadius: 1.5,
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#e0e0e0" },
                  }}
                >
                  <MenuItem value="" disabled>
                    <span style={{ color: "#b0b0b0" }}>Choose</span>
                  </MenuItem>
                  {dealStages.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.dealStage && (
                  <FormHelperText>{editErrors.dealStage}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Amount <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={editForm.amount}
                onChange={(e) => {
                  setEditForm((p) => ({ ...p, amount: e.target.value }));
                  setEditErrors((p: any) => ({ ...p, amount: "" }));
                }}
                error={!!editErrors.amount}
                helperText={editErrors.amount}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Deal Owner <span style={{ color: "red" }}>*</span>
              </Typography>
              <FormControl
                fullWidth
                size="small"
                error={!!editErrors.dealOwner}
              >
                <Select
                  value={editForm.dealOwner}
                  onChange={(e) => {
                    setEditForm((p) => ({ ...p, dealOwner: e.target.value }));
                    setEditErrors((p: any) => ({ ...p, dealOwner: "" }));
                  }}
                  displayEmpty
                  sx={{
                    borderRadius: 1.5,
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#e0e0e0" },
                  }}
                >
                  <MenuItem value="" disabled>
                    <span style={{ color: "#b0b0b0" }}>Choose</span>
                  </MenuItem>
                  {owners.map((o) => (
                    <MenuItem key={o.id} value={o.name}>
                      {o.name}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.dealOwner && (
                  <FormHelperText>{editErrors.dealOwner}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Close Date <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={editForm.closeDate}
                onChange={(e) => {
                  setEditForm((p) => ({ ...p, closeDate: e.target.value }));
                  setEditErrors((p: any) => ({ ...p, closeDate: "" }));
                }}
                error={!!editErrors.closeDate}
                helperText={editErrors.closeDate}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Priority <span style={{ color: "red" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={!!editErrors.priority}>
                <Select
                  value={editForm.priority}
                  onChange={(e) => {
                    setEditForm((p) => ({ ...p, priority: e.target.value }));
                    setEditErrors((p: any) => ({ ...p, priority: "" }));
                  }}
                  displayEmpty
                  sx={{
                    borderRadius: 1.5,
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#e0e0e0" },
                  }}
                >
                  <MenuItem value="" disabled>
                    <span style={{ color: "#b0b0b0" }}>Choose</span>
                  </MenuItem>
                  {priorities.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.priority && (
                  <FormHelperText>{editErrors.priority}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Associated Lead
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={editForm.associatedLead}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      associatedLead: e.target.value,
                    }))
                  }
                  displayEmpty
                  sx={{
                    borderRadius: 1.5,
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#e0e0e0" },
                  }}
                >
                  <MenuItem value="">
                    <span style={{ color: "#b0b0b0" }}>Select Lead</span>
                  </MenuItem>
                  {leads.map((l) => (
                    <MenuItem key={l.id} value={String(l.id)}>
                      {l.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            gap: 1,
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setOpenEditDrawer(false)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              borderColor: "#e0e0e0",
              color: "#555",
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleEditSave}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#6c63ff",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#574fd6", boxShadow: "none" },
            }}
          >
            Update
          </Button>
        </Box>
      </Drawer>

      <CallForm
        open={openCallForm}
        onClose={() => setOpenCallForm(false)}
        defaultContact={
          dealData.associated_lead
            ? typeof dealData.associated_lead === "object"
              ? `${dealData.associated_lead.first_name || ""} ${dealData.associated_lead.last_name || ""}`.trim()
              : dealData.deal_owner
            : dealData.deal_owner
        }
        defaultPhone={
          typeof dealData.associated_lead === "object"
            ? dealData.associated_lead?.phone ||
              dealData.associated_lead?.phone_number ||
              ""
            : ""
        }
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
                entity_type: "deal",
                entity_id: Number(dealId),
                connected: data.connected,
                call_outcome: data.callOutcome,
                date: data.date,
                time: data.time,
                note: data.note,
              }),
            },
          );

          setOpenCallForm(false);
          fetchActivities();
        }}
      />

      {/* ── Toast ── */}
      <ToastNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box>
  );
};

export default DealViewPage;
