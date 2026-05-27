"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Avatar,
  InputBase,
  Collapse,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Badge,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LogoutIcon from "@mui/icons-material/Logout";

// ── Redux Imports ────────────────────────────────────────────────────────────
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import {
  fetchNotifications,
  markNotificationsAsRead,
  clearUnreadCountLocal,
  resetNotifications,
  clearAllNotifications,
} from "@/store/slices/notificationsSlice";

export default function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // UI Control States
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const notificationOpen = Boolean(notificationAnchor);

  // Search States
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any>({
    leads: [],
    deals: [],
    companies: [],
  });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // ── Grab Auth & Notification Data from Redux Store ────────────────────────
  const { token, firstName, lastName, email } = useAppSelector((state) => state.auth);
  const { items: notifications, unreadCount } = useAppSelector((state) => state.notifications);

  const isLoggedIn = Boolean(token);
  const fullName = `${firstName || ""} ${lastName || ""}`.trim() || email || "User";
  const initials = firstName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "U";

  // ── Notification Polling every 30s ────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) return;

    dispatch(fetchNotifications());

    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000);

    return () => clearInterval(interval);
  }, [isLoggedIn, dispatch]);

  // ── Close Search Dropdown on Outside Click ────────────────────────────────
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Debounced Global Search ───────────────────────────────────────────────
  useEffect(() => {
    if (search.trim().length <= 1 || !isLoggedIn) {
      setSearchResults({ leads: [], deals: [], companies: [] });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/search/global/?q=${encodeURIComponent(search)}`,
          { headers: { Authorization: `Token ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowSearchDropdown(true);
        }
      } catch (err) {
        console.error("Global search request failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [search, isLoggedIn, token]);

  // ── Action Handlers ───────────────────────────────────────────────────────
  const handleOpenNotificationMenu = (e: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchor(e.currentTarget);
    dispatch(clearUnreadCountLocal());
    dispatch(markNotificationsAsRead());
  };

  // ── Fixed: removed fetchNotifications after clear ─────────────────────────
  const handleClearAll = () => {
    dispatch(clearAllNotifications());
    setNotificationAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(resetNotifications());
    } catch (err) {
      console.error("Logout request error:", err);
    } finally {
      document.cookie = "token=; path=/; max-age=0; SameSite=Strict";
      setAnchorEl(null);
      router.push("/login");
    }
  };

  const handleNotificationClick = (item: any) => {
    const typeRoutes: Record<string, string> = {
      lead: "leads",
      deal: "deals",
      company: "companies",
      ticket: "tickets",
      system: "dashboard",
    };

    const routeType =
      item.notification_type === "delete" ? "system" : item.notification_type;
    const route = typeRoutes[routeType] ?? "leads";

    if (item.related_id && item.notification_type !== "delete") {
      router.push(`/${route}/${item.related_id}`);
    } else {
      router.push(`/${route}`);
    }
    setNotificationAnchor(null);
  };

  return (
    <AppBar
      position="static"
      sx={{ background: "white", color: "black" }}
      elevation={0}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {/* LEFT BRAND */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            sx={{ fontWeight: "bold", fontSize: { xs: "14px", sm: "16px", md: "18px" } }}
          >
            CRM
          </Typography>
        </Box>

        {/* RIGHT CONTROL BAR */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 2 } }}>

          {/* Desktop Global Search */}
          <Box
            ref={searchContainerRef}
            sx={{
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              bgcolor: "#f1f3f6",
              px: 2,
              borderRadius: 2,
              position: "relative",
            }}
          >
            <SearchIcon sx={{ fontSize: { sm: "18px", md: "20px" }, color: "gray" }} />
            <InputBase
              placeholder="Search leads, deals, companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
              disabled={!isLoggedIn}
              sx={{
                fontSize: { sm: "13px", md: "15px" },
                width: { sm: "150px", md: "250px" },
                ml: 1,
              }}
            />

            {/* Search Dropdown */}
            {showSearchDropdown && search.trim().length > 1 && isLoggedIn && (
              <Paper
                elevation={3}
                sx={{
                  position: "absolute",
                  top: "120%",
                  left: 0,
                  width: 320,
                  maxHeight: 400,
                  overflowY: "auto",
                  borderRadius: 2,
                  zIndex: 9999,
                  p: 1,
                }}
              >
                {searchLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                    <CircularProgress size={22} />
                  </Box>
                ) : (
                  <>
                    {/* Leads */}
                    {searchResults.leads?.length > 0 && (
                      <>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#888", px: 1, py: 0.5 }}>
                          Leads
                        </Typography>
                        {searchResults.leads.map((lead: any) => (
                          <Box
                            key={lead.id}
                            onClick={() => {
                              router.push(`/leads/${lead.id}`);
                              setShowSearchDropdown(false);
                              setSearch("");
                            }}
                            sx={{ px: 1.5, py: 1, borderRadius: 1, cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                          >
                            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{lead.name}</Typography>
                            <Typography sx={{ fontSize: 11, color: "#888" }}>{lead.email}</Typography>
                          </Box>
                        ))}
                      </>
                    )}

                    {/* Deals */}
                    {searchResults.deals?.length > 0 && (
                      <>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#888", px: 1, py: 0.5, mt: 1 }}>
                          Deals
                        </Typography>
                        {searchResults.deals.map((deal: any) => (
                          <Box
                            key={deal.id}
                            onClick={() => {
                              router.push(`/deals/${deal.id}`);
                              setShowSearchDropdown(false);
                              setSearch("");
                            }}
                            sx={{ px: 1.5, py: 1, borderRadius: 1, cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                          >
                            <Typography sx={{ fontSize: 13 }}>{deal.name}</Typography>
                          </Box>
                        ))}
                      </>
                    )}

                    {/* Companies */}
                    {searchResults.companies?.length > 0 && (
                      <>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#888", px: 1, py: 0.5, mt: 1 }}>
                          Companies
                        </Typography>
                        {searchResults.companies.map((company: any) => (
                          <Box
                            key={company.id}
                            onClick={() => {
                              router.push(`/companies/${company.id}`);
                              setShowSearchDropdown(false);
                              setSearch("");
                            }}
                            sx={{ px: 1.5, py: 1, borderRadius: 1, cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                          >
                            <Typography sx={{ fontSize: 13 }}>{company.name}</Typography>
                          </Box>
                        ))}
                      </>
                    )}

                    {/* Empty state */}
                    {!searchResults.leads?.length &&
                      !searchResults.deals?.length &&
                      !searchResults.companies?.length && (
                        <Typography sx={{ textAlign: "center", py: 2, color: "#888", fontSize: 13 }}>
                          No results found
                        </Typography>
                      )}
                  </>
                )}
              </Paper>
            )}
          </Box>

          {/* Mobile Search Icon */}
          <IconButton
            sx={{ display: { xs: "flex", sm: "none" } }}
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            disabled={!isLoggedIn}
          >
            {mobileSearchOpen ? <CloseIcon /> : <SearchIcon />}
          </IconButton>

          {/* Notification Bell */}
          <IconButton
            size="small"
            disabled={!isLoggedIn}
            onClick={handleOpenNotificationMenu}
          >
            <Badge badgeContent={unreadCount} color="error" overlap="circular">
              <NotificationsNoneIcon sx={{ fontSize: { xs: "20px", md: "24px" } }} />
            </Badge>
          </IconButton>

          {/* Notification Dropdown */}
          <Menu
            anchorEl={notificationAnchor}
            open={notificationOpen}
            onClose={() => setNotificationAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            PaperProps={{
              sx: {
                mt: 1,
                width: 340,
                maxHeight: 420,
                borderRadius: 2,
                overflowY: "auto",
              },
            }}
          >
            {/* Notification Header */}
            <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                Notifications
              </Typography>
              {notifications.length > 0 && (
                <Typography
                  onClick={handleClearAll}
                  sx={{
                    fontSize: 12,
                    color: "#e53935",
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  Clear all
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Notification List */}
            {notifications.length === 0 ? (
              <Typography sx={{ p: 2, fontSize: 13, color: "#888", textAlign: "center" }}>
                No notifications
              </Typography>
            ) : (
              notifications.map((item) => (
                <MenuItem
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  sx={{
                    py: 1.5,
                    alignItems: "flex-start",
                    whiteSpace: "normal",
                    backgroundColor: item.is_read ? "transparent" : "#faf9ff",
                    "&:hover": { backgroundColor: "#f3f1ff" },
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#888", mt: 0.3 }}>
                      {item.message}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: "#aaa", mt: 0.5 }}>
                      {new Date(item.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>

          {/* Avatar */}
          <Avatar
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              bgcolor: isLoggedIn ? "#6c63ff" : "#b0bec5",
              width: { xs: 30, sm: 35, md: 40 },
              height: { xs: 30, sm: 35, md: 40 },
              fontSize: { xs: "14px", md: "16px" },
              cursor: "pointer",
              "&:hover": { bgcolor: isLoggedIn ? "#574fd6" : "#90a4ae" },
            }}
          >
            {isLoggedIn ? initials : <PersonOutlineIcon sx={{ fontSize: { xs: 18, md: 22 } }} />}
          </Avatar>

          {/* Profile Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              elevation: 0,
              sx: {
                mt: 1,
                minWidth: 220,
                borderRadius: 2,
                border: "1px solid #e8e8e8",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                "& .MuiMenuItem-root": { fontSize: 13, py: 1, borderRadius: 1, mx: 0.5 },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  sx={{
                    bgcolor: isLoggedIn ? "#6c63ff" : "#b0bec5",
                    width: 40,
                    height: 40,
                    fontSize: 16,
                  }}
                >
                  {isLoggedIn ? initials : <PersonOutlineIcon />}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>
                    {fullName}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#888" }}>
                    {email || "Not signed in"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            {isLoggedIn ? [
              <MenuItem
                key="profile-name"
                disabled
                sx={{ color: "#444", gap: 1.5, "&.Mui-disabled": { opacity: 1 } }}
              >
                <ListItemIcon sx={{ minWidth: "unset" }}>
                  <PersonOutlineIcon sx={{ fontSize: 18, color: "#6c63ff" }} />
                </ListItemIcon>
                <Box>
                  <Typography sx={{ fontSize: 11, color: "#999" }}>Name</Typography>
                  <Typography sx={{ fontSize: 13, color: "#1a1a2e", fontWeight: 500 }}>
                    {fullName}
                  </Typography>
                </Box>
              </MenuItem>,

              <MenuItem
                key="profile-email"
                disabled
                sx={{ color: "#444", gap: 1.5, "&.Mui-disabled": { opacity: 1 } }}
              >
                <ListItemIcon sx={{ minWidth: "unset" }}>
                  <EmailOutlinedIcon sx={{ fontSize: 18, color: "#6c63ff" }} />
                </ListItemIcon>
                <Box>
                  <Typography sx={{ fontSize: 11, color: "#999" }}>Email</Typography>
                  <Typography sx={{ fontSize: 13, color: "#1a1a2e", fontWeight: 500 }}>
                    {email}
                  </Typography>
                </Box>
              </MenuItem>,

              <Divider key="profile-divider" sx={{ my: 0.5 }} />,

              <MenuItem
                key="profile-logout"
                onClick={handleLogout}
                sx={{ color: "#e53935", gap: 1.5, "&:hover": { backgroundColor: "#fef2f2" } }}
              >
                <ListItemIcon sx={{ minWidth: "unset" }}>
                  <LogoutIcon sx={{ fontSize: 18, color: "#e53935" }} />
                </ListItemIcon>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Logout</Typography>
              </MenuItem>,
            ] : (
              <MenuItem
                onClick={() => { setAnchorEl(null); router.push("/login"); }}
                sx={{ color: "#6c63ff", gap: 1.5, "&:hover": { backgroundColor: "#f3f1ff" } }}
              >
                <ListItemIcon sx={{ minWidth: "unset" }}>
                  <PersonOutlineIcon sx={{ fontSize: 18, color: "#6c63ff" }} />
                </ListItemIcon>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>Sign In</Typography>
              </MenuItem>
            )}
          </Menu>
        </Box>
      </Toolbar>

      {/* Mobile Search Bar */}
      <Collapse in={mobileSearchOpen && isLoggedIn}>
        <Box
          sx={{
            display: { xs: "flex", sm: "none" },
            alignItems: "center",
            bgcolor: "#f1f3f6",
            mx: 2,
            mb: 1,
            px: 2,
            borderRadius: 2,
          }}
        >
          <SearchIcon sx={{ fontSize: "18px", color: "gray" }} />
          <InputBase
            placeholder="Search..."
            fullWidth
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ fontSize: "14px", ml: 1 }}
          />
        </Box>
      </Collapse>
    </AppBar>
  );
}