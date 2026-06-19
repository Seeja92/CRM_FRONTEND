"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  DialogContentText,
  Snackbar,
  Alert,
  Drawer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Popover,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid2";
import {
  Search,
  Edit,
  Delete,
  CalendarToday,
  Close,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter } from "next/navigation";
import { CreateCompanyForm } from "@/types/company.types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCompanies as fetchCompaniesAction,
  deleteCompany,
  fetchUsers,
  importCompanies,
  fetchCompanyById,
  updateCompany,
  createCompany,
} from "@/store/slices/companiesSlice";

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
const leadStatusOptions = [
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
  "& input::placeholder": { color: "#b0b0b0", opacity: 1 },
};

const labelSx = {
  fontSize: 13,
  fontWeight: 500,
  color: "#1a1a2e",
  mb: 0.5,
};

const initialForm: CreateCompanyForm = {
  domainName: "",
  companyName: "",
  ownerIds: [],
  industry: "",
  type: "",
  city: "",
  country: "",
  noOfEmployees: "",
  annualRevenue: "",
  email: "",
  phoneNumber: "",
  phoneCode: "IN",
};

interface FormErrors {
  domainName?: string;
  companyName?: string;
  ownerIds?: string;
  industry?: string;
  type?: string;
  email?: string;
  phoneNumber?: string;
}

export default function CompaniesPage() {
  const router = useRouter();
  const importRef = useRef<HTMLInputElement>(null);

  // ── Redux ─────────────────────────────────────────────────────────────────────
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies.companies);
  const loading = useAppSelector((state) => state.companies.loading);
  const count = useAppSelector((state) => state.companies.count);
  const users = useAppSelector((state) => state.companies.users);

  // ── State ─────────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  // ADD single date
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [dateAnchor, setDateAnchor] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [industryFilter, setIndustryFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [leadStatusFilter, setLeadStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateCompanyForm>(initialForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const rowsPerPage = 8;

  const cityOptions = useMemo(
    () => [...new Set(companies.map((c: any) => c.city).filter(Boolean))],
    [companies],
  );
  const countryOptions = useMemo(
    () => [...new Set(companies.map((c: any) => c.country).filter(Boolean))],
    [companies],
  );

  // ── Fetch Companies ───────────────────────────────────────────────────────────
  const fetchCompanies = useCallback(() => {
    dispatch(
      fetchCompaniesAction({
        search,
        industry: industryFilter,
        city: cityFilter,
        country: countryFilter,
        lead_status: leadStatusFilter,
        date_from: selectedDate ? selectedDate.format("YYYY-MM-DD") : undefined,
        date_to: selectedDate ? selectedDate.format("YYYY-MM-DD") : undefined,
      }),
    );
  }, [search, industryFilter, cityFilter, countryFilter, leadStatusFilter, selectedDate]);

  // ── Edit Click ────────────────────────────────────────────────────────────────
  const handleEditClick = async (id: number) => {
    try {
      const data = await dispatch(fetchCompanyById(id)).unwrap();
      setForm({
        domainName: data.domain_name || "",
        companyName: data.company_name || "",
        ownerIds: data.company_owner?.map((o: any) => o.id) || [],
        industry: data.industry || "",
        type: data.type || "",
        city: data.city || "",
        country: data.country || "",
        noOfEmployees: data.no_of_employees || "",
        annualRevenue: data.annual_revenue || "",
        email: data.email || "",
        phoneNumber: data.phone_number || "",
        phoneCode: "IN",
      });
      setEditId(id);
      setOpenModal(true);
    } catch {
      setSnackbar({ open: true, message: "Failed to load company details.", severity: "error" });
    }
  };

  // ── Effects ───────────────────────────────────────────────────────────────────
 useEffect(() => {
  setPage(1);
}, [search, industryFilter, cityFilter, countryFilter, leadStatusFilter, selectedDate]);

useEffect(() => {
  fetchCompanies();
  dispatch(fetchUsers());
}, [fetchCompanies]);

  // ── Pagination ────────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(count / rowsPerPage));
  const paginated = companies.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  // ── Select ────────────────────────────────────────────────────────────────────
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelected(e.target.checked ? paginated.map((c: any) => c.id) : []);
  };

  const handleSelectOne = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const companyToDelete = companies.find((c: any) => c.id === deleteId);
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    // try {
    //   await dispatch(deleteCompany(deleteId));
    //   setDeleteId(null);
    //   setSnackbar({
    //     open: true,
    //     message: "Company deleted successfully!",
    //     severity: "success",
    //   });
    // } catch (err) {
    //   console.error("Failed to delete company:", err);
    // }
    try {
  await dispatch(deleteCompany(deleteId)).unwrap();

  setSnackbar({
    open: true,
    message: "Company deleted successfully",
    severity: "success",
  });
} catch (err: any) {
  setSnackbar({
    open: true,
    message: err || "You don't have permission to delete",
    severity: "error",
  });
}
  };

  // ── Form ──────────────────────────────────────────────────────────────────────
  const handleFormChange =
    (field: keyof CreateCompanyForm) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
      };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!form.domainName.trim()) errors.domainName = "Domain name is required.";
    if (!form.companyName.trim()) errors.companyName = "Company name is required.";
    if (!form.ownerIds.length) errors.ownerIds = "At least one owner is required.";
    if (!form.industry) errors.industry = "Industry is required.";
    if (!form.type) errors.type = "Type is required.";
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!form.phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Save (Create + Edit) ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      domain_name: form.domainName,
      company_name: form.companyName,
      company_owner_ids: form.ownerIds,
      industry: form.industry,
      type: form.type,
      city: form.city,
      country: form.country,
      no_of_employees: form.noOfEmployees,
      annual_revenue: form.annualRevenue,
      email: form.email,
      phone_number: form.phoneNumber,
    };

    try {
      if (editId) {
        await dispatch(updateCompany({ id: editId, payload })).unwrap();
      } else {
        await dispatch(createCompany(payload)).unwrap();
      }
      setForm(initialForm);
      setFormErrors({});
      setOpenModal(false);
      setEditId(null);
      setSnackbar({
        open: true,
        message: editId ? "Company updated successfully!" : "Company created successfully!",
        severity: "success",
      });
      fetchCompanies();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || "Failed to save company.",
        severity: "error",
      });
    }
  };

  const handleCloseModal = () => {
    setForm(initialForm);
    setFormErrors({});
    setOpenModal(false);
    setEditId(null);
  };

  // ── Import ────────────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await dispatch(importCompanies(file)).unwrap();
      setSnackbar({ open: true, message: "Companies imported successfully!", severity: "success" });
      fetchCompanies();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || "Import failed.", severity: "error" });
    }
    e.target.value = "";
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <input
        type="file"
        accept=".csv"
        ref={importRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Header */}
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
        <Typography sx={{ fontWeight: 700, fontSize: 24 }}>
          Companies
        </Typography>
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
            onClick={() => setOpenModal(true)}
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

      {/* Search + Pagination */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "nowrap",
          gap: 0.5,
        }}
      >
        <TextField
          placeholder="Search name, city, country, phone, owner"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18, color: "#6B7280" }} />
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
                "&:hover": {
                  backgroundColor: page === i + 1 ? "#6c63ff" : "#F3F4F6",
                },
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

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 0.5, mb: 2, flexWrap: "nowrap" }}>
        <FormControl size="small" sx={filterSx}>
          <Select
            value={industryFilter}
            onChange={(e) => {
              setIndustryFilter(e.target.value);
              setPage(1);
            }}
            displayEmpty
          >
            <MenuItem value="All">Industry Type</MenuItem>
            {industryOptions.map((o) => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={filterSx}>
          <Select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
            displayEmpty
          >
            <MenuItem value="All">City</MenuItem>
            {cityOptions.map((o) => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={filterSx}>
          <Select
            value={countryFilter}
            onChange={(e) => {
              setCountryFilter(e.target.value);
              setPage(1);
            }}
            displayEmpty
          >
            <MenuItem value="All">Country/Region</MenuItem>
            {countryOptions.map((o) => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={filterSx}>
          <Select
            value={leadStatusFilter}
            onChange={(e) => {
              setLeadStatusFilter(e.target.value);
              setPage(1);
            }}
            displayEmpty
          >
            <MenuItem value="All">Lead Status</MenuItem>
            {leadStatusOptions.map((o) => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Created Date Filter */}
        <Button
          size="small"
          variant="outlined"
          endIcon={<CalendarToday sx={{ fontSize: 14 }} />}
          onClick={(e) => setDateAnchor(e.currentTarget)}
          sx={{
            borderRadius: 1.5,
            textTransform: "none",
            fontSize: 13,
            borderColor: selectedDate ? "#6c63ff" : "#E5E7EB",
            color: selectedDate ? "#6c63ff" : "#6B7280",
            backgroundColor: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          {selectedDate ? selectedDate.format("MM/DD/YYYY") : "Created Date"}
        </Button>

        <Popover
          open={Boolean(dateAnchor)}
          anchorEl={dateAnchor}
          onClose={() => setDateAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{ sx: { overflowY: "auto" } }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2, minWidth: 280 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 13, color: "#1a1a2e" }}>
                Filter by Created Date
              </Typography>
              <DatePicker
                value={selectedDate}
                onChange={(newValue) => { setSelectedDate(newValue); setPage(1); }}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                    sx: fieldSx,
                  },
                }}
              />
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  fullWidth size="small" variant="outlined"
                  onClick={() => {
                    setSelectedDate(null);
                    setPage(1);
                    setDateAnchor(null);
                  }}
                  sx={{ textTransform: "none", borderRadius: 1.5, fontSize: 12, borderColor: "#e0e0e0", color: "#555" }}
                >
                  Clear
                </Button>
                <Button
                  fullWidth size="small" variant="contained"
                  onClick={() => {
                    fetchCompanies();
                    setDateAnchor(null);
                  }}
                  sx={{ textTransform: "none", borderRadius: 1.5, fontSize: 12, bgcolor: "#6c63ff", "&:hover": { bgcolor: "#574fd6" } }}
                >
                  Apply
                </Button>
              </Box>
            </Box>
          </LocalizationProvider>
        </Popover>
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress sx={{ color: "#6c63ff" }} />
        </Box>
      )}

      {/* Table */}
      {!loading && (
        <TableContainer
          sx={{
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            boxShadow: "none",
            overflowX: "auto",
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
                <TableCell padding="checkbox" sx={{ backgroundColor: "#6c63ff" }}>
                  <Checkbox
                    sx={{ color: "#fff", "&.Mui-checked": { color: "#fff" } }}
                    checked={
                      paginated.length > 0 &&
                      selected.length === paginated.length
                    }
                    indeterminate={
                      selected.length > 0 && selected.length < paginated.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                {[
                  "Company Name",
                  "Company Owner",
                  "Phone Number",
                  "Industry",
                  "City",
                  "Country/Region",
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
              {paginated.map((company: any) => (
                <TableRow
                  key={company.id}
                  hover
                  sx={{
                    backgroundColor: "#fff",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#F9FAFB" },
                    "&:last-child td": { border: 0 },
                  }}
                  onClick={() => router.push(`/companies/${company.id}`)}
                >
                  <TableCell
                    padding="checkbox"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={selected.includes(company.id)}
                      onChange={() => handleSelectOne(company.id)}
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
                      router.push(`/companies/${company.id}`);
                    }}
                  >
                    {company.company_name}
                  </TableCell>
                  <TableCell sx={{ fontSize: 14, color: "#444" }}>
                    {company.company_owner
                      ?.map((o: any) => `${o.first_name} ${o.last_name}`)
                      .join(", ")}
                  </TableCell>
                  <TableCell sx={{ fontSize: 14, color: "#444" }}>
                    {company.phone_number}
                  </TableCell>
                  <TableCell sx={{ fontSize: 14, color: "#444" }}>
                    {company.industry}
                  </TableCell>
                  <TableCell sx={{ fontSize: 14, color: "#444" }}>
                    {company.city}
                  </TableCell>
                  <TableCell sx={{ fontSize: 14, color: "#444" }}>
                    {company.country}
                  </TableCell>
                  <TableCell sx={{ fontSize: 14, color: "#444" }}>
                    {company.created_at
                      ? new Date(company.created_at).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(company.id);
                        }}
                        sx={{ color: "#6c63ff" }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(company.id);
                        }}
                        sx={{ color: "#e53935" }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    align="center"
                    sx={{ py: 4, color: "#888" }}
                  >
                    No companies found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Company?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{companyToDelete?.company_name}</strong>? This action cannot
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

      {/* Create / Edit Company Drawer */}
      <Drawer
        anchor="right"
        open={openModal}
        onClose={handleCloseModal}
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
            {editId ? "Edit Company" : "Create Company"}
          </Typography>
          <IconButton
            size="small"
            onClick={handleCloseModal}
            sx={{ color: "#888" }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
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
                value={form.domainName}
                onChange={handleFormChange("domainName")}
                error={!!formErrors.domainName}
                helperText={formErrors.domainName}
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
                value={form.companyName}
                onChange={handleFormChange("companyName")}
                error={!!formErrors.companyName}
                helperText={formErrors.companyName}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Company Owner <span style={{ color: "red" }}>*</span>
              </Typography>
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(option) => option.name}
                value={users.filter((u) => form.ownerIds.includes(u.id))}
                onChange={(_, newValue) => {
                  setForm((prev) => ({
                    ...prev,
                    ownerIds: newValue.map((u: any) => u.id),
                  }));
                  setFormErrors((prev) => ({ ...prev, ownerIds: "" }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    placeholder={form.ownerIds.length === 0 ? "Select owners" : ""}
                    error={!!formErrors.ownerIds}
                    helperText={formErrors.ownerIds}
                    sx={fieldSx}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...restProps } = props as any;
                  return (
                    <li key={option.id} {...restProps}>
                      <Checkbox
                        checked={form.ownerIds.includes(option.id)}
                        size="small"
                        sx={{ "&.Mui-checked": { color: "#6c63ff" }, mr: 1 }}
                      />
                      <Box>
                        <Typography sx={{ fontSize: 13 }}>{option.name}</Typography>
                        <Typography sx={{ fontSize: 11, color: "#888" }}>{option.email}</Typography>
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
              <FormControl fullWidth size="small" error={!!formErrors.industry}>
                <Select
                  value={form.industry}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, industry: e.target.value }));
                    setFormErrors((prev) => ({ ...prev, industry: "" }));
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
                  {industryOptions.map((o) => (
                    <MenuItem key={o} value={o}>{o}</MenuItem>
                  ))}
                </Select>
                {formErrors.industry && (
                  <FormHelperText>{formErrors.industry}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>
                Type <span style={{ color: "red" }}>*</span>
              </Typography>
              <FormControl fullWidth size="small" error={!!formErrors.type}>
                <Select
                  value={form.type}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, type: e.target.value }));
                    setFormErrors((prev) => ({ ...prev, type: "" }));
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
                  {typeOptions.map((o) => (
                    <MenuItem key={o} value={o}>{o}</MenuItem>
                  ))}
                </Select>
                {formErrors.type && (
                  <FormHelperText>{formErrors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>City</Typography>
              <TextField
                fullWidth size="small" placeholder="Enter"
                value={form.city}
                onChange={handleFormChange("city")}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>Country/Region</Typography>
              <TextField
                fullWidth size="small" placeholder="Enter"
                value={form.country}
                onChange={handleFormChange("country")}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>No of Employees</Typography>
              <TextField
                fullWidth size="small" placeholder="Enter"
                value={form.noOfEmployees}
                onChange={handleFormChange("noOfEmployees")}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="body2" sx={labelSx}>Annual Revenue</Typography>
              <TextField
                fullWidth size="small" placeholder="Enter"
                value={form.annualRevenue}
                onChange={handleFormChange("annualRevenue")}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Email <span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth size="small" placeholder="Enter"
                value={form.email}
                onChange={handleFormChange("email")}
                error={!!formErrors.email}
                helperText={formErrors.email}
                sx={fieldSx}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={labelSx}>
                Phone Number <span style={{ color: "red" }}>*</span>
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Select
                  value={form.phoneCode || "IN"}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, phoneCode: e.target.value }))
                  }
                  size="small"
                  sx={{
                    minWidth: 80,
                    borderRadius: 1.5,
                    backgroundColor: "#fff",
                    "& fieldset": { borderColor: "#e0e0e0" },
                    fontSize: 13,
                  }}
                >
                  <MenuItem value="IN">🇮🇳 +91</MenuItem>
                  <MenuItem value="US">🇺🇸 +1</MenuItem>
                  <MenuItem value="UK">🇬🇧 +44</MenuItem>
                  <MenuItem value="AE">🇦🇪 +971</MenuItem>
                  <MenuItem value="NL">🇳🇱 +31</MenuItem>
                  <MenuItem value="CH">🇨🇭 +41</MenuItem>
                  <MenuItem value="SG">🇸🇬 +65</MenuItem>
                  <MenuItem value="ZA">🇿🇦 +27</MenuItem>
                  <MenuItem value="CA">🇨🇦 +1</MenuItem>
                </Select>
                <TextField
                  fullWidth size="small" placeholder="Enter"
                  value={form.phoneNumber}
                  onChange={handleFormChange("phoneNumber")}
                  error={!!formErrors.phoneNumber}
                  helperText={formErrors.phoneNumber}
                  sx={fieldSx}
                />
              </Box>
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
            fullWidth variant="outlined" onClick={handleCloseModal}
            sx={{
              borderRadius: 2, textTransform: "none", fontWeight: 500,
              borderColor: "#e0e0e0", color: "#555",
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth variant="contained" onClick={handleSave}
            sx={{
              borderRadius: 2, textTransform: "none", fontWeight: 600,
              backgroundColor: "#6c63ff", boxShadow: "none",
              "&:hover": { backgroundColor: "#574fd6", boxShadow: "none" },
            }}
          >
            {editId ? "Update" : "Save"}
          </Button>
        </Box>
      </Drawer>

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