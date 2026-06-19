
"use client";

import { useState, useEffect, useRef } from "react";
import LeadForm from "./LeadForm";
import LeadView from "./LeadView";
import { Snackbar, Alert } from "@mui/material";
import { Popover, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { importLeads } from '@/store/slices/leadsSlice';
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter } from "next/navigation";
import Menu from "@mui/material/Menu";
// import MenuItem from "@mui/material/MenuItem";
import { apiRequest } from "@/lib/api/leads";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchLeads as fetchLeadsAction, deleteLead, createLead, updateLead } from '@/store/slices/leadsSlice';

// ── Types ─────────────────────────────────────────────────────────────────────
type LeadStatus =
  | "Open"
  | "New"
  | "In Progress"
  | "Qualified"
  | "Converted"
  | "Unqualified"
  | "Attempted to Contact"
  | "Contacted"
  | "Closed";

interface Lead {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_date: string;
  status: LeadStatus;
  company_name: string;
  job_title?: string;
  contact_owner?: number;
  city?:string;
}

// ── All status values ─────────────────────────────────────────────────────────
const ALL_STATUSES: LeadStatus[] = [
  "Open",
  "New",
  "In Progress",
  "Qualified",
  "Converted",
  "Unqualified",
  "Attempted to Contact",
  "Contacted",
  "Closed",
];

// ── Status Chip Colors ────────────────────────────────────────────────────────
const statusStyles: Record<LeadStatus, { bgcolor: string; color: string }> = {
  Open: { bgcolor: "#e8f5e9", color: "#2e7d32" },
  New: { bgcolor: "#e3f2fd", color: "#1565c0" },
  "In Progress": { bgcolor: "#fff3e0", color: "#e65100" },
  Closed: { bgcolor: "#fce4ec", color: "#c62828" },
  Qualified: { bgcolor: "#f3e5f5", color: "#6a1b9a" },
  Converted: { bgcolor: "#e8f5e9", color: "#1b5e20" },
  Unqualified: { bgcolor: "#fafafa", color: "#616161" },
  "Attempted to Contact": { bgcolor: "#e8eaf6", color: "#283593" },
  Contacted: { bgcolor: "#e0f7fa", color: "#192322" },
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function LeadList() {
  const router = useRouter();
  // const [dateAnchorEl, setDateAnchorEl] = useState(null);
  // const [dateAnchorEl, setDateAnchorEl] =
  // useState<null | HTMLElement>(null);
// const [createdDateFilter, setCreatedDateFilter] = useState("");
const [createdDateFilter, setCreatedDateFilter] =
  useState<Dayjs | null>(null);

const [createdDateAnchor, setCreatedDateAnchor] =
  useState<null | HTMLElement>(null);
  
  const importInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const leads    = useAppSelector((state) => state.leads.leads) as Lead[];
  const loading  = useAppSelector((state) => state.leads.loading);

  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const rowsPerPage = 5;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  // ── Fetch Leads ──────────────────────────────────────────────────────────────
  const fetchLeads = () => {
    dispatch(fetchLeadsAction({ search, status: statusFilter }));
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const result = await dispatch(importLeads(file)).unwrap();
    setSnackbar({
      open: true,
      message: `${result.imported_count || 'Leads'} imported successfully!`,
      severity: 'success',
    });
    fetchLeads();
  } catch (err: any) {
    setSnackbar({
      open: true,
      message: err.message || 'Import failed. Check your file format.',
      severity: 'error',
    });
  }
  e.target.value = '';
};
  console.log("LEADS DATA:", leads);
 const filteredLeads = leads.filter((lead) => {
  const matchCreated = createdDateFilter
    ? dayjs(lead.created_date).format("YYYY-MM-DD") ===
      createdDateFilter.format("YYYY-MM-DD")
    : true;

  return matchCreated;
});

  
  // const totalPages = Math.ceil(leads.length / rowsPerPage);

  // const paginated = leads.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);

const paginated = filteredLeads.slice(
  (page - 1) * rowsPerPage,
  page * rowsPerPage
);

  // ── Select All ───────────────────────────────────────────────────────────────
  const allSelected =
    paginated.length > 0 && paginated.every((l) => selected.includes(l.id));
  const toggleAll = () =>
    setSelected(
      allSelected
        ? selected.filter((id) => !paginated.find((l) => l.id === id))
        : [...new Set([...selected, ...paginated.map((l) => l.id)])],
    );
  const toggleOne = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    // try {
    //   await dispatch(deleteLead(deleteId));
    //   setSelected((prev) => prev.filter((id) => id !== deleteId));
    //   setSnackbar({
    //     open: true,
    //     message: "Lead deleted successfully!",
    //     severity: "success",
    //   });
    // } catch (err) {
    //   console.error("Failed to delete lead:", err);
    // }
    try {
  await dispatch(deleteLead(deleteId)).unwrap();

  setSnackbar({
    open: true,
    message: "Lead deleted successfully",
    severity: "success",
  });
} catch (error: any) {
  setSnackbar({
    open: true,
    message: error || "You are not allowed to delete this lead",
    severity: "error",
  });
}
    setDeleteId(null);
  };

  // ── Create ───────────────────────────────────────────────────────────────────
  const handleCreateSave = async (data: any) => {
    console.log("EDIT LEAD:", data);
console.log("CONTACT OWNER:", data.contact_owner);
console.log("TYPE:", typeof data.contact_owner);
    try {
      await dispatch(createLead({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        job_title: data.jobTitle,
        company_name: data.companyName,
        company: data.companyId || null,
        // contact_owner: data.contactOwners?.join(", "),
        contact_owner: data.contactOwners[0],
        status: data.leadStatus || "New",
        city: data.city,
      }));
      setSnackbar({
        open: true,
        message: "Lead created successfully!",
        severity: "success",
      });
      fetchLeads();
    } catch (err) {
      console.error("Failed to create lead:", err);
    }
  };

  const handleEditSave = async (data: any) => {
    if (!editLead) return;
    try {
      await dispatch(updateLead({
        id: editLead.id,
        payload: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          job_title: data.jobTitle,
          company_name: data.companyName,
          company: data.companyId || null,
          // contact_owner: data.contactOwners?.join(", "),
          contact_owner: data.contactOwners[0],
          status: data.leadStatus || editLead.status,
          city: data.city,
        }
      }));
      setSnackbar({
        open: true,
        message: "Lead updated successfully!",
        severity: "success",
      });
      setEditOpen(false);
      setEditLead(null);
      fetchLeads();
    } catch (err) {
      console.error("Failed to update lead:", err);
    }
  };

  const leadToDelete = leads.find((l) => l.id === deleteId);

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        backgroundColor: "#FFFFFF",
        minHeight: "100vh",
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 24 }}>Leads</Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            width: { xs: "100%", sm: "auto" },
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleImport}
          />
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FileUploadOutlinedIcon />}
            onClick={() => importInputRef.current?.click()}
            sx={{
              borderColor: "#6c63ff",
              color: "#6c63ff",
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Import
          </Button>
          <Button
            fullWidth
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateOpen(true)}
            sx={{
              bgcolor: "#6c63ff",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": { bgcolor: "#5a52d5" },
            }}
          >
            Create
          </Button>
        </Box>
      </Box>

      {/* ── Search + Pagination ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <TextField
          placeholder="Search phone, name, email, company,status"
          size="small"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "#6B7280" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", md: "250px" },
            backgroundColor: "#fff",
            "& .MuiOutlinedInput-root": { borderRadius: "8px" },
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            size="small"
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 12 }} />}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            sx={{ color: "#6B7280", textTransform: "none" }}
          >
            Previous
          </Button>
          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i + 1}
              size="small"
              onClick={() => setPage(i + 1)}
              sx={{
                minWidth: 32,
                height: 32,
                borderRadius: "6px",
                backgroundColor: page === i + 1 ? "#6c63ff" : "transparent",
                color: page === i + 1 ? "#fff" : "#6B7280",
                fontWeight: page === i + 1 ? 700 : 400,
              }}
            >
              {i + 1}
            </Button>
          ))}
          <Button
            size="small"
            endIcon={<ArrowForwardIosIcon sx={{ fontSize: 12 }} />}
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((p) => p + 1)}
            sx={{ color: "#6B7280", textTransform: "none" }}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* ── Filters ── */}
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            displayEmpty
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter((e.target.value as LeadStatus | "") ?? "");
              setPage(1);
            }}
            renderValue={(value: unknown) => {
              const v = value as LeadStatus | "";
              return v === "" ? (
                <Typography sx={{ color: "#6B7280", fontSize: 14 }}>
                  Lead Status
                </Typography>
              ) : (
                <Chip
                  label={v}
                  size="small"
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    borderRadius: 1,
                    height: 22,
                    bgcolor: statusStyles[v].bgcolor,
                    color: statusStyles[v].color,
                  }}
                />
              );
            }}
            sx={{ fontSize: 14, borderRadius: 2, backgroundColor: "#fff" }}
          >
            <MenuItem value="">
              <Typography sx={{ fontSize: 14, color: "#6B7280" }}>
                All Statuses
              </Typography>
            </MenuItem>
            {ALL_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                <Chip
                  label={status}
                  size="small"
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    borderRadius: 1,
                    height: 22,
                    bgcolor: statusStyles[status].bgcolor,
                    color: statusStyles[status].color,
                  }}
                />
              </MenuItem>
            ))}
          </Select>
         </FormControl>
     

<Button
  size="small"
  variant="outlined"
  endIcon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
  onClick={(e) => setCreatedDateAnchor(e.currentTarget)}
  sx={{
    borderRadius: 1.5,
    textTransform: "none",
    fontSize: 13,
    borderColor: createdDateFilter ? "#6c63ff" : "#E5E7EB",
    color: createdDateFilter ? "#6c63ff" : "#6B7280",
    px: 1.5,
    backgroundColor: "#fff",
  }}
>
  {createdDateFilter
    ? createdDateFilter.format("MM/DD/YYYY")
    : "Created Date"}
</Button>

<Popover
  open={Boolean(createdDateAnchor)}
  anchorEl={createdDateAnchor}
  onClose={() => setCreatedDateAnchor(null)}
  anchorOrigin={{
    vertical: "bottom",
    horizontal: "left",
  }}
  transformOrigin={{
    vertical: "top",
    horizontal: "left",
  }}
>
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Box
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: 280,
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: 13,
          color: "#1a1a2e",
        }}
      >
        Filter by Created Date
      </Typography>

      <DatePicker
        value={createdDateFilter}
        onChange={(newValue) => {
          setCreatedDateFilter(newValue);
          setPage(1);
        }}
        slotProps={{
          textField: {
            size: "small",
            fullWidth: true,
          },
        }}
      />

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          fullWidth
          size="small"
          variant="outlined"
          onClick={() => {
            setCreatedDateFilter(null);
            setPage(1);
            setCreatedDateAnchor(null);
          }}
        >
          Clear
        </Button>

        <Button
          fullWidth
          size="small"
          variant="contained"
          onClick={() => setCreatedDateAnchor(null)}
          sx={{
            bgcolor: "#6c63ff",
            "&:hover": {
              bgcolor: "#574fd6",
            },
          }}
        >
          Apply
        </Button>
      </Box>
    </Box>
  </LocalizationProvider>
</Popover>
      </Box>

      {/* ── Table ── */}
      <TableContainer
        sx={{
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          bgcolor: "white",
          overflowX: "auto",
        }}
      >
        <Table
          sx={{
            "& .MuiTableCell-root": {
              fontSize: { xs: 12, sm: 14 },
              whiteSpace: "nowrap",
            },
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#6c63ff" }}>
              <TableCell padding="checkbox" sx={{ backgroundColor: "#6c63ff" }}>
                <Checkbox
                  checked={allSelected}
                  onChange={toggleAll}
                  sx={{ color: "white", "&.Mui-checked": { color: "white" } }}
                />
              </TableCell>
              {[
                "Name",
                "Email",
                "Company",
                "Phone Number",
                "Created Date",
                "Lead Status",
                "Actions",
              ].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: 13,
                    backgroundColor: "#6c63ff",
                  }}
                >
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: "#9CA3AF" }}>
                  Loading leads...
                </TableCell>
              </TableRow>
            ) : paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4, color: "#9CA3AF" }}>
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((lead) => (
                <TableRow
                  key={lead.id}
                  hover
                  selected={selected.includes(lead.id)}
                  sx={{
                    "&:last-child td": { border: 0 },
                    backgroundColor: "#fff",
                    "&:hover": { backgroundColor: "#F9FAFB" },
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.includes(lead.id)}
                      onChange={() => toggleOne(lead.id)}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      fontSize: 14,
                      color: "#6c63ff",
                      cursor: "pointer",
                      "&:hover": { textDecoration: "underline" },
                    }}
                    onClick={() => router.push(`/leads/${lead.id}`)}
                  >
                    {lead.name}
                  </TableCell>
                  <TableCell sx={{ fontSize: 14, color: "#555" }}>
                    {lead.email}
                  </TableCell>
                  <TableCell>
                    {lead.company_name ? (
                      <Typography
                        sx={{
                          fontSize: 14,
                          color: "#6c63ff",
                          cursor: "pointer",
                          "&:hover": { textDecoration: "underline" },
                        }}
                        onClick={() =>
                          router.push(
                            `/companies/1?company_name=${encodeURIComponent(lead.company_name)}`,
                          )
                        }
                      >
                        {lead.company_name}
                      </Typography>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell sx={{ fontSize: 14 }}>{lead.phone}</TableCell>
                  <TableCell sx={{ fontSize: 14, color: "#555" }}>
                    {lead.created_date
                      ? new Date(lead.created_date).toLocaleString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={lead.status}
                      size="small"
                      sx={{
                        fontSize: 12,
                        fontWeight: 500,
                        borderRadius: 1,
                        bgcolor: statusStyles[lead.status]?.bgcolor,
                        color: statusStyles[lead.status]?.color,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        sx={{ color: "#6c63ff" }}
                        onClick={() => {
                          setEditLead(lead);
                          setEditOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: "#e53935" }}
                        onClick={() => setDeleteId(lead.id)}
                      >
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

      {/* ── Delete Dialog ── */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Lead?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{leadToDelete?.name}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteId(null)}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Create Form ── */}
      <LeadForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreateSave}
      />

      {/* ── Edit Form ── */}
      {editLead && (
        <LeadForm
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setEditLead(null);
          }}
          onSave={handleEditSave}
          
          initialData={{
            
            email: editLead.email,
            firstName: editLead.first_name,
            lastName: editLead.last_name,
            phone: editLead.phone,
            jobTitle: editLead.job_title || "",
            companyName: editLead.company_name || "",
            // contactOwners: editLead.contact_owner
            //   ? editLead.contact_owner.split(", ")
            //   : [],
            contactOwners: editLead.contact_owner
  ? [editLead.contact_owner]
  : [],
  //   contactOwners: editLead.contact_owner
  // ? [String(editLead.contact_owner)]
  // : [],
            leadStatus: editLead.status,
            city: editLead.city || "",
            
          }}
        />
      )}

      {/* ── Snackbar ── */}
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