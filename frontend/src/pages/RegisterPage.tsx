import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { type FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { AuthFormLayout } from '../components/AuthFormLayout';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../types/api';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (password.length < 8) {
      errors['password'] = 'Password must be at least 8 characters';
    }
    if (password !== confirmPassword) {
      errors['confirmPassword'] = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ email, password, firstName, lastName });
      void navigate('/login', {
        state: { message: 'Registration successful. Please sign in.' },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details) {
          const details: Record<string, string> = {};
          for (const detail of err.details) {
            details[detail.field] = detail.message;
          }
          setFieldErrors(details);
        }
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
        title="Create account"
        subtitle="Register as a user to make reservations."
        error={error}
        footer={
          <Typography variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        }
      >
        <form onSubmit={(e) => void handleSubmit(e)}>
          <Stack spacing={2}>
            <TextField
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              autoComplete="email"
              error={Boolean(fieldErrors['email'])}
              helperText={fieldErrors['email']}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              autoComplete="new-password"
              error={Boolean(fieldErrors['password'])}
              helperText={fieldErrors['password']}
            />
            <TextField
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              autoComplete="new-password"
              error={Boolean(fieldErrors['confirmPassword'])}
              helperText={fieldErrors['confirmPassword']}
            />
            <Button type="submit" variant="contained" disabled={isSubmitting} fullWidth>
              {isSubmitting ? 'Creating account...' : 'Register'}
            </Button>
          </Stack>
        </form>
      </AuthFormLayout>
    </AppLayout>
  );
}
