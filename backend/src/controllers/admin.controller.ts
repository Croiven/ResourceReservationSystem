import type { Response } from 'express';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import { reservationService } from '../services/reservation.service.js';
import { getValidated } from '../validation/validate.middleware.js';
import type { AdminListReservationsQuery } from '../validation/reservation.validation.js';

export class AdminController {
  listReservations = asyncHandler(async (req, res: Response) => {
    const query = getValidated<AdminListReservationsQuery>(req, 'query');
    const reservations = await reservationService.listAllReservations(query);
    res.status(200).json({ data: reservations });
  });
}

export const adminController = new AdminController();
