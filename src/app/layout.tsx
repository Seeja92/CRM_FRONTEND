import type { Metadata } from 'next';
import MuiRegistry from '@/lib/theme/MuiRegistry';
import ReduxProvider from '@/store/Provider';

export const metadata: Metadata = {
  title: 'CRM App',
  description: 'CRM Frontend',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ReduxProvider>
          <MuiRegistry>
            {children}
          </MuiRegistry>
        </ReduxProvider>
      </body>
    </html>
  );
}