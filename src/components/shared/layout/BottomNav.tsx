'use client';

import React from 'react';
import {
  Box,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
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

const BottomNav = () => {
  const pathname = usePathname();
  const router = useRouter();

  const currentIndex = menuItems.findIndex(
    (item) => item.path === pathname
  );

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: '1px solid #E5E7EB',
        }}
        elevation={3}
      >
        <BottomNavigation
          value={currentIndex}
          sx={{
            backgroundColor: '#FFFFFF',
            height: '70px',
          }}
        >
          {menuItems.map((item, index) => (
            <BottomNavigationAction
              key={item.label}
              label={item.label}
              icon={item.icon}
              showLabel={true}
              onClick={() => router.push(item.path)}
              sx={{
                color: '#6B7280',
                minWidth: 'auto',
                padding: '6px 0',
                // Label always visible
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '10px',
                  opacity: 1,
                  fontWeight: currentIndex === index ? 600 : 400,
                },
                // Active color
                '&.Mui-selected': {
                  color: '#5B4FCF',
                },
                '& .MuiBottomNavigationAction-label.Mui-selected': {
                  fontSize: '10px',
                  color: '#5B4FCF',
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default BottomNav;