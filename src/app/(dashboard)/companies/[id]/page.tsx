"use client";

import { useState, useEffect } from "react";
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
  CircularProgress,
  Drawer,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Snackbar,
  Alert,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid2";
import {
  ArrowBack,
  Search,
  Edit,
  NoteAdd,
  Email,
  Call,
  Task,
  Event,
  Close,
} from "@mui/icons-material";
import { useParams, useRouter } from "next/navigation";
import ActivityPanel from "@/components/shared/activity/ActivityPanel";
import Attachments from "@/components/shared/Attachments";
import CallForm from "@/components/shared/activity/calls/CallForm";
import { useMemo } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const getToken = () => localStorage.getItem("token");

const industryOptions = [
  "Legal Services",
  "Healthcare",
  "Real Estate",
  "Financial Advisory",
  "Retail & E-commerce",
  "Logistics & Supply Chain",
  "Marketing Agencies",
  "Education Technology",
  "Technology",
  "Finance",
  "Manufacturing",
  "Other",
];
const typeOptions = ["Prospect", "Customer", "Partner", "Vendor", "Other"];

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    backgroundColor: "#fff",
    fontSize: 13,
    "& fieldset": { borderColor: "#e0e0e0" },
    "&:hover fieldset": { borderColor: "#b0b0b0" },
    "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
  },
  "& input::placeholder": { color: "#b0b0b0", opacity: 1 },
};

const labelSx = {
  fontSize: 13,
  fontWeight: 500,
  color: "#1a1a2e",
  mb: 0.5,
};

const actionButtons = [
  { icon: <NoteAdd sx={{ fontSize: 18 }} />, label: "Note", tabIndex: 1 },
  { icon: <Email sx={{ fontSize: 18 }} />, label: "Email", tabIndex: 2 },
  { icon: <Call sx={{ fontSize: 18 }} />, label: "Call", tabIndex: 3 },
  { icon: <Task sx={{ fontSize: 18 }} />, label: "Task", tabIndex: 4 },
  { icon: <Event sx={{ fontSize: 18 }} />, label: "Meet...", tabIndex: 5 },
];

export default function CompanyViewPage() {
  const router = useRouter();
  const params = useParams();

  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [activitySearch, setActivitySearch] = useState("");
  const [openCallForm, setOpenCallForm] = useState(false);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  // ── Edit State ────────────────────────────────────────────────────────────────
  const [openEdit, setOpenEdit] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [editErrors, setEditErrors] = useState<any>({});
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const companyId = Number(params?.id);

  // ── Fetch Company ─────────────────────────────────────────────────────────────
  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/companies/${companyId}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${getToken()}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setCompany(data);
      } else {
        setCompany(null);
      }
    } catch (err) {
      console.error("Failed to fetch company:", err);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch Users ───────────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/users/`, {
        headers: {
          Authorization: `Token ${getToken()}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(Array.isArray(data) ? data : data.results || []);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCompany();
      fetchUsers();
      fetchAllActivities();
    }
  }, [companyId]);
  // ── Fetch all activities ─────────────────────────────────────────────────────
  const fetchAllActivities = async () => {
    try {
      setActivityLoading(true);

      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Token ${token}`,
      };

      const base = `${BASE_URL}/activities`;
      const params = `?entity_type=company&entity_id=${companyId}`;

      const [notes, calls, tasks, meetings, emails] = await Promise.all([
        fetch(`${base}/notes/${params}`, { headers }).then((r) => r.json()),
        fetch(`${base}/calls/${params}`, { headers }).then((r) => r.json()),
        fetch(`${base}/tasks/${params}`, { headers }).then((r) => r.json()),
        fetch(`${base}/meetings/${params}`, { headers }).then((r) => r.json()),
        fetch(`${base}/emails/${params}`, { headers }).then((r) => r.json()),
      ]);

      const ticketsRes = await fetch(
        `${BASE_URL}/tickets/?company_id=${companyId}`,
        { headers },
      );
      const ticketsData = ticketsRes.ok ? await ticketsRes.json() : [];
      const ticketsList = ticketsData.results || ticketsData || [];

      const mapped = [
        ...(notes.results || notes || []).map((n: any) => ({
          id: `note-${n.id}`,
          type: "Note",
          title: n.content || "Note",
          description: n.content || "",
          assignee: n.created_by_name,
          date: n.created_at,
          isOverdue: false,
          is_complete: false,
        })),

        ...(calls.results || calls || []).map((c: any) => ({
          id: `call-${c.id}`,
          type: "Call",
          title: c.note || c.call_outcome || "Call",
          description: c.call_outcome || "",
          assignee: c.created_by_name,
          date: c.created_at,
          isOverdue: false,
          is_complete: false,
        })),

        ...(tasks.results || tasks || []).map((t: any) => ({
          id: `task-${t.id}`,
          type: "Task",
          title: t.task_name || "Task",
          description: t.description || "",
          assignee: t.assigned_to_name,
          date: t.created_at,
          dueDate: t.due_date,
          is_complete: t.is_complete,
          isOverdue: new Date(t.due_date) < new Date() && !t.is_complete,
        })),

        ...(meetings.results || meetings || []).map((m: any) => ({
          id: `meeting-${m.id}`,
          type: "Meeting",
          title: m.title || "Meeting",
          description: m.description || "",
          assignee: m.created_by_name,
          date: m.created_at,
          isOverdue: false,
          is_complete: false,
        })),

        ...(emails.results || emails || []).map((e: any) => ({
          id: `email-${e.id}`,
          type: "Email",
          title: e.subject || "Email",
          description: e.body || "",
          assignee: e.created_by_name,
          date: e.created_at,
          isOverdue: false,
          is_complete: false,
        })),
        // ── Ticket activities ──────────────────────────────────────────────
        ...ticketsList.map((t: any) => ({
          id: `ticket-${t.id}`,
          type: "Ticket",
          title: `${t.ticket_name} — ${t.status}`,
          assignee: t.associated_deal?.associated_lead
            ? `${t.associated_deal.associated_lead.first_name || ""} ${t.associated_deal.associated_lead.last_name || ""}`.trim()
            : t.owner_name || "—",
          date: t.created_at,
          isOverdue: false,
          is_complete: t.status === "Closed" || t.status === "Resolved",
        })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setAllActivities(mapped);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setAllActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };
  // ── Open Edit Drawer ──────────────────────────────────────────────────────────
  const handleOpenEdit = () => {
    setEditForm({
      domainName: company.domain_name || "",
      companyName: company.company_name || "",
      ownerIds: company.company_owner?.map((o: any) => o.id) || [],
      industry: company.industry || "",
      type: company.type || "",
      city: company.city || "",
      country: company.country || "",
      noOfEmployees: company.no_of_employees || "",
      annualRevenue: company.annual_revenue || "",
      email: company.email || "",
      phoneNumber: company.phone_number || "",
    });
    setEditErrors({});
    setOpenEdit(true);
  };

  // ── Validate Edit Form ────────────────────────────────────────────────────────
  const validateEdit = (): boolean => {
    const errors: any = {};
    if (!editForm.domainName?.trim())
      errors.domainName = "Domain name is required.";
    if (!editForm.companyName?.trim())
      errors.companyName = "Company name is required.";
    if (!editForm.ownerIds?.length)
      errors.ownerIds = "At least one owner is required.";
    if (!editForm.industry) errors.industry = "Industry is required.";
    if (!editForm.type) errors.type = "Type is required.";
    if (!editForm.email?.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!editForm.phoneNumber?.trim())
      errors.phoneNumber = "Phone number is required.";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Save Edit ─────────────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!validateEdit()) return;

    setSaving(true);

    try {
      const res = await fetch(`${BASE_URL}/companies/${companyId}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${getToken()}`,
        },
        body: JSON.stringify({
          domain_name: editForm.domainName,
          company_name: editForm.companyName,
          company_owner_ids: editForm.ownerIds,
          industry: editForm.industry,
          type: editForm.type,
          city: editForm.city,
          country: editForm.country,
          no_of_employees: editForm.noOfEmployees,
          annual_revenue: editForm.annualRevenue,
          email: editForm.email,
          phone_number: editForm.phoneNumber,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCompany(data);
        setOpenEdit(false);

        setSnackbar({
          open: true,
          message: "Company updated successfully!",
          severity: "success",
        });

        fetchCompany();
        fetchAllActivities();
      } else {
        setSnackbar({
          open: true,
          message: data.error || "Failed to update company.",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);

      setSnackbar({
        open: true,
        message: "Failed to update company. Please try again.",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredActivities = Array.isArray(allActivities)
    ? allActivities.filter((activity) => {
        const title = activity.title || "";
        const description = activity.description || "";

        return (
          title.toLowerCase().includes(activitySearch.toLowerCase()) ||
          description.toLowerCase().includes(activitySearch.toLowerCase())
        );
      })
    : [];
  const activityColors: Record<string, string> = {
    Task: "#6c63ff",
    Call: "#4caf50",
    Meeting: "#2196f3",
    Email: "#ff9800",
    Note: "#9c27b0",
    Ticket: "#1e1818",
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
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const companyActivityContent = useMemo(() => {
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
        {/* Upcoming */}
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

        {/* Grouped Activities */}
        {Object.entries(groupedActivities).map(([month, activities]) => {
          const filtered = activities.filter(
            (a: any) =>
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
                sx={{
                  fontSize: 13,
                  fontWeight: 600,
                  mt: 2,
                  mb: 1.5,
                }}
              >
                {month}
              </Typography>

              {filtered.map((activity: any) => (
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
                      {/* ── Type header ── */}
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: activityColors[activity.type] || "#6c63ff",
                          mb: 0.5,
                        }}
                      >
                        {activity.type === "Ticket"
                          ? "Ticket Activity"
                          : activity.type}
                        {activity.assignee
                          ? ` from ${activity.assignee}`
                          : " tracking"}
                      </Typography>

                      {/* ── Content ── */}
                      {activity.type === "Ticket" ? (
                        <Box>
                          <Typography sx={{ fontSize: 13, color: "#555" }}>
                            <span style={{ fontWeight: 500 }}>
                              {activity.assignee}
                            </span>{" "}
                            created{" "}
                            <span style={{ fontWeight: 600 }}>
                              {activity.title}
                            </span>
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
                                display: "inline-block",
                                mt: 0.5,
                              }}
                            >
                              Resolved
                            </Typography>
                          )}
                        </Box>
                      ) : activity.type === "Task" ? (
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
            sx={{
              fontSize: 13,
              color: "#aaa",
              textAlign: "center",
              mt: 3,
            }}
          >
            No activities yet.
          </Typography>
        )}
      </Box>
    );
  }, [allActivities, activitySearch]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress sx={{ color: "#6c63ff" }} />
      </Box>
    );
  }

  if (!company) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Typography sx={{ color: "#888" }}>Company not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {/* Left Panel */}
      <Box sx={{ width: 220, flexShrink: 0 }}>
        {/* Back */}
        <Button
          startIcon={<ArrowBack sx={{ fontSize: 14 }} />}
          onClick={() => router.push("/companies")}
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
          Companies
        </Button>

        {/* Company Header */}
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
            {company?.company_name?.[0] || "C"}
          </Avatar>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>
            {company.company_name}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#888" }}>
            {company.industry}
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}
          >
            <Typography sx={{ fontSize: 12, color: "#6c63ff" }}>
              {company.domain_name}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {actionButtons.map((btn) => (
            <Box
              key={btn.label}
              onClick={() => {
                setActiveTab(btn.tabIndex);
                if (btn.label === "Call") {
                  setOpenCallForm(true);
                }
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

        {/* About Section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>
            About this Company
          </Typography>
          <IconButton
            size="small"
            sx={{ color: "#6c63ff" }}
            onClick={handleOpenEdit}
          >
            <Edit sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>

        {/* Company Details */}
        {[
          { label: "Company Domain Name", value: company.domain_name },
          { label: "Company Name", value: company.company_name },
          { label: "Industry", value: company.industry },
          { label: "Phone number", value: company.phone_number },
          {
            label: "Company Owner",
            value: Array.isArray(company?.company_owner)
              ? company.company_owner
                  .map((o: any) => `${o.first_name} ${o.last_name}`)
                  .join(", ")
              : "-",
          },
          { label: "City", value: company.city || "-" },
          { label: "Country/Region", value: company.country || "-" },
          { label: "No of Employees", value: company.no_of_employees || "-" },
          { label: "Annual Revenue", value: company.annual_revenue || "-" },
          {
            label: "Created Date",
            value: company.created_at
              ? new Date(company.created_at).toLocaleDateString()
              : "-",
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

      {/* Middle Panel - Activity */}
      <Box sx={{ flex: 1 }}>
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
          entityId={company?.id}
          entityType="company"
          entity={company}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activityContent={companyActivityContent}
        />
      </Box>

      {/* Right Panel */}
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
          <Box sx={{ display: "flex", gap: 0.5, mb: 1, alignItems: "center" }}>
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
              AI Company Summary
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: "#888", lineHeight: 1.6 }}>
            There are no activities associated with this company and further
            details are needed to provide a comprehensive summary.
          </Typography>
        </Paper>

        <Attachments entityType="company" entityId={Number(companyId)} />
      </Box>

      {/* Edit Company Drawer */}
      <Drawer
        anchor="right"
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        PaperProps={{
          sx: { width: { xs: "100%", sm: 420 }, p: 0 },
        }}
      >
        {/* Drawer Header */}
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
            Edit Company
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpenEdit(false)}
            sx={{ color: "#888" }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* Drawer Content */}
        <Box sx={{ px: 3, py: 2, overflowY: "auto", flex: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Domain Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={editForm.domainName || ""}
                onChange={(e) =>
                  setEditForm((p: any) => ({
                    ...p,
                    domainName: e.target.value,
                  }))
                }
                error={!!editErrors.domainName}
                helperText={editErrors.domainName}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Company Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={editForm.companyName || ""}
                onChange={(e) =>
                  setEditForm((p: any) => ({
                    ...p,
                    companyName: e.target.value,
                  }))
                }
                error={!!editErrors.companyName}
                helperText={editErrors.companyName}
                sx={fieldSx}
              />
            </Grid>

            {/* Company Owner */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Company Owner <span style={{ color: "red" }}>*</span>
              </Typography>
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(option) => option.name}
                value={users.filter((u) =>
                  (editForm.ownerIds || []).includes(u.id),
                )}
                onChange={(_, newValue) => {
                  setEditForm((p: any) => ({
                    ...p,
                    ownerIds: newValue.map((u: any) => u.id),
                  }));
                  setEditErrors((p: any) => ({ ...p, ownerIds: "" }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder={
                      !editForm.ownerIds?.length ? "Select owners" : ""
                    }
                    error={!!editErrors.ownerIds}
                    helperText={editErrors.ownerIds}
                    sx={fieldSx}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...restProps } = props as any;
                  return (
                    <li key={option.id} {...restProps}>
                      <Box>
                        <Typography sx={{ fontSize: 13 }}>
                          {option.name}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#888" }}>
                          {option.email}
                        </Typography>
                      </Box>
                    </li>
                  );
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#e0e0e0" },
                    "&:hover fieldset": { borderColor: "#b0b0b0" },
                    "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Industry <span style={{ color: "red" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={!!editErrors.industry}>
                <Select
                  value={editForm.industry || ""}
                  onChange={(e) =>
                    setEditForm((p: any) => ({
                      ...p,
                      industry: e.target.value,
                    }))
                  }
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
                  {industryOptions.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.industry && (
                  <FormHelperText>{editErrors.industry}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Type <span style={{ color: "red" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={!!editErrors.type}>
                <Select
                  value={editForm.type || ""}
                  onChange={(e) =>
                    setEditForm((p: any) => ({ ...p, type: e.target.value }))
                  }
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
                  {typeOptions.map((o) => (
                    <MenuItem key={o} value={o}>
                      {o}
                    </MenuItem>
                  ))}
                </Select>
                {editErrors.type && (
                  <FormHelperText>{editErrors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                City
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={editForm.city || ""}
                onChange={(e) =>
                  setEditForm((p: any) => ({ ...p, city: e.target.value }))
                }
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Country/Region
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={editForm.country || ""}
                onChange={(e) =>
                  setEditForm((p: any) => ({ ...p, country: e.target.value }))
                }
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                No of Employees
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={editForm.noOfEmployees || ""}
                onChange={(e) =>
                  setEditForm((p: any) => ({
                    ...p,
                    noOfEmployees: e.target.value,
                  }))
                }
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Annual Revenue
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={editForm.annualRevenue || ""}
                onChange={(e) =>
                  setEditForm((p: any) => ({
                    ...p,
                    annualRevenue: e.target.value,
                  }))
                }
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Email <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={editForm.email || ""}
                onChange={(e) =>
                  setEditForm((p: any) => ({ ...p, email: e.target.value }))
                }
                error={!!editErrors.email}
                helperText={editErrors.email}
                sx={fieldSx}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Phone Number <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={editForm.phoneNumber || ""}
                onChange={(e) =>
                  setEditForm((p: any) => ({
                    ...p,
                    phoneNumber: e.target.value,
                  }))
                }
                error={!!editErrors.phoneNumber}
                helperText={editErrors.phoneNumber}
                sx={fieldSx}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Drawer Footer */}
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
            onClick={() => setOpenEdit(false)}
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
            onClick={handleSaveEdit}
            disabled={saving}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#6c63ff",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#574fd6", boxShadow: "none" },
            }}
          >
            {saving ? "Saving..." : "Update"}
          </Button>
        </Box>
      </Drawer>

      <CallForm
        open={openCallForm}
        onClose={() => setOpenCallForm(false)}
        defaultContact={company?.company_name || ""}
        defaultPhone={company?.phone || company?.phone_number || ""}
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
                entity_type: "company", // ← changed from "lead"
                entity_id: company.id, // ← changed from lead.id
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
