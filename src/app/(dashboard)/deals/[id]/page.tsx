

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box, Typography, Button, Paper, IconButton, Select, MenuItem,
  FormControl, TextField, InputAdornment, Divider,
  CircularProgress, Drawer, FormHelperText,
  Accordion, AccordionSummary, AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Grid from "@mui/material/Grid2";
import Attachments from "@/components/shared/Attachments";
import {
  ArrowBack, Edit, NoteAdd, Email, Call, Task, Event, Search,
} from "@mui/icons-material";
import Close from "@mui/icons-material/Close";
import { useRouter, useParams } from "next/navigation";
import ActivityPanel from "@/components/shared/activity/ActivityPanel";
import CallForm from "@/components/shared/activity/calls/CallForm";
import { dealActivitiesApi } from "@/lib/api/deals";
import ToastNotification from "@/components/shared/ToastNotification";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDealById, fetchDealUsers, fetchDealLeads,
  updateDeal, clearSelectedDeal,
} from "@/store/slices/dealsSlice";

const dealStages = [
  "Appointment Scheduled", "Qualified to Buy", "Presentation Scheduled",
  "Decision Maker Bought In", "Contract Sent", "Closed Won",
  "Closed Lost", "Proposal Sent", "Negotiation",
];

const priorities = ["High", "Medium", "Low"];

const actionButtons = [
  { icon: <NoteAdd sx={{ fontSize: 18 }} />, label: "Note",    tabIndex: 1 },
  { icon: <Email   sx={{ fontSize: 18 }} />, label: "Email",   tabIndex: 2 },
  { icon: <Call    sx={{ fontSize: 18 }} />, label: "Call",    tabIndex: 3 },
  { icon: <Task    sx={{ fontSize: 18 }} />, label: "Task",    tabIndex: 4 },
  { icon: <Event   sx={{ fontSize: 18 }} />, label: "Meet...", tabIndex: 5 },
];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5, backgroundColor: "#fff", fontSize: 13,
    "& fieldset": { borderColor: "#e0e0e0" },
    "&:hover fieldset": { borderColor: "#b0b0b0" },
    "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
  },
};

const labelSx = { fontSize: 13, fontWeight: 500, color: "#1a1a2e", mb: 0.5 };

const DealViewPage = () => {
  const router   = useRouter();
  const params   = useParams();
  const dealId   = params?.id as string;
  const dispatch = useAppDispatch();

  const dealData = useAppSelector((state) => state.deals.selectedDeal) as any;
  const loading  = useAppSelector((state) => state.deals.loading);
  const owners   = useAppSelector((state) => state.deals.users);
  const leads    = useAppSelector((state) => state.deals.leads);

  const [associatedLeadPhone, setAssociatedLeadPhone] = useState("");
  const [stage, setStage]                   = useState("");
  const [activities, setActivities]         = useState<any[]>([]);
  const [searchActivity, setSearchActivity] = useState("");
  const [activeTab, setActiveTab]           = useState(0);
  const [openCallForm, setOpenCallForm]     = useState(false);
  const [openEditDrawer, setOpenEditDrawer] = useState(false);
  const [editForm, setEditForm] = useState({
    dealName: "", dealStage: "", amount: "",
    dealOwner: "", closeDate: "", priority: "", associatedLead: "",
  });
  const [editErrors, setEditErrors] = useState<any>({});
  const [snackbar, setSnackbar]     = useState({
    open: false, message: "", severity: "success" as "success" | "error",
  });

  useEffect(() => {
    if (dealId) {
      dispatch(fetchDealById(dealId));
      dispatch(fetchDealUsers());
      dispatch(fetchDealLeads());
      fetchActivities();
    }
    return () => { dispatch(clearSelectedDeal()); };
  }, [dealId]);

  useEffect(() => {
    if (dealData) setStage(dealData.dealStage || dealData.deal_stage || "");
  }, [dealData]);

  useEffect(() => {
    if (!dealData?.associatedLead || leads.length === 0) return;
    const raw = dealData.associatedLead;
    if (typeof raw === "object" && raw !== null) {
      const directPhone = raw.phone || raw.phone_number || "";
      if (directPhone) { setAssociatedLeadPhone(directPhone); return; }
      const found = leads.find((l) => Number(l.id) === raw.id);
      setAssociatedLeadPhone(found?.phone || "");
    } else {
      const found = leads.find((l) => l.name?.trim().toLowerCase() === String(raw).trim().toLowerCase());
      setAssociatedLeadPhone(found?.phone || "");
    }
  }, [dealData, leads]);

  const fetchActivities = async () => {
    try {
      const token   = localStorage.getItem("access");
      const headers = { Authorization: `Bearer ${token}` };
      const base    = `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities`;
      const p       = `?entity_type=deal&entity_id=${dealId}`;

      const [notes, calls, tasks, meetings, emails, dealActs] = await Promise.all([
        fetch(`${base}/notes/${p}`,    { headers }).then((r) => r.json()),
        fetch(`${base}/calls/${p}`,    { headers }).then((r) => r.json()),
        fetch(`${base}/tasks/${p}`,    { headers }).then((r) => r.json()),
        fetch(`${base}/meetings/${p}`, { headers }).then((r) => r.json()),
        fetch(`${base}/emails/${p}`,   { headers }).then((r) => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/deals/${dealId}/activities/`, { headers }).then((r) => r.json()),
      ]);

      const mapped = [
        ...(notes.results    || notes).map((n: any)    => ({ id: `note-${n.id}`,          type: "Note",          title: n.content,                      assignee: n.created_by_name || "Unknown",    date: n.created_at,  isOverdue: false, is_complete: false })),
        ...(calls.results    || calls).map((c: any)    => ({ id: `call-${c.id}`,          type: "Call",          title: c.note || c.call_outcome || "Call", assignee: c.created_by_name || "Unknown",  date: c.created_at,  isOverdue: false, is_complete: false })),
        ...(tasks.results    || tasks).map((t: any)    => ({ id: `task-${t.id}`,          type: "Task",          title: t.task_name,                    assignee: t.assigned_to_name || "Unknown",   date: t.created_at,  dueDate: t.due_date, isOverdue: t.due_date && new Date(t.due_date) < new Date() && !t.is_complete, is_complete: t.is_complete })),
        ...(meetings.results || meetings).map((m: any) => ({ id: `meeting-${m.id}`,       type: "Meeting",       title: m.title,                        assignee: m.created_by_name || "Unknown",    date: m.created_at,  isOverdue: false, is_complete: false })),
        ...(emails.results   || emails).map((e: any)   => ({ id: `email-${e.id}`,         type: "Email",         title: e.subject,                      assignee: e.created_by_name || "Unknown",    date: e.created_at,  isOverdue: false, is_complete: false })),
        ...(dealActs.results || dealActs).map((a: any) => ({ id: `deal-activity-${a.id}`, type: "Deal activity", title: a.message,                      assignee: a.created_by_name || "Unknown",    date: a.created_at,  isOverdue: false, is_complete: false })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setActivities(mapped);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  };

  const handleEditOpen = () => {
    if (!dealData) return;
    const rawLead = dealData.associatedLead;
    let leadId = "";
    if (rawLead) leadId = typeof rawLead === "object" ? String(rawLead.id) : String(rawLead);
    setEditForm({
      dealName:       dealData.dealName    || dealData.deal_name  || "",
      dealStage:      dealData.dealStage   || dealData.deal_stage || "",
      amount:         String(parseFloat(dealData.amount)),
      dealOwner:      dealData.dealOwner   || dealData.deal_owner || "",
      closeDate:      dealData.closeDate   || dealData.close_date || "",
      priority:       dealData.priority    || "",
      associatedLead: leadId,
    });
    setEditErrors({});
    setOpenEditDrawer(true);
  };

  const handleEditSave = async () => {
    const errors: any = {};
    if (!editForm.dealName.trim()) errors.dealName  = "Deal name is required.";
    if (!editForm.dealStage)       errors.dealStage = "Deal stage is required.";
    if (!editForm.amount.trim())   errors.amount    = "Amount is required.";
    if (!editForm.dealOwner)       errors.dealOwner = "Deal owner is required.";
    if (!editForm.closeDate)       errors.closeDate = "Close date is required.";
    if (!editForm.priority)        errors.priority  = "Priority is required.";
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const associatedLeadName = editForm.associatedLead
      ? leads.find((l) => l.id === editForm.associatedLead)?.name || null
      : null;

    try {
      await dispatch(updateDeal({
        id: dealId,
        payload: {
          deal_name:       editForm.dealName,
          deal_stage:      editForm.dealStage,
          amount:          parseFloat(editForm.amount),
          deal_owner:      editForm.dealOwner,
          close_date:      editForm.closeDate,
          priority:        editForm.priority,
          associated_lead: associatedLeadName,
          // associated_lead_id: editForm.associatedLead
          // ? parseInt(editForm.associatedLead, 10)
          // : null,      
        },
      })).unwrap();
      dispatch(fetchDealById(dealId));
      setOpenEditDrawer(false);
      setSnackbar({ open: true, message: "Deal updated successfully!", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to update deal!", severity: "error" });
    }
  };

  const handleStageChange = async (newStage: string) => {
    const oldStage = stage;
    setStage(newStage);
    try {
      await dispatch(updateDeal({ id: dealId, payload: { deal_stage: newStage } })).unwrap();
      await dealActivitiesApi.create(dealId, `Stage changed from "${oldStage}" to "${newStage}".`, "stage_change");
      await fetchActivities();
    } catch {
      setStage(oldStage);
    }
  };

  const activityColors: Record<string, string> = {
    Task: "#6c63ff", Call: "#4caf50", Meeting: "#2196f3",
    Email: "#ff9800", Note: "#9c27b0", "Deal activity": "#0f0612",
  };

  const groupByMonth = (acts: any[]) => {
    const groups: Record<string, any[]> = {};
    acts.filter((a) => !a.isOverdue).forEach((a) => {
      const month = new Date(a.date).toLocaleString("en-US", { month: "long", year: "numeric" });
      if (!groups[month]) groups[month] = [];
      groups[month].push(a);
    });
    return groups;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });

  const dealActivityContent = useMemo(() => {
    const upcomingActivities = activities.filter((a) => a.isOverdue);
    const groupedActivities  = groupByMonth(activities);
    const filteredUpcoming   = upcomingActivities.filter(
      (a) => a.title?.toLowerCase().includes(searchActivity.toLowerCase()) ||
             a.assignee?.toLowerCase().includes(searchActivity.toLowerCase()) ||
             a.type?.toLowerCase().includes(searchActivity.toLowerCase()),
    );

    return (
      <Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", mb: 2 }}>Upcoming</Typography>
        {filteredUpcoming.length === 0 && activities.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "#999", mb: 3 }}>No upcoming activities.</Typography>
        ) : (
          filteredUpcoming.map((activity) => (
            <Paper key={activity.id} elevation={0}
              sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid #ececec", backgroundColor: "#fff" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.2 }}>
                <Typography sx={{ fontSize: 13, color: "#444", fontWeight: 500 }}>
                  {activity.type} assigned to {activity.assignee}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#e53935", fontWeight: 600 }}>Overdue</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {activity.is_complete
                  ? <CheckCircleIcon sx={{ fontSize: 18, color: "#4caf50" }} />
                  : <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: "#b0b0b0" }} />}
                <Typography sx={{ fontSize: 13, color: activity.is_complete ? "#999" : "#1a1a2e", textDecoration: activity.is_complete ? "line-through" : "none" }}>
                  {activity.title}
                </Typography>
              </Box>
            </Paper>
          ))
        )}
        {Object.entries(groupedActivities).map(([month, items]) => (
          <Box key={month} sx={{ mb: 4 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e", mb: 2 }}>{month}</Typography>
            {(items as any[]).map((activity: any) => (
  <Accordion key={activity.id} elevation={0}
    sx={{
      mb: 1.5, borderRadius: '12px !important', border: "1px solid #ececec",
      backgroundColor: "#fff", overflow: 'hidden',
      '&:before': { display: 'none' },
      '&.Mui-expanded': { margin: '0 0 12px 0' },
    }}>
    <AccordionSummary
  expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: "#888" }} />}
  sx={{
    flexDirection: "row-reverse",
    gap: 1,
    px: 2,
    py: 1,
    minHeight: "48px",
    "& .MuiAccordionSummary-expandIconWrapper": { marginRight: 1 },
    "& .MuiAccordionSummary-content": {
      margin: "8px 0",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 2,
    },
  }}>
      
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: activityColors[activity.type] || "#6c63ff", mb: 0.3 }}>
          {activity.type}{activity.assignee ? ` from ${activity.assignee}` : ""}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "#666", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
          {activity.title}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: 11, color: "#aaa", whiteSpace: "nowrap", mr: 1 }}>
        {formatDate(activity.date)}
      </Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ px: 2, pt: 0, pb: 2, borderTop: '1px solid #f0f0f0' }}>
      <Typography sx={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
        {activity.title}
      </Typography>
      {activity.is_complete && (
        <Box sx={{ display: "inline-flex", alignItems: "center", mt: 1, px: 1, py: 0.3, borderRadius: 1, backgroundColor: "#e8f5e9", color: "#2e7d32", fontSize: 12, fontWeight: 600 }}>
          Finished
        </Box>
      )}
      {activity.dueDate && (
        <Typography sx={{ fontSize: 12, color: "#888", mt: 0.5 }}>
          Due: {activity.dueDate}
        </Typography>
      )}
    </AccordionDetails>
  </Accordion>
))}
          </Box>
        ))}
      </Box>
    );
  }, [activities, searchActivity]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress sx={{ color: "#6c63ff" }} />
      </Box>
    );
  }

  if (!dealData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography sx={{ color: "#888" }}>Deal not found.</Typography>
        <Button onClick={() => router.push("/deals")} sx={{ color: "#6c63ff", mt: 1 }}>Back to Deals</Button>
      </Box>
    );
  }

  const dealName       = dealData.dealName      || dealData.deal_name  || "";
  const dealOwner      = dealData.dealOwner     || dealData.deal_owner || "";
  const closeDate      = dealData.closeDate     || dealData.close_date || "";
  const amount         = dealData.amount        || 0;
  const priority       = dealData.priority      || "";
  const associatedLead = dealData.associatedLead ?? dealData.associated_lead ?? null;

  const associatedLeadName = associatedLead
    ? typeof associatedLead === "object"
      ? `${associatedLead.first_name || ""} ${associatedLead.last_name || ""}`.trim()
      : associatedLead
    : "—";

  return (
    <Box sx={{ display: "flex", gap: 2, p: 3 }}>

      {/* ── Left Panel ── */}
      <Box sx={{ width: 220, flexShrink: 0 }}>
        <Button startIcon={<ArrowBack sx={{ fontSize: 14 }} />} onClick={() => router.push("/deals")}
          sx={{ textTransform: "none", color: "#6c63ff", fontWeight: 500, fontSize: 13, mb: 2, p: 0, "&:hover": { backgroundColor: "transparent" } }}>
          Deals
        </Button>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", mb: 2 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>{dealName}</Typography>
          <Typography sx={{ fontSize: 12, color: "#888" }}>
            Amount: ${parseFloat(String(amount)).toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2, flexWrap: 'nowrap' }}>
  <Typography sx={{ fontSize: 13, color: '#888', whiteSpace: 'nowrap' }}>Stage :</Typography>
  <FormControl size="small" sx={{ minWidth: 0, flex: 1 }}>
    <Select value={stage} onChange={(e) => handleStageChange(e.target.value)}
      variant="standard"
      disableUnderline
      sx={{
        fontSize: 13, fontWeight: 600, color: '#1a1a2e',
        '& .MuiSelect-select': { py: 0, pr: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
      }}>
      {dealStages.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
    </Select>
  </FormControl>
</Box>

        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {actionButtons.map((btn) => (
            <Box key={btn.label}
              onClick={() => { setActiveTab(btn.tabIndex); if (btn.label === "Call") setOpenCallForm(true); }}
              sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, cursor: "pointer", "&:hover": { opacity: 0.8 } }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2, border: "1px solid #e0e0e0", backgroundColor: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "#6c63ff" }}>
                {btn.icon}
              </Box>
              <Typography sx={{ fontSize: 10, color: "#888" }}>{btn.label}</Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
          <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>About this Deal</Typography>
          <IconButton size="small" onClick={handleEditOpen} sx={{ color: "#6c63ff" }}>
            <Edit sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        {[
          { label: "Deal Owner",      value: dealOwner },
          { label: "Priority",        value: priority },
          { label: "Close Date",      value: closeDate },
          { label: "Associated Lead", value: associatedLeadName },
          { label: "Created Date",    value: dealData.created_at ? new Date(dealData.created_at).toLocaleString() : "—" },
        ].map((item) => (
          <Box key={item.label} sx={{ mb: 1.5 }}>
            <Typography sx={{ fontSize: 11, color: "#999", mb: 0.25 }}>{item.label}</Typography>
            <Typography sx={{ fontSize: 13, color: "#1a1a2e", fontWeight: 500 }}>{item.value}</Typography>
          </Box>
        ))}
      </Box>
      {/* ── End Left Panel ── */}

      {/* ── Middle Panel ── */}
      <Box sx={{ flex: 1 }}>
        <TextField fullWidth placeholder="Search activities" size="small"
          value={searchActivity} onChange={(e) => setSearchActivity(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: "#b0b0b0" }} /></InputAdornment> } }}
          sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2, backgroundColor: "#fff", "& fieldset": { borderColor: "#e0e0e0" }, "&:hover fieldset": { borderColor: "#b0b0b0" }, "&.Mui-focused fieldset": { borderColor: "#6c63ff" } } }} />
        <ActivityPanel
          entityId={Number(dealId)}
          entityType="deal"
          entity={{
            ...dealData,
            phone:     associatedLeadPhone,
            email:     typeof dealData.associatedLead === "object" ? dealData.associatedLead?.email || "" : "",
            name:      dealName,
            lead_name: associatedLeadName,
          }}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activityContent={dealActivityContent}
          onLogCall={() => setOpenCallForm(true)}
        />
      </Box>
      {/* ── End Middle Panel ── */}

      {/* ── Right Panel ── */}
      <Box sx={{ width: 220, flexShrink: 0 }}>
        <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: "1px solid #e8e8e8", backgroundColor: "#fff" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Box sx={{ width: 24, height: 24, borderRadius: 1, backgroundColor: "#f0effe", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ fontSize: 12 }}>✨</Typography>
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#6c63ff" }}>AI Deal Summary</Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
            {activities.length > 0
              ? `This deal has ${activities.length} activities. Latest: ${activities[0]?.type} — ${activities[0]?.title}`
              : "There are no activities associated with this deal and further details are needed to provide a comprehensive summary."}
          </Typography>
        </Paper>
        <Attachments entityType="deal" entityId={Number(dealId)} />
      </Box>
      {/* ── End Right Panel ── */}

      {/* ── Edit Drawer ── */}
      <Drawer anchor="right" open={openEditDrawer} onClose={() => setOpenEditDrawer(false)}
        PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, p: 0 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>Edit Deal</Typography>
          <IconButton size="small" onClick={() => setOpenEditDrawer(false)} sx={{ color: "#888" }}><Close fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ px: 3, py: 2, overflowY: "auto", flex: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>Deal Name <span style={{ color: "red" }}>*</span></Typography>
              <TextField fullWidth size="small" placeholder="Enter" value={editForm.dealName}
                onChange={(e) => { setEditForm((p) => ({ ...p, dealName: e.target.value })); setEditErrors((p: any) => ({ ...p, dealName: "" })); }}
                error={!!editErrors.dealName} helperText={editErrors.dealName} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>Deal Stage <span style={{ color: "red" }}>*</span></Typography>
              <FormControl fullWidth size="small" error={!!editErrors.dealStage}>
                <Select value={editForm.dealStage}
                  onChange={(e) => { setEditForm((p) => ({ ...p, dealStage: e.target.value })); setEditErrors((p: any) => ({ ...p, dealStage: "" })); }}
                  displayEmpty sx={{ borderRadius: 1.5, backgroundColor: "#fff", "& fieldset": { borderColor: "#e0e0e0" } }}>
                  <MenuItem value="" disabled><span style={{ color: "#b0b0b0" }}>Choose</span></MenuItem>
                  {dealStages.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
                {editErrors.dealStage && <FormHelperText>{editErrors.dealStage}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>Amount <span style={{ color: "red" }}>*</span></Typography>
              <TextField fullWidth size="small" placeholder="Enter" value={editForm.amount}
                onChange={(e) => { setEditForm((p) => ({ ...p, amount: e.target.value })); setEditErrors((p: any) => ({ ...p, amount: "" })); }}
                error={!!editErrors.amount} helperText={editErrors.amount} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>Deal Owner <span style={{ color: "red" }}>*</span></Typography>
              {/* <FormControl fullWidth size="small" error={!!editErrors.dealOwner}>
                <Select value={editForm.dealOwner}
                  onChange={(e) => { setEditForm((p) => ({ ...p, dealOwner: e.target.value })); setEditErrors((p: any) => ({ ...p, dealOwner: "" })); }}
                  displayEmpty sx={{ borderRadius: 1.5, backgroundColor: "#fff", "& fieldset": { borderColor: "#e0e0e0" } }}>
                  <MenuItem value="" disabled><span style={{ color: "#b0b0b0" }}>Choose</span></MenuItem>
                  {owners.map((o) => <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>)}
                </Select>
                {editErrors.dealOwner && <FormHelperText>{editErrors.dealOwner}</FormHelperText>}
              </FormControl> */}
              <FormControl fullWidth size="small" error={!!editErrors.dealOwner}>
  <Select
    value={editForm.dealOwner}
    onChange={(e) => {
      console.log("Selected Owner:", e.target.value);
      setEditForm((p) => ({
        ...p,
        dealOwner: e.target.value,
      }));
      setEditErrors((p: any) => ({
        ...p,
        dealOwner: "",
      }));
    }}
    displayEmpty
  >
    <MenuItem value="" disabled>
      <span style={{ color: "#b0b0b0" }}>Choose</span>
    </MenuItem>

    {owners.map((o) => (
      <MenuItem key={o.id} value={o.id}>
        {o.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>Close Date <span style={{ color: "red" }}>*</span></Typography>
              <TextField fullWidth size="small" type="date" value={editForm.closeDate}
                onChange={(e) => { setEditForm((p) => ({ ...p, closeDate: e.target.value })); setEditErrors((p: any) => ({ ...p, closeDate: "" })); }}
                error={!!editErrors.closeDate} helperText={editErrors.closeDate} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>Priority <span style={{ color: "red" }}>*</span></Typography>
              <FormControl fullWidth size="small" error={!!editErrors.priority}>
                <Select value={editForm.priority}
                  onChange={(e) => { setEditForm((p) => ({ ...p, priority: e.target.value })); setEditErrors((p: any) => ({ ...p, priority: "" })); }}
                  displayEmpty sx={{ borderRadius: 1.5, backgroundColor: "#fff", "& fieldset": { borderColor: "#e0e0e0" } }}>
                  <MenuItem value="" disabled><span style={{ color: "#b0b0b0" }}>Choose</span></MenuItem>
                  {priorities.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
                {editErrors.priority && <FormHelperText>{editErrors.priority}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>Associated Lead</Typography>
              <FormControl fullWidth size="small">
                <Select value={editForm.associatedLead}
                  onChange={(e) => setEditForm((p) => ({ ...p, associatedLead: e.target.value }))}
                  displayEmpty sx={{ borderRadius: 1.5, backgroundColor: "#fff", "& fieldset": { borderColor: "#e0e0e0" } }}>
                  <MenuItem value=""><span style={{ color: "#b0b0b0" }}>Select Lead</span></MenuItem>
                  {leads.map((l) => <MenuItem key={l.id} value={String(l.id)}>{l.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e0e0e0", display: "flex", gap: 1 }}>
          <Button fullWidth variant="outlined" onClick={() => setOpenEditDrawer(false)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 500, borderColor: "#e0e0e0", color: "#555" }}>Cancel</Button>
          <Button fullWidth variant="contained" onClick={handleEditSave}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, backgroundColor: "#6c63ff", boxShadow: "none", "&:hover": { backgroundColor: "#574fd6", boxShadow: "none" } }}>Update</Button>
        </Box>
      </Drawer>

      {/* ── Call Form ── */}
      <CallForm open={openCallForm} onClose={() => setOpenCallForm(false)}
        defaultContact={associatedLeadName !== "—" ? associatedLeadName : dealOwner}
        defaultPhone={associatedLeadPhone}
        onSave={async (data) => {
          const token = localStorage.getItem("access");
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/calls/`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ entity_type: "deal", entity_id: Number(dealId), connected: data.connected, call_outcome: data.callOutcome, date: data.date, time: data.time, note: data.note }),
          });
          setOpenCallForm(false);
          fetchActivities();
        }} />

      <ToastNotification open={snackbar.open} message={snackbar.message} severity={snackbar.severity}
        onClose={() => setSnackbar({ ...snackbar, open: false })} />

    </Box>
  );
};

export default DealViewPage;