import type { ResourceType } from './resource';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Reservation {
  id: string;
  userId: string;
  resourceId: string;
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  resource: {
    id: string;
    name: string;
    type: ResourceType;
  };
}

export interface CreateReservationInput {
  resourceId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface UpdateReservationInput {
  startTime?: string;
  endTime?: string;
  notes?: string | null;
}

export interface ListReservationsQuery {
  resourceId?: string;
  status?: ReservationStatus;
}

export interface ResourceBooking {
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED';
}

export interface AvailabilityResult {
  available: boolean;
}
