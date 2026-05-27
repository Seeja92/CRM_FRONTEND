"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
  Divider,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ReactCountryFlag from "react-country-flag";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface LeadFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
  companyName?: string;
  contactOwners: string[]; // ← multi-select (array)
  leadStatus: string;
}

interface LeadFormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface LeadFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: LeadFormData) => void;
  initialData?: LeadFormData;
}

const LEAD_STATUS_OPTIONS = [
  "Open",
  "New",
  "In Progress",
  "Converted",
  "Unqualified",
  "Qualified",
  "Attempted to Contact",
  "Connected",
  "Closed",
];

// ── Shared label component ─────────────────────────────────────────────────────
function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <Typography
      sx={{ fontSize: 13, fontWeight: 500, mb: 0.5, color: "#374151" }}
    >
      {children}
      {required && <span style={{ color: "red", marginLeft: 2 }}>*</span>}
    </Typography>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function LeadForm({
  open,
  onClose,
  onSave,
  initialData,
}: LeadFormProps) {
  const [form, setForm] = useState<LeadFormData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    jobTitle: "",
    companyName: "",
    contactOwners: [],
    leadStatus: "",
  });
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    }
  }, [initialData]);
  const isEdit = !!initialData?.email;
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  // const [users, setUsers] = useState<{ id: number; username: string }[]>([]);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const NEXT_PUBLIC_API_URL =  `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth`;
        
        const token = localStorage.getItem("token");
        // Add this temporarily to see all localStorage keys
        console.log("All localStorage:", { ...localStorage });
        const res = await fetch(`${NEXT_PUBLIC_API_URL}/users/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          console.log("Users API response:", data);
          setUsers(data.results || data);
        } else {
          console.log("Status:", res.status); // 👈 check if 404 or 403
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

    fetchUsers();
  }, []);
  const [errors, setErrors] = useState<LeadFormErrors>({});

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Multi-select handler for contactOwners
  const handleOwnersChange = (value: string[]) => {
    setForm((prev) => ({ ...prev, contactOwners: value }));
  };

  // ── Validation ──
  const validate = () => {
    const newErrors: LeadFormErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    if (!form.firstName) newErrors.firstName = "First Name is required";
    if (!form.lastName) newErrors.lastName = "Last Name is required";
    if (!form.phone) newErrors.phone = "Phone Number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave(form);
    handleClose();
  };

  const handleClose = () => {
    setForm({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      jobTitle: "",
      companyName: "",
      contactOwners: [],
      leadStatus: "",
    });
    setErrors({});
    onClose();
  };

  const inputSx = { "& .MuiOutlinedInput-root": { borderRadius: "8px" } };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      // ── Right-aligned, full-height panel (matches Figma) ──
      sx={{
        "& .MuiDialog-container": {
          alignItems: "flex-start",
          justifyContent: "flex-end",
        },
      }}
      slotProps={{
        paper: {
          sx: {
            borderRadius: "12px 0 0 12px",
            m: 0,
            width: 380,
            maxWidth: 380,
            height: "100vh",
            maxHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
      fullScreen={false}
    >
      {/* ── Title ── */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 2,
          px: 3,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 17, color: "#111827" }}>
          {isEdit ? "Edit Lead" : "Create Lead"}
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ color: "#6B7280" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* ── Scrollable body ── */}
      <DialogContent sx={{ px: 3, py: 2, overflowY: "auto", flex: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Email */}
          <Box>
            <FieldLabel required>Email</FieldLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon
                        sx={{ fontSize: 17, color: "#9CA3AF" }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputSx}
            />
          </Box>

          {/* First Name */}
          <Box>
            <FieldLabel required>First Name</FieldLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              error={!!errors.firstName}
              helperText={errors.firstName}
              sx={inputSx}
            />
          </Box>

          {/* Last Name */}
          <Box>
            <FieldLabel required>Last Name</FieldLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              error={!!errors.lastName}
              helperText={errors.lastName}
              sx={inputSx}
            />
          </Box>

          <Box>
            <FieldLabel required>Phone Number</FieldLabel>

            <Box sx={{ display: "flex", gap: 1 }}>
              {/* Country Selector */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.3,
                  border: "1px solid #D1D5DB",
                  borderRadius: "8px",
                  px: 1.2,
                  minWidth: 58,
                  height: 40,
                  bgcolor: "#fff",
                  cursor: "pointer",
                }}
              >
                <ReactCountryFlag
                  countryCode="IN"
                  svg
                  style={{
                    width: "1.4em",
                    height: "1.4em",
                  }}
                />

                <KeyboardArrowDownIcon
                  sx={{
                    fontSize: 16,
                    color: "#6B7280",
                  }}
                />
              </Box>

              {/* Phone Input */}
              <TextField
                fullWidth
                size="small"
                placeholder="Enter"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                sx={inputSx}
              />
            </Box>
          </Box>

          {/* Job Title */}
          <Box>
            <FieldLabel>Job Title</FieldLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter"
              value={form.jobTitle}
              onChange={(e) => handleChange("jobTitle", e.target.value)}
              sx={inputSx}
            />
          </Box>

          {/* Company Name */}
          <Box>
            <FieldLabel>Company Name</FieldLabel>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter"
              value={form.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              sx={inputSx}
            />
          </Box>

          {/* Contact Owner — MULTI-SELECT */}
          <Box>
            <FieldLabel>Contact Owner</FieldLabel>
            <Select
              fullWidth
              size="small"
              multiple
              displayEmpty
              value={form.contactOwners}
              onChange={(e) => handleOwnersChange(e.target.value as string[])}
              input={<OutlinedInput />}
              IconComponent={KeyboardArrowDownIcon}
              renderValue={(selected) => {
                if ((selected as string[]).length === 0) {
                  return <span style={{ color: "#9CA3AF" }}>Choose</span>;
                }
                return (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(selected as string[]).map((val) => (
                      <Chip
                        key={val}
                        label={val}
                        size="small"
                        onDelete={(e) => {
                          e.stopPropagation();
                          handleOwnersChange(
                            form.contactOwners.filter((o) => o !== val),
                          );
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        sx={{
                          fontSize: 11,
                          height: 22,
                          bgcolor: "#EDE9FE",
                          color: "#5B21B6",
                          "& .MuiChip-deleteIcon": {
                            color: "#7C3AED",
                            fontSize: 14,
                          },
                        }}
                      />
                    ))}
                  </Box>
                );
              }}
              sx={{
                borderRadius: "8px",
                "& .MuiSelect-select": { minHeight: "36px !important" },
              }}
              MenuProps={{ PaperProps: { sx: { maxHeight: 220 } } }}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.name} sx={{ py: 0.5 }}>
                  <Checkbox
                    checked={form.contactOwners.includes(user.name)}
                    size="small"
                    sx={{
                      p: 0.5,
                      color: "#6366F1",
                      "&.Mui-checked": { color: "#6366F1" },
                    }}
                  />
                  <ListItemText
                    primary={user.name}
                    slotProps={{
                      primary: { style: { fontSize: 13 } },
                    }}
                  />
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Lead Status */}
          <Box>
            <FieldLabel>Lead Status</FieldLabel>
            <Select
              fullWidth
              size="small"
              displayEmpty
              value={form.leadStatus}
              onChange={(e) => handleChange("leadStatus", e.target.value)}
              IconComponent={KeyboardArrowDownIcon}
              renderValue={(val) =>
                val ? val : <span style={{ color: "#9CA3AF" }}>Choose</span>
              }
              sx={{ borderRadius: "8px" }}
            >
              {LEAD_STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      {/* ── Actions ── */}
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={handleClose}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            borderColor: "#D1D5DB",
            color: "#374151",
            fontWeight: 500,
            "&:hover": { borderColor: "#9CA3AF", bgcolor: "#F9FAFB" },
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={handleSave}
          sx={{
            textTransform: "none",
            borderRadius: "8px",
            bgcolor: "#6366F1",
            fontWeight: 500,
            "&:hover": { bgcolor: "#4F46E5" },
            boxShadow: "none",
          }}
        >
          {/* Save */}
          {isEdit ? "Update" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
