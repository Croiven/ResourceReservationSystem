import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../hooks/useAuth';

export function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <AppLayout>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h4" component="h1">
              Welcome
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Browse resources, view availability, and make reservations. Sign in to manage your
              bookings or register a new account.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              <Button variant="contained" component={RouterLink} to="/resources">
                Browse resources
              </Button>
              {isAuthenticated ? (
                <>
                  <Button variant="outlined" component={RouterLink} to="/reservations">
                    My reservations
                  </Button>
                  <Button variant="outlined" component={RouterLink} to="/profile">
                    View profile
                  </Button>
                  {user?.role === 'ADMIN' && (
                    <>
                      <Button variant="outlined" component={RouterLink} to="/admin/resources">
                        Manage resources
                      </Button>
                      <Button variant="outlined" component={RouterLink} to="/admin/users">
                        Manage users
                      </Button>
                      <Button variant="outlined" component={RouterLink} to="/admin/reservations">
                        All reservations
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Button variant="contained" component={RouterLink} to="/login">
                    Sign in
                  </Button>
                  <Button variant="outlined" component={RouterLink} to="/register">
                    Register
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
