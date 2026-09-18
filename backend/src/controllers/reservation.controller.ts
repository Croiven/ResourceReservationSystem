import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/async-handler.middleware.js';
import type { AuthenticatedRequest } from '../models/auth.model.js';
import { reservationService } from '../services/reservation.service.js';
import { getValidated } from '../validation/validate.middleware.js';
import type {
  CreateReservationInput,
  ListReservationsQuery,
  UpdateReservationInput,
} from '../validation/reservation.validation.js';

export class ReservationController {
  list = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const query = getValidated<ListReservationsQuery>(req, 'query');
    const reservations = await reservationService.listReservations(
      query,
      authReq.user.id,
      authReq.user.role,
    );
    res.status(200).json({ data: reservations });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { id } = getValidated<{ id: string }>(req, 'params');
    const reservation = await reservationService.getReservation(
      id,
      authReq.user.id,
      authReq.user.role,
    );
    res.status(200).json({ data: reservation });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const data = getValidated<CreateReservationInput>(req, 'body');
    const reservation = await reservationService.createReservation(data, authReq.user.id);
    res.status(201).json({ data: reservation });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const data = getValidated<UpdateReservationInput>(req, 'body');
    const { id } = getValidated<{ id: string }>(req, 'params');
    const reservation = await reservationService.updateReservation(
      id,
      data,
      authReq.user.id,
      authReq.user.role,
    );
    res.status(200).json({ data: reservation });
  });

  cancel = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const { id } = getValidated<{ id: string }>(req, 'params');
    const reservation = await reservationService.cancelReservation(
      id,
      authReq.user.id,
      authReq.user.role,
    );
    res.status(200).json({ data: reservation });
  });
}

export const reservationController = new ReservationController();
