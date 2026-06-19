"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
} from "@mui/material";
import NextLink from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { passwordReset } from "@/store/slices/authSlice";

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState("");
  // const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setSuccess("");

    if (!email.trim()) {
      setLocalError("Email is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError("Enter a valid email address.");
      return;
    }


const resultAction = await dispatch(passwordReset({ email }));
if (passwordReset.fulfilled.match(resultAction)) {
      setSuccess("Password reset link has been sent to your email.");
      setEmail("");
    }
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
            sx={{ fontWeight: 700, color: "#1a1a2e", mb: 1 }}
          >
            Forgot Password
          </Typography>
          <Typography
            variant="body2"
            align="center"
            sx={{ color: "#888", mb: 3 }}
          >
            Enter the email address associated with your account.
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
              Registered Email
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter your registered email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  "& fieldset": { borderColor: "#e0e0e0" },
                  "&:hover fieldset": { borderColor: "#b0b0b0" },
                  "&.Mui-focused fieldset": { borderColor: "#6c63ff" },
                },
                "& input::placeholder": { color: "#b0b0b0", opacity: 1 },
              }}
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
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="body2" sx={{ color: "#555" }}>
        Remember your password?{" "}
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
          Back to Login
        </Link>
      </Typography>
    </Box>
  );
}
