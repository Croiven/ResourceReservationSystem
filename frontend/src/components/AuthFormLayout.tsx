import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

interface AuthFormLayoutProps {
  title: string;
  subtitle?: string;
  error?: string | null;
  success?: string | null;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthFormLayout({
  title,
  subtitle,
  error,
  success,
  children,
  footer,
}: AuthFormLayoutProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Paper elevation={2} sx={{ p: 4, width: '100%', maxWidth: 440 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {subtitle}
          </Typography>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        {children}
        {footer && <Box sx={{ mt: 2 }}>{footer}</Box>}
      </Paper>
    </Box>
  );
}
