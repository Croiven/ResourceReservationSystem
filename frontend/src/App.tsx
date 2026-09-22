import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { GuestRoute } from './components/GuestRoute';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminReservationDetailPage } from './pages/AdminReservationDetailPage';
import { AdminReservationsPage } from './pages/AdminReservationsPage';
import { AdminResourcesPage } from './pages/AdminResourcesPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { ReservationDetailPage } from './pages/ReservationDetailPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { ResourceDetailPage } from './pages/ResourceDetailPage';
import { ResourcesPage } from './pages/ResourcesPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/resources/:id" element={<ResourceDetailPage />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations"
          element={
            <ProtectedRoute>
              <ReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations/:id"
          element={
            <ProtectedRoute>
              <ReservationDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/resources"
          element={
            <AdminRoute>
              <AdminResourcesPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reservations"
          element={
            <AdminRoute>
              <AdminReservationsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reservations/:id"
          element={
            <AdminRoute>
              <AdminReservationDetailPage />
            </AdminRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
