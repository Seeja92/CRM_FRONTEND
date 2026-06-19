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
import { updateLead } from '@/store/slices/leadsSlice';
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import LeadForm, { LeadFormData } from "./LeadForm";

import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

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
import { 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel 
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CallForm from "../shared/activity/calls/CallForm";
import { useRouter } from "next/navigation";
import { Lead } from "@/types/lead.types";
import ActivityPanel from "../shared/activity/ActivityPanel";
import Attachments from "@/components/shared/Attachments";

interface Activity {
  id: string | number;
  type: "Task" | "Call" | "Note" | "Email" | "Meeting" | string;
  title?: string;
  assignee?: string;
  isOverdue?: boolean;
  dueDate?: string;
  date?: string;
  is_complete?: boolean;
  time?: string;
  description?: string;
  note?: string;
  priority?: string;
task_type?: string;
}
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
  const dispatch = useDispatch<AppDispatch>();
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [leadData, setLeadData] = useState(lead);
  console.log("Lead prop:", lead);
console.log("Lead city:", lead.city);
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
      const token = localStorage.getItem("access");
      const headers = { Authorization: `Bearer ${token}` };
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
          time: t.time,
          dueDate: t.due_date,
          isOverdue: new Date(t.due_date) < new Date() && !t.is_complete,
          is_complete: t.is_complete, // ✅ key field

           note: t.note,
  priority: t.priority,
  task_type: t.task_type,
        })),
        ...(meetings.results || meetings).map((m: any) => ({
          id: `meeting-${m.id}`,
          type: "Meeting",
          title: m.title,
          assignee: m.created_by_name,
          date: m.created_at,
          isOverdue: false,
          is_complete: false,
          created_by_name: m.created_by_name,
  
  note: m.note,
          lead_name: m.lead_name || lead.name,
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



const activityContent = useMemo(() => {
  const upcomingActivities = allActivities.filter((a) => a.isOverdue);
  const groupedActivities = groupByMonth(allActivities);

 
  const filterLogic = (a: Activity) =>
  a.title?.toLowerCase().includes(activitySearch.toLowerCase()) ||
  a.assignee?.toLowerCase().includes(activitySearch.toLowerCase()) ||
  a.type?.toLowerCase().includes(activitySearch.toLowerCase());

  const filteredUpcoming = upcomingActivities.filter(filterLogic);

  // ── Helper function to render interactive and expandable rows ──

const renderActivityRow = (activity: Activity) => {
  switch (activity.type) {
  case "Task":
  return (
    <Accordion 
      elevation={0} 
      sx={{ 
        "&:before": { display: "none" }, 
        bgcolor: "transparent",
        width: "100%" 
      }}
    >
      <AccordionSummary
        expandIcon={
          activity.is_complete ? (
            <CheckCircleIcon sx={{ fontSize: 18, color: "#4caf50" }} />
          ) : (
            <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: "#aaa" }} />
          )
        }
        sx={{
          p: 0,
          minHeight: 0,
          "& .MuiAccordionSummary-content": { 
            m: 0, 
            display: "flex", 
            alignItems: "center", 
            gap: 1 
          },
          // ── CRITICAL STRUCTURE TO KEEP ARROW LEFT & INTERACTIVE ──
          flexDirection: "row-reverse",
          "& .MuiAccordionSummary-expandIconWrapper": {
            marginRight: 1,
            transform: "none !important", // Prevents check icon spinning
          },
        }}
      >
        {/* Task Title */}
        <Typography
          sx={{
            fontSize: 13,
            color: activity.is_complete ? "#aaa" : "#555",
            textDecoration: activity.is_complete ? "line-through" : "none",
          }}
        >
          {activity.title}
        </Typography>

        {/* Dynamic Finished Badge */}
        {activity.is_complete && (
          <Typography
            sx={{
              fontSize: 11,
              color: "#4caf50",
              bgcolor: "#e8f5e9",
              fontWeight: 600,
              px: 1,
              py: 0.2,
              borderRadius: 1,
              ml: "auto" // Pushes the badge beautifully to the right end
            }}
          >
            Finished
          </Typography>
        )}
      </AccordionSummary>

    
      <AccordionDetails sx={{ p: "8px 0 0 0" }}>
  <Box sx={{ borderTop: "1px solid #f0f0f0", pt: 0.5 }}>

    {/* Metadata box */}
    <Box
      sx={{
        display: "flex",
        bgcolor: "#edf2f7",
        mx: 1,
        my: 1,
        px: 2.5,
        py: 2,
        borderRadius: 1.5,
        gap: 2,
      }}
    >
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
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1e293b",
          }}
        >
          {activity.dueDate}
          {activity.time ? ` at ${activity.time}` : ""}
        </Typography>
      </Box>

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
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1e293b",
          }}
        >
          {activity.priority || "None"}
        </Typography>
      </Box>

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
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1e293b",
          }}
        >
          {activity.task_type || "To-Do"}
        </Typography>
      </Box>
    </Box>

    {/* Note section */}
    {activity.note && (
      <Box sx={{ px: 2, pt: 1, pb: 2 }}>
        <Box
          sx={{
            fontSize: 13,
            color: "#475569",
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{
            __html: activity.note,
          }}
        />
      </Box>
    )}
  </Box>
</AccordionDetails>
    </Accordion>
  );
      
      case "Call":
        return (
          <Accordion elevation={0} sx={{ "&:before": { display: "none" }, bgcolor: "transparent" }}>
           
            <AccordionSummary 
  expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
  sx={{ 
    p: 0, 
    minHeight: 0, 
    "& .MuiAccordionSummary-content": { m: 0 },
    // ── CRITICAL CSS TRICK TO FLIP THE ARROW TO THE LEFT ──
    flexDirection: "row-reverse", 
    "& .MuiAccordionSummary-expandIconWrapper": {
      marginRight: 1, // Adds a little spacing between the arrow and the text
    }
  }}
>
  <Typography sx={{ fontSize: 13, color: "#555" }}>
    {activity.title}
  </Typography>
</AccordionSummary>
            <AccordionDetails sx={{ p: "8px 0 0 0" }}>
              {/* This matches the Outcome and Duration dropdowns from your screenshot */}
              <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ fontSize: 12 }}>Outcome *</InputLabel>
                  <Select label="Outcome *" defaultValue="" sx={{ fontSize: 13 }}>
                    <MenuItem value="connected">Connected</MenuItem>
                    <MenuItem value="no-answer">No Answer</MenuItem>
                    <MenuItem value="busy">Busy</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ fontSize: 12 }}>Duration *</InputLabel>
                  <Select label="Duration *" defaultValue="" sx={{ fontSize: 13 }}>
                    <MenuItem value="1min">1 min</MenuItem>
                    <MenuItem value="5min">5 min</MenuItem>
                    <MenuItem value="10min">10 min</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </AccordionDetails>
          </Accordion>
        );

      case "Note":
      case "Email":
      case "Meeting":
        return (
          <Accordion elevation={0} sx={{ "&:before": { display: "none" }, bgcolor: "transparent" }}>
          
            <AccordionSummary 
  expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
  sx={{ 
    p: 0, 
    minHeight: 0, 
    "& .MuiAccordionSummary-content": { m: 0 },
    // ── CRITICAL CSS TRICK TO FLIP THE ARROW TO THE LEFT ──
    flexDirection: "row-reverse", 
    "& .MuiAccordionSummary-expandIconWrapper": {
      marginRight: 1, // Adds a little spacing between the arrow and the text
    }
  }}
>
  <Typography sx={{ fontSize: 13, color: "#555" }}>
    {activity.title}
  </Typography>
</AccordionSummary>
            <AccordionDetails sx={{ p: "8px 0 0 0" }}>
              <Typography sx={{ fontSize: 12, color: "#666", bgcolor: "#f9f9f9", p: 1, borderRadius: 1 }}>
                {activity.description || activity.note || "No additional details provided."}
              </Typography>
            </AccordionDetails>
          </Accordion>
        );

      default:
        return (
          <Typography sx={{ fontSize: 13, color: "#555" }}>
            {activity.title}
          </Typography>
        );
    }
  };

  return (
    <Box>
     
{/* ── Upcoming Section ── */}
<Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1.5 }}>
  Upcoming
</Typography>

{filteredUpcoming.length === 0 && allActivities.length === 0 ? (
  <Typography sx={{ fontSize: 13, color: "#aaa", mb: 1.5 }}>
    No upcoming activities.
  </Typography>
) : (
  filteredUpcoming.map((activity) => (
    <Accordion
      key={activity.id}
      elevation={0}
      sx={{
        border: "1px solid #eee",
        borderRadius: "8px !important", // forces rounding override on accordion groups
        mb: 1.5,
        "&:before": { display: "none" },
        backgroundColor: "#fff",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />}
        sx={{
          p: 1.5,
          display: "flex",
          flexDirection: "row-reverse", // Keeps expand arrow cleanly positioned on the left if desired
          "& .MuiAccordionSummary-expandIconWrapper": {
            marginRight: 1,
          },
          "& .MuiAccordionSummary-content": {
            m: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          },
        }}
      >
        {/* Left-side Header Information */}
        <Box>
          <Typography sx={{ fontSize: 13, color: "#555" }}>
            <span style={{ fontWeight: 600 }}>{activity.type}</span> assigned to {activity.assignee}
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              mt: 0.5,
              color: activity.is_complete ? "#aaa" : "#1F2937",
              textDecoration: activity.is_complete ? "line-through" : "none",
            }}
          >
            {activity.title}
          </Typography>
        </Box>

        {/* Right-side Overdue Status Badge */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}>
          <CalendarTodayOutlined sx={{ fontSize: 13, color: "#e53935" }} />
          <Typography sx={{ fontSize: 12, color: "#e53935", fontWeight: 500 }}>
            Overdue · {activity.dueDate}
          </Typography>
        </Box>
      </AccordionSummary>

      {/* Expanded Accordion Drawer Details */}
      <AccordionDetails sx={{ p: "0 12px 12px 36px", borderTop: "1px dashed #eee" }}>
        <Typography sx={{ fontSize: 12, color: "#666", mt: 1 }}>
          {activity.description || activity.note || "No additional details provided for this task."}
        </Typography>
      </AccordionDetails>
    </Accordion>
  ))
)}
      {/* ── Grouped by Month Section ── */}
      {Object.entries(groupedActivities).map(([month, activities]) => {
        const filtered = activities.filter(filterLogic);
        if (filtered.length === 0) return null;

        return (
          <Box key={month}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 2, mb: 1.5 }}>
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
                  backgroundColor: "#fff"
                  // display: "block"
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: activityColors[activity.type] || "#555",
                        mb: 0.5,
                      }}
                    >
                      {activity.type}{" "}
                      {activity.assignee ? `from ${activity.assignee}` : "tracking"}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12, color: "#aaa", whiteSpace: "nowrap", ml: 2 }}>
                    {formatDate(activity.date)}
                  </Typography>
                </Box>

                {/* Interactive dropdown component executes here */}
                <Box sx={{ mt: 0.5 }}>
                  {renderActivityRow(activity)}
                </Box>
              </Box>
            ))}
          </Box>
        );
      })}

      {allActivities.length === 0 && (
        <Typography sx={{ fontSize: 13, color: "#aaa", textAlign: "center", mt: 3 }}>
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
    // console.log("leadData.city:", leadData.city);
    const result = await dispatch(updateLead({
      
      id: lead.id,
      payload: {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        job_title: data.jobTitle,
        company_name: data.companyName,
        // contact_owner: data.contactOwners.join(", "),
        contact_owner: data.contactOwners[0],
        status: data.leadStatus,
        city:data.city,
      }
    })).unwrap();
    console.log("Updated Lead:", result);

    setLeadData({
      ...leadData,
      ...result,
      firstName: result.first_name,
      lastName: result.last_name,
      companyName: result.company_name,
      jobTitle: result.job_title,
      city: result.city,
    });
    onLeadUpdated?.(result);
    setSnackbar({ open: true, message: "Lead updated successfully!", severity: "success" });
    setEditOpen(false);
  } catch {
    setSnackbar({ open: true, message: "Failed to update lead.", severity: "error" });
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

      
<Box
  sx={{
    display: "flex",
    alignItems: "flex-start",
    gap: 1.5,
    mb: 2,
  }}
>
  <Box
    sx={{
      width: 48,
      height: 48,
      borderRadius: "8px",
      backgroundColor: "#D9D9D9",
      flexShrink: 0,
    }}
  />

  <Box>
    <Typography
      sx={{
        fontSize: 16,
        fontWeight: 600,
        color: "#1F2937",
      }}
    >
      {lead.name}
    </Typography>

    <Typography
      sx={{
        fontSize: 12,
        color: "#6B7280",
        mt: 0.3,
      }}
    >
      {lead.jobTitle || "Salesperson"}
    </Typography>

    <Typography
      sx={{
        fontSize: 12,
        color: "#6B7280",
        mt: 0.3,
      }}
    >
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
           { label: "City", value: leadData.city || "-" },
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
            const token = localStorage.getItem("access");
            await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}/activities/calls/`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
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
            {allActivities.length > 0
              ? `This lead has ${allActivities.length} activities. Latest: ${allActivities[0]?.type} — ${allActivities[0]?.title}`
              : "There are no activities associated with this lead and further details are needed to provide a comprehensive summary."}
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
          // contactOwners: leadData.contactOwner
          //   ? leadData.contactOwner.split(", ")
          //   : [],
          contactOwners: leadData.contactOwner
  ? [leadData.contactOwner]
  : [],
          leadStatus: leadData.status || "",
          city: leadData.city || "", 
        }}
      />
    </Box>
  );
}
