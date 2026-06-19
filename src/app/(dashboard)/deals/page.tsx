

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box, Typography, Button, TextField, InputAdornment, Select, MenuItem,
  FormControl, Checkbox, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent,
  DialogContentText, FormHelperText, DialogActions, Drawer, CircularProgress,
  Popover,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import Grid from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import Close from "@mui/icons-material/Close";
import { Deal } from "@/types/deal.types";
import ToastNotification from "@/components/shared/ToastNotification";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDeals as fetchDealsAction,
  fetchDealUsers,
  fetchDealLeads,
  createDeal,
  updateDeal,
  deleteDeal,
  importDeals,
  convertLeadStatus,
} from "@/store/slices/dealsSlice";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

// ── Stage chip colors ─────────────────────────────────────────────────────────
const getStageStyle = (stage: string): { color: string; backgroundColor: string } => {
  switch (stage) {
    case "Closed Won":                return { color: "#2e7d32", backgroundColor: "#e8f5e9" };
    case "Closed Lost":               return { color: "#c62828", backgroundColor: "#fce4ec" };
    case "Contract Sent":             return { color: "#e65100", backgroundColor: "#fff3e0" };
    case "Qualified to Buy":          return { color: "#1565c0", backgroundColor: "#e3f2fd" };
    case "Presentation Scheduled":    return { color: "#6a1b9a", backgroundColor: "#f3e5f5" };
    case "Appointment Scheduled":     return { color: "#283593", backgroundColor: "#e8eaf6" };
    case "Decision Maker Bought In":  return { color: "#192322", backgroundColor: "#e0f7fa" };
    default:                          return { color: "#616161", backgroundColor: "#fafafa" };
  }
};

const filterSx = {
  minWidth: 140,
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5, backgroundColor: "#fff", fontSize: 13,
    "& fieldset": { borderColor: "#e0e0e0" },
    "&:hover fieldset": { borderColor: "#b0b0b0" },
    "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
  },
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5, backgroundColor: "#fff", fontSize: 13,
    "& fieldset": { borderColor: "#e0e0e0" },
    "&:hover fieldset": { borderColor: "#b0b0b0" },
    "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
  },
};

const labelSx = { fontSize: 13, fontWeight: 500, color: "#1a1a2e", mb: 0.5 };
const ITEMS_PER_PAGE = 6;

const stageOptions = [
  "Presentation Scheduled", "Qualified to Buy", "Contract Sent",
  "Closed Won", "Closed Lost", "Appointment Scheduled", "Decision Maker Bought In",
];

const priorities = ["High", "Medium", "Low"];

const drawerStages = [
  "Appointment Scheduled", "Qualified to Buy", "Presentation Scheduled",
  "Decision Maker Bought In", "Contract Sent", "Closed Won",
  "Closed Lost", "Proposal Sent", "Negotiation",
];

interface CreateDealForm {
  dealName: string; dealStage: string; amount: string;
  dealOwner: number | string; closeDate: string; priority: string; associatedLead: string;
}

const initialForm: CreateDealForm = {
  dealName: "", dealStage: "", amount: "",
  dealOwner: "", closeDate: "", priority: "", associatedLead: "",
};

interface FormErrors {
  dealName?: string; dealStage?: string; amount?: string;
  dealOwner?: string; closeDate?: string; priority?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
const DealsPage = () => {
  console.log("DealsPage Rendered");
  const router     = useRouter();
  const importRef  = useRef<HTMLInputElement>(null);
  const dispatch   = useAppDispatch();

  // ── Redux State ──────────────────────────────────────────────────────────
  const deals     = useAppSelector((state) => state.deals.deals);
  const loading   = useAppSelector((state) => state.deals.loading);
  const owners    = useAppSelector((state) => state.deals.users);
  console.log("Owners:", owners);
  const leadsList = useAppSelector((state) => state.deals.leads);
//   const { id: userId, role } = useSelector(
//   (state: RootState) => state.auth
// );
const { id: userId, role } = useAppSelector(
  (state) => state.auth
);
console.log(useAppSelector((state) => state.auth));

  const [selected, setSelected]                     = useState<string[]>([]);
  const [page, setPage]                             = useState(1);
  const [search, setSearch]                         = useState("");
  const [dealStage, setDealStage]                   = useState("");
  const [dealOwner, setDealOwner]                   = useState("");
  const [closeDateFilter, setCloseDateFilter]       = useState<Dayjs | null>(null);
  const [createdDateFilter, setCreatedDateFilter]   = useState<Dayjs | null>(null);
  const [closeDateAnchor, setCloseDateAnchor]       = useState<null | HTMLElement>(null);
  const [createdDateAnchor, setCreatedDateAnchor]   = useState<null | HTMLElement>(null);
  const [deleteId, setDeleteId]                     = useState<string | null>(null);
  const [openDrawer, setOpenDrawer]                 = useState(false);
  const [editId, setEditId]                         = useState<string | null>(null);
  const [form, setForm]                             = useState<CreateDealForm>(initialForm);
  const [formErrors, setFormErrors]                 = useState<FormErrors>({});
  const [snackbar, setSnackbar]                     = useState({
    open: false, message: "", severity: "success" as "success" | "error" | "info" | "warning",
  });

  // ── Initial Load ─────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchDealsAction());
    dispatch(fetchDealUsers());
    dispatch(fetchDealLeads()).then((action: any) => {
      const loadedLeads = action.payload || [];
      const params      = new URLSearchParams(window.location.search);
      const openCreate  = params.get("openCreate");
      const leadName    = params.get("leadName");
      if (openCreate === "true") {
        setOpenDrawer(true);
        if (leadName) {
          const decodedName = decodeURIComponent(leadName).trim();
          const matched     = loadedLeads.find((l: any) => l.name === decodedName);
          setForm((prev) => ({ ...prev, associatedLead: matched ? matched.id : "" }));
        }
      }
    });
  }, []);

  // ── Filter ────────────────────────────────────────────────────────────────
 const filtered = deals.filter((deal) => {
  const raw = (deal as any).associatedLead ?? (deal as any).associated_lead;
  
  // ← Get city from nested lead object
  const leadCity = typeof raw === "object" && raw !== null
    ? raw.city || ""
    : (leadsList.find((l) => l.id === String(raw))?.city || "");

  const matchSearch = 
    deal.dealName.toLowerCase().includes(search.toLowerCase()) ||
    deal.dealOwner.toLowerCase().includes(search.toLowerCase()) ||
    leadCity.toLowerCase().includes(search.toLowerCase());

  const matchStage   = dealStage ? deal.dealStage === dealStage : true;
  const matchOwner   = dealOwner ? deal.dealOwner === dealOwner : true;
  const matchClose   = closeDateFilter
    ? dayjs(deal.closeDate).format("YYYY-MM-DD") === closeDateFilter.format("YYYY-MM-DD")
    : true;
  const matchCreated = createdDateFilter
    ? dayjs((deal as any).created_at).format("YYYY-MM-DD") === createdDateFilter.format("YYYY-MM-DD")
    : true;

  return matchSearch && matchStage && matchOwner && matchClose && matchCreated;
});

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // ── Select ────────────────────────────────────────────────────────────────
  const allSelected = paginated.length > 0 && paginated.every((d) => selected.includes(d.id));
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelected(e.target.checked ? paginated.map((d) => d.id) : []);
  const handleSelect = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const dealToDelete = deals.find((d) => d.id === deleteId);
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteDeal(deleteId));
      setSelected((prev) => prev.filter((i) => i !== deleteId));
      setSnackbar({ open: true, message: "Deal deleted successfully!", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to delete deal!", severity: "error" });
    }
    setDeleteId(null);
  };

  // ── Open Edit Drawer ──────────────────────────────────────────────────────
  const handleEditClick = (deal: Deal) => {
    setEditId(deal.id);
    const raw = (deal as any).associatedLead ?? (deal as any).associated_lead;
    let leadIdValue = "";
    if (raw) {
      leadIdValue = typeof raw === "object" ? String(raw.id) : String(raw);
    }
    console.log("Edit Deal:", deal);
    setForm({
      dealName:       deal.dealName,
      dealStage:      deal.dealStage,
      amount:         String(deal.amount),
      dealOwner:      deal.dealOwner,
      closeDate:      deal.closeDate,
      priority:       (deal as any).priority || "Medium",
      associatedLead: leadIdValue,
    });
    setOpenDrawer(true);
  };

  // ── Open Create Drawer ────────────────────────────────────────────────────
  const handleCreateClick = () => {
    setEditId(null);
    setForm(initialForm);
    setFormErrors({});
    setOpenDrawer(true);
  };

  const handleFormChange = (field: keyof CreateDealForm) => (e: any) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!form.dealName.trim()) errors.dealName = "Deal name is required.";
    if (!form.dealStage)       errors.dealStage = "Deal stage is required.";
    if (!form.amount.trim())   errors.amount = "Amount is required.";
    else if (!/^\d+(\.\d+)?$/.test(form.amount)) errors.amount = "Amount must be a number.";
    if (!form.dealOwner)       errors.dealOwner = "Deal owner is required.";
    if (!form.closeDate)       errors.closeDate = "Close date is required.";
    if (!form.priority)        errors.priority = "Priority is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Save (Create or Update) ───────────────────────────────────────────────
//   const handleSave = async () => {
//     if (!validateForm()) return;
//     const parsedLeadId = form.associatedLead ? parseInt(form.associatedLead, 10) : null;
//    const payload = {
//   deal_name:          form.dealName,
//   deal_stage:         form.dealStage,
//   amount:             parseFloat(form.amount),
//   // deal_owner:         form.dealOwner,
//   deal_owner: [Number(form.dealOwner)],
//   close_date:         form.closeDate,
//   priority:           form.priority,
//   associated_lead_id: parsedLeadId || null,  // ← changed key
// };
//     try {
//       if (editId) {
//         await dispatch(updateDeal({ id: editId, payload })).unwrap();
//         setSnackbar({ open: true, message: "Deal updated successfully!", severity: "success" });
//       } else {
//         await dispatch(createDeal(payload)).unwrap();
//         if (parsedLeadId) {
//           try {
//             await dispatch(convertLeadStatus(parsedLeadId)).unwrap();
//             const currentLead = leadsList.find((l) => l.id === form.associatedLead);
//             if (currentLead) {
//               const existing: string[] = JSON.parse(localStorage.getItem("convertedLeads") || "[]");
//               if (!existing.includes(currentLead.name)) {
//                 existing.push(currentLead.name);
//                 localStorage.setItem("convertedLeads", JSON.stringify(existing));
//               }
//             }
//           } catch (err) {
//             console.error("Failed to convert lead:", err);
//           }
//         }
//         setSnackbar({ open: true, message: "Deal created successfully!", severity: "success" });
//       }
//       dispatch(fetchDealsAction());
//       setForm(initialForm);
//       setFormErrors({});
//       setEditId(null);
//       setOpenDrawer(false);
//     } catch {
//       setSnackbar({ open: true, message: "Failed to save deal!", severity: "error" });
//     }
//   };

const handleSave = async () => {
  if (!validateForm()) return;
console.log("ROLE:", role);
console.log("USER ID:", userId);
// console.log("FORM OWNER:", form.dealOwner);
console.log("FORM OWNER:", form.dealOwner);

  const parsedLeadId = form.associatedLead
    ? parseInt(form.associatedLead, 10)
    : null;

  const payload: any = {
    deal_name: form.dealName,
    deal_stage: form.dealStage,
    amount: parseFloat(form.amount),
    close_date: form.closeDate,
    priority: form.priority,
    associated_lead_id: parsedLeadId || null,
  };

  // Role-based owner assignment
  if (role === "Admin") {
    payload.deal_owner = [Number(form.dealOwner)];
  } else {
    payload.deal_owner = [userId];
  }

  console.log("Deal Payload:", payload);

  try {
    if (editId) {
      
      await dispatch(updateDeal({ id: editId, payload })).unwrap();
      setSnackbar({
        open: true,
        message: "Deal updated successfully!",
        severity: "success",
      });
    } else {
      await dispatch(createDeal(payload)).unwrap();

      if (parsedLeadId) {
        try {
          await dispatch(convertLeadStatus(parsedLeadId)).unwrap();

          const currentLead = leadsList.find(
            (l) => l.id === form.associatedLead
          );

          if (currentLead) {
            const existing: string[] = JSON.parse(
              localStorage.getItem("convertedLeads") || "[]"
            );

            if (!existing.includes(currentLead.name)) {
              existing.push(currentLead.name);
              localStorage.setItem(
                "convertedLeads",
                JSON.stringify(existing)
              );
            }
          }
        } catch (err) {
          console.error("Failed to convert lead:", err);
        }
      }

      setSnackbar({
        open: true,
        message: "Deal created successfully!",
        severity: "success",
      });
    }

    dispatch(fetchDealsAction());
    setForm(initialForm);
    setFormErrors({});
    setEditId(null);
    setOpenDrawer(false);
  } catch {
    setSnackbar({
      open: true,
      message: "Failed to save deal!",
      severity: "error",
    });
  }
};

  const handleCloseDrawer = () => {
    setForm(initialForm);
    setFormErrors({});
    setEditId(null);
    setOpenDrawer(false);
  };

  // ── Import CSV ────────────────────────────────────────────────────────────
  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await dispatch(importDeals(file)).unwrap();
      setSnackbar({
        open: true,
        message: `${result.imported_count || "Deals"} imported successfully!`,
        severity: "success",
      });
      dispatch(fetchDealsAction());
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Import failed. Check your CSV file.",
        severity: "error",
      });
    }
    e.target.value = "";
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <input type="file" accept=".csv" ref={importRef} style={{ display: "none" }} onChange={handleImportCSV} />

      {/* ── Header ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" }, mb: 3, flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 24 }}>Deals</Typography>
        <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" }, flexDirection: { xs: "column", sm: "row" } }}>
          <Button variant="outlined" startIcon={<FileUploadOutlinedIcon />} onClick={() => importRef.current?.click()}
            sx={{ borderColor: "#6c63ff", color: "#6c63ff", textTransform: "none", borderRadius: 2, fontWeight: 500 }}>
            Import
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}
            sx={{ bgcolor: "#6c63ff", textTransform: "none", borderRadius: 2, fontWeight: 600, "&:hover": { bgcolor: "#5a52d5" } }}>
            Create
          </Button>
        </Box>
      </Box>

      {/* ── Search + Pagination ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, mb: 2, flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
        <TextField placeholder="Search deal name, owner, city" size="small" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: "#6B7280" }} /></InputAdornment> }}
          sx={{ width: { xs: "100%", md: "250px" }, backgroundColor: "#fff", "& .MuiOutlinedInput-root": { borderRadius: "8px" } }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button size="small" startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 12 }} />}
            disabled={page === 1} onClick={() => setPage((p) => p - 1)} sx={{ color: "#6B7280", textTransform: "none" }}>
            Previous
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button key={i + 1} size="small" onClick={() => setPage(i + 1)}
              sx={{ minWidth: 32, height: 32, borderRadius: "6px", backgroundColor: page === i + 1 ? "#6c63ff" : "transparent", color: page === i + 1 ? "#fff" : "#6B7280", fontWeight: page === i + 1 ? 700 : 400, "&:hover": { backgroundColor: page === i + 1 ? "#6c63ff" : "#F3F4F6" } }}>
              {i + 1}
            </Button>
          ))}
          <Button size="small" endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
            disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} sx={{ color: "#6B7280", textTransform: "none" }}>
            Next
          </Button>
        </Box>
      </Box>

      {/* ── Filters ── */}
      <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={filterSx}>
          <Select value={dealOwner} onChange={(e) => { setDealOwner(e.target.value); setPage(1); }} displayEmpty>
            <MenuItem value="">Deal Owner</MenuItem>
            {owners.map((o) => <MenuItem key={o.id} value={o.id} sx={{ fontSize: 13 }}>{o.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={filterSx}>
          <Select value={dealStage} onChange={(e) => { setDealStage(e.target.value); setPage(1); }} displayEmpty>
            <MenuItem value="">Deal Stage</MenuItem>
            {stageOptions.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>)}
          </Select>
        </FormControl>

        {/* ── Close Date Filter ── */}
        <Button size="small" variant="outlined" endIcon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
          onClick={(e) => setCloseDateAnchor(e.currentTarget)}
          sx={{ borderRadius: 1.5, textTransform: "none", fontSize: 13, borderColor: closeDateFilter ? "#6c63ff" : "#E5E7EB", color: closeDateFilter ? "#6c63ff" : "#6B7280", px: 1.5, backgroundColor: "#fff", whiteSpace: "nowrap" }}>
          {closeDateFilter ? closeDateFilter.format("MM/DD/YYYY") : "Close Date"}
        </Button>
        <Popover open={Boolean(closeDateAnchor)} anchorEl={closeDateAnchor} onClose={() => setCloseDateAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{ sx: { overflowY: "auto" } }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2, minWidth: 280 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>Filter by Close Date</Typography>
              <DatePicker value={closeDateFilter}
                onChange={(newValue) => { setCloseDateFilter(newValue); setPage(1); }}
                slotProps={{ textField: { size: "small", fullWidth: true, sx: fieldSx } }} />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button fullWidth size="small" variant="outlined"
                  onClick={() => { setCloseDateFilter(null); setPage(1); setCloseDateAnchor(null); }}
                  sx={{ textTransform: "none", borderRadius: 1.5, fontSize: 12, borderColor: "#e0e0e0", color: "#555" }}>
                  Clear
                </Button>
                <Button fullWidth size="small" variant="contained"
                  onClick={() => setCloseDateAnchor(null)}
                  sx={{ textTransform: "none", borderRadius: 1.5, fontSize: 12, bgcolor: "#6c63ff", "&:hover": { bgcolor: "#574fd6" } }}>
                  Apply
                </Button>
              </Box>
            </Box>
          </LocalizationProvider>
        </Popover>

        {/* ── Created Date Filter ── */}
        <Button size="small" variant="outlined" endIcon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
          onClick={(e) => setCreatedDateAnchor(e.currentTarget)}
          sx={{ borderRadius: 1.5, textTransform: "none", fontSize: 13, borderColor: createdDateFilter ? "#6c63ff" : "#E5E7EB", color: createdDateFilter ? "#6c63ff" : "#6B7280", px: 1.5, backgroundColor: "#fff", whiteSpace: "nowrap" }}>
          {createdDateFilter ? createdDateFilter.format("MM/DD/YYYY") : "Created Date"}
        </Button>
        <Popover open={Boolean(createdDateAnchor)} anchorEl={createdDateAnchor} onClose={() => setCreatedDateAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{ sx: { overflowY: "auto" } }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2, minWidth: 280 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>Filter by Created Date</Typography>
              <DatePicker value={createdDateFilter}
                onChange={(newValue) => { setCreatedDateFilter(newValue); setPage(1); }}
                slotProps={{ textField: { size: "small", fullWidth: true, sx: fieldSx } }} />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button fullWidth size="small" variant="outlined"
                  onClick={() => { setCreatedDateFilter(null); setPage(1); setCreatedDateAnchor(null); }}
                  sx={{ textTransform: "none", borderRadius: 1.5, fontSize: 12, borderColor: "#e0e0e0", color: "#555" }}>
                  Clear
                </Button>
                <Button fullWidth size="small" variant="contained"
                  onClick={() => setCreatedDateAnchor(null)}
                  sx={{ textTransform: "none", borderRadius: 1.5, fontSize: 12, bgcolor: "#6c63ff", "&:hover": { bgcolor: "#574fd6" } }}>
                  Apply
                </Button>
              </Box>
            </Box>
          </LocalizationProvider>
        </Popover>
      </Box>

      {/* ── Table ── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress sx={{ color: "#6c63ff" }} />
        </Box>
      ) : (
        <TableContainer sx={{ borderRadius: "12px", border: "1px solid #E5E7EB", bgcolor: "white", overflowX: "auto", boxShadow: "none" }}>
          <Table sx={{ "& .MuiTableCell-root": { fontSize: { xs: 12, sm: 14 }, whiteSpace: "nowrap", py: 1, px: 1.5 } }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#6c63ff" }}>
                <TableCell padding="checkbox" sx={{ backgroundColor: "#6c63ff" }}>
                  <Checkbox checked={allSelected} onChange={handleSelectAll} sx={{ color: "#fff", "&.Mui-checked": { color: "#fff" } }} />
                </TableCell>
                {["Deal Name", "Deal Stage", "Lead Name", "Close Date", "Deal Owner", "Amount", "Actions"].map((h) => (
                  <TableCell key={h} sx={{ color: "#fff", fontWeight: 600, fontSize: 13, backgroundColor: "#6c63ff", py: 1.5 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: "center", py: 4, color: "#888" }}>No deals found.</TableCell>
                </TableRow>
              ) : (
                paginated.map((deal) => (
                  <TableRow key={deal.id} hover
                    sx={{ backgroundColor: "#fff", cursor: "pointer", "&:hover": { backgroundColor: "#F9FAFB" } }}
                    onClick={() => router.push(`/deals/${deal.id}`)}>
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selected.includes(deal.id)} onChange={() => handleSelect(deal.id)} sx={{ "&.Mui-checked": { color: "#6c63ff" } }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, fontWeight: 500, color: "#6c63ff", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                      onClick={(e) => { e.stopPropagation(); router.push(`/deals/${deal.id}`); }}>
                      {deal.dealName}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "inline-block", px: 1.5, py: 0.5, borderRadius: "12px", fontSize: 12, fontWeight: 600, ...getStageStyle(deal.dealStage) }}>
                        {deal.dealStage}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, color: "#444" }}>
                      {(() => {
                        const raw = (deal as any).associatedLead ?? (deal as any).associated_lead;
                        if (!raw) return "—";
                        if (typeof raw === "object") return `${raw.first_name || ""} ${raw.last_name || ""}`.trim() || "—";
                        const found = leadsList.find((l) => l.id === String(raw));
                        return found ? found.name : (raw || "—");
                      })()}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, color: "#444" }}>{deal.closeDate}</TableCell>
                    <TableCell sx={{ fontSize: 14, fontWeight: 500, color: "#6c63ff" }} onClick={(e) => e.stopPropagation()}>
                      {deal.dealOwner}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, color: "#444" }}>${deal.amount.toLocaleString()}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditClick(deal); }} sx={{ color: "#6c63ff" }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteId(deal.id); }} sx={{ color: "#e53935" }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Delete Dialog ── */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Deal?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{dealToDelete?.dealName}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ textTransform: "none", borderRadius: 2 }}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ textTransform: "none", borderRadius: 2 }}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* ── Create / Edit Drawer ── */}
      <Drawer anchor="right" open={openDrawer} onClose={handleCloseDrawer} PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, p: 0 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>{editId ? "Edit Deal" : "Create Deal"}</Typography>
          <IconButton size="small" onClick={handleCloseDrawer} sx={{ color: "#888" }}><Close fontSize="small" /></IconButton>
        </Box>
        <Box sx={{ px: 3, py: 2, overflowY: "auto", flex: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>Deal Name <span style={{ color: "red" }}>*</span></Typography>
              <TextField fullWidth size="small" placeholder="Enter" value={form.dealName}
                onChange={handleFormChange("dealName")} error={!!formErrors.dealName} helperText={formErrors.dealName} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>Deal Stage <span style={{ color: "red" }}>*</span></Typography>
              <FormControl fullWidth size="small" error={!!formErrors.dealStage}>
                <Select value={form.dealStage} onChange={handleFormChange("dealStage")} displayEmpty>
                  <MenuItem value="" disabled><span style={{ color: "#b0b0b0" }}>Choose</span></MenuItem>
                  {drawerStages.map((s) => <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s}</MenuItem>)}
                </Select>
                {formErrors.dealStage && <FormHelperText>{formErrors.dealStage}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>Amount <span style={{ color: "red" }}>*</span></Typography>
              <TextField fullWidth size="small" placeholder="Enter" value={form.amount}
                onChange={handleFormChange("amount")} error={!!formErrors.amount} helperText={formErrors.amount} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>Deal Owner <span style={{ color: "red" }}>*</span></Typography>
              <FormControl fullWidth size="small" error={!!formErrors.dealOwner}>
                {/* <Select value={form.dealOwner}  onChange={(e) => {
      console.log("Selected Owner:", e.target.value);
      handleFormChange("dealOwner")(e);
    }} 
                
                displayEmpty>
                  <MenuItem value="" disabled><span style={{ color: "#b0b0b0" }}>Choose</span></MenuItem>
                  {owners.map((o) => <MenuItem key={o.id} value={o.id} sx={{ fontSize: 13 }}>{o.name}</MenuItem>)}
                </Select> */}
                {formErrors.dealOwner && <FormHelperText>{formErrors.dealOwner}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>Close Date <span style={{ color: "red" }}>*</span></Typography>
              <TextField fullWidth size="small" type="date" value={form.closeDate}
                onChange={handleFormChange("closeDate")} error={!!formErrors.closeDate} helperText={formErrors.closeDate} sx={fieldSx} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>Priority <span style={{ color: "red" }}>*</span></Typography>
              <FormControl fullWidth size="small" error={!!formErrors.priority}>
                <Select value={form.priority} onChange={(e) => { setForm((p) => ({ ...p, priority: e.target.value })); setFormErrors((p) => ({ ...p, priority: "" })); }} displayEmpty
                  sx={{ borderRadius: 1.5, backgroundColor: "#fff", "& fieldset": { borderColor: "#e0e0e0" } }}>
                  <MenuItem value="" disabled><span style={{ color: "#b0b0b0" }}>Choose</span></MenuItem>
                  {priorities.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
                {formErrors.priority && <FormHelperText>{formErrors.priority}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>Associated Lead</Typography>
              <FormControl fullWidth size="small">
                <Select value={form.associatedLead} onChange={handleFormChange("associatedLead")} displayEmpty>
                  <MenuItem value="" sx={{ fontSize: 13, color: "#aaa" }}>None</MenuItem>
                  {leadsList.map((lead) => <MenuItem key={lead.id} value={lead.id} sx={{ fontSize: 13 }}>{lead.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ p: 3, borderTop: "1px solid #e0e0e0", display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
          <Button variant="outlined" onClick={handleCloseDrawer} sx={{ textTransform: "none", borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}
            sx={{ bgcolor: "#6c63ff", textTransform: "none", borderRadius: 2, fontWeight: 600, "&:hover": { bgcolor: "#5a52d5" } }}>
            Save
          </Button>
        </Box>
      </Drawer>

      <ToastNotification open={snackbar.open} message={snackbar.message} severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} />
    </Box>
  );
};

export default DealsPage;