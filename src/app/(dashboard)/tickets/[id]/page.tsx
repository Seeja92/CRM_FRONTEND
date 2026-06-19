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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchTicketById,
  updateTicket,
  clearSelectedTicket,
} from "@/store/slices/ticketsSlice";
import ActivityPanel from "@/components/shared/activity/ActivityPanel";
import CallForm from "@/components/shared/activity/calls/CallForm";
import ToastNotification from "@/components/shared/ToastNotification";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import EmailForm from "@/components/shared/activity/emails/EmailForm";

// ── Constants ─────────────────────────────────────────────────────────────────
const statusOptions = [
  "New",
  "Open",
  "Waiting on us",
  "Waiting on contact",
  "Resolved",
  "Closed",
];
const priorityOptions = ["Low", "Medium", "High", "Critical"];
const sourceOptions = ["Chat", "Email", "Phone", "Meeting"];

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
const TicketViewPage = () => {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.id as string;

  const dispatch = useAppDispatch();
  // ✅ ticketData from Redux only — no useState duplicate
  const ticketData = useAppSelector((state) => state.tickets.selectedTicket);
  const loading = useAppSelector((state) => state.tickets.loading);
  const [activityLoading, setActivityLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [owners, setOwners] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [searchActivity, setSearchActivity] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [openCallForm, setOpenCallForm] = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [editForm, setEditForm] = useState({
    ticketName: "",
    status: "",
    source: "",
    priority: "",
    ownerId: "",
    dealId: "",
  });
  const [editErrors, setEditErrors] = useState<any>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [openEmailForm, setOpenEmailForm] = useState(false);
  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    message: "",
  });

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const getToken = () => localStorage.getItem("token");

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (month: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [month]: !(prev[month] ?? true),
    }));
  };

  // ── useEffect — fetch everything on mount ─────────────────────────────────
  useEffect(() => {
    if (ticketId) {
      dispatch(fetchTicketById(ticketId)); // ✅ Redux
      fetchOwners();
      fetchCompanies();
      fetchDeals();
      fetchActivities();
    }
    return () => {
      dispatch(clearSelectedTicket()); // cleanup on unmount
    };
  }, [ticketId]);

  // ── Sync status when ticketData loads from Redux ──────────────────────────
  useEffect(() => {
    if (ticketData?.status) {
      setStatus(ticketData.status);
    }
  }, [ticketData]);

  // ── Fetch Users ───────────────────────────────────────────────────────────
  const fetchOwners = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/users/`, {
        headers: { Authorization: `Token ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOwners(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to fetch owners:", err);
    }
  };

  // ── Fetch Companies ───────────────────────────────────────────────────────
  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${BASE_URL}/companies/`, {
        headers: { Authorization: `Token ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.results || data);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  // ── Fetch Deals ───────────────────────────────────────────────────────────
  const fetchDeals = async () => {
    try {
      const res = await fetch(`${BASE_URL}/deals/`, {
        headers: { Authorization: `Token ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDeals(data);
      }
    } catch (err) {
      console.error("Failed to fetch deals:", err);
    }
  };

  // ── Fetch Activities ──────────────────────────────────────────────────────
  const fetchActivities = async () => {
    try {
      setActivityLoading(true);
      const headers = { Authorization: `Token ${getToken()}` };
      const base = `${BASE_URL}/activities`;
      const p = `?entity_type=ticket&entity_id=${ticketId}`;

      const [notes, calls, tasks, meetings, emails] = await Promise.all([
        fetch(`${base}/notes/${p}`, { headers }).then((r) => r.json()),
        fetch(`${base}/calls/${p}`, { headers }).then((r) => r.json()),
        fetch(`${base}/tasks/${p}`, { headers }).then((r) => r.json()),
        fetch(`${base}/meetings/${p}`, { headers }).then((r) => r.json()),
        fetch(`${base}/emails/${p}`, { headers }).then((r) => r.json()),
      ]);

      const mapped = [
        ...(notes.results || notes || []).map((n: any) => ({
          id: `note-${n.id}`,
          type: "Note",
          title: n.content || "Note",
          assignee: n.created_by_name,
          date: n.created_at,
          isOverdue: false,
          is_complete: false,
        })),
        ...(calls.results || calls || []).map((c: any) => ({
          id: `call-${c.id}`,
          type: "Call",
          title: c.note || c.call_outcome || "Call",
          assignee: c.created_by_name,
          date: c.created_at,
          isOverdue: false,
          is_complete: false,
        })),
        ...(tasks.results || tasks || []).map((t: any) => ({
          id: `task-${t.id}`,
          type: "Task",
          title: t.task_name || "Task",
          assignee: t.assigned_to_name,
          date: t.created_at,
          dueDate: t.due_date,
          is_complete: t.is_complete,
          isOverdue:
            t.due_date && new Date(t.due_date) < new Date() && !t.is_complete,
        })),
        ...(meetings.results || meetings || []).map((m: any) => ({
          id: `meeting-${m.id}`,
          type: "Meeting",
          title: m.title || "Meeting",
          assignee: m.created_by_name,
          date: m.created_at,
          isOverdue: false,
          is_complete: false,
        })),
        ...(emails.results || emails || []).map((e: any) => ({
          id: `email-${e.id}`,
          type: "Email",
          title: e.subject || "Email",
          assignee: e.created_by_name,
          date: e.created_at,
          isOverdue: false,
          is_complete: false,
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setActivities(mapped);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  // ── Open Edit Drawer ──────────────────────────────────────────────────────
  const handleEditOpen = () => {
    const matchedOwner = owners.find((o) => o.name === ticketData.owner_name);
    const rawDeal = ticketData?.associated_deal;
    let dealId = "";
    // if (rawDeal) {
    //   dealId = typeof rawDeal === "object"
    //     ? String(rawDeal.id)
    //     : String(deals.find((d) => d.deal_name === ticketData.deal_name)?.id || "");
    // }
    if (rawDeal?.id) {
      dealId = String(rawDeal.id);
    } else if (ticketData?.deal_name) {
      dealId = String(
        deals.find((d) => d.deal_name === ticketData.deal_name)?.id || "",
      );
    }
    setEditForm({
      ticketName: ticketData.ticket_name,
      status: ticketData.status,
      source: ticketData.source,
      priority: ticketData.priority,
      ownerId: matchedOwner ? String(matchedOwner.id) : "",
      dealId,
    });
    setEditErrors({});
    setOpenEditDrawer(true);
  };

  // ── Save Edit ─────────────────────────────────────────────────────────────
  const handleEditSave = async () => {
    const errors: any = {};
    if (!editForm.ticketName.trim())
      errors.ticketName = "Ticket name is required.";
    if (!editForm.status) errors.status = "Status is required.";
    if (!editForm.source) errors.source = "Source is required.";
    if (!editForm.priority) errors.priority = "Priority is required.";
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await dispatch(
        updateTicket({
          // ✅ Redux
          id: ticketId,
          payload: {
            ticket_name: editForm.ticketName,
            status: editForm.status,
            source: editForm.source,
            priority: editForm.priority,
            ticket_owner_id: editForm.ownerId ? Number(editForm.ownerId) : null,
            deal_id: editForm.dealId ? Number(editForm.dealId) : null,
          },
        }),
      ).unwrap();
      dispatch(fetchTicketById(ticketId)); // refresh
      setOpenEditDrawer(false);
      setSnackbar({
        open: true,
        message: "Ticket updated successfully!",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to update ticket!",
        severity: "error",
      });
    }
  };

  // ── Status Change ─────────────────────────────────────────────────────────
  const handleStatusChange = async (newStatus: string) => {
    const oldStatus = status;
    setStatus(newStatus);
    try {
      await dispatch(
        updateTicket({
          // ✅ Redux
          id: ticketId,
          payload: { status: newStatus },
        }),
      ).unwrap();
    } catch {
      setStatus(oldStatus);
    }
  };

  const sendEmail = async (email: string, subject: string, message: string) => {
    console.log("sendEmail called:", { email, subject, message });
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/activities/emails/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entity_type: "ticket",
          entity_id: Number(ticketId),
          to: email,
          subject,
          body: message,
        }),
      });

         console.log("Email response status:", res.status);

      if (!res.ok) {
        console.error(await res.text());
        return;
      }

      await fetchActivities(); // refresh
    } catch (err) {
      console.error("Email send error:", err);
    }
  };

  // const associatedLead  = typeof ticketData?.associated_deal === "object" ? ticketData.associated_deal.associated_lead : null;
  // const associatedPhone = associatedLead?.phone_number || associatedLead?.phone || "";
  const associatedLead = ticketData?.associated_deal?.associated_lead ?? null;

  const associatedPhone =
    associatedLead?.phone_number || associatedLead?.phone || "";

  const activityColors: Record<string, string> = {
    Task: "#6c63ff",
    Call: "#4caf50",
    Meeting: "#2196f3",
    Email: "#ff9800",
    Note: "#9c27b0",
  };

  const groupByMonth = (items: any[]) => {
    const groups: Record<string, any[]> = {};
    items
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
  const ticketActivityContent = useMemo(() => {
    const groupedActivities = groupByMonth(activities);

    const filterLogic = (a: any) =>
      a.title?.toLowerCase().includes(searchActivity.toLowerCase()) ||
      a.assignee?.toLowerCase().includes(searchActivity.toLowerCase()) ||
      a.type?.toLowerCase().includes(searchActivity.toLowerCase());

    const renderActivityRow = (activity: any) => {
      switch (activity.type) {
        case "Task":
          return (
            <Accordion
              elevation={0}
              sx={{
                "&:before": { display: "none" },
                bgcolor: "transparent",
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
                sx={{
                  p: 0,
                  minHeight: 0,
                  flexDirection: "row-reverse",
                  "& .MuiAccordionSummary-content": {
                    m: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  },
                }}
              >
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
              </AccordionSummary>

              <AccordionDetails sx={{ p: "8px 0 0 0" }}>
                <Typography sx={{ fontSize: 12, color: "#777" }}>
                  {activity.note || activity.description || "No details"}
                </Typography>
              </AccordionDetails>
            </Accordion>
          );

        case "Call":
        case "Note":
        case "Email":
        case "Meeting":
          return (
            <Accordion
              elevation={0}
              sx={{ "&:before": { display: "none" }, bgcolor: "transparent" }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
                sx={{
                  p: 0,
                  minHeight: 0,
                  flexDirection: "row-reverse",
                  "& .MuiAccordionSummary-content": { m: 0 },
                }}
              >
                <Typography sx={{ fontSize: 13, color: "#555" }}>
                  {activity.title}
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ p: "8px 0 0 0" }}>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#666",
                    bgcolor: "#f9f9f9",
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  {activity.note || activity.description || "No details"}
                </Typography>
              </AccordionDetails>
            </Accordion>
          );

        default:
          return (
            <Typography sx={{ fontSize: 13 }}>{activity.title}</Typography>
          );
      }
    };

    return (
      <Box>
        {Object.entries(groupedActivities).map(([month, items]) => {
          const filtered = (items as any[]).filter(filterLogic);
          if (!filtered.length) return null;

          return (
            <Box key={month}>
              {/* Month header */}
              <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 2, mb: 1 }}>
                {month}
              </Typography>

              {/* Activities */}
              {filtered.map((activity) => (
                <Box
                  key={activity.id}
                  sx={{
                    border: "1px solid #eee",
                    borderRadius: 2,
                    p: 1.5,
                    mb: 1.5,
                    bgcolor: "#fff",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#6c63ff",
                      }}
                    >
                      {activity.type}
                    </Typography>

                    <Typography sx={{ fontSize: 12, color: "#aaa" }}>
                      {formatDate(activity.date)}
                    </Typography>
                  </Box>

                  {renderActivityRow(activity)}
                </Box>
              ))}
            </Box>
          );
        })}

        {activities.length === 0 && (
          <Typography sx={{ fontSize: 13, color: "#aaa", textAlign: "center", mt: 3 }}>
            No activities yet. Start by adding a note, call, task, or meeting!
          </Typography>
        )}
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
  if (!ticketData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ color: "#888" }}>Ticket not found.</Typography>
        <Button
          onClick={() => router.push("/tickets")}
          sx={{ color: "#6c63ff", mt: 1 }}
        >
          Back to Tickets
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
          onClick={() => router.push("/tickets")}
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
          Tickets
        </Button>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>
            {ticketData.ticket_name}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 2 }}>
          <Typography sx={{ fontSize: 13, color: "#888" }}>Status :</Typography>
          <FormControl size="small">
            <Select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              variant="standard"
              disableUnderline
              sx={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1a1a2e",
                "& .MuiSelect-select": { py: 0, pr: 2 },
              }}
            >
              {statusOptions.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {actionButtons.map((btn) => (
            <Box
              key={btn.label}
              onClick={() => {
                setActiveTab(btn.tabIndex);
                if (btn.label === "Call") setOpenCallForm(true);
                if (btn.label === "Email") setOpenEmailForm(true);
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
            About this Ticket
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
          { label: "Ticket Owner", value: ticketData.owner_name || "—" },
          { label: "Priority", value: ticketData.priority || "—" },
          { label: "Source", value: ticketData.source || "—" },
          // { label: "Deal",         value: ticketData.associated_deal ? typeof ticketData.associated_deal === "object" ? ticketData.associated_deal.deal_name : ticketData.deal_name || "—" : "—" },
          {
            label: "Deal",
            value:
              ticketData?.associated_deal?.deal_name ||
              ticketData?.deal_name ||
              "—",
          },
          {
            label: "Created Date",
            value: new Date(ticketData.created_at).toLocaleString(),
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
          entityId={Number(ticketId)}
          entityType="ticket"
          entity={{
            ...ticketData,
            name: ticketData.ticket_name,
            phone_number: associatedPhone,
            email: associatedLead?.email || associatedLead?.email_address || "",
          }}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activityContent={ticketActivityContent}
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
              AI Ticket Summary
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
            {activities.length > 0
              ? `This ticket has ${activities.length} activities. Latest: ${activities[0]?.type} — ${activities[0]?.title}`
              : "There are no activities associated with this ticket and further details are needed to provide a comprehensive summary."}
          </Typography>
        </Paper>
        <Attachments entityType="ticket" entityId={Number(ticketId)} />
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
            Edit Ticket
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
                Ticket Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={editForm.ticketName}
                onChange={(e) => {
                  setEditForm((p) => ({ ...p, ticketName: e.target.value }));
                  setEditErrors((p: any) => ({ ...p, ticketName: "" }));
                }}
                error={!!editErrors.ticketName}
                helperText={editErrors.ticketName}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Deal Name
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={editForm.dealId}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, dealId: e.target.value }))
                  }
                  displayEmpty
                  sx={{
                    borderRadius: 1.5,
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#e0e0e0" },
                  }}
                >
                  <MenuItem value="">
                    <span style={{ color: "#b0b0b0" }}>Choose Deal</span>
                  </MenuItem>
                  {deals.map((d) => (
                    <MenuItem key={d.id} value={String(d.id)}>
                      {d.deal_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Status <span style={{ color: "red" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={!!editErrors.status}>
                <Select
                  value={editForm.status}
                  onChange={(e) => {
                    setEditForm((p) => ({ ...p, status: e.target.value }));
                    setEditErrors((p: any) => ({ ...p, status: "" }));
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
                  {statusOptions.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.status && (
                  <FormHelperText>{editErrors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Source <span style={{ color: "red" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={!!editErrors.source}>
                <Select
                  value={editForm.source}
                  onChange={(e) => {
                    setEditForm((p) => ({ ...p, source: e.target.value }));
                    setEditErrors((p: any) => ({ ...p, source: "" }));
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
                  {sourceOptions.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.source && (
                  <FormHelperText>{editErrors.source}</FormHelperText>
                )}
              </FormControl>
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
                  {priorityOptions.map((p) => (
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Owner
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={editForm.ownerId}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, ownerId: e.target.value }))
                  }
                  displayEmpty
                  sx={{
                    borderRadius: 1.5,
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#e0e0e0" },
                  }}
                >
                  <MenuItem value="">
                    <span style={{ color: "#b0b0b0" }}>Choose</span>
                  </MenuItem>
                  {owners.map((o) => (
                    <MenuItem key={o.id} value={String(o.id)}>
                      {o.name}
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
      {/* ── Call Form ── */}
      <CallForm
        open={openCallForm}
        onClose={() => setOpenCallForm(false)}
        defaultPhone={associatedPhone}
        defaultContact={ticketData?.ticket_name || ticketData?.company_name || ""}
        onSave={async (data) => {
          try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${BASE_URL}/activities/calls/`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
              },
              body: JSON.stringify({
                entity_type: "ticket",
                entity_id: ticketId,
                connected: data.connected,
                call_outcome: data.callOutcome,
                date: data.date,
                time: data.time,
                note: data.note,
              }),
            });

            if (res.ok) await fetchActivities();
          } catch (err) {
            console.error("Failed to save call:", err);
          }

          setOpenCallForm(false);
        }}
      />
      {/* ── Email Form ── */}

      {openEmailForm && (
        <EmailForm
          open={openEmailForm}
          onClose={() => setOpenEmailForm(false)}
          onSend={async (data) => {                             
            await sendEmail(data.recipients, data.subject, data.body);  
            setOpenEmailForm(false);
          }}
          defaultRecipient={associatedLead?.email || ""}        
        />
      )}
      {/* ── Toast ── */}
      <ToastNotification
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </Box >
  );
};

export default TicketViewPage;
