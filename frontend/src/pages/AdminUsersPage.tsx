import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { UserEditDialog } from '../components/UserEditDialog';
import { useAuth } from '../hooks/useAuth';
import * as userApi from '../services/userApi';
import { getTokens } from '../services/tokenStorage';
import type { User } from '../types/user';
import { ApiError } from '../types/api';
import { getUserRoleChipColor, getUserRoleLabel } from '../utils/userLabels';

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deactivateUser, setDeactivateUser] = useState<User | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const loadUsers = useCallback(async () => {
    const tokens = getTokens();
    if (!tokens?.accessToken) {
      setError('You must be signed in to manage users.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await userApi.listUsers(tokens.accessToken);
      setUsers(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to load users. Please try again.');
      }
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleDeactivateConfirm = async () => {
    if (!deactivateUser) return;

    const tokens = getTokens();
    if (!tokens?.accessToken) return;

    setIsDeactivating(true);
    try {
      await userApi.deactivateUser(deactivateUser.id, tokens.accessToken);
      setDeactivateUser(null);
      await loadUsers();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to deactivate user. Please try again.');
      }
    } finally {
      setIsDeactivating(false);
    }
  };

  const isSelf = (user: User) => user.id === currentUser?.id;

  return (
    <AppLayout maxWidth="lg">
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Manage users
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : users.length === 0 ? (
          <Typography color="text.secondary">No users found.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      {user.firstName} {user.lastName}
                      {isSelf(user) && (
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          (you)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={getUserRoleLabel(user.role)}
                        color={getUserRoleChipColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                        variant={user.isActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          onClick={() => {
                            setEditUser(user);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          disabled={!user.isActive || isSelf(user)}
                          onClick={() => {
                            setDeactivateUser(user);
                          }}
                        >
                          Deactivate
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      {editUser && (
        <UserEditDialog
          open
          user={editUser}
          isSelf={isSelf(editUser)}
          onClose={() => {
            setEditUser(null);
          }}
          onSuccess={() => {
            void loadUsers();
          }}
        />
      )}

      <Dialog open={deactivateUser !== null} onClose={() => setDeactivateUser(null)}>
        <DialogTitle>Deactivate user?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deactivateUser?.firstName} {deactivateUser?.lastName} will no longer be able to sign
            in. Existing reservations are not affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateUser(null)} disabled={isDeactivating}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleDeactivateConfirm()}
            color="error"
            disabled={isDeactivating}
          >
            {isDeactivating ? 'Deactivating…' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
