"use client";

import { Box, Button, Popover, Typography } from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";

type Props = {
  value: Dayjs | null;
  onChange: (date: Dayjs | null) => void;
  onApply?: () => void;
  onClear?: () => void;
};

export default function CreatedDateFilter({
  value,
  onChange,
  onApply,
  onClear,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        endIcon={<CalendarToday sx={{ fontSize: 14 }} />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          borderRadius: 1.5,
          textTransform: "none",
          fontSize: 13,
          borderColor: value ? "#6c63ff" : "#E5E7EB",
          color: value ? "#6c63ff" : "#6B7280",
          backgroundColor: "#fff",
        }}
      >
        {value ? value.format("MM/DD/YYYY") : "Created Date"}
      </Button>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box sx={{ p: 2, minWidth: 280, display: "flex", flexDirection: "column", gap: 2 }}>
            
            <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
              Filter by Created Date
            </Typography>

            <DatePicker
              value={value}
              onChange={(newValue) => onChange(newValue)}
              slotProps={{
                textField: { size: "small", fullWidth: true },
              }}
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={() => {
                  onChange(null);
                  onClear?.();
                  setAnchorEl(null);
                }}
              >
                Clear
              </Button>

              <Button
                fullWidth
                size="small"
                variant="contained"
                onClick={() => {
                  onApply?.();
                  setAnchorEl(null);
                }}
                sx={{ backgroundColor: "#6c63ff" }}
              >
                Apply
              </Button>
            </Box>

          </Box>
        </LocalizationProvider>
      </Popover>
    </>
  );
}