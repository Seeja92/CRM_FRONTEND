'use client';

import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopNav from './TopNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  topNav?: React.ReactNode;
}

const DashboardLayout = ({ children, topNav }: DashboardLayoutProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f0effe',
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* TopNav */}
        {topNav ? <Box>{topNav}</Box> : <TopNav />}

        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            padding: { xs: '16px', md: '24px' },
            paddingBottom: { xs: '80px', md: '24px' },
          }}
        >
          {/* White content card */}
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: 3,
              border: '1px solid #e8e8e8',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              p: 3,
              minHeight: 'calc(100vh - 120px)',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>

      {/* Bottom Nav - mobile only */}
      <BottomNav />
    </Box>
  );
};

export default DashboardLayout;