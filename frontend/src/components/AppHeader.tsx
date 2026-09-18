import LogoutIcon from '@mui/icons-material/Logout';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function AppHeader() {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    void logout();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
        >
          Resource Reservation System
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button color="inherit" component={RouterLink} to="/">
            Home
          </Button>
          <Button color="inherit" component={RouterLink} to="/resources">
            Resources
          </Button>
          {isAuthenticated ? (
            <>
              <Button color="inherit" component={RouterLink} to="/profile">
                Profile
              </Button>
              <Typography variant="body2" sx={{ mx: 1 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
