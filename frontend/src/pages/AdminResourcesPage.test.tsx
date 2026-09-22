import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/renderWithProviders';
import { AdminResourcesPage } from './AdminResourcesPage';

vi.mock('../services/resourceApi', () => ({
  listResources: vi.fn(),
  createResource: vi.fn(),
  updateResource: vi.fn(),
  deactivateResource: vi.fn(),
}));

import * as resourceApi from '../services/resourceApi';

describe('AdminResourcesPage', () => {
  it('renders manage resources list', async () => {
    vi.mocked(resourceApi.listResources).mockResolvedValue([
      {
        id: 'resource-1',
        name: 'Conference Room A',
        description: 'Large room',
        type: 'ROOM',
        isActive: true,
        createdAt: '',
        updatedAt: '',
      },
    ]);

    renderWithProviders(<AdminResourcesPage />);

    expect(await screen.findByText('Manage resources')).toBeInTheDocument();
    expect(screen.getByText('Conference Room A')).toBeInTheDocument();
  });
});
