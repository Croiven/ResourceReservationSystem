import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../types/api';

export function ProfilePage() {
  const { user, changePassword } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return null;
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (newPassword.length < 8) {
      errors['newPassword'] = 'Password must be at least 8 characters';
    }
    if (newPassword !== confirmPassword) {
      errors['confirmPassword'] = 'Passwords do not match';
    }
    if (newPassword === currentPassword) {
      errors['newPassword'] = 'New password must differ from current password';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({ currentPassword, newPassword });
      setSuccess('Password changed successfully. Please sign in again.');
      setTimeout(() => {
        void navigate('/login', {
          state: { message: 'Password changed. Please sign in with your new password.' },
        });
      }, 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to change password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout maxWidth="md">
      <Stack spacing={3}>
        <Card>
          <CardHeader title={`${user.firstName} ${user.lastName}`} subheader="Account details" />
          <CardContent>
            <List>
              <ListItem disablePadding>
                <ListItemText primary="Email" secondary={user.email} />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText primary="Role" secondary={user.role} />
              </ListItem>
              <ListItem disablePadding>
                <ListItemText
                  primary="Member since"
                  secondary={new Date(user.createdAt).toLocaleDateString()}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Change password" />
          <CardContent>
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
            <form onSubmit={(e) => void handleSubmit(e)}>
              <Stack spacing={2}>
                <TextField
                  label="Current password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  fullWidth
                  autoComplete="current-password"
                />
                <TextField
                  label="New password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  fullWidth
                  autoComplete="new-password"
                  error={Boolean(fieldErrors['newPassword'])}
                  helperText={fieldErrors['newPassword']}
                />
                <TextField
                  label="Confirm new password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  fullWidth
                  autoComplete="new-password"
                  error={Boolean(fieldErrors['confirmPassword'])}
                  helperText={fieldErrors['confirmPassword']}
                />
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update password'}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Stack>
    </AppLayout>
  );
}
