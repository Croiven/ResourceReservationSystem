import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { type FormEvent, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { AuthFormLayout } from '../components/AuthFormLayout';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../types/api';

interface LocationState {
  message?: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as LocationState | null)?.message ?? null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      void navigate('/profile');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to connect. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout maxWidth="sm">
      <AuthFormLayout
        title="Sign in"
        subtitle="Access your account to manage reservations."
        error={error}
        success={successMessage}
        footer={
          <Typography variant="body2">
            Don&apos;t have an account?{' '}
            <Link component={RouterLink} to="/register">
              Register
            </Link>
          </Typography>
        }
      >
        <form onSubmit={(e) => void handleSubmit(e)}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="current-password"
            />
            <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </Stack>
        </form>
      </AuthFormLayout>
    </AppLayout>
  );
}
