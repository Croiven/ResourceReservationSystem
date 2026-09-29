import { ReservationStatus, ResourceType, UserRole } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

vi.mock('../services/reservation.service.js', () => ({
  reservationService: {
    listReservations: vi.fn(),
    getReservation: vi.fn(),
    createReservation: vi.fn(),
    updateReservation: vi.fn(),
    cancelReservation: vi.fn(),
  },
}));

vi.mock('../middleware/auth.middleware.js', () => ({
  authenticate: (req: { user?: unknown }, _res: unknown, next: () => void) => {
    req.user = { id: 'user-1', email: 'user@example.com', role: UserRole.USER };
    next();
  },
}));

import { reservationService } from '../services/reservation.service.js';

const reservationFixture = {
  id: 'res-1',
  userId: 'user-1',
  resourceId: 'resource-1',
  startTime: '2030-01-01T10:00:00.000Z',
  endTime: '2030-01-01T11:00:00.000Z',
  status: ReservationStatus.CONFIRMED,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  resource: {
    id: 'resource-1',
    name: 'Room A',
    description: null,
    type: ResourceType.ROOM,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  user: {
    id: 'user-1',
    email: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    role: UserRole.USER,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

describe('Reservation routes', () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/reservations lists reservations', async () => {
    vi.mocked(reservationService.listReservations).mockResolvedValue([reservationFixture]);

    const response = await request(app).get('/api/reservations').expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(reservationService.listReservations).toHaveBeenCalled();
  });

  it('GET /api/reservations/:id returns one reservation', async () => {
    vi.mocked(reservationService.getReservation).mockResolvedValue(reservationFixture);

    const response = await request(app).get('/api/reservations/res-1').expect(200);

    expect(response.body.data.id).toBe('res-1');
  });

  it('POST /api/reservations creates a reservation', async () => {
    vi.mocked(reservationService.createReservation).mockResolvedValue(reservationFixture);

    const response = await request(app)
      .post('/api/reservations')
      .send({
        resourceId: 'resource-1',
        startTime: '2030-01-01T10:00:00.000Z',
        endTime: '2030-01-01T11:00:00.000Z',
      })
      .expect(201);

    expect(response.body.data.id).toBe('res-1');
  });

  it('PATCH /api/reservations/:id updates a reservation', async () => {
    vi.mocked(reservationService.updateReservation).mockResolvedValue({
      ...reservationFixture,
      notes: 'Updated',
    });

    const response = await request(app)
      .patch('/api/reservations/res-1')
      .send({ notes: 'Updated' })
      .expect(200);

    expect(response.body.data.notes).toBe('Updated');
  });

  it('DELETE /api/reservations/:id cancels a reservation', async () => {
    vi.mocked(reservationService.cancelReservation).mockResolvedValue({
      ...reservationFixture,
      status: ReservationStatus.CANCELLED,
    });

    const response = await request(app).delete('/api/reservations/res-1').expect(200);

    expect(response.body.data.status).toBe(ReservationStatus.CANCELLED);
  });
});
