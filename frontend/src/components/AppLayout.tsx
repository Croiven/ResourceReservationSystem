import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import type { ReactNode } from 'react';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export function AppLayout({ children, maxWidth = 'md' }: AppLayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppHeader />
      <Container maxWidth={maxWidth} sx={{ flex: 1, py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
