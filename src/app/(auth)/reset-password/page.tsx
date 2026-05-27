"use client";

import { useState, Suspense } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { useSearchParams, useRouter } from "next/navigation";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      console.log("TOKEN:", token);
      console.log("PASSWORD:", password);
      const res = await fetch(
         `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/password-reset/confirm/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        },
      );

      const data = await res.json();

      console.log("RESET RESPONSE:", data);

      if (!res.ok) {
        const errorMessage =
          data.password?.[0] ||
          data.token?.[0] ||
          data.detail ||
          "Reset failed.";

        setError(errorMessage);

        return;
      }

      setSuccess("Password reset successful! Redirecting to login...");
      localStorage.clear();
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
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
            Reset Password
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
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75 }}>
              New Password
            </Typography>
            <TextField
              fullWidth
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2.5, ...fieldSx }}
            />

            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.75 }}>
              Confirm Password
            </Typography>
            <TextField
              fullWidth
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
