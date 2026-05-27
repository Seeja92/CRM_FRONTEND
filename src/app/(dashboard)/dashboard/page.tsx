"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/index";
import {
  fetchStats,
  fetchConversion,
  fetchSales,
  fetchTeamPerformance,
} from "@/store/slices/dashboardSlice";

import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  MenuItem,
  Select,
  Chip,
  Skeleton,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Payload } from "recharts/types/component/DefaultTooltipContent";
import PeopleIcon from "@mui/icons-material/People";
import WorkIcon from "@mui/icons-material/Work";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RefreshIcon from "@mui/icons-material/Refresh";

// ─────────────────────────────────────────────────────────────────
// TYPES & HELPER STRUCTS
// ─────────────────────────────────────────────────────────────────
interface DashboardStats {
  total_leads: number;
  active_deals: number;
  closed_deals: number;
  monthly_revenue: number;
  total_companies: number;
}

interface TeamMember {
  name: string;
  active_deals: number;
  closed_deals: number;
  revenue: string;
  change: string;
  positive: boolean;
}

type SalesPeriod = "Monthly" | "Yearly";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Payload<number, string>[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        p: "8px 12px",
        fontSize: 13,
      }}
    >
      <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ color: "#5b4fcf" }}>
        ${Number(payload[0].value).toLocaleString()}
      </Typography>
    </Box>
  );
};

function exportTeamCSV(data: TeamMember[]): void {
  const csv = [
    "Employee,Active Deals,Closed Deals,Revenue,Change",
    ...data.map(
      (r) =>
        `${r.name},${r.active_deals},${r.closed_deals},${r.revenue},${r.change}`,
    ),
  ].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  a.download = "team-performance.csv";
  a.click();
}

function buildStatCards(stats: DashboardStats | null) {
  return [
    {
      title: "Total Leads",
      value: stats?.total_leads.toLocaleString() ?? "—",
      bg: "#EDE9FF",
      icon: <PeopleIcon sx={{ fontSize: 36, color: "#5b4fcf" }} />,
    },
    {
      title: "Active Deals",
      value: stats?.active_deals.toLocaleString() ?? "—",
      bg: "#E6FAF5",
      icon: <WorkIcon sx={{ fontSize: 36, color: "#10B981" }} />,
    },
    {
      title: "Closed Deals",
      value: stats?.closed_deals.toLocaleString() ?? "—",
      bg: "#FFE9E9",
      icon: <AssignmentIcon sx={{ fontSize: 36, color: "#EF4444" }} />,
    },
    {
      title: "Monthly Revenue",
      value: stats ? `$${Number(stats.monthly_revenue).toLocaleString()}` : "—",
      bg: "#FFF8E6",
      icon: <MonetizationOnIcon sx={{ fontSize: 36, color: "#F59E0B" }} />,
    },
  ];
}

// ─────────────────────────────────────────────────────────────────
// SKELETONS & ALERTS
// ─────────────────────────────────────────────────────────────────
const StatCardSkeleton = () => (
  <Box
    sx={{
      p: 2,
      border: "1px solid #E5E7EB",
      borderRadius: "12px",
      backgroundColor: "#fff",
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Skeleton width="55%" height={18} sx={{ mb: 1 }} />
        <Skeleton width="40%" height={42} />
      </Box>
      <Skeleton variant="circular" width={64} height={64} />
    </Box>
  </Box>
);

const ConversionSkeleton = () => (
  <Box>
    {Array.from({ length: 6 }).map((_, i) => (
      <Box key={i} sx={{ mb: 2 }}>
        <Skeleton width="50%" height={16} sx={{ mb: 0.5 }} />
        <Skeleton width="100%" height={8} sx={{ borderRadius: 4 }} />
      </Box>
    ))}
  </Box>
);

const ChartSkeleton = () => (
  <Box
    sx={{ display: "flex", alignItems: "flex-end", gap: 1, height: 250, pt: 2 }}
  >
    {Array.from({ length: 12 }).map((_, i) => (
      <Skeleton
        key={i}
        variant="rectangular"
        width="100%"
        height={`${25 + ((i * 17 + 30) % 65)}%`}
        sx={{ borderRadius: "4px 4px 0 0", flex: 1 }}
      />
    ))}
  </Box>
);

const TableRowsSkeleton = () => (
  <>
    {Array.from({ length: 4 }).map((_, i) => (
      <TableRow key={i}>
        <TableCell>
          <Skeleton width={120} />
        </TableCell>
        <TableCell>
          <Skeleton width={40} />
        </TableCell>
        <TableCell>
          <Skeleton width={40} />
        </TableCell>
        <TableCell align="right">
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Skeleton width={70} />
            <Skeleton width={50} />
          </Box>
        </TableCell>
      </TableRow>
    ))}
  </>
);

const ErrorBanner = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <Alert
    severity="error"
    action={
      <Button
        color="inherit"
        size="small"
        onClick={onRetry}
        startIcon={<RefreshIcon />}
      >
        Retry
      </Button>
    }
    sx={{ mb: 2, borderRadius: "8px" }}
  >
    Failed to load: {message}
  </Alert>
);

// ─────────────────────────────────────────────────────────────────
// PRIMARY PAGE CONTAINER
// ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>("Monthly");

  // Hooking data pools directly from the centralized Redux global slice layout
  const { stats, conversion, sales, teamPerformance, loading, errors } =
    useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchStats());
    dispatch(fetchConversion());
    dispatch(fetchTeamPerformance());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchSales(salesPeriod));
  }, [dispatch, salesPeriod]);

  const statCards = buildStatCards(stats);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* ── Stat Cards ─────────────────────────────────────────── */}
      {errors.stats && (
        <ErrorBanner
          message={errors.stats}
          onRetry={() => dispatch(fetchStats())}
        />
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr 1fr", // Balanced 4 columns
          },
          gap: 3,
          mb: 3,
        }}
      >
        {loading.stats
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : statCards.map((card) => (
              <Card
                key={card.title}
                elevation={0}
                sx={{
                  borderRadius: "12px",
                  border: "1px solid #E5E7EB",
                  backgroundColor: "#fff",
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{ color: "text.secondary", fontSize: 14, mb: 1 }}
                      >
                        {card.title}
                      </Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: 30 }}>
                        {card.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: card.bg,
                        borderRadius: "50%",
                        width: 64,
                        height: 64,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
      </Box>

      {/* ── Conversion + Sales Reports Grid ───────────────────── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Contact to Deal Conversion */}
        <Card
          elevation={0}
          sx={{
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            backgroundColor: "#fff",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 3 }}>
              Contact to Deal Conversion
            </Typography>
            {errors.conversion && (
              <ErrorBanner
                message={errors.conversion}
                onRetry={() => dispatch(fetchConversion())}
              />
            )}
            {loading.conversion ? (
              <ConversionSkeleton />
            ) : (
              conversion.map(
                (item: { label: string; value: number; color: string }) => (
                  <Box key={item.label} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                        {item.label}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.value}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "#E5E7EB",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: item.color,
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                ),
              )
            )}
          </CardContent>
        </Card>

        {/* Sales Reports Chart Container */}
        <Card
          elevation={0}
          sx={{
            borderRadius: "12px",
            border: "1px solid #E5E7EB",
            backgroundColor: "#fff",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                Sales Reports
              </Typography>
              <Select<SalesPeriod>
                value={salesPeriod}
                onChange={(e: SelectChangeEvent<SalesPeriod>) =>
                  setSalesPeriod(e.target.value as SalesPeriod)
                }
                size="small"
                sx={{
                  fontSize: 13,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e0e0e0",
                  },
                }}
              >
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Yearly">Yearly</MenuItem>
              </Select>
            </Box>
            {errors.sales && (
              <ErrorBanner
                message={errors.sales}
                onRetry={() => dispatch(fetchSales(salesPeriod))}
              />
            )}
            {loading.sales ? (
              <ChartSkeleton />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={sales}
                  barSize={20}
                  margin={{ top: 20, right: 10, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#c4bef8" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#7e67c4" stopOpacity={1} />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    domain={[0, "auto"]}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: any) => `$${Number(v).toLocaleString()}`} // Casted safely to any to bypass Recharts union types
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(91,79,207,0.05)" }}
                  />

                  <Bar
                    dataKey="value"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    background={{ fill: "rgba(91, 79, 207, 0.05)", radius: 6 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* ── Team Performance ───────────────────────────────────── */}
      <Card
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: "1px solid #E5E7EB",
          backgroundColor: "#fff",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
              Team Performance Tracking
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                disabled={teamPerformance.length === 0}
                onClick={() =>
                  teamPerformance.length > 0 && exportTeamCSV(teamPerformance)
                }
                sx={{
                  borderColor: "#5b4fcf",
                  color: "#5b4fcf",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "#4a3eb8",
                    backgroundColor: "#f5f3ff",
                  },
                }}
              >
                Export CSV
              </Button>
            </Box>
          </Box>

          {errors.team && (
            <ErrorBanner
              message={errors.team}
              onRetry={() => dispatch(fetchTeamPerformance())}
            />
          )}

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#F9FAFB" }}>
                  {(
                    [
                      "Employee",
                      "Active Deals",
                      "Closed Deals",
                      "Revenue",
                    ] as const
                  ).map((col, i) => (
                    <TableCell
                      key={col}
                      align={i === 3 ? "right" : "left"}
                      sx={{ fontWeight: 600, color: "#6B7280", fontSize: 13 }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading.team ? (
                  <TableRowsSkeleton />
                ) : (
                  teamPerformance.map((row, index) => (
                    <TableRow
                      key={`${row.name}-${index}`}
                      sx={{
                        "&:hover": { backgroundColor: "#F9FAFB" },
                        "&:last-child td": { border: 0 },
                      }}
                    >
                      <TableCell sx={{ fontSize: 14, fontWeight: 500 }}>
                        {row.name}
                      </TableCell>
                      <TableCell sx={{ fontSize: 14 }}>
                        {row.active_deals}
                      </TableCell>
                      <TableCell sx={{ fontSize: 14 }}>
                        {row.closed_deals}
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                            {row.revenue}
                          </Typography>
                          <Chip
                            label={row.change}
                            size="small"
                            sx={{
                              fontSize: 11,
                              fontWeight: 700,
                              height: 22,
                              color: row.positive ? "#16a34a" : "#dc2626",
                              backgroundColor: row.positive
                                ? "#f0fdf4"
                                : "#fef2f2",
                            }}
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
