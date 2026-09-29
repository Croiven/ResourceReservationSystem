import { UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

vi.mock('../services/user.service.js', () => ({
  userService: {
    listUsers: vi.fn(),
    getUser: vi.fn(),
    updateUser: vi.fn(),
    deactivateUser: vi.fn(),
  },
}));

vi.mock('../middleware/auth.middleware.js', () => ({
  authenticate: (req: { user?: unknown }, _res: unknown, next: () => void) => {
    req.user = { id: 'admin-1', email: 'admin@example.com', role: UserRole.ADMIN };
    next();
  },
}));

import { userService } from '../services/user.service.js';

const userFixture = {
  id: 'user-1',
  email: 'user@example.com',
  firstName: 'Regular',
  lastName: 'User',
  role: UserRole.USER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('User routes', () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/users lists users for admins', async () => {
    vi.mocked(userService.listUsers).mockResolvedValue([userFixture]);

    const response = await request(app).get('/api/users').expect(200);

    expect(response.body.data).toHaveLength(1);
  });

  it('PATCH /api/users/:id updates a user', async () => {
    vi.mocked(userService.updateUser).mockResolvedValue({
      ...userFixture,
      firstName: 'Updated',
    });

    const response = await request(app)
      .patch('/api/users/user-1')
      .send({ firstName: 'Updated' })
      .expect(200);

    expect(response.body.data.firstName).toBe('Updated');
  });

  it('DELETE /api/users/:id deactivates a user', async () => {
    vi.mocked(userService.deactivateUser).mockResolvedValue({
      ...userFixture,
      isActive: false,
    });

    const response = await request(app).delete('/api/users/user-1').expect(200);

    expect(response.body.data.isActive).toBe(false);
  });
});
