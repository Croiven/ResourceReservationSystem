import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../types/api';
import { theme } from '../theme/theme';
import { ResourceFormDialog } from './ResourceFormDialog';

vi.mock('../services/resourceApi', () => ({
  createResource: vi.fn(),
  updateResource: vi.fn(),
}));

vi.mock('../services/tokenStorage', () => ({
  getTokens: vi.fn(() => ({ accessToken: 'token', refreshToken: 'refresh' })),
}));

import * as resourceApi from '../services/resourceApi';
import { getTokens } from '../services/tokenStorage';

describe('ResourceFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTokens).mockReturnValue({ accessToken: 'token', refreshToken: 'refresh' });
  });
  it('renders create resource form', () => {
    render(
      <ThemeProvider theme={theme}>
        <ResourceFormDialog open onClose={vi.fn()} onSuccess={vi.fn()} />
      </ThemeProvider>,
    );

    expect(screen.getByText('Add resource')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('renders edit resource form with existing values', () => {
    render(
      <ThemeProvider theme={theme}>
        <ResourceFormDialog
          open
          resource={{
            id: 'resource-1',
            name: 'Room A',
            description: 'Desc',
            type: 'ROOM',
            isActive: true,
            createdAt: '',
            updatedAt: '',
          }}
          onClose={vi.fn()}
          onSuccess={vi.fn()}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText('Edit resource')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Room A')).toBeInTheDocument();
  });

  it('validates required name on create', async () => {
    render(
      <ThemeProvider theme={theme}>
        <ResourceFormDialog open onClose={vi.fn()} onSuccess={vi.fn()} />
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /create resource/i }));

    expect(await screen.findByText('Name is required.')).toBeInTheDocument();
    expect(resourceApi.createResource).not.toHaveBeenCalled();
  });

  it('creates resource and calls onSuccess', async () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const created = {
      id: 'resource-new',
      name: 'New room',
      description: 'Notes',
      type: 'ROOM' as const,
      isActive: true,
      createdAt: '',
      updatedAt: '',
    };
    vi.mocked(resourceApi.createResource).mockResolvedValue(created);

    render(
      <ThemeProvider theme={theme}>
        <ResourceFormDialog open onClose={onClose} onSuccess={onSuccess} />
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'New room' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Notes' } });
    fireEvent.click(screen.getByRole('button', { name: /create resource/i }));

    await waitFor(() => {
      expect(resourceApi.createResource).toHaveBeenCalled();
    });

    expect(onSuccess).toHaveBeenCalledWith(created);
    expect(onClose).toHaveBeenCalled();
  });

  it('updates resource on edit', async () => {
    const onSuccess = vi.fn();
    const updated = {
      id: 'resource-1',
      name: 'Room B',
      description: null,
      type: 'ROOM' as const,
      isActive: false,
      createdAt: '',
      updatedAt: '',
    };
    vi.mocked(resourceApi.updateResource).mockResolvedValue(updated);

    render(
      <ThemeProvider theme={theme}>
        <ResourceFormDialog
          open
          resource={{
            id: 'resource-1',
            name: 'Room A',
            description: 'Desc',
            type: 'ROOM',
            isActive: true,
            createdAt: '',
            updatedAt: '',
          }}
          onClose={vi.fn()}
          onSuccess={onSuccess}
        />
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Room B' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => {
      expect(resourceApi.updateResource).toHaveBeenCalledWith(
        'resource-1',
        expect.objectContaining({ name: 'Room B', isActive: true }),
        'token',
      );
    });

    expect(onSuccess).toHaveBeenCalledWith(updated);
  });

  it('shows API error on save failure', async () => {
    vi.mocked(resourceApi.createResource).mockRejectedValue(new ApiError('Duplicate name', 409));

    render(
      <ThemeProvider theme={theme}>
        <ResourceFormDialog open onClose={vi.fn()} onSuccess={vi.fn()} />
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Room' } });
    fireEvent.click(screen.getByRole('button', { name: /create resource/i }));

    expect(await screen.findByText('Duplicate name')).toBeInTheDocument();
  });
});
