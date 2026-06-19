"use client";

import { useState,useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  MenuItem,
  Select,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Grid from "@mui/material/Grid2";
import NextLink from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

const industryOptions = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Other",
];


interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  industryType: string;
  countryOrRegion: string;
  role: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  companyName?: string;
  industryType?: string;
  countryOrRegion?: string;
  role?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [adminExists, setAdminExists] = useState(false); 
  const { loading, error: apiError } = useSelector((state: any) => state.auth);
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    industryType: "",
    countryOrRegion: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
 
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  useEffect(() => {
  const checkAdmin = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin-exists/`
      );
      const data = await res.json();
      setAdminExists(data.admin_exists);
    } catch (err) {
      console.log("Failed to check admin");
    }
  };

  checkAdmin();
}, []);


const roleOptions = [
  { value: "Admin", disabled: adminExists },
  { value: "User", disabled: false },
];

  const handleChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address.";
    }
    if (!form.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
    } else if (!/^\+?[\d\s\-]{7,15}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = "Enter a valid phone number.";
    }
    if (!form.companyName.trim())
      newErrors.companyName = "Company name is required.";
    if (!form.industryType)
      newErrors.industryType = "Please select an industry type.";
    if (!form.countryOrRegion.trim())
      newErrors.countryOrRegion = "Country or region is required.";
    if (!form.role) newErrors.role = "Please select a role.";
    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase and number.";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setApiError("");
    setSuccess("");
    if (!validate()) return;

 
try{
  const resultAction = await dispatch(registerUser( 
    {
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone_number: form.phoneNumber,
        company_name: form.companyName,
        industry_type: form.industryType,
        country_or_region: form.countryOrRegion,
        role: form.role,
        password: form.password,
        confirm_password: form.confirmPassword,
      }
  )as any).unwrap();
   console.log("REGISTER SUCCESS:", resultAction);

    
    setSuccess("Registration successful! Redirecting to login...");

    setTimeout(() => router.push("/login"), 1500);
  }catch (err: any) {
  console.log("REGISTER ERROR:", err);
}
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      backgroundColor: "#fff",
      "& fieldset": { borderColor: "#e0e0e0" },
      "&:hover fieldset": { borderColor: "#b0b0b0" },
      "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
    },
    "& input::placeholder": { color: "#b0b0b0", opacity: 1 },
  };

  const labelSx = { fontWeight: 500, color: "#1a1a2e", mb: 0.75 };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 3,
        px: 2,
        py: 4,
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 620,
          borderRadius: 3,
          border: "1px solid #e8e8e8",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: 700, color: "#1a1a2e", mb: 3 }}
          >
            Register
          </Typography>

          {apiError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {apiError}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2.5}>
              {/* First Name */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelSx}>
                  First Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your first name"
                  value={form.firstName}
                  onChange={handleChange("firstName")}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  sx={fieldSx}
                />
              </Grid>

              {/* Last Name */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelSx}>
                  Last Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your last name"
                  value={form.lastName}
                  onChange={handleChange("lastName")}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  sx={fieldSx}
                />
              </Grid>

              {/* Email */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelSx}>
                  Email
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  autoComplete="off"
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={fieldSx}
                />
              </Grid>

              {/* Phone Number */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelSx}>
                  Phone Number
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your phone number"
                  value={form.phoneNumber}
                  onChange={handleChange("phoneNumber")}
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber}
                  sx={fieldSx}
                />
              </Grid>

              {/* Company Name */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelSx}>
                  Company Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your company name"
                  value={form.companyName}
                  onChange={handleChange("companyName")}
                  error={!!errors.companyName}
                  helperText={errors.companyName}
                  sx={fieldSx}
                />
              </Grid>

              {/* Industry Type */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelSx}>
                  Industry Type
                </Typography>
                <FormControl fullWidth error={!!errors.industryType}>
                  <Select
                    value={form.industryType}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        industryType: e.target.value,
                      }));
                      setErrors((prev) => ({ ...prev, industryType: "" }));
                    }}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                      backgroundColor: "#fff",
                      "& fieldset": { borderColor: "#e0e0e0" },
                      "&:hover fieldset": { borderColor: "#b0b0b0" },
                      "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
                      color: form.industryType ? "#1a1a2e" : "#b0b0b0",
                    }}
                  >
                    <MenuItem value="" disabled>
                      <span style={{ color: "#b0b0b0" }}>Choose</span>
                    </MenuItem>
                    {industryOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>
                        {opt}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.industryType && (
                    <FormHelperText>{errors.industryType}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Country or Region */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelSx}>
                  Country or Region
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your country or region"
                  value={form.countryOrRegion}
                  onChange={handleChange("countryOrRegion")}
                  error={!!errors.countryOrRegion}
                  helperText={errors.countryOrRegion}
                  sx={fieldSx}
                />
              </Grid>

              {/* Role */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelSx}>
                  Role
                </Typography>
                <FormControl fullWidth error={!!errors.role}>
                 <Select
  value={form.role}
  onChange={(e) => {
    setForm((prev) => ({ ...prev, role: e.target.value }));
    setErrors((prev) => ({ ...prev, role: "" }));
  }}
  displayEmpty
>
  <MenuItem value="" disabled>
    Select role
  </MenuItem>

  <MenuItem value="Admin" disabled={adminExists}>
    Admin
  </MenuItem>

  <MenuItem value="User">
    User
  </MenuItem>
</Select>
                  
                  {errors.role && (
                    <FormHelperText>{errors.role}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              {/* Password */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelSx}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange("password")}
                  autoComplete="new-password"
                  error={!!errors.password}
                  helperText={errors.password}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            size="small"
                            sx={{ color: "#b0b0b0" }}
                          >
                            {showPassword ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={fieldSx}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="body2" sx={labelSx}>
                  Confirm Password
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Confirm your password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            edge="end"
                            size="small"
                            sx={{ color: "#b0b0b0" }}
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={fieldSx}
                />
              </Grid>

              {/* Register Button */}
              <Grid size={{ xs: 12 }}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 0.5,
                    backgroundColor: "#6c63ff",
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: 15,
                    py: 1.4,
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: "#574fd6",
                      boxShadow: "none",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "#b0abff",
                      color: "#fff",
                    },
                  }}
                >
                  {loading ? "Registering..." : "Register"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="body2" sx={{ color: "#555" }}>
        Already have an account?{" "}
        <Link
          component={NextLink}
          href="/login"
          underline="none"
          sx={{
            color: "#6c63ff",
            fontWeight: 500,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Login
        </Link>
      </Typography>
    </Box>
  );
}
