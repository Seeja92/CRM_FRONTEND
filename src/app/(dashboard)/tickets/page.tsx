"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  FormHelperText,
  DialogActions,
  Drawer,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import Grid from "@mui/material/Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AddIcon from "@mui/icons-material/Add";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import Close from "@mui/icons-material/Close";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from "@/store/slices/ticketsSlice";
import {
  Ticket,
  CreateTicketForm,
  TicketFormErrors,
} from "@/types/tickets.types";
import ToastNotification from "@/components/shared/ToastNotification";

// ── Status colors ─────────────────────────────────────────────────────────────
const getStatusStyle = (status: string) => {
  switch (status) {
    case "New":
      return { color: "#1565c0", backgroundColor: "#e3f2fd" };
    case "Waiting on us":
      return { color: "#e65100", backgroundColor: "#fff3e0" };
    case "Waiting on contact":
      return { color: "#6a1b9a", backgroundColor: "#f3e5f5" };
    case "Closed":
      return { color: "#2e7d32", backgroundColor: "#e8f5e9" };
    default:
      return { color: "#616161", backgroundColor: "#fafafa" };
  }
};

// ── Priority colors ───────────────────────────────────────────────────────────
const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case "Low":
      return { color: "#2e7d32" };
    case "Medium":
      return { color: "#e65100" };
    case "High":
      return { color: "#c62828" };
    case "Critical":
      return { color: "#6a1b9a" };
    default:
      return { color: "#616161" };
  }
};

const filterSx = {
  minWidth: 140,
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    backgroundColor: "#fff",
    fontSize: 13,
    "& fieldset": { borderColor: "#e0e0e0" },
    "&:hover fieldset": { borderColor: "#b0b0b0" },
    "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
  },
};

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
const ITEMS_PER_PAGE = 8;

const statusOptions = [
  "New",
  "Open",
  "Waiting on us",
  "Waiting on customer",
  "Resolved",
  "Closed",
];
const priorityOptions = ["Low", "Medium", "High", "Critical"];
const sourceOptions = ["Chat", "Email", "Phone", "Zoom", "Meeting"];

const initialForm: CreateTicketForm = {
  ticketName: "",
  companyId: "",
  dealId: "",
  status: "",
  source: "",
  priority: "",
  ownerId: "",
};

// ── Component ─────────────────────────────────────────────────────────────────
const TicketsPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const importRef = useRef<HTMLInputElement>(null);

  const tickets = useAppSelector((state) => state.tickets.tickets) as Ticket[];
  const loading = useAppSelector((state) => state.tickets.loading);

  const [companies, setCompanies] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateTicketForm>(initialForm);
  const [formErrors, setFormErrors] = useState<TicketFormErrors>({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // ── Fetch Tickets ─────────────────────────────────────────────────────────
  const fetchAllTickets = () => {
    dispatch(
      fetchTickets({
        search,
        status: statusFilter,
        priority: priorityFilter,
        source: sourceFilter,
        owner: ownerFilter,
      }),
    );
  };

  // ── Fetch Companies ───────────────────────────────────────────────────────
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/companies/`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
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
      const token = localStorage.getItem("token");
      console.log("Fetching deals..."); // ← add this
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/deals/`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      console.log("Deals response status:", res.status); // ← add this
      if (res.ok) {
        const data = await res.json();
        const dealsList = data.results || data;
        console.log("Deals list length:", dealsList.length); // ← add this
        console.log("First deal:", dealsList[0]);
        setDeals(dealsList);
      } else {
        console.error("Deals fetch failed:", res.status); // ← add this
      }
    } catch (err) {
      console.error("Failed to fetch deals:", err);
    }
  };

  // ── Fetch Users ───────────────────────────────────────────────────────────
  const fetchOwners = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/users/`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setOwners(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to fetch owners:", err);
    }
  };

  useEffect(() => {
    fetchAllTickets();
    fetchCompanies();
    fetchDeals();
    fetchOwners();
  }, []);

  useEffect(() => {
    fetchAllTickets();
  }, [search, statusFilter, priorityFilter, sourceFilter, ownerFilter]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(tickets.length / ITEMS_PER_PAGE);
  const paginated = tickets.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  // ── Select ────────────────────────────────────────────────────────────────
  const allSelected =
    paginated.length > 0 &&
    paginated.every((t) => selected.includes(String(t.id)));
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSelected(e.target.checked ? paginated.map((t) => String(t.id)) : []);
  const handleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  // ── Delete ────────────────────────────────────────────────────────────────
  const ticketToDelete = tickets.find((t) => String(t.id) === deleteId);
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await dispatch(deleteTicket(deleteId));
      setSelected((prev) => prev.filter((i) => i !== deleteId));
      setSnackbar({
        open: true,
        message: "Ticket deleted successfully!",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to delete ticket!",
        severity: "error",
      });
    }
    setDeleteId(null);
  };

  // ── Open Edit Drawer ──────────────────────────────────────────────────────
  const handleEditClick = (ticket: Ticket) => {
    setEditId(String(ticket.id));

    // ── Find deal ID ──
    const matchedDeal = deals.find((d) => d.deal_name === ticket.deal_name);

    const leadCompanyName = matchedDeal?.associated_lead?.company_name || "";
    const companyFromDeal = companies.find(
      (c) => c.company_name === leadCompanyName,
    );
    // ── Fallback: match directly from ticket.company_name ──
    const matchedCompany = companies.find(
      (c) => c.company_name === ticket.company_name,
    );
    // ── Find owner ID ──
    const matchedOwner = owners.find((o) => o.name === ticket.owner_name);

    setForm({
      ticketName: ticket.ticket_name,

      companyId: companyFromDeal
        ? String(companyFromDeal.id) // ← from deal → lead → company
        : matchedCompany
          ? String(matchedCompany.id) // ← fallback from ticket
          : "",
      dealId: matchedDeal ? String(matchedDeal.id) : "",
      status: ticket.status,
      source: ticket.source,
      priority: ticket.priority,
      ownerId: matchedOwner ? String(matchedOwner.id) : "",
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

  // ── Validate ──────────────────────────────────────────────────────────────
  const validateForm = (): boolean => {
    const errors: TicketFormErrors = {};
    if (!form.ticketName.trim()) errors.ticketName = "Ticket name is required.";
    if (!form.status) errors.status = "Status is required.";
    if (!form.source) errors.source = "Source is required.";
    if (!form.priority) errors.priority = "Priority is required.";
    if (!form.ownerId) errors.ownerId = "Owner is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) return;
    const payload = {
      ticket_name: form.ticketName,
      status: form.status,
      source: form.source,
      priority: form.priority,
      ticket_owner_id: form.ownerId ? Number(form.ownerId) : null,
      company_id: form.companyId ? Number(form.companyId) : null,
      deal_id: form.dealId ? Number(form.dealId) : null,
    };
    try {
      if (editId) {
        await dispatch(updateTicket({ id: editId, payload }));
        setSnackbar({
          open: true,
          message: "Ticket updated successfully!",
          severity: "success",
        });
      } else {
        await dispatch(createTicket(payload));
        setSnackbar({
          open: true,
          message: "Ticket created successfully!",
          severity: "success",
        });
      }
      fetchAllTickets();
      setForm(initialForm);
      setFormErrors({});
      setEditId(null);
      setOpenDrawer(false);
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to save ticket!",
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

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/import/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        },
      );

      const data = await res.json();

      if (res.ok) {
        setSnackbar({
          open: true,
          message: `${data.imported_count} tickets imported successfully!`,
          severity: "success",
        });

        fetchAllTickets();
      } else {
        setSnackbar({
          open: true,
          message: data.detail || "Import failed",
          severity: "error",
        });
      }
    } catch (err) {
      console.error(err);

      setSnackbar({
        open: true,
        message: "Import failed",
        severity: "error",
      });
    }

    e.target.value = "";
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Hidden CSV input */}
      <input
        type="file"
        accept=".csv"
        ref={importRef}
        style={{ display: "none" }}
        onChange={handleImportCSV}
      />

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
        <Typography sx={{ fontWeight: 700, fontSize: 24 }}>Tickets</Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            width: { xs: "100%", sm: "auto" },
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<FileUploadOutlinedIcon />}
            onClick={() => importRef.current?.click()}
            sx={{
              borderColor: "#6c63ff",
              color: "#6c63ff",
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 500,
            }}
          >
            Import
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
            sx={{
              bgcolor: "#6c63ff",
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
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
          placeholder="Search name, owner, company"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
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
      <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={filterSx}>
          <Select
            value={ownerFilter}
            onChange={(e) => {
              setOwnerFilter(e.target.value);
              setPage(1);
            }}
            displayEmpty
            renderValue={(value) => {
              if (value === "")
                return (
                  <span style={{ color: "#1a1a2e", fontSize: 13 }}>
                    Ticket Owner
                  </span>
                );
              const owner = owners.find((o) => String(o.id) === String(value));
              return (
                <span style={{ color: "#1a1a2e", fontSize: 13 }}>
                  {owner?.name || String(value)}
                </span>
              );
            }}
          >
            <MenuItem value="">All</MenuItem>
            {owners.map((o) => (
              <MenuItem key={o.id} value={String(o.id)}>
                {o.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={filterSx}>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            displayEmpty
          >
            <MenuItem value="">Ticket Status</MenuItem>
            {statusOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={filterSx}>
          <Select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            displayEmpty
          >
            <MenuItem value="">Priority</MenuItem>
            {priorityOptions.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={filterSx}>
          <Select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setPage(1);
            }}
            displayEmpty
          >
            <MenuItem value="">Source</MenuItem>
            {sourceOptions.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          size="small"
          variant="outlined"
          endIcon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
          sx={{
            borderRadius: 1.5,
            textTransform: "none",
            fontSize: 13,
            borderColor: "#E5E7EB",
            color: "#6B7280",
            px: 1.5,
            backgroundColor: "#fff",
          }}
        >
          Created Date
        </Button>
      </Box>

      {/* ── Loading ── */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress sx={{ color: "#6c63ff" }} />
        </Box>
      ) : (
        <TableContainer
          sx={{
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            bgcolor: "white",
            overflowX: "auto",
            boxShadow: "none",
          }}
        >
          <Table
            sx={{
              "& .MuiTableCell-root": {
                fontSize: { xs: 12, sm: 14 },
                whiteSpace: "nowrap",
                py: 1,
                px: 1.5,
              },
            }}
          >
            <TableHead>
              <TableRow sx={{ backgroundColor: "#6c63ff" }}>
                <TableCell
                  padding="checkbox"
                  sx={{ backgroundColor: "#6c63ff" }}
                >
                  <Checkbox
                    checked={allSelected}
                    onChange={handleSelectAll}
                    sx={{ color: "#fff", "&.Mui-checked": { color: "#fff" } }}
                  />
                </TableCell>

                {[
                  "Ticket Name",
                  "Deal Name",
                  "Ticket Status",
                  "Priority",
                  "Source",
                  "Ticket Owner",
                  "Created Date",
                  "Actions",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: 13,
                      backgroundColor: "#6c63ff",
                      py: 1.5,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    sx={{ textAlign: "center", py: 4, color: "#888" }}
                  >
                    No tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    hover
                    sx={{
                      backgroundColor: "#fff",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#F9FAFB" },
                      "&:last-child td": { border: 0 },
                    }}
                    onClick={() => router.push(`/tickets/${ticket.id}`)}
                  >
                    <TableCell
                      padding="checkbox"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selected.includes(String(ticket.id))}
                        onChange={() => handleSelect(String(ticket.id))}
                        sx={{ "&.Mui-checked": { color: "#6c63ff" } }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#6c63ff",
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/tickets/${ticket.id}`);
                      }}
                    >
                      {ticket.ticket_name}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, color: "#444" }}>
                      {ticket.deal_name || "—"}
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: "inline-block",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: "12px",
                          fontSize: 12,
                          fontWeight: 600,
                          ...getStatusStyle(ticket.status),
                        }}
                      >
                        {ticket.status}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: 14,
                        fontWeight: 600,
                        ...getPriorityStyle(ticket.priority),
                      }}
                    >
                      {ticket.priority}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, color: "#444" }}>
                      {ticket.source}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, color: "#444" }}>
                      {ticket.owner_name || "—"}
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, color: "#444" }}>
                      {ticket.created_at
                        ? new Date(ticket.created_at).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(ticket);
                          }}
                          sx={{ color: "#6c63ff" }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(String(ticket.id));
                          }}
                          sx={{ color: "#e53935" }}
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
      )}

      {/* ── Delete Dialog ── */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Ticket?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{ticketToDelete?.ticket_name}</strong>? This action cannot
            be undone.
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

      {/* ── Create / Edit Drawer ── */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={handleCloseDrawer}
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
            {editId ? "Edit Ticket" : "Create Ticket"}
          </Typography>
          <IconButton
            size="small"
            onClick={handleCloseDrawer}
            sx={{ color: "#888" }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
        <Box sx={{ px: 3, py: 2, overflowY: "auto", flex: 1 }}>
          <Grid container spacing={2}>
            {/* Ticket Name */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Ticket Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={form.ticketName}
                onChange={(e) => {
                  setForm((p) => ({ ...p, ticketName: e.target.value }));
                  setFormErrors((p) => ({ ...p, ticketName: "" }));
                }}
                error={!!formErrors.ticketName}
                helperText={formErrors.ticketName}
                sx={fieldSx}
              />
            </Grid>

            {/* Company */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Company Name
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={form.companyId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, companyId: e.target.value }))
                  }
                  displayEmpty
                  sx={{
                    borderRadius: 1.5,
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#e0e0e0" },
                  }}
                >
                  <MenuItem value="">
                    <span style={{ color: "#b0b0b0" }}>Choose Company</span>
                  </MenuItem>
                  {companies.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {c.company_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Deal */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Deal Name
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={form.dealId}
                  onChange={(e) => {
                    const selectedDealId = e.target.value;

                    // ── Find selected deal from raw API data ──
                    const selectedDeal = deals.find(
                      (d) => String(d.id) === String(selectedDealId),
                    );

                    // ── Extract company_name from deal → associated_lead ──
                    const leadCompanyName =
                      selectedDeal?.associated_lead?.company_name || "";
                    console.log("Lead company name:", leadCompanyName); // ← verify
                    console.log("Companies list:", companies);
                    // ── Match against companies list to get company ID ──
                    const matchedCompany = companies.find(
                      (c) => c.company_name === leadCompanyName,
                    );
                    console.log("Matched company:", matchedCompany);
                    setForm((p) => ({
                      ...p,
                      dealId: selectedDealId,
                      companyId: matchedCompany
                        ? String(matchedCompany.id)
                        : "",
                    }));
                  }}
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

            {/* Status */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Status <span style={{ color: "red" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={!!formErrors.status}>
                <Select
                  value={form.status}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, status: e.target.value }));
                    setFormErrors((p) => ({ ...p, status: "" }));
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
                {formErrors.status && (
                  <FormHelperText>{formErrors.status}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Source */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Source <span style={{ color: "red" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={!!formErrors.source}>
                <Select
                  value={form.source}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, source: e.target.value }));
                    setFormErrors((p) => ({ ...p, source: "" }));
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
                {formErrors.source && (
                  <FormHelperText>{formErrors.source}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Priority */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Priority <span style={{ color: "red" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={!!formErrors.priority}>
                <Select
                  value={form.priority}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, priority: e.target.value }));
                    setFormErrors((p) => ({ ...p, priority: "" }));
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
                {formErrors.priority && (
                  <FormHelperText>{formErrors.priority}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Owner */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Owner <span style={{ color: "red" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={!!formErrors.ownerId}>
                <Select
                  value={form.ownerId}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, ownerId: e.target.value }));
                    setFormErrors((p) => ({ ...p, ownerId: "" }));
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
                    <MenuItem key={o.id} value={String(o.id)}>
                      {o.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.ownerId && (
                  <FormHelperText>{formErrors.ownerId}</FormHelperText>
                )}
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
            onClick={handleCloseDrawer}
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
            onClick={handleSave}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "#6c63ff",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#574fd6", boxShadow: "none" },
            }}
          >
            {editId ? "Update" : "Save Ticket"}
          </Button>
        </Box>
      </Drawer>

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

export default TicketsPage;
