'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

export default function MuiRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      {children}
    </AppRouterCacheProvider>
  );
}