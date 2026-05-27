'use client';

import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Typography,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { usePathname, useRouter } from 'next/navigation';

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Leads', icon: <PeopleIcon />, path: '/leads' },
  { label: 'Companies', icon: <BusinessIcon />, path: '/companies' },
  { label: 'Deals', icon: <HandshakeIcon />, path: '/deals' },
  { label: 'Tickets', icon: <ConfirmationNumberIcon />, path: '/tickets' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Box
      sx={{
        width: 80,
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        display: { xs: 'none', md: 'flex' }, // ✅ only once
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '16px',
        borderRight: '1px solid #E5E7EB',
      }}
    >
      <List sx={{ width: '100%', padding: 0 }}>
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);

          return (
            <ListItem
              key={item.label}
              disablePadding
              sx={{ mb: 1 }}
            >
              <ListItemButton
                onClick={() => router.push(item.path)}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 0',
                  borderRadius: '12px',
                  margin: '0 8px',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 'unset',
                    backgroundColor: isActive ? '#5B4FCF' : 'transparent',
                    borderRadius: '50%',
                    padding: '8px',
                    color: isActive ? '#FFFFFF' : '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 0.5,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <Typography
                  sx={{
                    fontSize: '11px',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#5B4FCF' : '#6B7280',
                  }}
                >
                  {item.label}
                </Typography>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar;