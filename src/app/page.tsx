
"use client";

import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>

      {/* ── Navbar ── */}
      <Box sx={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        px: { xs: 3, md: 6 }, py: 2, bgcolor: "white",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)"
      }}>
        {/* Logo */}
        <Typography sx={{ fontWeight: 800, fontSize: 22, color: "#6c63ff" }}>
          CRM
        </Typography>

        {/* Right Buttons */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => router.push("/login")}
            sx={{
              textTransform: "none", borderRadius: 2,
              borderColor: "#6c63ff", color: "#6c63ff",
              fontWeight: 600,
              "&:hover": { bgcolor: "#f3f0ff" }
            }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            onClick={() => router.push("/register")}
            sx={{
              textTransform: "none", borderRadius: 2,
              bgcolor: "#6c63ff", fontWeight: 600,
              "&:hover": { bgcolor: "#5a52d5" }
            }}
          >
            Register
          </Button>
        </Box>
      </Box>

      {/* ── Hero Section ── */}
      <Box sx={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", minHeight: "80vh",
        px: { xs: 3, md: 6 }
      }}>
        <Typography sx={{
          fontSize: { xs: 32, md: 52 },
          fontWeight: 800, color: "#1a1a2e", lineHeight: 1.2, mb: 2
        }}>
          Manage Your Customers
          <br />
          <span style={{ color: "#6c63ff" }}>Smarter & Faster</span>
        </Typography>

        <Typography sx={{
          fontSize: { xs: 15, md: 18 }, color: "#666",
          maxWidth: 520, mb: 4, lineHeight: 1.8
        }}>
          A powerful CRM platform to track leads, manage deals,
          and grow your business — all in one place.
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={() => router.push("/register")}
            sx={{
              textTransform: "none", borderRadius: 2,
              bgcolor: "#6c63ff", fontWeight: 600,
              px: 4, py: 1.5, fontSize: 16,
              "&:hover": { bgcolor: "#5a52d5" }
            }}
          >
            Get Started Free
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push("/login")}
            sx={{
              textTransform: "none", borderRadius: 2,
              borderColor: "#6c63ff", color: "#6c63ff",
              fontWeight: 600, px: 4, py: 1.5, fontSize: 16,
              "&:hover": { bgcolor: "#f3f0ff" }
            }}
          >
            Login
          </Button>
        </Box>
      </Box>

    </Box>
  );
}
