import { ResourceType, UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

vi.mock('../services/resource.service.js', () => ({
  resourceService: {
    listResources: vi.fn(),
    getResource: vi.fn(),
    createResource: vi.fn(),
    updateResource: vi.fn(),
    deactivateResource: vi.fn(),
    getResourceBookings: vi.fn(),
    checkAvailability: vi.fn(),
  },
}));

vi.mock('../middleware/auth.middleware.js', () => ({
  authenticate: (req: { user?: unknown }, _res: unknown, next: () => void) => {
    req.user = { id: 'admin-1', email: 'admin@example.com', role: UserRole.ADMIN };
    next();
  },
}));

import { resourceService } from '../services/resource.service.js';

const resourceFixture = {
  id: 'resource-1',
  name: 'Room A',
  description: null,
  type: ResourceType.ROOM,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Resource routes', () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/resources lists resources', async () => {
    vi.mocked(resourceService.listResources).mockResolvedValue([resourceFixture]);

    const response = await request(app).get('/api/resources').expect(200);

    expect(response.body.data).toHaveLength(1);
  });

  it('GET /api/resources/:id returns a resource', async () => {
    vi.mocked(resourceService.getResource).mockResolvedValue(resourceFixture);

    const response = await request(app).get('/api/resources/resource-1').expect(200);

    expect(response.body.data.id).toBe('resource-1');
  });

  it('POST /api/resources creates a resource for admins', async () => {
    vi.mocked(resourceService.createResource).mockResolvedValue(resourceFixture);

    const response = await request(app)
      .post('/api/resources')
      .send({ name: 'Room A', type: ResourceType.ROOM })
      .expect(201);

    expect(response.body.data.name).toBe('Room A');
  });
});
