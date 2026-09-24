import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../app.js';
import { prisma } from '../lib/prisma.js';

describe('GET /api/resources/:id/availability', () => {
  const app = createApp();
  let resourceId = '';
  let reservationId = '';

  beforeAll(async () => {
    const resource = await prisma.resource.findFirst({ where: { isActive: true } });
    if (!resource) {
      throw new Error('No active resource for availability route test');
    }
    resourceId = resource.id;

    const user = await prisma.user.findFirst({ where: { role: 'USER' } });
    if (!user) {
      throw new Error('No user for availability route test');
    }

    const start = new Date('2030-07-01T10:00:00.000Z');
    const end = new Date('2030-07-01T11:00:00.000Z');
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        resourceId,
        startTime: start,
        endTime: end,
        status: 'CONFIRMED',
      },
    });
    reservationId = reservation.id;
  });

  afterAll(async () => {
    if (reservationId) {
      await prisma.reservation.delete({ where: { id: reservationId } }).catch(() => undefined);
    }
    await prisma.$disconnect();
  });

  it('returns available when excludeReservationId ignores the current booking', async () => {
    const response = await request(app)
      .get(`/api/resources/${resourceId}/availability`)
      .query({
        startTime: '2030-07-01T10:00:00.000Z',
        endTime: '2030-07-01T12:00:00.000Z',
        excludeReservationId: reservationId,
      })
      .expect(200);

    expect(response.body.data.available).toBe(true);
  });

  it('returns unavailable when the same window overlaps without excludeReservationId', async () => {
    const response = await request(app)
      .get(`/api/resources/${resourceId}/availability`)
      .query({
        startTime: '2030-07-01T10:00:00.000Z',
        endTime: '2030-07-01T12:00:00.000Z',
      })
      .expect(200);

    expect(response.body.data.available).toBe(false);
  });
});
