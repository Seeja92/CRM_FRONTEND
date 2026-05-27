
// import Header from "@/components/shared/layout/TopNav";
// import { Box } from "@mui/material";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <Box sx={{ display: "flex", flexDirection: "column", background: "#f5f7fb", minHeight: "100vh" }}>
//       <Header />

//       <Box sx={{ display: "flex", flexGrow: 1 }}>
//         {/* Sidebar placeholder - swap with <Sidebar /> when ready */}
//         <Box sx={{ width: 240, flexShrink: 0 }} />

//         {/* Page content */}
//         <Box sx={{ flexGrow: 1, p: 2 }}>
//           {children}
//         </Box>
//       </Box>
//     </Box>
//   );
// }

import React from 'react';
import DashboardLayout from '@/components/shared/layout/DashboardLayout';

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  );
};

export default Layout;