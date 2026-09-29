import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { theme } from './theme/theme';

vi.mock('./pages/HomePage', () => ({ HomePage: () => <div>Home page</div> }));
vi.mock('./pages/ResourcesPage', () => ({ ResourcesPage: () => <div>Resources page</div> }));
vi.mock('./pages/ResourceDetailPage', () => ({
  ResourceDetailPage: () => <div>Resource detail page</div>,
}));
vi.mock('./pages/LoginPage', () => ({ LoginPage: () => <div>Login page</div> }));
vi.mock('./pages/RegisterPage', () => ({ RegisterPage: () => <div>Register page</div> }));
vi.mock('./pages/ProfilePage', () => ({ ProfilePage: () => <div>Profile page</div> }));
vi.mock('./pages/ReservationsPage', () => ({
  ReservationsPage: () => <div>Reservations page</div>,
}));
vi.mock('./pages/ReservationDetailPage', () => ({
  ReservationDetailPage: () => <div>Reservation detail page</div>,
}));
vi.mock('./pages/AdminResourcesPage', () => ({
  AdminResourcesPage: () => <div>Admin resources page</div>,
}));
vi.mock('./pages/AdminUsersPage', () => ({ AdminUsersPage: () => <div>Admin users page</div> }));
vi.mock('./pages/AdminReservationsPage', () => ({
  AdminReservationsPage: () => <div>Admin reservations page</div>,
}));
vi.mock('./pages/AdminReservationDetailPage', () => ({
  AdminReservationDetailPage: () => <div>Admin reservation detail page</div>,
}));

function renderApp(initialPath = '/') {
  window.history.pushState({}, '', initialPath);
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>,
  );
}

describe('App', () => {
  it('renders home route by default', () => {
    renderApp('/');
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('renders resources route', () => {
    renderApp('/resources');
    expect(screen.getByText('Resources page')).toBeInTheDocument();
  });

  it('renders login route for guests', async () => {
    renderApp('/login');
    expect(await screen.findByText('Login page')).toBeInTheDocument();
  });
});
