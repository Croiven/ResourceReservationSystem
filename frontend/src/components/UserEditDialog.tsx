import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import * as userApi from '../services/userApi';
import { getTokens } from '../services/tokenStorage';
import type { UpdateUserInput, User, UserRole } from '../types/user';
import { ApiError } from '../types/api';
import { getUserRoleLabel } from '../utils/userLabels';

interface UserEditDialogProps {
  open: boolean;
  user: User;
  isSelf: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export function UserEditDialog({ open, user, isSelf, onClose, onSuccess }: UserEditDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('USER');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAdminOpen, setConfirmAdminOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setRole(user.role);
      setIsActive(user.isActive);
      setError(null);
      setConfirmAdminOpen(false);
    }
  }, [open, user]);

  const submitUpdate = async () => {
    setError(null);

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    if (!trimmedFirstName || !trimmedLastName) {
      setError('First and last name are required.');
      return;
    }

    const tokens = getTokens();
    if (!tokens?.accessToken) {
      setError('You must be signed in to manage users.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data: UpdateUserInput = {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
      };

      if (!isSelf) {
        data.role = role;
        data.isActive = isActive;
      }

      const updated = await userApi.updateUser(user.id, data, tokens.accessToken);
      onSuccess(updated);
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to update user. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (!isSelf && role === 'ADMIN' && user.role !== 'ADMIN') {
      setConfirmAdminOpen(true);
      return;
    }
    void submitUpdate();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit user</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="First name"
              value={firstName}
              onChange={(event) => {
                setFirstName(event.target.value);
              }}
              fullWidth
              required
            />
            <TextField
              label="Last name"
              value={lastName}
              onChange={(event) => {
                setLastName(event.target.value);
              }}
              fullWidth
              required
            />
            {!isSelf && (
              <>
                <FormControl fullWidth>
                  <InputLabel id="user-role-label">Role</InputLabel>
                  <Select
                    labelId="user-role-label"
                    label="Role"
                    value={role}
                    onChange={(event) => {
                      setRole(event.target.value);
                    }}
                  >
                    <MenuItem value="USER">{getUserRoleLabel('USER')}</MenuItem>
                    <MenuItem value="ADMIN">{getUserRoleLabel('ADMIN')}</MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isActive}
                      onChange={(event) => {
                        setIsActive(event.target.checked);
                      }}
                    />
                  }
                  label="Active"
                />
              </>
            )}
            {isSelf && (
              <Typography variant="body2" color="text.secondary">
                You cannot change your own role or deactivate your account.
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : 'Save changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmAdminOpen} onClose={() => setConfirmAdminOpen(false)}>
        <DialogTitle>Promote to admin?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {user.firstName} {user.lastName} will be able to manage resources, users, and all
            reservations. Continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAdminOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmAdminOpen(false);
              void submitUpdate();
            }}
            variant="contained"
            disabled={isSubmitting}
          >
            Promote to admin
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
