import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../types/api';
import { renderWithProviders } from '../test/renderWithProviders';
import { RegisterPage } from './RegisterPage';

const navigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => navigate,
  };
});

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../hooks/useAuth';

describe('RegisterPage', () => {
  it('shows validation error when passwords do not match', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      changePassword: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'different' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it('registers successfully and navigates to login', async () => {
    const register = vi.fn().mockResolvedValue(undefined);
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register,
      logout: vi.fn(),
      changePassword: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
        firstName: 'User',
        lastName: 'Test',
      });
    });

    expect(navigate).toHaveBeenCalledWith('/login', {
      state: { message: 'Registration successful. Please sign in.' },
    });
  });

  it('shows API validation errors from register', async () => {
    const register = vi
      .fn()
      .mockRejectedValue(
        new ApiError('Validation failed', 400, [{ field: 'email', message: 'Invalid email' }]),
      );
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register,
      logout: vi.fn(),
      changePassword: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithProviders(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText('Validation failed')).toBeInTheDocument();
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });
});
