import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupsIcon from '@mui/icons-material/Groups';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { useAuth } from '../hooks/useAuth';

interface HomeNavCardProps {
  to: string;
  title: string;
  description: string;
  icon: ReactNode;
  emphasized?: boolean;
}

function HomeNavCard({ to, title, description, icon, emphasized = false }: HomeNavCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        borderColor: emphasized ? 'primary.main' : 'divider',
        bgcolor: emphasized ? 'action.hover' : 'background.paper',
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={to}
        sx={{
          height: '100%',
          p: 2.5,
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
        }}
      >
        <Stack spacing={1.5} sx={{ width: '100%' }}>
          <Box sx={{ color: emphasized ? 'primary.main' : 'text.secondary', display: 'flex' }}>
            {icon}
          </Box>
          <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

function NavGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}

export function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AppLayout maxWidth="lg">
      <Stack spacing={4}>
        <Stack spacing={1} sx={{ maxWidth: 640 }}>
          <Typography variant="h4" component="h1">
            {isAuthenticated ? `Welcome back, ${user?.firstName}` : 'Welcome'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isAuthenticated
              ? 'Pick up where you left off—browse resources, check your bookings, or manage the system.'
              : 'Browse resources, view availability, and make reservations. Create an account to book and manage your reservations.'}
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
            Explore
          </Typography>
          <NavGrid>
            <HomeNavCard
              to="/resources"
              title="Browse resources"
              description="Search rooms, equipment, and vehicles. View availability before you book."
              icon={<Inventory2Icon fontSize="large" />}
              emphasized
            />
            {isAuthenticated && (
              <HomeNavCard
                to="/reservations"
                title="My reservations"
                description="See upcoming and past bookings. Reschedule or cancel when allowed."
                icon={<EventAvailableIcon fontSize="large" />}
              />
            )}
          </NavGrid>
        </Stack>

        {isAuthenticated ? (
          <Stack spacing={2}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
              Account
            </Typography>
            <NavGrid>
              <HomeNavCard
                to="/profile"
                title="Profile"
                description="View your account details and change your password."
                icon={<PersonIcon fontSize="large" />}
              />
            </NavGrid>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
              Get started
            </Typography>
            <NavGrid>
              <HomeNavCard
                to="/login"
                title="Sign in"
                description="Access your reservations and book resources with your account."
                icon={<LoginIcon fontSize="large" />}
                emphasized
              />
              <HomeNavCard
                to="/register"
                title="Create account"
                description="Register for free to make and manage your own reservations."
                icon={<PersonAddIcon fontSize="large" />}
              />
            </NavGrid>
          </Stack>
        )}

        {isAdmin && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <AdminPanelSettingsIcon color="primary" fontSize="small" />
              <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                Administration
              </Typography>
            </Stack>
            <NavGrid>
              <HomeNavCard
                to="/admin/resources"
                title="Manage resources"
                description="Add, edit, and deactivate bookable resources."
                icon={<Inventory2Icon fontSize="large" />}
              />
              <HomeNavCard
                to="/admin/users"
                title="Manage users"
                description="Update roles, names, and account status."
                icon={<GroupsIcon fontSize="large" />}
              />
              <HomeNavCard
                to="/admin/reservations"
                title="All reservations"
                description="View and manage bookings across every user and resource."
                icon={<CalendarMonthIcon fontSize="large" />}
              />
            </NavGrid>
          </Stack>
        )}
      </Stack>
    </AppLayout>
  );
}
