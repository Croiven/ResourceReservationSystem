import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface NavLink {
  label: string;
  to: string;
}

const PUBLIC_LINKS: NavLink[] = [
  { label: 'Home', to: '/' },
  { label: 'Resources', to: '/resources' },
];

const USER_LINKS: NavLink[] = [{ label: 'My reservations', to: '/reservations' }];

const ADMIN_LINKS: NavLink[] = [
  { label: 'Manage resources', to: '/admin/resources' },
  { label: 'Manage users', to: '/admin/users' },
  { label: 'All reservations', to: '/admin/reservations' },
];

function NavButton({ label, to }: NavLink) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(`${to}/`));

  return (
    <Button
      color="inherit"
      component={RouterLink}
      to={to}
      sx={{
        fontWeight: isActive ? 600 : 400,
        opacity: isActive ? 1 : 0.92,
      }}
    >
      {label}
    </Button>
  );
}

export function AppHeader() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminAnchor, setAdminAnchor] = useState<null | HTMLElement>(null);
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    setAccountAnchor(null);
    setMobileOpen(false);
    void logout();
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const renderMobileDrawer = () => (
    <Drawer
      anchor="right"
      open={mobileOpen}
      onClose={closeMobile}
      ModalProps={{ keepMounted: true }}
    >
      <Box sx={{ width: 280, display: 'flex', flexDirection: 'column', height: '100%' }} role="presentation">
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Menu
          </Typography>
          <IconButton aria-label="Close menu" onClick={closeMobile}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider />
        <List dense>
          {PUBLIC_LINKS.map((link) => (
            <ListItemButton key={link.to} component={RouterLink} to={link.to} onClick={closeMobile}>
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
          {isAuthenticated &&
            USER_LINKS.map((link) => (
              <ListItemButton key={link.to} component={RouterLink} to={link.to} onClick={closeMobile}>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
        </List>
        {isAuthenticated && user?.role === 'ADMIN' && (
          <>
            <Divider />
            <Typography variant="overline" sx={{ px: 2, pt: 1, color: 'text.secondary' }}>
              Admin
            </Typography>
            <List dense>
              {ADMIN_LINKS.map((link) => (
                <ListItemButton key={link.to} component={RouterLink} to={link.to} onClick={closeMobile}>
                  <ListItemText primary={link.label} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        {isAuthenticated ? (
          <List dense>
            <ListItemButton component={RouterLink} to="/profile" onClick={closeMobile}>
              <ListItemText primary="Profile" secondary={`${user?.firstName} ${user?.lastName}`} />
            </ListItemButton>
            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        ) : (
          <List dense>
            <ListItemButton component={RouterLink} to="/login" onClick={closeMobile}>
              <ListItemText primary="Login" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/register" onClick={closeMobile}>
              <ListItemText primary="Register" />
            </ListItemButton>
          </List>
        )}
      </Box>
    </Drawer>
  );

  return (
    <AppBar position="static">
      <Toolbar sx={{ gap: 1 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          noWrap
          sx={{
            flexGrow: 1,
            minWidth: 0,
            color: 'inherit',
            textDecoration: 'none',
            fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
          }}
        >
          <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
            Reservations
          </Box>
          <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
            Resource Reservation System
          </Box>
        </Typography>

        {isMobile ? (
          <>
            <IconButton color="inherit" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
              <MenuIcon />
            </IconButton>
            {renderMobileDrawer()}
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {PUBLIC_LINKS.map((link) => (
              <NavButton key={link.to} {...link} />
            ))}
            {isAuthenticated ? (
              <>
                {USER_LINKS.map((link) => (
                  <NavButton key={link.to} {...link} />
                ))}
                {user?.role === 'ADMIN' && (
                  <>
                    <Button
                      color="inherit"
                      startIcon={<AdminPanelSettingsIcon />}
                      onClick={(event) => {
                        setAdminAnchor(event.currentTarget);
                      }}
                      aria-label="Open admin menu"
                      aria-haspopup="true"
                      aria-controls={adminAnchor ? 'admin-nav-menu' : undefined}
                      aria-expanded={adminAnchor ? 'true' : undefined}
                    >
                      Admin
                    </Button>
                    <Menu
                      id="admin-nav-menu"
                      anchorEl={adminAnchor}
                      open={Boolean(adminAnchor)}
                      onClose={() => {
                        setAdminAnchor(null);
                      }}
                    >
                      {ADMIN_LINKS.map((link) => (
                        <MenuItem
                          key={link.to}
                          component={RouterLink}
                          to={link.to}
                          onClick={() => {
                            setAdminAnchor(null);
                          }}
                        >
                          {link.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </>
                )}
                <Button
                  color="inherit"
                  startIcon={<PersonIcon />}
                  onClick={(event) => {
                    setAccountAnchor(event.currentTarget);
                  }}
                  aria-haspopup="true"
                  aria-controls={accountAnchor ? 'account-nav-menu' : undefined}
                  aria-expanded={accountAnchor ? 'true' : undefined}
                >
                  {user?.firstName}
                </Button>
                <Menu
                  id="account-nav-menu"
                  anchorEl={accountAnchor}
                  open={Boolean(accountAnchor)}
                  onClose={() => {
                    setAccountAnchor(null);
                  }}
                >
                  <MenuItem disabled sx={{ opacity: '1 !important', color: 'text.secondary' }}>
                    {user?.firstName} {user?.lastName}
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    component={RouterLink}
                    to="/profile"
                    onClick={() => {
                      setAccountAnchor(null);
                    }}
                  >
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
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
        )}
      </Toolbar>
    </AppBar>
  );
}
