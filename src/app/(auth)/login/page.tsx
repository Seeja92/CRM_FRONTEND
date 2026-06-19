"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Link,
  Alert,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { setCredentials } from '@/store/slices/authSlice';
import { useSelector } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/store/hooks"; // Modified to match your hook structural configuration
import { loginUser } from "@/store/slices/authSlice";

export default function LoginPage() {
  const router    = useRouter();
  const dispatch  = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
 

  const validate = () => {
    if (!email) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Enter a valid email address.";
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");
  

    const validationError = validate();
    if (validationError) {
      setLocalError(validationError);
      return;
    }
const resultAction = await dispatch(loginUser({ email, password }));

if (loginUser.fulfilled.match(resultAction)) {
  const data = resultAction.payload;
  console.log("LOGIN RESPONSE:", data);

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);

  localStorage.setItem(
    "user",
    JSON.stringify({
      id: data.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      role: data.role,
    })
  );
const user = JSON.parse(localStorage.getItem("user") || "{}");

console.log(user.role);
  document.cookie = `access=${data.access}; path=/; max-age=${
    60 * 60 * 24
  }; SameSite=Strict`;

  setSuccess("Login successful! Redirecting...");
  setTimeout(() => router.push("/dashboard"), 1000);
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
const displayedError = localError || error;
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
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 480,
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
            Log in
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "#1a1a2e", mb: 0.75 }}
            >
              Email
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              sx={{ mb: 2.5, ...fieldSx }}
            />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.75,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "#1a1a2e" }}
              >
                Password
              </Typography>
              <Link
                component={NextLink}
                href="/forgot-password"
                underline="none"
                sx={{
                  fontSize: 13,
                  color: "#6c63ff",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot password?
              </Link>
            </Box>
            <TextField
              fullWidth
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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
              sx={{ mb: 3, ...fieldSx }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                backgroundColor: "#6c63ff",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: 15,
                py: 1.4,
                boxShadow: "none",
                "&:hover": { backgroundColor: "#574fd6", boxShadow: "none" },
                "&.Mui-disabled": { backgroundColor: "#b0abff", color: "#fff" },
              }}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="body2" sx={{ color: "#555" }}>
        Don&apos;t have an account?{" "}
        <Link
          component={NextLink}
          href="/register"
          underline="none"
          sx={{
            color: "#6c63ff",
            fontWeight: 500,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Sign up
        </Link>
      </Typography>
    </Box>
  );
}
