import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import { ResourcesPage } from './ResourcesPage';

vi.mock('../services/resourceApi', () => ({
  listResources: vi.fn(),
}));

import * as resourceApi from '../services/resourceApi';

const mockResources = [
  {
    id: 'resource-1',
    name: 'Conference Room A',
    description: 'Large meeting room',
    type: 'ROOM' as const,
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('ResourcesPage', () => {
  it('renders resource list', async () => {
    vi.mocked(resourceApi.listResources).mockResolvedValue(mockResources);

    renderWithProviders(<ResourcesPage />);

    expect(await screen.findByText('Conference Room A')).toBeInTheDocument();
    expect(resourceApi.listResources).toHaveBeenCalledWith({ active: 'true' });
  });

  it('shows empty message when no resources match', async () => {
    vi.mocked(resourceApi.listResources).mockResolvedValue([]);

    renderWithProviders(<ResourcesPage />);

    expect(await screen.findByText(/no resources match your filters/i)).toBeInTheDocument();
  });

  it('refetches when type filter changes', async () => {
    vi.mocked(resourceApi.listResources).mockResolvedValue(mockResources);

    renderWithProviders(<ResourcesPage />);
    await screen.findByText('Conference Room A');

    fireEvent.mouseDown(screen.getByLabelText(/^type$/i));
    fireEvent.click(screen.getByRole('option', { name: 'Room' }));

    await waitFor(() => {
      expect(resourceApi.listResources).toHaveBeenCalledWith({
        active: 'true',
        type: 'ROOM',
      });
    });
  });
});
