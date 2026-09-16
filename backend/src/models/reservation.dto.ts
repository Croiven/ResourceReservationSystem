import type { ReservationWithRelations } from '../repositories/reservation.repository.js';

export interface ReservationResponse {
  id: string;
  userId: string;
  resourceId: string;
  startTime: Date;
  endTime: Date;
  status: ReservationWithRelations['status'];
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  resource: {
    id: string;
    name: string;
    type: ReservationWithRelations['resource']['type'];
  };
}

export function toReservationResponse(reservation: ReservationWithRelations): ReservationResponse {
  return {
    id: reservation.id,
    userId: reservation.userId,
    resourceId: reservation.resourceId,
    startTime: reservation.startTime,
    endTime: reservation.endTime,
    status: reservation.status,
    notes: reservation.notes,
    createdAt: reservation.createdAt,
    updatedAt: reservation.updatedAt,
    user: reservation.user,
    resource: reservation.resource,
  };
}
