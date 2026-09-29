import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import { AdminResourcesPage } from './AdminResourcesPage';

vi.mock('../services/resourceApi', () => ({
  listResources: vi.fn(),
  createResource: vi.fn(),
  updateResource: vi.fn(),
  deactivateResource: vi.fn(),
}));

vi.mock('../services/tokenStorage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/tokenStorage')>();
  return {
    ...actual,
    getTokens: vi.fn(() => ({ accessToken: 'token-123', refreshToken: 'refresh-123' })),
  };
});

import * as resourceApi from '../services/resourceApi';

const resourceRow = {
  id: 'resource-1',
  name: 'Conference Room A',
  description: 'Large room',
  type: 'ROOM' as const,
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

describe('AdminResourcesPage', () => {
  it('renders manage resources list', async () => {
    vi.mocked(resourceApi.listResources).mockResolvedValue([resourceRow]);

    renderWithProviders(<AdminResourcesPage />);

    expect(await screen.findByText('Manage resources')).toBeInTheDocument();
    expect(screen.getByText('Conference Room A')).toBeInTheDocument();
  });

  it('opens add resource dialog', async () => {
    vi.mocked(resourceApi.listResources).mockResolvedValue([resourceRow]);

    renderWithProviders(<AdminResourcesPage />);

    await screen.findByText('Conference Room A');
    fireEvent.click(screen.getByRole('button', { name: /add resource/i }));

    expect(screen.getByRole('heading', { name: /add resource/i })).toBeInTheDocument();
  });

  it('deactivates resource after confirmation', async () => {
    vi.mocked(resourceApi.listResources).mockResolvedValue([resourceRow]);
    vi.mocked(resourceApi.deactivateResource).mockResolvedValue({
      ...resourceRow,
      isActive: false,
    });

    renderWithProviders(<AdminResourcesPage />);

    await screen.findByText('Conference Room A');
    fireEvent.click(screen.getByRole('button', { name: /^deactivate$/i }));

    expect(screen.getByRole('heading', { name: /deactivate resource/i })).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole('button', { name: /^deactivate$/i });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]!);

    await waitFor(() => {
      expect(resourceApi.deactivateResource).toHaveBeenCalledWith('resource-1', 'token-123');
    });
  });

  it('opens edit dialog with existing resource', async () => {
    vi.mocked(resourceApi.listResources).mockResolvedValue([resourceRow]);

    renderWithProviders(<AdminResourcesPage />);

    await screen.findByText('Conference Room A');
    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

    expect(screen.getByRole('heading', { name: /edit resource/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Conference Room A')).toBeInTheDocument();
  });

  it('reactivates inactive resource', async () => {
    const inactive = { ...resourceRow, isActive: false };
    vi.mocked(resourceApi.listResources).mockResolvedValue([inactive]);
    vi.mocked(resourceApi.updateResource).mockResolvedValue({ ...inactive, isActive: true });

    renderWithProviders(<AdminResourcesPage />);

    await screen.findByText('Conference Room A');
    fireEvent.click(screen.getByRole('button', { name: /reactivate/i }));

    await waitFor(() => {
      expect(resourceApi.updateResource).toHaveBeenCalledWith(
        'resource-1',
        { isActive: true },
        'token-123',
      );
    });
  });
});
